<script lang="ts">
  import { onMount } from 'svelte'
  import {
    checkHealth,
    fetchLeaderboard,
    submitScore,
    type LeaderboardEntry,
  } from '../lib/api'
  import { DinoGame, type GameOverStats } from '../lib/game.svelte'
  import { gamepad } from '../lib/gamepad.svelte'
  import { DIFFICULTY_MULTIPLIERS, player } from '../lib/settings.svelte'
  import CustomizationModal from '../components/CustomizationModal.svelte'
  import GameCanvas from '../components/GameCanvas.svelte'
  import LeaderboardPanel from '../components/LeaderboardPanel.svelte'
  import PlayerModal from '../components/PlayerModal.svelte'

  const game = new DinoGame()

  // handy for debugging from the console, as the original game.js did
  ;(window as any).dinoGame = game
  ;(window as any).resetPlayerData = () => {
    localStorage.removeItem('playerName')
    localStorage.removeItem('gameSettings')
    localStorage.removeItem('dinoHighScore')
    location.reload()
  }

  let gameCanvas = $state<ReturnType<typeof GameCanvas>>()
  let leaderboard = $state<LeaderboardEntry[] | null>(null)
  let leaderboardError = $state(false)
  let showPlayerModal = $state(false)
  let showCustomization = $state(false)
  let showNewRecord = $state(false)

  // difficulty follows the customization settings (port of applyCustomizations)
  $effect(() => {
    game.setDifficulty(
      DIFFICULTY_MULTIPLIERS[player.settings.difficultyPreference] ?? 1.0
    )
  })

  async function loadLeaderboard() {
    try {
      leaderboard = await fetchLeaderboard(5)
      leaderboardError = false
    } catch (error) {
      console.log('Failed to load leaderboard:', error)
      leaderboardError = true
    }
  }

  game.ongameover = async (stats: GameOverStats) => {
    if (!player.name) return

    const result = await submitScore({ playerName: player.name, ...stats })
    if (result) {
      if (result.isNewRecord) {
        console.log('🏆 NEW GLOBAL RECORD!')
        showNewRecord = true
        setTimeout(() => (showNewRecord = false), 3000)
      }
      console.log(`📊 Score submitted! Global rank: #${result.globalRank}`)
      loadLeaderboard()
    }
  }

  onMount(() => {
    checkHealth()
    player.load()
    loadLeaderboard()

    // gamepad: bottom face button jumps by default; see public/codemonkey.json
    const cleanupGamepad = gamepad.init()
    gamepad.onaction = (action) => {
      if (action === 'jump') {
        game.handleJump()
      } else if (action === 'fullscreen') {
        gameCanvas?.toggleFullscreen()
      }
    }

    // prompt for a player name shortly after load, as the original did
    let timer: ReturnType<typeof setTimeout> | undefined
    if (!player.name) {
      timer = setTimeout(() => (showPlayerModal = true), 1000)
    }

    return () => {
      cleanupGamepad()
      gamepad.onaction = null
      clearTimeout(timer)
    }
  })

  function onKeydown(event: KeyboardEvent) {
    // let players type in the modals
    const target = event.target as HTMLElement
    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) {
      return
    }

    if (event.code === 'KeyF') {
      gameCanvas?.toggleFullscreen()
      return
    }

    if (event.code !== 'Space' && event.code !== 'ArrowUp') return

    event.preventDefault()
    game.handleJump()
  }
</script>

<svelte:window onkeydown={onKeydown} />

<main>
  <h1>🦕 Dino Runner</h1>

  <section class="container">
    <h2>svelte-phaser Edition</h2>
    <p>
      Complete game with global leaderboards! Jump over cacti, beat your high
      score, and compete with players worldwide. Use <kbd>Space</kbd>
      or <kbd>↑</kbd> to jump. Customize your dino and track your progress!
    </p>
  </section>

  <section class="container canvas-container">
    <GameCanvas bind:this={gameCanvas} {game} />
    <button
      onclick={() => (showCustomization = true)}
      class="btn btn-primary btn-block"
    >
      Customize Game
    </button>
  </section>

  <section class="container">
    <h3>Controls</h3>
    <div class="control-grid" class:with-gamepad={gamepad.connected}>
      <kbd>Space</kbd>
      <kbd>↑</kbd>
      <span class="click">🖱️ Click</span>
      {#if gamepad.connected}
        <span class="click">🎮 {gamepad.glyphFor('jump')}</span>
      {/if}
      <span>Jump</span>
      <span>Jump</span>
      <span>Start/Jump</span>
      {#if gamepad.connected}
        <span>Jump</span>
      {/if}
    </div>
    {#if gamepad.connected}
      <p><small>🎮 {gamepad.id} connected — mapping from
        <code>codemonkey.json</code></small></p>
    {/if}
  </section>

  <section class="container">
    <h3>Global Leaderboard</h3>
    <div class="leaderboard-container">
      <LeaderboardPanel entries={leaderboard} error={leaderboardError} />
      <div style="text-align: center; margin-top: 15px">
        <a href="/leaderboard" class="btn btn-primary btn-block">
          View Full Leaderboard
        </a>
      </div>
    </div>
  </section>

  <section class="container">
    <h3>Built with svelte-phaser</h3>
    <div class="feature-grid">
      <div class="feature-item">
        <p class="icon">🎮</p>
        <strong>Declarative Game Objects</strong>
        <p>
          The dino, cacti, and overlays are Svelte components rendering Phaser
          game objects
        </p>
      </div>
      <div class="feature-item">
        <p class="icon">⚡</p>
        <strong>Runes-Powered State</strong>
        <p>Game physics live in reactive Svelte 5 state the scene renders from</p>
      </div>
      <div class="feature-item">
        <p class="icon">🏅</p>
        <strong>Global Leaderboard</strong>
        <p>Compete with players worldwide using PostgreSQL database</p>
      </div>
      <div class="feature-item">
        <p class="icon">💅</p>
        <strong>Player Customization</strong>
        <p>Personalize your dino color, background themes, and difficulty</p>
      </div>
    </div>
  </section>

  <section class="container status">
    <h3>Server Status</h3>
    <p>
      Server health check: <a href="/api/health" target="_blank">
        Health Check Endpoint</a>
    </p>
    <p>
      <small>Should return:
        <code>{'{'}"status": "ok", "message": "🦕 dino-sp - Dino server is
          healthy!"{'}'}</code></small>
    </p>
  </section>
</main>

{#if showNewRecord}
  <div class="new-record-message">🏆 NEW GLOBAL RECORD! 🏆</div>
{/if}

<PlayerModal bind:open={showPlayerModal} />
<CustomizationModal bind:open={showCustomization} />
