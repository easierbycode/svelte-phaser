import { fetchSettings, saveSettings, type GameSettings } from './api'

export const THEMES: Record<string, { sky: string; ground: string }> = {
  desert: { sky: '#87CEEB', ground: '#DEB887' },
  forest: { sky: '#98FB98', ground: '#228B22' },
  night: { sky: '#191970', ground: '#2F4F4F' },
  rainbow: { sky: '#FF69B4', ground: '#FFD700' },
  space: { sky: '#000000', ground: '#696969' },
}

export const DIFFICULTY_MULTIPLIERS: Record<string, number> = {
  easy: 0.8,
  normal: 1.0,
  hard: 1.3,
}

const DEFAULT_SETTINGS: GameSettings = {
  dinoColor: '#4CAF50',
  backgroundTheme: 'desert',
  soundEnabled: true,
  difficultyPreference: 'normal',
}

// treat the legacy "null" localStorage artifact as no name, as the original did
const storedName = localStorage.getItem('playerName')

/**
 * The current player and their customization settings. Registered players are
 * persisted through the API; anonymous players fall back to localStorage —
 * same behavior as the original game.js.
 */
class PlayerState {
  name = $state<string | null>(
    storedName && storedName !== 'null' ? storedName : null
  )
  settings = $state<GameSettings>({ ...DEFAULT_SETTINGS })

  #loadToken = 0

  async load(): Promise<void> {
    // ignore this response if a newer load/save supersedes it mid-flight
    const token = ++this.#loadToken

    if (this.name) {
      const settings = await fetchSettings(this.name)
      if (settings && token === this.#loadToken) {
        this.settings = settings
      }
    } else {
      const saved = localStorage.getItem('gameSettings')
      if (saved) {
        try {
          this.settings = { ...this.settings, ...JSON.parse(saved) }
        } catch {
          // keep defaults if parsing fails
        }
      }
    }
  }

  async save(): Promise<void> {
    // supersede any in-flight load so it cannot clobber what was just saved
    this.#loadToken++

    if (this.name) {
      await saveSettings(this.name, { ...this.settings })
    } else {
      localStorage.setItem('gameSettings', JSON.stringify(this.settings))
    }
  }

  setName(name: string): void {
    this.name = name
    localStorage.setItem('playerName', name)
    this.load()
    console.log(`👤 Player name set: ${name}`)
  }
}

export const player = new PlayerState()
