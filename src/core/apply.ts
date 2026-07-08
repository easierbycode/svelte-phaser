import type Phaser from 'phaser'
import type {
  ArcadeBodyProps,
  ContainerProps,
  GameObjectProps,
  RectangleProps,
  SpriteProps,
  TextProps,
  TileSpriteProps,
} from './types.ts'

/**
 * Remembers the last applied value per prop so appliers can be called
 * repeatedly (e.g. every game step) without redundant Phaser setter calls.
 */
export type PropCache = Record<string, unknown>

function apply<T>(
  cache: PropCache | undefined,
  key: string,
  value: T | undefined,
  setter: (value: T) => void
): void {
  if (value === undefined) {
    return
  }

  if (cache) {
    if (cache[key] === value) {
      return
    }

    cache[key] = value
  }

  setter(value)
}

/**
 * Applies the common game object props to `instance`. Props that are
 * `undefined` are skipped; when a `cache` is provided, unchanged props are
 * skipped too, making this safe to call every game step.
 */
export function applyGameObjectProps(
  instance: Phaser.GameObjects.GameObject,
  props: GameObjectProps,
  cache?: PropCache
): void {
  const go = instance as any

  apply(cache, 'name', props.name, (v) => go.setName(v))
  apply(cache, 'active', props.active, (v) => go.setActive(v))

  if (typeof go.setX === 'function') {
    apply(cache, 'x', props.x, (v) => go.setX(v))
    apply(cache, 'y', props.y, (v) => go.setY(v))
    apply(cache, 'z', props.z, (v) => go.setZ(v))
    apply(cache, 'w', props.w, (v) => go.setW(v))
    apply(cache, 'scale', props.scale, (v) => go.setScale(v))
    apply(cache, 'scaleX', props.scaleX, (v) => {
      go.scaleX = v
    })
    apply(cache, 'scaleY', props.scaleY, (v) => {
      go.scaleY = v
    })
    apply(cache, 'angle', props.angle, (v) => go.setAngle(v))
    apply(cache, 'rotation', props.rotation, (v) => go.setRotation(v))
  }

  if (typeof go.setDepth === 'function') {
    apply(cache, 'depth', props.depth, (v) => go.setDepth(v))
  }

  if (typeof go.setAlpha === 'function') {
    apply(cache, 'alpha', props.alpha, (v) => go.setAlpha(v))
  }

  if (typeof go.setBlendMode === 'function') {
    apply(cache, 'blendMode', props.blendMode, (v) => go.setBlendMode(v))
  }

  if (typeof go.setFlipX === 'function') {
    apply(cache, 'flipX', props.flipX, (v) => go.setFlipX(v))
    apply(cache, 'flipY', props.flipY, (v) => go.setFlipY(v))
  }

  if (typeof go.setOrigin === 'function') {
    apply(cache, 'originX', props.originX, (v) => go.setOrigin(v, go.originY))
    apply(cache, 'originY', props.originY, (v) => go.setOrigin(go.originX, v))
  }

  if (typeof go.setScrollFactor === 'function') {
    apply(cache, 'scrollFactorX', props.scrollFactorX, (v) =>
      go.setScrollFactor(v, go.scrollFactorY)
    )
    apply(cache, 'scrollFactorY', props.scrollFactorY, (v) =>
      go.setScrollFactor(go.scrollFactorX, v)
    )
  }

  if (typeof go.setVisible === 'function') {
    apply(cache, 'visible', props.visible, (v) => go.setVisible(v))
  }

  if (typeof go.setTint === 'function') {
    apply(cache, 'tint', props.tint, (v) => go.setTint(v))
  }

  apply(cache, 'interactive', props.interactive, (v) => {
    if (v === true) {
      go.setInteractive()
    } else if (v === false) {
      go.disableInteractive()
    } else if (v) {
      go.setInteractive(v.shape, v.callback, v.dropZone)
    }
  })
}

/**
 * Applies sprite-specific props (texture, animation) to `instance`.
 */
