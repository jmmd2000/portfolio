<script lang="ts">
  import Button from "$lib/components/form/Button.svelte";
  import Field from "$lib/components/form/Field.svelte";
  import FormMessage from "$lib/components/form/FormMessage.svelte";
  import PageHead from "$lib/components/head/PageHead.svelte";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();
</script>

<PageHead title="Log in" description="Log in to the site's admin." noindex />

<section>
  <h1>Log in</h1>

  <form method="POST">
    <Field label="Email" type="email" name="email" autocomplete="username" value={form?.email ?? ""} required />
    <Field label="Password" type="password" name="password" autocomplete="current-password" required />

    {#if form?.message}
      <FormMessage status="error">{form.message}</FormMessage>
    {/if}

    <div class="actions">
      <Button type="submit" variant="primary">Log in</Button>
    </div>
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
    max-width: 26rem;
  }

  .actions {
    margin-top: var(--space-1);
  }
</style>
