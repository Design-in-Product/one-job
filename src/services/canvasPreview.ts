// src/services/canvasPreview.ts
// R2.1 stage 4 ships behind a DEVICE-LOCAL preview flag: the canvas
// strip is the most design-visible piece of the sequence, and Xian's
// daily driver must not change under him while he is heads-down. He
// previews with one URL; when he approves, the flag's read path is
// deleted and the strip becomes the app. Same pattern as entitlements:
// ?canvas=on to enable this device, ?canvas=off to disable.

const CANVAS_KEY = 'oneJobCanvasPreview';

try {
  const v = new URLSearchParams(window.location.search).get('canvas');
  if (v === 'on') localStorage.setItem(CANVAS_KEY, '1');
  if (v === 'off') localStorage.removeItem(CANVAS_KEY);
} catch {
  /* no window/storage — preview simply off */
}

export const canvasPreviewOn = (): boolean => {
  try {
    return localStorage.getItem(CANVAS_KEY) === '1';
  } catch {
    return false;
  }
};
