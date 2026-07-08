import Phaser from 'phaser'
import {
  getAllContexts,
  mount,
  onDestroy,
  setContext,
  unmount,
  type Component,
} from 'svelte'
import { writable, readonly, type Readable } from 'svelte/store'
import {
  applyArcadeBodyProps,
  applyContainerProps,
  applyGameObjectProps,
  applyRectangleProps,
  applySpriteProps,
  applyTextProps,
  applyTileSpriteProps,
  type PropCache,
} from './apply.ts'
import { attachGameObject, attachSpriteAnimationEvents } from './attach.ts'
import {
  GAME_CONTEXT_KEY,
  SCENE_CONTEXT_KEY,
  SPAWNER_CONTEXT_KEY,
  getGame,
  getGameObject,
  getScene,
  type SpawnerContext,
} from './context.ts'
import { findGameObjectsByName, removeUndefined, toArray } from './util.ts'
import type {
  ArcadeBodyProps,
  ArcadeColliderProps,
  ContainerProps,
  GameObjectProps,
  RectangleProps,
  SpriteProps,
  TextProps,
  TileSpriteProps,
} from './types.ts'

export interface CreateGameOptions
  extends Omit<Phaser.Types.Core.GameConfig, 'callbacks'> {
  /** Use an existing Phaser.Game instead of creating one. */
  instance?: Phaser.Game
  /** Called before the game boots. */
  onpreboot?: (game: Phaser.Game) => void
  /** Called after the game boots. */
  onpostboot?: (game: Phaser.Game) => void
}

export interface CreateGameResult {
  game: Phaser.Game
  /** Becomes true once the game has booted and its systems are ready. */
  booted: Readable<boolean>
}

/**
 * Creates a Phaser.Game (or adopts an existing one), provides it as context
 * for descendants, and destroys it when the component unmounts.
 *
 * Must be called during component initialisation.
 */
export function createGame(options: CreateGameOptions = {}): CreateGameResult {
  const { instance, onpreboot, onpostboot, ...config } = options

  const game =
    instance ??
    new Phaser.Game({
      ...removeUndefined(config),
      callbacks: {
        preBoot: (g: Phaser.Game) => onpreboot?.(g),
        postBoot: (g: Phaser.Game) => onpostboot?.(g),
      },
    })

  setContext(GAME_CONTEXT_KEY, game)

  const booted = writable(game.isRunning)

  if (!game.isRunning) {
    game.events.once('ready', () => booted.set(true))
  }

  onDestroy(() => {
    game.destroy(true)
  })

  return { game, booted: readonly(booted) }
}

export interface CreateSceneOptions extends Phaser.Types.Scenes.SettingsConfig {
  /** The unique key of this Scene. */
  key: string
  /** Use an existing Phaser.Scene instead of creating one. */
  instance?: Phaser.Scene
  /** Called by the Scene Manager to load assets, before create(). */
  preload?: (scene: Phaser.Scene) => void
  /** Called by the Scene Manager when the scene starts, after preload() completes. */
  create?: (scene: Phaser.Scene) => void
  /** Called by the Scene Manager when the scene starts, before preload() and create(). */
  init?: (scene: Phaser.Scene) => void
}

export interface CreateSceneResult {
  scene: Phaser.Scene
  /** True while the scene's loader is running its initial load. */
  loading: Readable<boolean>
  /** The loader progress, 0 to 1. */
  progress: Readable<number>
}

/**
 * Creates a Phaser.Scene (or adopts an existing one), registers it with the
 * game, provides it as context for descendants, and removes it when the
 * component unmounts.
 *
 * Must be called during component initialisation, inside a game context.
 */
export function createScene(options: CreateSceneOptions): CreateSceneResult {
  const { key, instance, preload, create, init, ...settings } = options

  const game = getGame()

  const scene = (instance ??
    new Phaser.Scene(
      removeUndefined({ key, ...settings }) as Phaser.Types.Scenes.SettingsConfig
    )) as Phaser.Scene & {
    preload?: () => void
    create?: () => void
    init?: () => void
  }

  setContext(SCENE_CONTEXT_KEY, scene)

  const loading = writable(!!preload)
  const progress = writable(0)

  scene.preload = preload ? () => preload(scene) : undefined
  scene.create = create ? () => create(scene) : undefined
  scene.init = init ? () => init(scene) : undefined

  game.scene.add(key, scene, true)

  scene.load.on('progress', (value: number) => progress.set(value))

  scene.load.on('complete', () => {
    progress.set(1)
    loading.set(false)
  })

  onDestroy(() => {
    game.scene.remove(key)
  })

  return { scene, loading: readonly(loading), progress: readonly(progress) }
}

