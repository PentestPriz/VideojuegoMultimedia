/**
 * SISTEMA DE SONIDO PROCEDURAL (SoundFX)
 * --------------------------------------
 * En lugar de usar archivos mp3/wav pregrabados, esta clase genera los efectos de sonido
 * en tiempo real usando la Web Audio API del navegador.
 * 
 * Ventajas: No hay que cargar archivos, peso mínimo, variación infinita.
 * Objetivo: Replicar la estética sonora icónica de Star Wars (sintetizadores analógicos).
 */
export default class SoundFX {
    constructor() {
        this.ctx = null; // El contexto de audio (como un lienzo para el sonido)
        this.enabled = true;
    }

    /**
     * Inicializa el contexto de audio. Los navegadores requieren una interacción del usuario
     * (click/toque) antes de permitir que suene nada.
     */
    init() {
        if (!this.ctx) {
            // Crear contexto compatible con todos los navegadores
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume(); // Despertar el audio si estaba dormido
        }
    }

    /**
     * DISPARO LÁSER (Blaster)
     * -----------------------
     * El sonido clásico de "Pew Pew".
     * Cómo se hace: Un oscilador que baja muy rápido de tono (pitch drop).
     * Técnica: Síntesis sustractiva + golpe de martillo en cable tensor (teoría original de Ben Burtt).
     */
    laserShoot() {
        if (!this.ctx || !this.enabled) return;
        const t = this.ctx.currentTime;

        // 1. EL TONO PRINCIPAL (Oscilador Diente de Sierra)
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sawtooth'; // Sonido rico y zumbante

        // Envolvente de frecuencia (Pitch Envelope): 
        // Empieza agudo (1800Hz) y cae exponencialmente a grave (300Hz -> 120Hz) muy rápido.
        osc1.frequency.setValueAtTime(1800, t);
        osc1.frequency.exponentialRampToValueAtTime(300, t + 0.12);
        osc1.frequency.exponentialRampToValueAtTime(120, t + 0.2);

        // Envolvente de volumen (Amplitude Envelope):
        // Golpe fuerte y caída seca.
        gain1.gain.setValueAtTime(0.18, t);
        gain1.gain.linearRampToValueAtTime(0.12, t + 0.03);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        // 2. EL BRILLO METÁLICO (Segundo oscilador cuadrada)
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'square'; // Sonido "hueco" tipo videojuego retro
        osc2.frequency.setValueAtTime(2400, t);
        osc2.frequency.exponentialRampToValueAtTime(400, t + 0.1);
        osc2.frequency.exponentialRampToValueAtTime(80, t + 0.18);
        gain2.gain.setValueAtTime(0.07, t);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        // 3. EL GOLPE INICIAL (Ruido blanco)
        // Simula el percutor del arma o la explosión inicial.
        const noiseLen = this.ctx.sampleRate * 0.03; // 0.03 segundos de ruido
        const noiseBuf = this.ctx.createBuffer(1, noiseLen, this.ctx.sampleRate);
        const noiseData = noiseBuf.getChannelData(0);
        for (let i = 0; i < noiseLen; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseLen);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuf;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.12, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

        // 4. FILTRADO
        // Usamos un filtro paso banda para darle ese carácter "twangy" (como cuerda tensa)
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, t);
        filter.frequency.exponentialRampToValueAtTime(300, t + 0.15);
        filter.Q.value = 5; // Resonancia media

