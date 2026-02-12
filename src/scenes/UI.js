import Phaser from 'phaser';

/**
 * ESCENA DE INTERFAZ DE USUARIO (UIScene)
 * ---------------------------------------
 * Esta escena se superpone al juego ('Game') y muestra información vital:
 * - Barra de vida y experiencia.
 * - Nivel y oleada actual.
 * - Joystick virtual para móviles.
 */
export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UI');
    }

    create() {
        // Obtenemos una referencia a la escena del juego para leer datos del jugador
        this.gameScene = this.scene.get('Game');

        const g = this.add.graphics();
        this.hudGraphics = g;

        // ── MARCOS DECORATIVOS DEL HUD ──
        this.drawHUDFrame(g); // Dibuja las líneas tecnológicas de las esquinas

        // ── BARRA DE ESCUDO (VIDA) ──
        // Fondo oscuro semitransparente
        this.add.rectangle(80, 50, 420, 28, 0x0a1628, 0.8).setOrigin(0, 0).setStrokeStyle(2, 0x4fc3f7, 0.6);
        // Barra de relleno (color cyan)
        this.healthBar = this.add.rectangle(82, 52, 416, 24, 0x4fc3f7).setOrigin(0, 0);
        // Texto "ESCUDO"
        this.add.text(85, 28, 'ESCUDO', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '16px',
            color: '#4fc3f7'
        });
        // Texto numérico (ej: 100/100)
        this.hpText = this.add.text(300, 54, '100/100', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5, 0);

        // ── BARRA DE FUERZA (XP) ──
        this.add.rectangle(80, 92, 420, 18, 0x0a1628, 0.8).setOrigin(0, 0).setStrokeStyle(2, 0xffd54f, 0.4);
        this.xpBar = this.add.rectangle(82, 94, 416, 14, 0xffd54f).setOrigin(0, 0);
        this.add.text(85, 76, 'FUERZA', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '14px',
            color: '#ffd54f'
        });

        // ── INDICADOR DE NIVEL ──
        this.levelText = this.add.text(80, 125, 'NIVEL 1', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '28px',
            color: '#ffe082',
            stroke: '#ff8f00',
            strokeThickness: 2
        });

        // ── PANEL DE OLEADA (Esquina superior derecha) ──
        const wavePanelX = 1080 - 80;
        this.add.rectangle(wavePanelX, 50, 220, 60, 0x0a1628, 0.8).setOrigin(1, 0).setStrokeStyle(2, 0xffd54f, 0.5);

        // Decoración extra
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

        // ── CONTADOR DE BAJAS (KILLS) ──
        this.add.rectangle(wavePanelX, 125, 220, 40, 0x0a1628, 0.8).setOrigin(1, 0).setStrokeStyle(1, 0x4fc3f7, 0.4);
        this.killsText = this.add.text(wavePanelX - 110, 145, 'KILLS: 0', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '18px',
            color: '#4fc3f7'
        }).setOrigin(0.5);

        // Dibujar esquinas pequeñas decorativas
        this.drawMiniCorners(g, 70, 40, 450, 130);

        // ── INICIAR JOYSTICK VIRTUAL ──
        this.setupJoystick();
    }

    /**
     * Configuración del Joystick virtual para pantallas táctiles.
     * Permite mover la nave tocando y arrastrando en cualquier parte de la pantalla.
     */
    setupJoystick() {
        this.joystickVector = { x: 0, y: 0 }; // Vector de dirección (-1 a 1)
        this.joystickActive = false;
        this.centerX = 0; // Centro del toque inicial
        this.centerY = 0;
        this.radius = 120; // Radio máximo del joystick

        // Base del joystick (círculo grande)
        this.joystickBase = this.add.graphics();
        this.joystickBase.setDepth(100);
        this.joystickBase.setVisible(false);

        // Stick del joystick (círculo pequeño que se mueve)
        this.joystickStick = this.add.graphics();
        this.joystickStick.setDepth(101);
        this.joystickStick.setVisible(false);

        // EVENTO: Al tocar la pantalla (Pointer Down)
        this.input.on('pointerdown', (pointer) => {
            this.joystickActive = true;
            this.centerX = pointer.x;
            this.centerY = pointer.y;

            // Dibujar la base en la posición del toque
            this.joystickBase.clear();
            this.joystickBase.lineStyle(4, 0x4fc3f7, 0.4);
            this.joystickBase.strokeCircle(this.centerX, this.centerY, this.radius);
            this.joystickBase.setVisible(true);

            // Dibujar el stick en el centro
            this.joystickStick.clear();
            this.joystickStick.fillStyle(0x4fc3f7, 0.6);
            this.joystickStick.fillCircle(this.centerX, this.centerY, 50);
            this.joystickStick.setVisible(true);
        });

        // EVENTO: Al arrastrar el dedo (Pointer Move)
        this.input.on('pointermove', (pointer) => {
            if (this.joystickActive) {
                this.updateJoystick(pointer);
            }
        });

        // EVENTO: Al soltar el dedo (Pointer Up)
        this.input.on('pointerup', () => {
            this.joystickActive = false;
            this.joystickVector = { x: 0, y: 0 }; // Resetear movimiento
            this.joystickBase.setVisible(false);
            this.joystickStick.setVisible(false);
        });
    }

    /**
     * Calcula la posición del stick y el vector de movimiento
     */
    updateJoystick(pointer) {
        // Distancia desde el centro inicial al dedo actual
        const dx = pointer.x - this.centerX;
        const dy = pointer.y - this.centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Ángulo del movimiento
        const angle = Math.atan2(dy, dx);

        // Limitamos la distancia al radio máximo del joystick
        const limitedDist = Math.min(dist, this.radius);

        // Calculamos la posición visual del stick
        const targetX = this.centerX + Math.cos(angle) * limitedDist;
        const targetY = this.centerY + Math.sin(angle) * limitedDist;

        // Redibujamos el stick en su nueva posición
        this.joystickStick.clear();
        this.joystickStick.fillStyle(0x4fc3f7, 0.8);
        this.joystickStick.fillCircle(targetX, targetY, 50);

        // Normalizamos el vector (valor entre -1 y 1 para X e Y)
        // Esto es lo que usa el Player.js para moverse.
        this.joystickVector.x = Math.cos(angle) * (limitedDist / this.radius);
        this.joystickVector.y = Math.sin(angle) * (limitedDist / this.radius);
    }

    // Funciones auxiliares para dibujar bordes decorativos (estética sci-fi)
    drawHUDFrame(g) {
        g.lineStyle(2, 0x4fc3f7, 0.3);
        // Top-left
        g.beginPath(); g.moveTo(30, 170); g.lineTo(30, 30); g.lineTo(550, 30); g.strokePath();
        // Top-right
        g.beginPath(); g.moveTo(1050, 30); g.lineTo(1050, 130); g.strokePath();
        g.beginPath(); g.moveTo(1050, 30); g.lineTo(830, 30); g.strokePath();
    }

    drawMiniCorners(g, x, y, w, h) {
        const s = 12; // Tamaño de la esquina
        g.lineStyle(2, 0x4fc3f7, 0.5);
        // TL, TR, BL, BR (Top-Left, Top-Right, etc.)
        g.beginPath(); g.moveTo(x, y + s); g.lineTo(x, y); g.lineTo(x + s, y); g.strokePath();
        g.beginPath(); g.moveTo(x + w - s, y); g.lineTo(x + w, y); g.lineTo(x + w, y + s); g.strokePath();
        g.beginPath(); g.moveTo(x, y + h - s); g.lineTo(x, y + h); g.lineTo(x + s, y + h); g.strokePath();
        g.beginPath(); g.moveTo(x + w - s, y + h); g.lineTo(x + w, y + h); g.lineTo(x + w, y + h - s); g.strokePath();
    }

    /**
     * Bucle de actualización: Sincroniza la UI con los datos del jugador
     */
    update() {
        const player = this.gameScene.player; // Accedemos al jugador de la otra escena
        if (player) {
            // Actualizar barra de vida
            const hpPercent = Phaser.Math.Clamp(player.hp / player.maxHp, 0, 1);
            this.healthBar.width = 416 * hpPercent;

            // Cambiar color según vida restante (Semáforo: verde/azul -> amarillo -> rojo)
            if (hpPercent > 0.5) {
                this.healthBar.setFillStyle(0x4fc3f7);
            } else if (hpPercent > 0.25) {
                this.healthBar.setFillStyle(0xffd54f);
            } else {
                this.healthBar.setFillStyle(0xff4444);
            }
            this.hpText.setText(`${Math.ceil(player.hp)}/${player.maxHp}`);

            // Actualizar barra de XP
            const xpPercent = Phaser.Math.Clamp(player.xp / player.nextLevelXp, 0, 1);
            this.xpBar.width = 416 * xpPercent;

            // Actualizar textos
            this.levelText.setText('NIVEL ' + player.level);

            if (this.gameScene.wave) {
                this.waveText.setText('OLEADA ' + this.gameScene.wave);
            }

            if (this.gameScene.kills !== undefined) {
                this.killsText.setText('KILLS: ' + this.gameScene.kills);
            }
        }
    }
}
