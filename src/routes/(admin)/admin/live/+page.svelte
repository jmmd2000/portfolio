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
</style>