        // CONEXIONES (Wiring)
        // Osciladores -> Filtro -> Ganancia -> Salida
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain1);
        gain1.connect(this.ctx.destination);

        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);

        noise.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        // DISPARAR LOS SONIDOS
        osc1.start(t); osc1.stop(t + 0.22);
        osc2.start(t); osc2.stop(t + 0.2);
        noise.start(t);
    }


    /**
     * IMPACTO (Hit)
     * -------------
     * Sonido corto al recibir daño. Zumbido eléctrico interrumpido.
     */
    hit() {
        if (!this.ctx || !this.enabled) return;
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.08); // Caída rápida
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        // Distorsión (Waveshaper) para que suene roto/eléctrico
        const dist = this.ctx.createWaveShaper();
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) {
            const x = (i * 2) / 256 - 1;
            curve[i] = Math.tanh(x * 3); // Curva de distorsión suave
        }
        dist.curve = curve;

        osc.connect(dist);
        dist.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t); osc.stop(t + 0.12);

        // Añadimos una chispa de ruido agudo (Highpass Noise)
        const sparkLen = this.ctx.sampleRate * 0.06;
        const sparkBuf = this.ctx.createBuffer(1, sparkLen, this.ctx.sampleRate);
        const sparkData = sparkBuf.getChannelData(0);
        for (let i = 0; i < sparkLen; i++) {
            sparkData[i] = (Math.random() * 2 - 1) * (1 - i / sparkLen) * 0.5;
        }
        const spark = this.ctx.createBufferSource();
        spark.buffer = sparkBuf;

        const sparkFilter = this.ctx.createBiquadFilter();
        sparkFilter.type = 'highpass'; // Solo frecuencias altas
        sparkFilter.frequency.value = 3000;

        const sparkGain = this.ctx.createGain();
        sparkGain.gain.setValueAtTime(0.06, t);
        sparkGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

        spark.connect(sparkFilter);
        sparkFilter.connect(sparkGain);
        sparkGain.connect(this.ctx.destination);
        spark.start(t);
    }

    /**
     * SUBIDA DE NIVEL (Level Up)
     * --------------------------
     * Fanfarria positiva inspirada en la música orquestal.
     * Acorde mayor arpegiado (Do-Mi-Sol-Do) con reverb simulada.
     */
    levelUp() {
        if (!this.ctx || !this.enabled) return;
        const t = this.ctx.currentTime;
        // Notas del acorde (Frecuencias en Hz)
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine'; // Sonido puro y suave

            const start = t + i * 0.12; // Retardo entre notas (arpegio)
            osc.frequency.setValueAtTime(freq, start);

            // Vibrato (Oscilador de baja frecuencia LFO modulando el tono)
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.value = 5; // 5 vibraciones por segundo
            lfoGain.gain.value = 3;  // Profundidad del vibrato
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start(start); lfo.stop(start + 0.5);

            // Envolvente de volumen tipo campana
            gain.gain.setValueAtTime(0.001, start);
            gain.gain.linearRampToValueAtTime(0.12, start + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);

            // Capa extra: Onda triangular una octava arriba para darle "cuerpo"
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(freq * 2, start);
            gain2.gain.setValueAtTime(0.001, start);
            gain2.gain.linearRampToValueAtTime(0.04, start + 0.04);
            gain2.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

            osc.connect(gain); gain.connect(this.ctx.destination);
            osc2.connect(gain2); gain2.connect(this.ctx.destination);

            osc.start(start); osc.stop(start + 0.55);
            osc2.start(start); osc2.stop(start + 0.45);
        });
    }

    /**
     * SELECCIÓN DE UI (Select)
     * ------------------------
     * Sonido "beep" tecnológico/holográfico.
     */
    select() {
        if (!this.ctx || !this.enabled) return;
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';

        // Pequeño glissando (salto) de tono hacia arriba
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.setValueAtTime(1200, t + 0.06);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        // Agregamos un segundo tono muy agudo para darle ese toque "sci-fi"
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = 1600;
        gain2.gain.setValueAtTime(0.001, t + 0.06);
        gain2.gain.linearRampToValueAtTime(0.06, t + 0.075);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain); gain.connect(this.ctx.destination);
        osc2.connect(gain2); gain2.connect(this.ctx.destination);
        osc.start(t); osc.stop(t + 0.16);
        osc2.start(t + 0.06); osc2.stop(t + 0.2);
    }

    /**
     * CAZA TIE (Flyby)
     * ----------------
     * El aullido icónico de los motores TIE.
     * Origen real: Bramido de elefante mezclado con neumáticos en asfalto mojado.
     * Síntesis: Modulación de Frecuencia (FM Synthesis).
     */
    tieFlyby() {
        if (!this.ctx || !this.enabled) return;
        const t = this.ctx.currentTime;
        const duration = 0.8;

        // 1. EL MODULADOR (El "elefante")
        // Un oscilador lento que controla la frecuencia de los otros
        const mod = this.ctx.createOscillator();
        mod.type = 'sawtooth';
        mod.frequency.setValueAtTime(120, t); // Frecuencia base de la vibración

        const modGain = this.ctx.createGain();
        modGain.gain.setValueAtTime(300, t); // Intensidad del efecto (profundidad FM)
        modGain.gain.linearRampToValueAtTime(150, t + duration); // Se calma al final

        // 2. LOS PORTADORES (El "motor")
        // Dos osciladores que generan el tono audible, desafinados entre sí
        const carrier1 = this.ctx.createOscillator();
        carrier1.type = 'sawtooth';
        carrier1.frequency.setValueAtTime(600, t);
        // Efecto Doppler: Tono baja y luego sube (simulando que pasa veloce)
        carrier1.frequency.linearRampToValueAtTime(450, t + duration * 0.5);
        carrier1.frequency.linearRampToValueAtTime(650, t + duration);

        const carrier2 = this.ctx.createOscillator();
        carrier2.type = 'sawtooth';
        carrier2.frequency.setValueAtTime(605, t); // Ligeramente desafinado (Chorus)
        carrier2.frequency.linearRampToValueAtTime(455, t + duration * 0.5);
        carrier2.frequency.linearRampToValueAtTime(655, t + duration);

        // CONEXIÓN FM: El modulador se conecta a la FRECUENCIA de los portadores
        mod.connect(modGain);
        modGain.connect(carrier1.frequency);
        modGain.connect(carrier2.frequency);

        // 3. FILTRO NASAL
        // Elimina graves y agudos extremos para que suene como una cabina cerrada
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 3;

        // 4. VOLUMEN (Fade in - Sustain - Fade out)
        const masterGain = this.ctx.createGain();
        masterGain.gain.setValueAtTime(0.001, t);
        masterGain.gain.linearRampToValueAtTime(0.06, t + 0.1);
        masterGain.gain.setValueAtTime(0.06, t + duration * 0.6);
        masterGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        carrier1.connect(filter);
        carrier2.connect(filter);
        filter.connect(masterGain);
        masterGain.connect(this.ctx.destination);

        mod.start(t);
        carrier1.start(t);
        carrier2.start(t);

        // Detener todo al finalizar
        mod.stop(t + duration + 0.05);
        carrier1.stop(t + duration + 0.05);
        carrier2.stop(t + duration + 0.05);
    }
}
