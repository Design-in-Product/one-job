// src/components/SwipeableCard.tsx
// Drag wrapper for the active card: follows the finger with a slight tilt,
// shows complete/defer hints as you drag, and flings the card off-screen
// when a swipe crosses the distance or velocity threshold.

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useTranslation } from 'react-i18next';

// A physical thunk when a swipe commits — native builds only.
const hapticImpact = () => {
  if (!Capacitor.isNativePlatform()) return;
  void Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
};

// A lighter tap when a swipe is REFUSED. Deliberately not the commit thunk:
// the gesture registered, but nothing happened, and the hand should be able
// to tell those apart without looking.
const hapticRefused = () => {
  if (!Capacitor.isNativePlatform()) return;
  void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
};

const SWIPE_DISTANCE = 100; // px of drag that commits a swipe
const SWIPE_VELOCITY = 500; // px/s of release velocity that commits a swipe

interface SwipeableCardProps {
  children: React.ReactNode;
  /** Disable dragging (e.g. while the card is face-down) */
  disabled?: boolean;
  /** Absent = right swipe doesn't commit (springs back) — e.g. the Trash
      room, where the only way forward is the confirmed purge button.
      Return `false` to REFUSE the swipe: the card springs back instead of
      flying out. Used when a completion is blocked by unfinished work —
      previously the card flew away and re-dealt, which read as "completed,
      then undone" for a beat (2026-07-26 defect). */
  onSwipeRight?: () => boolean | void;
  onSwipeLeft: () => void;
  /** Vertical sifting (Item 28, chain rooms): swipe down digs deeper
      into the pile, up comes back toward the top. View-only browsing —
      both optional, absent = vertical drag disabled. */
  onSwipeDown?: () => void;
  onSwipeUp?: () => void;
  /** Tap-and-hold reveals the card's action menu (blocker 1). Introspect
      the object to see what it can do — works at every depth. */
  onLongPress?: () => void;
  /** Hint labels; default to Done/Later (the main-deck meanings) */
  rightHint?: string;
  leftHint?: string;
  className?: string;
}