export function applySpriteProps(
  instance: Phaser.GameObjects.Sprite,
  props: SpriteProps,
  cache?: PropCache
): void {
  applyGameObjectProps(instance, props, cache)

  apply(cache, 'texture', props.texture, (v) => {
    if (instance.texture.key !== v) {
      instance.setTexture(v, props.frame)
    }
  })

  apply(cache, 'animation', props.animation, (v) => instance.anims.play(v, true))
}

/**
 * Applies text-specific props to `instance`.
 */
export function applyTextProps(
  instance: Phaser.GameObjects.Text,
  props: TextProps,
  cache?: PropCache
): void {
  applyGameObjectProps(instance, props, cache)

  apply(cache, 'text', props.text, (v) => instance.setText(v))
  apply(cache, 'align', props.align, (v) => instance.setAlign(v))
  apply(cache, 'color', props.color, (v) => instance.setColor(v))
  apply(cache, 'fontFamily', props.fontFamily, (v) => instance.setFontFamily(v))
  apply(cache, 'fontSize', props.fontSize, (v) => instance.setFontSize(v))
  apply(cache, 'fontStyle', props.fontStyle, (v) => instance.setFontStyle(v))
  apply(cache, 'backgroundColor', props.backgroundColor, (v) =>
    instance.setBackgroundColor(v)
  )
  apply(cache, 'stroke', props.stroke, (v) =>
    instance.setStroke(v, props.strokeThickness ?? 1)
  )
  apply(cache, 'lineSpacing', props.lineSpacing, (v) => instance.setLineSpacing(v))
  apply(cache, 'padding', props.padding, (v) =>
    instance.setPadding(v as Phaser.Types.GameObjects.Text.TextPadding)
  )
  apply(cache, 'wordWrapWidth', props.wordWrapWidth, (v) =>
    instance.setWordWrapWidth(v)
  )
}

/**
 * Applies tile-sprite-specific props to `instance`.
 */
export function applyTileSpriteProps(
  instance: Phaser.GameObjects.TileSprite,
  props: TileSpriteProps,
  cache?: PropCache
): void {
  applyGameObjectProps(instance, props, cache)

  apply(cache, 'tilePositionX', props.tilePositionX, (v) => {
    instance.tilePositionX = v
  })
  apply(cache, 'tilePositionY', props.tilePositionY, (v) => {
    instance.tilePositionY = v
  })
  apply(cache, 'tileScaleX', props.tileScaleX, (v) => {
    instance.tileScaleX = v
  })
  apply(cache, 'tileScaleY', props.tileScaleY, (v) => {
    instance.tileScaleY = v
  })
}

/**
 * Applies rectangle-specific props to `instance`.
 */
export function applyRectangleProps(
  instance: Phaser.GameObjects.Rectangle,
  props: RectangleProps,
  cache?: PropCache
): void {
  applyGameObjectProps(instance, props, cache)

  apply(cache, 'fillColor', props.fillColor, (v) =>
    instance.setFillStyle(v, props.fillAlpha)
  )
  apply(cache, 'strokeColor', props.strokeColor, (v) =>
    instance.setStrokeStyle(props.strokeWidth ?? 1, v)
  )
  apply(cache, 'width', props.width, (v) => instance.setSize(v, instance.height))
  apply(cache, 'height', props.height, (v) => instance.setSize(instance.width, v))
}

/**
 * Applies container-specific props to `instance`.
 */
export function applyContainerProps(
  instance: Phaser.GameObjects.Container,
  props: ContainerProps,
  cache?: PropCache
): void {
  applyGameObjectProps(instance, props, cache)

  apply(cache, 'width', props.width, (v) => instance.setSize(v, instance.height))
  apply(cache, 'height', props.height, (v) => instance.setSize(instance.width, v))
}

/**
 * Applies arcade physics body props to the body of `instance`. Size and shape
 * props (circle, width/height, offset) are applied before motion props.
 */
