<script lang="ts">
  import { tick } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import { z } from "zod";
  import { invalidateAll } from "$app/navigation";
  import { showEditStatus } from "$lib/components/edit/editStatus.svelte";
  import { makeEditable, type CheckResult } from "$lib/components/edit/makeEditable";
  import { editFailureMessages, sendEdit, type EditResult } from "$lib/components/edit/sendEdit";
  import { socialSchema, type SocialField } from "$lib/schemas/socials";
  import type { Social } from "$lib/server/content/profile";

  interface Props {
    socials: Social[];
  }

  let { socials }: Props = $props();

  let confirmingDeleteID: number | null = $state(null);
  let adding = $state(false);
  let newName = $state("");
  let newURL = $state("");
  let addErrors: Partial<Record<SocialField, string[]>> = $state({});
  let addButton = $state<HTMLButtonElement>();

  function checkField(field: SocialField, text: string): CheckResult {
    const result = socialSchema.shape[field].safeParse(text);
    if (result.success) return { value: result.data };
    return { error: result.error.issues[0]?.message ?? "Invalid content." };
  }

  async function sendAndReload(url: string, method: "PATCH" | "POST" | "PUT" | "DELETE", body?: unknown): Promise<EditResult> {
    const outcome = await sendEdit(url, method, body);
    if (outcome === "saved") await invalidateAll();
    return outcome;
  }

  function socialIDOf(element: HTMLElement): number {
    return Number(element.dataset.socialId);
  }

  // defined once and reading the id from the element, so a data reload never resets text in the middle of being edited
  const editName: Attachment<HTMLElement> = element =>
    makeEditable(element, {
      label: "Link name",
      check: text => checkField("name", text),
      save: value => sendAndReload(`/api/admin/socials/${socialIDOf(element)}`, "PATCH", { name: value }),
    });

  const editURL: Attachment<HTMLElement> = element =>
    makeEditable(element, {
      label: "Link address",
      check: text => checkField("url", text),
      save: value => sendAndReload(`/api/admin/socials/${socialIDOf(element)}`, "PATCH", { url: value }),
    });

  const focusOnShow: Attachment<HTMLElement> = element => element.focus();

  /** Moves a link one place left or right */
  async function move(social: Social, offset: -1 | 1, button: HTMLButtonElement): Promise<void> {
    const otherIDs = socials.filter(other => other.id !== social.id).map(other => other.id);
    const newIndex = socials.indexOf(social) + offset;
    const order = [...otherIDs.slice(0, newIndex), social.id, ...otherIDs.slice(newIndex)];

    const outcome = await sendAndReload("/api/admin/socials/order", "PUT", { order });
    if (outcome !== "saved") {
      showEditStatus({ status: "error", message: `${social.name} wasn't moved. ${editFailureMessages[outcome]}` });
      return;
    }

    showEditStatus({ status: "success", message: `${social.name} moved.` });
    // Svelte moves the link's element, which takes focus off the button
    await tick();
    if (!button.disabled) button.focus();
  }

  async function deleteLink(social: Social): Promise<void> {
    const outcome = await sendAndReload(`/api/admin/socials/${social.id}`, "DELETE");
    confirmingDeleteID = null;
    if (outcome !== "saved") {
      showEditStatus({ status: "error", message: `${social.name} wasn't deleted. ${editFailureMessages[outcome]}` });
      return;
    }

    showEditStatus({ status: "success", message: `${social.name} deleted.` });
    addButton?.focus();
  }

  function stopAdding(): void {
    adding = false;
    newName = "";
    newURL = "";
    addErrors = {};
  }

  async function addLink(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    const result = socialSchema.safeParse({ name: newName, url: newURL });
    if (!result.success) {
      addErrors = z.flattenError(result.error).fieldErrors;
      return;
    }
    addErrors = {};

    const outcome = await sendAndReload("/api/admin/socials", "POST", result.data);
    if (outcome !== "saved") {
      showEditStatus({ status: "error", message: `${result.data.name} wasn't added. ${editFailureMessages[outcome]}` });
      return;
    }

    showEditStatus({ status: "success", message: `${result.data.name} added.` });
    stopAdding();
    // The add button only exists again after the form closes
    await tick();
    addButton?.focus();
  }
</script>

