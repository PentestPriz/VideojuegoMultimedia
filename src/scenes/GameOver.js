/**
 * ============================================================================
 * ESCENA GAMEOVER (PANTALLA DE FIN DE JUEGO)
 * ============================================================================
 * 
 * Esta escena se muestra cuando el jugador pierde toda su vida y muere.
 * 
 * Funciones:
 * - Muestra el mensaje "GAME OVER"
 * - Permite al jugador reiniciar el juego tocando la pantalla
 * - Detiene todas las escenas activas (Game y UI) para limpiar el estado
 */

import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
    /**
     * CONSTRUCTOR
     * -----------
     * Define el nombre de esta escena como 'GameOver'.
     */
    constructor() {
        super('GameOver');
    }

    /**
     * CREATE (CREAR)
     * --------------
     * Este método se ejecuta cuando el jugador muere y se muestra la pantalla de Game Over.
     * Aquí detenemos las escenas activas, mostramos el mensaje y configuramos el reinicio.
     */
    create() {
        // ====================================================================
        // DETENER ESCENAS ACTIVAS
        // ====================================================================
        // Es importante detener las escenas anteriores para limpiar el estado del juego

        // Detenemos la escena de UI (interfaz de usuario)
        // Esto elimina la barra de vida y el texto de nivel
        this.scene.stop('UI');

        // Detenemos la escena de Game (el juego principal)
        // Esto asegura que todo se limpie correctamente antes de reiniciar
        this.scene.stop('Game');

        // Reiniciamos la posición de la cámara a (0, 0)
        // Aunque debería estar en (0, 0) al iniciar, esto es una medida de seguridad
        this.cameras.main.setScroll(0, 0);

        // ====================================================================
        // FONDO SEMITRANSPARENTE
        // ====================================================================
        // Creamos un rectángulo negro semitransparente que cubre toda la pantalla
        // Esto oscurece el fondo y hace que el texto sea más legible
        this.add.rectangle(
            540,        // Posición X (centro horizontal)
            960,        // Posición Y (centro vertical)
            1080,       // Ancho (ancho completo de la pantalla)
            1920,       // Alto (alto completo de la pantalla)
            0x000000,   // Color negro en formato hexadecimal
            0.8         // Transparencia: 0.8 = 80% opaco, 20% transparente
        );

        // ====================================================================
        // TEXTO "GAME OVER"
        // ====================================================================
        // Creamos el texto principal que indica que el juego terminó
        this.add.text(
            540,                    // Posición X (centro horizontal)
            800,                    // Posición Y (un poco arriba del centro)
            'GAME OVER',            // El texto a mostrar
            {
                fontSize: '80px',   // Tamaño grande para que sea muy visible
                color: '#ff0000',   // Color rojo para indicar derrota
                fontStyle: 'bold'   // Texto en negrita
            }
        ).setOrigin(0.5);           // Centramos el texto en su posición

        // ====================================================================
        // TEXTO DE INSTRUCCIÓN PARA REINICIAR
        // ====================================================================
        // Creamos el texto que indica cómo reiniciar el juego
        const restartText = this.add.text(
            540,                    // Posición X (centro horizontal)
            1000,                   // Posición Y (debajo del texto "GAME OVER")
            'Tap to Restart',       // El texto a mostrar
            {
                fontSize: '48px',   // Tamaño mediano
                color: '#ffffff'    // Color blanco
            }
        ).setOrigin(0.5);           // Centramos el texto

        // ====================================================================
        // CONFIGURAR REINICIO DEL JUEGO
        // ====================================================================
        // Detectamos cuando el usuario toca o hace clic en cualquier parte de la pantalla
        this.input.on('pointerdown', () => {
            // Cuando el usuario toca, reiniciamos el juego
            // start('Game') detiene la escena actual (GameOver) y comienza una nueva partida
            // Esto reinicia todo: el jugador vuelve a tener vida completa, nivel 1, etc.
            this.scene.start('Game');
        });
    }
}
