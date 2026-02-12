import Phaser from 'phaser';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';
import SoundFX from '../SoundFX';

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
        const bg = this.add.image(1000, 1000, 'space_bg').setDepth(-1);
        bg.setDisplaySize(2000, 2000);
        // Bordes holográficos / Holographic borders
        const borderGfx = this.add.graphics().setDepth(-1);
        borderGfx.lineStyle(3, 0x4fc3f7, 0.4);
        borderGfx.strokeRect(0, 0, 2000, 2000);
        borderGfx.lineStyle(1, 0x4fc3f7, 0.15);
        borderGfx.strokeRect(8, 8, 1984, 1984);

        // Crear jugador / Create player (NOW the animation exists)
        this.player = new Player(this, 1000, 1000);

        // Cámara sigue al jugador / Camera follows player
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, 2000, 2000);

        // Iniciar escena de UI / Start UI scene
        this.scene.launch('UI');

        // Grupos de enemigos / Enemy groups
        this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });

        // Colisiones / Collisions
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerHit, null, this);

        // Evento de subida de nivel / Level up event
        this.player.on('levelup', () => {
            this.scene.pause();
            this.scene.launch('LevelUp');
        });

        // Sistema de sonido / Sound system
        this.sfx = new SoundFX();
        this.input.once('pointerdown', () => this.sfx.init());

        // Música de fondo / Background music
        // Parar cualquier instancia previa para evitar apilamiento
        this.sound.removeByKey('bgm');
        this.bgm = this.sound.add('bgm', { loop: true, volume: 0.2 });
        this.bgm.play();

        // Wave System
        this.wave = 1;
        this.kills = 0;
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

        // Sonido de cazas TIE llegando
        if (this.sfx) this.sfx.tieFlyby();

        // Notificar (Visual feedback estilo Star Wars)
        const text = this.add.text(this.player.x, this.player.y - 100, `⚔ OLEADA ${this.wave} ⚔`, {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '72px',
            color: '#ffe082',
            fontStyle: 'bold',
            stroke: '#ff8f00',
            strokeThickness: 4
        }).setOrigin(0.5).setScale(0.3).setAlpha(0);

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



    applyUpgrade(key) {
        this.player.applyUpgrade(key);
    }

    update() {
        this.player.update();

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
