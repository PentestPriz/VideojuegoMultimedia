import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    create() {
        // UI Scene must stop
        this.scene.stop('UI');
        // Stop Game scene to ensure cleanup
        this.scene.stop('Game');

        // Reset Camera position just in case (though it should be 0,0 on start)
        this.cameras.main.setScroll(0, 0);

        this.add.rectangle(540, 960, 1080, 1920, 0x000000, 0.8);

        this.add.text(540, 800, 'GAME OVER', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '80px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const restartText = this.add.text(540, 1000, 'Tap to Restart', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.input.on('pointerdown', () => {
            this.scene.start('Game');
        });
    }
}
