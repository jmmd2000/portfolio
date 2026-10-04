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
    gap: var(--space-5);
    max-width: 30rem;
    padding-top: var(--space-5);
  }

  h1 {
    font-size: var(--font-size-page-title);
    font-weight: 800;
    font-stretch: 90%;
  }

  .sections {
    margin: 0;
    padding: 0;
    border-top: var(--border-thick) solid var(--colour-foreground);
    list-style: none;

    li {
      border-bottom: var(--border-thin) solid var(--colour-divider);
    }

    a {
      display: block;
      padding: var(--space-3) 0;
      color: var(--colour-foreground);
      font-family: var(--font-display);
      font-size: var(--font-size-5);
      font-weight: 700;
      text-decoration: none;
      transition: translate var(--duration-quick) var(--ease-out);

      &:hover {
        translate: 4px 0;
        text-decoration: underline var(--border-thick) var(--colour-orange);
        text-underline-offset: 0.2em;
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
</style>
