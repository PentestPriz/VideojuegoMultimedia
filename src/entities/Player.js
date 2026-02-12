import Phaser from 'phaser';

/**
 * CLASE JUGADOR (Player)
 * ----------------------
 * Esta clase representa la nave del jugador.
 * Hereda de Phaser.GameObjects.Sprite, por lo que tiene posición, rotación, etc.
 */
export default class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player'); // Usa la imagen 'player' cargada en Boot
        scene.add.existing(this);      // Se añade a la escena visual
        scene.physics.add.existing(this); // Se añade al sistema de físicas

        this.setScale(0.8); // Tamaño visual (80% del original)
        this.body.setCollideWorldBounds(true); // No puede salirse del mundo

        // ── AJUSTE DE HITBOX ──
        // La imagen puede tener espacios vacíos. Ajustamos la caja de colisión
        // para que se ajuste mejor a la forma de la nave.
        this.body.setSize(60, 100);
        this.body.setOffset(20, 32);

        // Iniciar animación de los propulsores
        this.play('player_flight');

        // ── ESTADÍSTICAS DEL JUGADOR ──
        this.speed = 300;       // Velocidad de movimiento
        this.hp = 100;          // Puntos de vida actuales
        this.maxHp = 100;       // Vida máxima
        this.level = 1;         // Nivel actual
        this.xp = 0;            // Experiencia acumulada
        this.nextLevelXp = 100; // Experiencia necesaria para el siguiente nivel
        this.damage = 100;      // Daño base de los ataques

        // ── INVENCIBILIDAD TEMPORAL ──
        // Para evitar morir instantáneamente si te tocan muchos enemigos a la vez
        this.isInvincible = false;
        this.invincibilityDuration = 1500; // 1.5 segundos de inmunidad tras golpe

        // ── CONFIGURACIÓN DE ATAQUE ──
        this.attackCooldown = 500; // Tiempo entre disparos (milisegundos)
        this.lastAttackTime = 0;
        this.attackRadius = 350;   // Distancia máxima de disparo automático
        this.attackAngle = 120;    // Ángulo del cono de visión (grados)

        // ── VISUALIZACIÓN DEL RANGO ──
        // Dibujamos un cono semitransparente para ver dónde atacará la nave
        this.attackGraphics = scene.add.graphics();
        this.attackGraphics.setDepth(5);
    }

    /**
     * Bucle de actualización del jugador (se ejecuta en cada frame)
     */
    update() {
        if (!this.active || this.hp <= 0) {
            this.attackGraphics.clear(); // Si muere, borramos el cono
            return;
        }

        // ── 1. MOVIMIENTO (Joystick Virtual) ──
        // Obtenemos el vector del joystick desde la escena UI
        const uiScene = this.scene.scene.get('UI');
        if (uiScene && uiScene.joystickVector && (uiScene.joystickVector.x !== 0 || uiScene.joystickVector.y !== 0)) {
            // Aplicamos velocidad basada en la inclinación del joystick
            this.body.setVelocity(uiScene.joystickVector.x * this.speed, uiScene.joystickVector.y * this.speed);

            // Rotamos la nave para que mire hacia donde se mueve
            // Math.atan2 nos da el ángulo en radianes basado en X e Y
            const angle = Math.atan2(uiScene.joystickVector.y, uiScene.joystickVector.x);
            this.rotation = angle + Math.PI / 2; // +90 grados porque el sprite mira hacia arriba por defecto
        } else {
            this.body.setVelocity(0); // Si no se toca el joystick, frenar
        }

        // ── 2. HABILIDAD PASIVA: ORBES ──
        // Hacemos que los orbes giren alrededor de la nave
        if (this.orbs && this.orbs.length > 0) {
            const time = this.scene.time.now * 0.003; // Velocidad de giro
            const radius = 100; // Distancia desde la nave
            this.orbs.forEach((orb, index) => {
                // Distribuimos los orbes equitativamente en el círculo
                const offset = (Math.PI * 2 / this.orbs.length) * index;
                orb.x = this.x + Math.cos(time + offset) * radius;
                orb.y = this.y + Math.sin(time + offset) * radius;
            });
        }

        // Dibujar el cono de visión actualizado
        this.drawAttackCone();

        // ── 3. DISPARO AUTOMÁTICO ──
        if (this.scene.time.now > this.lastAttackTime + this.attackCooldown) {
            this.performSectorAttack(); // Buscar enemigo y disparar
            this.lastAttackTime = this.scene.time.now;
        }
    }

    /**
     * Dibuja el cono de visión amarillo frente a la nave
     */
    drawAttackCone() {
        this.attackGraphics.clear();
        this.attackGraphics.fillStyle(0xffff00, 0.2); // Amarillo semitransparente

        // Convertimos grados a radianes para los cálculos matemáticos
        const halfAngleRad = Phaser.Math.DegToRad(this.attackAngle / 2);

        this.attackGraphics.slice(
            this.x,
            this.y,
            this.attackRadius,            // Radio del cono
            (this.rotation - Math.PI / 2) - halfAngleRad, // Ángulo inicial
            (this.rotation - Math.PI / 2) + halfAngleRad, // Ángulo final
            false
        );
        this.attackGraphics.fillPath();
    }

    /**
     * Lógica de disparo: Busca el enemigo más cercano dentro del cono de visión
     */
    performSectorAttack() {
        const enemies = this.scene.enemies.getChildren();

        // Vector "Hacia adelante" de la nave
        const aimRotation = this.rotation - Math.PI / 2;
        const forwardX = Math.cos(aimRotation);
        const forwardY = Math.sin(aimRotation);

        // Umbral para saber si un enemigo está dentro del ángulo (Producto Punto)
        const cosThreshold = Math.cos(Phaser.Math.DegToRad(this.attackAngle / 2));

        let targetEnemy = null;
        let closestDist = Infinity;

        enemies.forEach(enemy => {
            if (!enemy.active) return; // Ignorar enemigos muertos

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distSq = dx * dx + dy * dy; // Distancia al cuadrado (más rápido de calcular)
            const radiusSq = this.attackRadius * this.attackRadius;

            // 1. ¿Está dentro del rango máximo?
            if (distSq <= radiusSq) {
                // 2. ¿Está dentro del cono de visión?
                const dist = Math.sqrt(distSq);
                const dirX = dist > 0 ? dx / dist : 0;
                const dirY = dist > 0 ? dy / dist : 0;

                // Producto Punto: Nos dice cuánto se alinean dos vectores
                const dot = (forwardX * dirX) + (forwardY * dirY);

                // Si dot >= cos(angulo), significa que está dentro del cono
                if (dot >= cosThreshold) {
                    // Nos quedamos con el más cercano
                    if (dist < closestDist) {
                        closestDist = dist;
                        targetEnemy = enemy;
                    }
                }
            }
        });

        // Si encontramos un objetivo válido, disparamos
        if (targetEnemy) {
            this.shootProjectileAt(targetEnemy);
        }
    }

    /**
     * Dispara un proyectil de plasma hacia el objetivo
     */
    shootProjectileAt(target) {
        if (this.scene.sfx) this.scene.sfx.laserShoot(); // Sonido

        // Crear proyectil
        const proj = this.createPlasmaBall(this.x, this.y);
        this.scene.physics.add.existing(proj);
        proj.body.setCircle(6, -6, -6);

        // Mover hacia el enemigo
        this.scene.physics.moveToObject(proj, target, 600);

        // Efecto visual: Rayo láser instantáneo (adorno visual)
        const line = this.scene.add.graphics();
        line.lineStyle(2, 0xff8888, 0.8);
        line.lineBetween(this.x, this.y, target.x, target.y);

        // Desvanecer la línea rápidamente
        this.scene.tweens.add({
            targets: line,
            alpha: 0,
            duration: 150,
            onComplete: () => line.destroy()
        });

        // Destruir proyectil después de 2 segundos si no golpea nada
        this.scene.time.delayedCall(2000, () => {
            if (proj && proj.active) proj.destroy();
        });

        // Colisión Proyectil vs Enemigo
        this.scene.physics.add.overlap(proj, this.scene.enemies, (p, e) => {
            if (e.active && p.active) {
                e.takeDamage(this.damage); // Aplicar daño
                p.destroy(); // Destruir proyectil
            }
        });
    }

    /**
     * Recibir daño (cuando un enemigo toca la nave)
     */
    takeDamage(amount) {
        if (this.isInvincible) return; // Si es invencible, ignorar daño

        if (this.scene.sfx) this.scene.sfx.hit(); // Sonido

        this.hp -= amount;

        // Activar invencibilidad temporal
        this.isInvincible = true;

        // Efecto de parpadeo
        this.blinkTween = this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            duration: 150,
            yoyo: true,
            repeat: 5
        });

        // Quitar invencibilidad después del tiempo definido
        this.invincibilityTimer = this.scene.time.delayedCall(this.invincibilityDuration, () => {
            this.isInvincible = false;
            this.setAlpha(1);
        });

        // Morir si HP llega a 0
        if (this.hp <= 0) {
            this.scene.scene.start('GameOver');
        }
    }

    /**
     * Ganar experiencia al matar enemigos
     */
    gainXp(amount) {
        this.xp += amount;
        if (this.xp >= this.nextLevelXp) {
            this.levelUp();
        }
    }

    /**
     * Subir de nivel y restaurar salud
     */
    levelUp() {
        this.level++;
        this.xp = 0;
        // Cada nivel requiere 50% más de XP que el anterior
        this.nextLevelXp *= 1.5;
        this.hp = this.maxHp; // Curación completa

        if (this.scene.sfx) this.scene.sfx.levelUp(); // Sonido

        // Emitir evento para que Game.js lance el menú de mejoras
        this.emit('levelup');
    }

    /**
     * Aplicar mejora seleccionada desde el menú
     */
    applyUpgrade(key) {
        switch (key) {
            case 'damage': // Aumentar daño y tamaño
                this.damage += 5;
                this.scale += 0.1;
                break;
            case 'speed': // Aumentar velocidad
                this.speed += 50;
                break;
            case 'orb': // Añadir orbe protector
                this.addOrb();
                break;
            case 'projectile': // Activar disparo extra (ejemplo)
                this.activateProjectiles();
                break;
        }
    }

    /**
     * Crea un orbe que gira alrededor del jugador y daña al contacto
     */
    addOrb() {
        if (!this.orbs) this.orbs = [];

        // Dibujo del orbe
        const orbGfx = this.scene.add.graphics();
        orbGfx.fillStyle(0x4488ff);
        orbGfx.fillCircle(0, 0, 10);

        this.scene.physics.add.existing(orbGfx);
        orbGfx.body.setCircle(12, -12, -12); // Hitbox circular
        this.orbs.push(orbGfx);

        // Colisión Orbe vs Enemigos
        this.scene.physics.add.overlap(orbGfx, this.scene.enemies, (o, e) => {
            e.takeDamage(this.damage);
        });
    }

    activateProjectiles() {
        // Implementación de disparo extra (opcional)
        this.hasProjectiles = true;
        if (!this.projectileTimer) {
            this.projectileTimer = this.scene.time.addEvent({
                delay: 1000,
                callback: this.shootProjectile, // Disparo automático omnidireccional
                callbackScope: this,
                loop: true
            });
        }
    }

    // Dispara al enemigo más cercano (usado por la mejora 'projectile')
    shootProjectile() {
        const enemies = this.scene.enemies.getChildren().filter(e => e.active);
        if (enemies.length === 0) return;

        const closest = this.scene.physics.closest(this, enemies);
        if (closest) {
            const proj = this.createPlasmaBall(this.x, this.y);
            this.scene.physics.add.existing(proj);
            proj.body.setCircle(6, -6, -6);
            this.scene.physics.moveToObject(proj, closest, 500);

            // Destrucción automática y colisión local
            this.scene.time.delayedCall(2000, () => proj.destroy());
            this.scene.physics.add.overlap(proj, enemies, (p, e) => {
                if (e.active) {
                    e.takeDamage(this.damage);
                    p.destroy();
                }
            });
        }
    }

    // Helper gráfico para crear la bola de energía
    createPlasmaBall(x, y) {
        const g = this.scene.add.graphics();
        g.setPosition(x, y);
        g.fillStyle(0xffcc00);
        g.fillCircle(0, 0, 6);
        return g;
    }
}
