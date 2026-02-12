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

        // Sonido de explosión / Explosion sound
        this.load.audio('explosion_sfx', 'assets/explosion.mp3');

        // Música de fondo / Background music
        this.load.audio('bgm', 'Star Wars Main Theme (Full).mp3');

        // Imagen de pantalla de inicio / Title screen image
        this.load.image('title_screen', 'assets/PantallaInicio.png');



    }

    create() {
        // Iniciamos la pantalla de título
        // Start title screen
        this.scene.start('Title');
    }
}
