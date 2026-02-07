import { useCallback } from 'react';
import confetti from 'canvas-confetti';

// Simple beep using Web Audio API to avoid assets
// Frequencies: High (Success), Low (Failure/Neutral)
const playTone = (freq: number, type: OscillatorType = 'sine', duration = 0.1) => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + duration);
};

export function useFeedback() {
  const triggerSuccess = useCallback(() => {
    // Sound
    playTone(880, 'sine', 0.1); // High A
    setTimeout(() => playTone(1108, 'sine', 0.2), 100); // High C#

    // Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#ef4444', '#3b82f6', '#eab308'], // Brand colors?
      zIndex: 10000
    });
  }, []);

  const triggerFailure = useCallback(() => {
      // Sound - Low failure tone
      playTone(200, 'sawtooth', 0.3);
  }, []);

  return { triggerSuccess, triggerFailure };
}
