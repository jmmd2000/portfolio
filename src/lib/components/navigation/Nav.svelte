<script lang="ts">
  import { resolve } from "$app/paths";
  import ThemeToggle from "$lib/components/theme/ThemeToggle.svelte";
  import { isCurrentPage } from "./navigation";

  interface Props {
    currentPath: string;
  }

  let { currentPath }: Props = $props();

  const links = [
    { label: "Home", path: "/" },
    { label: "CV", path: "/cv" },
  ] as const;
</script>

<nav>
  <a class="site-name" href={resolve("/")}>James Doyle</a>
  {#each links as link (link.path)}
    <a class="nav-link" href={resolve(link.path)} aria-current={isCurrentPage(link.path, currentPath) ? "page" : undefined}>{link.label}</a>
  {/each}
  <ThemeToggle />
</nav>

<style>
  nav {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-4);
    padding-top: var(--space-4);
  }

  .site-name {
    margin-right: auto;
    color: var(--colour-foreground);
    font-family: var(--font-display);
    font-size: var(--font-size-3);
    font-weight: 700;
    letter-spacing: -0.02em;
    text-decoration: none;
  }

  .nav-link {
    border-bottom: var(--border-thick) solid transparent;
    color: var(--colour-text-muted);
    font-size: var(--font-size-2);
    text-decoration: none;
    transition:
      color var(--duration-quick) var(--ease-out),
      border-color var(--duration-quick) var(--ease-out);

    &:hover {
      color: var(--colour-foreground);
    }

    &[aria-current="page"] {
      border-bottom-color: var(--colour-orange);
      color: var(--colour-foreground);
    }
  }

  @media print {
    nav {
      display: none;
    }
  }
</style>