/**
 * Creates a spawner that can imperatively mount components (with the current
 * component's context) and provides it as context for descendants. Spawned
 * components receive an `onDestroy` prop they call to remove themselves; any
 * still mounted when this component unmounts are cleaned up automatically.
 *
 * Must be called during component initialisation.
 */
export function createSpawner(): SpawnerContext {
  const spawner: SpawnerContext = {
    spawn(component: Component<any>, props: Record<string, any> = {}) {
      const target = document.createElement('div')

      const app = mount(component, {
        target,
        context,
        props: {
          ...props,
          onDestroy: () => {
            if (mounted.delete(app)) {
              unmount(app)
            }
          },
        },
      })

      mounted.add(app)
    },
  }

  setContext(SPAWNER_CONTEXT_KEY, spawner)

  const context = getAllContexts()
  const mounted = new Set<object>()

  onDestroy(() => {
    for (const app of mounted) {
      unmount(app)
    }

    mounted.clear()
  })

  return spawner
}

/**
 * Re-applies `getProps()` through `applier` on every game prestep, skipping
 * unchanged values. This is how hook-created objects stay in sync with
 * reactive state without the Svelte compiler.
 */
export function syncProps<I, P>(
  instance: I,
  getProps: () => P,
  applier: (instance: I, props: P, cache: PropCache) => void
): void {
  const game = getGame()
  const cache: PropCache = {}

  applier(instance, getProps(), cache)

  const listener = () => applier(instance, getProps(), cache)

  game.events.on('prestep', listener)

  onDestroy(() => {
    game.events.off('prestep', listener)
  })
}

/**
 * Adds an existing game object to the scene, keeps it in sync with
 * `getProps()`, and destroys it when the component unmounts.
 */
export function useGameObject<T extends Phaser.GameObjects.GameObject>(
  instance: T,
  getProps: () => GameObjectProps = () => ({})
): T {
  attachGameObject(instance, getProps)
  syncProps(instance, getProps, applyGameObjectProps)

  return instance
}

/**
 * Creates a sprite bound to `getProps()`.
 * Must be called during component initialisation, inside a scene context.
 */
export function useSprite(
  getProps: () => SpriteProps = () => ({})
): Phaser.GameObjects.Sprite {
  const scene = getScene()
  const props = getProps()

  const sprite = new Phaser.GameObjects.Sprite(
    scene,
    props.x ?? 0,
    props.y ?? 0,
    props.texture ?? '__DEFAULT',
    props.frame
  )

  attachGameObject(sprite, getProps)
  attachSpriteAnimationEvents(sprite, getProps)
  syncProps(sprite, getProps, applySpriteProps)

  return sprite
}

/**
 * Creates a text object bound to `getProps()`.
 * Must be called during component initialisation, inside a scene context.
 */
export function useText(
  getProps: () => TextProps = () => ({})
): Phaser.GameObjects.Text {
  const scene = getScene()
  const props = getProps()

  const text = new Phaser.GameObjects.Text(
    scene,
    props.x ?? 0,
    props.y ?? 0,
    props.text ?? '',
    {}
  )

  attachGameObject(text, getProps)
  syncProps(text, getProps, applyTextProps)

  return text
}

/**
 * Creates a tile sprite bound to `getProps()`.
 * Must be called during component initialisation, inside a scene context.
 */
export function useTileSprite(
  getProps: () => TileSpriteProps = () => ({})
): Phaser.GameObjects.TileSprite {
  const scene = getScene()
  const props = getProps()

  const tileSprite = new Phaser.GameObjects.TileSprite(
    scene,
    props.x ?? 0,
    props.y ?? 0,
    props.width ?? 0,
    props.height ?? 0,
    props.texture ?? '',
    props.frame
  )

  attachGameObject(tileSprite, getProps)
  syncProps(tileSprite, getProps, applyTileSpriteProps)

  return tileSprite
}

