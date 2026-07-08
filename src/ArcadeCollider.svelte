<script lang="ts">
  import type Phaser from 'phaser'
  import { untrack } from 'svelte'
  import { getScene } from './core/context'
  import { useArcadeCollider } from './core/hooks'
  import { findGameObjectsByName, toArray } from './core/util'
  import type { ArcadeColliderProps } from './core/types'

  let {
    with: targets,
    overlapOnly,
    oncollide,
    allowCollision,
  }: ArcadeColliderProps = $props()

  const scene = getScene()

  const collider = useArcadeCollider({
    get with() {
      return targets
    },
    get overlapOnly() {
      return overlapOnly
    },
    get oncollide() {
      return oncollide
    },
    get allowCollision() {
      return allowCollision
    },
  })

  $effect(() => {
    const value = targets

    untrack(() => {
      collider.object2 = toArray(value).flatMap((target) =>
        typeof target === 'string'
          ? findGameObjectsByName(scene, target)
          : target
      ) as Phaser.GameObjects.GameObject[]
    })
  })

  $effect(() => {
    collider.overlapOnly = !!overlapOnly
  })
</script>
