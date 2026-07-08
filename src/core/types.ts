import type Phaser from 'phaser'

export interface InteractiveConfig {
  shape?: Phaser.Types.Input.InputConfiguration
  callback?: Phaser.Types.Input.HitAreaCallback
  dropZone?: boolean
}

/**
 * Props shared by every game object. All props are optional; omitted props
 * keep Phaser's defaults.
 */
export interface GameObjectProps {
  name?: string
  active?: boolean
  /** x position */
  x?: number
  /** y position */
  y?: number
  z?: number
  w?: number
  /** Sets both scaleX and scaleY */
  scale?: number
  scaleX?: number
  scaleY?: number
  /** Angle in degrees */
  angle?: number
  /** Rotation in radians */
  rotation?: number
  depth?: number
  alpha?: number
  blendMode?: Phaser.BlendModes | string | number
  flipX?: boolean
  flipY?: boolean
  originX?: number
  originY?: number
  scrollFactorX?: number
  scrollFactorY?: number
  visible?: boolean
  tint?: number
  interactive?: boolean | InteractiveConfig
  onpointerdown?: (
    pointer: Phaser.Input.Pointer,
    localX: number,
    localY: number,
    event: Phaser.Types.Input.EventData
  ) => void
  onpointerup?: (
    pointer: Phaser.Input.Pointer,
    localX: number,
    localY: number,
    event: Phaser.Types.Input.EventData
  ) => void
  onpointermove?: (
    pointer: Phaser.Input.Pointer,
    localX: number,
    localY: number,
    event: Phaser.Types.Input.EventData
  ) => void
  onpointerover?: (
    pointer: Phaser.Input.Pointer,
    localX: number,
    localY: number,
    event: Phaser.Types.Input.EventData
  ) => void
  onpointerout?: (
    pointer: Phaser.Input.Pointer,
    event: Phaser.Types.Input.EventData
  ) => void
  [key: string]: any
}

export interface SpriteProps extends GameObjectProps {
  /** The key of the texture to render with. Not required if `animation` is set. */
  texture?: string
  /** The texture frame to render with. */
  frame?: string | number
  /** The key of the animation to play (created via `scene.anims.create`). */
  animation?: string
  onanimationstart?: (
    animation: Phaser.Animations.Animation,
    frame: Phaser.Animations.AnimationFrame,
    gameObject: Phaser.GameObjects.Sprite
  ) => void
  onanimationcomplete?: (
    animation: Phaser.Animations.Animation,
    frame: Phaser.Animations.AnimationFrame,
    gameObject: Phaser.GameObjects.Sprite
  ) => void
  onanimationrepeat?: (
    animation: Phaser.Animations.Animation,
    frame: Phaser.Animations.AnimationFrame,
    gameObject: Phaser.GameObjects.Sprite
  ) => void
  onanimationstop?: (
    animation: Phaser.Animations.Animation,
    frame: Phaser.Animations.AnimationFrame,
    gameObject: Phaser.GameObjects.Sprite
  ) => void
}

export interface TextProps extends GameObjectProps {
  /** The text to display. */
  text?: string | string[]
  /** Alignment of lines: 'left', 'center', 'right' or 'justify'. */
  align?: string
  /** The text color, e.g. '#fff'. */
  color?: string
  fontFamily?: string
  /** The font size, e.g. '18px'. */
  fontSize?: string | number
  /** The font style, e.g. 'bold'. */
  fontStyle?: string
  backgroundColor?: string
  /** The stroke color. */
  stroke?: string
  strokeThickness?: number
  /** Extra spacing between lines, in pixels. */
  lineSpacing?: number
  /** Padding applied around the text, in pixels. */
  padding?: number | Phaser.Types.GameObjects.Text.TextPadding
  /** The width in pixels at which text wraps. */
  wordWrapWidth?: number
}

export interface TileSpriteProps extends GameObjectProps {
  /** The key of the texture to render with. */
  texture?: string
  /** The texture frame to render with. */
  frame?: string
  /** The width of the tile sprite, in pixels. */
  width?: number
  /** The height of the tile sprite, in pixels. */
  height?: number
  tilePositionX?: number
  tilePositionY?: number
  tileScaleX?: number
  tileScaleY?: number
}

export interface RectangleProps extends GameObjectProps {
  /** The width of the rectangle, in pixels. */
  width?: number
  /** The height of the rectangle, in pixels. */
  height?: number
  /** The fill color, e.g. 0xff0000. */
  fillColor?: number
  /** The fill alpha (0-1). */
  fillAlpha?: number
  strokeColor?: number
  strokeWidth?: number
}

export interface ContainerProps extends GameObjectProps {
  /** The width of the container (used for input and layout, not rendering). */
  width?: number
  /** The height of the container (used for input and layout, not rendering). */
  height?: number
}

/**
 * Arcade physics body props. All props are optional; omitted props keep
 * Phaser's defaults.
 */
export interface ArcadeBodyProps {
  /** Sets the body's horizontal and vertical acceleration, in pixels per second squared. */
  acceleration?: number
  accelerationX?: number
  accelerationY?: number
  /** Whether the body's velocity is affected by its drag. */
  allowDrag?: boolean
  /** Whether the body's position is affected by gravity (local or world). */
  allowGravity?: boolean
  /** Whether the body's rotation is affected by its angular acceleration and velocity. */
  allowRotation?: boolean
  angularAcceleration?: number
  angularDrag?: number
  angularVelocity?: number
  /** Rebound following a collision, relative to 1 (both axes). */
  bounce?: number
  bounceX?: number
  bounceY?: number
  /** Make the body a circle with the given radius and optional offset. */
  circle?: { radius: number; offsetX?: number; offsetY?: number }
  /** Whether the body collides with the world boundary. */
  collideWorldBounds?: boolean
  drag?: number
  dragX?: number
  dragY?: number
  friction?: number
  frictionX?: number
  frictionY?: number
  gravity?: number
  gravityX?: number
  gravityY?: number
  /** Whether the body can be moved by collisions with another body. */
  immovable?: boolean
  mass?: number
  maxAngular?: number
  maxSpeed?: number
  maxVelocityX?: number
  maxVelocityY?: number
  /** The width of the body, in pixels. Defaults to the game object's frame width. */
  width?: number
  /** The height of the body, in pixels. Defaults to the game object's frame height. */
  height?: number
  /** Place the body's center on its game object's center when sizing. */
  center?: boolean
  offsetX?: number
  offsetY?: number
  /** Emit a 'worldbounds' event on collision with the world boundary. */
  onWorldBounds?: boolean
  /** Whether the body can be pushed by another body. */
  pushable?: boolean
  /** Use exponential damping instead of linear drag for deceleration. */
  useDamping?: boolean
  /** The body's velocity, in pixels per second (both axes). */
  velocity?: number
  velocityX?: number
  velocityY?: number
}

export type CollisionTarget = string | Phaser.GameObjects.GameObject

export interface CollideEvent {
  self: Phaser.GameObjects.GameObject
  other: Phaser.GameObjects.GameObject
}

export interface ArcadeColliderProps {
  /**
   * What to collide with: a game object, a name (game objects are looked up
   * by their `name`), or an array of either. Objects added to the scene later
   * with a matching name are picked up automatically.
   */
  with: CollisionTarget | CollisionTarget[]
  /** Only check for overlap; don't physically separate the bodies. */
  overlapOnly?: boolean
  /** Called when the parent game object collides with a target. */
  oncollide?: (event: CollideEvent) => void
  /** Return false to skip the collision. */
  allowCollision?: (event: CollideEvent) => boolean
}
