import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UI');
    }

    create() {
        // Obtener stats del jugador de la escena Game / Get player stats from Game scene
        this.gameScene = this.scene.get('Game');

        // Barra de vida (Fondo) / Health bar (Background)
        this.add.rectangle(50, 50, 500, 40, 0x000000).setOrigin(0, 0);
        // Barra de vida (Relleno) / Health bar (Fill)
        this.healthBar = this.add.rectangle(50, 50, 500, 40, 0xff0000).setOrigin(0, 0);

        // Texto de nivel / Level text
        this.levelText = this.add.text(50, 100, 'Level: 1', {
            fontSize: '32px',
            color: '#ffffff'
        });
    }

    update() {
        const player = this.gameScene.player;
        if (player) {
            const hpPercent = Phaser.Math.Clamp(player.hp / player.maxHp, 0, 1);
            this.healthBar.width = 500 * hpPercent;
            this.levelText.setText('Level: ' + player.level);
        }
    }
}
