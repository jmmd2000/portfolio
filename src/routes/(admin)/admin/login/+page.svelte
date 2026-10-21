<script lang="ts">
  import Button from "$lib/components/form/Button.svelte";
  import Field from "$lib/components/form/Field.svelte";
  import FormMessage from "$lib/components/form/FormMessage.svelte";
  import AdminPage from "$lib/components/admin/AdminPage.svelte";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();
</script>

<AdminPage title="Log in" description="Log in to the site's admin.">
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
</AdminPage>

<style>
  form {
    display: grid;
    gap: var(--space-2);
    width: 100%;
    max-width: 26rem;
  }

  .actions {
    margin-top: var(--space-1);
  }
</style>