<ul class="socials">
  {#each socials as social, index (social.id)}
    <li class="social">
      {#if confirmingDeleteID === social.id}
        <span class="question">Delete {social.name}?</span>
        <button type="button" class="control" onclick={() => void deleteLink(social)}>Delete</button>
        <button type="button" class="control" onclick={() => (confirmingDeleteID = null)} {@attach focusOnShow}>Keep</button>
      {:else}
        <span class="link">
          <a href={social.url} rel="external" data-social-id={social.id} {@attach editName}>{social.name}</a>
          <span class="address" data-social-id={social.id} {@attach editURL}>{social.url}</span>
        </span>
        <span class="controls">
          <button type="button" class="control" aria-label="Move {social.name} left" disabled={index === 0} onclick={event => void move(social, -1, event.currentTarget)}>←</button>
          <button type="button" class="control" aria-label="Move {social.name} right" disabled={index === socials.length - 1} onclick={event => void move(social, 1, event.currentTarget)}>→</button>
          <button type="button" class="control" aria-label="Delete {social.name}" onclick={() => (confirmingDeleteID = social.id)}>×</button>
        </span>
      {/if}
    </li>
  {/each}

  <li class="add">
    {#if adding}
      <form onsubmit={event => void addLink(event)}>
        <input type="text" aria-label="New link name" placeholder="Name" bind:value={newName} aria-invalid={addErrors.name ? true : undefined} {@attach focusOnShow} />
        <input type="text" aria-label="New link address" placeholder="https:// or mailto:" bind:value={newURL} aria-invalid={addErrors.url ? true : undefined} />
        <button type="submit" class="control">Add</button>
        <button type="button" class="control" onclick={stopAdding}>Cancel</button>
        {#if addErrors.name || addErrors.url}
          <p class="error" role="alert">{addErrors.name?.[0] ?? addErrors.url?.[0]}</p>
        {/if}
      </form>
    {:else}
      <button type="button" class="control" bind:this={addButton} onclick={() => (adding = true)}>+ Add link</button>
    {/if}
  </li>
</ul>

<style>
  .socials {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: var(--space-3) var(--space-4);
    min-width: 0;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .social {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: var(--space-2);
    min-width: 0;
  }

  .link {
    display: grid;
    min-width: 0;
  }

  a {
    justify-self: start;
    color: var(--colour-teal);
    font-weight: 600;
    text-decoration: none;
  }

  .address {
    color: var(--colour-text-muted);
    font-family: var(--font-mono);
    font-size: var(--font-size-1);
    overflow-wrap: anywhere;
  }

  .controls {
    display: flex;
    gap: 0.25rem;
  }

  /* On a mouse the controls wait for hover or focus. On a touch screen they always show */
  @media (hover: hover) {
    .controls {
      opacity: 0;
      transition: opacity var(--duration-quick) var(--ease-out);
    }

    .social:hover .controls,
    .social:focus-within .controls {
      opacity: 1;
    }
  }

  .control {
    min-width: 1.5rem;
    height: 1.5rem;
    padding: 0 var(--space-1);
    border: var(--border-thick) solid var(--colour-foreground);
    border-radius: 0;
    background: var(--colour-background);
    color: var(--colour-foreground);
    font: inherit;
    font-size: var(--font-size-1);
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
    transition:
      background var(--duration-quick) var(--ease-out),
      color var(--duration-quick) var(--ease-out);

    &:hover:not(:disabled) {
      background: var(--colour-foreground);
      color: var(--colour-background);
    }

    &:disabled {
      border-style: dashed;
      opacity: 0.4;
      cursor: default;
    }
  }

  .question {
    color: var(--colour-foreground);
    font-weight: 600;
  }

  form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1);
  }

  input {
    width: 9rem;
    height: 1.5rem;
    padding: 0 var(--space-1);
    border: var(--border-thick) solid var(--colour-foreground);
    border-radius: 0;
    background: var(--colour-background);
    color: var(--colour-foreground);
    font: inherit;
    font-size: var(--font-size-1);
    caret-color: var(--colour-orange);

    &[aria-invalid="true"] {
      border-style: dashed;
    }
  }

  .error {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    flex-basis: 100%;
    color: var(--colour-foreground);
    font-size: var(--font-size-1);
    font-weight: 600;

    &::before {
      content: "";
      flex: none;
      width: 0.5rem;
      height: 0.5rem;
      background: var(--colour-orange);
    }
  }
</style>
