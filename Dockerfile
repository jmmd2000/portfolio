# syntax=docker/dockerfile:1.10

FROM node:26.10.0-slim AS base
# Node 25+ no longer ships corepack, so install it before enabling it.
RUN npm install -g corepack@0.36.0 \
 && corepack enable
WORKDIR /app

# Build: install everything, build the site, then drop the dev dependencies
FROM base AS build
# The slim image has no CA certificates, and the source map upload needs them to trust GlitchTip.
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
# SvelteKit loads the server modules during the build, and env.ts checks the env when it loads.
# Nothing connects to these during the build. Compose passes the real values in at runtime.
ENV DATABASE_URL="postgres://build@127.0.0.1:5432/build" \
    DATABASE_URL_MIGRATE="postgres://build@127.0.0.1:5432/build" \
    BETTER_AUTH_SECRET="build-time-placeholder-not-a-real-secret" \
    BETTER_AUTH_URL="http://localhost" \
    R2_ENDPOINT="http://localhost" \
    R2_ACCESS_KEY_ID="build" \
    R2_SECRET_ACCESS_KEY="build" \
    R2_BUCKET="build" \
    ASSETS_URL="http://localhost" \
    SPOTIFY_CLIENT_ID="build" \
    SPOTIFY_CLIENT_SECRET="build" \
    SPOTIFY_REFRESH_TOKEN="build"
ARG GIT_SHA=dev
ARG BUILT_AT=""
ENV GIT_SHA=${GIT_SHA}
ENV BUILT_AT=${BUILT_AT}
RUN pnpm build

# Source maps. The inject step stamps a debug ID into each bundle, and GlitchTip matches it to the uploaded map.
# The upload needs the token, so a build without it skips the upload. A failed upload warns and the build goes on.
# The step prints GIT_SHA and BUILT_AT so Docker runs it again for every build, and a failed upload is never cached.
# The adapter bundles the server files again and its maps point to the first build's files, so the chain step joins them to the originals.
# The maps are deleted afterwards, so the image never serves them.
# The inject step changes the scripts, so the compressed copies the adapter made are made again.
# Do not set SENTRY_LOG_LEVEL=debug here, because it can print the token.
ENV SENTRY_URL=https://glitchtip.vps.jamesmddoyle.com SENTRY_ORG=james-org SENTRY_PROJECT=portfolio
RUN --mount=type=secret,id=glitchtip_token,env=SENTRY_AUTH_TOKEN \
    echo "Source maps for $GIT_SHA built at $BUILT_AT" \
 && node scripts/chainSourceMaps.mjs build/server \
 && pnpm exec sentry-cli sourcemaps inject build \
 && if [ -n "$SENTRY_AUTH_TOKEN" ]; then \
      pnpm exec sentry-cli sourcemaps upload --release "$GIT_SHA" build \
        || echo "WARNING: source map upload failed"; \
    else echo "No GlitchTip token, so the source maps are not uploaded"; fi \
 && find build -name "*.map" -delete \
 && node scripts/compressBuild.mjs build/client

# --ignore-scripts skips the prepare hook (svelte-kit sync && husky), which needs the dev tools this removes
RUN pnpm prune --prod --ignore-scripts

# Runtime: only what's needed to serve the site and run migrations
FROM base AS runtime
RUN apt-get update \
 && apt-get install -y --no-install-recommends dumb-init \
 && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV PORT=3000
# adapter-node refuses bodies over 512 KB by default. A 10 MB image upload needs more
ENV BODY_SIZE_LIMIT=11M

COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/scripts/migrate.mjs ./scripts/migrate.mjs
COPY --from=build /app/package.json ./package.json

USER node
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "build/index.js"]
