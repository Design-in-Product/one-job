// src/components/CanvasPeek.tsx
// The felt edge of a neighboring place on the canvas strip (R2.1 stage
// 4). A thin sliver of card-back material at the screen edge: the
// affordance IS the neighbor, physically peeking in — the same felt
// language as the pile bars, no chrome, no labels, no counts. Tapping
// it pans there. The full background-drag pan follows once the layout
// has Xian's verdict; peeks carry the spatial model meanwhile.

import React from 'react';
import { cn } from '@/lib/utils';

interface CanvasPeekProps {
  side: 'left' | 'right';
  /** What lies that way (for the screen reader; sighted users feel it) */
  label: string;
  onTap: () => void;
  /** The afterlife peeks in muted gray — a shade's edge, not a deck's */
  variant?: 'deck' | 'afterlife';
  /** The neighbor deck's identity hue (2026-08-06): the sliver IS the
      wayfinding — a colored peek tells you what's next before you pan. */
  color?: { g1: string; g2: string };
}

const CanvasPeek: React.FC<CanvasPeekProps> = ({ side, label, onTap, variant = 'deck', color }) => (
  <button
    aria-label={label}
    onClick={onTap}
    style={variant === 'deck' && color
      ? { background: `linear-gradient(160deg, ${color.g1}, ${color.g2})` }
      : undefined}
    className={cn(
      'absolute top-1/2 -translate-y-1/2 h-[38%] w-[14px] z-20',
      'rounded-none border-0 p-0 cursor-pointer',
      side === 'left' ? 'left-0 rounded-r-md' : 'right-0 rounded-l-md',
      variant === 'deck'
        ? (color ? 'opacity-80' : 'bg-gradient-to-b from-taskGradient-start to-taskGradient-end opacity-70')
        : 'bg-gray-300 opacity-60',
      'shadow-md'
    )}
  />
);

export default CanvasPeek;
