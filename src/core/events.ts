import { onMount } from 'svelte'
import { getGame, getScene } from './context.ts'

type EventCallback = (...args: any[]) => void

/**
 * Subscribes to an event on `game.events` for the lifetime of the component.
 * Common events: 'prestep', 'step', 'poststep', 'prerender', 'postrender'.
 */
export function onGameEvent(event: string, callback: EventCallback): void {
  const game = getGame()

  onMount(() => {
    game.events.on(event, callback)

    return () => game.events.off(event, callback)
  })
}

/**
 * Subscribes to an event on `scene.events` for the lifetime of the component.
 */
export function onSceneEvent(event: string, callback: EventCallback): void {
  const scene = getScene()

  onMount(() => {
    scene.events.on(event, callback)

    return () => scene.events.off(event, callback)
  })
}

/**
 * Subscribes to an event on `scene.input` for the lifetime of the component.
 * Common events: 'pointerdown', 'pointerup', 'pointermove'.
 */
export function onInputEvent(event: string, callback: EventCallback): void {
  const scene = getScene()

  onMount(() => {
    scene.input.on(event, callback)

    return () => scene.input.off(event, callback)
  })
}

/**
 * Subscribes to an event on `scene.physics.world` for the lifetime of the
 * component. Common events: 'worldbounds', 'collide', 'overlap'.
 */
export function onArcadePhysicsEvent(
  event: string,
  callback: EventCallback
): void {
  const scene = getScene()

  onMount(() => {
    scene.physics.world.on(event, callback)

    return () => scene.physics.world.off(event, callback)
  })
}
