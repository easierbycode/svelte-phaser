<script lang="ts">
  import { onMount } from 'svelte'
  import { fetchLeaderboard, type LeaderboardEntry } from '../lib/api'

  let entries = $state<LeaderboardEntry[] | null>(null)
  let error = $state(false)
  let refreshing = $state(false)
  let lastUpdated = $state('')

  async function load() {
    try {
      entries = await fetchLeaderboard(50)
      error = false
      lastUpdated = `Last updated: ${new Date().toLocaleTimeString()}`
    } catch (err) {
      console.error('Error loading leaderboard:', err)
      error = true
    }
  }

  async function refresh() {
    refreshing = true
    entries = null
    error = false
    await load()
    refreshing = false
  }

  onMount(() => {
    load()
    // auto-refresh every 30 seconds, as the original page did
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  })

  function getPlayerInitials(name: string): string {
    return name.slice(0, 2).toUpperCase()
  }

  function playerInitialsToColor(name: string): string {
    const firstChar = name.charCodeAt(0)
    const hue = (firstChar * 7) % 360
    return `hsl(${hue}, 70%, 50%)`
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
</script>

<main class="leaderboard-container">
  <header>
    <h1>🏆 Global Leaderboard</h1>
    <p>Top players from around the world</p>
  </header>
  <nav>
    <a href="/" class="btn">🎮 Play Game</a>
    <button onclick={refresh} class="btn btn-secondary refresh-btn">
      🔄 Refresh
    </button>
  </nav>

  <section class="container">
    {#if error}
      <div class="error">
        <h3>⚠️ Unable to load leaderboard</h3>
        <p>Please check your connection and try again.</p>
        <button onclick={refresh} class="btn refresh-btn">🔄 Try Again</button>
      </div>
    {:else if entries === null}
      <div class="loading">
        <div>{refreshing ? '🔄 Refreshing leaderboard...' : '🦕 Loading leaderboard...'}</div>
      </div>
    {:else if entries.length === 0}
      <div class="empty-state">
        <h3>🎯 No scores yet!</h3>
        <p>Be the first to set a high score!</p>
        <a href="/" class="btn">🎮 Start Playing</a>
      </div>
    {:else}
      <div class="leaderboard-grid">
        <h4 class="tl">Rank</h4>
        <h4 class="tl">Player</h4>
        <h4>Score</h4>
        <h4>Obstacles</h4>
        <h4>Date</h4>

        {#each entries as entry (entry.rank)}
          <span class="tl rank-{entry.rank <= 3 ? entry.rank : ''}">
            #{entry.rank}
          </span>

          <div class="player tl">
            <span
              class="avatar"
              style="background-color: {playerInitialsToColor(
                entry.playerName
              )};"
            >
              {getPlayerInitials(entry.playerName)}
            </span>
            <span>{entry.playerName}</span>
          </div>

          <span>{entry.score.toLocaleString()}</span>
          <span>{entry.obstaclesAvoided || 0}</span>
          <span>{formatDate(entry.date)}</span>
        {/each}
      </div>
    {/if}
  </section>

  <div class="last-updated">{lastUpdated}</div>
</main>
