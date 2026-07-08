<script lang="ts">
  import type Phaser from 'phaser'
  import type { Snippet } from 'svelte'
  import { createScene, type CreateSceneOptions } from './core/hooks'

  interface Props extends Omit<CreateSceneOptions, 'instance'> {
    /** The created Phaser.Scene — bindable. You may also pass in your own instance. */
    instance?: Phaser.Scene
    /** Rendered while the scene's loader is running. Receives the load progress (0-1). */
    loading?: Snippet<[number]>
    children?: Snippet
  }

  let { instance = $bindable(), loading, children, ...options }: Props = $props()

  // svelte-ignore state_referenced_locally -- scene config is read once at creation by design
  const { scene, loading: isLoading, progress } = createScene({
    ...options,
    instance,
  })

  instance = scene
</script>

{#if $isLoading}
  {@render loading?.($progress)}
{:else}
  {@render children?.()}
{/if}
