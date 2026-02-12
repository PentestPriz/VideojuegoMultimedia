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
        // ====================================================================
        // TEXTO DEL TÍTULO
        // ====================================================================
        // Creamos el texto principal que muestra el nombre del juego
        this.add.text(
            540,                    // Posición X (centro horizontal de la pantalla)
            600,                    // Posición Y (un poco arriba del centro)
            'VAMPIRE CLONE',        // El texto a mostrar
            {
                fontSize: '80px',   // Tamaño de la fuente
                color: '#ffffff',   // Color blanco
                fontStyle: 'bold'   // Texto en negrita
            }
        ).setOrigin(0.5);           // Centramos el texto en su posición (0.5 = centro)

        // ====================================================================
        // TEXTO DE INSTRUCCIÓN
        // ====================================================================
        // Creamos el texto que indica cómo iniciar el juego
        const startText = this.add.text(
            540,                    // Posición X (centro horizontal)
            1000,                   // Posición Y (más abajo que el título)
            'Touch to Start',       // El texto a mostrar
            {
                fontSize: '48px',   // Tamaño de fuente más pequeño que el título
                color: '#aaaaaa'    // Color gris claro
            }
        ).setOrigin(0.5);           // Centramos el texto

        // ====================================================================
        // CONFIGURAR INTERACCIÓN
        // ====================================================================
        // Detectamos cuando el usuario toca o hace clic en cualquier parte de la pantalla
        // 'pointerdown' es el evento que se dispara al tocar/hacer clic
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
