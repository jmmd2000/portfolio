<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import AdminPage from "$lib/components/admin/AdminPage.svelte";
  import Button from "$lib/components/form/Button.svelte";
  import Field from "$lib/components/form/Field.svelte";
  import FormMessage from "$lib/components/form/FormMessage.svelte";
  import { keepValues } from "$lib/components/form/keepValues";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();

  // After a failed save, the form shows what was typed. Otherwise it shows what's saved
  const values = $derived(form?.values ?? data.profile);
</script>

<AdminPage title="Profile" description="Edit the profile.">
  <form method="POST" use:enhance={keepValues}>
    <Field label="Name" name="name" value={values.name} error={form?.errors?.name?.[0]} />
    <Field label="Role" name="role" value={values.role} error={form?.errors?.role?.[0]} />
    <Field label="Location" name="location" value={values.location} error={form?.errors?.location?.[0]} />
    <Field label="Bio" name="bio" multiline value={values.bio} error={form?.errors?.bio?.[0]} />

    {#if form?.saved}
      <FormMessage status="success">Profile saved.</FormMessage>
    {/if}

    <div class="actions">
      <Button type="submit" variant="primary">Save</Button>
    </div>
  </form>

  <a href={resolve("/admin")}>Back to the admin</a>
</AdminPage>

<style>
  form {
    display: grid;
    gap: var(--space-4);
    width: 100%;
    max-width: 40rem;
  }

  .actions {
    margin-top: var(--space-1);
  }
</style>
