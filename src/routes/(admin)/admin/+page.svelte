<script lang="ts">
  import { resolve } from "$app/paths";
  import AdminPage from "$lib/components/admin/AdminPage.svelte";
</script>

<AdminPage title="Admin" description="The site's admin.">
  <ul class="sections">
    <li><a href={resolve("/admin/profile")}>Profile</a></li>
    <li><a href={resolve("/admin/socials")}>Socials</a></li>
    <li><a href={resolve("/admin/cv")}>CV</a></li>
    <li><a href={resolve("/admin/projects")}>Projects</a></li>
    <li><a href={resolve("/admin/articles")}>Articles</a></li>
    <li><a href={resolve("/admin/currently")}>Currently</a></li>
  </ul>
</AdminPage>

<style>
  .sections {
    width: 100%;
    max-width: 30rem;
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      border-bottom: 1px solid var(--line);
    }

    a {
      display: block;
      padding-block: var(--space-2);
      font-size: 1.125rem;
      font-weight: 700;
      text-decoration-color: transparent;
      transition: text-decoration-color var(--duration-quick) var(--ease-out);

      &:focus-visible {
        text-decoration-color: var(--red);
      }
    }
  }

  @media (hover: hover) {
    .sections a:hover {
      text-decoration-color: var(--red);
    }
  }
</style>
