import Phaser from 'phaser';

export default class Player extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y) {
        super(scene, x, y, 60, 60, 0x0000ff); // Blue square 60x60
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setCollideWorldBounds(true);

        // Propiedades stats / Stats properties
        this.speed = 300;
        this.hp = 100;
        this.maxHp = 100;
        this.level = 1;
        this.xp = 0;
        this.nextLevelXp = 100;
        this.damage = 10;

        // Movement vars
        this.targetX = x;
        this.targetY = y;
        this.isMoving = false;

        // Weapon Hitbox (zona enfrente del jugador) / Weapon Hitbox (area in front)
        // Usaremos un rectángulo transparente / We will use a transparent rectangle
        this.weaponHitbox = scene.add.rectangle(x, y, 100, 100, 0xffff00, 0.3);
        scene.physics.add.existing(this.weaponHitbox);
        this.weaponHitbox.visible = true; // Solo visible cuando ataca si quieres debug / debug only

        // Setup input
        this.setupInput(scene);
    }

    setupInput(scene) {
        // Input de ratón/táctil / Mouse/touch input
        scene.input.on('pointermove', (pointer) => {
            if (pointer.isDown) {
                this.isMoving = true;
                this.targetX = pointer.worldX;
                this.targetY = pointer.worldY;
            }
        });

        scene.input.on('pointerup', () => {
            // Opcional: Detenerse al soltar? / Stop on release?
            // Vampire survivors usually joystick or follow finger. 
            // User said: "taking direction from slide" or "following finger".
            // Let's implement simple "move towards pointer if down"
            this.isMoving = false;
            this.body.setVelocity(0);
        });

        scene.input.on('pointerdown', (pointer) => {
            this.isMoving = true;
            this.targetX = pointer.worldX;
            this.targetY = pointer.worldY;
        });
    }

    update() {
        if (this.hp <= 0) {
            this.scene.scene.start('GameOver');
            return;
        }

        // Movimiento continuo si se mantiene pulsado / Continuous movement if held
        const pointer = this.scene.input.activePointer;
        if (pointer.isDown) {
            // Distancia para evitar jitter / Distance to avoid jitter
            const dist = Phaser.Math.Distance.Between(this.x, this.y, pointer.worldX, pointer.worldY);

            if (dist > 10) {
                this.scene.physics.moveTo(this, pointer.worldX, pointer.worldY, this.speed);
                // Rotar hacia el destino / Rotate towards destination
                const angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
                this.rotation = angle;
            } else {
                this.body.setVelocity(0); // Parar si está muy cerca / Stop if too close
            }
        } else {
            this.body.setVelocity(0);
        }

        // Actualizar orbes / Update orbs
        if (this.orbs && this.orbs.length > 0) {
            const time = this.scene.time.now * 0.003; // Velocidad de rotación / Rotation speed
            const radius = 100; // Distancia del jugador / Distance from player

            this.orbs.forEach((orb, index) => {
                const offset = (Math.PI * 2 / this.orbs.length) * index;
                orb.x = this.x + Math.cos(time + offset) * radius;
                orb.y = this.y + Math.sin(time + offset) * radius;
            });
        }

        // Actualizar hitbox del arma / Update weapon hitbox
        // Se coloca enfrente del jugador / Placed in front of player
        // Distancia offset del centro / Offset distance
        const offset = 60;
        this.weaponHitbox.x = this.x + Math.cos(this.rotation) * offset;
        this.weaponHitbox.y = this.y + Math.sin(this.rotation) * offset;
        this.weaponHitbox.rotation = this.rotation;
    }

    takeDamage(amount) {
        this.hp -= amount;
        // Efecto visual de daño / Visual damage effect
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 1
        });
    }

    gainXp(amount) {
        this.xp += amount;
        if (this.xp >= this.nextLevelXp) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.xp = 0;
        this.nextLevelXp *= 1.5;
        this.hp = this.maxHp;
        this.emit('levelup');
    }

    applyUpgrade(key) {
        switch (key) {
            case 'damage':
                this.damage += 5;
                this.scale += 0.1; // Crecen un poco al hacerse más fuertes / Grow a bit
                break;
            case 'speed':
                this.speed += 50;
                break;
            case 'orb':
                this.addOrb();
                break;
            case 'projectile':
                this.activateProjectiles();
                break;
        }
    }

    addOrb() {
        // Si no tenemos contenedor de orbes, crearlo / Create orb container if needed
        if (!this.orbs) {
            this.orbs = [];
        }
        const orb = this.scene.add.rectangle(0, 0, 20, 20, 0x00ffff);
        this.scene.physics.add.existing(orb);
        this.orbs.push(orb);

        // Daño de orbes / Orb damage
        this.scene.physics.add.overlap(orb, this.scene.enemies, (o, e) => {
            e.takeDamage(this.damage);
        });
    }

    activateProjectiles() {
        this.hasProjectiles = true;
        // Disparar cada segundo / Shoot every second
        if (!this.projectileTimer) {
            this.projectileTimer = this.scene.time.addEvent({
                delay: 1000,
                callback: this.shootProjectile,
                callbackScope: this,
                loop: true
            });
        }
    }

    shootProjectile() {
        // Disparar al enemigo más cercano / Shoot nearest enemy
        const enemies = this.scene.enemies.getChildren().filter(e => e.active);
        if (enemies.length === 0) return;

        const closest = this.scene.physics.closest(this, enemies);
        if (closest) {
            const proj = this.scene.add.rectangle(this.x, this.y, 10, 10, 0xffff00);
            this.scene.physics.add.existing(proj);
            this.scene.physics.moveToObject(proj, closest, 500);

            // Destruir tras 2 seg / Destroy after 2s
            this.scene.time.delayedCall(2000, () => proj.destroy());

            // Colisión proyectil-enemigo (necesitamos añadir collider en Game.js o aquí)
            // Lo añadimos dinámicamente o usamos un grupo. Por simplicidad, un overlap aquí:
            this.scene.physics.add.overlap(proj, enemies, (p, e) => {
                e.takeDamage(this.damage);
                p.destroy();
            });
        }
    }
}
