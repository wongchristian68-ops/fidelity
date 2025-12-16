
"use client";

export function playChime() {
  // Check if AudioContext is available (runs only on client-side)
  if (typeof window === 'undefined' || !(window.AudioContext || (window as any).webkitAudioContext)) {
    return;
  }

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

  // Create two oscillators for a pleasant interval (e.g., a major third)
  const oscillator1 = audioCtx.createOscillator();
  const oscillator2 = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator1.type = 'sine';
  oscillator2.type = 'sine';

  // Frequencies for C5 and E5
  oscillator1.frequency.setValueAtTime(523.25, audioCtx.currentTime);
  oscillator2.frequency.setValueAtTime(659.25, audioCtx.currentTime);

  // Fade in and out to avoid clicking sounds
  const now = audioCtx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05); // Quick fade-in
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5); // Fade-out

  // Connect graph
  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // Start and stop the oscillators
  oscillator1.start(now);
  oscillator2.start(now);
  oscillator1.stop(now + 0.5);
  oscillator2.stop(now + 0.5);
}
