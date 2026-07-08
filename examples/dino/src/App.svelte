<script lang="ts">
  import GamePage from './pages/GamePage.svelte'
  import LeaderboardPage from './pages/LeaderboardPage.svelte'

  // Two server-rendered entry points, same SPA bundle — matches the original
  // two-page layout (index.html + leaderboard.html)
  const isLeaderboard =
    location.pathname.replace(/\/+$/, '') === '/leaderboard'
</script>

{#if isLeaderboard}
  <LeaderboardPage />
{:else}
  <GamePage />
{/if}
