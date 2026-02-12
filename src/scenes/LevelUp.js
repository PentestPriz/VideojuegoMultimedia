import Phaser from 'phaser';

/**
 * ESCENA DE SUBIDA DE NIVEL (LevelUpScene)
 * ----------------------------------------
 * Esta escena pausa el juego y permite al jugador elegir una mejora.
 * Muestra 3 tarjetas con opciones aleatorias (roguelite style).
 */
export default class LevelUpScene extends Phaser.Scene {
    constructor() {
        super('LevelUp');
    }

    create() {
        const W = 1080;
        const H = 1920;

        // ── FONDO Y DECORACIÓN ──
        // Fondo oscuro semitransparente para tapar el juego por debajo pero dejar ver algo
        this.add.rectangle(W / 2, H / 2, W, H, 0x000022, 0.85);

        // Efecto visual: Líneas de escaneo al estilo monitor antiguo / holograma
        const scanlines = this.add.graphics();
        scanlines.setAlpha(0.08);
        for (let y = 0; y < H; y += 4) {
            scanlines.fillStyle(0x4fc3f7);
            scanlines.fillRect(0, y, W, 1);
        }

        // ── TÍTULO ──
        // Glow (brillo) detrás del texto
        const titleGlow = this.add.text(W / 2, 350, '✦ ELIGE TU PODER ✦', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '52px',
            color: '#ffd54f',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0.3);

        // Texto principal
        const titleMain = this.add.text(W / 2, 350, '✦ ELIGE TU PODER ✦', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '52px',
            color: '#ffe082',
            align: 'center',
            stroke: '#ff8f00',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Animación de pulso del brillo
        this.tweens.add({
            targets: titleGlow,
            alpha: { from: 0.15, to: 0.45 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Subtítulo
        this.add.text(W / 2, 430, 'El poder de la Fuerza crece en ti', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '22px',
            color: '#4fc3f7',
            align: 'center'
        }).setOrigin(0.5);

        // Línea divisoria
        const lineGfx = this.add.graphics();
        lineGfx.lineStyle(2, 0x4fc3f7, 0.4);
        lineGfx.beginPath();
        lineGfx.moveTo(W / 2 - 350, 470);
        lineGfx.lineTo(W / 2 + 350, 470);
        lineGfx.strokePath();

        // ── SISTEMA DE MEJORAS ──
        const upgrades = [
            { key: 'damage', text: 'Cañón Láser +', desc: 'Aumenta la potencia del cañón', iconKey: 'damage' },
            { key: 'speed', text: 'Velocidad Hiperespacial', desc: 'Muévete más rápido', iconKey: 'speed' },
            { key: 'orb', text: 'Droide Orbital', desc: 'Un droide te protege', iconKey: 'orb' },
            { key: 'projectile', text: 'Bola de Plasma', desc: 'Disparo automático de plasma', iconKey: 'projectile' }
        ];

        // Barajamos (shuffle) las mejoras y cogemos las 3 primeras
        const shuffled = upgrades.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        // Creamos las tarjetas visuales
        let yPos = 600;
        selected.forEach((upgrade, index) => {
            this.createUpgradeCard(W / 2, yPos, upgrade, index);
            yPos += 300; // Espaciado vertical entre tarjetas
        });
    }

    /**
     * Dibuja los iconos de las mejoras usando Graphics (código vectorial).
     * Esto evita tener que cargar imágenes externas para cada icono.
     */
    drawIcon(g, key) {
        switch (key) {
            case 'damage': // Icono de torreta
                // Dibujo complejo de una torreta con cañones dobles
                g.fillStyle(0x777777); g.fillRect(-16, -10, 32, 20); // Cuerpo
                g.fillStyle(0x999999); g.fillRect(-12, -38, 6, 32); g.fillRect(6, -38, 6, 32); // Cañones
                g.fillStyle(0xff4444); g.fillRect(-9, -56, 2, 14); g.fillRect(8, -56, 2, 14); // Láser
                break;

            case 'speed': // Icono de rayo / ala
                g.fillStyle(0x4fc3f7);
                g.beginPath();
                g.moveTo(18, -50); g.lineTo(-2, -8); g.lineTo(16, -8); g.lineTo(-18, 50);
                g.lineTo(2, 8); g.lineTo(-16, 8);
                g.closePath();
                g.fillPath();
                break;

            case 'orb': // Icono de droide esférico
                g.fillStyle(0x4488ff); g.fillCircle(0, 0, 30); // Esfera central
                g.lineStyle(2.5, 0x4fc3f7, 0.8); g.strokeEllipse(0, 0, 75, 28); // Anillo
                break;

            case 'projectile': // Icono de bola de fuego/plasma
                g.fillStyle(0xff6600, 0.25); g.fillCircle(0, 0, 42); // Aura
                g.fillStyle(0xffaa00); g.fillCircle(0, 0, 24); // Cuerpo
                break;
        }
    }

    /**
     * Crea una tarjeta interactiva para seleccionar la mejora.
     */
    createUpgradeCard(x, y, upgrade, index) {
        const container = this.add.container(x, y);

        // Fondo de la tarjeta (rectángulo azul oscuro)
        const bg = this.add.rectangle(0, 0, 850, 240, 0x0a1628, 0.9).setInteractive();
        bg.setStrokeStyle(2, 0x4fc3f7, 0.7);

        // Decoración de esquinas
        const corners = this.add.graphics();
        this.drawCardCorners(corners, -425, -120, 850, 240);

        // Dibujar el icono correspondiente
        const iconGraphics = this.add.graphics();
        iconGraphics.setPosition(-320, 0);
        this.drawIcon(iconGraphics, upgrade.iconKey);

        // Texto del nombre
        const nameText = this.add.text(-220, -30, upgrade.text, {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        // Texto de descripción
        const descText = this.add.text(-220, 20, upgrade.desc, {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '20px',
            color: '#4fc3f7',
            alpha: 0.8
        }).setOrigin(0, 0.5);

        // Flecha indicadora
        const arrow = this.add.text(380, 0, '▶', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '28px',
            color: '#4fc3f7'
        }).setOrigin(0.5);

        // Añadimos todo al contenedor
        container.add([bg, corners, iconGraphics, nameText, descText, arrow]);

        // Animación de entrada (aparecen deslizando una tras otra)
        container.setAlpha(0);
        container.setX(x + 100);
        this.tweens.add({
            targets: container,
            alpha: 1,
            x: x,
            duration: 400,
            delay: index * 150, // Delay escalonado
            ease: 'Back.easeOut'
        });

        // ── INTERACCIÓN ──
        // Hover: Se ilumina y agranda ligeramente al pasar el ratón
        bg.on('pointerover', () => {
            bg.setFillStyle(0x1a2a4a, 0.95);
            bg.setStrokeStyle(3, 0xffd54f, 1);
            nameText.setColor('#ffd54f');
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
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Sine.easeOut'
            });
        });

        // Click: Seleccionar mejora
        bg.on('pointerdown', () => {
            this.selectUpgrade(upgrade.key);
        });
    }

    /**
     * Dibuja las esquinas decorativas de la tarjeta (estilo sci-fi).
     */
    drawCardCorners(g, x, y, w, h) {
        const s = 20;
        g.lineStyle(3, 0x4fc3f7, 0.8);
        g.beginPath(); g.moveTo(x, y + s); g.lineTo(x, y); g.lineTo(x + s, y); g.strokePath();
        g.beginPath(); g.moveTo(x + w - s, y); g.lineTo(x + w, y); g.lineTo(x + w, y + s); g.strokePath();
        g.beginPath(); g.moveTo(x, y + h - s); g.lineTo(x, y + h); g.lineTo(x + s, y + h); g.strokePath();
        g.beginPath(); g.moveTo(x + w - s, y + h); g.lineTo(x + w, y + h); g.lineTo(x + w, y + h - s); g.strokePath();
    }

    /**
     * Aplica la mejora seleccionada y vuelve al juego.
     */
    selectUpgrade(key) {
        const gameScene = this.scene.get('Game');
        if (gameScene.sfx) gameScene.sfx.select(); // Sonido UI
        gameScene.applyUpgrade(key); // Aplicar efecto
        this.scene.resume('Game');   // Reanudar juego
        this.scene.stop();           // Cerrar menú de nivel
    }
}
