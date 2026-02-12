/**
 * ============================================================================
 * ESCENA BOOT (ARRANQUE/PRECARGA)
 * ============================================================================
 * 
 * Esta es la primera escena que se ejecuta cuando el juego inicia.
 * Su función principal es CARGAR todos los recursos (imágenes, sonidos, etc.)
 * que el juego necesitará más adelante.
 * 
 * ¿Por qué es importante?
 * Si intentáramos usar una imagen sin cargarla primero, el juego crashearía.
 * Esta escena se asegura de que todo esté listo antes de empezar a jugar.
 * 
 * Flujo:
 * 1. Se ejecuta preload() - Carga todos los recursos
 * 2. Se ejecuta create() - Cambia a la pantalla de título
 */

import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    /**
     * CONSTRUCTOR
     * -----------
     * Define el nombre de esta escena como 'Boot'.
     * Este nombre se usa para identificar y cambiar entre escenas.
     */
    constructor() {
        super('Boot');
    }

    /**
     * PRELOAD (PRECARGA)
     * ------------------
     * Este método se ejecuta automáticamente al iniciar la escena.
     * Aquí cargamos todas las imágenes y spritesheets que el juego usará.
     * 
     * ¿Qué es un spritesheet?
     * Es una imagen grande que contiene múltiples frames (cuadros) de animación.
     * Por ejemplo, una animación de caminar puede tener 4 frames en una sola imagen.
     */
    preload() {
        // ====================================================================
        // CARGAR IMAGEN DE FONDO
        // ====================================================================
        // Cargamos la imagen del espacio que se usará como fondo del juego
        // 'space_bg' es el nombre con el que nos referiremos a esta imagen
        // 'assets/space_bg.png' es la ruta donde está guardada la imagen
        this.load.image('space_bg', 'assets/space_bg.png');
        this.load.image('title_screen', 'assets/PantallaInicio.png');

        // ====================================================================
        // CARGAR SPRITESHEET DEL JUGADOR
        // ====================================================================
        // Cargamos la hoja de sprites del jugador (nave espacial)
        // La imagen completa mide 396x164 píxeles
        // Contiene 4 frames horizontales, cada uno de 99x164 píxeles
        // 
        // frameWidth: 99  - Ancho de cada frame individual
        // frameHeight: 164 - Alto de cada frame individual
        // 
        // Phaser dividirá automáticamente la imagen en 4 frames que se pueden
        // usar para crear animaciones
        this.load.spritesheet('player', 'assets/spritesheetNave.png', {
            frameWidth: 99,
            frameHeight: 164
        });

        // ====================================================================
        // CARGAR IMAGEN DEL ENEMIGO
        // ====================================================================
        // Cargamos la imagen del enemigo
        // A diferencia del jugador, esta es una imagen simple, no un spritesheet
        this.load.image('enemy', 'assets/enemy.png');

        // ====================================================================
        // CARGAR SPRITESHEET DE EXPLOSIÓN
        // ====================================================================
        // Cargamos la hoja de sprites de la explosión
        // La imagen completa mide 612x612 píxeles
        // Asumimos que es una cuadrícula de 6x6 (36 frames en total)
        // Cada frame mide 102x102 píxeles (612 ÷ 6 = 102)
        // 
        // Aunque actualmente solo usamos el primer frame como imagen estática,
        // podríamos crear una animación de explosión con todos los frames
        this.load.spritesheet('explosion', 'assets/explosionPixelArt.png', {
            frameWidth: 102,
            frameHeight: 102
        });
    }

    /**
     * CREATE (CREAR)
     * --------------
     * Este método se ejecuta automáticamente después de que preload() termina.
     * Una vez que todos los recursos están cargados, cambiamos a la siguiente escena.
     */
    create() {
        // Iniciamos la escena de título (pantalla de inicio)
        // 'Title' es el nombre de la escena TitleScene
        // start() detiene la escena actual y comienza la nueva
        this.scene.start('Title');
    }
}
