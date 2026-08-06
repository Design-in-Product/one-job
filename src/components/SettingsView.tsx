// src/components/SettingsView.tsx
// Settings, reached from the long-press arc menu. Home of the 1.0
// backup story: export tasks as JSON, import a backup to restore.

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Task } from '@/types/task';
import { storageMode } from '@/config';
import { getTaskStore } from '@/services/taskStore';
import { withoutTrashed } from '@/domain/tasks';
import { toast, isQuietMode, setQuietMode } from '@/components/ui/sonner';
import { hasPro, setPro, proSince, PRO_CODE } from '@/services/entitlements';
import { Switch } from '@/components/ui/switch';
import { Download, Upload, Copy, ClipboardPaste, Smartphone, Cloud, FlaskConical } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BACKUP_VERSION = 2; // v2: cards with named interior decks (import accepts v1 and v2)
// Backup-age tracking, per storage mode (a demo export shouldn't quiet
// the nudge for your real deck)
const LAST_EXPORT_KEY = `oneJobLastExport-${storageMode}`;
const STALE_AFTER_DAYS = 7;

interface SettingsViewProps {
  /** Called after an import replaces the data, so the app can refresh */
  onDataImported: () => void;
}

// Icons per storage mode; labels/descriptions live in the locale files
const MODE_ICONS = { local: Smartphone, demo: FlaskConical, remote: Cloud } as const;

