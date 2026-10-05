<script lang="ts">
  import { resolve } from "$app/paths";
  import AdminPage from "$lib/components/admin/AdminPage.svelte";
  import Fold from "$lib/components/admin/Fold.svelte";
  import ItemButtons from "$lib/components/admin/ItemButtons.svelte";
  import ItemForm from "$lib/components/admin/ItemForm.svelte";
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
        <Fold name="{row.label}: {row.title}" open={result !== undefined}>
          <ItemForm action="?/update" legend="{row.label}: {row.title}" id={row.id} message={result?.message} hideLegend>
            <CurrentlyFields values={result?.values ?? rowValues(row)} errors={result?.errors} />

            {#snippet actions()}
              <Button type="submit" variant="primary">Save</Button>
            {/snippet}
          </ItemForm>

          {#snippet buttons()}
            <ItemButtons id={row.id} name={row.title} deleteAction="?/delete" moveAction="?/move" first={index === 0} last={index === data.rows.length - 1} />
          {/snippet}
        </Fold>
      </li>
    {/each}
  </ol>

  <Fold name="Add a row" open={addResult !== undefined}>
    <ItemForm action="?/add" legend="Add a row" resetOnSuccess message={addResult?.message} hideLegend>
      <!-- A new row is shown unless its box is unticked -->
      <CurrentlyFields values={addResult?.values ?? { shown: "on" }} errors={addResult?.errors} />

      {#snippet actions()}
        <Button type="submit" variant="primary">Add</Button>
      {/snippet}
    </ItemForm>
  </Fold>

  <a href={resolve("/admin")}>Back to the admin</a>
</AdminPage>

<style>
  .rows {
    width: 100%;
    max-width: 48rem;
    border-top: var(--border-thick) solid var(--colour-foreground);
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>
