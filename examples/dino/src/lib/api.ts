// Thin client for the Oak API server (see src/ at the repo root). Every
// helper fails soft — the game stays fully playable without a server.

export interface GameSettings {
  dinoColor: string
  backgroundTheme: string
  soundEnabled: boolean
  difficultyPreference: string
}

export interface LeaderboardEntry {
  rank: number
  playerName: string
  score: number
  obstaclesAvoided: number
  avatarUrl?: string | null
  date: string
}

export interface ScoreSubmission {
  playerName: string
  score: number
  obstaclesAvoided: number
  gameDuration: number
  maxSpeed: number
}

export interface ScoreResult {
  success: boolean
  globalRank: number
  isNewRecord: boolean
}

export async function checkHealth(): Promise<void> {
  try {
    const response = await fetch('/api/health')
    const data = await response.json()
    console.log('🎉 Server health check:', data)
  } catch (error) {
    console.error('❌ Health check failed:', error)
  }
}

/** Fetches the global leaderboard. Throws when the server is unreachable. */
export async function fetchLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const response = await fetch(`/api/leaderboard?limit=${limit}`)
  if (!response.ok) {
    throw new Error(`Leaderboard request failed: ${response.status}`)
  }
  const data = await response.json()
  if (!data.success || !data.leaderboard) {
    throw new Error(data.error || 'Failed to load leaderboard')
  }
  return data.leaderboard
}

export async function submitScore(
  submission: ScoreSubmission
): Promise<ScoreResult | null> {
  try {
    const response = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error('Failed to submit score:', error)
    return null
  }
}

export async function fetchSettings(
  playerName: string
): Promise<GameSettings | null> {
  try {
    const response = await fetch(
      `/api/customization/${encodeURIComponent(playerName)}`
    )
    if (!response.ok) return null
    const data = await response.json()
    return data.settings ?? null
  } catch (error) {
    console.log('Using default settings:', error)
    return null
  }
}

export async function saveSettings(
  playerName: string,
  settings: GameSettings
): Promise<void> {
  try {
    await fetch('/api/customization', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName, ...settings }),
    })
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}
