/**
 * ============================================================================
 * CLASE PLAYER (JUGADOR)
 * ============================================================================
 * 
 * Esta clase representa al jugador en el videojuego. Es como el "molde" o 
 * "plantilla" que define cómo se ve, cómo se mueve, cómo ataca y todas las
 * características del personaje que controlas.
 * 
 * En programación, una "clase" es como una receta: define los ingredientes
 * (propiedades/variables) y los pasos (métodos/funciones) para crear algo.
 * 
 * Esta clase hereda de "Phaser.GameObjects.Sprite", lo que significa que
 * aprovecha funcionalidades ya creadas por Phaser para mostrar imágenes
 * en pantalla y animarlas.
 */

import Phaser from 'phaser';

export default class Player extends Phaser.GameObjects.Sprite {
    /**
     * CONSTRUCTOR
     * -----------
     * El constructor es una función especial que se ejecuta automáticamente
     * cuando creamos un nuevo jugador. Es como el "momento de nacimiento"
     * del personaje, donde se configuran todas sus características iniciales.
     * 
     * @param {Phaser.Scene} scene - La escena del juego donde aparecerá el jugador.
     *                                Una escena es como un "nivel" o "pantalla" del juego.
     * @param {number} x - La posición horizontal (izquierda-derecha) donde aparecerá el jugador.
     * @param {number} y - La posición vertical (arriba-abajo) donde aparecerá el jugador.
     */
    constructor(scene, x, y) {
        // super() llama al constructor de la clase padre (Phaser.GameObjects.Sprite)
        // Le pasamos la escena, posición (x, y) y el nombre de la imagen ('player')
        super(scene, x, y, 'player');

        // Añadimos este objeto a la escena para que sea visible en el juego
        scene.add.existing(this);

        // Activamos las físicas para este objeto (permite movimiento, colisiones, etc.)
        scene.physics.add.existing(this);

        // ====================================================================
        // CONFIGURACIÓN VISUAL Y DE COLISIONES
        // ====================================================================

        // Escalamos el sprite a 0.8 (80% de su tamaño original)
        // Esto hace que el jugador sea un poco más pequeño visualmente
        this.setScale(0.8);

        // Hacemos que el jugador no pueda salirse de los límites del mundo del juego
        // Es como poner una valla invisible que no puede cruzar
        this.body.setCollideWorldBounds(true);

        // Ajustamos el tamaño del "cuerpo" físico del jugador
        // El "cuerpo" es la caja invisible que se usa para detectar colisiones
        // La imagen original mide 99x164 píxeles, pero queremos una hitbox de 60x100
        this.body.setSize(60, 100);

        // Ajustamos la posición del cuerpo físico respecto a la imagen
        // Esto centra la hitbox en el sprite visual
        this.body.setOffset(20, 32);

        // Iniciamos la animación de vuelo del jugador
        // 'player_flight' es el nombre de la animación que se creó en la escena Game
        this.play('player_flight');

        // ====================================================================
        // ESTADÍSTICAS DEL JUGADOR (STATS)
        // ====================================================================
        // Estas variables guardan información sobre el estado del jugador

        // Velocidad de movimiento (píxeles por segundo)
        // Cuanto mayor sea este número, más rápido se moverá el jugador
        this.speed = 300;

        // HP = Health Points (Puntos de Vida)
        // Cuando llega a 0, el jugador muere
        this.hp = 100;

        // Vida máxima que puede tener el jugador
        this.maxHp = 100;

        // Nivel actual del jugador (empieza en nivel 1)
        this.level = 1;

        // XP = Experience Points (Puntos de Experiencia)
        // Se ganan al matar enemigos
        this.xp = 0;

        // Experiencia necesaria para subir al siguiente nivel
        this.nextLevelXp = 100;

        // Daño que hace el jugador con sus ataques
        this.damage = 100;

        // ====================================================================
        // SISTEMA DE INVENCIBILIDAD
        // ====================================================================
        // Cuando el jugador recibe daño, se vuelve invencible temporalmente
        // para evitar perder toda la vida de golpe

        // Indica si el jugador es invencible en este momento (true/false)
        this.isInvincible = false;

        // Duración de la invencibilidad en milisegundos (1500ms = 1.5 segundos)
        this.invincibilityDuration = 1500;

        // ====================================================================
        // CONFIGURACIÓN DEL SISTEMA DE ATAQUE
        // ====================================================================

        // Tiempo de espera entre ataques en milisegundos (500ms = 0.5 segundos)
        // Esto evita que el jugador dispare demasiado rápido
        this.attackCooldown = 500;

        // Guarda el momento del último ataque (en milisegundos)
        // Se usa para calcular si ya puede atacar de nuevo
        this.lastAttackTime = 0;

        // Radio del área de ataque (en píxeles)
        // Define qué tan lejos puede atacar el jugador
        this.attackRadius = 350;

        // Ángulo del cono de ataque (en grados)
        // El jugador ataca en forma de cono hacia donde mira
        // 120 grados es un cono bastante amplio
        this.attackAngle = 120;

        // ====================================================================
        // VARIABLES DE MOVIMIENTO
        // ====================================================================

        // Posición objetivo hacia donde el jugador se está moviendo
        this.targetX = x;
        this.targetY = y;

        // Indica si el jugador se está moviendo actualmente (true/false)
        this.isMoving = false;

        // ====================================================================
        // GRÁFICOS VISUALES DEL ÁREA DE ATAQUE
        // ====================================================================

        // Creamos un objeto gráfico para dibujar el cono de ataque
        // Esto es visual y ayuda al jugador a ver su rango de ataque
        this.attackGraphics = scene.add.graphics();

        // setDepth(5) controla el orden de dibujo (capas)
        // Números más altos se dibujan encima de números más bajos
        // 5 significa que estará por encima del suelo pero debajo de la UI
        this.attackGraphics.setDepth(5);

        // ====================================================================
        // CONFIGURACIÓN DE CONTROLES
        // ====================================================================

        // Llamamos a la función que configura los controles táctiles/mouse
        this.setupInput(scene);
    }

