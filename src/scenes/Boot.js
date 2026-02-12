import Phaser from 'phaser';

/**
 * ESCENA DE CARGA (BootScene)
 * ---------------------------
 * Esta es la primera escena que se ejecuta. Su única misión es cargar
 * todos los archivos necesarios (imágenes y sonidos) en la memoria antes
 * de que empiece el juego, para que luego no haya cortes ni tiempos de espera.
 */
export default class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot'); // Nombre clave de esta escena
    }

    /**
     * MÉTODO PRELOAD
     * Aquí le decimos a Phaser qué archivos tiene que ir a buscar al disco.
     * Phaser se encarga de descargarlos y guardarlos en la caché.
     */
    preload() {
        // Carga de imágenes estáticas
        // load.image('nombre_clave', 'ruta/del/archivo.png');
        this.load.image('space_bg', 'assets/space_bg.png'); // Fondo espacial
        this.load.image('title_screen', 'assets/PantallaInicio.png'); // Imagen título
        this.load.image('gameover_screen', 'assets/PantallaGameOver.png'); // Imagen game over
        this.load.image('enemy', 'assets/enemy.png'); // Sprite del enemigo

        // Carga de HOJAS DE SPRITES (Spritesheets)
        // Son imágenes que contienen varios "cuadros" de animación en una sola fila.
        // frameWidth/frameHeight: Tamaño de cada cuadrito individual.

        // Nave del jugador: tiene 4 cuadros de animación de 99x164 píxeles.
        this.load.spritesheet('player', 'assets/spritesheetNave.png', { frameWidth: 99, frameHeight: 164 });



        // Carga de AUDIO
        // load.audio('nombre_clave', 'ruta/del/archivo.mp3');

        this.load.audio('explosion_sfx', 'assets/explosion.mp3'); // Sonido explosión
        // this.load.audio('bgm', 'Musica.mp3'); // Música de fondo antigua (comentada)
        // this.load.audio('bgm_starwars', 'Star Wars Main Theme (Full).mp3'); // Música opcional de Star Wars (descomentar si se tiene el archivo)
        this.load.audio('gameover_sfx', 'sonidoGameOver.mp3'); // Sonido de derrota
    }

    /**
     * MÉTODO CREATE
     * Se ejecuta automáticamente cuando todos los archivos del preload() se han cargado.
     */
    create() {
        // Una vez cargado todo, iniciamos inmediatamente la siguiente escena: 'Title'
        this.scene.start('Title');
    }
}
