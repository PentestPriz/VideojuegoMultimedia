import Phaser from 'phaser';

export default class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.15); // Visual size ~153x153
        this.body.setCollideWorldBounds(true);
        // Sync body: Texture is 1024x1024. 
        // We want body ~120x120 in world space.
        // 120 / 0.15 = 800.
        this.body.setSize(800, 800);
        this.body.setOffset(112, 112);

        // Propiedades / Properties
        this.hp = 20;
        this.damage = 5;
        this.speed = 100;
    }

    init(stats) {
        // Resetear stats al respawnear del pool / Reset stats on respawn
        this.hp = stats ? stats.hp : 20;
        this.speed = stats ? stats.speed : 100;
        this.damage = stats ? stats.damage : 5;
        this.setAlpha(1); // Reset alpha from damage flash or fade

        // Enable body just in case
        this.body.setEnable(true);
    }

    setTarget(target) {
        if (!target || !target.active) return;

        // Moverse hacia el jugador / Move towards player
        this.scene.physics.moveToObject(this, target, this.speed);
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.die();
        } else {
            // Brillo al recibir daño / Flash on damage
            this.setTint(0xff0000);
            this.scene.time.delayedCall(100, () => {
                this.clearTint();
            });
        }
    }

    die() {
        // Soltar XP? / Drop XP?
        if (this.scene.player) {
            this.scene.player.gainXp(10);
        }
        // Incrementar contador de kills
        if (this.scene.scene.get('Game')) {
            const game = this.scene.scene.get('Game');
            game.kills++;
            // Sonido de explosión real
            this.scene.sound.play('explosion_sfx', { volume: 0.4 });
        }

        // Explosión vectorial / Vector explosion effect
        // Flash central
        const flash = this.scene.add.circle(this.x, this.y, 15, 0xffffff);
        this.scene.tweens.add({
            targets: flash,
            scale: 3,
            alpha: 0,
            duration: 300,
            onComplete: () => flash.destroy()
        });

        // Partículas de explosión
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
                scale: 0,
                alpha: 0,
                duration: Phaser.Math.Between(300, 500),
                ease: 'Sine.easeOut',
                onComplete: () => p.destroy()
            });
        }

        // Desactivar en lugar de destruir para pooling / Disable instad of destroy for pooling
        this.setActive(false);
        this.setVisible(false);
        this.body.setEnable(false);
        this.setPosition(-1000, -1000);
    }
}
