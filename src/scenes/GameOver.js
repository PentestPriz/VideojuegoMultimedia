import Phaser from 'phaser';

/**
 * PANTALLA DE GAME OVER — Estilo Star Wars
 * ─────────────────────────────────────────
 * Secuencia cinemática al morir:
 *  1. Pantalla se tiñe de rojo → fade a negro
 *  2. "MISIÓN FALLIDA" aparece con glitch/shake
 *  3. Panel holográfico con estadísticas de la partida
 *  4. Estrellas animadas de fondo
 *  5. "Toca para reintentar" con animación
 */
export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    init(data) {
        // Recibir estadísticas del juego / Receive game stats
        this.finalWave = data.wave || 1;
        this.finalKills = data.kills || 0;
        this.finalLevel = data.level || 1;
    }

    create() {
        // Detener las otras escenas / Stop other scenes
        this.scene.stop('UI');
        this.scene.stop('Game');

        // Parar la música / Stop music
        this.sound.stopAll();

        this.cameras.main.setScroll(0, 0);

        const W = 1080;
        const H = 1920;

        // ═══════════════════════════════════════════
        // FONDO NEGRO / Black background
        // ═══════════════════════════════════════════
        this.cameras.main.setBackgroundColor('#000000');

        // ═══════════════════════════════════════════
        // CAMPO DE ESTRELLAS / Animated starfield
        // ═══════════════════════════════════════════
        this.stars = [];
        this.starGfx = this.add.graphics().setDepth(0);
        for (let i = 0; i < 150; i++) {
            this.stars.push({
                x: Phaser.Math.Between(0, W),
                y: Phaser.Math.Between(0, H),
                size: Phaser.Math.FloatBetween(0.5, 2),
                speed: Phaser.Math.FloatBetween(0.1, 0.8),
                alpha: Phaser.Math.FloatBetween(0.2, 0.8)
            });
        }

        // ═══════════════════════════════════════════
        // PARTÍCULAS DE DESTRUCCIÓN (restos flotantes rojos/naranjas)
        // ═══════════════════════════════════════════
        for (let i = 0; i < 20; i++) {
            const debris = this.add.graphics().setDepth(1);
            const color = Phaser.Math.RND.pick([0xff4444, 0xff8800, 0xffaa33, 0xcc2200]);
            const size = Phaser.Math.FloatBetween(1, 4);
            debris.fillStyle(color, Phaser.Math.FloatBetween(0.2, 0.6));
            debris.fillCircle(0, 0, size);
            debris.setPosition(
                Phaser.Math.Between(0, W),
                Phaser.Math.Between(0, H)
            );

            // Movimiento flotante lento
            this.tweens.add({
                targets: debris,
                x: debris.x + Phaser.Math.Between(-100, 100),
                y: debris.y + Phaser.Math.Between(-200, -50),
                alpha: 0,
                duration: Phaser.Math.Between(4000, 8000),
                delay: Phaser.Math.Between(0, 3000),
                repeat: -1,
                ease: 'Sine.easeOut',
                onRepeat: () => {
                    debris.setPosition(
                        Phaser.Math.Between(0, W),
                        Phaser.Math.Between(H * 0.5, H)
                    );
                    debris.setAlpha(Phaser.Math.FloatBetween(0.2, 0.6));
                }
            });
        }

        // ═══════════════════════════════════════════
        // OVERLAY ROJO INICIAL / Initial red overlay
        // ═══════════════════════════════════════════
        const redOverlay = this.add.rectangle(W / 2, H / 2, W, H, 0xff0000, 0.6).setDepth(100);
        this.tweens.add({
            targets: redOverlay,
            alpha: 0,
            duration: 1500,
            ease: 'Cubic.easeOut',
            onComplete: () => redOverlay.destroy()
        });

        // ═══════════════════════════════════════════
        // LÍNEA HORIZONTAL ROJA SUPERIOR / Top red scan line
        // ═══════════════════════════════════════════
        const scanLine = this.add.rectangle(W / 2, 0, W, 3, 0xff0000, 0.8).setDepth(50);
        this.tweens.add({
            targets: scanLine,
            y: H,
            alpha: 0,
            duration: 2000,
            ease: 'Sine.easeIn',
            onComplete: () => scanLine.destroy()
        });

        // ═══════════════════════════════════════════
        // TÍTULO "MISIÓN FALLIDA" / "MISSION FAILED" title
        // ═══════════════════════════════════════════

        // Glow rojo detrás
        const titleGlow = this.add.text(W / 2, H * 0.22, 'MISIÓN\nFALLIDA', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '110px',
            fontStyle: 'bold',
            color: '#330000',
            align: 'center',
            lineSpacing: -5
        }).setOrigin(0.5).setDepth(9).setAlpha(0);

        // Texto principal
        const title = this.add.text(W / 2, H * 0.22, 'MISIÓN\nFALLIDA', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '110px',
            fontStyle: 'bold',
            color: '#ff2222',
            align: 'center',
            lineSpacing: -5,
            stroke: '#880000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(10).setAlpha(0).setScale(3);

        // Animación: zoom in con shake
        this.tweens.add({
            targets: title,
            scale: 1,
            alpha: 1,
            duration: 1200,
            ease: 'Back.easeOut',
            delay: 500,
            onComplete: () => {
                // Shake effect
                this.cameras.main.shake(300, 0.01);

                // Glow pulso
                this.tweens.add({
                    targets: titleGlow,
                    alpha: 0.4,
                    duration: 1500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });

                // Mostrar estadísticas después del título
                this.showStats();
            }
        });

        // Glow aparece con el título
        this.tweens.add({
            targets: titleGlow,
            alpha: 0.3,
            duration: 1200,
            delay: 500,
            ease: 'Sine.easeOut'
        });

        // ═══════════════════════════════════════════
        // LÍNEAS DECORATIVAS ROJAS / Decorative red lines
        // ═══════════════════════════════════════════
        const decoLines = this.add.graphics().setDepth(10).setAlpha(0);
        // Superior
        decoLines.lineStyle(2, 0xff2222, 0.8);
        decoLines.lineBetween(W * 0.1, H * 0.14, W * 0.9, H * 0.14);
        decoLines.lineStyle(1, 0xff2222, 0.3);
        decoLines.lineBetween(W * 0.05, H * 0.145, W * 0.95, H * 0.145);
        // Inferior al título
        decoLines.lineStyle(2, 0xff2222, 0.8);
        decoLines.lineBetween(W * 0.1, H * 0.32, W * 0.9, H * 0.32);
        decoLines.lineStyle(1, 0xff2222, 0.3);
        decoLines.lineBetween(W * 0.05, H * 0.325, W * 0.95, H * 0.325);

        this.tweens.add({
            targets: decoLines,
            alpha: 1,
            duration: 800,
            delay: 1700,
            ease: 'Sine.easeIn'
        });

        // Subtítulo
        const subtitle = this.add.text(W / 2, H * 0.35, '✦  LA FUERZA TE HA ABANDONADO...  ✦', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '24px',
            color: '#ff6b6b',
            letterSpacing: 4
        }).setOrigin(0.5).setDepth(10).setAlpha(0);

        this.tweens.add({
            targets: subtitle,
            alpha: 0.7,
            duration: 1000,
            delay: 2000,
            ease: 'Sine.easeIn'
        });
    }

    // ═══════════════════════════════════════════
    // PANEL DE ESTADÍSTICAS HOLOGRÁFICO
    // ═══════════════════════════════════════════
    showStats() {
        const W = 1080;
        const H = 1920;
        const panelY = H * 0.42;
        const panelH = 380;
        const panelW = 700;

        // ── Fondo del panel ──
        const panelBg = this.add.graphics().setDepth(8).setAlpha(0);
        // Fondo semitransparente
        panelBg.fillStyle(0x0a0a1a, 0.85);
        panelBg.fillRoundedRect(W / 2 - panelW / 2, panelY, panelW, panelH, 16);
        // Borde exterior
        panelBg.lineStyle(2, 0xff4444, 0.6);
        panelBg.strokeRoundedRect(W / 2 - panelW / 2, panelY, panelW, panelH, 16);
        // Borde interior (doble línea)
        panelBg.lineStyle(1, 0xff4444, 0.2);
        panelBg.strokeRoundedRect(W / 2 - panelW / 2 + 4, panelY + 4, panelW - 8, panelH - 8, 14);

        // ── Esquinas decorativas del panel ──
        const cornerSize = 20;
        const cg = this.add.graphics().setDepth(9).setAlpha(0);
        cg.lineStyle(3, 0xff6666, 0.8);
        const cx = W / 2 - panelW / 2;
        const cy = panelY;
        // Top-left
        cg.beginPath(); cg.moveTo(cx, cy + cornerSize); cg.lineTo(cx, cy); cg.lineTo(cx + cornerSize, cy); cg.strokePath();
        // Top-right
        cg.beginPath(); cg.moveTo(cx + panelW - cornerSize, cy); cg.lineTo(cx + panelW, cy); cg.lineTo(cx + panelW, cy + cornerSize); cg.strokePath();
        // Bottom-left
        cg.beginPath(); cg.moveTo(cx, cy + panelH - cornerSize); cg.lineTo(cx, cy + panelH); cg.lineTo(cx + cornerSize, cy + panelH); cg.strokePath();
        // Bottom-right
        cg.beginPath(); cg.moveTo(cx + panelW - cornerSize, cy + panelH); cg.lineTo(cx + panelW, cy + panelH); cg.lineTo(cx + panelW, cy + panelH - cornerSize); cg.strokePath();

        // ── Título del panel ──
        const panelTitle = this.add.text(W / 2, panelY + 40, '◆  INFORME DE MISIÓN  ◆', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '28px',
            color: '#ff6b6b',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10).setAlpha(0);

        // Línea separadora bajo el título del panel
        const sepLine = this.add.graphics().setDepth(10).setAlpha(0);
        sepLine.lineStyle(1, 0xff4444, 0.5);
        sepLine.lineBetween(W / 2 - panelW / 2 + 30, panelY + 65, W / 2 + panelW / 2 - 30, panelY + 65);

        // ── Estadísticas ──
        const stats = [
            { label: 'OLEADA ALCANZADA', value: this.finalWave, icon: '⚔' },
            { label: 'ENEMIGOS ELIMINADOS', value: this.finalKills, icon: '💀' },
            { label: 'NIVEL ALCANZADO', value: this.finalLevel, icon: '⭐' }
        ];

        const statTexts = [];
        stats.forEach((stat, i) => {
            const yPos = panelY + 100 + (i * 90);

            // Icono
            const icon = this.add.text(W / 2 - 280, yPos + 10, stat.icon, {
                fontSize: '36px'
            }).setOrigin(0, 0.5).setDepth(10).setAlpha(0);

            // Etiqueta
            const label = this.add.text(W / 2 - 220, yPos, stat.label, {
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '22px',
                color: '#999999'
            }).setOrigin(0, 0).setDepth(10).setAlpha(0);

            // Valor (grande y dorado)
            const value = this.add.text(W / 2 + 280, yPos + 5, String(stat.value), {
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '48px',
                color: '#ffe082',
                fontStyle: 'bold',
                stroke: '#ff8f00',
                strokeThickness: 2
            }).setOrigin(1, 0).setDepth(10).setAlpha(0);

            // Línea separadora
            if (i < stats.length - 1) {
                const line = this.add.graphics().setDepth(10).setAlpha(0);
                line.lineStyle(1, 0x333344, 0.5);
                line.lineBetween(W / 2 - panelW / 2 + 40, yPos + 70, W / 2 + panelW / 2 - 40, yPos + 70);
                statTexts.push(line);
            }

            statTexts.push(icon, label, value);
        });

        // ── Animación de entrada del panel ──
        const allPanelElements = [panelBg, cg, panelTitle, sepLine, ...statTexts];

        // Panel aparece
        this.tweens.add({
            targets: [panelBg, cg],
            alpha: 1,
            duration: 600,
            delay: 300,
            ease: 'Sine.easeOut'
        });

        // Título del panel
        this.tweens.add({
            targets: panelTitle,
            alpha: 1,
            duration: 500,
            delay: 600,
            ease: 'Sine.easeIn'
        });

        this.tweens.add({
            targets: sepLine,
            alpha: 1,
            duration: 500,
            delay: 600,
            ease: 'Sine.easeIn'
        });

        // Estadísticas aparecen una por una (counter-up animation)
        statTexts.forEach((el, i) => {
            this.tweens.add({
                targets: el,
                alpha: 1,
                duration: 400,
                delay: 900 + (i * 100),
                ease: 'Sine.easeOut'
            });
        });

        // ═══════════════════════════════════════════
        // BOTÓN "REINTENTAR" / "RETRY" button
        // ═══════════════════════════════════════════
        const btnY = H * 0.78;

        const btnBg = this.add.graphics().setDepth(10).setAlpha(0);
        // Fondo del botón
        btnBg.fillStyle(0x1a0000, 0.6);
        btnBg.fillRoundedRect(W / 2 - 260, btnY, 520, 90, 12);
        btnBg.lineStyle(2, 0xff4444, 0.7);
        btnBg.strokeRoundedRect(W / 2 - 260, btnY, 520, 90, 12);
        btnBg.lineStyle(1, 0xff4444, 0.2);
        btnBg.strokeRoundedRect(W / 2 - 256, btnY + 4, 512, 82, 10);

        const retryText = this.add.text(W / 2, btnY + 45, '▶  REINTENTAR', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '36px',
            color: '#ff6b6b',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11).setAlpha(0);

        // Botón "TÍTULO" debajo
        const titleBtnY = btnY + 120;

        const titleBtnBg = this.add.graphics().setDepth(10).setAlpha(0);
        titleBtnBg.fillStyle(0x0a0a1a, 0.4);
        titleBtnBg.fillRoundedRect(W / 2 - 200, titleBtnY, 400, 70, 10);
        titleBtnBg.lineStyle(1, 0x4fc3f7, 0.4);
        titleBtnBg.strokeRoundedRect(W / 2 - 200, titleBtnY, 400, 70, 10);

        const titleBtnText = this.add.text(W / 2, titleBtnY + 35, '◁  PANTALLA DE TÍTULO', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '24px',
            color: '#4fc3f7'
        }).setOrigin(0.5).setDepth(11).setAlpha(0);

        // Fade in de los botones
        this.tweens.add({
            targets: [btnBg, retryText, titleBtnBg, titleBtnText],
            alpha: 1,
            duration: 800,
            delay: 2000,
            ease: 'Sine.easeIn'
        });

        // Parpadeo del botón reintentar
        this.tweens.add({
            targets: retryText,
            alpha: 0.4,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            delay: 2800,
            ease: 'Sine.easeInOut'
        });

        // Pulso del borde
        this.tweens.add({
            targets: btnBg,
            alpha: 0.4,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            delay: 2800,
            ease: 'Sine.easeInOut'
        });

        // ═══════════════════════════════════════════
        // INTERACCIONES / Interactions
        // ═══════════════════════════════════════════

        // Zona interactiva para reintentar
        const retryZone = this.add.zone(W / 2, btnY + 45, 520, 90)
            .setInteractive().setDepth(20);
        retryZone.on('pointerdown', () => {
            this.cameras.main.flash(400, 255, 100, 100);
            this.cameras.main.fadeOut(600, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('Game');
            });
        });

        // Zona interactiva para título
        const titleZone = this.add.zone(W / 2, titleBtnY + 35, 400, 70)
            .setInteractive().setDepth(20);
        titleZone.on('pointerdown', () => {
            this.cameras.main.fadeOut(800, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('Title');
            });
        });

        // ═══════════════════════════════════════════
        // VERSIÓN / Version
        // ═══════════════════════════════════════════
        this.add.text(W / 2, H * 0.97, 'NOVA FORCE  •  v1.0', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '18px',
            color: '#333333'
        }).setOrigin(0.5).setDepth(10);
    }

    // ═══════════════════════════════════════════
    // UPDATE — Animar estrellas
    // ═══════════════════════════════════════════
    update() {
        if (!this.starGfx || !this.stars) return;

        this.starGfx.clear();
        const H = 1920;

        for (const star of this.stars) {
            star.y += star.speed;
            if (star.y > H) {
                star.y = 0;
                star.x = Phaser.Math.Between(0, 1080);
            }

            const flicker = 0.7 + Math.sin(Date.now() * 0.002 + star.x) * 0.3;
            // Estrellas con tinte rojizo para ambientar
            const tint = Phaser.Math.RND.pick([0xffffff, 0xffcccc, 0xffaaaa]);
            this.starGfx.fillStyle(tint, star.alpha * flicker);
            this.starGfx.fillCircle(star.x, star.y, star.size);
        }
    }
}
