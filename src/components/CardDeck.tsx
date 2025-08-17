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

  // Available flip animations (0-3 for random selection)
  const flipAnimations = [
    'flip-classic',    // Y-axis rotation
    'flip-quick',      // Faster with bounce
    'flip-smooth',     // Slower, deliberate
    'flip-wave'        // Y-axis with X-axis tilt
  ];

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

  // Menu actions
  const handleAddNewTask = () => {
    setShowMenu(false);
    // Will be handled by TaskForm in menu
  };

  const currentTask = tasks[0];

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
    <div className="flex-1 relative">
      {/* Main card deck area - takes 80-90% of viewport */}
      <div 
        className="absolute inset-4 flex items-center justify-center"
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
              className="w-72 h-96 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-lg border-2 border-orange-200 cursor-pointer flex flex-col items-center justify-center relative"
              onClick={handleCardTap}
            >
              {/* Card back design - centered content */}
              <div className="flex flex-col items-center justify-center">
                {/* Logo or icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
                  One Job
                </h2>
                <p className="text-sm text-gray-500 mt-2">Tap to reveal your task</p>
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