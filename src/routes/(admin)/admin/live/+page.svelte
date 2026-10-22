<script lang="ts">
  import { enhance } from "$app/forms";
  import AdminPage from "$lib/components/admin/AdminPage.svelte";
  import Button from "$lib/components/form/Button.svelte";
  import Checkbox from "$lib/components/form/Checkbox.svelte";
  import FormMessage from "$lib/components/form/FormMessage.svelte";
  import { keepValues } from "$lib/components/form/keepValues";
  import { moodLine, statWord } from "$lib/plum/plumMood";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();

  const plumRows = $derived(
    data.plum
      ? [
          { name: "Food", value: data.plum.stats.food },
          { name: "Happiness", value: data.plum.stats.happiness },
          { name: "Energy", value: data.plum.stats.energy },
        ]
      : []
  );
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
      <Checkbox label="Show what's playing on Spotify" name="spotifyShown" checked={data.settings.spotifyShown} />
      <p class="hint">While a track plays, the Currently row labelled Listening shows it, then goes back to what's saved. While this is off, Spotify is never asked.</p>
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

  <section class="plum" aria-labelledby="plum-heading">
    <h2 class="label" id="plum-heading">Plum</h2>
    {#if data.plum}
      <p>{moodLine(data.plum)}.</p>
      <dl>
        {#each plumRows as row (row.name)}
          <div>
            <dt>{row.name}</dt>
            <dd>{row.value} out of 100, {statWord(row.value).toLowerCase()}</dd>
          </div>
        {/each}
      </dl>
    {:else}
      <p class="hint">Her stats couldn't be read.</p>
    {/if}
  </section>
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

  .hint {
    margin: 0;
    color: var(--muted);
  }

  .actions {
    margin-top: var(--space-1);
  }

  .plum {
    display: grid;
    gap: var(--space-1);
    width: 100%;
    max-width: 40rem;

    h2 {
      margin-bottom: var(--space-1);
      font-size: var(--type-label);
    }
  }

  dl {
    display: grid;
    gap: 0.25rem;
    margin: 0;

    > div {
      display: grid;
      grid-template-columns: 7rem minmax(0, 1fr);
    }
  }

  dt {
    font-weight: 700;
  }

  dd {
    margin: 0;
  }
</style>
