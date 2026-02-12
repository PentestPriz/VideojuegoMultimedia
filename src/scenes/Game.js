import Phaser from 'phaser';
import Player from '../entities/Player';  // Importamos la clase del Jugador
import Enemy from '../entities/Enemy';    // Importamos la clase del Enemigo
import SoundFX from '../SoundFX';         // Importamos el gestor de sonidos

/**
 * ESCENA DE JUEGO (GameScene)
 * ---------------------------
 * Aquí ocurre toda la acción del juego.
 * Gestiona el bucle principal, los enemigos, colisiones, puntuación y oleadas.
 */
export default class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
        // ── 1. ANIMACIONES ──
        // Definimos las animaciones globales aquí para que cualquier entidad pueda usarlas.



        // Animación de vuelo del jugador
        if (!this.anims.exists('player_flight')) {
            this.anims.create({
                key: 'player_flight',
                frames: this.anims.generateFrameNumbers('player'),
                frameRate: 10,
                repeat: -1 // Se repite infinitamente
            });
        }

        // ── 2. EL MUNDO DE JUEGO ──
        // Definimos los límites del mundo (2000x2000 px), más grande que la pantalla.
        this.physics.world.setBounds(0, 0, 2000, 2000);

        // Fondo espacial
        const bg = this.add.image(1000, 1000, 'space_bg').setDepth(-1);
        bg.setDisplaySize(2000, 2000); // Estiramos el fondo para cubrir todo el mapa

        // Dibujamos bordes visuales para que el jugador sepa dónde termina el mapa
        const borderGfx = this.add.graphics().setDepth(-1);
        borderGfx.lineStyle(3, 0x4fc3f7, 0.4); // Línea azul cyan semitransparente
        borderGfx.strokeRect(0, 0, 2000, 2000);

        // ── 3. EL JUGADOR ──
        // Creamos la instancia del jugador en el centro del mapa.
        this.player = new Player(this, 1000, 1000);

        // La cámara sigue al jugador para que siempre esté centrada en él.
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, 2000, 2000); // La cámara no puede salir del mapa

        // ── 4. INTERFAZ Y ENEMIGOS ──
        // Lanzamos la escena UI en paralelo (se superpone a esta).
        this.scene.launch('UI');

        // Grupo de enemigos: Usamos un grupo físico para gestionar colisiones y optimizar.
        // 'runChildUpdate': hace que se ejecute el método update() de cada enemigo automáticamente.
        this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });

        // Detección de colisiones: Cuando el jugador toca un enemigo
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerHit, null, this);

        // Evento de subida de nivel (escuchamos al jugador)
        this.player.on('levelup', () => {
            this.scene.pause(); // Pausamos este juego
            this.scene.launch('LevelUp'); // Lanzamos el menú de mejoras
        });

        // ── 5. SONIDO ──
        this.sfx = new SoundFX();
        // Web Audio requiere una interacción del usuario para iniciarse
        this.input.once('pointerdown', () => this.sfx.init());

        // Música de fondo
        this.sound.removeByKey('bgm'); // Limpieza preventiva
        this.bgm = this.sound.add('bgm', { loop: true, volume: 0.2 });
        this.bgm.play();

        // ── 6. OLEADAS Y SPAWNERS ──
        this.wave = 1;
        this.kills = 0;

        // Temporizador para aumentar la dificultad (subir de oleada) cada 30 segundos
        this.time.addEvent({
            delay: 30000,
            callback: this.nextWave,
            callbackScope: this,
            loop: true
        });

        // Bucle infinito para generar enemigos (tiempo de spawn: 1000ms al inicio)
        this.enemySpawner = this.time.addEvent({
            delay: 1000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * Sube la dificultad del juego avanzando de oleada.
     * Se ejecuta cada 30 segundos.
     */
    nextWave() {
        this.wave++;

        // Hacemos que los enemigos salgan más rápido (reducimos el tiempo de spawn)
        const newDelay = Math.max(200, 1000 - (this.wave * 100)); // Mínimo 200ms (límite de velocidad de spawn)
        this.enemySpawner.delay = newDelay;

        // Efecto visual de texto avisando de la nueva oleada
        if (this.sfx) this.sfx.tieFlyby(); // Sonido TIE fighter

        const text = this.add.text(this.player.x, this.player.y - 100, `⚔ OLEADA ${this.wave} ⚔`, {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '72px',
            color: '#ffe082',
            fontStyle: 'bold',
            stroke: '#ff8f00',
            strokeThickness: 4
        }).setOrigin(0.5).setScale(0.3).setAlpha(0);

        // Animación de aparición y desaparición del texto
        this.tweens.add({
            targets: text,
            alpha: 1,
            scale: 1,
            duration: 600,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: text,
                    alpha: 0,
                    y: text.y - 80,
                    scale: 1.3,
                    duration: 1500,
                    delay: 800,
                    ease: 'Sine.easeIn',
                    onComplete: () => text.destroy()
                });
            }
        });
    }

    /**
     * Aplica una mejora elegida en el menú LevelUp.
     */
    applyUpgrade(key) {
        this.player.applyUpgrade(key);
    }

    update() {
        this.player.update();

        // Inteligencia Artificial básica de enemigos:
        // Hacemos que todos persigan al jugador.
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.active) {
                enemy.setTarget(this.player);
            }
        });
    }

    /**
     * Crea un enemigo en una posición aleatoria fuera de la cámara.
     */
    spawnEnemy() {
        // Obtenemos los límites visibles actuales de la cámara
        const cam = this.cameras.main;
        const camLeft = cam.scrollX;
        const camRight = cam.scrollX + cam.width;
        const camTop = cam.scrollY;
        const camBottom = cam.scrollY + cam.height;

        const margin = 100; // Margen extra para que nazcan bien fuera

        // Elegimos al azar un lado (0: Arriba, 1: Derecha, 2: Abajo, 3: Izquierda)
        const side = Phaser.Math.Between(0, 3);
        let x, y;

        switch (side) {
            case 0: // Arriba
                x = Phaser.Math.Between(camLeft - margin, camRight + margin);
                y = camTop - margin;
                break;
            case 1: // Derecha
                x = camRight + margin;
                y = Phaser.Math.Between(camTop - margin, camBottom + margin);
                break;
            case 2: // Abajo
                x = Phaser.Math.Between(camLeft - margin, camRight + margin);
                y = camBottom + margin;
                break;
            case 3: // Izquierda
                x = camLeft - margin;
                y = Phaser.Math.Between(camTop - margin, camBottom + margin);
                break;
        }

        // Aseguramos que no se salgan del mundo (0-2000)
        const clampX = Phaser.Math.Clamp(x, 0, 2000);
        const clampY = Phaser.Math.Clamp(y, 0, 2000);

        // Usamos el POOLING: Intentamos reciclar un enemigo inactivo
        let enemy = this.enemies.get(clampX, clampY);

        if (!enemy) {
            // Si no hay disponibles para reciclar, creamos uno nuevo
            enemy = new Enemy(this, clampX, clampY);
            this.enemies.add(enemy);
        }

        if (enemy) {
            enemy.setActive(true).setVisible(true);
            enemy.body.setEnable(true);

            // Aumentamos las estadísticas del enemigo según la oleada actual
            const stats = {
                hp: 20 + (this.wave * 10),
                speed: 100 + (this.wave * 10),
                damage: 5 + this.wave
            };
            enemy.init(stats);
        }
    }

    /**
     * Se llama cuando el jugador choca con un enemigo.
     */
    handlePlayerHit(player, enemy) {
        player.takeDamage(enemy.damage);
    }
}
