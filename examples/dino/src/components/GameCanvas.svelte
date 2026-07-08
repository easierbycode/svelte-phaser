<script lang="ts">
  import Phaser from 'phaser'
  import { Game, Scene } from 'svelte-phaser'
  import { DinoGame } from '../lib/game.svelte'
  import { gamepad } from '../lib/gamepad.svelte'
  import { player, THEMES } from '../lib/settings.svelte'
  import GameScene from './GameScene.svelte'

  let { game }: { game: DinoGame } = $props()

  let frame = $state<HTMLDivElement>()
  let phaser = $state<Phaser.Game>()
  let isFullscreen = $state(false)
  let viewportWidth = $state(0)
  let viewportHeight = $state(0)

  // handy for debugging from the console
  $effect(() => {
    ;(window as any).__phaser = phaser
  })

  const theme = $derived(
    THEMES[player.settings.backgroundTheme] ?? THEMES.desert
  )

  // The theme gradient splits sky/ground at 75% of the canvas — exactly as the
  // original styled its canvas. In fullscreen the canvas is letterboxed
  // (Scale.FIT), so the split is recomputed to line up with the scaled canvas.
  const groundStop = $derived.by(() => {
    if (!isFullscreen || !viewportWidth || !viewportHeight) return 75
    const canvasHeight = Math.min(
      viewportWidth / (DinoGame.WIDTH / DinoGame.HEIGHT),
      viewportHeight
    )
    const groundY = (viewportHeight - canvasHeight) / 2 + canvasHeight * 0.75
    return (groundY / viewportHeight) * 100
  })

  const background = $derived(
    `linear-gradient(to bottom, ${theme.sky} 0%, ${theme.sky} ${groundStop}%, ${theme.ground} ${groundStop}%, ${theme.ground} 100%)`
  )

  const statusMessage = $derived(
    game.status === 'waiting'
      ? 'Click to Start!'
      : game.status === 'gameOver'
        ? 'Game Over! Click to restart'
        : ''
  )

  export function toggleFullscreen(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      // may be rejected without a user gesture (e.g. from a gamepad button)
      frame?.requestFullscreen()?.catch((error) => {
        console.log('Fullscreen request rejected:', error)
      })
    }
  }
</script>

<svelte:window
  bind:innerWidth={viewportWidth}
  bind:innerHeight={viewportHeight}
/>
<svelte:document
  onfullscreenchange={() => (isFullscreen = document.fullscreenElement === frame)}
/>

<div class="game-frame" bind:this={frame} style:background>
  {#if frame}
    <Game
      bind:instance={phaser}
      width={DinoGame.WIDTH}
      height={DinoGame.HEIGHT}
      parent={frame}
      transparent={true}
      banner={false}
      scale={{
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      }}
    >
      <Scene key="dino">
        <GameScene {game} />
      </Scene>
    </Game>
  {/if}

  <!-- HUD lives inside the frame so it stays visible in fullscreen -->
  <div class="game-ui">
    <div class="score">Score: <span>{Math.floor(game.score)}</span></div>
    <div class="high-score">High Score: <span>{game.highScore}</span></div>
    {#if gamepad.connected}
      <div class="gamepad-chip" title={gamepad.id}>
        🎮 {gamepad.glyphFor('jump')} = Jump
      </div>
    {/if}
    {#if statusMessage}
      <div class="btn btn-primary" id="gameStatus">{statusMessage}</div>
    {/if}
    <button
      class="btn fullscreen-btn"
      onclick={toggleFullscreen}
      title="Fullscreen (F)"
      aria-label="Toggle fullscreen"
    >⛶</button>
  </div>
</div>

<style>
  .game-frame {
    position: relative;
    width: 800px;
    max-width: 100%;
    aspect-ratio: 4 / 1;
    margin: 0 auto;
    cursor: pointer;
  }

  .game-frame:fullscreen {
    width: 100%;
    height: 100%;
    aspect-ratio: auto;
  }

  .game-frame :global(canvas) {
    display: block;
  }
</style>
