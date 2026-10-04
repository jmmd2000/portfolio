<script lang="ts">
  import { resolve } from "$app/paths";
  import AdminPage from "$lib/components/admin/AdminPage.svelte";
  import ConfirmDelete from "$lib/components/admin/ConfirmDelete.svelte";
  import ItemForm from "$lib/components/admin/ItemForm.svelte";
  import MoveButtons from "$lib/components/admin/MoveButtons.svelte";
  import Button from "$lib/components/form/Button.svelte";
  import Field from "$lib/components/form/Field.svelte";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();
</script>

<AdminPage title="Socials" description="Edit the socials links.">
  <ol class="socials">
    {#each data.socials as social, index (social.id)}
      <!-- Only the form that was submitted shows its result: the saved message, or what was typed and what's wrong -->
      {@const result = form?.id === social.id ? form : undefined}
      <li>
        <ItemForm action="?/update" legend={social.name} id={social.id} message={result?.message}>
          <Field label="Name" name="name" value={result?.values?.name ?? social.name} error={result?.errors?.name?.[0]} />
          <Field label="Address" name="url" value={result?.values?.url ?? social.url} error={result?.errors?.url?.[0]} />

          {#snippet actions()}
            <Button type="submit" variant="primary">Save</Button>
            <MoveButtons formaction="?/move" first={index === 0} last={index === data.socials.length - 1} />
            <ConfirmDelete name={social.name} formaction="?/delete" />
          {/snippet}
        </ItemForm>
      </li>
    {/each}
  </ol>

  <ItemForm action="?/add" legend="Add a link" resetOnSuccess message={form?.id === "new" ? form.message : undefined}>
    <Field label="Name" name="name" value={form?.id === "new" ? form.values?.name : ""} error={form?.id === "new" ? form.errors?.name?.[0] : undefined} />
    <Field label="Address" name="url" placeholder="https:// or mailto:" value={form?.id === "new" ? form.values?.url : ""} error={form?.id === "new" ? form.errors?.url?.[0] : undefined} />

    {#snippet actions()}
      <Button type="submit" variant="primary">Add</Button>
    {/snippet}
  </ItemForm>

  <a href={resolve("/admin")}>Back to the admin</a>
</AdminPage>

<style>
  .socials {
    display: grid;
    gap: var(--space-5);
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>
