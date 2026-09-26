// Web Audio API Procedural Sound Engine for Retro Ki Clash
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.chargeNode = null;
        this.chargeGain = null;
        this.chargeLfo = null;
        this.muted = false;
        this.volume = 0.8;
        this.initialized = false;

        // Load saved settings
        try {
            const savedVol = localStorage.getItem('ki_clash_volume');
            if (savedVol !== null) this.volume = parseFloat(savedVol);
            const savedMuted = localStorage.getItem('ki_clash_muted');
            if (savedMuted !== null) this.muted = (savedMuted === 'true');
        } catch (e) {}
    }

    init() {
        if (this.initialized) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.initialized = true;
    }

    resume() {
        if (!this.initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        try { localStorage.setItem('ki_clash_volume', this.volume); } catch (e) {}
        if (this.masterGain && this.ctx && !this.muted) {
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        try { localStorage.setItem('ki_clash_muted', this.muted); } catch (e) {}
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
        }
        return this.muted;
    }

    // Hit sound (Light / Combo punch)
    playHit(heavy = false) {
        if (this.muted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = heavy ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(heavy ? 180 : 260, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + (heavy ? 0.22 : 0.12));

        const bufferSize = this.ctx.sampleRate * (heavy ? 0.08 : 0.04);
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(heavy ? 0.45 : 0.25, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + (heavy ? 0.08 : 0.04));

        gain.gain.setValueAtTime(heavy ? 0.6 : 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (heavy ? 0.22 : 0.12));

        whiteNoise.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        whiteNoise.start(now);
        osc.stop(now + (heavy ? 0.22 : 0.12));
    }

    // Teleport / Dash / Vanish sound
    playVanish() {
        if (this.muted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    // Ki blast launch sound
    playKiBlast() {
        if (this.muted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.14);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.14);
    }

    // Blast explosion sound
    playExplosion(large = false) {
        if (this.muted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime;
        const dur = large ? 0.7 : 0.25;

        const bufferSize = this.ctx.sampleRate * dur;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * (dur * 0.35)));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(large ? 450 : 700, now);
        filter.frequency.exponentialRampToValueAtTime(60, now + dur);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(large ? 0.7 : 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(now);
    }

    // Beam blast fire
    playBeamFire() {
        if (this.muted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(320, now + 0.2);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.8);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.8);
        this.playExplosion(true);
    }

    // Start Ki Charging humming loop
    startCharge() {
        if (this.muted || this.chargeNode) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(95, now);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(320, now);
        filter.Q.setValueAtTime(4.0, now);

        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(9, now);
        lfoGain.gain.setValueAtTime(120, now);
        lfo.connect(filter.frequency);
        lfo.start(now);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.28, now + 0.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);

        this.chargeNode = osc;
        this.chargeGain = gain;
        this.chargeLfo = lfo;
    }

    // Stop Ki Charging loop
    stopCharge() {
        if (this.chargeGain && this.ctx) {
            const now = this.ctx.currentTime;
            this.chargeGain.gain.linearRampToValueAtTime(0.001, now + 0.15);
            setTimeout(() => {
                try {
                    if (this.chargeNode) this.chargeNode.stop();
                    if (this.chargeLfo) this.chargeLfo.stop();
                } catch (e) {}
                this.chargeNode = null;
                this.chargeGain = null;
                this.chargeLfo = null;
            }, 180);
        }
    }

    // Guard / Block sound
    playGuard() {
        if (this.muted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    // Round / KO jingle
    playJingle(type) {
        if (this.muted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime;
        const notes = type === 'ko' ? [440, 370, 311, 220] : [260, 330, 392, 523];
        const step = 0.12;

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + idx * step;

            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + step * 1.5);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(t);
            osc.stop(t + step * 1.5);
        });
    }
}

window.soundEngine = new SoundEngine();
