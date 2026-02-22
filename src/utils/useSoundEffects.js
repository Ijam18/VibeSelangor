import { useRef, useCallback } from 'react';

// Procedural sound effects using Web Audio API — no external assets, no speech synthesis.

export function useSoundEffects() {
    const audioCtxRef = useRef(null);

    const getAudioCtx = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    }, []);

    const initAudio = getAudioCtx;

    const playKeystroke = useCallback(() => {
        const ctx = getAudioCtx();
        if (!ctx) return;

        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // A very short, high-frequency "click / clack"
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.05);

        gain.gain.setValueAtTime(0.05, t); // Super soft
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.05);
    }, []);

    const playSuccess = useCallback(() => {
        const ctx = getAudioCtx();
        if (!ctx) return;

        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Futuristic positive double-beep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.setValueAtTime(1200, t + 0.1);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
        gain.gain.setValueAtTime(0.1, t + 0.08);
        gain.gain.linearRampToValueAtTime(0, t + 0.1);

        gain.gain.setValueAtTime(0, t + 0.11);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.13);
        gain.gain.setValueAtTime(0.1, t + 0.25);
        gain.gain.linearRampToValueAtTime(0, t + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.3);
    }, []);

    const playError = useCallback(() => {
        const ctx = getAudioCtx();
        if (!ctx) return;

        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Low pitch "bzzt"
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.03, t + 0.05);
        gain.gain.linearRampToValueAtTime(0, t + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.2);
    }, []);

    const playTap = useCallback(() => {
        const ctx = getAudioCtx(); if (!ctx) return;
        const t = ctx.currentTime;
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.04);
    }, [getAudioCtx]);

    const playSwipe = useCallback(() => {
        const ctx = getAudioCtx(); if (!ctx) return;
        const t = ctx.currentTime;
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.12);
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.12);
    }, [getAudioCtx]);

    const playChime = useCallback(() => {
        const ctx = getAudioCtx(); if (!ctx) return;
        [523, 659, 784].forEach((freq, i) => {
            const t = ctx.currentTime + i * 0.12;
            const osc = ctx.createOscillator(), gain = ctx.createGain();
            osc.type = 'sine'; osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
            gain.gain.linearRampToValueAtTime(0, t + 0.18);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(t); osc.stop(t + 0.18);
        });
    }, [getAudioCtx]);

    return { initAudio, playKeystroke, playSwipe, playTap, playChime, playSuccess, playError };
}