export function applyArcadeBodyProps(
  instance: Phaser.GameObjects.GameObject & { body: Phaser.Physics.Arcade.Body },
  props: ArcadeBodyProps,
  cache?: PropCache
): void {
  const body = instance.body

  apply(cache, 'circle', props.circle, (v) =>
    body.setCircle(v.radius, v.offsetX, v.offsetY)
  )

  if (props.circle === undefined) {
    apply(cache, 'width', props.width, (v) =>
      body.setSize(v, props.height, props.center)
    )
    apply(cache, 'height', props.height, (v) =>
      body.setSize(props.width, v, props.center)
    )
  }

  apply(cache, 'offsetX', props.offsetX, (v) => body.setOffset(v, body.offset.y))
  apply(cache, 'offsetY', props.offsetY, (v) => body.setOffset(body.offset.x, v))

  apply(cache, 'acceleration', props.acceleration, (v) => body.setAcceleration(v, v))
  apply(cache, 'accelerationX', props.accelerationX, (v) => body.setAccelerationX(v))
  apply(cache, 'accelerationY', props.accelerationY, (v) => body.setAccelerationY(v))
  apply(cache, 'allowDrag', props.allowDrag, (v) => {
    body.allowDrag = v
  })
  apply(cache, 'allowGravity', props.allowGravity, (v) => body.setAllowGravity(v))
  apply(cache, 'allowRotation', props.allowRotation, (v) => {
    body.allowRotation = v
  })
  apply(cache, 'angularAcceleration', props.angularAcceleration, (v) =>
    body.setAngularAcceleration(v)
  )
  apply(cache, 'angularDrag', props.angularDrag, (v) => body.setAngularDrag(v))
  apply(cache, 'angularVelocity', props.angularVelocity, (v) =>
    body.setAngularVelocity(v)
  )
  apply(cache, 'bounce', props.bounce, (v) => body.setBounce(v, v))
  apply(cache, 'bounceX', props.bounceX, (v) => body.setBounceX(v))
  apply(cache, 'bounceY', props.bounceY, (v) => body.setBounceY(v))
  apply(cache, 'collideWorldBounds', props.collideWorldBounds, (v) =>
    body.setCollideWorldBounds(v)
  )
  apply(cache, 'drag', props.drag, (v) => body.setDrag(v, v))
  apply(cache, 'dragX', props.dragX, (v) => body.setDragX(v))
  apply(cache, 'dragY', props.dragY, (v) => body.setDragY(v))
  apply(cache, 'friction', props.friction, (v) => body.setFriction(v, v))
  apply(cache, 'frictionX', props.frictionX, (v) => body.setFrictionX(v))
  apply(cache, 'frictionY', props.frictionY, (v) => body.setFrictionY(v))
  apply(cache, 'gravity', props.gravity, (v) => body.setGravity(v, v))
  apply(cache, 'gravityX', props.gravityX, (v) => body.setGravityX(v))
  apply(cache, 'gravityY', props.gravityY, (v) => body.setGravityY(v))
  apply(cache, 'immovable', props.immovable, (v) => body.setImmovable(v))
  apply(cache, 'mass', props.mass, (v) => body.setMass(v))
  apply(cache, 'maxAngular', props.maxAngular, (v) => {
    body.maxAngular = v
  })
  apply(cache, 'maxSpeed', props.maxSpeed, (v) => body.setMaxSpeed(v))
  apply(cache, 'maxVelocityX', props.maxVelocityX, (v) => {
    body.maxVelocity.x = v
  })
  apply(cache, 'maxVelocityY', props.maxVelocityY, (v) => {
    body.maxVelocity.y = v
  })
  apply(cache, 'onWorldBounds', props.onWorldBounds, (v) => {
    body.onWorldBounds = v
  })
  apply(cache, 'pushable', props.pushable, (v) => {
    body.pushable = v
  })
  apply(cache, 'useDamping', props.useDamping, (v) => {
    body.useDamping = v
  })
  apply(cache, 'velocity', props.velocity, (v) => body.setVelocity(v, v))
  apply(cache, 'velocityX', props.velocityX, (v) => body.setVelocityX(v))
  apply(cache, 'velocityY', props.velocityY, (v) => body.setVelocityY(v))
}
