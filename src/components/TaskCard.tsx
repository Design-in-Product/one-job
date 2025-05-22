
import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task';

interface TaskCardProps {
  task: Task;
  onSwipeRight: (id: string) => void;
  onSwipeLeft: (id: string) => void;
  isTop?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onSwipeRight, 
  onSwipeLeft,
  isTop = false 
}) => {
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
      setTimeout(() => onSwipeRight(task.id), 500);
    } else if (currentX < -100) {
      setSwipeDirection('left');
      setTimeout(() => onSwipeLeft(task.id), 500);
    }
    
    // Reset if not a full swipe
    if (currentX <= 100 && currentX >= -100) {
      setCurrentX(0);
    }
  };

  const style: React.CSSProperties = swiping
    ? {
        transform: `translateX(${currentX}px) rotate(${currentX * 0.1}deg)`,
        transition: 'none'
      }
    : swipeDirection === 'right'
    ? { animation: 'swipe-right 0.5s forwards' }
    : swipeDirection === 'left'
    ? { animation: 'swipe-left 0.5s forwards' }
    : { transform: 'translateX(0)', transition: 'transform 0.3s ease' };

  return (
    <div
      ref={cardRef}
      className={cn(
        "task-card", 
        !isTop && "pointer-events-none"
      )}
      style={{
        ...style,
        zIndex: isTop ? 10 : 5,
        position: 'absolute',
        opacity: isTop ? 1 : 0.9,
        transform: `${style.transform || ''} scale(${isTop ? 1 : 0.95})`,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleSwipeEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleSwipeEnd}
      onMouseLeave={handleSwipeEnd}
    >
      <div className="task-card-content">
        <h3 className="text-xl font-bold mb-2 break-words">{task.title}</h3>
        {task.description && (
          <p className="text-white/90 mb-4 break-words">{task.description}</p>
        )}
        <div className="text-sm text-white/75 mt-auto">
          {isTop && (
            <div className="mt-4 text-center text-sm opacity-75">
              Swipe right to complete, left to defer
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