const SettingsView: React.FC<SettingsViewProps> = ({ onDataImported }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<Task[] | null>(null);
  const [lastExport, setLastExport] = useState<string | null>(
    () => localStorage.getItem(LAST_EXPORT_KEY)
  );

  const ModeIcon = MODE_ICONS[storageMode];
  const canImport = !!getTaskStore().importTasks;

  const backupAgeDays = lastExport
    ? Math.floor((Date.now() - new Date(lastExport).getTime()) / 86_400_000)
    : null;
  const backupStale = backupAgeDays === null || backupAgeDays >= STALE_AFTER_DAYS;
  const backupAgeText =
    backupAgeDays === null
      ? t('settings.lastBackupNever')
      : backupAgeDays === 0
        ? t('settings.lastBackupToday')
        : t('settings.lastBackupDays', { count: backupAgeDays });

  const [quiet, setQuiet] = useState(isQuietMode());
  const [pro, setProState] = useState(hasPro());
  const [proCode, setProCode] = useState('');
  const submitProCode = () => {
    if (proCode.trim().toLowerCase() === PRO_CODE) {
      setPro(true); setProState(true); setProCode('');
      toast.success(t('settings.proEnabled'));
    } else {
      toast.error(t('settings.proCodeWrong'));
    }
  };
  const toggleQuiet = (on: boolean) => {
    setQuietMode(on);
    setQuiet(on);
  };

  const buildBackup = async () => {
    // Backups exclude the trash (Xian, 2026-07-29): cards there are not
    // protected, and a restore should never resurrect what was already
    // thrown away. The toast count reflects what the file actually holds.
    const tasks = withoutTrashed(await getTaskStore().getAllTasks());
    const json = JSON.stringify(
      { app: 'one-job', version: BACKUP_VERSION, exportedAt: new Date().toISOString(), tasks },
      null,
      2
    );
    return { tasks, json, filename: `onejob-backup-${new Date().toISOString().slice(0, 10)}.json` };
  };

  const recordExport = () => {
    const now = new Date().toISOString();
    localStorage.setItem(LAST_EXPORT_KEY, now);
    setLastExport(now);
  };

  // HARD LESSON (2026-07-05, real data lost): iOS home-screen web apps can
  // silently drop programmatic blob downloads, and the old code toasted
  // success after merely ATTEMPTING one. Success toasts must report
  // observed outcomes. Path 1: the share sheet — its promise resolves only
  // after the user completes saving. Path 2 (no share support, i.e.
  // desktop browsers where downloads are dependable): anchor download,
  // messaged honestly with the filename to verify.
  const handleExport = async () => {
    try {
      const { tasks, json, filename } = await buildBackup();
      const file = new File([json], filename, { type: 'application/json' });

      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          recordExport();
          toast.success(t('settings.exported', { count: tasks.length }));
          return;
        } catch (err) {
          if ((err as Error).name === 'AbortError') {
            toast.info(t('settings.exportCancelled'));
            return;
          }
          // share failed for another reason — fall through to download
        }
      }

      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      recordExport();
      toast.info(t('settings.exportDownloaded', { filename }), { duration: 8000 });
    } catch (err) {
      toast.error(t('settings.exportFailed', { message: (err as Error).message }));
    }
  };

  // Path 3, the bulletproof one: the clipboard write is a promise that
  // resolves only when the data is actually on the clipboard.
  const handleCopyBackup = async () => {
    try {
      const { tasks, json } = await buildBackup();
      await navigator.clipboard.writeText(json);
      recordExport();
      toast.success(t('settings.copied', { count: tasks.length }));
    } catch (err) {
      toast.error(t('settings.copyFailed', { message: (err as Error).message }));
    }
  };

  const stageImport = (raw: string) => {
    const parsed = JSON.parse(raw);
    if (parsed?.app !== 'one-job' || !Array.isArray(parsed.tasks)) {
      throw new Error(t('settings.notABackup'));
    }
    setPendingImport(parsed.tasks);
  };

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    try {
      stageImport(await file.text());
    } catch (err) {
      toast.error(t('settings.readFailed', { message: (err as Error).message }));
    }
  };

  // Restore half of the clipboard path (iOS shows its paste-permission
  // prompt; the read only happens on explicit user gesture)
  const handlePasteImport = async () => {
    try {
      stageImport(await navigator.clipboard.readText());
    } catch (err) {
      toast.error(t('settings.readFailed', { message: (err as Error).message }));
    }
  };

  // Manual escape hatch for stuck service workers (iOS PWAs can lag on
  // the automatic checks — observed 2026-07-04). If a new version is
  // found, the autoUpdate registration activates it and reloads.
  const handleCheckForUpdates = async () => {
    if (!('serviceWorker' in navigator)) {
      toast.info(t('settings.updatesUnavailable'));
      return;
    }
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        toast.info(t('settings.updatesUnavailable'));
        return;
      }
      toast.info(t('settings.updateChecking'));
      await reg.update();
      // If an update was found, the page reloads on activation; if we're
      // still here after a beat, we're current.
      setTimeout(() => toast.success(t('settings.updateCurrent', { version: __APP_VERSION__ })), 4000);
    } catch (err) {
      toast.error(t('settings.updateCheckFailed', { message: (err as Error).message }));
    }
  };

  const confirmImport = async () => {
    if (!pendingImport) return;
    try {
      await getTaskStore().importTasks!(pendingImport);
      toast.success(t('settings.restored', { count: pendingImport.length }));
      setPendingImport(null);
      onDataImported();
    } catch (err) {
      toast.error(t('settings.importFailed', { message: (err as Error).message }));
    }
  };

  // Non-destructive path (blocker 4): the imported deck becomes a sub-deck
  // of the top card, leaving the current deck untouched.
  const importAsSubdeck = async () => {
    if (!pendingImport) return;
    try {
      await getTaskStore().importAsSubdeck!(pendingImport);
      toast.success(t('settings.importedAsSubdeck', { count: pendingImport.length }));
      setPendingImport(null);
      onDataImported();
    } catch (err) {
      toast.error(t('settings.importFailed', { message: (err as Error).message }));
    }
  };

  return (
    <div className="px-4 pb-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">{t('settings.title')}</h2>

      {/* Storage mode */}
      <section className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center">
            <ModeIcon className="w-5 h-5 text-taskGradient-start" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {t('settings.storageTitle', { mode: t(`settings.mode.${storageMode}.label`) })}
            </h3>
          </div>
        </div>
        <p className="text-sm text-gray-600">{t(`settings.mode.${storageMode}.description`)}</p>
      </section>

      {/* Quiet mode (Xian, 2026-07-29): mute the confirmation toasts.
          Errors always surface; undo stays in the hold-menu and shake. */}
      <section className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-800">{t('settings.quietTitle')}</h3>
            <p className="text-sm text-gray-600">{t('settings.quietDescription')}</p>
          </div>
          <Switch
            checked={quiet}
            onCheckedChange={toggleQuiet}
            aria-label={t('settings.quietTitle')}
          />
        </div>
      </section>

      {/* Pro (2026-08-04): the in-app grant path — installed PWAs have no
          address bar, and a ?pro URL can open in the WRONG browser
          container (the day's incident). Device-local, same seam. */}
      <section className="bg-white rounded-xl shadow p-4 space-y-2">
        <h3 className="font-semibold text-gray-800">{t('settings.proTitle')}</h3>
        {pro ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-600">{t('settings.proActive')}{proSince() ? ` · ${t('settings.proSince', { date: new Date(proSince()!).toLocaleDateString() })}` : ''}</p>
            <Button variant="outline" size="sm"
              onClick={() => { setPro(false); setProState(false); toast.info(t('settings.proDisabled')); }}>
              {t('settings.proRemove')}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={proCode}
              onChange={e => setProCode(e.target.value)}
              placeholder={t('settings.proCodePlaceholder')}
              aria-label={t('settings.proTitle')}
              onKeyDown={e => { if (e.key === 'Enter') submitProCode(); }}
            />
            <Button onClick={submitProCode}>{t('settings.proApply')}</Button>
          </div>
        )}
      </section>

      {/* Backup */}
      <section className="bg-white rounded-xl shadow p-4 space-y-3">
        <h3 className="font-semibold text-gray-800">{t('settings.backup')}</h3>
        <p className={backupStale ? 'text-xs text-amber-600 font-medium' : 'text-xs text-gray-500'}>
          {backupAgeText}
        </p>
        <Button onClick={handleExport} className="w-full justify-start gap-2" variant="outline">
          <Download className="w-4 h-4" />
          {t('settings.export')}
        </Button>
        <Button onClick={handleCopyBackup} className="w-full justify-start gap-2" variant="outline">
          <Copy className="w-4 h-4" />
          {t('settings.copyBackup')}
        </Button>

        {canImport && (
          <>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <Upload className="w-4 h-4" />
              {t('settings.import')}
            </Button>
            <Button
              onClick={handlePasteImport}
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <ClipboardPaste className="w-4 h-4" />
              {t('settings.pasteImport')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleFileChosen}
            />
            {pendingImport && (
              <div className="border border-gray-200 bg-gray-50 rounded-lg p-3 text-sm space-y-3">
                <p className="text-gray-700">
                  {t('settings.importChoose', { count: pendingImport.length })}
                </p>
                <div className="flex flex-col gap-2">
                  {/* Non-destructive default (safe) */}
                  {getTaskStore().importAsSubdeck && (
                    <Button size="sm" className="justify-start" onClick={importAsSubdeck}>
                      {t('settings.importAsSubdeck')}
                    </Button>
                  )}
                  {/* Destructive, clearly marked */}
                  <Button size="sm" variant="destructive" className="justify-start" onClick={confirmImport}>
                    {t('settings.replaceEverything')}
                  </Button>
                  <Button size="sm" variant="ghost" className="justify-start" onClick={() => setPendingImport(null)}>
                    {t('settings.cancel')}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <div className="text-center space-y-1">
        <p className="text-xs text-gray-400">{t('settings.version', { version: __APP_VERSION__ })}</p>
        <button
          onClick={handleCheckForUpdates}
          className="text-xs text-gray-500 underline underline-offset-2"
        >
          {t('settings.checkForUpdates')}
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
