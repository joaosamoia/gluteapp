"use client";

let ctx: AudioContext | null = null;

/** Bipe curto (WebAudio) + vibração — usado no fim dos timers. */
export function beep(times = 2) {
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    for (let i = 0; i < times; i++) {
      const t0 = ctx.currentTime + i * 0.22;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = i === times - 1 ? 1046 : 784;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.35, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
      o.connect(g).connect(ctx.destination);
      o.start(t0);
      o.stop(t0 + 0.2);
    }
  } catch {}
  try {
    navigator.vibrate?.([180, 80, 180]);
  } catch {}
}

/** Desbloqueia o áudio no iOS (chamar num clique). */
export function unlockAudio() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") ctx.resume();
  } catch {}
}
