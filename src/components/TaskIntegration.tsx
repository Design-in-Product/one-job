
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Task } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { featureOn } from '@/services/featureStages';
import { getTaskStore } from '@/services/taskStore';
import { importFromSource } from '@/services/sourceAdapter';
import { GitHubSourceAdapter, getGitHubToken, setGitHubToken } from '@/services/githubAdapter';

interface TaskIntegrationProps {
  onImportTasks: (tasks: Task[]) => void;
  /** Seam imports write to the store directly — the parent just refreshes. */
  onSourceImported?: () => void;
}

const TaskIntegration: React.FC<TaskIntegrationProps> = ({ onImportTasks, onSourceImported }) => {
  const { t } = useTranslation();
  const [selectedService, setSelectedService] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [ghToken, setGhToken] = useState<string>(getGitHubToken());
  const [ghBusy, setGhBusy] = useState(false);

  // R3.2 (2026-07-29): the first REAL source, riding the R3.1 seam.
  // Read-only: open issues assigned to the token's user land in the
  // 'github' root deck on the strip; re-import dedupes by provenance.
  // Pro-walled per PRICING (R3 is the plumbing tier).
  const handleGitHubImport = async () => {
    if (!ghToken.trim()) {
      toast.error(t('github.tokenMissing'));
      return;
    }
    setGhBusy(true);
    try {
      setGitHubToken(ghToken);
      const result = await importFromSource(getTaskStore(), new GitHubSourceAdapter(ghToken.trim()));
      // The toast reports what was OBSERVED: counts from the store, not hope.
      toast.success(t('github.imported', { imported: result.imported, skipped: result.skipped }));
      if (result.imported > 0) onSourceImported?.();
    } catch (err) {
      toast.error(t('github.importFailed', { message: (err as Error).message }));
    } finally {
      setGhBusy(false);
    }
  };

  const handleImport = async () => {
    if (!selectedService) {
      toast.error(t('integration.selectServiceFirst'));
      return;
    }

    setIsLoading(true);
    
    try {
      // Demo implementation for now
      // In a real implementation, this would make API calls to the selected service
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let importedTasks: Task[] = [];
      
      if (selectedService === "demo") {
        // Demo data
        importedTasks = [
          {
            id: uuidv4(),
            title: "Sample task from integration",
            description: "This is a demo task imported from integration",
            completed: false,
            createdAt: new Date(),
            source: "demo"
          },
          {
            id: uuidv4(),
            title: "Another imported task",
            description: "Priority task from external service",
            completed: false,
            createdAt: new Date(),
            source: "demo"
          }
        ];
      }

      if (importedTasks.length > 0) {
        onImportTasks(importedTasks);
        toast.success(`Imported ${importedTasks.length} tasks from ${selectedService}`);
      }
    } catch (error) {
      console.error("Error importing tasks:", error);
      toast.error("Failed to import tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderServiceSpecificFields = () => {
    switch (selectedService) {
      case "asana":
        return (
          <div className="space-y-2">
            <Label htmlFor="apiKey">{t('integration.asanaLabel')}</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder={t('integration.asanaPlaceholder')}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              You can create a Personal Access Token in your Asana account settings.
            </p>
          </div>
        );
      
      case "todoist":
        return (
          <div className="space-y-2">
            <Label htmlFor="apiKey">{t('integration.todoistLabel')}</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder={t('integration.todoistPlaceholder')}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Find your API token in Todoist settings under Integrations.
            </p>
          </div>
        );
      
      case "demo":
        return (
          <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
            Demo integration will import sample tasks for testing purposes.
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-medium">Integrate with Task Services</h3>

      {featureOn('githubImport') && (
        <div className="space-y-2 border rounded-md p-3">
          <Label htmlFor="ghtoken">{t('github.title')}</Label>
          <p className="text-xs text-muted-foreground">{t('github.hint')}</p>
          <Input
            id="ghtoken"
            type="password"
            value={ghToken}
            onChange={e => setGhToken(e.target.value)}
            placeholder={t('github.tokenPlaceholder')}
          />
          <Button onClick={handleGitHubImport} disabled={ghBusy} className="w-full">
            {ghBusy ? t('github.importing') : t('github.import')}
          </Button>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="service">{t('integration.selectService')}</Label>
        <Select value={selectedService} onValueChange={setSelectedService}>
          <SelectTrigger id="service" className="w-full">
            <SelectValue placeholder="Select service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="demo">Demo (Sample Tasks)</SelectItem>
            <SelectItem value="asana">Asana</SelectItem>
            <SelectItem value="todoist">Todoist</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {selectedService && renderServiceSpecificFields()}
      
      <Button 
        onClick={handleImport} 
        disabled={isLoading || !selectedService || (selectedService !== "demo" && !apiKey)}
        className="w-full bg-gradient-to-r from-taskGradient-start to-taskGradient-end hover:opacity-90 text-white"
      >
        {isLoading ? "Processing..." : "Import Tasks"}
      </Button>
    </div>
  );
};

export default TaskIntegration;
