import type Phaser from 'phaser'
import { attachGameObject } from './core/attach'
import type { GameObjectProps } from './core/types'
import { bindProp } from './util.svelte'

/**
 * Wires a Phaser game object into the component tree (scene/container/context
 * membership, pointer events, destroy-on-unmount — see `attachGameObject`)
 * and reactively applies the common game object props with fine-grained
 * `$effect` bindings.
 *
 * Must be called during component initialisation. `props` is a getter so the
 * bindings stay reactive.
 */
export function useGameObject<T extends Phaser.GameObjects.GameObject>(
  instance: T,
  props: () => GameObjectProps
): void {
  attachGameObject(instance, props)

  const go = instance as any

  bindProp(() => props().name, (v) => go.setName(v))
  bindProp(() => props().active, (v) => go.setActive(v))

  // transform
  if (typeof go.setX === 'function') {
    bindProp(() => props().x, (v) => go.setX(v))
    bindProp(() => props().y, (v) => go.setY(v))
    bindProp(() => props().z, (v) => go.setZ(v))
    bindProp(() => props().w, (v) => go.setW(v))
    bindProp(() => props().scale, (v) => go.setScale(v))
    bindProp(() => props().scaleX, (v) => { go.scaleX = v })
    bindProp(() => props().scaleY, (v) => { go.scaleY = v })
    bindProp(() => props().angle, (v) => go.setAngle(v))
    bindProp(() => props().rotation, (v) => go.setRotation(v))
  }

  if (typeof go.setDepth === 'function') {
    bindProp(() => props().depth, (v) => go.setDepth(v))
  }

  if (typeof go.setAlpha === 'function') {
    bindProp(() => props().alpha, (v) => go.setAlpha(v))
  }

  if (typeof go.setBlendMode === 'function') {
    bindProp(() => props().blendMode, (v) => go.setBlendMode(v))
  }

  if (typeof go.setFlipX === 'function') {
    bindProp(() => props().flipX, (v) => go.setFlipX(v))
    bindProp(() => props().flipY, (v) => go.setFlipY(v))
  }

  if (typeof go.setOrigin === 'function') {
    bindProp(() => props().originX, (v) => go.setOrigin(v, go.originY))
    bindProp(() => props().originY, (v) => go.setOrigin(go.originX, v))
  }

  if (typeof go.setScrollFactor === 'function') {
    bindProp(() => props().scrollFactorX, (v) => go.setScrollFactor(v, go.scrollFactorY))
    bindProp(() => props().scrollFactorY, (v) => go.setScrollFactor(go.scrollFactorX, v))
  }

  if (typeof go.setVisible === 'function') {
    bindProp(() => props().visible, (v) => go.setVisible(v))
  }

  if (typeof go.setTint === 'function') {
    bindProp(() => props().tint, (v) => go.setTint(v))
  }

  bindProp(
    () => props().interactive,
    (v) => {
      if (v === true) {
        go.setInteractive()
      } else if (v === false) {
        go.disableInteractive()
      } else if (v) {
        go.setInteractive(v.shape, v.callback, v.dropZone)
      }
    }
  )
}
