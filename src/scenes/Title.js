/**
 * ============================================================================
 * ESCENA TITLE (PANTALLA DE TÍTULO)
 * ============================================================================
 * 
 * Esta es la pantalla de inicio del juego. Es lo primero que ve el jugador
 * después de que se cargan los recursos.
 * 
 * Funciones:
 * - Muestra el nombre del juego
 * - Muestra instrucciones para iniciar
 * - Espera a que el jugador toque/haga clic para empezar
 * - Tiene una animación de parpadeo para llamar la atención
 */

import Phaser from 'phaser';

export default class TitleScene extends Phaser.Scene {
    /**
     * CONSTRUCTOR
     * -----------
     * Define el nombre de esta escena como 'Title'.
     */
    constructor() {
        super('Title');
    }

    /**
     * CREATE (CREAR)
     * --------------
     * Este método se ejecuta cuando la escena inicia.
     * Aquí creamos todos los elementos visuales y configuramos la interacción.
     */
    create() {
        // Texto de Título / Title Text
        this.add.text(540, 600, 'NOVA FORCE', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '80px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Texto de instrucción / Instruction Text
        const startText = this.add.text(540, 1000, 'Toca para empezar', {
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '48px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // Interacción para iniciar / Interaction to start
        this.input.on('pointerdown', () => {
            // Cuando el usuario toca, iniciamos la escena del juego
            // 'Game' es el nombre de la escena GameScene
            // start() detiene la escena actual (Title) y comienza la nueva (Game)
            this.scene.start('Game');
        });

        // ====================================================================
        // ANIMACIÓN DE PARPADEO
        // ====================================================================
        // Creamos una animación que hace que el texto "Touch to Start" parpadee
        // Esto llama la atención del jugador y le indica que debe tocar
        this.tweens.add({
            targets: startText,     // El objeto que vamos a animar
            alpha: 0,               // Cambiar la transparencia a 0 (invisible)
            duration: 800,          // Duración de la animación: 800ms
            yoyo: true,             // La animación va y vuelve (visible -> invisible -> visible)
            repeat: -1              // Repetir infinitamente (-1 significa para siempre)
        });
    }
}
