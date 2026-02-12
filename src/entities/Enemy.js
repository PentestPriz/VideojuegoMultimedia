/**
 * ============================================================================
 * CLASE ENEMY (ENEMIGO)
 * ============================================================================
 * 
 * Esta clase representa a los enemigos en el videojuego. Los enemigos son
 * los antagonistas que persiguen al jugador e intentan hacerle daño.
 * 
 * Características principales:
 * - Persiguen al jugador automáticamente
 * - Tienen puntos de vida (HP)
 * - Hacen daño al jugador cuando lo tocan
 * - Otorgan experiencia (XP) al jugador cuando mueren
 * - Usan un sistema de "pooling" para optimizar el rendimiento
 * 
 * ¿Qué es el "pooling"?
 * En lugar de crear y destruir enemigos constantemente (lo cual es lento),
 * reutilizamos los mismos objetos. Cuando un enemigo "muere", simplemente
 * se desactiva y se mueve fuera de la pantalla. Cuando necesitamos un nuevo
 * enemigo, reactivamos uno de los que estaban "muertos".
 */

import Phaser from 'phaser';

export default class Enemy extends Phaser.GameObjects.Sprite {
    /**
     * CONSTRUCTOR
     * -----------
     * El constructor crea un nuevo enemigo y configura sus propiedades iniciales.
     * Se ejecuta automáticamente cuando se crea un enemigo.
     * 
     * @param {Phaser.Scene} scene - La escena del juego donde aparecerá el enemigo
     * @param {number} x - Posición horizontal inicial del enemigo
     * @param {number} y - Posición vertical inicial del enemigo
     */
    constructor(scene, x, y) {
        // Llamamos al constructor de la clase padre (Sprite)
        // Le pasamos la escena, posición (x, y) y el nombre de la imagen ('enemy')
        super(scene, x, y, 'enemy');

        // Añadimos el enemigo a la escena para que sea visible
        scene.add.existing(this);

        // Activamos las físicas para que pueda moverse y colisionar
        scene.physics.add.existing(this);

        // ====================================================================
        // CONFIGURACIÓN VISUAL Y DE COLISIONES
        // ====================================================================

        // Escalamos el sprite a 0.15 (15% de su tamaño original)
        // La imagen original es muy grande (1024x1024), así que la reducimos
        // El tamaño visual final será aproximadamente 153x153 píxeles
        this.setScale(0.15);

        // Hacemos que el enemigo no pueda salirse de los límites del mundo
        this.body.setCollideWorldBounds(true);

        // Configuramos el tamaño del "cuerpo" físico del enemigo
        // La textura original es 1024x1024 píxeles
        // Queremos que el cuerpo sea de 800x800 en el espacio de la textura original
        // Con la escala de 0.15, esto resulta en aproximadamente 120x120 píxeles en el mundo
        this.body.setSize(800, 800);

        // Ajustamos la posición del cuerpo físico para centrarlo en el sprite
        // offset de 112 píxeles centra la hitbox en la textura original
        this.body.setOffset(112, 112);

        // ====================================================================
        // ESTADÍSTICAS DEL ENEMIGO (STATS)
        // ====================================================================

        // HP = Health Points (Puntos de Vida)
        // Cuando llega a 0, el enemigo muere
        this.hp = 20;

        // Daño que hace el enemigo al jugador cuando lo toca
        this.damage = 5;

        // Velocidad de movimiento (píxeles por segundo)
        // Cuanto mayor sea, más rápido perseguirá al jugador
        this.speed = 100;
    }

    /**
     * INICIALIZAR / REINICIAR ENEMIGO
     * --------------------------------
     * Este método se usa para reiniciar un enemigo cuando se reutiliza del pool.
     * En lugar de crear un enemigo nuevo, tomamos uno "muerto" y lo reiniciamos.
     * 
     * @param {Object} stats - Objeto con las estadísticas del enemigo
     * @param {number} stats.hp - Puntos de vida
     * @param {number} stats.speed - Velocidad de movimiento
     * @param {number} stats.damage - Daño que hace al jugador
     */
    init(stats) {
        // Reiniciamos los puntos de vida
        // Si se pasaron stats personalizados, los usamos; si no, usamos 20 por defecto
        // El operador ? : es un "operador ternario": condición ? valor_si_verdadero : valor_si_falso
        this.hp = stats ? stats.hp : 20;

        // Reiniciamos la velocidad
        this.speed = stats ? stats.speed : 100;

        // Reiniciamos el daño
        this.damage = stats ? stats.damage : 5;

        // Restauramos la transparencia a 100% (completamente opaco)
        // Esto es importante porque al recibir daño o morir, la transparencia puede cambiar
        this.setAlpha(1);

        // Habilitamos el cuerpo físico por si estaba deshabilitado
        // Cuando un enemigo "muere", deshabilitamos su física para que no colisione
        // Al reiniciarlo, la reactivamos
        this.body.setEnable(true);
    }

