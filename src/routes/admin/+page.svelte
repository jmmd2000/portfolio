<script lang="ts">
  import { resolve } from "$app/paths";
  import Button from "$lib/components/form/Button.svelte";
  import PageHead from "$lib/components/head/PageHead.svelte";
</script>

<PageHead title="Admin" description="The site's admin." noindex />

<section>
  <h1>Admin</h1>

  <ul class="sections">
    <li><a href={resolve("/admin/profile")}>Profile</a></li>
    <li><a href={resolve("/admin/socials")}>Socials</a></li>
    <li><a href={resolve("/admin/cv")}>CV</a></li>
    <li><a href={resolve("/admin/projects")}>Projects</a></li>
    <li><a href={resolve("/admin/articles")}>Articles</a></li>
    <li><a href={resolve("/admin/currently")}>Currently</a></li>
  </ul>

  <div class="account">
    <a href={resolve("/admin/password")}>Change password</a>
    <form method="POST" action="/admin/logout">
      <Button type="submit">Log out</Button>
    </form>
  </div>
</section>

<style>
  section {
    display: grid;
    gap: var(--space-6);
    max-width: 30rem;
    padding-block: var(--space-7) 0;
  }

  h1 {
    font-size: var(--font-size-page-title);
    line-height: 1.05;
  }

  .sections {
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      border-bottom: 1px solid var(--colour-divider);
    }

    a {
      display: block;
      padding-block: var(--space-3);
      font-size: var(--font-size-title);
      font-weight: 600;
      text-decoration-color: transparent;
      transition: text-decoration-color var(--duration-quick) var(--ease-out);

      &:focus-visible {
        text-decoration-color: var(--colour-accent);
      }
    }
  }

  .account {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  @media (hover: hover) {
    .sections a:hover {
      text-decoration-color: var(--colour-accent);
    }
  }

  @media (max-width: 52rem) {
    section {
      padding-block-start: var(--space-6);
    }
  }
</style>
