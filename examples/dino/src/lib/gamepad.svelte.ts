// Gamepad support via the browser Gamepad API. Button → action mapping is
// loaded from /codemonkey.json (see public/codemonkey.json); by default the
// bottom face button (A / ✕, standard-mapping index 0) jumps.

export type GamepadAction = 'jump' | 'fullscreen'

/** Standard-mapping button indexes (https://w3.org/TR/gamepad/#remapping). */
export const BUTTON_INDEXES: Record<string, number> = {
  FACE_BOTTOM: 0,
  FACE_RIGHT: 1,
  FACE_LEFT: 2,
  FACE_TOP: 3,
  L1: 4,
  R1: 5,
  L2: 6,
  R2: 7,
  SELECT: 8,
  START: 9,
  L3: 10,
  R3: 11,
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15,
}

/** Display glyphs for UI hints (Xbox-style face labels). */
export const BUTTON_GLYPHS: Record<string, string> = {
  FACE_BOTTOM: 'Ⓐ',
  FACE_RIGHT: 'Ⓑ',
  FACE_LEFT: 'Ⓧ',
  FACE_TOP: 'Ⓨ',
  L1: 'L1',
  R1: 'R1',
  L2: 'L2',
  R2: 'R2',
  SELECT: 'Select',
  START: 'Start',
  L3: 'L3',
  R3: 'R3',
  DPAD_UP: '✛↑',
  DPAD_DOWN: '✛↓',
  DPAD_LEFT: '✛←',
  DPAD_RIGHT: '✛→',
}

const DEFAULT_BUTTON_MAP: Record<number, GamepadAction> = {
  [BUTTON_INDEXES.FACE_BOTTOM]: 'jump',
}

class GamepadState {
  connected = $state(false)
  id = $state('')
  /** button index → action, from codemonkey.json */
  buttonMap = $state<Record<number, GamepadAction>>({ ...DEFAULT_BUTTON_MAP })

  /** Fired once per mapped button press (edge-triggered from poll()). */
  onaction: ((action: GamepadAction) => void) | null = null

  #index: number | null = null
  #down = new Set<number>()

  /** The configured button name for an action, e.g. 'FACE_BOTTOM' for 'jump'. */
  buttonNameFor(action: GamepadAction): string | null {
    for (const [index, mapped] of Object.entries(this.buttonMap)) {
      if (mapped === action) {
        for (const [name, i] of Object.entries(BUTTON_INDEXES)) {
          if (i === Number(index)) return name
        }
      }
    }
    return null
  }

  /** UI glyph for an action's configured button, e.g. 'Ⓐ'. */
  glyphFor(action: GamepadAction): string {
    const name = this.buttonNameFor(action)
    return (name && BUTTON_GLYPHS[name]) || '🎮'
  }

  /**
   * Starts listening for connections and loads the codemonkey.json mapping.
   * Returns a cleanup function.
   */
  init(): () => void {
    const onConnect = (event: GamepadEvent) => this.#adopt(event.gamepad)

    const onDisconnect = (event: GamepadEvent) => {
      if (event.gamepad.index === this.#index) {
        this.#index = null
        this.connected = false
        this.id = ''
        this.#down.clear()
        console.log('🎮 Gamepad disconnected')

        // adopt another still-connected pad, if any (its 'gamepadconnected'
        // event fired long ago and will not fire again)
        for (const pad of navigator.getGamepads?.() ?? []) {
          if (pad && pad.index !== event.gamepad.index) {
            this.#adopt(pad)
            break
          }
        }
      }
    }

    window.addEventListener('gamepadconnected', onConnect)
    window.addEventListener('gamepaddisconnected', onDisconnect)

    // adopt a pad that was connected before this page loaded
    for (const pad of navigator.getGamepads?.() ?? []) {
      if (pad) {
        this.#adopt(pad)
        break
      }
    }

    this.#loadConfig()

    return () => {
      window.removeEventListener('gamepadconnected', onConnect)
      window.removeEventListener('gamepaddisconnected', onDisconnect)
    }
  }

  /**
   * Samples the pad and fires onaction on fresh presses. The Gamepad API is
   * poll-based — call this once per game step.
   */
  poll(): void {
    if (this.#index === null) return

    const pad = navigator.getGamepads?.()[this.#index]
    if (!pad) return

    for (const [indexKey, action] of Object.entries(this.buttonMap)) {
      const index = Number(indexKey)
      const pressed = pad.buttons[index]?.pressed ?? false

      if (pressed && !this.#down.has(index)) {
        this.#down.add(index)
        this.onaction?.(action)
      } else if (!pressed) {
        this.#down.delete(index)
      }
    }
  }

  #adopt(pad: Gamepad): void {
    if (this.#index !== null) return

    this.#index = pad.index
    this.id = pad.id
    this.connected = true
    console.log(`🎮 Gamepad connected: ${pad.id}`)
  }

  async #loadConfig(): Promise<void> {
    try {
      const response = await fetch('/codemonkey.json')
      if (!response.ok) return

      const config = await response.json()
      const buttons = config?.gamepad?.buttons
      if (!buttons) return

      const map: Record<number, GamepadAction> = {}
      for (const [name, action] of Object.entries(buttons)) {
        const index = BUTTON_INDEXES[name]
        if (index !== undefined && (action === 'jump' || action === 'fullscreen')) {
          map[index] = action
        }
      }

      if (Object.keys(map).length > 0) {
        this.buttonMap = map
        console.log('🎮 Gamepad mapping loaded from codemonkey.json:', buttons)
      }
    } catch {
      // no config — keep the default mapping
    }
  }
}

export const gamepad = new GamepadState()
