import type Phaser from 'phaser'
import { onDestroy, setContext } from 'svelte'
import { GAME_OBJECT_CONTEXT_KEY, getContainer, getScene } from './context.ts'
import type { GameObjectProps } from './types.ts'

const POINTER_EVENTS = [
  'pointerdown',
  'pointerup',
  'pointermove',
  'pointerover',
  'pointerout',
  'drag',
  'dragstart',
  'dragend',
  'dragenter',
  'dragleave',
  'dragover',
  'drop',
] as const

export const SPRITE_ANIMATION_EVENTS = [
  'animationstart',
  'animationcomplete',
  'animationrepeat',
  'animationstop',
] as const

/**
 * Wires a Phaser game object into the component tree:
 *
 * - adds it to the scene (and to the nearest <Container>, if any)
 * - provides it as context for descendants (ArcadePhysics, ArcadeCollider)
 * - forwards Phaser pointer/drag events to `on<event>` callback props
 * - destroys it when the component unmounts
 *
 * Prop application is left to the caller (components use $effect bindings,
 * hooks use step-based syncing). Must be called during component init.
 */
export function attachGameObject<T extends Phaser.GameObjects.GameObject>(
  instance: T,
  getProps: () => GameObjectProps
): T {
  const scene = getScene()
  const container = getContainer()

  setContext(GAME_OBJECT_CONTEXT_KEY, instance)

  // the name must be set before the object enters the scene, so listeners of
  // ADDED_TO_SCENE (e.g. ArcadeCollider's name matching) see it
  const name = getProps().name

  if (name !== undefined) {
    instance.setName(name)
  }

  scene.add.existing(instance)

  if (container && (container as Phaser.GameObjects.GameObject) !== instance) {
    container.add(instance)
  }

  for (const event of POINTER_EVENTS) {
    instance.on(event, (...args: any[]) => {
      const handler = getProps()[`on${event}`]

      if (typeof handler === 'function') {
        handler(...args)
      }
    })
  }

  onDestroy(() => {
    instance.destroy()
  })

  return instance
}

/**
 * Forwards Phaser animation events on a sprite to `on<event>` callback props.
 * Must be called during component init.
 */
export function attachSpriteAnimationEvents(
  instance: Phaser.GameObjects.Sprite,
  getProps: () => GameObjectProps
): void {
  for (const event of SPRITE_ANIMATION_EVENTS) {
    instance.on(event, (...args: any[]) => {
      const handler = getProps()[`on${event}`]

      if (typeof handler === 'function') {
        handler(...args)
      }
    })
  }
}
