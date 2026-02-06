import Phaser from 'phaser';

export default class LevelUpScene extends Phaser.Scene {
    constructor() {
        super('LevelUp');
    }

    create() {
        // Fondo semitransparente / Semi-transparent background
        this.add.rectangle(540, 960, 1080, 1920, 0x000000, 0.8);

        this.add.text(540, 400, 'LEVEL UP!', {
            fontSize: '80px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(540, 500, 'Choose an upgrade', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Opciones de mejora (Hardcoded por ahora, idealmente aleatorias) / Upgrade options
        const upgrades = [
            { key: 'damage', text: 'Increase Damage', icon: 0xff0000 },
            { key: 'speed', text: 'Increase Speed', icon: 0x00ff00 },
            { key: 'orb', text: 'Rotating Orb', icon: 0x0000ff },
            { key: 'projectile', text: 'New Projectile', icon: 0xffff00 }
        ];

        // Seleccionar 3 al azar / Select 3 random
        const shuffled = upgrades.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        let yPos = 700;
        selected.forEach(upgrade => {
            this.createUpgradeButton(540, yPos, upgrade);
            yPos += 300;
        });
    }

    createUpgradeButton(x, y, upgrade) {
        const container = this.add.container(x, y);

        // Fondo del botón / Button background
        const bg = this.add.rectangle(0, 0, 800, 250, 0x333333).setInteractive();
        // Borde brillante al pasar el ratón (simulado) / Highlight

        const icon = this.add.rectangle(-300, 0, 100, 100, upgrade.icon);
        const text = this.add.text(-200, 0, upgrade.text, { fontSize: '40px', color: '#ffffff' }).setOrigin(0, 0.5);

        container.add([bg, icon, text]);

        bg.on('pointerover', () => bg.setFillStyle(0x555555));
        bg.on('pointerout', () => bg.setFillStyle(0x333333));

        bg.on('pointerdown', () => {
            this.selectUpgrade(upgrade.key);
        });
    }

    selectUpgrade(key) {
        // Aplicar mejora / Apply upgrade
        const gameScene = this.scene.get('Game');
        gameScene.applyUpgrade(key);

        // Reanudar juego / Resume game
        this.scene.resume('Game');
        this.scene.stop();
    }
}
