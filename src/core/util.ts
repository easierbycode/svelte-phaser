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
 * Whether `instance` is a game object that Phaser has already destroyed.
 *
 * Phaser marks a destroyed object by clearing its `scene` reference, and
 * `GameObject#destroy` itself uses this same check to detect a double-destroy.
 * A freshly constructed object always has `scene` set, so this only matches
 * corpses.
 *
 * Components take an optional caller-supplied `instance` and construct their
 * own when it is absent. That reuse is a trap under `bind:instance`: Svelte
 * does not clear a binding when the component unmounts, but unmounting
 * destroys the object (see `attachGameObject`). A later remount would revive
 * the corpse — `destroy()` leaves it `active: false, visible: false`, so it
 * never renders again, yet it still accepts a physics body and prop updates.
 * The result is an object that is invisible but still moving. Treat a
 * destroyed instance as absent and build a fresh one instead.
 */
export function isDestroyed(instance: Phaser.GameObjects.GameObject): boolean {
  return !instance.scene
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
