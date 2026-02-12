import Phaser from 'phaser';

/**
 * MENÚ DE PAUSA — Estilo Star Wars holográfico
 * ─────────────────────────────────────────────
 * Se lanza como overlay sobre Game + UI.
 * Opciones: Continuar, Pantalla de Título.
 */
export default class PauseScene extends Phaser.Scene {
    constructor() {
        super('Pause');
    }

    create() {
        const W = 1080;
        const H = 1920;

        // ═══════════════════════════════════════════
        // FONDO OSCURO SEMITRANSPARENTE
        // ═══════════════════════════════════════════
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0)
            .setDepth(0);
        this.tweens.add({
            targets: overlay,
            fillAlpha: 0.7,
            duration: 300,
            ease: 'Sine.easeOut'
        });

        // ═══════════════════════════════════════════
        // LÍNEAS DE ESCANEO DECORATIVAS (efecto holográfico)
        // ═══════════════════════════════════════════
        const scanLines = this.add.graphics().setDepth(1).setAlpha(0);
        for (let y = 0; y < H; y += 6) {
            scanLines.fillStyle(0x000000, 0.15);
            scanLines.fillRect(0, y, W, 2);
        }
        this.tweens.add({
            targets: scanLines,
            alpha: 1,
            duration: 500,
            delay: 200
        });

        // ═══════════════════════════════════════════
        // PANEL CENTRAL
        // ═══════════════════════════════════════════
        const panelW = 650;
        const panelH = 550;
        const panelX = W / 2 - panelW / 2;
        const panelY = H / 2 - panelH / 2;

        // Fondo del panel
        const panelBg = this.add.graphics().setDepth(5).setAlpha(0);
        panelBg.fillStyle(0x050a18, 0.92);
        panelBg.fillRoundedRect(panelX, panelY, panelW, panelH, 16);
        // Borde exterior cyan
        panelBg.lineStyle(2, 0x4fc3f7, 0.7);
        panelBg.strokeRoundedRect(panelX, panelY, panelW, panelH, 16);
        // Borde interior
        panelBg.lineStyle(1, 0x4fc3f7, 0.2);
        panelBg.strokeRoundedRect(panelX + 4, panelY + 4, panelW - 8, panelH - 8, 14);

        // Esquinas decorativas
        const cg = this.add.graphics().setDepth(6).setAlpha(0);
        const cs = 24;
        cg.lineStyle(3, 0x4fc3f7, 0.9);
        // TL
        cg.beginPath(); cg.moveTo(panelX, panelY + cs); cg.lineTo(panelX, panelY); cg.lineTo(panelX + cs, panelY); cg.strokePath();
        // TR
        cg.beginPath(); cg.moveTo(panelX + panelW - cs, panelY); cg.lineTo(panelX + panelW, panelY); cg.lineTo(panelX + panelW, panelY + cs); cg.strokePath();
        // BL
        cg.beginPath(); cg.moveTo(panelX, panelY + panelH - cs); cg.lineTo(panelX, panelY + panelH); cg.lineTo(panelX + cs, panelY + panelH); cg.strokePath();
        // BR
        cg.beginPath(); cg.moveTo(panelX + panelW - cs, panelY + panelH); cg.lineTo(panelX + panelW, panelY + panelH); cg.lineTo(panelX + panelW, panelY + panelH - cs); cg.strokePath();

        // Animación de entrada del panel
        this.tweens.add({
            targets: [panelBg, cg],
            alpha: 1,
            duration: 400,
            delay: 100,
            ease: 'Back.easeOut'
        });

