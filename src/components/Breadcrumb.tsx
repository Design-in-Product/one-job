/**
 * Breadcrumb - Navigation trail component
 *
 * Shows the path from root to current task level, allowing users to
 * navigate back up the hierarchy by clicking on any breadcrumb item.
 *
 * Created: 2025-11-15 for unified recursive model (Phase 4)
 */

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProject } from '@/contexts/ProjectContext';
import { cn } from '@/lib/utils';

interface BreadcrumbProps {
  onNavigateToLevel?: (depth: number) => void;
  className?: string;
}

export function Breadcrumb({ onNavigateToLevel, className }: BreadcrumbProps) {
  const { breadcrumb, isAtRoot, currentDepth } = useProject();

  // Don't show breadcrumb if at root
  if (isAtRoot) {
    return null;
  }

  const handleBreadcrumbClick = (index: number) => {
    if (onNavigateToLevel) {
      onNavigateToLevel(index);
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 md:py-3",
        "bg-background/95 backdrop-blur-sm border-b border-border",
        "overflow-x-auto scrollbar-hide", // Allow horizontal scroll on mobile
        className
      )}
      aria-label="Breadcrumb navigation"
    >
      {/* Home/Root button */}
      <motion.button
        onClick={() => handleBreadcrumbClick(0)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "flex items-center gap-1 px-2 md:px-2.5 py-1.5 rounded-lg",
          "hover:bg-accent hover:text-accent-foreground",
          "transition-all duration-150",
          "text-xs md:text-sm font-medium",
          "touch-manipulation flex-shrink-0" // Don't shrink on mobile
        )}
        aria-label="Navigate to root"
        type="button"
      >
        <Home className="h-3.5 w-3.5 md:h-4 md:w-4" />
        <span className="hidden sm:inline">Tasks</span>
      </motion.button>

      {/* Breadcrumb items */}
      {breadcrumb.map((task, index) => (
        <React.Fragment key={task.id}>
          <ChevronRight
            className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0"
            aria-hidden="true"
          />
          <motion.button
            onClick={() => handleBreadcrumbClick(index + 1)}
            whileHover={index !== breadcrumb.length - 1 ? { scale: 1.05 } : {}}
            whileTap={index !== breadcrumb.length - 1 ? { scale: 0.95 } : {}}
            className={cn(
              "px-2 md:px-2.5 py-1.5 rounded-lg transition-all duration-150",
              "text-xs md:text-sm font-medium",
              "truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px]",
              "touch-manipulation flex-shrink-0",
              index === breadcrumb.length - 1
                ? "text-foreground cursor-default"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            aria-current={index === breadcrumb.length - 1 ? "page" : undefined}
            title={task.title}
            type="button"
            disabled={index === breadcrumb.length - 1} // Disable current page button
          >
            {task.title}
          </motion.button>
        </React.Fragment>
      ))}

      {/* Depth indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="ml-auto flex items-center gap-2 flex-shrink-0"
      >
        <span className={cn(
          "px-2 md:px-2.5 py-1 rounded-full",
          "bg-muted/70 backdrop-blur-sm",
          "text-[10px] md:text-xs font-medium text-muted-foreground",
          "border border-border/50"
        )}>
          <span className="hidden sm:inline">Level </span>{currentDepth}
        </span>
      </motion.div>
    </motion.nav>
  );
}
