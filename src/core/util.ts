import type Phaser from 'phaser'

/**
 * Returns a shallow copy of `object` with all `undefined` values removed.
 */
export function removeUndefined<T extends Record<string, any>>(
  object: T
): Partial<T> {
  const result: Record<string, any> = {}

  for (const key of Object.keys(object)) {
    if (typeof object[key] !== 'undefined') {
      result[key] = object[key]
    }
  }

  return result as Partial<T>
}

export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

/**
 * Returns all game objects in the scene whose `name` matches.
 */
export function findGameObjectsByName<T extends Phaser.GameObjects.GameObject>(
  scene: Phaser.Scene,
  name: string
): T[] {
  return scene.children.list.filter((child) => child.name === name) as T[]
}
