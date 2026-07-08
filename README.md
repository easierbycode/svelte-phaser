# svelte-phaser

Svelte 5 components and hooks for building [Phaser 4](https://phaser.io) games.

A modern rewrite of the original [svelte-phaser](https://github.com/mattjennings/svelte-phaser)
(Svelte 3 / Phaser 3) using runes, snippets and callback props — targeting
Svelte ^5 and Phaser ^4.

## The two layers

| Layer | What | Where it works |
| --- | --- | --- |
| **Core** (`svelte-phaser/core`, JSR: `@easierbycode/svelte-phaser`) | Pure TypeScript: context getters, event hooks, prop appliers, and compiler-free hooks (`useSprite`, `useArcadePhysics`, `createGame`, …). Reactivity flows out through `svelte/store` and in through per-step prop syncing — no runes, no `.svelte` files. | Anywhere — including installed from **JSR**, which only accepts JS/TS modules. |
| **Components** (`svelte-phaser`) | `.svelte` components (`<Game>`, `<Scene>`, `<Sprite>`, …) built on the core, with fine-grained `$effect` prop bindings. | npm / workspace installs, where your bundler's Svelte plugin compiles library source. |

> Why the split? JSR's module graph only accepts JavaScript/TypeScript — `.svelte`
> files (and rune code, which needs the Svelte compiler) cannot be published there
> ([jsr-io/jsr#861](https://github.com/jsr-io/jsr/issues/861)). The core layer is
> designed to be fully usable without the compiler, so the JSR package is a real,
> working game-binding API — not a stub.

## Install

From JSR (core API):

```sh
npx jsr add @easierbycode/svelte-phaser
```

From a workspace / local checkout (components + core) — note the unscoped
`svelte-phaser` name on the npm registry belongs to the original Svelte 3
project, so install this package by path:

```sh
npm install phaser svelte
npm install <path-to>/svelte-phaser   # or "svelte-phaser": "file:../svelte-phaser"
```

(see [examples/dino](examples/dino), which consumes it via `file:../..`)

## Components example

```svelte
<script lang="ts">
  import Phaser from 'phaser'
  import { Game, Scene, Sprite, Text } from 'svelte-phaser'

  function preload(scene: Phaser.Scene) {
    scene.load.image('player', 'assets/player.png')
  }
</script>

<Game width={800} height={600} physics={{ default: 'arcade' }}>
  <Scene key="main" {preload}>
    {#snippet loading(progress)}
      <Text x={400} y={300} text={`Loading ${Math.round(progress * 100)}%`} />
    {/snippet}

    <Sprite texture="player" x={400} y={300} />
  </Scene>
</Game>
```

### Components

- `<Game>` — creates the `Phaser.Game`. Accepts game config as props, a
  `booting` snippet, and `bind:instance`.
- `<Scene key>` — creates and registers a `Phaser.Scene`. Accepts `preload` /
  `create` / `init` callbacks, a `loading` snippet (receives progress 0–1),
  and `bind:instance`.
- `<Sprite>`, `<Text>`, `<TileSprite>`, `<Rectangle>`, `<Container>` — game
  objects. Props apply reactively; omitted props keep Phaser defaults.
  Phaser events surface as callback props (`onpointerdown`,
  `onanimationcomplete`, …).
- `<ArcadePhysics>` — enables an arcade body on the parent game object
  (`velocityX`, `bounce`, `collideWorldBounds`, `circle`, …).
- `<ArcadeCollider with={...} overlapOnly oncollide={...}>` — collides the
  parent game object with other objects, or with names (string targets are
  matched against `gameObject.name`, including objects spawned later).
- `<Spawner>` — provides `getSpawner()` context so gameplay code can
  imperatively `spawn(Component, props)` (bullets, pickups, …). Spawned
  components receive an `onDestroy` prop to remove themselves.

### Context + events (both layers)

```ts
import {
  getGame, getScene, getSpawner, getGameObject, getContainer,
  onGameEvent, onSceneEvent, onInputEvent, onArcadePhysicsEvent,
} from 'svelte-phaser'

const scene = getScene()
onGameEvent('step', () => { /* runs every game step */ })
onInputEvent('pointerdown', () => { /* ... */ })
```

## Hooks example (core / JSR API)

The hooks create the same objects without any library `.svelte` files. Pass a
props *getter* — it is re-read every game step and only changed values are
re-applied to Phaser:

```svelte
<script lang="ts">
  import { createGame, createScene, useSprite, useArcadePhysics }
    from '@easierbycode/svelte-phaser'

  // inside your own components:
  const sprite = useSprite(() => ({ texture: 'player', x, y }))
  useArcadePhysics(() => ({ velocityX, collideWorldBounds: true }), sprite)
</script>
```

- `createGame(config)` → `{ game, booted }` (`booted` is a store)
- `createScene({ key, preload, create })` → `{ scene, loading, progress }` (stores)
- `createSpawner()` → `{ spawn }` — mounts components imperatively with the
  current context (uses Svelte's public `mount`/`unmount`)
- `useSprite / useText / useTileSprite / useRectangle / useContainer(getProps)`
- `useArcadePhysics(getProps, gameObject?)`, `useArcadeCollider(props, gameObject?)`
- `applyGameObjectProps(...)` etc. — the underlying idempotent prop appliers

All hooks must be called during component initialisation (they use Svelte
context and lifecycle under the hood).

## Examples

- [examples/dino](examples/dino) — a complete dino-runner game (a port of
  [dino](https://github.com/easierbycode/dino)): runes-driven game state
  rendered declaratively with `<Container>`/`<Rectangle>`/`<Text>`, keyed
  `{#each}` obstacle spawning, `onGameEvent`/`onInputEvent`, and reactive
  theme/color customization. `cd examples/dino && npm install && npm run dev`.
  The deployable full-stack version (Deno Deploy + PostgreSQL leaderboard)
  lives at [dino-sp](https://github.com/easierbycode/dino-sp).

## Publishing

- **JSR**: `npx jsr publish` from this directory publishes the core layer as
  `@easierbycode/svelte-phaser` (see `jsr.json`). Run `npm install` here first
  so the bare `svelte`/`phaser` specifiers type-check, then validate with
  `npx jsr publish --dry-run`.
- **npm**: the package ships uncompiled `.svelte`/TS source, which
  `@sveltejs/vite-plugin-svelte` compiles in the consuming app (the `svelte`
  export condition points at the source). The unscoped `svelte-phaser` npm
  name is taken by the original project, so publishing to npm requires a
  scoped rename (e.g. `@easierbycode/svelte-phaser`) in package.json.

## Requirements

- svelte ^5.0
- phaser ^4.0
- For the component layer: a bundler with the Svelte plugin
  (e.g. Vite + `@sveltejs/vite-plugin-svelte`)
