// src/components/CardBack.tsx
// The face-down side of a task card, styled like a classic playing-card back:
// coral lattice pattern, cream inner frame, centered logo medallion.

import React from 'react';
import { cn } from '@/lib/utils';

interface CardBackProps {
  /** Show the "Tap to reveal" hint (only on the interactive top card) */
  showHint?: boolean;
  className?: string;
}

const CardBack: React.FC<CardBackProps> = ({ showHint = false, className }) => {
  return (
    <div
      className={cn(
        'w-full h-full rounded-2xl shadow-lg overflow-hidden select-none',
        'bg-gradient-to-br from-taskGradient-start to-taskGradient-end',
        className
      )}
    >
      {/* Classic playing-card cream margin */}
      <div className="absolute inset-0 rounded-2xl border-[6px] border-orange-50/90" />

      {/* Inner panel with lattice pattern */}
      <div
        className="absolute inset-[10px] rounded-xl border border-white/30"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1.5px, transparent 1.5px, transparent 11px),
            repeating-linear-gradient(-45deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1.5px, transparent 1.5px, transparent 11px)
          `,
        }}
      />

      {/* Center medallion */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-orange-50 shadow-lg flex items-center justify-center border-4 border-white/60">
          <span className="text-5xl font-extrabold bg-gradient-to-br from-taskGradient-start to-taskGradient-end text-transparent bg-clip-text leading-none pb-1">
            1
          </span>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-white drop-shadow-sm tracking-wide">
          One Job
        </h2>
        {showHint && (
          <p className="mt-2 text-sm text-white/80">Tap to reveal your task</p>
        )}
      </div>
    </div>
  );
};

export default CardBack;
