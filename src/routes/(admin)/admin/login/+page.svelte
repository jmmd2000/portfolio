<script lang="ts">
  import Button from "$lib/components/form/Button.svelte";
  import Field from "$lib/components/form/Field.svelte";
  import FormMessage from "$lib/components/form/FormMessage.svelte";
  import PageHead from "$lib/components/head/PageHead.svelte";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();
</script>

<PageHead title="Log in" description="Log in to the site's admin." noindex />

<div class="login">
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
</div>

<style>
  .login {
    display: grid;
    grid-template-columns: auto minmax(0, 24rem);
    justify-content: start;
    align-items: end;
    gap: var(--space-5);
    padding-top: var(--space-3);
  }

  h1 {
    color: var(--red);
    font-size: clamp(4.5rem, 12vw, 9rem);
    font-weight: 900;
    line-height: 0.8;
  }

  form {
    display: grid;
    gap: var(--space-2);
  }

  .actions {
    margin-top: var(--space-1);
  }

  @media (max-width: 54rem) {
    .login {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--space-4);
      padding-top: var(--space-1);
    }
  }
</style>
