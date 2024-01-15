import { GameObjects, Scene } from 'phaser'
import { gameState } from './State.ts'
import { pairwise } from 'rxjs'

type Ability = {
  icon: string
  name: string
  description: string
  baseCooldown: number // In seconds
}

// TODO Move somewhere else

const Abilities = {
  CLICK: {
    id: 'extinguisher',
    name: 'Click',
    description: 'Click on a cell to extinguish the fire',
    baseCooldown: 0.5,
  },
  HELICOPTER: {
    id: 'heli',
    name: 'Helicopter',
    description: 'Send a helicopter to pour water over a large area (5x5)',
    baseCooldown: 10,
  },
} as const

// TODO: Introduce AIs like in Bloons TD6

class AbilityIcon {
  constructor(
    public readonly sprite: GameObjects.Sprite,
    abilityIndex: number
  ) {
    sprite.on('pointerdown', () => {
      gameState.selectedAbilityIndex$.next(abilityIndex)
    })
  }

  onSelected() {
    this.sprite.setTint(0xffffff)
  }

  onUnselected() {
    this.sprite.setTint(0x333333)
  }

  onUpdateCooldown(secondsLeft: number) {
    // TODO: Somehow indicate how many seconds there are left in the cool down
  }
}

export default class HudScene extends Scene {
  private score?: number
  private scoreText?: GameObjects.Text

  private abilityContainer: GameObjects.Container | undefined
  private abilityXAxis = 10 // PaddingLeft
  private abilityIcons: AbilityIcon[] = []

  constructor() {
    super({ key: 'HudScene' })
  }

  preload() {
    this.load.image(Abilities['CLICK'].id, 'assets/extinguisher.png')
    this.load.image(Abilities['HELICOPTER'].id, 'assets/heli.png')
  }

  addAbilityIcon(abilityKey: keyof typeof Abilities) {
    const paddingBetween = 16
    const ability = Abilities[abilityKey]
    console.log(ability)

    const s = this.add.sprite(this.abilityXAxis, 0, ability.id)
    const index = this.abilityIcons.length

    s.setOrigin(0, 0.5)
    s.setAlpha(0.9)
    s.setInteractive()
    this.abilityContainer?.add(s)
    const abilityIcon = new AbilityIcon(s, index)
    abilityIcon.onUnselected()
    this.abilityIcons.push(abilityIcon)
    this.abilityXAxis += s.width + paddingBetween
  }

  createAbilityBar() {
    // TODO: Ability HUD -> Will affect which is shown
    // Get the game's width and height
    const gameHeight: number = this.sys.game.config.height as number
    const paddingBottom = 40
    const paddingLeft = 10

    this.abilityContainer = this.add.container(
      paddingLeft,
      gameHeight - paddingBottom
    )
    this.abilityContainer.setScale(0.5)
    // For testing
    ;['CLICK', 'HELICOPTER'].forEach((abilityKey) => {
      this.addAbilityIcon(abilityKey as any)
    })

    gameState.selectedAbilityIndex$
      .pipe(pairwise())
      .subscribe(([oldIndex, newIndex]) => {
        console.log(
          'Changing selected ability from ',
          oldIndex,
          ' to ',
          newIndex
        )
        this.abilityIcons[oldIndex].onUnselected()
        this.abilityIcons[newIndex].onSelected()
      })

    gameState.selectedAbilityIndex$.next(0)

    // TODO: render placeholders to create anticipation?
  }

  createScore() {
    this.score = 0
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px' })
  }

  updateAbilityBar(time: number) {
    // FIXME: Introduce logic
    this.abilityIcons.forEach((a) => a.onUpdateCooldown(-1))
  }

  create() {
    this.createScore()
    this.createAbilityBar()
  }

  updateScore(time: number) {
    this.score = Math.floor(time / 1000)
    if (this.scoreText) this.scoreText.text = `Score: ${this.score}`
  }

  update(time: number, _delta: number) {
    this.updateScore(time)
    this.updateAbilityBar(time)
  }
}
