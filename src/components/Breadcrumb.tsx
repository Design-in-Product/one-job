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
      className={cn(
        "flex items-center gap-2 px-4 py-3 bg-background/80 backdrop-blur-sm border-b border-border",
        className
      )}
      aria-label="Breadcrumb navigation"
    >
      {/* Home/Root button */}
      <button
        onClick={() => handleBreadcrumbClick(0)}
        className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium"
        aria-label="Navigate to root"
      >
        <Home className="h-4 w-4" />
        <span>Tasks</span>
      </button>

      {/* Breadcrumb items */}
      {breadcrumb.map((task, index) => (
        <React.Fragment key={task.id}>
          <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <button
            onClick={() => handleBreadcrumbClick(index + 1)}
            className={cn(
              "px-2 py-1 rounded-md transition-colors text-sm font-medium truncate max-w-[200px]",
              index === breadcrumb.length - 1
                ? "text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            aria-current={index === breadcrumb.length - 1 ? "page" : undefined}
            title={task.title}
          >
            {task.title}
          </button>
        </React.Fragment>
      ))}

      {/* Depth indicator */}
      <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
        <span className="px-2 py-0.5 rounded-full bg-muted">
          Level {currentDepth}
        </span>
      </div>
    </motion.nav>
  );
}
