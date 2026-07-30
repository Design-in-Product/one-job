// src/services/canvasPreview.ts
// R2.1 stage 4. The canvas strip shipped behind a preview flag on
// 2026-07-29 and Xian approved the layout the same day ("the strip is
// good"), so the strip is now the DEFAULT. ?canvas=off remains as a
// per-device escape hatch (and ?canvas=on clears it) — kept until the
// strip has survived real daily use, then this file shrinks to nothing.

const CANVAS_KEY = 'oneJobCanvasPreview';

try {
  const v = new URLSearchParams(window.location.search).get('canvas');
  if (v === 'off') localStorage.setItem(CANVAS_KEY, 'off');
  if (v === 'on') localStorage.removeItem(CANVAS_KEY);
} catch {
  /* no window/storage — default applies */
}

export const canvasPreviewOn = (): boolean => {
  try {
    return localStorage.getItem(CANVAS_KEY) !== 'off';
  } catch {
    return true;
  }
};
