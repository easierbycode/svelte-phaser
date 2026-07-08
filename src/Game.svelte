<script lang="ts">
  import type Phaser from 'phaser'
  import type { Snippet } from 'svelte'
  import { createGame, type CreateGameOptions } from './core/hooks'

  interface Props extends Omit<CreateGameOptions, 'instance'> {
    /** The created Phaser.Game — bindable. You may also pass in your own instance. */
    instance?: Phaser.Game
    /** Rendered while the game is booting. */
    booting?: Snippet
    children?: Snippet
  }

  let { instance = $bindable(), booting, children, ...config }: Props = $props()

  // svelte-ignore state_referenced_locally -- game config is read once at creation by design
  const { game, booted } = createGame({ ...config, instance })

  instance = game
</script>

{#if $booted}
  {@render children?.()}
{:else}
  {@render booting?.()}
{/if}
