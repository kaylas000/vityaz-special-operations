import Phaser from 'phaser'

export default class TrainingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TrainingScene' })
  }

  create() {
    this.add.rectangle(512, 384, 1024, 768, 0x1a3a2e)

    this.add.text(512, 100, 'TRAINING GROUND', {
      fontSize: '48px',
      color: '#8B0000',
    }).setOrigin(0.5)

    // Training options
    const trainings = [
      { name: 'Obstacle Course', reward: 50 },
      { name: 'Shooting Range', reward: 75 },
      { name: 'CQC Combat', reward: 100 },
      { name: 'Tactical Scenario', reward: 150 },
    ]

    let y = 250
    trainings.forEach((training) => {
      const btn = this.add.rectangle(512, y, 300, 50, 0x2a5a3a)
        .setInteractive({ useHandCursor: true })

      this.add.text(512, y, `${training.name} (+${training.reward} $VITYAZ)`, {
        fontSize: '18px',
        color: '#00FF00',
      }).setOrigin(0.5)

      btn.on('pointerdown', () => {
        console.log(`Started: ${training.name}`)
      })

      y += 100
    })
  }
}
