// src/components/SwipeableCard.tsx
// Drag wrapper for the active card: follows the finger with a slight tilt,
// shows complete/defer hints as you drag, and flings the card off-screen
// when a swipe crosses the distance or velocity threshold.

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const SWIPE_DISTANCE = 100; // px of drag that commits a swipe
const SWIPE_VELOCITY = 500; // px/s of release velocity that commits a swipe

interface SwipeableCardProps {
  children: React.ReactNode;
  /** Disable dragging (e.g. while the card is face-down) */
  disabled?: boolean;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  className?: string;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  disabled = false,
  onSwipeRight,
  onSwipeLeft,
  className,
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const completeOpacity = useTransform(x, [40, SWIPE_DISTANCE], [0, 1]);
  const deferOpacity = useTransform(x, [-SWIPE_DISTANCE, -40], [1, 0]);
  const [exitX, setExitX] = useState<number | null>(null);
  // Framer fires a click after drag release; swallow it so a swipe never
  // doubles as a tap on the card content.
  const draggedRef = useRef(false);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setTimeout(() => {
      draggedRef.current = false;
    }, 0);
    if (exitX !== null) return;
    const { offset, velocity } = info;
    // A flick can commit before the full distance, but only when the release
    // velocity points the same way as the drag — otherwise a drag that
    // springs back to center could register as a swipe.
    const commitRight =
      offset.x > SWIPE_DISTANCE || (offset.x > 30 && velocity.x > SWIPE_VELOCITY);
    const commitLeft =
      offset.x < -SWIPE_DISTANCE || (offset.x < -30 && velocity.x < -SWIPE_VELOCITY);

    if (commitRight) {
      setExitX(window.innerWidth * 1.2);
      onSwipeRight();
    } else if (commitLeft) {
      setExitX(-window.innerWidth * 1.2);
      onSwipeLeft();
    }
  };

  return (
    <motion.div
      className={cn('relative touch-none', !disabled && 'cursor-grab active:cursor-grabbing', className)}
      style={{ x, rotate }}
      drag={disabled || exitX !== null ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragStart={() => {
        draggedRef.current = true;
      }}
      onDragEnd={handleDragEnd}
      onClickCapture={(e) => {
        if (draggedRef.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      animate={exitX !== null ? { x: exitX, opacity: 0 } : undefined}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}

      {/* Swipe direction hints, revealed proportionally to drag distance */}
      {!disabled && (
        <>
          <motion.div
            className="absolute top-4 left-4 pointer-events-none"
            style={{ opacity: completeOpacity }}
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white shadow-md">
              <Check className="w-4 h-4" />
              <span className="text-sm font-semibold">Done</span>
            </div>
          </motion.div>
          <motion.div
            className="absolute top-4 right-4 pointer-events-none"
            style={{ opacity: deferOpacity }}
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-white shadow-md">
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm font-semibold">Later</span>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default SwipeableCard;
