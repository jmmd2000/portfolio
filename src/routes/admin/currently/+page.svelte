<script lang="ts">
  import { resolve } from "$app/paths";
  import AdminPage from "$lib/components/admin/AdminPage.svelte";
  import ConfirmDelete from "$lib/components/admin/ConfirmDelete.svelte";
  import ItemForm from "$lib/components/admin/ItemForm.svelte";
  import MoveButtons from "$lib/components/admin/MoveButtons.svelte";
  import Button from "$lib/components/form/Button.svelte";
  import type { CurrentlyRow } from "$lib/server/content/currently";
  import type { PageProps } from "./$types";
  import CurrentlyFields from "./CurrentlyFields.svelte";

  let { data, form }: PageProps = $props();

  const addResult = $derived(form?.id === "new" ? form : undefined);

  /** A saved row as the text its form shows */
  function rowValues(row: CurrentlyRow): Record<string, string> {
    return {
      label: row.label,
      title: row.title,
      subtitle: row.subtitle ?? "",
      url: row.url ?? "",
      imageURL: row.imageURL ?? "",
      shown: row.shown ? "on" : "",
    };
  }
</script>

<AdminPage title="Currently" description="Edit what's listed under Currently on the home page.">
  <ol class="rows">
    {#each data.rows as row, index (row.id)}
      {@const result = form?.id === row.id ? form : undefined}
      <li>
        <ItemForm action="?/update" legend="{row.label}: {row.title}" id={row.id} message={result?.message}>
          <CurrentlyFields values={result?.values ?? rowValues(row)} errors={result?.errors} />

          {#snippet actions()}
            <Button type="submit" variant="primary">Save</Button>
            <MoveButtons formaction="?/move" first={index === 0} last={index === data.rows.length - 1} />
            <ConfirmDelete name={row.title} formaction="?/delete" />
          {/snippet}
        </ItemForm>
      </li>
    {/each}
  </ol>

  <ItemForm action="?/add" legend="Add a row" resetOnSuccess message={addResult?.message}>
    <!-- A new row is shown unless its box is unticked -->
    <CurrentlyFields values={addResult?.values ?? { shown: "on" }} errors={addResult?.errors} />

    {#snippet actions()}
      <Button type="submit" variant="primary">Add</Button>
    {/snippet}
  </ItemForm>

  <a href={resolve("/admin")}>Back to the admin</a>
</AdminPage>

<style>
  .rows {
    display: grid;
    gap: var(--space-6);
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>
