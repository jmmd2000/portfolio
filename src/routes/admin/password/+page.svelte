<script lang="ts">
  import { resolve } from "$app/paths";
  import PageHead from "$lib/components/head/PageHead.svelte";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();
</script>

<PageHead title="Change password" description="Change the admin password." noindex />

<section>
  <h1>Change password</h1>

  <form method="POST">
    <label>
      Current password
      <input type="password" name="currentPassword" autocomplete="current-password" required />
    </label>
    <label>
      New password
      <input type="password" name="newPassword" autocomplete="new-password" minlength="8" maxlength="128" required />
    </label>
    <label>
      New password again
      <input type="password" name="confirmation" autocomplete="new-password" required />
    </label>

    {#if form?.message}
      <p class="message" role={form.changed ? "status" : "alert"}>{form.message}</p>
    {/if}

    <button type="submit">Change password</button>
  </form>

  <a href={resolve("/admin")}>Back to the admin</a>
</section>

<style>
  section {
    display: grid;
    gap: var(--space-5);
    justify-items: start;
    padding-top: var(--space-5);
  }

  h1 {
    font-size: var(--font-size-page-title);
    font-weight: 800;
    font-stretch: 90%;
  }

  form {
    display: grid;
    gap: var(--space-4);
    width: 100%;
    max-width: 24rem;
  }

  label {
    display: grid;
    gap: var(--space-1);
    color: var(--colour-foreground);
    font-size: var(--font-size-2);
    font-weight: 600;
  }

  input {
    padding: var(--space-2);
    border: var(--border-thick) solid var(--colour-foreground);
    border-radius: 0;
    background: var(--colour-background);
    color: var(--colour-foreground);
    font: inherit;
    font-size: var(--font-size-3);
    font-weight: 400;
  }

  .message {
    color: var(--colour-foreground);
    font-weight: 600;
  }

  button {
    justify-self: start;
    padding: var(--space-1) var(--space-3);
    border: var(--border-thick) solid var(--colour-foreground);
    border-radius: 0;
    background: var(--colour-foreground);
    color: var(--colour-background);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }
</style>
