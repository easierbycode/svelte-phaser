<script lang="ts">
  import { untrack } from 'svelte'
  import { player } from '../lib/settings.svelte'

  let { open = $bindable(false) }: { open?: boolean } = $props()

  let dinoColor = $state(player.settings.dinoColor)
  let backgroundTheme = $state(player.settings.backgroundTheme)
  let difficultyPreference = $state(player.settings.difficultyPreference)

  // populate the form with the current settings each time the modal opens;
  // untrack so a late settings fetch can't clobber in-progress edits
  $effect(() => {
    if (open) {
      untrack(() => {
        dinoColor = player.settings.dinoColor
        backgroundTheme = player.settings.backgroundTheme
        difficultyPreference = player.settings.difficultyPreference
      })
    }
  })

  function save() {
    player.settings = {
      ...player.settings,
      dinoColor,
      backgroundTheme,
      difficultyPreference,
    }
    player.save()
    console.log(
      `🎨 Applied theme: ${backgroundTheme}, difficulty: ${difficultyPreference}`
    )
    open = false
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
    <h3>🎨 Customize Your Game</h3>

    <div class="customization-options">
      <div class="option-group">
        <label for="dinoColorPicker">Dino Color:</label>
        <input type="color" id="dinoColorPicker" bind:value={dinoColor} />
      </div>

      <div class="option-group">
        <label for="backgroundTheme">Background Theme:</label>
        <select id="backgroundTheme" bind:value={backgroundTheme}>
          <option value="desert">🏜️ Desert</option>
          <option value="forest">🌲 Forest</option>
          <option value="night">🌙 Night</option>
          <option value="rainbow">🌈 Rainbow</option>
          <option value="space">🚀 Space</option>
        </select>
      </div>

      <div class="option-group">
        <label for="difficultyPreference">Difficulty:</label>
        <select id="difficultyPreference" bind:value={difficultyPreference}>
          <option value="easy">😊 Easy</option>
          <option value="normal">😐 Normal</option>
          <option value="hard">😈 Hard</option>
        </select>
      </div>
    </div>

    <div class="modal-buttons">
      <button onclick={save} class="btn btn-primary">Save Changes</button>
      <button onclick={() => (open = false)} class="btn btn-secondary">
        Cancel
      </button>
    </div>
  </div>
</div>