    /**
     * CONFIGURAR ENTRADA (CONTROLES)
     * -------------------------------
     * Este método configura cómo el jugador controla su personaje.
     * Detecta cuando el usuario toca o hace clic en la pantalla.
     * 
     * @param {Phaser.Scene} scene - La escena donde se configuran los controles
     */
    setupInput(scene) {
        // Detectamos cuando el usuario presiona (toca o hace clic) en la pantalla
        // 'pointerdown' es el evento que se dispara al tocar/hacer clic
        scene.input.on('pointerdown', (pointer) => {
            // Activamos el movimiento del jugador
            this.isMoving = true;

            // Actualizamos la posición objetivo hacia donde debe moverse
            // 'pointer' contiene información sobre dónde tocó el usuario
            this.updateTarget(pointer);
        });

        // Detectamos cuando el usuario mueve el dedo/mouse mientras mantiene presionado
        // 'pointermove' se dispara cada vez que el puntero se mueve
        scene.input.on('pointermove', (pointer) => {
            // Solo actualizamos el objetivo si el usuario está presionando
            // pointer.isDown es true cuando está tocando/haciendo clic
            if (pointer.isDown) {
                this.updateTarget(pointer);
            }
        });

        // Detectamos cuando el usuario suelta el dedo/botón del mouse
        // 'pointerup' se dispara al soltar
        scene.input.on('pointerup', () => {
            // Detenemos el movimiento del jugador
            this.isMoving = false;
        });
    }

    /**
     * ACTUALIZAR OBJETIVO DE MOVIMIENTO
     * ----------------------------------
     * Este método actualiza la posición hacia donde el jugador debe moverse.
     * 
     * @param {Phaser.Input.Pointer} pointer - Objeto que contiene información sobre
     *                                          dónde tocó/hizo clic el usuario
     */
    updateTarget(pointer) {
        // Guardamos la posición X (horizontal) en el mundo del juego
        // worldX es la posición real en el mundo, no en la pantalla
        // (importante cuando la cámara se mueve)
        this.targetX = pointer.worldX;

        // Guardamos la posición Y (vertical) en el mundo del juego
        this.targetY = pointer.worldY;
    }

