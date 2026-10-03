<script lang="ts">
  import { resolve } from "$app/paths";
  import AdminPage from "$lib/components/admin/AdminPage.svelte";
  import Button from "$lib/components/form/Button.svelte";
  import Field from "$lib/components/form/Field.svelte";
  import FormMessage from "$lib/components/form/FormMessage.svelte";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();
</script>

<AdminPage title="Change password" description="Change the admin password.">
  <form method="POST">
    <Field label="Current password" type="password" name="currentPassword" autocomplete="current-password" required />
    <Field label="New password" type="password" name="newPassword" autocomplete="new-password" minlength={8} maxlength={128} required />
    <Field label="New password again" type="password" name="confirmation" autocomplete="new-password" required />

    {#if form?.message}
      <FormMessage status={form.changed ? "success" : "error"}>{form.message}</FormMessage>
    {/if}

    <div class="actions">
      <Button type="submit" variant="primary">Change password</Button>
    </div>
  </form>

  <a href={resolve("/admin")}>Back to the admin</a>
</AdminPage>

<style>
  form {
    display: grid;
    gap: var(--space-4);
    width: 100%;
    max-width: 26rem;
  }

  .actions {
    margin-top: var(--space-1);
  }
</style>
