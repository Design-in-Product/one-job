/**
 * SearchBar - Global search component
 *
 * Searches across all tasks in all projects and hierarchies.
 * Shows results with breadcrumb paths indicating location in hierarchy.
 *
 * Created: 2025-11-15 for Phase 5 - Global Search
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronRight, X, Layers, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/types/task';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSelectResult: (task: Task) => void;
  projectId?: string;
  className?: string;
}

export function SearchBar({ onSelectResult, projectId, className }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Task[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Cmd/Ctrl+K to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.querySelector(`#result-${selectedIndex}`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
        const params = new URLSearchParams({ q: query.trim() });
        if (projectId) {
          params.append('project_id', projectId);
        }

        const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();

        // Map backend response to frontend Task type
        const tasks: Task[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          completed: item.completed,
          status: item.status,
          createdAt: item.created_at,
          completedAt: item.completed_at,
          deferredAt: item.deferred_at,
          deferralCount: item.deferral_count,
          sortOrder: item.sort_order,
          externalId: item.external_id,
          source: item.source,
          parentId: item.parent_id,
          projectId: item.project_id,
          depth: item.depth,
          path: item.path,
          hasChildren: item.has_children,
          breadcrumbPath: item.breadcrumb_path || []
        }));

        setResults(tasks);
        setIsOpen(tasks.length > 0);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, projectId]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, results, selectedIndex]);

  const handleSelectResult = (task: Task) => {
    onSelectResult(task);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search tasks..."
          className={cn(
            "w-full pl-9 py-2.5 rounded-lg border border-input bg-background",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "placeholder:text-muted-foreground",
            "text-sm md:text-base",
            // Adjust padding based on whether we have buttons on the right
            query || isLoading ? "pr-10" : "pr-20"
          )}
          aria-label="Search tasks across all projects"
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-activedescendant={isOpen && results[selectedIndex] ? `result-${selectedIndex}` : undefined}
        />

        {/* Keyboard shortcut hint (desktop only) */}
        {!query && !isLoading && (
          <div className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 text-xs text-muted-foreground pointer-events-none">
            <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border font-mono">
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
            </kbd>
            <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border font-mono">K</kbd>
          </div>
        )}
        {query && !isLoading && (
          <button
            onClick={handleClear}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              "text-muted-foreground hover:text-foreground transition-colors",
              "p-1 rounded-md hover:bg-muted",
              "touch-manipulation" // Better mobile touch
            )}
            aria-label="Clear search"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <motion.div
              className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            ref={resultsRef}
            id="search-results"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }} // Smooth easing
            className={cn(
              "absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-xl",
              // Mobile-responsive max heights
              "max-h-[60vh] md:max-h-[400px] overflow-y-auto",
              // Smooth scrolling on iOS
              "overscroll-contain",
              // Better mobile scrolling
              "-webkit-overflow-scrolling: touch"
            )}
            role="listbox"
          >
            {results.map((task, index) => (
              <motion.button
                key={task.id}
                id={`result-${index}`}
                onClick={() => handleSelectResult(task)}
                onMouseEnter={() => setSelectedIndex(index)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.2 }}
                className={cn(
                  "w-full px-4 py-3 md:py-3.5 text-left",
                  "border-b border-border last:border-b-0",
                  "focus:outline-none",
                  "transition-all duration-150",
                  "touch-manipulation min-h-[60px] md:min-h-0", // Better mobile tap targets
                  index === selectedIndex
                    ? "bg-accent text-accent-foreground scale-[0.99]"
                    : "hover:bg-accent/50 active:bg-accent/70"
                )}
                role="option"
                aria-selected={index === selectedIndex}
                type="button"
              >
                <div className="flex flex-col gap-1">
                  {/* Task Title */}
                  <div className="font-medium text-sm">
                    {highlightMatch(task.title, query)}
                  </div>

                  {/* Breadcrumb Path */}
                  {task.breadcrumbPath && task.breadcrumbPath.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
                      {task.breadcrumbPath.map((crumb, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <ChevronRight className="h-3 w-3 flex-shrink-0" />}
                          <span className="truncate max-w-[120px] md:max-w-[150px]">{crumb}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {/* Description Preview */}
                  {task.description && (
                    <div className="text-xs text-muted-foreground line-clamp-2 md:line-clamp-1">
                      {highlightMatch(task.description, query)}
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium",
                      task.completed
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    )}>
                      {task.completed ? "✓ Completed" : "○ Pending"}
                    </span>
                    {task.hasChildren && (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Layers className="h-3 w-3" />
                        <span className="hidden sm:inline">Has nested tasks</span>
                        <span className="sm:hidden">Nested</span>
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {/* Results Count Footer */}
            <div className="sticky bottom-0 px-4 py-2.5 text-xs text-muted-foreground bg-muted/50 backdrop-blur-sm border-t border-border">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {results.length} result{results.length === 1 ? '' : 's'} found
                </span>
                <span className="hidden md:inline text-[10px] opacity-70">
                  Use ↑↓ to navigate, Enter to select
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      <AnimatePresence>
        {isOpen && !isLoading && results.length === 0 && query.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-xl p-6 text-center"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  No tasks found
                </p>
                <p className="text-xs text-muted-foreground">
                  No results for "<span className="font-medium">{query}</span>"
                </p>
              </div>
              <p className="text-xs text-muted-foreground max-w-[280px]">
                Try searching with different keywords or check if the task exists in another project
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Highlight matching text in search results
 */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 text-foreground">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
