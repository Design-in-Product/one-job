import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task';
import { Layers } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onSwipeRight: (id: string) => void;
  onSwipeLeft: (id: string) => void;
  onCardClick: (task: Task) => void;
  isTop?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onSwipeRight, 
  onSwipeLeft,
  onCardClick,
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

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger click if we're swiping
    if (Math.abs(currentX) > 5) return;
    
    // Don't trigger if click is on swipe area
    if (swiping) return;
    
    onCardClick(task);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
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

  const hasSubstacks = task.substacks && task.substacks.length > 0;

  return (
    <div
      ref={cardRef}
      className={cn(
        "absolute inset-4 bg-white rounded-xl shadow-lg border-2 border-gray-200 cursor-pointer",
        "flex flex-col p-6 touch-none select-none",
        !isTop && "pointer-events-none"
      )}
      style={{
        ...style,
        zIndex: isTop ? 10 : 5,
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
      onClick={handleCardClick}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-800 break-words flex-1">
            {task.title}
          </h3>
          {hasSubstacks && (
            <div className="flex items-center gap-1 ml-3 px-2 py-1 bg-blue-50 rounded-full">
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">
                {task.substacks.length}
              </span>
            </div>
          )}
        </div>
        
        {task.description && (
          <p className="text-gray-600 text-base mb-6 break-words flex-1">
            {truncateText(task.description, 200)}
          </p>
        )}
        
        <div className="mt-auto">
          {task.source && (
            <div className="mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {task.source}
              </span>
            </div>
          )}
          
          {isTop && (
            <div className="text-center text-sm text-gray-500 border-t pt-4">
              Swipe right to complete, left to defer, or tap to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
