// Component layer — thin Svelte 5 wrappers over the core, with fine-grained
// $effect prop bindings. Requires the Svelte compiler (npm / workspace
// consumption). For the compiler-free API published to JSR, see ./core.
export { default as Game } from './Game.svelte'
export { default as Scene } from './Scene.svelte'
export { default as Spawner } from './Spawner.svelte'
export { default as Sprite } from './Sprite.svelte'
export { default as Text } from './Text.svelte'
export { default as TileSprite } from './TileSprite.svelte'
export { default as Rectangle } from './Rectangle.svelte'
export { default as Container } from './Container.svelte'
export { default as ArcadePhysics } from './ArcadePhysics.svelte'
export { default as ArcadeCollider } from './ArcadeCollider.svelte'

// Component-layer utilities (use runes; compiled by the consumer)
export { bindProp } from './util.svelte'
export { useGameObject } from './gameObject.svelte'

// Core layer — contexts, event hooks, prop appliers, and compiler-free hooks
export * from './core/index'
