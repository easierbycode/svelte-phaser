<script lang="ts">
  import Phaser from 'phaser'
  import type { Snippet } from 'svelte'
  import { getScene } from './core/context'
  import type { RectangleProps } from './core/types'
  import { useGameObject } from './gameObject.svelte'
  import { bindProp } from './util.svelte'

  interface Props extends RectangleProps {
    /** The created rectangle — bindable. You may also pass in your own instance. */
    instance?: Phaser.GameObjects.Rectangle
    children?: Snippet
  }

  let { instance = $bindable(), children, ...rest }: Props = $props()

  const scene = getScene()

  // svelte-ignore state_referenced_locally -- constructor takes initial values; effects handle updates
  if (!instance) {
    instance = new Phaser.GameObjects.Rectangle(
      scene,
      rest.x ?? 0,
      rest.y ?? 0,
      rest.width ?? 0,
      rest.height ?? 0,
      rest.fillColor,
      rest.fillAlpha
    )
  }

  const rectangle = instance

  useGameObject(rectangle, () => rest)

  bindProp(
    () => rest.fillColor,
    (v) => rectangle.setFillStyle(v, rest.fillAlpha)
  )
  bindProp(
    () => rest.strokeColor,
    (v) => rectangle.setStrokeStyle(rest.strokeWidth ?? 1, v)
  )
  bindProp(() => rest.width, (v) => rectangle.setSize(v, rectangle.height))
  bindProp(() => rest.height, (v) => rectangle.setSize(rectangle.width, v))
</script>

{@render children?.()}
