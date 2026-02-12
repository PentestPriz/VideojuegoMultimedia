/**
 * SoundFX - Sonidos procedurales fieles a Star Wars
 * Sintetizados con Web Audio API para replicar los efectos icónicos.
 */
export default class SoundFX {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Blaster Star Wars — el icónico "pew!"
     * Basado en: barrido rápido de frecuencia alta a baja con armónicos metálicos
     */
    laserShoot() {
        if (!this.ctx || !this.enabled) return;
        const t = this.ctx.currentTime;

        // Oscilador principal — barrido tonal descendente rápido
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(1800, t);
        osc1.frequency.exponentialRampToValueAtTime(300, t + 0.12);
        osc1.frequency.exponentialRampToValueAtTime(120, t + 0.2);
        gain1.gain.setValueAtTime(0.18, t);
        gain1.gain.linearRampToValueAtTime(0.12, t + 0.03);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        // Oscilador 2 — una octava arriba para el brillo metálico
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(2400, t);
        osc2.frequency.exponentialRampToValueAtTime(400, t + 0.1);
        osc2.frequency.exponentialRampToValueAtTime(80, t + 0.18);
        gain2.gain.setValueAtTime(0.07, t);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        // Ruido de impacto inicial (el "crack" del disparo)
        const noiseLen = this.ctx.sampleRate * 0.03;
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

        // Filtro paso banda para el carácter "twangy"
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, t);
        filter.frequency.exponentialRampToValueAtTime(300, t + 0.15);
        filter.Q.value = 5;

        // Conectar
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        noise.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        osc1.start(t); osc1.stop(t + 0.22);
        osc2.start(t); osc2.stop(t + 0.2);
        noise.start(t);
    }


    /**
     * Impacto en escudo — zumbido eléctrico corto
     */
    hit() {
        if (!this.ctx || !this.enabled) return;
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.08);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        // Distorsión leve para carácter eléctrico
        const dist = this.ctx.createWaveShaper();
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) {
            const x = (i * 2) / 256 - 1;
            curve[i] = Math.tanh(x * 3);
        }
        dist.curve = curve;

        osc.connect(dist);
        dist.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t); osc.stop(t + 0.12);

        // Chispa eléctrica
        const sparkLen = this.ctx.sampleRate * 0.06;
        const sparkBuf = this.ctx.createBuffer(1, sparkLen, this.ctx.sampleRate);
        const sparkData = sparkBuf.getChannelData(0);
        for (let i = 0; i < sparkLen; i++) {
            sparkData[i] = (Math.random() * 2 - 1) * (1 - i / sparkLen) * 0.5;
        }
        const spark = this.ctx.createBufferSource();
        spark.buffer = sparkBuf;
        const sparkFilter = this.ctx.createBiquadFilter();
        sparkFilter.type = 'highpass';
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
     * Subida de nivel — fanfarria tipo Force Theme
     * Acorde mayor ascendente con reverb
     */
    levelUp() {
        if (!this.ctx || !this.enabled) return;
        const t = this.ctx.currentTime;
        // Notas: Do-Mi-Sol-Do alto (acorde mayor espacial)
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const start = t + i * 0.12;
            osc.frequency.setValueAtTime(freq, start);
            // Vibrato sutil
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.value = 5;
            lfoGain.gain.value = 3;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start(start); lfo.stop(start + 0.5);

            gain.gain.setValueAtTime(0.001, start);
            gain.gain.linearRampToValueAtTime(0.12, start + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);

            // Armónico para brillo
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
     * Selección de menú — beep holográfico
     */
    select() {
        if (!this.ctx || !this.enabled) return;
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.setValueAtTime(1200, t + 0.06);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        // Segundo tono más agudo (doble beep)
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
     * TIE Fighter flyby — el chillido icónico del caza TIE
     * Simula el sonido original (elefante + neumáticos mojados) con FM synthesis
     */
    tieFlyby() {
        if (!this.ctx || !this.enabled) return;
        const t = this.ctx.currentTime;
        const duration = 0.8;

        // Oscilador modulador (crea el "chillido" vibrante)
        const mod = this.ctx.createOscillator();
        mod.type = 'sawtooth';
        mod.frequency.setValueAtTime(120, t);

        const modGain = this.ctx.createGain();
        modGain.gain.setValueAtTime(300, t); // Profundidad de modulación alta
        modGain.gain.linearRampToValueAtTime(150, t + duration);

        // Oscilador portador 1 (tono principal agudo)
        const carrier1 = this.ctx.createOscillator();
        carrier1.type = 'sawtooth';
        carrier1.frequency.setValueAtTime(600, t);
        carrier1.frequency.linearRampToValueAtTime(450, t + duration * 0.5);
        carrier1.frequency.linearRampToValueAtTime(650, t + duration);

        // Oscilador portador 2 (detuned para grosor)
        const carrier2 = this.ctx.createOscillator();
        carrier2.type = 'sawtooth';
        carrier2.frequency.setValueAtTime(605, t);
        carrier2.frequency.linearRampToValueAtTime(455, t + duration * 0.5);
        carrier2.frequency.linearRampToValueAtTime(655, t + duration);

        // FM: modulador controla la frecuencia de los portadores
        mod.connect(modGain);
        modGain.connect(carrier1.frequency);
        modGain.connect(carrier2.frequency);

        // Filtro para darle cuerpo nasal
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 3;

        // Envelope de volumen (fade in → sustain → fade out)
        const masterGain = this.ctx.createGain();
        masterGain.gain.setValueAtTime(0.001, t);
        masterGain.gain.linearRampToValueAtTime(0.06, t + 0.1);
        masterGain.gain.setValueAtTime(0.06, t + duration * 0.6);
        masterGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        // Conectar
        carrier1.connect(filter);
        carrier2.connect(filter);
        filter.connect(masterGain);
        masterGain.connect(this.ctx.destination);

        mod.start(t);
        carrier1.start(t);
        carrier2.start(t);
        mod.stop(t + duration + 0.05);
        carrier1.stop(t + duration + 0.05);
        carrier2.stop(t + duration + 0.05);
    }
}
