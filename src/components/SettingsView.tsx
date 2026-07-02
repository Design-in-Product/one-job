// src/components/SettingsView.tsx
// Settings, reached from the long-press arc menu. Home of the 1.0
// backup story: export tasks as JSON, import a backup to restore.

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/task';
import { storageMode } from '@/config';
import { getTaskStore } from '@/services/taskStore';
import { toast } from '@/components/ui/sonner';
import { Download, Upload, Smartphone, Cloud, FlaskConical } from 'lucide-react';

const BACKUP_VERSION = 1;

interface SettingsViewProps {
  /** Called after an import replaces the data, so the app can refresh */
  onDataImported: () => void;
}

const MODE_INFO = {
  local: {
    icon: Smartphone,
    label: 'On this device',
    description: 'Tasks are stored locally in this browser. Nothing leaves your phone — export a backup now and then.'
  },
  demo: {
    icon: FlaskConical,
    label: 'Demo sandbox',
    description: 'You are in the demo. Tasks live in a separate sandbox and never touch your real data.'
  },
  remote: {
    icon: Cloud,
    label: 'Backend sync',
    description: 'Tasks are stored on your configured One Job server. Import from file is disabled in this mode.'
  }
} as const;

const SettingsView: React.FC<SettingsViewProps> = ({ onDataImported }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<Task[] | null>(null);

  const mode = MODE_INFO[storageMode];
  const ModeIcon = mode.icon;
  const canImport = !!getTaskStore().importTasks;

  const handleExport = async () => {
    try {
      const tasks = await getTaskStore().getAllTasks();
      const backup = {
        app: 'one-job',
        version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        tasks
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `onejob-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${tasks.length} task${tasks.length === 1 ? '' : 's'}`);
    } catch (err) {
      toast.error(`Export failed: ${(err as Error).message}`);
    }
  };

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed?.app !== 'one-job' || !Array.isArray(parsed.tasks)) {
        throw new Error('Not a One Job backup file');
      }
      setPendingImport(parsed.tasks);
    } catch (err) {
      toast.error(`Could not read backup: ${(err as Error).message}`);
    }
  };

  const confirmImport = async () => {
    if (!pendingImport) return;
    try {
      await getTaskStore().importTasks!(pendingImport);
      toast.success(`Restored ${pendingImport.length} task${pendingImport.length === 1 ? '' : 's'} from backup`);
      setPendingImport(null);
      onDataImported();
    } catch (err) {
      toast.error(`Import failed: ${(err as Error).message}`);
    }
  };

  return (
    <div className="px-4 pb-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Settings</h2>

      {/* Storage mode */}
      <section className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center">
            <ModeIcon className="w-5 h-5 text-taskGradient-start" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Storage: {mode.label}</h3>
          </div>
        </div>
        <p className="text-sm text-gray-600">{mode.description}</p>
      </section>

      {/* Backup */}
      <section className="bg-white rounded-xl shadow p-4 space-y-3">
        <h3 className="font-semibold text-gray-800">Backup</h3>
        <Button onClick={handleExport} className="w-full justify-start gap-2" variant="outline">
          <Download className="w-4 h-4" />
          Export tasks to file
        </Button>

        {canImport && (
          <>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <Upload className="w-4 h-4" />
              Import backup...
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleFileChosen}
            />
            {pendingImport && (
              <div className="border border-amber-300 bg-amber-50 rounded-lg p-3 text-sm space-y-2">
                <p className="text-amber-800">
                  Replace your current tasks with <strong>{pendingImport.length}</strong> task
                  {pendingImport.length === 1 ? '' : 's'} from this backup? This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={confirmImport}>Replace tasks</Button>
                  <Button size="sm" variant="outline" onClick={() => setPendingImport(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <p className="text-center text-xs text-gray-400">One Job v{__APP_VERSION__}</p>
    </div>
  );
};

export default SettingsView;
