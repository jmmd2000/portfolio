/** The build the site was made from */
export interface BuildInfo {
  /** From package.json */
  version: string;
  /** The short commit hash, or "dev" outside a Docker build */
  gitSHA: string;
  /** When the image was built, in UTC, or an empty string outside a Docker build */
  builtAt: string;
}

export const buildInfo: BuildInfo = {
  version: __APP_VERSION__,
  gitSHA: __GIT_SHA__,
  builtAt: __BUILT_AT__,
};

const builtAtFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Dublin" });

/** The build time in Irish time. A time that can't be read comes back as it was */
export function formatBuiltAt(builtAt: string): string {
  const date = new Date(builtAt);
  if (Number.isNaN(date.getTime())) return builtAt;
  return builtAtFormat.format(date);
}
