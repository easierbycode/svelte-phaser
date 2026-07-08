import type Phaser from 'phaser'
import { getContext } from 'svelte'
import type { Component } from 'svelte'

export const GAME_CONTEXT_KEY = 'phaser/game'
export const SCENE_CONTEXT_KEY = 'phaser/scene'
export const GAME_OBJECT_CONTEXT_KEY = 'phaser/game-object'
export const CONTAINER_CONTEXT_KEY = 'phaser/container'
export const SPAWNER_CONTEXT_KEY = 'phaser/spawner'

/**
 * Returns the Phaser.Game instance provided by the nearest <Game> component.
 */
export function getGame(): Phaser.Game {
  return getContext(GAME_CONTEXT_KEY)
}

/**
 * Returns the Phaser.Scene instance provided by the nearest <Scene> component.
 */
export function getScene(): Phaser.Scene {
  return getContext(SCENE_CONTEXT_KEY)
}

/**
 * Returns the Phaser.GameObjects.GameObject instance provided by the nearest
 * game object component (e.g. <Sprite>, <Text>).
 */
export function getGameObject<T = Phaser.GameObjects.GameObject>(): T {
  return getContext(GAME_OBJECT_CONTEXT_KEY)
}

/**
 * Returns the Phaser.GameObjects.Container instance provided by the nearest
 * <Container> component, if any.
 */
export function getContainer(): Phaser.GameObjects.Container | undefined {
  return getContext(CONTAINER_CONTEXT_KEY)
}

export interface SpawnerContext {
  /**
   * Mounts `component` with `props`. The component receives an additional
   * `onDestroy` prop it should call to remove itself.
   */
  spawn: (component: Component<any>, props?: Record<string, any>) => void
}

/**
 * Returns the spawner provided by the nearest <Spawner> component.
 */
export function getSpawner(): SpawnerContext {
  return getContext(SPAWNER_CONTEXT_KEY)
}
