import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Aquí cargaríamos imágenes si las tuviéramos. Como usamos formas geométricas, no es necesario.
        // We would load images here. Since we use shapes, it's not needed.
    }

    create() {
        // Iniciamos la pantalla de título
        // Start title screen
        this.scene.start('Title');
    }
}
