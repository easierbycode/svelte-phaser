<script lang="ts">
  import { Container, Rectangle } from 'svelte-phaser'
  import { darkenColor, hexToNumber } from '../lib/colors'
  import type { DinoGame } from '../lib/game.svelte'
  import { player } from '../lib/settings.svelte'

  let { game }: { game: DinoGame } = $props()

  const bodyColor = $derived(hexToNumber(player.settings.dinoColor))
  const faceColor = $derived(
    hexToNumber(darkenColor(player.settings.dinoColor, 20))
  )

  const running = $derived(game.status === 'playing' && !game.dino.isJumping)
  const legOffset = $derived(
    running ? (Math.floor(game.frameCount / 10) % 2) * 2 : 0
  )
</script>

<Container x={game.dino.x} y={game.dino.y} depth={5}>
  <!-- body -->
  <Rectangle
    x={0}
    y={0}
    width={40}
    height={40}
    originX={0}
    originY={0}
    fillColor={bodyColor}
  />
  <!-- eye -->
  <Rectangle
    x={25}
    y={8}
    width={4}
    height={4}
    originX={0}
    originY={0}
    fillColor={faceColor}
  />
  <!-- mouth -->
  <Rectangle
    x={30}
    y={20}
    width={8}
    height={2}
    originX={0}
    originY={0}
    fillColor={faceColor}
  />
  <!-- legs, with the run cycle from the original -->
  <Rectangle
    x={10}
    y={40 + legOffset}
    width={6}
    height={8 - legOffset}
    originX={0}
    originY={0}
    fillColor={bodyColor}
    visible={!game.dino.isJumping}
  />
  <Rectangle
    x={24}
    y={40 - legOffset}
    width={6}
    height={8 + legOffset}
    originX={0}
    originY={0}
    fillColor={bodyColor}
    visible={!game.dino.isJumping}
  />
</Container>
