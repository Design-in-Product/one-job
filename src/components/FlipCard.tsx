// src/components/FlipCard.tsx
// A true two-sided 3D flip card: one rotator with perspective and
// backface-visibility so the back and front are physically the same card.
// Flip "variations" are transition presets on the same rotation.

import React from 'react';
import { motion, Transition } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

/**
 * Shared card geometry. Every card face (front, back, deck underlays) uses
 * this so the card never changes shape or jumps position mid-flip.
 * Playing-card aspect ratio (63mm x 88mm ≈ 5:7), sized for mobile viewports.
 */
export const CARD_GEOMETRY = 'w-[min(85vw,20rem)] aspect-[5/7]';

export type FlipPreset = 'classic' | 'quick' | 'smooth' | 'wave';

export const FLIP_PRESETS: FlipPreset[] = ['classic', 'quick', 'smooth', 'wave'];

export const randomFlipPreset = (): FlipPreset =>
  FLIP_PRESETS[Math.floor(Math.random() * FLIP_PRESETS.length)];

const PRESET_TRANSITIONS: Record<FlipPreset, Transition> = {
  classic: { duration: 0.5, ease: 'easeInOut' },
  quick: { type: 'spring', stiffness: 320, damping: 22 },
  smooth: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
  wave: { duration: 0.55, ease: 'easeInOut' },
};

interface FlipCardProps {
  isFlipped: boolean;
  preset?: FlipPreset;
  back: React.ReactNode;
  front: React.ReactNode;
  /** Tap on the face-down card (used to reveal the task) */
  onTapBack?: () => void;
  className?: string;
}

const faceStyle: React.CSSProperties = {
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
};

const FlipCard: React.FC<FlipCardProps> = ({
  isFlipped,
  preset = 'classic',
  back,
  front,
  onTapBack,
  className,
}) => {
  const { t } = useTranslation();
  const transition = PRESET_TRANSITIONS[preset];

  return (
    <div className={cn(CARD_GEOMETRY, className)} style={{ perspective: 1200 }}>
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{
          rotateY: isFlipped ? 180 : 0,
          // "wave" adds a lateral tilt that settles as the flip completes
          rotateX: preset === 'wave' && isFlipped ? [0, 10, -6, 0] : 0,
        }}
        transition={{
          rotateY: transition,
          rotateX: { duration: 0.55, ease: 'easeInOut' },
        }}
      >
        <div
          className="absolute inset-0"
          style={faceStyle}
          onClick={!isFlipped ? onTapBack : undefined}
          role={onTapBack && !isFlipped ? 'button' : undefined}
          aria-label={onTapBack && !isFlipped ? t('deck.revealAria') : undefined}
        >
          {back}
        </div>
        <div
          className="absolute inset-0"
          style={{ ...faceStyle, transform: 'rotateY(180deg)' }}
        >
          {front}
        </div>
      </motion.div>
    </div>
  );
};

export default FlipCard;
