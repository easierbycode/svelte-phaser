/**
 * svelte-phaser core: the rune-free, `.svelte`-free layer.
 *
 * Everything in this module uses only public Svelte runtime APIs (context,
 * lifecycle, stores, mount/unmount), so it can be published to JSR and
 * consumed from any Svelte 5 app. The `.svelte` component layer that ships
 * with the npm package is a thin wrapper over these primitives.
 */

export {
  GAME_CONTEXT_KEY,
  SCENE_CONTEXT_KEY,
  GAME_OBJECT_CONTEXT_KEY,
  CONTAINER_CONTEXT_KEY,
  SPAWNER_CONTEXT_KEY,
  getGame,
  getScene,
  getGameObject,
  getContainer,
  getSpawner,
  type SpawnerContext,
} from './context.ts'

export {
  onGameEvent,
  onSceneEvent,
  onInputEvent,
  onArcadePhysicsEvent,
} from './events.ts'

export {
  removeUndefined,
  toArray,
  findGameObjectsByName,
  isDestroyed,
} from './util.ts'

export type {
  InteractiveConfig,
  GameObjectProps,
  SpriteProps,
  TextProps,
  TileSpriteProps,
  RectangleProps,
  ContainerProps,
  ArcadeBodyProps,
  ArcadeColliderProps,
  CollisionTarget,
  CollideEvent,
} from './types.ts'

export {
  applyGameObjectProps,
  applySpriteProps,
  applyTextProps,
  applyTileSpriteProps,
  applyRectangleProps,
  applyContainerProps,
  applyArcadeBodyProps,
  type PropCache,
} from './apply.ts'

export { attachGameObject, attachSpriteAnimationEvents } from './attach.ts'

export {
  createGame,
  createScene,
  createSpawner,
  syncProps,
  useGameObject,
  useSprite,
  useText,
  useTileSprite,
  useRectangle,
  useContainer,
  useArcadePhysics,
  useArcadeCollider,
  type CreateGameOptions,
  type CreateGameResult,
  type CreateSceneOptions,
  type CreateSceneResult,
} from './hooks.ts'
