import Phaser from 'phaser';

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super('Title');
    }

    create() {
        const { width, height } = this.scale;


        const bg = this.add.image(width / 2, height / 2, 'title_screen');


        bg.displayWidth = width;
        bg.displayHeight = height;

        // Interacción para iniciar
        bg.setInteractive();
        bg.on('pointerdown', () => {
            this.scene.start('Game');
        });

        // Texto parpadeante "PRESS TO START"
        const pressStartText = this.add.text(width / 2, height - 150, 'PRESS TO START', {
            fontSize: '56px',
            fontFamily: 'Courier',
            fontWeight: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { color: '#000000', fill: true, blur: 0, offset: { x: 4, y: 4 } }
        }).setOrigin(0.5).setDepth(10); // Asegurar que esté encima de todo

        // Animación de parpadeo
        this.tweens.add({
            targets: pressStartText,
            alpha: 0,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Linear' // Linear es más seguro y consistente para parpadeo
        });

        // Hacer que el texto también inicie el juego
        pressStartText.setInteractive();
        pressStartText.on('pointerdown', () => {
            this.scene.start('Game');
        });
    }


}
