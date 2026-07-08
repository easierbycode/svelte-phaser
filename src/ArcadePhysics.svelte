<script lang="ts">
  import type { Snippet } from 'svelte'
  import { useArcadePhysics } from './core/hooks'
  import type { ArcadeBodyProps } from './core/types'

  interface Props extends ArcadeBodyProps {
    /**
     * The type of physics body.
     *
     * 'dynamic' (the default) is simulated and synchronized with the game object.
     * 'static' does not move; it can collide with dynamic bodies but is immovable.
     */
    bodyType?: 'dynamic' | 'static'
    children?: Snippet
  }

  let { children, ...rest }: Props = $props()

  useArcadePhysics(() => rest)
</script>

{@render children?.()}
