<script lang="ts">
  import Phaser from 'phaser'
  import type { Snippet } from 'svelte'
  import { getScene } from './core/context'
  import type { TileSpriteProps } from './core/types'
  import { useGameObject } from './gameObject.svelte'
  import { bindProp } from './util.svelte'

  interface Props extends TileSpriteProps {
    /** The created tile sprite — bindable. You may also pass in your own instance. */
    instance?: Phaser.GameObjects.TileSprite
    children?: Snippet
  }

  let { instance = $bindable(), children, ...rest }: Props = $props()

  const scene = getScene()

  // svelte-ignore state_referenced_locally -- constructor takes initial values; effects handle updates
  if (!instance) {
    instance = new Phaser.GameObjects.TileSprite(
      scene,
      rest.x ?? 0,
      rest.y ?? 0,
      rest.width ?? 0,
      rest.height ?? 0,
      rest.texture ?? '',
      rest.frame
    )
  }

  const tileSprite = instance

  useGameObject(tileSprite, () => rest)

  bindProp(() => rest.tilePositionX, (v) => { tileSprite.tilePositionX = v })
  bindProp(() => rest.tilePositionY, (v) => { tileSprite.tilePositionY = v })
  bindProp(() => rest.tileScaleX, (v) => { tileSprite.tileScaleX = v })
  bindProp(() => rest.tileScaleY, (v) => { tileSprite.tileScaleY = v })
</script>

{@render children?.()}
