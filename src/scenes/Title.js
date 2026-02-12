import Phaser from 'phaser';

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super('Title');
    }

    create() {
        // Texto de Título / Title Text
        this.add.text(540, 600, 'NOVA FORCE', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '80px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Texto de instrucción / Instruction Text
        const startText = this.add.text(540, 1000, 'Toca para empezar', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '48px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // Interacción para iniciar / Interaction to start
        this.input.on('pointerdown', () => {
            this.scene.start('Game');
        });

        // Pequeña animación de parpadeo / Small blink animation
        this.tweens.add({
            targets: startText,
            alpha: 0,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }
}