    /**
     * ESTABLECER OBJETIVO (PERSEGUIR AL JUGADOR)
     * ------------------------------------------
     * Este método hace que el enemigo se mueva hacia el jugador.
     * Se llama continuamente desde el método update() de la escena Game.
     * 
     * @param {Player} target - El jugador al que debe perseguir el enemigo
     */
    setTarget(target) {
        // Verificamos que el objetivo existe y está activo
        // Si el jugador está muerto o no existe, no hacemos nada
        if (!target || !target.active) return;

        // Movemos el enemigo hacia el jugador
        // moveToObject calcula automáticamente la dirección y aplica la velocidad
        // El enemigo se moverá en línea recta hacia el jugador a la velocidad configurada
        this.scene.physics.moveToObject(this, target, this.speed);
    }

    /**
     * RECIBIR DAÑO
     * ------------
     * Este método se ejecuta cuando el jugador ataca al enemigo.
     * Reduce la vida del enemigo y crea efectos visuales.
     * 
     * @param {number} amount - Cantidad de daño a recibir
     */
    takeDamage(amount) {
        // Restamos el daño de los puntos de vida
        // -= significa "restar y asignar" (hp = hp - amount)
        this.hp -= amount;

        // Verificamos si el enemigo murió
        if (this.hp <= 0) {
            // Si la vida llegó a 0 o menos, ejecutamos la muerte del enemigo
            this.die();
        } else {
            // ================================================================
            // EFECTO VISUAL: DESTELLO ROJO AL RECIBIR DAÑO
            // ================================================================
            // Si el enemigo sobrevivió, mostramos un destello rojo

            // Aplicamos un tinte rojo al sprite
            // 0xff0000 es rojo en formato hexadecimal
            this.setTint(0xff0000);

            // Programamos que el tinte se quite después de 100ms
            this.scene.time.delayedCall(100, () => {
                // Quitamos el tinte, volviendo al color original
                this.clearTint();
            });
        }
    }

    /**
     * MORIR
     * -----
     * Este método se ejecuta cuando el enemigo pierde toda su vida.
     * Otorga experiencia al jugador, crea un efecto de explosión,
     * y desactiva el enemigo para reutilizarlo más tarde (pooling).
     */
    die() {
        // ====================================================================
        // OTORGAR EXPERIENCIA AL JUGADOR
        // ====================================================================
        // Si el jugador existe, le damos 10 puntos de experiencia
        if (this.scene.player) {
            this.scene.player.gainXp(10);
        }

        // ====================================================================
        // EFECTO VISUAL: EXPLOSIÓN
        // ====================================================================
        // Creamos un sprite de explosión en la posición donde murió el enemigo
        // El 0 al final indica que usamos el frame 0 de la imagen de explosión
        const explosion = this.scene.add.sprite(this.x, this.y, 'explosion', 0);

        // Escalamos la explosión a 50% de su tamaño original
        explosion.setScale(0.5);

        // Creamos una animación que hace que la explosión se desvanezca
        this.scene.tweens.add({
            targets: explosion,    // Objeto a animar
            alpha: 0,              // Cambiar transparencia a 0 (invisible)
            duration: 300,         // Duración de la animación: 300ms
            onComplete: () => {    // Función que se ejecuta al terminar la animación
                // Destruimos el sprite de explosión para liberar memoria
                explosion.destroy();
            }
        });

        // ====================================================================
        // DESACTIVAR ENEMIGO (POOLING)
        // ====================================================================
        // En lugar de destruir el enemigo, lo desactivamos para reutilizarlo

        // Marcamos el enemigo como inactivo
        // Esto hace que no se procese en el update() y no aparezca en búsquedas
        this.setActive(false);

        // Hacemos el enemigo invisible
        this.setVisible(false);

        // Deshabilitamos el cuerpo físico para que no colisione con nada
        this.body.setEnable(false);

        // Movemos el enemigo muy lejos, fuera del mundo del juego
        // Esto es una medida extra de seguridad para que no interfiera con nada
        this.setPosition(-1000, -1000);
    }
}
