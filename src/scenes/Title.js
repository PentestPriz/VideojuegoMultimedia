import Phaser from 'phaser';

/**
 * PANTALLA DE TÍTULO — Estilo Star Wars
 * ─────────────────────────────────────
 * Secuencia cinemática inspirada en la intro de Star Wars:
 *  1. Pantalla negra → "Hace mucho tiempo, en una galaxia muy, muy lejana..."
 *  2. Fade a negro
 *  3. Logo "NOVA FORCE" aparece con zoom dramático (como el logo de Star Wars)
 *  4. Texto de crawl en perspectiva 3D
 *  5. Campo de estrellas animado de fondo
 *  6. "Toca para empezar" parpadeante
 */
export default class TitleScene extends Phaser.Scene {
    constructor() {
        super('Title');
    }

    create() {
        const W = 1080;
        const H = 1920;

        // ═══════════════════════════════════════════
        // FONDO NEGRO TOTAL / Full black background
        // ═══════════════════════════════════════════
        this.cameras.main.setBackgroundColor('#000000');

        // ═══════════════════════════════════════════
        // CAMPO DE ESTRELLAS ANIMADO / Animated starfield
        // ═══════════════════════════════════════════
        this.stars = [];
        const starGfx = this.add.graphics().setDepth(0);
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Phaser.Math.Between(0, W),
                y: Phaser.Math.Between(0, H),
                size: Phaser.Math.FloatBetween(0.5, 2.5),
                speed: Phaser.Math.FloatBetween(0.2, 1.5),
                alpha: Phaser.Math.FloatBetween(0.3, 1)
            });
        }
        this.starGfx = starGfx;

        // ═══════════════════════════════════════════
        // SECUENCIA CINEMÁTICA / Cinematic Sequence
        // ═══════════════════════════════════════════

        // Overlay negro para la secuencia inicial
        this.blackOverlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000)
            .setDepth(100).setAlpha(1);

        // ── FASE 1: "Hace mucho tiempo..." ──
        const introText = this.add.text(W / 2, H / 2, 'Hace mucho tiempo, en una galaxia\nmuy, muy lejana...', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '36px',
            color: '#4fc3f7',
            align: 'center',
            lineSpacing: 16
        }).setOrigin(0.5).setDepth(101).setAlpha(0);

        // Fade in del texto introductorio
        this.tweens.add({
            targets: introText,
            alpha: 1,
            duration: 1500,
            delay: 500,
            ease: 'Sine.easeIn',
            onComplete: () => {
                // Mantener 2 segundos y luego fade out
                this.tweens.add({
                    targets: introText,
                    alpha: 0,
                    duration: 1000,
                    delay: 2000,
                    ease: 'Sine.easeOut',
                    onComplete: () => {
                        introText.destroy();
                        this.startLogoSequence();
                    }
                });
            }
        });
    }

    // ── FASE 2: Logo NOVA FORCE con zoom dramático ──
    startLogoSequence() {
        const W = 1080;
        const H = 1920;

        // Fade out del overlay negro
        this.tweens.add({
            targets: this.blackOverlay,
            alpha: 0,
            duration: 800,
            ease: 'Sine.easeOut',
            onComplete: () => this.blackOverlay.destroy()
        });

        // ═══════════════════════════════════════════
        // LOGO "NOVA FORCE" — aparece MUY grande y se aleja (como Star Wars)
        // ═══════════════════════════════════════════

        // Glow detrás del logo
        const logoGlow = this.add.text(W / 2, H * 0.32, 'NOVA\nFORCE', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '140px',
            fontStyle: 'bold',
            color: '#1a237e',
            align: 'center',
            lineSpacing: -10
        }).setOrigin(0.5).setDepth(9).setAlpha(0).setScale(6);

        // Logo principal
        const logo = this.add.text(W / 2, H * 0.32, 'NOVA\nFORCE', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '140px',
            fontStyle: 'bold',
            color: '#ffe082',
            align: 'center',
            lineSpacing: -10,
            stroke: '#ff8f00',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(10).setAlpha(0).setScale(6);

        // Línea decorativa superior
        const lineTop = this.add.graphics().setDepth(10).setAlpha(0);
        lineTop.lineStyle(2, 0xffe082, 1);
        lineTop.lineBetween(W * 0.15, H * 0.22, W * 0.85, H * 0.22);
        lineTop.lineStyle(1, 0xffe082, 0.4);
        lineTop.lineBetween(W * 0.1, H * 0.225, W * 0.9, H * 0.225);

        // Línea decorativa inferior
        const lineBottom = this.add.graphics().setDepth(10).setAlpha(0);
        lineBottom.lineStyle(2, 0xffe082, 1);
        lineBottom.lineBetween(W * 0.15, H * 0.42, W * 0.85, H * 0.42);
        lineBottom.lineStyle(1, 0xffe082, 0.4);
        lineBottom.lineBetween(W * 0.1, H * 0.425, W * 0.9, H * 0.425);

        // Animación del logo: empieza grande y se reduce (zoom out dramático)
        this.tweens.add({
            targets: [logo, logoGlow],
            scale: 1,
            alpha: 1,
            duration: 3000,
            ease: 'Cubic.easeOut',
            onUpdate: (tween) => {
                // El glow se desvanece a medida que se acerca
                const progress = tween.progress;
                logoGlow.setAlpha(progress * 0.3);
            },
            onComplete: () => {
                // Líneas decorativas aparecen
                this.tweens.add({
                    targets: [lineTop, lineBottom],
                    alpha: 1,
                    duration: 600,
                    ease: 'Sine.easeIn'
                });

                // Pulso sutil del glow
                this.tweens.add({
                    targets: logoGlow,
                    alpha: 0.15,
                    duration: 2000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });

                // Iniciar el crawl text y los controles
                this.startCrawlAndControls();
            }
        });

        // ═══════════════════════════════════════════
        // SUBTÍTULO / Subtitle
        // ═══════════════════════════════════════════
        this.subtitle = this.add.text(W / 2, H * 0.45, '⚔  SPACE SURVIVOR  ⚔', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '28px',
            color: '#4fc3f7',
            letterSpacing: 8
        }).setOrigin(0.5).setDepth(10).setAlpha(0);

        this.tweens.add({
            targets: this.subtitle,
            alpha: 0.8,
            duration: 1000,
            delay: 2800,
            ease: 'Sine.easeIn'
        });
    }

    // ── FASE 3: Crawl text + Controles ──
    startCrawlAndControls() {
        const W = 1080;
        const H = 1920;

        // ═══════════════════════════════════════════
        // CRAWL TEXT — Texto de historia estilo Star Wars
        // ═══════════════════════════════════════════
        const crawlLines = [
            'La galaxia está en peligro.',
            'Las fuerzas oscuras se expanden',
            'destruyendo todo a su paso.',
            '',
            'Solo un piloto puede cambiar',
            'el destino del universo...',
            '',
            '¡Prepara tu nave y lucha!'
        ];

        const crawlContainer = this.add.container(W / 2, H * 0.65).setDepth(5);

        crawlLines.forEach((line, i) => {
            const text = this.add.text(0, i * 50, line, {
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '28px',
                color: '#ffe082',
                align: 'center'
            }).setOrigin(0.5, 0).setAlpha(0);
            crawlContainer.add(text);
        });

        // Animación del crawl: sube lentamente y desaparece
        crawlContainer.setAlpha(0);
        this.tweens.add({
            targets: crawlContainer,
            alpha: 1,
            duration: 1500,
            ease: 'Sine.easeIn',
            onComplete: () => {
                // Los textos aparecen uno por uno
                crawlContainer.list.forEach((textObj, i) => {
                    this.tweens.add({
                        targets: textObj,
                        alpha: 1,
                        duration: 500,
                        delay: i * 300,
                        ease: 'Sine.easeIn'
                    });
                });

                // Crawl sube lentamente
                this.tweens.add({
                    targets: crawlContainer,
                    y: H * 0.48,
                    alpha: 0,
                    duration: 12000,
                    delay: 3000,
                    ease: 'Sine.easeIn'
                });
            }
        });

        // ═══════════════════════════════════════════
        // BOTÓN "TOCA PARA EMPEZAR" / "TAP TO START"
        // ═══════════════════════════════════════════
        const startBg = this.add.graphics().setDepth(10).setAlpha(0);
        startBg.lineStyle(2, 0x4fc3f7, 0.6);
        startBg.strokeRoundedRect(W / 2 - 250, H * 0.88, 500, 80, 12);
        // Inner glow
        startBg.lineStyle(1, 0x4fc3f7, 0.2);
        startBg.strokeRoundedRect(W / 2 - 246, H * 0.88 + 4, 492, 72, 10);

        const startText = this.add.text(W / 2, H * 0.88 + 40, '▶  TOCA PARA EMPEZAR', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '32px',
            color: '#4fc3f7',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(11).setAlpha(0);

        // Fade in del botón
        this.tweens.add({
            targets: [startText, startBg],
            alpha: 1,
            duration: 1000,
            delay: 500,
            ease: 'Sine.easeIn'
        });

        // Parpadeo / Blink animation
        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 1500
        });

        // Pulso del borde
        this.tweens.add({
            targets: startBg,
            alpha: 0.3,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 1500
        });

        // ═══════════════════════════════════════════
        // PARTÍCULAS DECORATIVAS / Decorative particles
        // ═══════════════════════════════════════════
        this.spawnParticles();

        // ═══════════════════════════════════════════
        // INTERACCIÓN / Interaction to start game
        // ═══════════════════════════════════════════
        this.input.on('pointerdown', () => {
            // Flash blanco al iniciar
            this.cameras.main.flash(500, 255, 255, 255);
            this.cameras.main.fadeOut(800, 0, 0, 0);

            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('Game');
            });
        });

        // ═══════════════════════════════════════════
        // VERSIÓN / Version text
        // ═══════════════════════════════════════════
        this.add.text(W / 2, H * 0.97, 'v1.0  •  DAM 2º Curso', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '18px',
            color: '#555555'
        }).setOrigin(0.5).setDepth(10);
    }

    // ═══════════════════════════════════════════
    // PARTÍCULAS LATERALES — destellos tipo hyperdrive
    // ═══════════════════════════════════════════
    spawnParticles() {
        const W = 1080;
        const H = 1920;

        // Crear partículas flotantes alrededor del logo
        this.floatingParticles = [];
        for (let i = 0; i < 30; i++) {
            const p = this.add.circle(
                Phaser.Math.Between(100, W - 100),
                Phaser.Math.Between(100, H - 100),
                Phaser.Math.FloatBetween(1, 3),
                0x4fc3f7,
                Phaser.Math.FloatBetween(0.1, 0.5)
            ).setDepth(3);

            this.tweens.add({
                targets: p,
                y: p.y - Phaser.Math.Between(50, 150),
                alpha: 0,
                duration: Phaser.Math.Between(3000, 6000),
                delay: Phaser.Math.Between(0, 5000),
                repeat: -1,
                ease: 'Sine.easeOut',
                onRepeat: () => {
                    p.setPosition(
                        Phaser.Math.Between(100, W - 100),
                        Phaser.Math.Between(H * 0.3, H * 0.8)
                    );
                    p.setAlpha(Phaser.Math.FloatBetween(0.1, 0.5));
                }
            });

            this.floatingParticles.push(p);
        }
    }

    // ═══════════════════════════════════════════
    // UPDATE — Animar estrellas cada frame
    // ═══════════════════════════════════════════
    update() {
        if (!this.starGfx || !this.stars) return;

        this.starGfx.clear();
        const H = 1920;

        for (const star of this.stars) {
            // Las estrellas caen lentamente (efecto de viaje espacial)
            star.y += star.speed;
            if (star.y > H) {
                star.y = 0;
                star.x = Phaser.Math.Between(0, 1080);
            }

            // Parpadeo sutil
            const flicker = 0.7 + Math.sin(Date.now() * 0.003 + star.x) * 0.3;
            this.starGfx.fillStyle(0xffffff, star.alpha * flicker);
            this.starGfx.fillCircle(star.x, star.y, star.size);
        }
    }
}
