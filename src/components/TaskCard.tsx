// src/components/TaskCard.tsx
// (Corrected placement of console.log for debugging)

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task';
import { Layers, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskCardProps {
  task: Task;
  onSwipeRight: (id: string) => void;
  onSwipeLeft: (id: string) => void;
  onCardClick: (task: Task) => void;
  isTop?: boolean;
  isFlipped?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onSwipeRight,
  onSwipeLeft,
  onCardClick,
  isTop = false,
  isFlipped = false
}) => {
  // THIS IS THE CORRECT PLACE FOR THE console.log
  console.log(`TaskCard rendered: "${task.title}" (ID: ${task.id.slice(0, 8)}...) - isTop: ${isTop}`);

  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isTop) return;
    setStartX(e.touches[0].clientX);
    setSwiping(true);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTop) return;
    setStartX(e.clientX);
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!swiping || !isTop) return;
    const currentPosition = e.touches[0].clientX;
    setCurrentX(currentPosition - startX);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!swiping || !isTop) return;
    e.preventDefault();
    setCurrentX(e.clientX - startX);
  };

  const handleSwipeEnd = () => {
    if (!swiping || !isTop) return;

    setSwiping(false);

    // Determine if swipe was significant enough
    if (currentX > 100) {
      setSwipeDirection('right');
      console.log(`Attempting to complete task: "${task.title}" (ID: ${task.id})`);
      setTimeout(() => onSwipeRight(task.id), 500);
    } else if (currentX < -100) {
      setSwipeDirection('left');
      console.log(`Attempting to defer task: "${task.title}" (ID: ${task.id})`);
      setTimeout(() => onSwipeLeft(task.id), 500);
    }

    // Reset if not a full swipe
    if (currentX <= 100 && currentX >= -100) {
      setCurrentX(0);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger click if we're swiping
    if (Math.abs(currentX) > 5) return;

    // Don't trigger if click is on swipe area
    if (swiping) return;

    // Only allow click if card is flipped and top
    if (!isFlipped || !isTop) return;

    onCardClick(task);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const style: React.CSSProperties = swiping
    ? {
        transform: `translateX(<span class="math-inline">\{currentX\}px\) rotate\(</span>{currentX * 0.1}deg)`,
        transition: 'none'
      }
    : swipeDirection === 'right'
    ? { animation: 'swipe-right 0.5s forwards' }
    : swipeDirection === 'left'
    ? { animation: 'swipe-left 0.5s forwards' }
    : { transform: 'translateX(0)', transition: 'transform 0.3s ease' };

  const hasSubstacks = task.substacks && task.substacks.length > 0;
  const hasChildren = task.hasChildren || false;
  const hasNestedTasks = hasSubstacks || hasChildren;
  const nestedCount = hasChildren
    ? (task.children?.length || 0)
    : (task.substacks?.length || 0);

  // Calculate swipe progress (0 to 1)
  const swipeProgress = Math.min(Math.abs(currentX) / 100, 1);
  const isSwipingRight = currentX > 0;
  const isSwipingLeft = currentX < 0;
  const showCompleteHint = swipeProgress > 0.7 && isSwipingRight;
  const showDeferHint = swipeProgress > 0.7 && isSwipingLeft;

  return (
    <div
      ref={cardRef}
      className={cn(
        "absolute bg-white dark:bg-gray-800 rounded-xl shadow-xl border-2",
        "flex flex-col p-4 sm:p-6 touch-none select-none",
        "transition-all duration-300",
        // Responsive card dimensions
        "w-[90vw] max-w-sm h-[500px] sm:w-72 sm:h-96",
        // Center the card horizontally
        "left-1/2 transform -translate-x-1/2",
        // Border colors with swipe feedback
        swiping && isSwipingRight && swipeProgress > 0.5
          ? "border-green-400 dark:border-green-500"
          : swiping && isSwipingLeft && swipeProgress > 0.5
          ? "border-yellow-400 dark:border-yellow-500"
          : "border-gray-200 dark:border-gray-700",
        !isTop && "pointer-events-none",
        isTop ? "cursor-pointer" : "cursor-default"
      )}
      style={{
        ...style,
        zIndex: isTop ? 10 : 5,
        opacity: isTop ? 1 : 0.9,
        transform: `translateX(-50%) <span class="math-inline">\{style\.transform \|\| ''\} scale\(</span>{isTop ? 1 : 0.95})`,
        top: '1rem', // Position from top
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleSwipeEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleSwipeEnd}
      onMouseLeave={handleSwipeEnd}
      onClick={handleCardClick}
      role="article"
      aria-label={`Task: ${task.title}${hasNestedTasks ? `, with ${nestedCount} nested task${nestedCount === 1 ? '' : 's'}` : ''}. ${task.description ? task.description : 'No description.'}${task.source ? ` From ${task.source}.` : ''}`}
      tabIndex={isTop && isFlipped ? 0 : -1}
    >
      {/* Swipe feedback overlays */}
      {swiping && (
        <>
          {/* Complete hint (right swipe) */}
          {isSwipingRight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: swipeProgress * 0.9 }}
              className="absolute inset-0 bg-green-500/10 dark:bg-green-500/20 rounded-xl pointer-events-none"
            >
              {showCompleteHint && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
              )}
            </motion.div>
          )}

          {/* Defer hint (left swipe) */}
          {isSwipingLeft && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: swipeProgress * 0.9 }}
              className="absolute inset-0 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-xl pointer-events-none"
            >
              {showDeferHint && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Clock className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
                </div>
              )}
            </motion.div>
          )}
        </>
      )}

      <div className="flex flex-col h-full relative z-10">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 break-words flex-1 leading-tight">
            {task.title}
          </h3>
          {hasNestedTasks && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex items-center gap-1 ml-3 px-2.5 py-1.5 rounded-full flex-shrink-0",
                "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40",
                "border border-blue-200 dark:border-blue-700",
                "shadow-sm hover:shadow-md transition-shadow"
              )}
              aria-label={`${nestedCount} nested task${nestedCount === 1 ? '' : 's'} - tap to explore`}
              role="status"
            >
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300" aria-hidden="true">
                {nestedCount}
              </span>
            </motion.div>
          )}
        </div>

        {task.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-3 sm:mb-4 break-words flex-1 overflow-hidden leading-relaxed">
            {truncateText(task.description, 180)}
          </p>
        )}

        <div className="mt-auto space-y-3">
          {task.source && (
            <div className="flex items-center gap-2">
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40",
                "border border-blue-200 dark:border-blue-700",
                "text-blue-700 dark:text-blue-300"
              )}>
                <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full" />
                {task.source}
              </span>
            </div>
          )}

          {isTop && isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "text-center text-xs sm:text-[11px] leading-relaxed",
                "text-gray-500 dark:text-gray-400",
                "border-t border-gray-200 dark:border-gray-700 pt-3",
                "px-2"
              )}
            >
              {hasNestedTasks ? (
                <span>
                  <span className="font-medium">Tap</span> to explore •{' '}
                  <span className="text-green-600 dark:text-green-400 font-medium">Swipe →</span> complete •{' '}
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">Swipe ←</span> defer
                </span>
              ) : (
                <span>
                  <span className="text-green-600 dark:text-green-400 font-medium">Swipe →</span> complete •{' '}
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">Swipe ←</span> defer •{' '}
                  <span className="font-medium">Tap</span> for details
                </span>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;