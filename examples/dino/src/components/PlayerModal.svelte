<script lang="ts">
  import { player } from '../lib/settings.svelte'

  let { open = $bindable(false) }: { open?: boolean } = $props()

  let name = $state('')
  let input = $state<HTMLInputElement>()

  $effect(() => {
    if (open) {
      input?.focus()
      input?.select()
    }
  })

  function save() {
    const trimmed = name.trim()
    if (trimmed.length > 0 && trimmed.length <= 20) {
      player.setName(trimmed)
      open = false
      console.log(`✅ Player name saved: ${trimmed}`)
    } else if (trimmed.length === 0) {
      alert('Please enter a name')
    } else {
      alert('Please enter a valid name (1-20 characters)')
    }
  }

  function onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      open = false
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="modal" class:show={open} onclick={onBackdropClick}>
  <div class="modal-content">
    <h3>🎮 Welcome to Dino Runner!</h3>
    <p>
      Enter your name to save scores and compete on the global leaderboard:
    </p>
    <input
      type="text"
      id="playerNameInput"
      placeholder="Your name"
      maxlength="20"
      bind:this={input}
      bind:value={name}
      onkeydown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          save()
        }
      }}
    />
    <div class="modal-buttons">
      <button onclick={save} class="btn btn-primary">Save & Play</button>
      <button onclick={() => (open = false)} class="btn btn-secondary">
        Play Anonymous
      </button>
    </div>
  </div>
</div>
