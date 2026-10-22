<script lang="ts">
  import { enhance } from "$app/forms";
  import AdminPage from "$lib/components/admin/AdminPage.svelte";
  import Button from "$lib/components/form/Button.svelte";
  import Checkbox from "$lib/components/form/Checkbox.svelte";
  import FormMessage from "$lib/components/form/FormMessage.svelte";
  import { keepValues } from "$lib/components/form/keepValues";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();
</script>

<AdminPage title="Live parts" description="Settings for the parts of the site that change on their own.">
  <form method="POST" use:enhance={keepValues}>
    <fieldset>
      <legend class="label">Visitor count</legend>
      <Checkbox label="Show the visitor count in the footer" name="visitorCountShown" checked={data.settings.visitorCountShown} />
      <p class="hint">Visitors are still counted while it's hidden.</p>
    </fieldset>

    <fieldset>
      <legend class="label">Spotify</legend>
      <label class="select-label" for="spotify-row">Row that shows what's playing</label>
      <select id="spotify-row" name="spotifyRowID">
        <option value="" selected={data.settings.spotifyRowID === null}>None</option>
        {#each data.currentlyRows as row (row.id)}
          <option value={String(row.id)} selected={row.id === data.settings.spotifyRowID}>{row.label}: {row.title}{row.shown ? "" : " (hidden)"}</option>
        {/each}
      </select>
      <p class="hint">While a track plays, this Currently row shows it, then goes back to what's saved. With None, Spotify is never asked.</p>
    </fieldset>

    {#if form?.saved}
      <FormMessage status="success">Live parts saved.</FormMessage>
    {:else if form?.message}
      <FormMessage status="error">{form.message}</FormMessage>
    {/if}

    <div class="actions">
      <Button type="submit" variant="primary">Save</Button>
    </div>
  </form>
</AdminPage>

<style>
  form {
    display: grid;
    gap: var(--space-2);
    width: 100%;
    max-width: 40rem;
  }

  fieldset {
    display: grid;
    gap: var(--space-1);
    min-width: 0;
    margin: 0;
    padding: 0;
    border: none;
  }

  legend {
    margin-bottom: var(--space-1);
    padding: 0;
  }

  .select-label {
    font-size: var(--type-small);
    font-weight: 700;
  }

  select {
    width: 100%;
    min-height: 2.75rem;
    padding: 0.625rem 0.75rem;
    border: var(--rule-row);
    border-radius: 0;
    background: var(--paper);
    color: var(--ink);
    font: inherit;
    font-size: 1rem;

    &:focus-visible {
      outline-offset: 0;
    }
  }

  .hint {
    margin: 0;
    color: var(--muted);
  }

  .actions {
    margin-top: var(--space-1);
  }
</style>
