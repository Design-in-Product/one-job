// src/components/CardDeck.tsx
// Card Deck Experience - Main component implementing the playing card metaphor

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Task } from '@/types/task';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import LongPressMenu from './LongPressMenu';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, AlertCircle } from 'lucide-react';

interface CardDeckProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onComplete: (taskId: string) => void;
  onDefer: (taskId: string) => void;
  onCardClick: (task: Task) => void;
  onZoomIn?: (task: Task) => void;  // NEW: Zoom into task's children
  onAddTask: (task: Task) => void;
  onViewCompleted: () => void;
  onViewIntegrations: () => void;
}

const CardDeck: React.FC<CardDeckProps> = ({
  tasks,
  loading,
  error,
  onComplete,
  onDefer,
  onCardClick,
  onZoomIn,
  onAddTask,
  onViewCompleted,
  onViewIntegrations
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipAnimation, setFlipAnimation] = useState<number>(0);
  const [showMenu, setShowMenu] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const cardDeckRef = useRef<HTMLDivElement>(null);

  // Available flip animations (0-3 for random selection)
  const flipAnimations = [
    'flip-classic',    // Y-axis rotation
    'flip-quick',      // Faster with bounce
    'flip-smooth',     // Slower, deliberate
    'flip-wave'        // Y-axis with X-axis tilt
  ];

  // Get current task
  const currentTask = tasks[0];

  // Reset timeout on any activity
  const resetTimeout = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Only set timeout if card is face-up
    if (isFlipped) {
      timeoutRef.current = setTimeout(() => {
        setIsFlipped(false);
      }, 60000); // 1 minute
    }
  }, [isFlipped]);

  // Auto-flip timeout effect
  useEffect(() => {
    resetTimeout();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimeout]);

  // Handle tap to flip
  const handleCardTap = useCallback(() => {
    if (!isFlipped && tasks.length > 0) {
      // Random flip animation selection
      setFlipAnimation(Math.floor(Math.random() * flipAnimations.length));
      setIsFlipped(true);
      setIsFirstLaunch(false);
      resetTimeout();
    }
  }, [isFlipped, tasks.length, resetTimeout]);

  // Handle swipe actions with auto-flip
  const handleComplete = useCallback((taskId: string) => {
    onComplete(taskId);
    // Auto-flip to next task if available
    setTimeout(() => {
      if (tasks.length > 1) {
        setFlipAnimation(Math.floor(Math.random() * flipAnimations.length));
        setIsFlipped(true);
        resetTimeout();
      } else {
        setIsFlipped(false);
      }
    }, 500);
  }, [onComplete, tasks.length, resetTimeout]);

  const handleDefer = useCallback((taskId: string) => {
    onDefer(taskId);
    // Auto-flip to next task
    setTimeout(() => {
      setFlipAnimation(Math.floor(Math.random() * flipAnimations.length));
      setIsFlipped(true);
      resetTimeout();
    }, 500);
  }, [onDefer, resetTimeout]);

  // Handle long press for menu
  const handleLongPress = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setShowMenu(true);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if card deck is focused or no other input is focused
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === 'INPUT' ||
                             activeElement?.tagName === 'TEXTAREA' ||
                             activeElement?.getAttribute('contenteditable') === 'true';

      if (isInputFocused) return;

      switch(e.key) {
        case 'Enter':
        case ' ':
          if (!isFlipped && tasks.length > 0) {
            e.preventDefault();
            handleCardTap();
          }
          break;

        case 'ArrowRight':
          if (e.shiftKey && isFlipped && currentTask) {
            e.preventDefault();
            handleComplete(currentTask.id);
          }
          break;

        case 'ArrowLeft':
          if (e.shiftKey && isFlipped && currentTask) {
            e.preventDefault();
            handleDefer(currentTask.id);
          }
          break;

        case 'Escape':
          if (showMenu) {
            e.preventDefault();
            setShowMenu(false);
          }
          break;

        case 'm':
        case 'M':
          if (!showMenu) {
            e.preventDefault();
            setShowMenu(true);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, showMenu, tasks.length, handleCardTap, handleComplete, handleDefer, currentTask]);

  // Menu actions
  const handleAddNewTask = () => {
    setShowMenu(false);
    // Will be handled by TaskForm in menu
  };

  // Loading state - Skeleton loader mimicking card
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm"
        >
          {/* Skeleton card */}
          <div className="relative w-72 h-96 mx-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Skeleton content */}
            <div className="p-6 space-y-4">
              {/* Title skeleton */}
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-3/4" />

              {/* Description skeletons */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6" />
              </div>

              {/* Badge skeletons */}
              <div className="flex gap-2 pt-4">
                <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
                <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Loading text */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
                />
                <span>Loading your tasks...</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          {/* Error card */}
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-8 shadow-lg">
            {/* Error icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center"
            >
              <AlertCircle className="w-8 h-8 text-red-500" />
            </motion.div>

            {/* Error text */}
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              {error}
            </p>

            {/* Retry button */}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium text-sm"
            >
              Reload Page
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center w-full max-w-md"
        >
          {/* Dashed outline where card deck would be */}
          <div
            className="w-full max-w-sm mx-auto h-96 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center mb-6 relative overflow-hidden group hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
            onMouseDown={(e) => {
              const longPressTimer = setTimeout(() => handleLongPress(e), 500);
              const cleanup = () => clearTimeout(longPressTimer);
              document.addEventListener('mouseup', cleanup, { once: true });
            }}
            onTouchStart={(e) => {
              const longPressTimer = setTimeout(() => handleLongPress(e), 500);
              const cleanup = () => clearTimeout(longPressTimer);
              document.addEventListener('touchend', cleanup, { once: true });
            }}
          >
            {/* Floating sparkles animation */}
            <motion.div
              className="absolute top-1/4 left-1/4"
              animate={{
                y: [-10, 10, -10],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>

            <motion.div
              className="absolute top-1/3 right-1/4"
              animate={{
                y: [10, -10, 10],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <Sparkles className="w-5 h-5 text-blue-400" />
            </motion.div>

            <motion.div
              className="absolute bottom-1/3 left-1/3"
              animate={{
                y: [-8, 8, -8],
                opacity: [0.5, 0.9, 0.5]
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
            </motion.div>

            {/* Content */}
            <div className="relative z-10 px-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-6xl mb-4"
              >
                🌟
              </motion.div>

              <h3 className="text-xl md:text-2xl font-semibold mb-2 text-foreground">
                All caught up!
              </h3>

              <p className="text-sm md:text-base text-muted-foreground mb-6 px-4">
                What a wonderful feeling to have no pending tasks.
              </p>

              <TaskForm onAddTask={onAddTask} />

              <p className="text-xs text-muted-foreground mt-4 opacity-70">
                Long press or press M for more options
              </p>
            </div>
          </div>
        </motion.div>

        {/* Long press menu */}
        <LongPressMenu
          isOpen={showMenu}
          onClose={() => setShowMenu(false)}
          onAddTask={handleAddNewTask}
          onViewCompleted={onViewCompleted}
          onViewIntegrations={onViewIntegrations}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 relative" role="main" aria-label="Task card deck">
      {/* Main card deck area - takes 80-90% of viewport */}
      <div
        ref={cardDeckRef}
        className="absolute inset-4 flex items-center justify-center"
        tabIndex={0}
        aria-label="Task deck - Press Enter or Space to flip card, M for menu"
        onMouseDown={(e) => {
          const longPressTimer = setTimeout(() => handleLongPress(e), 500);
          const cleanup = () => clearTimeout(longPressTimer);
          document.addEventListener('mouseup', cleanup, { once: true });
        }}
        onTouchStart={(e) => {
          const longPressTimer = setTimeout(() => handleLongPress(e), 500);
          const cleanup = () => clearTimeout(longPressTimer);
          document.addEventListener('touchend', cleanup, { once: true });
        }}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            // Face-down deck
            <motion.div
              key="face-down"
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 0 }}
              exit={{
                rotateY: flipAnimation === 0 ? 180 :
                        flipAnimation === 1 ? 270 :
                        flipAnimation === 2 ? 180 :
                        200, // wave effect
                rotateX: flipAnimation === 3 ? 15 : 0
              }}
              transition={{
                duration: flipAnimation === 1 ? 0.3 : flipAnimation === 2 ? 0.6 : 0.4,
                ease: flipAnimation === 1 ? "easeOut" : "easeInOut"
              }}
              className="w-72 h-96 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-lg border-2 border-orange-200 cursor-pointer flex flex-col items-center justify-center relative focus:outline-none focus:ring-4 focus:ring-orange-400 focus:ring-opacity-50"
              onClick={handleCardTap}
              role="button"
              aria-label={`Card deck with ${tasks.length} task${tasks.length === 1 ? '' : 's'}. Press Enter or Space to reveal your current task.`}
              tabIndex={-1}
            >
              {/* Card back design - centered content */}
              <div className="flex flex-col items-center justify-center">
                {/* OneJob Logo - card stack with "1" */}
                <img
                  src="/logo-onejob.svg"
                  alt="One Job Logo"
                  className="w-24 h-24 mb-6"
                />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
                  One Job
                </h2>
                <p className="text-sm text-gray-500 mt-2">Tap to reveal your task</p>
                <p className="text-xs text-gray-400 mt-4">Press Enter or Space to flip</p>
              </div>
              
              {/* Subtle pulse hint for first launch */}
              {isFirstLaunch && (
                <div className="absolute inset-0 rounded-xl border-2 border-orange-400 animate-pulse opacity-50" />
              )}
            </motion.div>
          ) : (
            // Face-up card showing current task
            <motion.div
              key="face-up"
              initial={{ 
                rotateY: flipAnimation === 0 ? -180 : 
                        flipAnimation === 1 ? -270 :
                        flipAnimation === 2 ? -180 :
                        -200,
                rotateX: flipAnimation === 3 ? -15 : 0
              }}
              animate={{ rotateY: 0, rotateX: 0 }}
              transition={{ 
                duration: flipAnimation === 1 ? 0.3 : flipAnimation === 2 ? 0.6 : 0.4,
                ease: flipAnimation === 1 ? "easeOut" : "easeInOut"
              }}
            >
              <TaskCard
                task={currentTask}
                onSwipeRight={handleComplete}
                onSwipeLeft={handleDefer}
                onCardClick={(task) => {
                  resetTimeout();
                  // If task has children and zoom is enabled, zoom in instead of opening details
                  if (task.hasChildren && onZoomIn) {
                    onZoomIn(task);
                  } else {
                    onCardClick(task);
                  }
                }}
                isTop={true}
                isFlipped={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Long press menu */}
      <LongPressMenu
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        onAddTask={() => {
          setShowMenu(false);
          // Trigger add task form - will be handled by menu component
        }}
        onViewCompleted={() => {
          setShowMenu(false);
          onViewCompleted();
        }}
        onViewIntegrations={() => {
          setShowMenu(false);
          onViewIntegrations();
        }}
      />
    </div>
  );
};

export default CardDeck;