/**
 * Creates a rectangle bound to `getProps()`.
 * Must be called during component initialisation, inside a scene context.
 */
export function useRectangle(
  getProps: () => RectangleProps = () => ({})
): Phaser.GameObjects.Rectangle {
  const scene = getScene()
  const props = getProps()

  const rectangle = new Phaser.GameObjects.Rectangle(
    scene,
    props.x ?? 0,
    props.y ?? 0,
    props.width ?? 0,
    props.height ?? 0,
    props.fillColor,
    props.fillAlpha
  )

  attachGameObject(rectangle, getProps)
  syncProps(rectangle, getProps, applyRectangleProps)

  return rectangle
}

/**
 * Creates a container bound to `getProps()` and provides it as the parent for
 * game objects created by descendants.
 *
 * Must be called during component initialisation, inside a scene context.
 */
export function useContainer(
  getProps: () => ContainerProps = () => ({})
): Phaser.GameObjects.Container {
  const scene = getScene()
  const props = getProps()

  const container = new Phaser.GameObjects.Container(
    scene,
    props.x ?? 0,
    props.y ?? 0,
    []
  )

  attachGameObject(container, getProps)
  syncProps(container, getProps, applyContainerProps)

  return container
}

/**
 * Enables an arcade physics body on a game object (the nearest game object
 * context by default) and keeps it in sync with `getProps()`.
 *
 * Must be called during component initialisation, inside a scene context.
 */
export function useArcadePhysics(
  getProps: () => ArcadeBodyProps & { bodyType?: 'dynamic' | 'static' } = () => ({}),
  gameObject?: Phaser.GameObjects.GameObject
): Phaser.Physics.Arcade.Body {
  const scene = getScene()
  const instance = (gameObject ?? getGameObject()) as Phaser.GameObjects.GameObject & {
    body: Phaser.Physics.Arcade.Body
  }

  const { bodyType = 'dynamic', onWorldBounds = true } = getProps()

  scene.physics.world.enable(
    instance,
    bodyType === 'static'
      ? Phaser.Physics.Arcade.STATIC_BODY
      : Phaser.Physics.Arcade.DYNAMIC_BODY
  )

  syncProps(instance, () => ({ onWorldBounds, ...getProps() }), applyArcadeBodyProps)

  onDestroy(() => {
    if (scene.children.exists(instance)) {
      scene.physics.world.disable(instance)
    }
  })

  return instance.body
}

/**
 * Creates an arcade physics collider (or overlap) between the nearest game
 * object context (or `gameObject`) and the targets in `props.with`. String
 * targets are resolved by game object name, including objects added to the
 * scene later.
 *
 * Must be called during component initialisation, inside a scene context.
 */
export function useArcadeCollider(
  props: ArcadeColliderProps,
  gameObject?: Phaser.GameObjects.GameObject
): Phaser.Physics.Arcade.Collider {
  const scene = getScene()
  const parent: Phaser.GameObjects.GameObject = gameObject ?? getGameObject()

  function resolveTargets(): Phaser.GameObjects.GameObject[] {
    return toArray(props.with).flatMap((target) =>
      typeof target === 'string' ? findGameObjectsByName(scene, target) : target
    )
  }

  const collideCallback = (self: any, other: any) =>
    props.oncollide?.({ self, other })

  const processCallback = props.allowCollision
    ? (self: any, other: any) => props.allowCollision!({ self, other })
    : undefined

  const collider = props.overlapOnly
    ? scene.physics.add.overlap(
        [parent],
        resolveTargets(),
        collideCallback,
        processCallback
      )
    : scene.physics.add.collider(
        [parent],
        resolveTargets(),
        collideCallback,
        processCallback
      )

  function handleAddedToScene(object: Phaser.GameObjects.GameObject) {
    if (!object.name) return

    const names = toArray(props.with).filter((t) => typeof t === 'string')

    if (names.includes(object.name)) {
      collider.object2 = [
        ...(collider.object2 as Phaser.GameObjects.GameObject[]),
        object,
      ]
    }
  }

  scene.events.on(Phaser.Scenes.Events.ADDED_TO_SCENE, handleAddedToScene)

  onDestroy(() => {
    scene.events.off(Phaser.Scenes.Events.ADDED_TO_SCENE, handleAddedToScene)
    collider.destroy()
  })

  return collider
}
