import Phaser from 'phaser';

/**
 * PANTALLA DE FIN DE JUEGO (GameOverScene)
 * ----------------------------------------
 * Se muestra cuando el jugador pierde toda la vida.
 * Detiene el resto de escenas, muestra la puntuación y permite reiniciar.
 */
export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    create() {
        // ── LIMPIEZA ──
        // Detenemos todos los sonidos para que no se solapen con el sonido de derrota
        this.sound.stopAll();

        // Reproducir sonido dramático de Game Over
        this.sound.play('gameover_sfx', { volume: 0.6 });

        // Detener las otras escenas activas
        this.scene.stop('UI'); // La interfaz
        this.scene.stop('Game'); // El juego (enemigos, disparos...)

        // Resetear la cámara (por si se quedó con zoom o desplazada)
        this.cameras.main.setScroll(0, 0);

        // ── IMAGEN DE FONDO ──
        // Usamos una imagen específica para el Game Over
        this.add.image(540, 960, 'gameover_screen')
            .setOrigin(0.5)
            .setDisplaySize(1080, 1920); // Asegurar que llena la pantalla

        // ── TEXTO DE REINICIAR (Parpadeante) ──
        const restartText = this.add.text(540, 1600, 'Pulsa para volver a jugar', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '64px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Animación de parpadeo suave
        this.tweens.add({
            targets: restartText,
            alpha: 0,
            duration: 800,
            ease: 'Power1',
            yoyo: true,
            loop: -1
        });

        // ── REINICIO ──
        // Al tocar cualquier parte de la pantalla, volvemos a empezar
        this.input.on('pointerdown', () => {
            this.scene.start('Game'); // Inicia de nuevo la escena del Juego
        });
    }
}
