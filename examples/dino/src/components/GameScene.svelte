<script lang="ts">
  import { onGameEvent, onInputEvent, Rectangle, Text } from 'svelte-phaser'
  import { DinoGame } from '../lib/game.svelte'
  import { gamepad } from '../lib/gamepad.svelte'
  import Dino from './Dino.svelte'
  import Obstacle from './Obstacle.svelte'

  let { game }: { game: DinoGame } = $props()

  // one simulation step per Phaser game step; the Gamepad API is poll-based,
  // so sample it on the same cadence
  onGameEvent('step', (_time: number, delta: number) => {
    gamepad.poll()
    game.step(delta)
  })

  // click / tap on the canvas starts, jumps, or restarts
  onInputEvent('pointerdown', () => game.handleJump())

  const finalScore = $derived(Math.floor(game.score))

  const jumpHint = $derived(
    gamepad.connected
      ? `Press SPACE, ↑ or ${gamepad.glyphFor('jump')} to jump!`
      : 'Press SPACE or ↑ to jump!'
  )
</script>

<!-- ground line -->
<Rectangle
  x={0}
  y={DinoGame.GROUND_Y - 1}
  width={DinoGame.WIDTH}
  height={2}
  originX={0}
  originY={0}
  fillColor={0x8b4513}
  depth={0}
/>

{#each game.obstacles as obstacle (obstacle.id)}
  <Obstacle {obstacle} />
{/each}

<Dino {game} />

{#if game.status === 'waiting'}
  <Text
    x={400}
    y={80}
    originX={0.5}
    originY={1}
    depth={10}
    text={jumpHint}
    fontFamily="Arial"
    fontSize={24}
    color="rgba(0, 0, 0, 0.7)"
  />
  <Text
    x={400}
    y={110}
    originX={0.5}
    originY={1}
    depth={10}
    text="Click anywhere to start"
    fontFamily="Arial"
    fontSize={16}
    color="rgba(0, 0, 0, 0.7)"
  />
{/if}

{#if game.status === 'gameOver'}
  <Rectangle
    x={0}
    y={0}
    width={DinoGame.WIDTH}
    height={DinoGame.HEIGHT}
    originX={0}
    originY={0}
    fillColor={0x000000}
    fillAlpha={0.8}
    depth={20}
  />
  <Text
    x={400}
    y={60}
    originX={0.5}
    originY={1}
    depth={21}
    text="GAME OVER"
    fontFamily="Arial"
    fontSize={36}
    color="#FFFFFF"
  />
  <Text
    x={400}
    y={95}
    originX={0.5}
    originY={1}
    depth={21}
    text={`Final Score: ${finalScore}`}
    fontFamily="Arial"
    fontSize={20}
    color="#FFFFFF"
  />
  {#if finalScore === game.highScore && game.highScore > 0}
    <Text
      x={400}
      y={125}
      originX={0.5}
      originY={1}
      depth={21}
      text="🏆 NEW HIGH SCORE! 🏆"
      fontFamily="Arial"
      fontSize={20}
      color="#FFD700"
    />
  {:else if game.highScore > 0}
    <Text
      x={400}
      y={125}
      originX={0.5}
      originY={1}
      depth={21}
      text={`High Score: ${game.highScore}`}
      fontFamily="Arial"
      fontSize={20}
      color="#CCCCCC"
    />
  {/if}
  <Text
    x={400}
    y={155}
    originX={0.5}
    originY={1}
    depth={21}
    text="Click or press SPACE to restart"
    fontFamily="Arial"
    fontSize={16}
    color="#FFFFFF"
  />
{/if}
