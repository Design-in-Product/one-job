// src/components/CardDeck.tsx
// Card Deck Experience - Main component implementing the playing card metaphor

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Task } from '@/types/task';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import LongPressMenu from './LongPressMenu';
import { AnimatePresence, motion } from 'framer-motion';

interface CardDeckProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onComplete: (taskId: string) => void;
  onDefer: (taskId: string) => void;
  onCardClick: (task: Task) => void;
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

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  // Error state  
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-red-500 p-4">
          <p className="font-medium mb-2">Oops! Something went wrong</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          {/* Dashed outline where card deck would be */}
          <div 
            className="w-72 h-96 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mb-6 mx-auto relative"
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
            <div className="text-gray-400">
              <h3 className="text-xl font-medium mb-2">You're all caught up! 🌟</h3>
              <p className="text-muted-foreground mb-4">
                What a wonderful feeling to have no pending tasks.
              </p>
              <TaskForm onAddTask={onAddTask} />
            </div>
          </div>
        </div>
        
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
                  onCardClick(task);
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