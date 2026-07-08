<script lang="ts">
  import type { LeaderboardEntry } from '../lib/api'

  let {
    entries,
    error = false,
  }: { entries: LeaderboardEntry[] | null; error?: boolean } = $props()

  function rankClass(rank: number): string {
    if (rank === 1) return 'gold'
    if (rank === 2) return 'silver'
    if (rank === 3) return 'bronze'
    return ''
  }
</script>

<div class="leaderboard-list">
  {#if error}
    <div class="loading">Unable to load leaderboard. Check your connection.</div>
  {:else if entries === null}
    <div class="loading">Loading leaderboard...</div>
  {:else if entries.length === 0}
    <div class="loading">No scores yet. Be the first!</div>
  {:else}
    {#each entries as entry (entry.rank)}
      <div class="leaderboard-entry">
        <span class="leaderboard-rank {rankClass(entry.rank)}">
          #{entry.rank}
        </span>
        <span class="leaderboard-name">{entry.playerName}</span>
        <span class="leaderboard-score">{entry.score.toLocaleString()}</span>
      </div>
    {/each}
  {/if}
</div>
