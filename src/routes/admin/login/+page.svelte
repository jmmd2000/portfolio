<script lang="ts">
  import PageHead from "$lib/components/head/PageHead.svelte";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();
</script>

<PageHead title="Log in" description="Log in to the site's admin." noindex />

<section>
  <h1>Log in</h1>

  <form method="POST">
    <label>
      Email
      <input type="email" name="email" autocomplete="username" value={form?.email ?? ""} required />
    </label>
    <label>
      Password
      <input type="password" name="password" autocomplete="current-password" required />
    </label>

    {#if form?.message}
      <p class="message" role="alert">{form.message}</p>
    {/if}

    <button type="submit">Log in</button>
  </form>
</section>

<style>
  section {
    padding-top: var(--space-5);
  }

  h1 {
    margin-bottom: var(--space-5);
    font-size: var(--font-size-page-title);
    font-weight: 800;
    font-stretch: 90%;
  }

  form {
    display: grid;
    gap: var(--space-4);
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
