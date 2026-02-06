import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    create() {
        // UI Scene must stop
        this.scene.stop('UI');

        this.add.rectangle(540, 960, 1080, 1920, 0x000000, 0.8);

        this.add.text(540, 800, 'GAME OVER', {
            fontSize: '80px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const restartText = this.add.text(540, 1000, 'Tap to Restart', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.input.on('pointerdown', () => {
            this.scene.start('Game');
        });
    }
}
