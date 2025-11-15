/**
 * ProjectSwitcher - Component for switching between projects
 *
 * Displays current project and allows users to switch between different
 * projects. Each project has its own task hierarchy and integration config.
 *
 * Created: 2025-11-15 for unified recursive model (Phase 4)
 */

import React, { useState } from 'react';
import { Check, ChevronsUpDown, Plus, FolderKanban } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject } from '@/contexts/ProjectContext';
import { Project } from '@/types/task';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface ProjectSwitcherProps {
  onCreateProject?: () => void;
  onSwitchProject?: (project: Project) => void;
  className?: string;
}

export function ProjectSwitcher({
  onCreateProject,
  onSwitchProject,
  className,
}: ProjectSwitcherProps) {
  const { currentProject, projects, setCurrentProject } = useProject();
  const [open, setOpen] = useState(false);

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    setOpen(false);
    if (onSwitchProject) {
      onSwitchProject(project);
    }
  };

  const handleCreateProject = () => {
    setOpen(false);
    if (onCreateProject) {
      onCreateProject();
    }
  };

  // Don't render if no projects available
  if (projects.length === 0 && !currentProject) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select project"
          className={cn("w-[250px] justify-between", className)}
        >
          <div className="flex items-center gap-2 truncate">
            <FolderKanban className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {currentProject?.name || "Select project..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search projects..." />
          <CommandList>
            <CommandEmpty>No projects found.</CommandEmpty>
            <CommandGroup heading="Projects">
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.name}
                  onSelect={() => handleSelectProject(project)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {project.color && (
                      <div
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: project.color }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="truncate">{project.name}</span>
                    <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <span>{project.taskCount}</span>
                      <span className="text-muted-foreground/50">/</span>
                      <span className="text-green-600 dark:text-green-400">
                        {project.completedCount}
                      </span>
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4 shrink-0",
                      currentProject?.id === project.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={handleCreateProject}
                className="cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Create new project</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
