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

        // Explosion Effect - Static image, not animation
        const explosion = this.scene.add.sprite(this.x, this.y, 'explosion', 0);
        explosion.setScale(0.5); // Adjust size as needed

        // Fade out and destroy
        this.scene.tweens.add({
            targets: explosion,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                explosion.destroy();
            }
        });

        // Desactivar en lugar de destruir para pooling / Disable instad of destroy for pooling
        this.setActive(false);
        this.setVisible(false);
        this.body.setEnable(false);
        this.setPosition(-1000, -1000);
    }
}