const LONG_PRESS_MS = 450;

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  disabled = false,
  onSwipeRight,
  onSwipeLeft,
  onSwipeDown,
  onSwipeUp,
  onLongPress,
  rightHint,
  leftHint,
  className,
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const { t } = useTranslation();
  const hasVertical = !!(onSwipeDown || onSwipeUp);

  // Long-press: arm a timer on pointer-down, cancel it the moment a drag
  // (swipe) begins or the pointer lifts/moves. Fires the card's action
  // menu. Coexists with Framer drag because a real swipe cancels it.
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressStart = useRef<{ x: number; y: number } | null>(null);
  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    pressStart.current = null;
  };
  const armLongPress = (e: React.PointerEvent) => {
    if (!onLongPress || disabled) return;
    // Claim the press: holding a CARD is the card's action, so it must not
    // also bubble to the deck/background long-press (which opens the app
    // menu). Stops the React ancestor handler only — Framer's same-node
    // drag is unaffected. (2026-07-25 double-menu fix.)
    e.stopPropagation();
    cancelLongPress();
    pressStart.current = { x: e.clientX, y: e.clientY };
    longPressTimer.current = setTimeout(() => {
      longPressTimer.current = null;
      hapticImpact();
      onLongPress();
    }, LONG_PRESS_MS);
  };
  // Cancel only past a small movement threshold — finger jitter during a
  // hold shouldn't abort it (matches the old deck long-press).
  const maybeCancelOnMove = (e: React.PointerEvent) => {
    const s = pressStart.current;
    if (!s) return;
    if (Math.abs(e.clientX - s.x) > 8 || Math.abs(e.clientY - s.y) > 8) cancelLongPress();
  };
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const completeOpacity = useTransform(x, [40, SWIPE_DISTANCE], [0, 1]);
  const deferOpacity = useTransform(x, [-SWIPE_DISTANCE, -40], [1, 0]);
  const [exitX, setExitX] = useState<number | null>(null);
  const [exitY, setExitY] = useState<number | null>(null);
  // Framer fires a click after drag release; swallow it so a swipe never
  // doubles as a tap on the card content.
  const draggedRef = useRef(false);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setTimeout(() => {
      draggedRef.current = false;
    }, 0);
    if (exitX !== null || exitY !== null) return;
    const { offset, velocity } = info;
    // A flick can commit before the full distance, but only when the release
    // velocity points the same way as the drag — otherwise a drag that
    // springs back to center could register as a swipe.
    // Axis dominance keeps a diagonal drag from firing both meanings.
    const horizontal = Math.abs(offset.x) >= Math.abs(offset.y);
    const commitRight =
      horizontal &&
      !!onSwipeRight &&
      (offset.x > SWIPE_DISTANCE || (offset.x > 30 && velocity.x > SWIPE_VELOCITY));
    const commitLeft =
      horizontal &&
      (offset.x < -SWIPE_DISTANCE || (offset.x < -30 && velocity.x < -SWIPE_VELOCITY));
    const commitDown =
      !horizontal &&
      !!onSwipeDown &&
      (offset.y > SWIPE_DISTANCE || (offset.y > 30 && velocity.y > SWIPE_VELOCITY));
    const commitUp =
      !horizontal &&
      !!onSwipeUp &&
      (offset.y < -SWIPE_DISTANCE || (offset.y < -30 && velocity.y < -SWIPE_VELOCITY));

    if (commitRight) {
      // Ask BEFORE animating. The handler may refuse (returns false), in
      // which case we never set exitX and Framer's dragConstraints spring
      // the card back to center — the honest picture of "nothing happened".
      // Ordering matters: the old code set exitX first and called the
      // handler after, so a refused completion still flew off-screen.
      const refused = onSwipeRight!() === false;
      if (refused) {
        hapticRefused();
      } else {
        hapticImpact();
        setExitX(window.innerWidth * 1.2);
      }
    } else if (commitLeft) {
      hapticImpact();
      setExitX(-window.innerWidth * 1.2);
      onSwipeLeft();
    } else if (commitDown) {
      hapticImpact();
      setExitY(window.innerHeight * 0.5);
      onSwipeDown!();
    } else if (commitUp) {
      hapticImpact();
      setExitY(-window.innerHeight * 0.5);
      onSwipeUp!();
    }
  };

  return (
    <motion.div
      className={cn('relative touch-none select-none', !disabled && 'cursor-grab active:cursor-grabbing', className)}
      // Suppress iOS's long-press text-selection/callout so tap-and-hold
      // reliably opens the card menu on touch (2026-07-25).
      style={{ x, y, rotate, WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
      drag={disabled || exitX !== null || exitY !== null ? false : hasVertical ? true : 'x'}
      dragDirectionLock={hasVertical}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      onPointerDown={armLongPress}
      onPointerUp={cancelLongPress}
      onPointerCancel={cancelLongPress}
      onPointerMove={maybeCancelOnMove}
      onDragStart={() => {
        draggedRef.current = true;
        cancelLongPress();
      }}
      onDragEnd={handleDragEnd}
      onClickCapture={(e) => {
        if (draggedRef.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      animate={
        exitX !== null
          ? { x: exitX, opacity: 0 }
          : exitY !== null
            ? { y: exitY, opacity: 0, scale: 0.92 }
            : undefined
      }
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}

      {/* Swipe direction hints, revealed proportionally to drag distance */}
      {!disabled && (
        <>
          {onSwipeRight !== undefined && (
            <motion.div
              className="absolute top-4 left-4 pointer-events-none"
              style={{ opacity: completeOpacity }}
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white shadow-md">
                <Check className="w-4 h-4" />
                <span className="text-sm font-semibold">{rightHint ?? t('swipe.done')}</span>
              </div>
            </motion.div>
          )}
          <motion.div
            className="absolute top-4 right-4 pointer-events-none"
            style={{ opacity: deferOpacity }}
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-white shadow-md">
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm font-semibold">{leftHint ?? t('swipe.later')}</span>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default SwipeableCard;