    /**
     * ACTUALIZAR (CICLO PRINCIPAL DEL JUGADOR)
     * -----------------------------------------
     * Este método se ejecuta automáticamente muchas veces por segundo (normalmente 60 veces).
     * Es como el "latido del corazón" del jugador: controla su movimiento, rotación,
     * ataques y todas las acciones que realiza continuamente.
     * 
     * En programación de videojuegos, esto se llama "game loop" o ciclo de juego.
     */
    update() {
        // Si el jugador está muerto o inactivo, limpiamos los gráficos y no hacemos nada más
        // El símbolo || significa "O" (si una condición O la otra es verdadera)
        // El símbolo <= significa "menor o igual que"
        if (!this.active || this.hp <= 0) {
            this.attackGraphics.clear(); // Borramos el cono de ataque visual
            return; // Salimos de la función sin hacer nada más
        }

        // ====================================================================
        // LÓGICA DE MOVIMIENTO
        // ====================================================================
        if (this.isMoving) {
            // Calculamos la distancia entre la posición actual del jugador y su objetivo
            // Distance.Between calcula la distancia en línea recta entre dos puntos
            const distance = Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY);

            // Si la distancia es mayor a 10 píxeles, seguimos moviéndonos
            // (10 píxeles es un margen pequeño para considerar que "ya llegamos")
            if (distance > 10) {
                // Movemos al jugador hacia el objetivo a la velocidad configurada
                // moveTo calcula automáticamente la dirección y aplica la velocidad
                this.scene.physics.moveTo(this, this.targetX, this.targetY, this.speed);

                // ====================================================================
                // ROTACIÓN DEL JUGADOR
                // ====================================================================
                // Calculamos el ángulo entre el jugador y su objetivo
                // Esto nos dice en qué dirección debe mirar el jugador
                const angle = Phaser.Math.Angle.Between(this.x, this.y, this.targetX, this.targetY);

                // Aplicamos la rotación al sprite
                // Sumamos Math.PI / 2 (90 grados) porque el sprite mira hacia arriba por defecto
                // y en Phaser, rotación 0 significa "mirando a la derecha"
                this.rotation = angle + Math.PI / 2;
            } else {
                // Si ya llegamos al objetivo (distancia menor a 10), detenemos el movimiento
                // setVelocity(0) pone la velocidad a cero en ambas direcciones (X e Y)
                this.body.setVelocity(0);
            }
        } else {
            // Si no estamos en modo movimiento, nos aseguramos de estar quietos
            this.body.setVelocity(0);
        }

        // ====================================================================
        // MANEJO DE ORBES GIRATORIOS (Habilidad Pasiva)
        // ====================================================================
        // Los orbes son una mejora opcional que gira alrededor del jugador
        // && significa "Y" (ambas condiciones deben ser verdaderas)
        if (this.orbs && this.orbs.length > 0) {
            // Obtenemos el tiempo actual y lo multiplicamos por 0.003
            // Esto crea un valor que aumenta lentamente, usado para la animación circular
            const time = this.scene.time.now * 0.003;

            // Radio del círculo en el que giran los orbes (100 píxeles del jugador)
            const radius = 100;

            // Para cada orbe, calculamos su nueva posición
            this.orbs.forEach((orb, index) => {
                // Calculamos un desplazamiento angular para cada orbe
                // Math.PI * 2 es un círculo completo (360 grados en radianes)
                // Dividimos el círculo entre el número de orbes para espaciarlos uniformemente
                const offset = (Math.PI * 2 / this.orbs.length) * index;

                // Calculamos la posición X del orbe usando coseno (para movimiento circular)
                orb.x = this.x + Math.cos(time + offset) * radius;

                // Calculamos la posición Y del orbe usando seno (para movimiento circular)
                orb.y = this.y + Math.sin(time + offset) * radius;
            });
        }

        // ====================================================================
        // SISTEMA DE ATAQUE
        // ====================================================================

        // Dibujamos el cono de ataque visual en cada frame
        this.drawAttackCone();

