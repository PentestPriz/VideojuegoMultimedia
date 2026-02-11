import Phaser from 'phaser';

export default class LevelUpScene extends Phaser.Scene {
    constructor() {
        super('LevelUp');
    }

    create() {
        // Fondo semitransparente / Semi-transparent background
        this.add.rectangle(540, 960, 1080, 1920, 0x000000, 0.8);

        this.add.text(540, 400, '¡SUBIDA DE NIVEL!', {
            fontSize: '64px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(540, 500, 'Elige una mejora', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Opciones de mejora / Upgrade options
        const upgrades = [
            { key: 'damage', text: 'Aumentar Daño', iconKey: 'damage' },
            { key: 'speed', text: 'Aumentar Velocidad', iconKey: 'speed' },
            { key: 'orb', text: 'Orbe Giratorio', iconKey: 'orb' },
            { key: 'projectile', text: 'Nuevo Proyectil', iconKey: 'projectile' }
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

    /** Dibuja un icono vectorial según el tipo de mejora */
    drawIcon(g, key) {
        switch (key) {
            case 'damage': // Espada roja / Red sword
                // Hoja / Blade
                g.fillStyle(0xff4444);
                g.fillRect(-6, -40, 12, 55);
                // Punta / Tip
                g.fillTriangle(-8, -40, 8, -40, 0, -52);
                // Brillo / Shine
                g.fillStyle(0xff8888);
                g.fillRect(-2, -38, 4, 50);
                // Guarda / Guard
                g.fillStyle(0xcccccc);
                g.fillRect(-20, 15, 40, 8);
                // Mango / Handle
                g.fillStyle(0x884400);
                g.fillRect(-5, 23, 10, 22);
                // Pommel
                g.fillStyle(0xffcc00);
                g.fillCircle(0, 48, 7);
                break;

            case 'speed': // Rayo verde / Green lightning bolt
                // Rayo exterior / Outer bolt
                g.fillStyle(0x00ff66);
                g.beginPath();
                g.moveTo(18, -50);
                g.lineTo(-2, -8);
                g.lineTo(16, -8);
                g.lineTo(-18, 50);
                g.lineTo(2, 8);
                g.lineTo(-16, 8);
                g.closePath();
                g.fillPath();
                // Brillo interior / Inner glow
                g.fillStyle(0xaaffcc);
                g.beginPath();
                g.moveTo(12, -42);
                g.lineTo(0, -8);
                g.lineTo(10, -8);
                g.lineTo(-10, 40);
                g.lineTo(0, 8);
                g.lineTo(-8, 8);
                g.closePath();
                g.fillPath();
                // Núcleo brillante / Bright core
                g.fillStyle(0xeeffee);
                g.beginPath();
                g.moveTo(8, -34);
                g.lineTo(1, -8);
                g.lineTo(6, -8);
                g.lineTo(-4, 30);
                g.lineTo(0, 8);
                g.lineTo(-3, 8);
                g.closePath();
                g.fillPath();
                break;

            case 'orb': // Orbe azul / Blue orb
                // Aura exterior / Outer glow
                g.fillStyle(0x2244aa, 0.4);
                g.fillCircle(0, 0, 45);
                // Orbe principal / Main orb
                g.fillStyle(0x4488ff);
                g.fillCircle(0, 0, 32);
                // Anillo orbital / Orbit ring
                g.lineStyle(3, 0x88ccff, 0.8);
                g.strokeEllipse(0, 0, 80, 30);
                // Brillo / Highlight
                g.fillStyle(0xaaddff);
                g.fillCircle(-10, -12, 10);
                // Núcleo / Core
                g.fillStyle(0xffffff);
                g.fillCircle(-6, -8, 5);
                break;

            case 'projectile': // Bola de plasma amarilla / Yellow plasma ball
                // Aura exterior
                g.fillStyle(0xff6600, 0.3);
                g.fillCircle(0, 0, 40);
                // Cuerpo principal
                g.fillStyle(0xffcc00);
                g.fillCircle(0, 0, 28);
                // Brillo interior
                g.fillStyle(0xffee88);
                g.fillCircle(-6, -6, 14);
                // Núcleo
                g.fillStyle(0xffffff);
                g.fillCircle(-4, -5, 7);
                break;
        }
    }

    createUpgradeButton(x, y, upgrade) {
        const container = this.add.container(x, y);

        // Fondo del botón / Button background
        const bg = this.add.rectangle(0, 0, 800, 250, 0x222222, 0.9).setInteractive();
        bg.setStrokeStyle(2, 0x555555);

        // Icono dibujado con gráficos vectoriales
        const iconGraphics = this.add.graphics();
        iconGraphics.setPosition(-300, 0);
        this.drawIcon(iconGraphics, upgrade.iconKey);

        const text = this.add.text(-200, 0, upgrade.text, {
            fontSize: '40px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        container.add([bg, iconGraphics, text]);

        bg.on('pointerover', () => {
            bg.setFillStyle(0x444444);
            bg.setStrokeStyle(3, 0xffff00);
        });
        bg.on('pointerout', () => {
            bg.setFillStyle(0x222222);
            bg.setStrokeStyle(2, 0x555555);
        });

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
