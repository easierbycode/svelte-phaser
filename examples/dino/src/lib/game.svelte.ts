// Dino Runner game logic — a faithful port of the original canvas game.js,
// expressed as reactive Svelte 5 state. Rendering is left entirely to
// svelte-phaser components reading this state.

export type GameStatus = 'waiting' | 'playing' | 'gameOver'

export type ObstacleType = 'cactus-small' | 'cactus-medium' | 'cactus-wide'

export interface ObstacleData {
  id: number
  x: number
  y: number
  width: number
  height: number
  type: ObstacleType
}

export interface GameOverStats {
  score: number
  obstaclesAvoided: number
  gameDuration: number
  maxSpeed: number
}

const OBSTACLE_TYPES: ReadonlyArray<{
  width: number
  height: number
  type: ObstacleType
}> = [
  { width: 20, height: 40, type: 'cactus-small' },
  { width: 25, height: 50, type: 'cactus-medium' },
  { width: 30, height: 35, type: 'cactus-wide' },
]

// The original game ran its physics per requestAnimationFrame tick and tuned
// every constant for 60fps. Steps are normalized to "60fps frames" so those
// constants carry over unchanged and the game speed no longer depends on the
// display's refresh rate.
const FRAME_MS = 1000 / 60
const MAX_FRAMES_PER_STEP = 3

export class DinoGame {
  static readonly WIDTH = 800
  static readonly HEIGHT = 200
  /** y of the ground line the dino runs on */
  static readonly GROUND_Y = 180

  status = $state<GameStatus>('waiting')
  score = $state(0)
  highScore = $state(0)
  /** Accumulated 60fps-equivalent frames — drives the leg-run animation. */
  frameCount = $state(0)
  obstacles = $state<ObstacleData[]>([])
  dino = $state({
    x: 50,
    y: 150,
    width: 40,
    height: 40,
    velocityY: 0,
    isJumping: false,
    groundY: 150,
  })

  // physics (px per 60fps frame, as in the original)
  gravity = 0.6
  jumpStrength = -12
  gameSpeed = 3
  initialGameSpeed = 3

  // obstacle spawning (in 60fps frames)
  obstacleSpawnTimer = 0
  obstacleSpawnRate = 120
  minObstacleSpawnRate = 60

  // per-run stats
  obstaclesAvoided = 0
  gameStartTime = 0
  maxSpeedReached = 0

  /** Called once when a run ends, with the stats the API expects. */
  ongameover?: (stats: GameOverStats) => void

  #nextObstacleId = 0

  constructor() {
    this.highScore = parseInt(localStorage.getItem('dinoHighScore') ?? '') || 0
  }

  /** Port of applyCustomizations' difficulty handling. */
  setDifficulty(multiplier: number): void {
    this.initialGameSpeed = 3 * multiplier
    this.gameSpeed = this.initialGameSpeed
  }

  /** One handler for click / tap / Space / ArrowUp, as in the original. */
  handleJump(): void {
    if (this.status === 'waiting') {
      this.startGame()
    } else if (this.status === 'playing' && !this.dino.isJumping) {
      this.jump()
    } else if (this.status === 'gameOver') {
      this.reset()
    }
  }

  startGame(): void {
    this.status = 'playing'
    this.score = 0
    this.obstaclesAvoided = 0
    this.gameStartTime = Date.now()
    this.maxSpeedReached = this.gameSpeed
    this.gameSpeed = this.initialGameSpeed
    this.obstacles = []
    this.obstacleSpawnTimer = 0
    this.frameCount = 0
    console.log('🎮 Game started!')
  }

  jump(): void {
    if (!this.dino.isJumping) {
      this.dino.velocityY = this.jumpStrength
      this.dino.isJumping = true
    }
  }

  reset(): void {
    this.status = 'waiting'
    this.score = 0
    this.gameSpeed = this.initialGameSpeed
    this.obstacles = []
    this.obstacleSpawnTimer = 0
    this.frameCount = 0
    this.dino.y = this.dino.groundY
    this.dino.velocityY = 0
    this.dino.isJumping = false
    console.log('🔄 Game reset!')
  }

  /** Advances the simulation by one game step of `deltaMs` milliseconds. */
  step(deltaMs: number): void {
    if (this.status !== 'playing') return

    const frames = Math.min(deltaMs / FRAME_MS, MAX_FRAMES_PER_STEP)
    this.frameCount += frames

    // dino physics
    this.dino.velocityY += this.gravity * frames
    this.dino.y += this.dino.velocityY * frames

    if (this.dino.y >= this.dino.groundY) {
      this.dino.y = this.dino.groundY
      this.dino.velocityY = 0
      this.dino.isJumping = false
    }

    // continuous scoring
    this.score += 0.1 * frames

    // spawn obstacles
    this.obstacleSpawnTimer += frames
    if (this.obstacleSpawnTimer >= this.obstacleSpawnRate) {
      this.spawnObstacle()
      this.obstacleSpawnTimer = 0
    }

    // move obstacles, award points for the ones that scroll off
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i]
      obstacle.x -= this.gameSpeed * frames

      if (obstacle.x + obstacle.width < 0) {
        this.obstacles.splice(i, 1)
        this.obstaclesAvoided++
        this.score += 10
      }
    }

    // collisions
    for (const obstacle of this.obstacles) {
      if (
        this.dino.x < obstacle.x + obstacle.width &&
        this.dino.x + this.dino.width > obstacle.x &&
        this.dino.y < obstacle.y + obstacle.height &&
        this.dino.y + this.dino.height > obstacle.y
      ) {
        this.gameOver()
        return
      }
    }

    // difficulty ramps every 200 points
    const difficultyLevel = Math.floor(this.score / 200)
    this.gameSpeed = this.initialGameSpeed + difficultyLevel * 0.5
    this.maxSpeedReached = Math.max(this.maxSpeedReached, this.gameSpeed)
    this.obstacleSpawnRate = Math.max(
      this.minObstacleSpawnRate,
      120 - difficultyLevel * 10
    )
  }

  spawnObstacle(): void {
    const template =
      OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)]

    this.obstacles.push({
      id: this.#nextObstacleId++,
      x: DinoGame.WIDTH,
      y: DinoGame.GROUND_Y - template.height,
      width: template.width,
      height: template.height,
      type: template.type,
    })
  }

  gameOver(): void {
    this.status = 'gameOver'
    const gameDuration = Math.floor((Date.now() - this.gameStartTime) / 1000)
    const finalScore = Math.floor(this.score)

    if (finalScore > this.highScore) {
      this.highScore = finalScore
      localStorage.setItem('dinoHighScore', String(this.highScore))
      console.log(`🏆 New High Score: ${this.highScore}!`)
    }

    console.log(
      `💀 Game Over! Final Score: ${finalScore} (${this.obstaclesAvoided} obstacles avoided)`
    )

    this.ongameover?.({
      score: finalScore,
      obstaclesAvoided: this.obstaclesAvoided,
      gameDuration,
      maxSpeed: this.maxSpeedReached,
    })
  }
}