        // ═══════════════════════════════════════════
        // TÍTULO "PAUSA"
        // ═══════════════════════════════════════════
        const titleGlow = this.add.text(W / 2, panelY + 70, '⏸  PAUSA', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '60px',
            fontStyle: 'bold',
            color: '#0a2040',
            align: 'center'
        }).setOrigin(0.5).setDepth(9).setAlpha(0);

        const title = this.add.text(W / 2, panelY + 70, '⏸  PAUSA', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '60px',
            fontStyle: 'bold',
            color: '#4fc3f7',
            align: 'center',
            stroke: '#1a6ea0',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(10).setAlpha(0).setScale(1.5);

        this.tweens.add({
            targets: title,
            scale: 1,
            alpha: 1,
            duration: 500,
            delay: 200,
            ease: 'Back.easeOut'
        });
        this.tweens.add({
            targets: titleGlow,
            alpha: 0.3,
            duration: 500,
            delay: 200,
            ease: 'Sine.easeOut'
        });

        // Glow pulse
        this.tweens.add({
            targets: titleGlow,
            alpha: 0.15,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            delay: 700,
            ease: 'Sine.easeInOut'
        });

        // Línea separadora
        const sepLine = this.add.graphics().setDepth(10).setAlpha(0);
        sepLine.lineStyle(1, 0x4fc3f7, 0.4);
        sepLine.lineBetween(panelX + 40, panelY + 120, panelX + panelW - 40, panelY + 120);
        this.tweens.add({
            targets: sepLine,
            alpha: 1,
            duration: 400,
            delay: 400
        });

        // ═══════════════════════════════════════════
        // BOTONES DEL MENÚ
        // ═══════════════════════════════════════════
        const buttons = [
            { label: '▶  CONTINUAR', color: 0x4fc3f7, textColor: '#4fc3f7', action: 'resume', y: panelY + 200 },
            { label: '◁  PANTALLA DE TÍTULO', color: 0xffd54f, textColor: '#ffd54f', action: 'title', y: panelY + 330 },
        ];

        buttons.forEach((btn, i) => {
            const btnW = 500;
            const btnH = 80;
            const bx = W / 2 - btnW / 2;

            // Fondo del botón
            const bg = this.add.graphics().setDepth(10).setAlpha(0);
            bg.fillStyle(0x0a1628, 0.7);
            bg.fillRoundedRect(bx, btn.y, btnW, btnH, 10);
            bg.lineStyle(2, btn.color, 0.6);
            bg.strokeRoundedRect(bx, btn.y, btnW, btnH, 10);
            bg.lineStyle(1, btn.color, 0.15);
            bg.strokeRoundedRect(bx + 3, btn.y + 3, btnW - 6, btnH - 6, 8);

            // Texto del botón
            const text = this.add.text(W / 2, btn.y + btnH / 2, btn.label, {
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '30px',
                color: btn.textColor,
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(11).setAlpha(0);

            // Fade in escalonado
            this.tweens.add({
                targets: [bg, text],
                alpha: 1,
                duration: 400,
                delay: 500 + (i * 150),
                ease: 'Sine.easeOut'
            });

            // Zona interactiva
            const zone = this.add.zone(W / 2, btn.y + btnH / 2, btnW, btnH)
                .setInteractive().setDepth(20);

            // Hover effects
            zone.on('pointerover', () => {
                text.setScale(1.05);
                bg.setAlpha(1.2);
            });
            zone.on('pointerout', () => {
                text.setScale(1);
                bg.setAlpha(1);
            });

            zone.on('pointerdown', () => {
                if (btn.action === 'resume') {
                    this.resumeGame();
                } else if (btn.action === 'title') {
                    this.goToTitle();
                }
            });
        });

        // ═══════════════════════════════════════════
        // PARTÍCULAS HOLOGRÁFICAS FLOTANTES
        // ═══════════════════════════════════════════
        for (let i = 0; i < 15; i++) {
            const p = this.add.circle(
                Phaser.Math.Between(panelX + 20, panelX + panelW - 20),
                Phaser.Math.Between(panelY + 20, panelY + panelH - 20),
                Phaser.Math.FloatBetween(1, 2.5),
                0x4fc3f7,
                Phaser.Math.FloatBetween(0.05, 0.25)
            ).setDepth(7);

            this.tweens.add({
                targets: p,
                y: p.y - Phaser.Math.Between(30, 80),
                alpha: 0,
                duration: Phaser.Math.Between(2000, 4000),
                delay: Phaser.Math.Between(0, 3000),
                repeat: -1,
                ease: 'Sine.easeOut',
                onRepeat: () => {
                    p.setPosition(
                        Phaser.Math.Between(panelX + 20, panelX + panelW - 20),
                        Phaser.Math.Between(panelY + panelH * 0.4, panelY + panelH - 20)
                    );
                    p.setAlpha(Phaser.Math.FloatBetween(0.05, 0.25));
                }
            });
        }
    }

    resumeGame() {
        // Reanudar juego y UI
        this.scene.resume('Game');
        this.scene.resume('UI');
        this.scene.stop();
    }

    goToTitle() {
        // Parar todo y volver al título
        this.scene.stop('UI');
        this.scene.stop('Game');
        this.sound.stopAll();
        this.scene.start('Title');
    }
}
