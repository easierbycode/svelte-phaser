<script lang="ts">
  import Phaser from 'phaser'
  import { setContext, type Snippet } from 'svelte'
  import { CONTAINER_CONTEXT_KEY, getScene } from './core/context'
  import type { ContainerProps } from './core/types'
  import { useGameObject } from './gameObject.svelte'
  import { bindProp } from './util.svelte'

  interface Props extends ContainerProps {
    /** The created container — bindable. You may also pass in your own instance. */
    instance?: Phaser.GameObjects.Container
    children?: Snippet
  }

  let { instance = $bindable(), children, ...rest }: Props = $props()

  const scene = getScene()

  // svelte-ignore state_referenced_locally -- constructor takes initial values; effects handle updates
  if (!instance) {
    instance = new Phaser.GameObjects.Container(
      scene,
      rest.x ?? 0,
      rest.y ?? 0,
      []
    )
  }

  const container = instance

  useGameObject(container, () => rest)
  setContext(CONTAINER_CONTEXT_KEY, container)

  bindProp(() => rest.width, (v) => container.setSize(v, container.height))
  bindProp(() => rest.height, (v) => container.setSize(container.width, v))
</script>

{@render children?.()}
