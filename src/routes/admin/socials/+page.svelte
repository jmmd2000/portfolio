<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import Button from "$lib/components/form/Button.svelte";
  import Field from "$lib/components/form/Field.svelte";
  import FormMessage from "$lib/components/form/FormMessage.svelte";
  import { keepValues } from "$lib/components/form/keepValues";
  import PageHead from "$lib/components/head/PageHead.svelte";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();
</script>

<PageHead title="Socials" description="Edit the socials links." noindex />

<section>
  <h1>Socials</h1>

  {#if form?.message}
    <FormMessage status="success">{form.message}</FormMessage>
  {/if}

  <ol class="socials">
    {#each data.socials as social, index (social.id)}
      <!-- After a failed save, only that link's form shows what was typed and what's wrong -->
      {@const failed = form?.id === social.id ? form : undefined}
      <li>
        <form method="POST" action="?/update" use:enhance={keepValues}>
          <fieldset>
            <legend>{social.name}</legend>
            <input type="hidden" name="id" value={social.id} />
            <div class="fields">
              <Field label="Name" name="name" value={failed?.values?.name ?? social.name} error={failed?.errors?.name?.[0]} />
              <Field label="Address" name="url" value={failed?.values?.url ?? social.url} error={failed?.errors?.url?.[0]} />
            </div>
            <div class="actions">
              <Button type="submit" variant="primary">Save</Button>
              <Button type="submit" formaction="?/move" name="direction" value="up" disabled={index === 0}>Move up</Button>
              <Button type="submit" formaction="?/move" name="direction" value="down" disabled={index === data.socials.length - 1}>Move down</Button>
              <Button commandfor="delete-{social.id}" command="show-modal" variant="destructive">Delete</Button>
              <dialog id="delete-{social.id}" aria-labelledby="delete-{social.id}-title">
                <h2 id="delete-{social.id}-title">Delete {social.name}?</h2>
                <p>This can't be undone.</p>
                <div class="dialog-actions">
                  <Button commandfor="delete-{social.id}" command="close" autofocus>Keep</Button>
                  <Button type="submit" formaction="?/delete" variant="destructive">Delete {social.name}</Button>
                </div>
              </dialog>
            </div>
          </fieldset>
        </form>
      </li>
    {/each}
  </ol>

  <form method="POST" action="?/add" use:enhance>
    <fieldset>
      <legend>Add a link</legend>
      <div class="fields">
        <Field label="Name" name="name" value={form?.id === "new" ? form.values?.name : ""} error={form?.id === "new" ? form.errors?.name?.[0] : undefined} />
        <Field label="Address" name="url" placeholder="https:// or mailto:" value={form?.id === "new" ? form.values?.url : ""} error={form?.id === "new" ? form.errors?.url?.[0] : undefined} />
      </div>
      <div class="actions">
        <Button type="submit" variant="primary">Add</Button>
      </div>
    </fieldset>
  </form>

  <a href={resolve("/admin")}>Back to the admin</a>
</section>

<style>
  section {
    display: grid;
    gap: var(--space-5);
    justify-items: start;
    padding-top: var(--space-5);
  }

  h1 {
    font-size: var(--font-size-page-title);
    font-weight: 800;
    font-stretch: 90%;
  }

  .socials {
    display: grid;
    gap: var(--space-5);
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  form {
    width: 100%;
    max-width: 48rem;
  }

  fieldset {
    display: grid;
    gap: var(--space-3);
    margin: 0;
    padding: 0;
    border: none;
  }

  legend {
    margin-bottom: var(--space-3);
    color: var(--colour-foreground);
    font-family: var(--font-display);
    font-size: var(--font-size-5);
    font-weight: 700;
  }

  .fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
    align-items: start;
    gap: var(--space-3);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  dialog {
    width: min(26rem, calc(100% - 2 * var(--page-gutter)));
    padding: var(--space-5);
    border: var(--border-thick) solid var(--colour-foreground);
    background: var(--colour-background);
    color: var(--colour-foreground);

    &::backdrop {
      background: oklch(0.2 0.02 60 / 45%);
      backdrop-filter: blur(3px);
    }

    h2 {
      font-size: var(--font-size-heading);
    }

    p {
      margin-block: var(--space-2) var(--space-4);
      color: var(--colour-text);
    }
  }

  .dialog-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--space-2);
  }
</style>
