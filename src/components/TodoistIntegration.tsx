import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/sonner';
import { useTranslation } from 'react-i18next';
import { getTaskStore } from '@/services/taskStore';
import { importFromSource } from '@/services/sourceAdapter';
import {
  TodoistSourceAdapter, listTodoistLists, getTodoistToken, setTodoistToken,
  type TodoistList, type TodoistTarget,
} from '@/services/todoistAdapter';
import {
  getTodoistLinks, saveTodoistLink, setTodoistLinkOrder, removeTodoistLink, serviceKeyFor, DEFAULT_ORDER,
  type TodoistOrder, type TodoistLink,
} from '@/services/todoistLinks';
import { syncTodoistLinks } from '@/services/todoistSync';

interface TodoistIntegrationProps {
  /** The import writes to the store directly; the parent just refreshes. */
  onImported?: () => void;
}

// Todoist: one list becomes a deck, synced both ways for completion only (design: docs/TODOIST-INTEGRATION-DESIGN-2026-10.md).
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
  const [busy, setBusy] = useState<'lists' | 'import' | 'sync' | null>(null);
  const [links, setLinks] = useState(getTodoistLinks());
  const [detaching, setDetaching] = useState<{ link: TodoistLink; cards: number; deckId?: string } | null>(null);

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

  const handleSync = async (link: TodoistLink) => {
    setBusy('sync');
    try {
      const [report] = await syncTodoistLinks(getTaskStore(), token.trim(), [link]);
      if (report.error || !report.result) {
        toast.error(t('todoist.syncFailed', { message: report.error ?? '' }));
        return;
      }
      const r = report.result;
      // Observed counts only. "held" = closed there, but unfinished cards inside here.
      const said = [t(r.held > 0 ? 'todoist.syncedHeld' : 'todoist.synced', {
        name: link.name, added: r.added, completed: r.completed, held: r.held,
      })];
      if (r.closedUpstream + r.reopenedUpstream > 0) {
        said.push(t('todoist.syncedWrites', { closed: r.closedUpstream, reopened: r.reopenedUpstream }));
      }
      if (r.writeFailed > 0) {
        toast.error([...said, t('todoist.syncedWriteFailed', { count: r.writeFailed })].join(' '));
      } else {
        toast.success(said.join(' '));
      }
      onImported?.();
    } finally {
      setBusy(null);
    }
  };

  // Detaching (xian, 2026-10-13): "an offer to delete the attached deck
  // -or- to leave it detached as an ordinary deck (no ability to
  // re-attach implied)". Asked every time; the delete names its count.
  const askDetach = async (link: TodoistLink) => {
    const deck = (await getTaskStore().getDecks?.())?.find(d => d.source === link.service);
    setDetaching({ link, cards: deck?.cards.length ?? 0, deckId: deck?.id });
  };

  const detach = async (how: 'keep' | 'delete') => {
    if (!detaching) return;
    const { link, deckId } = detaching;
    const store = getTaskStore();
    try {
      if (how === 'delete' && deckId) {
        const removed = await store.deleteSourceDeck!(deckId);
        toast.success(t('todoist.detachedDeleted', { name: link.name, count: removed }));
      } else {
        if (deckId) await store.unbindDeckSource?.(deckId);
        toast.success(t('todoist.detachedKept', { name: link.name }));
      }
      // The link goes only after the deck step worked.
      removeTodoistLink(link.service);
      setLinks(getTodoistLinks());
      onImported?.();
    } catch (err) {
      toast.error(t('todoist.detachFailed', { message: (err as Error).message }));
    } finally {
      setDetaching(null);
    }
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
          <p className="text-xs text-muted-foreground">{t('todoist.connectedHint')}</p>
          {links.map(l => (
            <div key={l.service} className="space-y-2" data-testid={`todoist-link-${l.service}`}>
              <p className="text-sm">{l.name}</p>
              {orderChoice(`todoist-order-${l.service}`, l.order, v => changeOrder(l.service, v))}
              <div className="flex gap-2">
                <Button onClick={() => handleSync(l)} disabled={busy !== null} variant="outline" size="sm" className="flex-1">
                  {busy === 'sync' ? t('todoist.syncing') : t('todoist.syncNow')}
                </Button>
                <Button onClick={() => askDetach(l)} disabled={busy !== null} variant="ghost" size="sm">
                  {t('todoist.disconnect')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={detaching !== null} onOpenChange={open => { if (!open) setDetaching(null); }}>
        <AlertDialogContent data-testid="todoist-detach">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('todoist.detachTitle', { name: detaching?.link.name })}</AlertDialogTitle>
            <AlertDialogDescription>{t('todoist.detachBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
            <Button onClick={() => detach('keep')}>{t('todoist.detachKeep')}</Button>
            {detaching?.deckId && getTaskStore().deleteSourceDeck && (
              <Button variant="destructive" onClick={() => detach('delete')}>
                {t('todoist.detachDelete', { count: detaching.cards })}
              </Button>
            )}
            <AlertDialogCancel className="mt-0">{t('todoist.detachCancel')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TodoistIntegration;
