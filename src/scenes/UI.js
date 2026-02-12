import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UI');
    }

    create() {
        this.gameScene = this.scene.get('Game');

        const g = this.add.graphics();
        this.hudGraphics = g;

        // ── Esquinas HUD decorativas ──
        this.drawHUDFrame(g);

        // ── Barra de vida (Health Bar) ──
        // Fondo
        this.add.rectangle(80, 50, 420, 28, 0x0a1628, 0.8).setOrigin(0, 0).setStrokeStyle(2, 0x4fc3f7, 0.6);
        // Relleno
        this.healthBar = this.add.rectangle(82, 52, 416, 24, 0x4fc3f7).setOrigin(0, 0);
        // Etiqueta
        this.add.text(85, 28, 'ESCUDO', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '16px',
            color: '#4fc3f7'
        });
        // Texto de HP
        this.hpText = this.add.text(300, 54, '100/100', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5, 0);

        // ── Barra de XP ──
        this.add.rectangle(80, 92, 420, 18, 0x0a1628, 0.8).setOrigin(0, 0).setStrokeStyle(2, 0xffd54f, 0.4);
        this.xpBar = this.add.rectangle(82, 94, 416, 14, 0xffd54f).setOrigin(0, 0);
        this.add.text(85, 76, 'FUERZA', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '14px',
            color: '#ffd54f'
        });

        // ── Nivel (Level) ──
        this.levelText = this.add.text(80, 125, 'NIVEL 1', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '28px',
            color: '#ffe082',
            stroke: '#ff8f00',
            strokeThickness: 2
        });

        // ── Indicador de oleada (Wave) – esquina superior derecha ──
        const wavePanelX = 1080 - 80;
        this.add.rectangle(wavePanelX, 50, 220, 60, 0x0a1628, 0.8).setOrigin(1, 0).setStrokeStyle(2, 0xffd54f, 0.5);
        const deco = this.add.graphics();
        deco.lineStyle(2, 0xffd54f, 0.5);
        deco.beginPath();
        deco.moveTo(wavePanelX - 220, 50);
        deco.lineTo(wavePanelX - 205, 65);
        deco.strokePath();

        this.waveText = this.add.text(wavePanelX - 110, 80, 'OLEADA 1', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '24px',
            color: '#ffd54f'
        }).setOrigin(0.5);

        // ── Contador de kills ──
        this.add.rectangle(wavePanelX, 125, 220, 40, 0x0a1628, 0.8).setOrigin(1, 0).setStrokeStyle(1, 0x4fc3f7, 0.4);
        this.killsText = this.add.text(wavePanelX - 110, 145, 'KILLS: 0', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '18px',
            color: '#4fc3f7'
        }).setOrigin(0.5);

        // ── Mini esquinas decorativas del HUD ──
        this.drawMiniCorners(g, 70, 40, 450, 130);
    }

    drawHUDFrame(g) {
        g.lineStyle(2, 0x4fc3f7, 0.3);
        // Top-left
        g.beginPath();
        g.moveTo(30, 170);
        g.lineTo(30, 30);
        g.lineTo(550, 30);
        g.strokePath();
        // Top-right
        g.beginPath();
        g.moveTo(1050, 30);
        g.lineTo(1050, 130);
        g.strokePath();
        g.beginPath();
        g.moveTo(1050, 30);
        g.lineTo(830, 30);
        g.strokePath();
    }

    drawMiniCorners(g, x, y, w, h) {
        const s = 12;
        g.lineStyle(2, 0x4fc3f7, 0.5);
        // TL
        g.beginPath(); g.moveTo(x, y + s); g.lineTo(x, y); g.lineTo(x + s, y); g.strokePath();
        // TR
        g.beginPath(); g.moveTo(x + w - s, y); g.lineTo(x + w, y); g.lineTo(x + w, y + s); g.strokePath();
        // BL
        g.beginPath(); g.moveTo(x, y + h - s); g.lineTo(x, y + h); g.lineTo(x + s, y + h); g.strokePath();
        // BR
        g.beginPath(); g.moveTo(x + w - s, y + h); g.lineTo(x + w, y + h); g.lineTo(x + w, y + h - s); g.strokePath();
    }

    update() {
        const player = this.gameScene.player;
        if (player) {
            // Health bar
            const hpPercent = Phaser.Math.Clamp(player.hp / player.maxHp, 0, 1);
            this.healthBar.width = 416 * hpPercent;
            // Color dinámico: cyan → amarillo → rojo
            if (hpPercent > 0.5) {
                this.healthBar.setFillStyle(0x4fc3f7);
            } else if (hpPercent > 0.25) {
                this.healthBar.setFillStyle(0xffd54f);
            } else {
                this.healthBar.setFillStyle(0xff4444);
            }
            this.hpText.setText(`${Math.ceil(player.hp)}/${player.maxHp}`);

            // XP bar
            const xpPercent = Phaser.Math.Clamp(player.xp / player.nextLevelXp, 0, 1);
            this.xpBar.width = 416 * xpPercent;

            // Level
            this.levelText.setText('NIVEL ' + player.level);

            // Wave
            if (this.gameScene.wave) {
                this.waveText.setText('OLEADA ' + this.gameScene.wave);
            }

            // Kills
            if (this.gameScene.kills !== undefined) {
                this.killsText.setText('KILLS: ' + this.gameScene.kills);
            }
        }
    }
}
