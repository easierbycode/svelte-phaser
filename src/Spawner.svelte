<script lang="ts">
  import type { Snippet } from 'svelte'
  import { createSpawner } from './core/hooks'

  interface Props {
    children?: Snippet
  }

  let { children }: Props = $props()

  createSpawner()
</script>

{@render children?.()}
