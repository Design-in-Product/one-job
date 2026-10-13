import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/sonner';
import { useTranslation } from 'react-i18next';
import { getTaskStore } from '@/services/taskStore';
import { importFromSource } from '@/services/sourceAdapter';
import {
  TodoistSourceAdapter, listTodoistLists, getTodoistToken, setTodoistToken,
  type TodoistList, type TodoistTarget,
} from '@/services/todoistAdapter';
import {
  getTodoistLinks, saveTodoistLink, setTodoistLinkOrder, serviceKeyFor, DEFAULT_ORDER,
  type TodoistOrder,
} from '@/services/todoistLinks';

interface TodoistIntegrationProps {
  /** The import writes to the store directly; the parent just refreshes. */
  onImported?: () => void;
}

// Todoist, read-only (design: docs/TODOIST-INTEGRATION-DESIGN-2026-10.md).
// The flow xian ruled on 2026-10-12: paste a token, pick ONE project or
// section, answer the order question (One Job's order is the default),
// import. The list becomes a deck named after it. Nothing here writes
// to Todoist.
const TodoistIntegration: React.FC<TodoistIntegrationProps> = ({ onImported }) => {
  const { t } = useTranslation();
  const [token, setToken] = useState(getTodoistToken());
  const [lists, setLists] = useState<TodoistList[] | null>(null);
  const [picked, setPicked] = useState<TodoistTarget | null>(null);
  const [order, setOrder] = useState<TodoistOrder>(DEFAULT_ORDER);
  const [busy, setBusy] = useState<'lists' | 'import' | null>(null);
  const [links, setLinks] = useState(getTodoistLinks());

  const connected = (target: Pick<TodoistTarget, 'projectId' | 'sectionId'>) =>
    links.some(l => l.service === serviceKeyFor(target));

  // Picking a list that is already connected shows the rule it has,
  // so bringing it in again cannot quietly reset the user's choice.
  const choose = (target: TodoistTarget) => {
    setPicked(target);
    setOrder(links.find(l => l.service === serviceKeyFor(target))?.order ?? DEFAULT_ORDER);
  };

  const handleShowLists = async () => {
    if (!token.trim()) {
      toast.error(t('todoist.tokenMissing'));
      return;
    }
    setBusy('lists');
    try {
      const found = await listTodoistLists(token.trim());
      // Kept only once Todoist has accepted it.
      setTodoistToken(token);
      setLists(found);
      setPicked(null);
    } catch (err) {
      toast.error(t('todoist.listsFailed', { message: (err as Error).message }));
    } finally {
      setBusy(null);
    }
  };

  const handleImport = async () => {
    if (!picked) return;
    setBusy('import');
    try {
      const result = await importFromSource(getTaskStore(), new TodoistSourceAdapter(token.trim(), picked));
      saveTodoistLink(picked, order);
      setLinks(getTodoistLinks());
      // The toast reports what was OBSERVED: counts from the store.
      toast.success(t('todoist.imported', { imported: result.imported, skipped: result.skipped, name: picked.name }));
      setPicked(null);
      setOrder(DEFAULT_ORDER);
      onImported?.();
    } catch (err) {
      toast.error(t('todoist.importFailed', { message: (err as Error).message }));
    } finally {
      setBusy(null);
    }
  };

  const changeOrder = (service: string, next: TodoistOrder) => {
    setTodoistLinkOrder(service, next);
    setLinks(getTodoistLinks());
  };

  const pick = (target: TodoistTarget) => (
    <button
      key={serviceKeyFor(target)}
      type="button"
      data-testid={`todoist-pick-${serviceKeyFor(target)}`}
      aria-pressed={picked !== null && serviceKeyFor(picked) === serviceKeyFor(target)}
      onClick={() => choose(target)}
      className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm ${
        target.sectionId ? 'ml-4 w-[calc(100%-1rem)]' : 'w-full font-medium'
      } ${picked !== null && serviceKeyFor(picked) === serviceKeyFor(target) ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
    >
      <span className="truncate">{target.name}</span>
      {connected(target) && <span className="ml-2 shrink-0 text-xs text-muted-foreground">{t('todoist.connected')}</span>}
    </button>
  );

  const orderChoice = (id: string, value: TodoistOrder, onChange: (v: TodoistOrder) => void) => (
    <RadioGroup value={value} onValueChange={v => onChange(v as TodoistOrder)} className="gap-2">
      <div className="flex items-start gap-2">
        <RadioGroupItem value="onejob" id={`${id}-onejob`} className="mt-0.5" />
        <Label htmlFor={`${id}-onejob`} className="font-normal leading-snug">{t('todoist.orderOneJob')}</Label>
      </div>
      <div className="flex items-start gap-2">
        <RadioGroupItem value="todoist" id={`${id}-todoist`} className="mt-0.5" />
        <Label htmlFor={`${id}-todoist`} className="font-normal leading-snug">{t('todoist.orderTodoist')}</Label>
      </div>
    </RadioGroup>
  );

  return (
    <div className="space-y-3 border rounded-md p-3" data-testid="todoist-integration">
      <Label htmlFor="todoisttoken">{t('todoist.title')}</Label>
      <p className="text-xs text-muted-foreground">{t('todoist.hint')}</p>
      <Input
        id="todoisttoken"
        type="password"
        value={token}
        onChange={e => setToken(e.target.value)}
        placeholder={t('todoist.tokenPlaceholder')}
      />
      <Button onClick={handleShowLists} disabled={busy !== null} variant="outline" className="w-full">
        {busy === 'lists' ? t('todoist.loadingLists') : t('todoist.showLists')}
      </Button>

      {lists && lists.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('todoist.noLists')}</p>
      )}

      {lists && lists.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{t('todoist.pickList')}</p>
          <div className="space-y-1">
            {lists.map(p => (
              <React.Fragment key={p.id}>
                {pick({ projectId: p.id, name: p.name })}
                {p.sections.map(s => pick({ projectId: p.id, sectionId: s.id, name: s.name }))}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {picked && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{t('todoist.orderQuestion')}</p>
          {orderChoice('todoist-new-order', order, setOrder)}
          <Button onClick={handleImport} disabled={busy !== null} className="w-full">
            {busy === 'import' ? t('todoist.importing') : t('todoist.import', { name: picked.name })}
          </Button>
        </div>
      )}

      {links.length > 0 && (
        <div className="space-y-3 border-t pt-3">
          <p className="text-sm font-medium">{t('todoist.connectedLists')}</p>
          {links.map(l => (
            <div key={l.service} className="space-y-2" data-testid={`todoist-link-${l.service}`}>
              <p className="text-sm">{l.name}</p>
              {orderChoice(`todoist-order-${l.service}`, l.order, v => changeOrder(l.service, v))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoistIntegration;
