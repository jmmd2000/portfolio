<script lang="ts">
  import type { Snippet } from "svelte";
  import { resolve } from "$app/paths";
  import Button from "$lib/components/form/Button.svelte";
  import ThemeToggle from "$lib/components/theme/ThemeToggle.svelte";
  import { siteName } from "$lib/site";

  interface Props {
    currentPath: string;
    /** Signed out, on the log in page, the bar shows only the name and the theme toggle */
    signedIn: boolean;
    children: Snippet;
  }

  let { currentPath, signedIn, children }: Props = $props();

  const sectionLinks = [
    { label: "Overview", path: "/admin" },
    { label: "Profile", path: "/admin/profile" },
    { label: "Socials", path: "/admin/socials" },
    { label: "CV", path: "/admin/cv" },
    { label: "Projects", path: "/admin/projects" },
    { label: "Articles", path: "/admin/articles" },
    { label: "Currently", path: "/admin/currently" },
  ] as const;

  // Overview only matches itself, since every admin page's path starts with /admin
  function ariaCurrent(path: string): "page" | undefined {
    const isCurrent = path === "/admin" ? currentPath === path : currentPath === path || currentPath.startsWith(`${path}/`);
    return isCurrent ? "page" : undefined;
  }
</script>

<div class="admin">
  <a class="skip-link label" href="#main">Skip to content</a>
  <header class="bar">
    <a class="home label" href={signedIn ? resolve("/admin") : resolve("/")}>{siteName} <span>Admin</span></a>
    <div class="tools">
      <ThemeToggle />
      {#if signedIn}
        <a href={resolve("/")}>View the site</a>
        <form method="POST" action="/admin/logout">
          <Button type="submit" small>Log out</Button>
        </form>
      {/if}
    </div>
  </header>
  {#if signedIn}
    <div class="shell">
      <nav class="label" aria-label="Admin">
        <ul>
          {#each sectionLinks as link (link.path)}
            <li><a href={resolve(link.path)} aria-current={ariaCurrent(link.path)}>{link.label}</a></li>
          {/each}
        </ul>
        <ul class="account">
          <li><a href={resolve("/admin/password")} aria-current={ariaCurrent("/admin/password")}>Password</a></li>
        </ul>
      </nav>
      <main id="main">
        {@render children()}
      </main>
    </div>
  {:else}
    <main id="main" class="signed-out">
      {@render children()}
    </main>
  {/if}
</div>

<style>
  .admin {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }

  .bar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--page-gutter);
    border-bottom: var(--rule-section);
  }

  .home {
    text-decoration: none;

    span {
      color: var(--red);
    }
  }

  .tools {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-3);
    font-weight: 700;
  }

  .shell {
    display: grid;
    flex: 1;
    grid-template-columns: 15rem minmax(0, 1fr);
  }

  nav {
    padding: var(--space-3) var(--page-gutter);
    border-right: var(--rule-row);

    ul {
      display: grid;
      gap: var(--space-1);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    a {
      display: block;
      padding-block: 0.25rem;
      text-decoration-color: transparent;
      transition: text-decoration-color var(--duration-quick) var(--ease-out);

      &[aria-current="page"] {
        text-decoration-color: var(--red);
        text-decoration-thickness: 6px;
      }
    }
  }

  .account {
    margin-top: var(--space-3);
    padding-top: var(--space-3);
    border-top: var(--rule-row);
  }

  main {
    min-width: 0;
    padding: var(--space-3) var(--page-gutter) var(--space-5);
  }

  .signed-out {
    flex: 1;
  }

  .skip-link {
    position: absolute;
    inset-inline-start: var(--space-2);
    inset-block-start: var(--space-2);
    z-index: 20;
    padding: var(--space-1) var(--space-2);
    background: var(--ink);
    color: var(--paper);
    text-decoration: none;
    transform: translateY(-200%);

    &:focus-visible {
      transform: none;
    }
  }

  @media (hover: hover) {
    nav a:hover {
      text-decoration-color: var(--red);
    }
  }

  @media (max-width: 54rem) {
    .shell {
      grid-template-columns: minmax(0, 1fr);
      align-content: start;
    }

    nav {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-1) var(--space-2);
      padding-block: var(--space-2);
      border-right: 0;
      border-bottom: var(--rule-row);

      ul {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-1) var(--space-2);
      }
    }

    .account {
      margin-top: 0;
      padding-top: 0;
      border-top: 0;
    }
  }
</style>
