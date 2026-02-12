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

        // Background image - set to fill the 1080x1920 screen
        this.add.image(540, 960, 'gameover_screen')
            .setOrigin(0.5)
            .setDisplaySize(1080, 1920);

        // Semi-transparent overlay to make text more readable if needed
        // this.add.rectangle(540, 960, 1080, 1920, 0x000000, 0.3);

        const restartText = this.add.text(540, 1600, 'Tap to Restart', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '64px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Flashing effect for restart text
        this.tweens.add({
            targets: restartText,
            alpha: 0,
            duration: 800,
            ease: 'Power1',
            yoyo: true,
            loop: -1
        });

        this.input.on('pointerdown', () => {
            this.scene.start('Game');
        });
    }
}
