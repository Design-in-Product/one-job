// Shake-to-undo (Xian, 2026-07-29): "the main use of undo is immediately
// after a mistake" — shake the phone, get asked, tap once.
//
// devicemotion-based so one implementation covers the Capacitor WebView
// and mobile browsers. iOS Safari 13+ gates motion events behind a
// permission that may only be requested from a user gesture, so when the
// gate exists we piggyback the request on the first pointerdown — the
// same tap that reveals the first card. Where the API is absent
// (desktop) this hook is a silent no-op; the long-press menu's Undo
// remains the universal path.

import { useEffect, useRef } from 'react';

const SPIKE_THRESHOLD = 15; // m/s² of acceleration delta that counts as a jolt
const SPIKES_REQUIRED = 3;  // back-and-forth jolts that make a shake…
const SHAKE_WINDOW_MS = 900; // …within this window
const COOLDOWN_MS = 1500;   // then quiet time so one shake fires once

export function useShake(onShake: () => void) {
  // Ref so the listener never goes stale without re-binding devicemotion
  const cb = useRef(onShake);
  cb.current = onShake;

  useEffect(() => {
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) return;

    let spikes: number[] = [];
    let last: { x: number; y: number; z: number } | null = null;
    let cooledUntil = 0;

    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      const now = Date.now();
      if (last) {
        const delta = Math.abs(a.x - last.x) + Math.abs(a.y - last.y) + Math.abs(a.z - last.z);
        if (delta > SPIKE_THRESHOLD && now > cooledUntil) {
          spikes = [...spikes.filter(t => now - t < SHAKE_WINDOW_MS), now];
          if (spikes.length >= SPIKES_REQUIRED) {
            spikes = [];
            cooledUntil = now + COOLDOWN_MS;
            cb.current();
          }
        }
      }
      last = { x: a.x, y: a.y, z: a.z };
    };

    const attach = () => window.addEventListener('devicemotion', onMotion);

    // Safari's permission gate; absent everywhere else.
    const DME = DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    const needsPermission = typeof DME.requestPermission === 'function';

    const requestOnGesture = () => {
      DME.requestPermission!()
        .then(state => { if (state === 'granted') attach(); })
        .catch(() => { /* denied or unavailable — undo stays in the menu */ });
    };

    if (needsPermission) {
      window.addEventListener('pointerdown', requestOnGesture, { once: true });
    } else {
      attach();
    }

    return () => {
      window.removeEventListener('devicemotion', onMotion);
      window.removeEventListener('pointerdown', requestOnGesture);
    };
  }, []);
}
