import Phaser from 'phaser';

export default class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.8); // Bigger size
        this.body.setCollideWorldBounds(true);

        // Adjust body size to match visual scale
        // Source Frame 99x164. Scale 0.8 -> 79x131.
        // Hitbox: 60x100
        this.body.setSize(60, 100);
        this.body.setOffset(20, 32); // Center based on frame size (99-60)/2 = 19.5. (164-100)/2 = 32.

        // Start animation
        this.play('player_flight');

        // Stats
        this.speed = 300;
        this.hp = 100;
        this.maxHp = 100;
        this.level = 1;
        this.xp = 0;
        this.nextLevelXp = 100;
        this.damage = 100;

        // Invincibility
        this.isInvincible = false;
        this.invincibilityDuration = 1500; // 1.5 seconds

        // Attack Config
        this.attackCooldown = 500; // ms between attack ticks
        this.lastAttackTime = 0;
        this.attackRadius = 350; // Range of the sector - increased for larger firing zone
        this.attackAngle = 120; // Width of the cone in degrees

        // Movement vars
        this.targetX = x;
        this.targetY = y;
        this.isMoving = false;

        // Visual for Attack Range (Cone)
        this.attackGraphics = scene.add.graphics();
        this.attackGraphics.setDepth(5); // Ensure it's above ground but below UI

        // Setup input
        this.setupInput(scene);
    }

    setupInput(scene) {
        // Simple Touch/Mouse Follow
        // Updates target position on touch/click
        scene.input.on('pointerdown', (pointer) => {
            this.isMoving = true;
            this.updateTarget(pointer);
        });

        scene.input.on('pointermove', (pointer) => {
            if (pointer.isDown) {
                this.updateTarget(pointer);
            }
        });

        scene.input.on('pointerup', () => {
            this.isMoving = false;
        });
    }

    updateTarget(pointer) {
        this.targetX = pointer.worldX;
        this.targetY = pointer.worldY;
    }

    update() {
        if (!this.active || this.hp <= 0) {
            this.attackGraphics.clear();
            return;
        }

        // Movement Logic
        if (this.isMoving) {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY);

            if (distance > 10) {
                this.scene.physics.moveTo(this, this.targetX, this.targetY, this.speed);
                // Rotate towards target (This determines attack direction too)
                // Adjustment: Sprite might be facing UP by default. 
                // Phaser rotation is 0 = RIGHT.
                // If sprite is drawn facing UP, we need to add 90 degrees (PI/2).
                // Let's assume standard right-facing or adjust.
                // Usually space ships are drawn facing UP.
                const angle = Phaser.Math.Angle.Between(this.x, this.y, this.targetX, this.targetY);
                this.rotation = angle + Math.PI / 2; // Adjust for UP-facing sprite

                // Simple animation frame swap if frames exist
                // this.setFrame(1); 
            } else {
                this.body.setVelocity(0);
                // Idle
                // this.setFrame(0);
            }
        } else {
            this.body.setVelocity(0);
        }

        // Handle Orbs (Passive skill)
        if (this.orbs && this.orbs.length > 0) {
            const time = this.scene.time.now * 0.003;
            const radius = 100;
            this.orbs.forEach((orb, index) => {
                const offset = (Math.PI * 2 / this.orbs.length) * index;
                orb.x = this.x + Math.cos(time + offset) * radius;
                orb.y = this.y + Math.sin(time + offset) * radius;
            });
        }

        // Draw Attack Cone
        this.drawAttackCone();

        // Check for attacks
        if (this.scene.time.now > this.lastAttackTime + this.attackCooldown) {
            this.performSectorAttack();
            this.lastAttackTime = this.scene.time.now;
        }
    }

    drawAttackCone() {
        this.attackGraphics.clear();

        // Visual feedback color
        this.attackGraphics.fillStyle(0xffff00, 0.2);

        // Calculate start and end angles for the slice
        // Phaser.GameObjects.Graphics.slice uses radians.
        // We centre the slice around this.rotation.
        const halfAngleRad = Phaser.Math.DegToRad(this.attackAngle / 2);

        this.attackGraphics.slice(
            this.x,
            this.y,
            this.attackRadius,
            (this.rotation - Math.PI / 2) - halfAngleRad,
            (this.rotation - Math.PI / 2) + halfAngleRad,
            false
        );
        this.attackGraphics.fillPath();
    }

    performSectorAttack() {
        const enemies = this.scene.enemies.getChildren();

        // Pre-calculate Forward Vector (Based on cone direction = this.rotation - 90deg)
        const aimRotation = this.rotation - Math.PI / 2;
        const forwardX = Math.cos(aimRotation);
        const forwardY = Math.sin(aimRotation);
        const cosThreshold = Math.cos(Phaser.Math.DegToRad(this.attackAngle / 2));

        // Find first enemy in cone to shoot at
        let targetEnemy = null;
        let closestDist = Infinity;

        enemies.forEach(enemy => {
            if (!enemy.active) return;

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distSq = dx * dx + dy * dy;
            const radiusSq = this.attackRadius * this.attackRadius;

            // 1. Distance Check (Squared is faster)
            if (distSq <= radiusSq) {
                // 2. Direction/Angle Check (Dot Product)
                // Normalize Direction to Enemy
                const dist = Math.sqrt(distSq);
                // Avoid divide by zero if dist is 0 (on top of each other)
                const dirX = dist > 0 ? dx / dist : 0;
                const dirY = dist > 0 ? dy / dist : 0;

                // Dot Product: (Ax * Bx) + (Ay * By)
                const dot = (forwardX * dirX) + (forwardY * dirY);

                // If dot >= cos(angle), it is within the cone
                if (dot >= cosThreshold) {
                    if (dist < closestDist) {
                        closestDist = dist;
                        targetEnemy = enemy;
                    }
                }
            }
        });

        // Shoot projectile at target enemy
        if (targetEnemy) {
            this.shootProjectileAt(targetEnemy);
        }
    }

    shootProjectileAt(target) {
        // Sonido de disparo
        if (this.scene.sfx) this.scene.sfx.laserShoot();
        // Create projectile
        const proj = this.createPlasmaBall(this.x, this.y);
        this.scene.physics.add.existing(proj);
        proj.body.setCircle(6, -6, -6);

        // Move towards target
        this.scene.physics.moveToObject(proj, target, 600);

        // Visual Effect: Rayo láser multicapa / Multi-layer laser beam
        const line = this.scene.add.graphics();
        // Resplandor exterior / Outer glow
        line.lineStyle(10, 0xff0000, 0.15);
        line.beginPath();
        line.moveTo(this.x, this.y);
        line.lineTo(target.x, target.y);
        line.strokePath();
        // Haz medio / Mid beam
        line.lineStyle(4, 0xff3333, 0.5);
        line.beginPath();
        line.moveTo(this.x, this.y);
        line.lineTo(target.x, target.y);
        line.strokePath();
        // Núcleo brillante / Bright core
        line.lineStyle(2, 0xff8888, 0.8);
        line.beginPath();
        line.moveTo(this.x, this.y);
        line.lineTo(target.x, target.y);
        line.strokePath();
        // Centro blanco / White center
        line.lineStyle(1, 0xffffff, 1);
        line.beginPath();
        line.moveTo(this.x, this.y);
        line.lineTo(target.x, target.y);
        line.strokePath();
        this.scene.tweens.add({
            targets: line,
            alpha: 0,
            duration: 150,
            onComplete: () => line.destroy()
        });

        // Destroy after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            if (proj && proj.active) {
                proj.destroy();
            }
        });

        // Add collision with enemies
        this.scene.physics.add.overlap(proj, this.scene.enemies, (p, e) => {
            if (e.active && p.active) {
                e.takeDamage(this.damage);
                p.destroy();
            }
        });
    }

    takeDamage(amount) {
        // Don't take damage if invincible
        if (this.isInvincible) return;

        // Sonido de impacto
        if (this.scene.sfx) this.scene.sfx.hit();

        this.hp -= amount;

        // Set invincible
        this.isInvincible = true;

        // Kill previous blink tween to prevent stacking
        if (this.blinkTween) {
            this.blinkTween.stop();
            this.setAlpha(1);
        }
        if (this.invincibilityTimer) {
            this.invincibilityTimer.remove(false);
        }

        // Blinking effect
        this.blinkTween = this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            duration: 150,
            yoyo: true,
            repeat: 5
        });

        // Remove invincibility after duration
        this.invincibilityTimer = this.scene.time.delayedCall(this.invincibilityDuration, () => {
            this.isInvincible = false;
            if (this.blinkTween) this.blinkTween.stop();
            this.setAlpha(1); // Ensure fully visible
        });

        if (this.hp <= 0) {
            this.scene.scene.start('GameOver');
        }
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
        // Sonido de subida de nivel
        if (this.scene.sfx) this.scene.sfx.levelUp();
        this.emit('levelup');
    }

    applyUpgrade(key) {
        switch (key) {
            case 'damage':
                this.damage += 5;
                this.scale += 0.1;
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
        if (!this.orbs) {
            this.orbs = [];
        }

        // Dibujar orbe vectorial (mismo estilo que el icono del menú)
        const orbGfx = this.scene.add.graphics();
        // Aura exterior
        orbGfx.fillStyle(0x2244aa, 0.4);
        orbGfx.fillCircle(0, 0, 14);
        // Orbe principal
        orbGfx.fillStyle(0x4488ff);
        orbGfx.fillCircle(0, 0, 10);
        // Anillo orbital
        orbGfx.lineStyle(1.5, 0x88ccff, 0.8);
        orbGfx.strokeEllipse(0, 0, 26, 10);
        // Brillo
        orbGfx.fillStyle(0xaaddff);
        orbGfx.fillCircle(-3, -4, 4);
        // Núcleo
        orbGfx.fillStyle(0xffffff);
        orbGfx.fillCircle(-2, -3, 2);

        this.scene.physics.add.existing(orbGfx);
        orbGfx.body.setCircle(12, -12, -12);
        this.orbs.push(orbGfx);

        this.scene.physics.add.overlap(orbGfx, this.scene.enemies, (o, e) => {
            e.takeDamage(this.damage);
        });
    }

    activateProjectiles() {
        this.hasProjectiles = true;
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
        const enemies = this.scene.enemies.getChildren().filter(e => e.active);
        if (enemies.length === 0) return;

        const closest = this.scene.physics.closest(this, enemies);
        if (closest) {
            const proj = this.createPlasmaBall(this.x, this.y);
            this.scene.physics.add.existing(proj);
            proj.body.setCircle(6, -6, -6);
            this.scene.physics.moveToObject(proj, closest, 500);
            this.scene.time.delayedCall(2000, () => proj.destroy());

            // Note: This relies on manual check or scene overlap. 
            // Since we removed 'weaponHitbox' overlap in game, we should ensure projectile overlap is handled.
            // Ideally should be set up in Scene, but let's do local overlap add for simplicity.
            this.scene.physics.add.overlap(proj, enemies, (p, e) => {
                if (e.active) {
                    e.takeDamage(this.damage);
                    p.destroy();
                }
            });
        }
    }

    createPlasmaBall(x, y) {
        const g = this.scene.add.graphics();
        g.setPosition(x, y);
        // Aura exterior
        g.fillStyle(0xff6600, 0.3);
        g.fillCircle(0, 0, 10);
        // Cuerpo principal
        g.fillStyle(0xffcc00);
        g.fillCircle(0, 0, 6);
        // Brillo interior
        g.fillStyle(0xffee88);
        g.fillCircle(-1, -1, 3);
        // Núcleo
        g.fillStyle(0xffffff);
        g.fillCircle(-1, -1, 1.5);
        return g;
    }
}
