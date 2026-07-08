<script lang="ts">
  import Phaser from 'phaser'
  import type { Snippet } from 'svelte'
  import { attachSpriteAnimationEvents } from './core/attach'
  import { getScene } from './core/context'
  import type { SpriteProps } from './core/types'
  import { useGameObject } from './gameObject.svelte'
  import { bindProp } from './util.svelte'

  interface Props extends SpriteProps {
    /** The created sprite — bindable. You may also pass in your own instance. */
    instance?: Phaser.GameObjects.Sprite
    children?: Snippet
  }

  let { instance = $bindable(), children, ...rest }: Props = $props()

  const scene = getScene()

  // svelte-ignore state_referenced_locally -- constructor takes initial values; effects handle updates
  if (!instance) {
    instance = new Phaser.GameObjects.Sprite(
      scene,
      rest.x ?? 0,
      rest.y ?? 0,
      rest.texture ?? '__DEFAULT',
      rest.frame
    )
  }

  const sprite = instance

  useGameObject(sprite, () => rest)
  attachSpriteAnimationEvents(sprite, () => rest)

  bindProp(
    () => rest.texture,
    (v) => {
      if (sprite.texture.key !== v) {
        sprite.setTexture(v, rest.frame)
      }
    }
  )

  bindProp(() => rest.animation, (v) => sprite.anims.play(v, true))
</script>

{@render children?.()}
