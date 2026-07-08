# 🦕 Dino Runner — svelte-phaser example

A complete dino-runner game built with the svelte-phaser **component layer**:
the whole game simulation lives in a reactive Svelte 5 state class
([src/lib/game.svelte.ts](src/lib/game.svelte.ts)), and the Phaser scene is
*declared* from that state:

```svelte
<Game width={800} height={200} parent={frame} transparent={true}>
  <Scene key="dino">
    <Rectangle ... />                     <!-- ground line -->
    {#each game.obstacles as obstacle (obstacle.id)}
      <Obstacle {obstacle} />             <!-- cactus containers -->
    {/each}
    <Dino {game} />                       <!-- dino container -->
    {#if game.status === 'gameOver'} ... {/if}
  </Scene>
</Game>
```

What it demonstrates:

- `<Game>` (with `bind:instance`, `parent`, `transparent`), `<Scene>`
- `<Container>` / `<Rectangle>` / `<Text>` game objects driven by runes state —
  positions, sizes, colors, and visibility all update reactively
- `onGameEvent('step', ...)` to advance the simulation once per game step
- `onInputEvent('pointerdown', ...)` for canvas input
- keyed `{#each}` blocks spawning/despawning Phaser objects (cacti)
- `{#if}` blocks mounting/unmounting overlays (waiting text, game-over screen)
- Phaser `Scale.FIT` + the Fullscreen API (⛶ button or <kbd>F</kbd>), with the
  HTML HUD overlaid inside the fullscreened element
- Gamepad support polled on the game step — the UI adapts when a controller
  connects, and button mapping loads from `public/codemonkey.json`
  (`FACE_BOTTOM` → `jump` by default)

## Run it

```sh
npm install
npm run dev
```

`svelte-phaser` is consumed from this repo via `file:../..` — no publish step
needed.

## Leaderboard API (optional)

The game is a port of [dino](https://github.com/easierbycode/dino), whose full
deployment ([dino-sp](https://github.com/easierbycode/dino-sp)) pairs it with a
Deno + Oak + PostgreSQL API for global leaderboards and player settings. The
Vite dev server proxies `/api` to `localhost:8004` if you run that server;
without it, the game is fully playable and the leaderboard/settings features
degrade gracefully to localStorage.
