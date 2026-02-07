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

  const triggerVictory = useCallback(() => {
    // Ta-da! Fanfare melody (C-E-G-C ascending)
    playTone(523, 'sine', 0.15); // C5
    setTimeout(() => playTone(659, 'sine', 0.15), 150); // E5
    setTimeout(() => playTone(784, 'sine', 0.15), 300); // G5
    setTimeout(() => playTone(1047, 'sine', 0.4), 450); // C6 (hold)
    
    // Big confetti burst - multiple waves!
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Two bursts from different origins
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#22c55e', '#3b82f6', '#eab308', '#ec4899', '#8b5cf6']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#22c55e', '#3b82f6', '#eab308', '#ec4899', '#8b5cf6']
      });
    }, 250);

    // One big central burst at the start
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#22c55e', '#3b82f6', '#eab308', '#ec4899', '#8b5cf6'],
      zIndex: 10000
    });
  }, []);

  return { triggerSuccess, triggerFailure, triggerVictory };
}
