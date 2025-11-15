/**
 * SearchBar - Global search component
 *
 * Searches across all tasks in all projects and hierarchies.
 * Shows results with breadcrumb paths indicating location in hierarchy.
 *
 * Created: 2025-11-15 for Phase 5 - Global Search
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronRight, X } from 'lucide-react';
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search tasks..."
          className={cn(
            "w-full pl-9 pr-9 py-2 rounded-md border border-input bg-background",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "placeholder:text-muted-foreground"
          )}
          aria-label="Search tasks"
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-activedescendant={isOpen && results[selectedIndex] ? `result-${selectedIndex}` : undefined}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            id="search-results"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 w-full mt-2 bg-background border border-border rounded-md shadow-lg",
              "max-h-[400px] overflow-y-auto"
            )}
            role="listbox"
          >
            {results.map((task, index) => (
              <button
                key={task.id}
                id={`result-${index}`}
                onClick={() => handleSelectResult(task)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "w-full px-4 py-3 text-left transition-colors",
                  "border-b border-border last:border-b-0",
                  "focus:outline-none",
                  index === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                )}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="flex flex-col gap-1">
                  {/* Task Title */}
                  <div className="font-medium text-sm">
                    {highlightMatch(task.title, query)}
                  </div>

                  {/* Breadcrumb Path */}
                  {task.breadcrumbPath && task.breadcrumbPath.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {task.breadcrumbPath.map((crumb, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <ChevronRight className="h-3 w-3" />}
                          <span className="truncate max-w-[150px]">{crumb}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {/* Description Preview */}
                  {task.description && (
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {highlightMatch(task.description, query)}
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full",
                      task.completed
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    )}>
                      {task.completed ? "Completed" : "Pending"}
                    </span>
                    {task.hasChildren && (
                      <span className="text-muted-foreground">
                        • Has nested tasks
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {/* Results Count */}
            <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/30 border-t border-border">
              {results.length} result{results.length === 1 ? '' : 's'} found
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      <AnimatePresence>
        {isOpen && !isLoading && results.length === 0 && query.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-background border border-border rounded-md shadow-lg p-4 text-center text-sm text-muted-foreground"
          >
            No tasks found for "{query}"
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
