import Phaser from 'phaser';

export default class LevelUpScene extends Phaser.Scene {
    constructor() {
        super('LevelUp');
    }

    create() {
        const W = 1080;
        const H = 1920;

        // ── Fondo oscuro con tinte azul ──
        this.add.rectangle(W / 2, H / 2, W, H, 0x000022, 0.85);

        // ── Scan-lines decorativas ──
        const scanlines = this.add.graphics();
        scanlines.setAlpha(0.08);
        for (let y = 0; y < H; y += 4) {
            scanlines.fillStyle(0x4fc3f7);
            scanlines.fillRect(0, y, W, 1);
        }

        // ── Título ──
        const titleGlow = this.add.text(W / 2, 350, '✦ ELIGE TU PODER ✦', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '52px',
            color: '#ffd54f',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0.3);

        const titleMain = this.add.text(W / 2, 350, '✦ ELIGE TU PODER ✦', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '52px',
            color: '#ffe082',
            align: 'center',
            stroke: '#ff8f00',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Pulso del glow del título
        this.tweens.add({
            targets: titleGlow,
            alpha: { from: 0.15, to: 0.45 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // ── Subtítulo ──
        this.add.text(W / 2, 430, 'El poder de la Fuerza crece en ti', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '22px',
            color: '#4fc3f7',
            align: 'center'
        }).setOrigin(0.5);

        // ── Línea decorativa ──
        const lineGfx = this.add.graphics();
        lineGfx.lineStyle(2, 0x4fc3f7, 0.4);
        lineGfx.beginPath();
        lineGfx.moveTo(W / 2 - 350, 470);
        lineGfx.lineTo(W / 2 + 350, 470);
        lineGfx.strokePath();

        // ── Opciones de mejora ──
        const upgrades = [
            { key: 'damage', text: 'Cañón Láser +', desc: 'Aumenta la potencia del cañón', iconKey: 'damage' },
            { key: 'speed', text: 'Velocidad Hiperespacial', desc: 'Muévete más rápido', iconKey: 'speed' },
            { key: 'orb', text: 'Droide Orbital', desc: 'Un droide te protege', iconKey: 'orb' },
            { key: 'projectile', text: 'Bola de Plasma', desc: 'Disparo automático de plasma', iconKey: 'projectile' }
        ];

        const shuffled = upgrades.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        let yPos = 600;
        selected.forEach((upgrade, index) => {
            this.createUpgradeCard(W / 2, yPos, upgrade, index);
            yPos += 300;
        });
    }

    /** Dibuja un icono vectorial con estilo Star Wars */
    drawIcon(g, key) {
        switch (key) {
            case 'damage': // Cañón láser (torreta)
                // Base giratoria / Rotating base
                g.fillStyle(0x555555);
                g.fillRect(-18, 10, 36, 14);
                g.fillStyle(0x666666);
                g.fillRect(-14, 6, 28, 8);
                // Cuerpo de torreta / Turret body
                g.fillStyle(0x777777);
                g.fillRect(-16, -10, 32, 20);
                // Panel frontal / Front panel
                g.fillStyle(0x888888);
                g.fillRect(-14, -8, 28, 16);
                // Cañones gemelos / Twin barrels
                g.fillStyle(0x999999);
                g.fillRect(-12, -38, 6, 32);
                g.fillRect(6, -38, 6, 32);
                // Punta de los cañones / Barrel tips
                g.fillStyle(0xaaaaaa);
                g.fillRect(-14, -42, 10, 6);
                g.fillRect(4, -42, 10, 6);
                // Disparos láser rojos / Red laser shots
                g.fillStyle(0xff0000, 0.5);
                g.fillRect(-10, -58, 4, 18);
                g.fillRect(7, -58, 4, 18);
                g.fillStyle(0xff4444);
                g.fillRect(-9, -56, 2, 14);
                g.fillRect(8, -56, 2, 14);
                g.fillStyle(0xffffff);
                g.fillCircle(-9, -58, 3);
                g.fillCircle(8, -58, 3);
                // Visor / Targeting visor
                g.fillStyle(0xff0000);
                g.fillCircle(0, -2, 4);
                g.fillStyle(0xff6666);
                g.fillCircle(0, -2, 2);
                break;

            case 'speed': // Rayo de hiperpropulsión
                g.fillStyle(0x4fc3f7);
                g.beginPath();
                g.moveTo(18, -50);
                g.lineTo(-2, -8);
                g.lineTo(16, -8);
                g.lineTo(-18, 50);
                g.lineTo(2, 8);
                g.lineTo(-16, 8);
                g.closePath();
                g.fillPath();
                // Brillo interior
                g.fillStyle(0xb3e5fc);
                g.beginPath();
                g.moveTo(12, -42);
                g.lineTo(0, -8);
                g.lineTo(10, -8);
                g.lineTo(-10, 40);
                g.lineTo(0, 8);
                g.lineTo(-8, 8);
                g.closePath();
                g.fillPath();
                // Núcleo
                g.fillStyle(0xffffff);
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

            case 'orb': // Droide esfera (BB-8 style)
                // Cuerpo
                g.fillStyle(0x4fc3f7, 0.3);
                g.fillCircle(0, 0, 40);
                g.fillStyle(0x4488ff);
                g.fillCircle(0, 0, 30);
                // Anillo orbital
                g.lineStyle(2.5, 0x4fc3f7, 0.8);
                g.strokeEllipse(0, 0, 75, 28);
                // Ojo/sensor
                g.fillStyle(0xaaddff);
                g.fillCircle(-8, -10, 10);
                g.fillStyle(0xffffff);
                g.fillCircle(-6, -8, 5);
                // Detalle
                g.lineStyle(1.5, 0x4fc3f7, 0.5);
                g.strokeCircle(0, 0, 22);
                break;

            case 'projectile': // Bola de plasma
                // Aura exterior / Outer glow
                g.fillStyle(0xff6600, 0.25);
                g.fillCircle(0, 0, 42);
                // Anillo medio / Mid ring
                g.fillStyle(0xff8800, 0.3);
                g.fillCircle(0, 0, 32);
                // Cuerpo principal / Main body
                g.fillStyle(0xffaa00);
                g.fillCircle(0, 0, 24);
                // Capa caliente / Hot layer
                g.fillStyle(0xffcc44);
                g.fillCircle(-4, -4, 16);
                // Brillo interior / Inner glow
                g.fillStyle(0xffee88);
                g.fillCircle(-6, -6, 10);
                // Núcleo / Core
                g.fillStyle(0xffffff);
                g.fillCircle(-5, -5, 5);
                break;
        }
    }

    createUpgradeCard(x, y, upgrade, index) {
        const container = this.add.container(x, y);

        // ── Panel holográfico ──
        const bg = this.add.rectangle(0, 0, 850, 240, 0x0a1628, 0.9).setInteractive();
        bg.setStrokeStyle(2, 0x4fc3f7, 0.7);

        // Esquinas del panel
        const corners = this.add.graphics();
        this.drawCardCorners(corners, -425, -120, 850, 240);

        // Línea lateral izquierda decorativa
        const sideLine = this.add.graphics();
        sideLine.fillStyle(0x4fc3f7, 0.6);
        sideLine.fillRect(-420, -100, 4, 200);

        // ── Icono ──
        const iconGraphics = this.add.graphics();
        iconGraphics.setPosition(-320, 0);
        this.drawIcon(iconGraphics, upgrade.iconKey);

        // ── Textos ──
        const nameText = this.add.text(-220, -30, upgrade.text, {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        const descText = this.add.text(-220, 20, upgrade.desc, {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '20px',
            color: '#4fc3f7',
            alpha: 0.8
        }).setOrigin(0, 0.5);

        // ── Flecha derecha decorativa ──
        const arrow = this.add.text(380, 0, '▶', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '28px',
            color: '#4fc3f7'
        }).setOrigin(0.5);

        container.add([bg, corners, sideLine, iconGraphics, nameText, descText, arrow]);

        // Animación de entrada
        container.setAlpha(0);
        container.setX(x + 100);
        this.tweens.add({
            targets: container,
            alpha: 1,
            x: x,
            duration: 400,
            delay: index * 150,
            ease: 'Back.easeOut'
        });

        // ── Hover effects ──
        bg.on('pointerover', () => {
            bg.setFillStyle(0x1a2a4a, 0.95);
            bg.setStrokeStyle(3, 0xffd54f, 1);
            nameText.setColor('#ffd54f');
            arrow.setColor('#ffd54f');
            this.tweens.add({
                targets: container,
                scaleX: 1.03,
                scaleY: 1.03,
                duration: 150,
                ease: 'Sine.easeOut'
            });
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x0a1628, 0.9);
            bg.setStrokeStyle(2, 0x4fc3f7, 0.7);
            nameText.setColor('#ffffff');
            arrow.setColor('#4fc3f7');
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Sine.easeOut'
            });
        });

        bg.on('pointerdown', () => {
            // Flash de selección
            this.cameras.main.flash(200, 79, 195, 247);
            this.time.delayedCall(200, () => {
                this.selectUpgrade(upgrade.key);
            });
        });
    }

    drawCardCorners(g, x, y, w, h) {
        const s = 20;
        g.lineStyle(3, 0x4fc3f7, 0.8);
        // TL
        g.beginPath(); g.moveTo(x, y + s); g.lineTo(x, y); g.lineTo(x + s, y); g.strokePath();
        // TR
        g.beginPath(); g.moveTo(x + w - s, y); g.lineTo(x + w, y); g.lineTo(x + w, y + s); g.strokePath();
        // BL
        g.beginPath(); g.moveTo(x, y + h - s); g.lineTo(x, y + h); g.lineTo(x + s, y + h); g.strokePath();
        // BR
        g.beginPath(); g.moveTo(x + w - s, y + h); g.lineTo(x + w, y + h); g.lineTo(x + w, y + h - s); g.strokePath();
    }

    selectUpgrade(key) {
        const gameScene = this.scene.get('Game');
        if (gameScene.sfx) gameScene.sfx.select();
        gameScene.applyUpgrade(key);
        this.scene.resume('Game');
        this.scene.stop();
    }
}
