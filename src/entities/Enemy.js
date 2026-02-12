import Phaser from 'phaser';

/**
 * CLASE ENEMIGO (Enemy)
 * ---------------------
 * Representa los cazas TIE enemigos.
 * Usamos "Object Pooling" (reciclaje de objetos) para mejorar el rendimiento.
 */
export default class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.15); // Tamaño visual
        this.body.setCollideWorldBounds(true);

        // Ajustamos la hitbox para que sea coherente con su tamaño en pantalla
        this.body.setSize(800, 800);
        this.body.setOffset(112, 112);

        // Stats por defecto
        this.hp = 20;
        this.damage = 5;
        this.speed = 100;
    }

    /**
     * INIT - Se llama cada vez que "reciclamos" un enemigo del pool.
     * Sirve para resetear sus estadísticas (vida, velocidad) según la dificultad actual.
     */
    init(stats) {
        this.hp = stats ? stats.hp : 20;
        this.speed = stats ? stats.speed : 100;
        this.damage = stats ? stats.damage : 5;
        this.setAlpha(1); // Asegurar que sea visible (no transparente por daño previo)
        this.body.setEnable(true); // Reactivar físicas
    }

    /**
     * Perseguir al jugador
     */
    setTarget(target) {
        if (!target || !target.active) return;

        // Phaser tiene una función mágica para mover objetos hacia otros a velocidad constante
        this.scene.physics.moveToObject(this, target, this.speed);
    }

    /**
     * Recibir daño del jugador
     */
    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.die(); // Morir
        } else {
            // Feedback visual: Se pone rojo brevemente al ser golpeado
            this.setTint(0xff0000);
            this.scene.time.delayedCall(100, () => {
                this.clearTint(); // Volver al color normal
            });
        }
    }

    /**
     * Morir y explosión
     */
    die() {
        // Dar XP al jugador
        if (this.scene.player) {
            this.scene.player.gainXp(10);
        }
        // Sumar kill
        if (this.scene.scene.get('Game')) {
            const game = this.scene.scene.get('Game');
            game.kills++;
            // Sonido de explosión
            this.scene.sound.play('explosion_sfx', { volume: 0.4 });
        }

        // Efecto visual: EXPLOSIÓN DE PARTÍCULAS
        // 1. Flash blanco central
        const flash = this.scene.add.circle(this.x, this.y, 15, 0xffffff);
        this.scene.tweens.add({
            targets: flash,
            scale: 3,
            alpha: 0,
            duration: 300,
            onComplete: () => flash.destroy()
        });

        // 2. Fragmentos de escombros saliendo disparados
        const colors = [0xff4400, 0xff8800, 0xffcc00, 0xffee44, 0xff2200];
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i + Phaser.Math.FloatBetween(-0.3, 0.3);
            const dist = Phaser.Math.Between(60, 120);
            const size = Phaser.Math.Between(4, 10);
            const color = colors[Phaser.Math.Between(0, colors.length - 1)];

            const p = this.scene.add.circle(this.x, this.y, size, color);
            this.scene.tweens.add({
                targets: p,
                x: this.x + Math.cos(angle) * dist,
                y: this.y + Math.sin(angle) * dist,
                scale: 0,   // Se encogen
                alpha: 0,   // Desaparecen
                duration: Phaser.Math.Between(300, 500),
                ease: 'Sine.easeOut',
                onComplete: () => p.destroy()
            });
        }

        // IMPORTANTE: POOLING
        // No destruimos (destroy) el objeto, solo lo desactivamos y ocultamos.
        // Así podemos volver a usarlo luego (en el método init) sin tener que crear uno nuevo.
        this.setActive(false);
        this.setVisible(false);
        this.body.setEnable(false);
        this.setPosition(-1000, -1000); // Lo movemos lejos por si acaso
    }
}
