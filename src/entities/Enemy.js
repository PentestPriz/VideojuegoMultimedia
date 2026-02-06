import Phaser from 'phaser';

export default class Enemy extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y) {
        super(scene, x, y, 40, 40, 0xff0000); // Red square
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Propiedades / Properties
        this.hp = 20;
        this.damage = 5;
        this.speed = 100;
        // Asegurar que el cuerpo físico existe si el grupo no lo crea bien por defecto
        // Ensure body exists
        // scene.physics.world.enable(this);
    }

    init(stats) {
        // Resetear stats al respawnear del pool / Reset stats on respawn
        this.hp = stats ? stats.hp : 20;
        this.speed = stats ? stats.speed : 100;
        this.damage = stats ? stats.damage : 5;

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
            this.fillColor = 0xffffff;
            this.scene.time.delayedCall(100, () => {
                this.fillColor = 0xff0000;
            });
        }
    }

    die() {
        // Soltar XP? / Drop XP?
        if (this.scene.player) {
            this.scene.player.gainXp(10);
        }

        // Desactivar en lugar de destruir para pooling / Disable instad of destroy for pooling
        this.setActive(false);
        this.setVisible(false);
        this.body.setEnable(false); // IMPORTANTE: Desactivar física
        // Mover fuera de pantalla para que no moleste / Move offscreen
        this.setPosition(-1000, -1000);
    }
}
