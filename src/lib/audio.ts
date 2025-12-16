
"use client";

export function playChime() {
  // Check if AudioContext is available (runs only on client-side)
  if (typeof window === 'undefined' || !(window.AudioContext || (window as any).webkitAudioContext)) {
    return;
  }

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

  // Create oscillators for a more bell-like sound
  const fundamental = 440; // A4
  const overtones = [0.5, 1, 1.5, 2.7, 3.8];
  const now = audioCtx.currentTime;

  overtones.forEach((ratio, index) => {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(fundamental * ratio, now);
    
    // Each overtone has a different volume and decay
    const initialGain = 0.4 / (index + 1);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(initialGain, now + 0.02); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 + (index * 0.1)); // Longer, varied decay

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 1.5);
  });
}
