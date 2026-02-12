/**
 * ============================================================================
 * ESCENA UI (INTERFAZ DE USUARIO / HUD)
 * ============================================================================
 * 
 * Esta escena muestra la interfaz de usuario (UI) durante el juego.
 * Se ejecuta en paralelo con la escena Game y muestra información importante
 * al jugador en tiempo real.
 * 
 * HUD significa "Heads-Up Display" (Pantalla de Información Superpuesta).
 * Es la información que se muestra encima del juego, como la vida y el nivel.
 * 
 * Elementos que muestra:
 * - Barra de vida del jugador (roja)
 * - Nivel actual del jugador
 */

import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    /**
     * CONSTRUCTOR
     * -----------
     * Define el nombre de esta escena como 'UI'.
     */
    constructor() {
        super('UI');
    }

    /**
     * CREATE (CREAR)
     * --------------
     * Este método se ejecuta cuando la escena UI se inicia.
     * Aquí creamos todos los elementos visuales de la interfaz.
     */
    create() {
        // ====================================================================
        // OBTENER REFERENCIA A LA ESCENA GAME
        // ====================================================================
        // Necesitamos acceder a la escena Game para leer los stats del jugador
        // get('Game') nos da acceso a la escena con nombre 'Game'
        this.gameScene = this.scene.get('Game');

        // ====================================================================
        // BARRA DE VIDA - FONDO
        // ====================================================================
        // Creamos un rectángulo negro que servirá como fondo de la barra de vida
        // Esto crea un borde visual para la barra roja
        this.add.rectangle(
            50,         // Posición X (esquina superior izquierda)
            50,         // Posición Y (esquina superior izquierda)
            500,        // Ancho de la barra (500 píxeles de ancho)
            40,         // Alto de la barra (40 píxeles de alto)
            0x000000    // Color negro
        ).setOrigin(0, 0);  // Origen en la esquina superior izquierda

        // ====================================================================
        // BARRA DE VIDA - RELLENO
        // ====================================================================
        // Creamos un rectángulo rojo que representa la vida actual del jugador
        // Este rectángulo cambiará de ancho según la vida del jugador
        this.healthBar = this.add.rectangle(
            50,         // Posición X (misma que el fondo)
            50,         // Posición Y (misma que el fondo)
            500,        // Ancho inicial (500 píxeles = vida completa)
            40,         // Alto (mismo que el fondo)
            0xff0000    // Color rojo
        ).setOrigin(0, 0);  // Origen en la esquina superior izquierda

        // ====================================================================
        // TEXTO DE NIVEL
        // ====================================================================
        // Creamos el texto que muestra el nivel actual del jugador
        this.levelText = this.add.text(
            50,                     // Posición X (debajo de la barra de vida)
            100,                    // Posición Y (debajo de la barra de vida)
            'Level: 1',             // Texto inicial
            {
                fontSize: '32px',   // Tamaño de fuente
                color: '#ffffff'    // Color blanco
            }
        );
    }

    /**
     * UPDATE (ACTUALIZAR)
     * -------------------
     * Este método se ejecuta automáticamente muchas veces por segundo (60 veces normalmente).
     * Aquí actualizamos la UI para reflejar el estado actual del jugador.
     * 
     * Es importante que la UI se actualice constantemente para mostrar
     * la vida y nivel correctos en todo momento.
     */
    update() {
        // Obtenemos el jugador de la escena Game
        const player = this.gameScene.player;

        // Verificamos que el jugador existe antes de intentar acceder a sus propiedades
        // Esto evita errores si la escena Game aún no ha creado al jugador
        if (player) {
            // ================================================================
            // ACTUALIZAR BARRA DE VIDA
            // ================================================================
            // Calculamos el porcentaje de vida que le queda al jugador
            // player.hp / player.maxHp nos da un valor entre 0 y 1
            // Por ejemplo: 50 / 100 = 0.5 (50% de vida)
            const hpPercent = Phaser.Math.Clamp(player.hp / player.maxHp, 0, 1);

            // Ajustamos el ancho de la barra roja según el porcentaje de vida
            // 500 * hpPercent = ancho de la barra
            // Si tiene 100% de vida: 500 * 1 = 500 píxeles (barra completa)
            // Si tiene 50% de vida: 500 * 0.5 = 250 píxeles (media barra)
            // Si tiene 0% de vida: 500 * 0 = 0 píxeles (barra vacía)
            this.healthBar.width = 500 * hpPercent;

            // ================================================================
            // ACTUALIZAR TEXTO DE NIVEL
            // ================================================================
            // Actualizamos el texto para mostrar el nivel actual del jugador
            // setText() cambia el contenido del texto
            // 'Level: ' + player.level combina el texto con el número del nivel
            this.levelText.setText('Level: ' + player.level);
        }
    }
}
