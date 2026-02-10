import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        this.load.image('space_bg', 'assets/space_bg.png');

        // Player spritesheet: 396x164. 4 frames horizontal (99x164).
        this.load.spritesheet('player', 'assets/spritesheetNave.png', { frameWidth: 99, frameHeight: 164 });
        // Old player_move is removed/replaced by this sheet.

        this.load.image('enemy', 'assets/enemy.png');

        // Explosion: 612x612. Assuming 6x6 grid (102x102).
        this.load.spritesheet('explosion', 'assets/explosionPixelArt.png', { frameWidth: 102, frameHeight: 102 });
    }

    create() {
        // Iniciamos la pantalla de título
        // Start title screen
        this.scene.start('Title');
    }
}