        // Verificamos si ya pasó suficiente tiempo desde el último ataque
        // El símbolo > significa "mayor que"
        if (this.scene.time.now > this.lastAttackTime + this.attackCooldown) {
            // Realizamos un ataque en el área del cono
            this.performSectorAttack();

            // Guardamos el momento actual como el último ataque
            this.lastAttackTime = this.scene.time.now;
        }
    }

    /**
     * DIBUJAR CONO DE ATAQUE
     * ----------------------
     * Este método dibuja un cono amarillo semitransparente que muestra
     * el área donde el jugador puede atacar. Es una ayuda visual.
     */
    drawAttackCone() {
        // Limpiamos cualquier dibujo anterior
        // clear() borra todo lo que se había dibujado antes
        this.attackGraphics.clear();

        // Configuramos el color y transparencia del cono
        // 0xffff00 es amarillo en formato hexadecimal
        // 0.2 es la transparencia (20% opaco, 80% transparente)
        this.attackGraphics.fillStyle(0xffff00, 0.2);

        // Calculamos la mitad del ángulo del cono en radianes
        // Los radianes son otra forma de medir ángulos (como los grados)
        // DegToRad convierte de grados a radianes
        const halfAngleRad = Phaser.Math.DegToRad(this.attackAngle / 2);

        // Dibujamos una "rebanada" de círculo (como una porción de pizza)
        this.attackGraphics.slice(
            this.x,                                      // Posición X del centro (donde está el jugador)
            this.y,                                      // Posición Y del centro
            this.attackRadius,                           // Radio del círculo
            (this.rotation - Math.PI / 2) - halfAngleRad, // Ángulo inicial de la rebanada
            (this.rotation - Math.PI / 2) + halfAngleRad, // Ángulo final de la rebanada
            false                                        // No es antihorario
        );

        // Rellenamos la forma que acabamos de definir
        this.attackGraphics.fillPath();
    }

    /**
     * REALIZAR ATAQUE EN SECTOR (CONO)
     * ---------------------------------
     * Este método busca enemigos dentro del cono de ataque y dispara
     * al enemigo más cercano que encuentre.
     * 
     * Usa matemáticas avanzadas (producto punto) para determinar si un
     * enemigo está dentro del cono de visión del jugador.
     */
    performSectorAttack() {
        // Obtenemos todos los enemigos que existen en la escena
        // getChildren() devuelve una lista (array) con todos los enemigos
        const enemies = this.scene.enemies.getChildren();

        // ====================================================================
        // PRE-CÁLCULOS PARA OPTIMIZACIÓN
        // ====================================================================
        // Calculamos la dirección hacia donde apunta el jugador
        // Restamos Math.PI / 2 porque el sprite mira hacia arriba por defecto
        const aimRotation = this.rotation - Math.PI / 2;

        // Vector de dirección hacia adelante (donde mira el jugador)
        // Math.cos y Math.sin convierten un ángulo en una dirección X,Y
        const forwardX = Math.cos(aimRotation);
        const forwardY = Math.sin(aimRotation);

        // Calculamos el coseno del ángulo máximo del cono
        // Esto se usa para verificar si un enemigo está dentro del cono
        const cosThreshold = Math.cos(Phaser.Math.DegToRad(this.attackAngle / 2));

        // Variables para guardar el enemigo objetivo
        let targetEnemy = null;      // El enemigo al que vamos a disparar
        let closestDist = Infinity;  // Distancia al enemigo más cercano (empieza en infinito)

        // ====================================================================
        // BUSCAR ENEMIGO MÁS CERCANO EN EL CONO
        // ====================================================================
        // Revisamos cada enemigo uno por uno
        enemies.forEach(enemy => {
            // Si el enemigo no está activo (está muerto), lo ignoramos
            if (!enemy.active) return;

            // Calculamos la distancia al enemigo
            const dx = enemy.x - this.x;  // Diferencia en X
            const dy = enemy.y - this.y;  // Diferencia en Y

            // Distancia al cuadrado (más rápido de calcular que la distancia real)
            const distSq = dx * dx + dy * dy;

            // Radio de ataque al cuadrado
            const radiusSq = this.attackRadius * this.attackRadius;

            // 1. VERIFICACIÓN DE DISTANCIA
            // ¿El enemigo está dentro del rango de ataque?
            if (distSq <= radiusSq) {
                // 2. VERIFICACIÓN DE DIRECCIÓN/ÁNGULO (Producto Punto)
                // Calculamos la distancia real (raíz cuadrada)
                const dist = Math.sqrt(distSq);

                // Normalizamos la dirección al enemigo (convertimos a un vector unitario)
                // Evitamos dividir por cero si el enemigo está exactamente encima del jugador
                const dirX = dist > 0 ? dx / dist : 0;
                const dirY = dist > 0 ? dy / dist : 0;

                // Producto Punto: (Ax * Bx) + (Ay * By)
                // Esto nos dice qué tan "alineados" están dos vectores
                // Si el resultado es cercano a 1, apuntan en la misma dirección
                const dot = (forwardX * dirX) + (forwardY * dirY);

                // Si el producto punto es mayor o igual al umbral, el enemigo está en el cono
                // >= significa "mayor o igual que"
                if (dot >= cosThreshold) {
                    // Si este enemigo está más cerca que el anterior más cercano
                    if (dist < closestDist) {
                        closestDist = dist;      // Actualizamos la distancia más cercana
                        targetEnemy = enemy;     // Este es nuestro nuevo objetivo
                    }
                }
            }
        });

        // ====================================================================
        // DISPARAR AL ENEMIGO OBJETIVO
        // ====================================================================
        // Si encontramos un enemigo en el cono, le disparamos
        if (targetEnemy) {
            this.shootProjectileAt(targetEnemy);
        }
    }

    /**
     * DISPARAR PROYECTIL HACIA UN OBJETIVO
     * -------------------------------------
     * Este método crea un proyectil (bala) que se mueve hacia un enemigo
     * y crea un efecto visual de láser.
     * 
     * @param {Enemy} target - El enemigo al que vamos a disparar
     */
    shootProjectileAt(target) {
        // ====================================================================
        // CREAR PROYECTIL
        // ====================================================================
        // Creamos un rectángulo rojo pequeño (8x8 píxeles) que será nuestro proyectil
        // 0xff0000 es rojo en formato hexadecimal
        const proj = this.scene.add.rectangle(this.x, this.y, 8, 8, 0xff0000);

        // Añadimos físicas al proyectil para que pueda moverse y colisionar
        this.scene.physics.add.existing(proj);

        // Movemos el proyectil hacia el enemigo objetivo a velocidad 600
        // moveToObject calcula automáticamente la dirección
        this.scene.physics.moveToObject(proj, target, 600);

        // ====================================================================
        // EFECTO VISUAL: LÍNEA DE LÁSER ROJA
        // ====================================================================
        // Creamos un objeto gráfico para dibujar una línea
        const line = this.scene.add.graphics();

        // Configuramos el estilo de la línea: grosor 2, color rojo
        line.lineStyle(2, 0xff0000);

        // Comenzamos a dibujar
        line.beginPath();

        // Dibujamos desde la posición del jugador
        line.moveTo(this.x, this.y);

        // Hasta la posición del enemigo
        line.lineTo(target.x, target.y);

        // Trazamos la línea
        line.strokePath();

        // Creamos una animación (tween) para hacer que la línea desaparezca
        this.scene.tweens.add({
            targets: line,           // Objeto a animar
            alpha: 0,                // Cambiar transparencia a 0 (invisible)
            duration: 200,           // Duración de la animación: 200ms
            onComplete: () => line.destroy()  // Al terminar, destruir la línea
        });

        // ====================================================================
        // DESTRUCCIÓN AUTOMÁTICA DEL PROYECTIL
        // ====================================================================
        // Programamos que el proyectil se destruya después de 2 segundos
        // Esto evita que los proyectiles que no golpean nada se queden para siempre
        this.scene.time.delayedCall(2000, () => {
            // Verificamos que el proyectil aún existe antes de destruirlo
            if (proj && proj.active) {
                proj.destroy();
            }
        });

        // ====================================================================
        // CONFIGURAR COLISIÓN CON ENEMIGOS
        // ====================================================================
        // Detectamos cuando el proyectil toca a un enemigo
        // overlap detecta cuando dos objetos se superponen
        this.scene.physics.add.overlap(proj, this.scene.enemies, (p, e) => {
            // Verificamos que tanto el proyectil como el enemigo estén activos
            if (e.active && p.active) {
                // Hacemos daño al enemigo
                e.takeDamage(this.damage);

                // Destruimos el proyectil
                p.destroy();
            }
        });
    }

    /**
     * RECIBIR DAÑO
     * ------------
     * Este método se ejecuta cuando un enemigo golpea al jugador.
     * Reduce la vida y activa la invencibilidad temporal.
     * 
     * @param {number} amount - Cantidad de daño a recibir
     */
    takeDamage(amount) {
        // Si el jugador es invencible, no recibe daño
        // Esto evita que pierda toda la vida instantáneamente
        if (this.isInvincible) return;

        // Restamos el daño de los puntos de vida
        // -= significa "restar y asignar" (hp = hp - amount)
        this.hp -= amount;

        // Activamos la invencibilidad temporal
        this.isInvincible = true;

        // ====================================================================
        // EFECTO VISUAL: PARPADEO
        // ====================================================================
        // Creamos una animación que hace que el jugador parpadee
        this.scene.tweens.add({
            targets: this,       // Animamos al jugador
            alpha: 0.3,          // Reducimos la opacidad a 30% (casi transparente)
            duration: 150,       // Cada parpadeo dura 150ms
            yoyo: true,          // La animación va y vuelve (transparente -> opaco -> transparente)
            repeat: 5            // Repetimos 5 veces (5 parpadeos en 1.5 segundos)
        });

        // ====================================================================
        // QUITAR INVENCIBILIDAD DESPUÉS DE UN TIEMPO
        // ====================================================================
        // Programamos que la invencibilidad se quite después de la duración configurada
        this.scene.time.delayedCall(this.invincibilityDuration, () => {
            // Desactivamos la invencibilidad
            this.isInvincible = false;

            // Nos aseguramos de que el jugador sea completamente visible
            this.setAlpha(1);
        });

        // ====================================================================
        // VERIFICAR SI EL JUGADOR MURIÓ
        // ====================================================================
        // Si la vida llegó a 0 o menos, el jugador muere
        if (this.hp <= 0) {
            // Cambiamos a la escena de Game Over
            this.scene.scene.start('GameOver');
        }
    }

    /**
     * GANAR EXPERIENCIA (XP)
     * ----------------------
     * Este método se ejecuta cuando el jugador mata un enemigo.
     * Añade experiencia y verifica si el jugador sube de nivel.
     * 
     * @param {number} amount - Cantidad de experiencia ganada
     */
    gainXp(amount) {
        // Añadimos la experiencia ganada al total
        // += significa "sumar y asignar" (xp = xp + amount)
        this.xp += amount;

        // Verificamos si ya tenemos suficiente XP para subir de nivel
        if (this.xp >= this.nextLevelXp) {
            // Llamamos a la función que maneja la subida de nivel
            this.levelUp();
        }
    }

    /**
     * SUBIR DE NIVEL
     * --------------
     * Este método se ejecuta cuando el jugador gana suficiente experiencia.
     * Aumenta el nivel, restaura la vida y hace más difícil el siguiente nivel.
     */
    levelUp() {
        // Incrementamos el nivel en 1
        // ++ significa "sumar 1" (level = level + 1)
        this.level++;

        // Reiniciamos la experiencia a 0 para el nuevo nivel
        this.xp = 0;

        // Aumentamos la experiencia necesaria para el próximo nivel
        // *= significa "multiplicar y asignar" (nextLevelXp = nextLevelXp * 1.5)
        // Cada nivel requiere 50% más experiencia que el anterior
        this.nextLevelXp *= 1.5;

        // Restauramos la vida al máximo
        this.hp = this.maxHp;

        // Emitimos un evento 'levelup' que otras partes del juego pueden escuchar
        // Esto hace que se abra la pantalla de selección de mejoras
        this.emit('levelup');
    }

    /**
     * APLICAR MEJORA
     * --------------
     * Este método se ejecuta cuando el jugador selecciona una mejora
     * al subir de nivel. Cada mejora tiene un efecto diferente.
     * 
     * @param {string} key - Identificador de la mejora seleccionada
     *                       Puede ser: 'damage', 'speed', 'orb', o 'projectile'
     */
    applyUpgrade(key) {
        // switch es como una serie de "si esto, entonces aquello"
        // Dependiendo del valor de 'key', ejecuta un bloque diferente
        switch (key) {
            case 'damage':
                // MEJORA DE DAÑO
                // Aumentamos el daño en 5 puntos
                this.damage += 5;

                // Aumentamos el tamaño del jugador en 10%
                // Esto es un efecto visual para mostrar que es más poderoso
                this.scale += 0.1;
                break;  // Salimos del switch

            case 'speed':
                // MEJORA DE VELOCIDAD
                // Aumentamos la velocidad de movimiento en 50 píxeles/segundo
                this.speed += 50;
                break;

            case 'orb':
                // MEJORA DE ORBE GIRATORIO
                // Añadimos un orbe que gira alrededor del jugador y daña enemigos
                this.addOrb();
                break;

            case 'projectile':
                // MEJORA DE PROYECTILES AUTOMÁTICOS
                // Activamos disparos automáticos que buscan enemigos
                this.activateProjectiles();
                break;
        }
    }

    /**
     * AÑADIR ORBE GIRATORIO
     * ---------------------
     * Este método crea un orbe que gira alrededor del jugador.
     * Los orbes dañan a los enemigos que tocan.
     * Se pueden tener múltiples orbes a la vez.
     */
    addOrb() {
        // Si aún no existe el array de orbes, lo creamos
        // Un array es como una lista que puede contener múltiples elementos
        if (!this.orbs) {
            this.orbs = [];
        }

        // Creamos un rectángulo cyan (azul claro) de 20x20 píxeles
        // 0x00ffff es cyan en formato hexadecimal
        const orb = this.scene.add.rectangle(0, 0, 20, 20, 0x00ffff);

        // Añadimos físicas al orbe para detectar colisiones
        this.scene.physics.add.existing(orb);

        // Añadimos el orbe a nuestra lista de orbes
        // push() añade un elemento al final de un array
        this.orbs.push(orb);

        // Configuramos que cuando el orbe toque un enemigo, le haga daño
        // overlap detecta cuando dos objetos se tocan
        this.scene.physics.add.overlap(orb, this.scene.enemies, (o, e) => {
            // Hacemos daño al enemigo con el daño actual del jugador
            e.takeDamage(this.damage);
        });
    }

    /**
     * ACTIVAR PROYECTILES AUTOMÁTICOS
     * --------------------------------
     * Este método activa un sistema de disparo automático.
     * El jugador disparará proyectiles automáticamente cada segundo
     * hacia el enemigo más cercano.
     */
    activateProjectiles() {
        // Marcamos que el jugador tiene proyectiles activos
        this.hasProjectiles = true;

        // Si aún no existe un temporizador de proyectiles, lo creamos
        if (!this.projectileTimer) {
            // addEvent crea un evento que se repite en el tiempo
            this.projectileTimer = this.scene.time.addEvent({
                delay: 1000,                    // Esperar 1000ms (1 segundo) entre disparos
                callback: this.shootProjectile, // Función a ejecutar cada segundo
                callbackScope: this,            // 'this' dentro de la función se refiere al jugador
                loop: true                      // Repetir indefinidamente
            });
        }
    }

    /**
     * DISPARAR PROYECTIL AUTOMÁTICO
     * ------------------------------
     * Este método se ejecuta automáticamente cada segundo si el jugador
     * tiene la mejora de proyectiles. Dispara al enemigo más cercano.
     */
    shootProjectile() {
        // Obtenemos solo los enemigos que están activos (vivos)
        // filter() crea una nueva lista con solo los elementos que cumplen una condición
        const enemies = this.scene.enemies.getChildren().filter(e => e.active);

        // Si no hay enemigos, no hacemos nada
        // length es el número de elementos en el array
        if (enemies.length === 0) return;

        // Encontramos el enemigo más cercano al jugador
        // physics.closest encuentra automáticamente el objeto más cercano
        const closest = this.scene.physics.closest(this, enemies);

        // Si encontramos un enemigo cercano
        if (closest) {
            // Creamos un proyectil amarillo de 10x10 píxeles
            // 0xffff00 es amarillo en formato hexadecimal
            const proj = this.scene.add.rectangle(this.x, this.y, 10, 10, 0xffff00);

            // Añadimos físicas al proyectil
            this.scene.physics.add.existing(proj);

            // Movemos el proyectil hacia el enemigo más cercano a velocidad 500
            this.scene.physics.moveToObject(proj, closest, 500);

            // Destruimos el proyectil después de 2 segundos para evitar acumulación
            this.scene.time.delayedCall(2000, () => proj.destroy());

            // Configuramos la colisión del proyectil con enemigos
            // Cuando el proyectil toca un enemigo:
            this.scene.physics.add.overlap(proj, enemies, (p, e) => {
                // Si el enemigo está activo (vivo)
                if (e.active) {
                    // Le hacemos daño
                    e.takeDamage(this.damage);

                    // Destruimos el proyectil
                    p.destroy();
                }
            });
        }
    }
}
