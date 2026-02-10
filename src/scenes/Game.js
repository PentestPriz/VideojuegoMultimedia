import Phaser from 'phaser';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
        // Animation config - CREATE ANIMATIONS FIRST before any entities that use them
        if (!this.anims.exists('explode')) {
            this.anims.create({
                key: 'explode',
                frames: this.anims.generateFrameNumbers('explosion'),
                frameRate: 30, // Faster for smoother 36-frame animation
                hideOnComplete: true
            });
        }

        if (!this.anims.exists('player_flight')) {
            this.anims.create({
                key: 'player_flight',
                frames: this.anims.generateFrameNumbers('player'),
                frameRate: 10,
                repeat: -1
            });
        }

        // Setup básico / Basic setup
        // Límites del mapa (Rectángulo verde) / Map limits (Green rectangle)
        this.physics.world.setBounds(0, 0, 2000, 2000);
        // Fondo / Background
        this.add.tileSprite(1000, 1000, 2000, 2000, 'space_bg').setDepth(-1);
        // Bordes / Borders
        this.add.rectangle(1000, 1000, 2000, 2000).setStrokeStyle(10, 0xff0000).setDepth(-1); // Marco rojo visual

        // Crear jugador / Create player (NOW the animation exists)
        this.player = new Player(this, 1000, 1000);

        // Cámara sigue al jugador / Camera follows player
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, 2000, 2000);

        // Iniciar escena de UI / Start UI scene
        this.scene.launch('UI');

        // Debug Text
        this.debugText = this.add.text(10, 10, 'Debug', { fontSize: '32px', color: '#fff' }).setScrollFactor(0).setDepth(100);

        // Grupos de enemigos / Enemy groups
        this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });

        // Colisiones / Collisions
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerHit, null, this);

        // Evento de subida de nivel / Level up event
        this.player.on('levelup', () => {
            this.scene.pause();
            this.scene.launch('LevelUp');
        });

        // Wave System
        this.wave = 1;
        this.time.addEvent({
            delay: 30000, // 30 segundos por oleada / 30 seconds per wave
            callback: this.nextWave,
            callbackScope: this,
            loop: true
        });

        // Spawner de enemigos / Enemy spawner loop
        this.enemySpawner = this.time.addEvent({
            delay: 1000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    nextWave() {
        this.wave++;
        // Aumentar dificultad / Increase difficulty
        // Reducir tiempo de spawn / Reduce spawn time
        const newDelay = Math.max(200, 1000 - (this.wave * 100));
        this.enemySpawner.delay = newDelay;

        // Notificar (Visual feedback)
        const text = this.add.text(this.player.x, this.player.y - 100, `WAVE ${this.wave}`, {
            fontSize: '64px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: text,
            alpha: 0,
            y: text.y - 100,
            duration: 2000,
            onComplete: () => text.destroy()
        });
    }



    applyUpgrade(key) {
        this.player.applyUpgrade(key);
    }

    update() {
        this.player.update();

        if (this.debugText) {
            this.debugText.setText(`Enemies: ${this.enemies.countActive()}`);
        }

        // Mover enemigos hacia el jugador / Move enemies towards player
        this.enemies.getChildren().forEach(enemy => {
            // Logic inside enemy class, just passing target
            if (enemy.active) {
                enemy.setTarget(this.player);
            }
        });
    }

    spawnEnemy() {
        // Get camera bounds
        const cam = this.cameras.main;
        const camLeft = cam.scrollX;
        const camRight = cam.scrollX + cam.width;
        const camTop = cam.scrollY;
        const camBottom = cam.scrollY + cam.height;

        // Spawn margin outside camera view
        const margin = 100;

        // Randomly choose which side to spawn from (0=top, 1=right, 2=bottom, 3=left)
        const side = Phaser.Math.Between(0, 3);
        let x, y;

        switch (side) {
            case 0: // Top
                x = Phaser.Math.Between(camLeft - margin, camRight + margin);
                y = camTop - margin;
                break;
            case 1: // Right
                x = camRight + margin;
                y = Phaser.Math.Between(camTop - margin, camBottom + margin);
                break;
            case 2: // Bottom
                x = Phaser.Math.Between(camLeft - margin, camRight + margin);
                y = camBottom + margin;
                break;
            case 3: // Left
                x = camLeft - margin;
                y = Phaser.Math.Between(camTop - margin, camBottom + margin);
                break;
        }

        // Clamp to world bounds
        const clampX = Phaser.Math.Clamp(x, 0, 2000);
        const clampY = Phaser.Math.Clamp(y, 0, 2000);

        let enemy = this.enemies.get(clampX, clampY);

        if (!enemy) {
            // Fallback si get devuelve null (no debería si es un grupo dinámico)
            // Fallback if get returns null
            enemy = new Enemy(this, clampX, clampY);
            this.enemies.add(enemy);
        }

        if (enemy) {
            enemy.setActive(true).setVisible(true);
            enemy.body.setEnable(true); // Asegurar física activada / Ensure physics enabled

            // Pasar dificultad basada en oleada / Pass difficulty
            const stats = {
                hp: 20 + (this.wave * 10),
                speed: 100 + (this.wave * 10),
                damage: 5 + this.wave
            };
            enemy.init(stats);
        }
    }



    handlePlayerHit(player, enemy) {
        // Player's takeDamage now handles invincibility
        player.takeDamage(enemy.damage);
    }
}
