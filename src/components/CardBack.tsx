// src/components/CardBack.tsx
// The face-down side of a task card, styled like a classic playing-card back:
// coral lattice pattern, cream inner frame, centered logo medallion.

import React from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface CardBackProps {
  /** Show the "Tap to reveal" hint (only on the interactive top card) */
  showHint?: boolean;
  className?: string;
  /** Deck identity (2026-08-06, Xian-blessed): NAME FIRST — the deck's
      name is the biggest thing at the top of the back; "One Job" recedes
      to a quiet wordmark. Only passed when the device has >1 deck (no
      cruft till it's needed). deck-1 carries no color = full brand. */
  deckName?: string | null;
  deckColor?: { g1: string; g2: string };
}

const CardBack: React.FC<CardBackProps> = ({ showHint = false, className, deckName, deckColor }) => {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        'w-full h-full rounded-2xl shadow-lg overflow-hidden select-none',
        !deckColor && 'bg-gradient-to-br from-taskGradient-start to-taskGradient-end',
        className
      )}
      style={deckColor ? { background: `linear-gradient(135deg, ${deckColor.g1}, ${deckColor.g2})` } : undefined}
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

      {/* Deck name FIRST — the eye's landing point (Xian, 2026-08-06) */}
      {deckName && (
        <div className="absolute top-7 left-0 right-0 text-center text-2xl font-extrabold text-white drop-shadow-sm">
          {deckName}
        </div>
      )}

      {/* Center medallion */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-orange-50 shadow-lg flex items-center justify-center border-4 border-white/60">
          <span
            className={cn('text-5xl font-extrabold text-transparent bg-clip-text leading-none pb-1',
              !deckColor && 'bg-gradient-to-br from-taskGradient-start to-taskGradient-end')}
            style={deckColor ? { backgroundImage: `linear-gradient(135deg, ${deckColor.g1}, ${deckColor.g2})` } : undefined}
          >
            1
          </span>
        </div>
        {deckName ? (
          <div className="mt-3 text-[11px] font-semibold tracking-[.14em] uppercase text-white/70">
            {t('cardBack.appName')}
          </div>
        ) : (
          <h2 className="mt-4 text-2xl font-bold text-white drop-shadow-sm tracking-wide">
            {t('cardBack.appName')}
          </h2>
        )}
        {showHint && (
          <p className="mt-2 text-sm text-white/80">{t('cardBack.tapHint')}</p>
        )}
      </div>
    </div>
  );
};

export default CardBack;
