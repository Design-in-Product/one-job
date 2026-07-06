
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Task } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

interface TaskIntegrationProps {
  onImportTasks: (tasks: Task[]) => void;
}

const TaskIntegration: React.FC<TaskIntegrationProps> = ({ onImportTasks }) => {
  const { t } = useTranslation();
  const [selectedService, setSelectedService] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      } else if (selectedService === "zapier" && webhookUrl) {
        // For Zapier integration, we would actually send our tasks to the webhook
        // This is just a demo implementation
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors",
          body: JSON.stringify({
            action: "export_tasks",
            timestamp: new Date().toISOString(),
            source: window.location.origin,
          }),
        });
        
        toast.success(t('integration.exportedToZapier'));
        importedTasks = []; // No tasks to import in this case
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
      
      case "zapier":
        return (
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">{t('integration.zapierLabel')}</Label>
            <Input
              id="webhookUrl"
              type="text"
              placeholder={t('integration.zapierPlaceholder')}
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Create a Zapier webhook trigger to connect your tasks.
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
            <SelectItem value="zapier">Zapier (Export)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {selectedService && renderServiceSpecificFields()}
      
      <Button 
        onClick={handleImport} 
        disabled={isLoading || (!selectedService) || (selectedService !== "demo" && selectedService !== "zapier" && !apiKey) || (selectedService === "zapier" && !webhookUrl)}
        className="w-full bg-gradient-to-r from-taskGradient-start to-taskGradient-end hover:opacity-90 text-white"
      >
        {isLoading ? "Processing..." : selectedService === "zapier" ? "Export Tasks" : "Import Tasks"}
      </Button>
    </div>
  );
};

export default TaskIntegration;
