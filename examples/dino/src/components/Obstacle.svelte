<script lang="ts">
  import { Container, Rectangle } from 'svelte-phaser'
  import type { ObstacleData } from '../lib/game.svelte'

  let { obstacle }: { obstacle: ObstacleData } = $props()

  const BODY_COLOR = 0x2e7d32
  const SPIKE_COLOR = 0x1b5e20
</script>

<Container x={obstacle.x} y={obstacle.y} depth={1}>
  <!-- main cactus body -->
  <Rectangle
    x={0}
    y={0}
    width={obstacle.width}
    height={obstacle.height}
    originX={0}
    originY={0}
    fillColor={BODY_COLOR}
  />
  <!-- spikes/arms per cactus type, offsets from the original renderer -->
  {#if obstacle.type === 'cactus-small'}
    <Rectangle x={-3} y={10} width={6} height={4} originX={0} originY={0} fillColor={SPIKE_COLOR} />
    <Rectangle x={obstacle.width - 3} y={20} width={6} height={4} originX={0} originY={0} fillColor={SPIKE_COLOR} />
  {:else if obstacle.type === 'cactus-medium'}
    <Rectangle x={-4} y={8} width={8} height={6} originX={0} originY={0} fillColor={SPIKE_COLOR} />
    <Rectangle x={obstacle.width - 4} y={15} width={8} height={6} originX={0} originY={0} fillColor={SPIKE_COLOR} />
    <Rectangle x={obstacle.width / 2 - 2} y={25} width={4} height={8} originX={0} originY={0} fillColor={SPIKE_COLOR} />
  {:else}
    <Rectangle x={-5} y={5} width={10} height={8} originX={0} originY={0} fillColor={SPIKE_COLOR} />
    <Rectangle x={obstacle.width - 5} y={10} width={10} height={8} originX={0} originY={0} fillColor={SPIKE_COLOR} />
    <Rectangle x={obstacle.width / 2 - 3} y={20} width={6} height={6} originX={0} originY={0} fillColor={SPIKE_COLOR} />
  {/if}
</Container>
