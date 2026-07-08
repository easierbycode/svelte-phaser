import { untrack } from 'svelte'

/**
 * Applies a reactive prop to a Phaser object.
 *
 * The prop is applied synchronously on setup (so the Phaser object is fully
 * configured before its first rendered frame), then re-applied whenever the
 * value changes. `undefined` values are never applied, which lets callers
 * omit props to keep Phaser defaults.
 *
 * Must be called during component initialisation.
 */
export function bindProp<T>(
  get: () => T | undefined,
  apply: (value: T) => void
): void {
  let last = get()

  if (last !== undefined) {
    apply(last)
  }

  $effect(() => {
    const value = get()

    if (value !== undefined && value !== last) {
      last = value
      untrack(() => apply(value))
    }
  })
}
