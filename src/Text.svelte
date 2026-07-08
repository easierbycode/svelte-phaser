<script lang="ts">
  import Phaser from 'phaser'
  import type { Snippet } from 'svelte'
  import { getScene } from './core/context'
  import type { TextProps } from './core/types'
  import { useGameObject } from './gameObject.svelte'
  import { bindProp } from './util.svelte'

  interface Props extends TextProps {
    /** The created text object — bindable. You may also pass in your own instance. */
    instance?: Phaser.GameObjects.Text
    children?: Snippet
  }

  let { instance = $bindable(), children, ...rest }: Props = $props()

  const scene = getScene()

  // svelte-ignore state_referenced_locally -- constructor takes initial values; effects handle updates
  if (!instance) {
    instance = new Phaser.GameObjects.Text(
      scene,
      rest.x ?? 0,
      rest.y ?? 0,
      rest.text ?? '',
      {}
    )
  }

  const textObject = instance

  useGameObject(textObject, () => rest)

  bindProp(() => rest.text, (v) => textObject.setText(v))
  bindProp(() => rest.align, (v) => textObject.setAlign(v))
  bindProp(() => rest.color, (v) => textObject.setColor(v))
  bindProp(() => rest.fontFamily, (v) => textObject.setFontFamily(v))
  bindProp(() => rest.fontSize, (v) => textObject.setFontSize(v))
  bindProp(() => rest.fontStyle, (v) => textObject.setFontStyle(v))
  bindProp(() => rest.backgroundColor, (v) => textObject.setBackgroundColor(v))
  bindProp(
    () => rest.stroke,
    (v) => textObject.setStroke(v, rest.strokeThickness ?? 1)
  )
  bindProp(() => rest.lineSpacing, (v) => textObject.setLineSpacing(v))
  bindProp(
    () => rest.padding,
    (v) => textObject.setPadding(v as Phaser.Types.GameObjects.Text.TextPadding)
  )
  bindProp(() => rest.wordWrapWidth, (v) => textObject.setWordWrapWidth(v))
</script>

{@render children?.()}
