// src/pages/Index.tsx
//
// Change Log:
// 2025-06-04: Initial integration of FastAPI backend task fetching.
//             - Removed localStorage initialization for tasks.
//             - Added useEffect hook to fetch tasks from http://127.0.0.1:8000/tasks.
//             - Implemented mapBackendTaskToFrontendTask to convert backend's 'status' to frontend's 'completed' boolean.
//             - Added console.log statements for debugging fetched data.
// 2025-06-05: Integrated frontend actions with backend API.
//             - Removed localStorage saving useEffect.
//             - Added `refreshTasks` function to re-fetch tasks after CUD operations.
//             - Modified `handleAddTask` to send POST request to FastAPI.
//             - Modified `handleCompleteTask` to send PUT request to FastAPI (status: 'done').
//             - Modified `handleDeferTask` to send PUT request to FastAPI (status: 'todo').
//             - modified mapBackendTaskToFrontendTask to support deferred tasks.
// 2025-06-06  - Added backedTask.sortOrder to mapBackendTasktoFrontendTask

import React, { useState, useEffect, useCallback } from 'react';
import CardDeck from '@/components/CardDeck';
import TaskForm from '@/components/TaskForm';
import CompletedTasks from '@/components/CompletedTasks';
import ChainView from '@/components/ChainView';
import TaskIntegration from '@/components/TaskIntegration';
import TaskDetails from '@/components/TaskDetails';
import SettingsView from '@/components/SettingsView';
import SubstackView from '@/components/SubstackView';
import CardActionMenu, { CardAction } from '@/components/CardActionMenu';
import MoveIntoPicker from '@/components/MoveIntoPicker';
import { Task, Substack } from '@/types/task';
import { toast } from '@/components/ui/sonner';
import { AnimatePresence, motion, useDragControls, PanInfo } from 'framer-motion';
import { isDemoMode } from '@/config';
import { DemoService } from '@/services/demoService';
import { getTaskStore } from '@/services/taskStore';
import { findCardById, findParentOfCard, unfinishedDescendants, pathToUnfinished } from '@/domain/tasks';
import { useShake } from '@/hooks/use-shake';
import { hasPro } from '@/services/entitlements';
import { canvasPreviewOn } from '@/services/canvasPreview';
import CanvasPeek from '@/components/CanvasPeek';
import { InteriorDeck } from '@/types/task';
import ActionSheet from '@/components/ActionSheet';
import { useTranslation } from 'react-i18next';


const Index = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  // Every root deck's cards — the rooms gather from ALL decks, so a card
  // completed in deck-2 never vanishes from Done while deck-1 is active
  // (the 2026-07-07 "nothing shows up in Done" trust bug, new shape).
  const [chainTasks, setChainTasks] = useState<Task[]>([]);
  const [deckCount, setDeckCount] = useState(1);
  const [deckSheet, setDeckSheet] = useState<InteriorDeck[] | null>(null);
  // Stage 3: picking a destination deck for a top-level card
  const [deckMove, setDeckMove] = useState<{ cardId: string; decks: InteriorDeck[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  // Blocker 1: the card whose action menu is open, and the card being moved.
  const [menuCard, setMenuCard] = useState<Task | null>(null);
  const [movingCardId, setMovingCardId] = useState<string | null>(null);
  // Blocker 2: when returning to the main deck from a sub-deck, land face-up.
  const [deckStartRevealed, setDeckStartRevealed] = useState(false);
  // Sub-deck navigation is a STACK (sub-sub-decks, Item 8): push to go
  // deeper, pop to come back one level. currentSubstack = the top.
  const [substackStack, setSubstackStack] = useState<{
    parentTask: Task;
    substack: Substack;
  }[]>([]);
  const currentSubstack = substackStack[substackStack.length - 1] ?? null;

  // Re-point every open context at fresh store data after a mutation
  // (objects in the stack go stale when the store re-reads).
  const refreshStackFrom = (all: Task[]) => {
    setSubstackStack(prev => prev.map(level => {
      const parent = findCardById(all, level.parentTask.id) ?? level.parentTask;
      const deck = parent.decks?.find(d => d.id === level.substack.id) ?? level.substack;
      return { parentTask: parent, substack: deck };
    }));
  };

  // Reload state and every open sub-deck level from the store
  const refreshAll = async () => {
    const all = await getTaskStore().getAllTasks();
    setTasks(all);
    refreshStackFrom(all);
  };
  const [isCreatingSubstack, setIsCreatingSubstack] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'completed' | 'integrate' | 'settings'>('main');

  // --- NEW: refreshTasks function ---
  const refreshTasks = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const store = getTaskStore();
      setTasks(await store.getAllTasks());
      const decks = store.getDecks ? await store.getDecks() : null;
      setChainTasks(decks ? decks.flatMap(d => d.cards) : await store.getAllTasks());
      setDeckCount(decks?.length ?? 1);
    } catch (err) {
      console.error("Could not fetch tasks:", err);
      setError((err as Error).message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- MODIFIED: useEffect for initial fetching tasks from backend ---
  useEffect(() => {
    refreshTasks();
    // Witness launch housekeeping (Done→Archive after 30 days): cards must
    // never change rooms unwatched — the quiet toast is the witnessing.
    const filed = getTaskStore().lastHousekeeping ?? 0;
    if (filed > 0) toast.info(t('toasts.housekeeping', { count: filed }));
  }, [refreshTasks]);

  // --- NEW: handleUpdateTask function to send PUT request for title/description ---
  const handleUpdateTask = async (taskId: string, updates: { title?: string; description?: string }) => {
    try {
      await getTaskStore().updateTask(taskId, updates);
      toast.success(t('toasts.taskUpdated'));
      await refreshAll(); // stay open — autosave must not yank the modal
    } catch (err) {
      console.error("Failed to update task in backend:", err);
      toast.error(t('toasts.updateFailed', { message: (err as Error).message }));
    }
  };


  // --- MODIFIED: handleAddTask to send POST request ---
  const handleAddTask = async (newTask: Task) => {
    if (!currentSubstack) {
      try {
        await getTaskStore().createTask(newTask.title, newTask.description);
        toast.success(isDemoMode
          ? DemoService.getInstance().getDemoMessage('taskAdded')
          : t('toasts.taskAdded'));
        refreshTasks();
      } catch (err) {
        console.error("Failed to add task:", err);
        toast.error(t('toasts.addFailed', { message: (err as Error).message }));
      }
    } else {
      try {
        await getTaskStore().addSubstackTask(
          currentSubstack.substack.id,
          newTask.title,
          newTask.description
        );
        // Re-read from the store rather than hand-stitching state: the
        // local store mutates the same objects React holds, so optimistic
        // appends double-count (seen 2026-07-06).
        await refreshAll();
        toast.success(t('toasts.addedToSubstack'));
      } catch (err) {
        console.error("Failed to add substack task:", err);
        toast.error(t('toasts.addFailed', { message: (err as Error).message }));
      }
    }
  };

  const handleImportTasks = (importedTasks: Task[]) => {
    setTasks(prevTasks => [...importedTasks, ...prevTasks]);
    toast.info(t('toasts.imported'));
  };


  // Recovery: return an accidentally-completed task to the top of the deck.
  const handleUncompleteTask = async (taskId: string) => {
    const store = getTaskStore();
    if (!store.uncompleteTask) return;
    try {
      await store.uncompleteTask(taskId);
      toast.success(t('toasts.uncompleted'));
      refreshTasks();
      setCurrentView('main');
    } catch (err) {
      console.error("Failed to un-complete:", err);
      toast.error(t('toasts.updateFailed', { message: (err as Error).message }));
    }
  };

  // Lifecycle chain handlers (R1.2). Every move offers the same 5s undo
  // as the main deck; purge is confirm-before in the UI, never undoable.
  const chainMove = async (
    taskId: string,
    op: 'archiveTask' | 'unarchiveTask' | 'trashTask' | 'restoreFromTrash',
    toastKey: string
  ) => {
    const store = getTaskStore();
    const fn = store[op];
    if (!fn) return;
    const snapshot = snapshotTask(taskId);
    try {
      await fn.call(store, taskId);
      toast.success(t(toastKey), undoToastOptions(snapshot));
      refreshTasks();
    } catch (err) {
      console.error(`Chain move ${op} failed:`, err);
      toast.error(t('toasts.updateFailed', { message: (err as Error).message }));
    }
  };

  const handlePurgeTask = async (taskId: string) => {
    const store = getTaskStore();
    if (!store.purgeTask) return;
    try {
      await store.purgeTask(taskId);
      toast.success(t('toasts.purged'));
      refreshTasks();
    } catch (err) {
      console.error("Purge failed:", err);
      toast.error(t('toasts.updateFailed', { message: (err as Error).message }));
    }
  };

  const handleEmptyTrash = async () => {
    const store = getTaskStore();
    if (!store.emptyTrash) return;
    try {
      const removed = await store.emptyTrash();
      toast.success(t('toasts.trashEmptied', { count: removed }));
      refreshTasks();
    } catch (err) {
      console.error('Empty trash failed:', err);
      toast.error(t('toasts.updateFailed', { message: (err as Error).message }));
    }
  };

  // Root decks (R2.1 stage 2). The menu entry appears only when this
  // device HAS more than one deck or MAY create one (pro) — no cruft
  // till it's needed (Xian, confirmed 2026-07-29). Creation is the only
  // pro-walled act: data is never hostage to the wall, so switching
  // among existing decks works on any device.
  const decksEntryVisible = deckCount > 1 || hasPro();
  const openDecksSheet = async () => {
    const store = getTaskStore();
    if (store.getDecks) setDeckSheet(await store.getDecks());
  };
  const handleSwitchDeck = async (id: string) => {
    setDeckSheet(null);
    const store = getTaskStore();
    if (!store.switchDeck || id === store.activeDeckId?.()) return;
    await store.switchDeck(id);
    setSubstackStack([]); // the old deck's interior is out of view now
    setCurrentView('main');
    await refreshAll();
  };
  const handleCreateDeck = async () => {
    setDeckSheet(null);
    const store = getTaskStore();
    if (!store.createDeck) return;
    try {
      const deck = await store.createDeck();
      await store.switchDeck?.(deck.id);
      setSubstackStack([]);
      setCurrentView('main');
      toast.success(t('toasts.deckCreated', { name: deck.name }));
      await refreshAll();
    } catch (err) {
      toast.error(t('toasts.updateFailed', { message: (err as Error).message }));
    }
  };

  const handleStartDeckMove = async (cardId: string) => {
    setMenuCard(null);
    const store = getTaskStore();
    if (!store.getDecks) return;
    const others = (await store.getDecks()).filter(d => d.id !== store.activeDeckId?.());
    setDeckMove({ cardId, decks: others });
  };
  const handleMoveToDeck = async (deckId: string) => {
    const move = deckMove;
    setDeckMove(null);
    const store = getTaskStore();
    if (!move || !store.moveCardToDeck) return;
    try {
      const card = await store.moveCardToDeck(move.cardId, deckId);
      const deckName = (await store.getDecks!()).find(d => d.id === deckId)?.name ?? '';
      toast.success(t('toasts.movedToDeck', { title: card.title, deck: deckName }));
      await refreshAll();
    } catch (err) {
      toast.error(t('toasts.moveFailed', { message: (err as Error).message }));
    }
  };

  // ---- Canvas strip (R2.1 stage 4, PREVIEW — ?canvas=on) --------------
  // Paged, my recorded lean: decks left to right in store order, the
  // afterlife (rooms) at the FAR RIGHT — "the afterlife is to the right"
  // globally rhymes with swipe-right-completes locally. Neighbors peek
  // in as slivers of card-back material; tapping pans. Free-drag pan
  // waits for Xian's verdict on this layout.
  const canvasOn = canvasPreviewOn();
  const [deckOrder, setDeckOrder] = useState<{ id: string; name: string | null }[]>([]);
  useEffect(() => {
    if (!canvasOn) return;
    getTaskStore().getDecks?.().then(ds => setDeckOrder(ds.map(d => ({ id: d.id, name: d.name }))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasOn, deckCount, tasks]);
  const stripIndex = () => deckOrder.findIndex(d => d.id === getTaskStore().activeDeckId?.());
  const stripGo = async (delta: number) => {
    const i = stripIndex();
    if (i === -1) return;
    const next = i + delta;
    if (next >= deckOrder.length) { setCurrentView('completed'); return; } // the afterlife
    if (next < 0) return;
    await handleSwitchDeck(deckOrder[next].id);
  };
  // The free pan (approved 2026-07-29: "the strip is good"): grab the
  // BACKGROUND and pull — the card keeps its own horizontal drag, so the
  // pan only arms from pointer-downs outside [data-oj-card]. Same
  // disambiguation-by-target trick as the two hold menus.
  const stripDrag = useDragControls();
  const armStripPan = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-oj-card]')) return;
    stripDrag.start(e);
  };
  const settleStripPan = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || (info.offset.x < -24 && info.velocity.x < -400)) stripGo(1);
    else if (info.offset.x > 60 || (info.offset.x > 24 && info.velocity.x > 400)) stripGo(-1);
  };

  // Session-deep undo (Xian, 2026-07-29): the store replays its state from
  // before the last mutation — any mutation, including a whole-deck import.
  // Reached from the long-press menu and (on devices with motion) a shake,
  // which asks first rather than acting: a shake can be an accident.
  const [shakeUndoPrompt, setShakeUndoPrompt] = useState(false);
  const handleUndoLast = async () => {
    const store = getTaskStore();
    if (!store.undoLast) return;
    try {
      const undone = await store.undoLast();
      if (undone) {
        toast.success(t('toasts.undoneLast'));
        await refreshAll();
      } else {
        toast.info(t('toasts.nothingToUndo'));
      }
    } catch (err) {
      console.error('Undo failed:', err);
      toast.error(t('toasts.updateFailed', { message: (err as Error).message }));
    }
  };
  useShake(() => {
    // Only prompt when there is history — a shake with nothing to undo
    // should not interrupt anyone.
    if (getTaskStore().canUndo?.()) setShakeUndoPrompt(true);
  });

  // Undo support: restore a pre-action snapshot of a task (5s toast window).
  // Only offered when the active store implements restoreTask (local/demo).
  const undoTaskAction = async (snapshot: Task) => {
    const store = getTaskStore();
    if (!store.restoreTask) return;
    try {
      await store.restoreTask(snapshot);
      toast.success(t('toasts.undone'));
      refreshTasks();
    } catch (err) {
      console.error("Failed to undo:", err);
      toast.error(t('toasts.updateFailed', { message: (err as Error).message }));
    }
  };

  // Snapshot a task's current state before mutating it, for undo. Must be a
  // deep clone: the local store mutates the same objects React state holds.
  // Never throws — a failed snapshot only costs the Undo offer, not the swipe.
  const snapshotTask = (taskId: string): Task | undefined => {
    try {
      const task = tasks.find(tk => tk.id === taskId);
      if (!task) return undefined;
      return typeof structuredClone === 'function'
        ? structuredClone(task)
        : (JSON.parse(JSON.stringify(task)) as Task);
    } catch (err) {
      console.warn('Snapshot for undo failed:', err);
      return undefined;
    }
  };

  const undoToastOptions = (snapshot: Task | undefined) =>
    snapshot && getTaskStore().restoreTask
      ? {
          duration: 5000,
          action: { label: t('toasts.undo'), onClick: () => undoTaskAction(snapshot) },
        }
      : undefined;

  // --- MODIFIED: handleCompleteTask to send PUT request ---
  const handleCompleteTask = async (taskId: string) => {
    if (currentSubstack) {
      // Item 15 applies at every depth: a sub-card with an unfinished
      // interior refuses to complete, and its sub-deck comes into focus.
      const card = currentSubstack.substack.cards.find(c => c.id === taskId);
      // Item 15 at any depth: unfinished work ANYWHERE in the subtree
      // refuses the completion (not just direct children — grandchildren
      // buried under a done child count too).
      const unfinishedInside = card ? unfinishedDescendants(card) : [];
      if (card && unfinishedInside.length > 0) {
        toast.info(t('toasts.parentBlocked', { count: unfinishedInside.length }), { duration: 6000 });
        await refreshAll(); // re-deal the refused card
        // The block is the reveal at ANY depth (item 7): descend the whole
        // path to the nearest open card, through completed intermediates.
        const path = pathToUnfinished(card);
        if (path.length > 0) {
          setSubstackStack(prev => [...prev, ...path.map(l => ({ parentTask: l.parent, substack: l.deck }))]);
        }
        return;
      }
      try {
        await getTaskStore().completeSubstackTask(taskId);
        await refreshAll();
        toast.success(t('toasts.substackTaskCompleted'));
      } catch (err) {
        console.error("Failed to persist substack task completion:", err);
        toast.error(t('toasts.completeFailed', { message: (err as Error).message }));
      }
    } else {
      // Vision Item 15 (decided core): a parent with unfinished interior
      // cards cannot complete. The block is the reveal — the card returns
      // and the blocking sub-deck comes into focus.
      const parent = tasks.find(tk => tk.id === taskId);
      // Whole-subtree check (see sub-deck branch): a card can't be done
      // while any descendant, at any depth, is unfinished.
      const unfinished = parent ? unfinishedDescendants(parent) : [];
      if (parent && unfinished.length > 0) {
        toast.info(t('toasts.parentBlocked', { count: unfinished.length }), { duration: 6000 });
        refreshTasks(); // re-deal the refused card
        // Item 7: the reveal follows the same whole-subtree walk as the
        // block, so buried work is shown, not just alluded to.
        const path = pathToUnfinished(parent);
        if (path.length > 0) {
          setSubstackStack(prev => [...prev, ...path.map(l => ({ parentTask: l.parent, substack: l.deck }))]);
        }
        return;
      }
      const snapshot = snapshotTask(taskId);
      try {
        await getTaskStore().completeTask(taskId);
        toast.success(isDemoMode
          ? DemoService.getInstance().getDemoMessage('taskCompleted')
          : t('toasts.taskCompleted'), undoToastOptions(snapshot));
        refreshTasks();
      } catch (err) {
        console.error("Failed to complete task:", err);
        toast.error(t('toasts.completeFailed', { message: (err as Error).message }));
      }
    }
  };

  // --- MODIFIED: handleDeferTask to send PUT request ---
  const handleDeferTask = async (taskId: string) => {
    if (currentSubstack) {
      try {
        await getTaskStore().deferSubstackTask?.(taskId);
        await refreshAll();
        toast.info(t('toasts.substackTaskDeferred'));
      } catch (err) {
        console.error("Failed to persist sub-deck deferral:", err);
        toast.error(t('toasts.deferFailed', { message: (err as Error).message }));
      }
    } else {
      const snapshot = snapshotTask(taskId);
      try {
        await getTaskStore().deferTask(taskId);
        toast.info(isDemoMode
          ? DemoService.getInstance().getDemoMessage('taskDeferred')
          : t('toasts.taskDeferred'), undoToastOptions(snapshot));
        refreshTasks();
      } catch (err) {
        console.error("Failed to defer task:", err);
        toast.error(t('toasts.deferFailed', { message: (err as Error).message }));
      }
    }
  };

  const handleCardClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  // --- Blocker 1: per-card action menu (tap-and-hold, any depth) ---
  const handleCardLongPress = (task: Task) => setMenuCard(task);

  // Blocker 3: tapping a card's sub-deck badge opens the interior directly.
  const handleOpenSubdeckFromCard = (task: Task) => {
    const deck = (task.decks ?? []).find(d => d.cards.length > 0) ?? task.decks?.[0];
    if (deck) handleOpenSubstack(task, deck);
  };

  const handlePromote = async (taskId: string) => {
    setMenuCard(null);
    try {
      await getTaskStore().promoteCard!(taskId);
      toast.success(t('toasts.promoted'));
      await refreshAll();
    } catch (err) {
      toast.error(t('toasts.moveFailed', { message: (err as Error).message }));
    }
  };

  const handleStartMove = (taskId: string) => {
    setMenuCard(null);
    setMovingCardId(taskId);
  };

  const handleMoveInto = async (targetId: string) => {
    const id = movingCardId;
    setMovingCardId(null);
    if (!id) return;
    try {
      const target = findCardById(tasks, targetId);
      await getTaskStore().moveCardInto!(id, targetId);
      toast.success(t('toasts.movedInto', { title: target?.title ?? '' }));
      await refreshAll();
    } catch (err) {
      toast.error(t('toasts.moveFailed', { message: (err as Error).message }));
    }
  };

  // Which actions a card reveals depends on where it sits (introspection).
  const buildCardActions = (card: Task): CardAction[] => {
    const store = getTaskStore();
    const canPromote = !!findParentOfCard(tasks, card.id);
    const subdeck = (card.decks ?? []).find(d => d.cards.length > 0);
    const actions: CardAction[] = [
      { key: 'complete', label: t('cardMenu.complete'),
        onClick: () => { setMenuCard(null); handleCompleteTask(card.id); } },
      { key: 'defer', label: t('cardMenu.defer'),
        onClick: () => { setMenuCard(null); handleDeferTask(card.id); } },
    ];
    if (subdeck) actions.push({ key: 'open', label: t('cardMenu.openSubdeck'),
      onClick: () => { setMenuCard(null); handleOpenSubstack(card, subdeck); } });
    if (canPromote && store.promoteCard) actions.push({ key: 'promote', label: t('cardMenu.promote'),
      onClick: () => handlePromote(card.id) });
    if (store.moveCardInto) actions.push({ key: 'move', label: t('cardMenu.moveInto'),
      onClick: () => handleStartMove(card.id) });
    // Stage 3: at the top level, "promote" becomes "move to another deck" —
    // shown only when there is another deck to move to (no cruft otherwise).
    if (!canPromote && deckCount > 1 && store.moveCardToDeck)
      actions.push({ key: 'movedeck', label: t('cardMenu.moveToDeck'),
        onClick: () => handleStartDeckMove(card.id) });
    actions.push({ key: 'edit', label: t('cardMenu.edit'),
      onClick: () => { setMenuCard(null); handleCardClick(card); } });
    return actions;
  };

  // Item 23: "Add sub-tasks" creates the default (unnamed) deck and the
  // card's back expands straight into it — no naming ritual.
  const handleAddSubtasks = async (taskId: string) => {
    setIsCreatingSubstack(true);
    try {
      const deck = await getTaskStore().createSubstack(taskId, null);
      const all = await getTaskStore().getAllTasks();
      setTasks(all);
      refreshStackFrom(all);
      const parent = findCardById(all, taskId);
      setIsTaskDetailsOpen(false);
      setSelectedTask(null);
      if (parent) setSubstackStack(prev => [...prev, { parentTask: parent, substack: parent.decks!.find(d => d.id === deck.id)! }]);
      toast.success(isDemoMode
        ? DemoService.getInstance().getDemoMessage('substackCreated')
        : t('toasts.subdeckReady'));
    } catch (err) {
      console.error("Failed to create sub-deck:", err);
      toast.error(t('toasts.substackCreateFailed', { message: (err as Error).message }));
    } finally {
      setIsCreatingSubstack(false);
    }
  };

  const handleOpenSubstack = (parentTask: Task, substack: Substack) => {
    setDeckStartRevealed(false); // going deeper — reset the return-face-up flag
    setSubstackStack(prev => [...prev, { parentTask, substack }]);
  };

  const handleBackToParent = () => {
    setSubstackStack(prev => {
      // Blocker 2: landing back on the MAIN deck should arrive face-up
      // (sub-decks are already face-up; only the main deck flips).
      if (prev.length === 1) setDeckStartRevealed(true);
      return prev.slice(0, -1); // pop one level
    });
  };

  const currentTasks = currentSubstack ? currentSubstack.substack.cards : tasks;
  const activeTasks = currentTasks.filter(task => !task.completed);
  const completedTasks = currentTasks.filter(task => task.completed);

  const getCurrentSelectedTask = () => {
    if (!selectedTask) return null;
    if (currentSubstack) {
      return currentSubstack.substack.cards.find(task => task.id === selectedTask.id)
        || findCardById(tasks, selectedTask.id)
        || selectedTask;
    }
    return findCardById(tasks, selectedTask.id) || selectedTask;
  };

  // Card action menu + move-into picker — rendered in both views (they're
  // fixed overlays); tap-and-hold any card at any depth surfaces them.
  const overlays = (
    <>
      <CardActionMenu
        card={menuCard}
        actions={menuCard ? buildCardActions(menuCard) : []}
        onClose={() => setMenuCard(null)}
      />
      {/* Decks sheet (R2.1 stage 2): switch decks; create is pro-walled.
          Names only, no counts — covenant 7 applies to decks too. */}
      <ActionSheet
        open={deckSheet !== null}
        title={t('decks.title')}
        actions={[
          ...(deckSheet ?? []).map(d => ({
            key: d.id,
            label: (getTaskStore().activeDeckId?.() === d.id ? '✓ ' : '') + (d.name ?? t('decks.unnamed')),
            onClick: () => handleSwitchDeck(d.id),
          })),
          ...(hasPro() && getTaskStore().createDeck
            ? [{ key: 'new', label: t('decks.new'), onClick: handleCreateDeck }]
            : []),
        ]}
        onClose={() => setDeckSheet(null)}
      />

      {/* Stage 3: destination picker for a top-level card's deck move */}
      <ActionSheet
        open={deckMove !== null}
        title={t('decks.moveTitle')}
        actions={(deckMove?.decks ?? []).map(d => ({
          key: d.id,
          label: d.name ?? t('decks.unnamed'),
          onClick: () => handleMoveToDeck(d.id),
        }))}
        onClose={() => setDeckMove(null)}
      />

      {/* Shake-to-undo asks before acting (a shake can be an accident) */}
      <ActionSheet
        open={shakeUndoPrompt}
        title={t('undoDialog.title')}
        actions={[
          { key: 'undo', label: t('undoDialog.confirm'),
            onClick: () => { setShakeUndoPrompt(false); handleUndoLast(); } },
        ]}
        onClose={() => setShakeUndoPrompt(false)}
      />

      <MoveIntoPicker
        movingCard={movingCardId ? findCardById(tasks, movingCardId) ?? null : null}
        allCards={tasks}
        onPick={handleMoveInto}
        onClose={() => setMovingCardId(null)}
      />
    </>
  );

  if (currentSubstack) {
    return (
      <div className="min-h-app-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
        <div className="w-full max-w-md mx-auto flex flex-col h-app-screen pt-[max(0.75rem,env(safe-area-inset-top))]">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <SubstackView
              parentTask={currentSubstack.parentTask}
              substack={currentSubstack.substack}
              selectedTask={getCurrentSelectedTask()}
              isTaskDetailsOpen={isTaskDetailsOpen}
              onBack={handleBackToParent}
              onAddTask={handleAddTask}
              onCompleteTask={handleCompleteTask}
              onDeferTask={handleDeferTask}
              onCardClick={handleCardClick}
              onCloseTaskDetails={() => setIsTaskDetailsOpen(false)}
              onAddSubtasks={handleAddSubtasks}
              onOpenSubstack={handleOpenSubstack}
              onUpdateTask={handleUpdateTask}
              onCardLongPress={handleCardLongPress}
              onOpenSubdeck={handleOpenSubdeckFromCard}
            />
          </motion.div>
        </div>
        {overlays}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="main-view"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-app-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col"
      >
        <div className="w-full max-w-md mx-auto flex flex-col h-app-screen pt-[env(safe-area-inset-top)]">

          {/* Card Deck Experience - Single View */}
          <div className="flex flex-col flex-1">
            {currentView === 'main' && canvasOn && (
              <motion.div
                key={`strip-${getTaskStore().activeDeckId?.() ?? 'deck'}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="relative flex flex-col flex-1"
                drag="x"
                dragControls={stripDrag}
                dragListener={false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onPointerDown={armStripPan}
                onDragEnd={settleStripPan}
              >
                {stripIndex() > 0 && (
                  <CanvasPeek side="left"
                    label={deckOrder[stripIndex() - 1]?.name ?? t('decks.unnamed')}
                    onTap={() => stripGo(-1)} />
                )}
                <CanvasPeek side="right"
                  label={stripIndex() < deckOrder.length - 1
                    ? (deckOrder[stripIndex() + 1]?.name ?? t('decks.unnamed'))
                    : t('canvas.afterlife')}
                  variant={stripIndex() < deckOrder.length - 1 ? 'deck' : 'afterlife'}
                  onTap={() => stripGo(1)} />
                <CardDeck
                  tasks={activeTasks}
                  loading={loading}
                  error={error}
                  onComplete={handleCompleteTask}
                  onDefer={handleDeferTask}
                  onCardClick={handleCardClick}
                  onCardLongPress={handleCardLongPress}
                  onOpenSubdeck={handleOpenSubdeckFromCard}
                  startRevealed={deckStartRevealed}
                  onAddTask={handleAddTask}
                  onViewCompleted={() => setCurrentView('completed')}
                  onViewIntegrations={() => setCurrentView('integrate')}
                  onViewSettings={() => setCurrentView('settings')}
                  onUndo={getTaskStore().undoLast ? handleUndoLast : undefined}
                  onDecks={decksEntryVisible && getTaskStore().getDecks ? openDecksSheet : undefined}
                />
              </motion.div>
            )}
            {currentView === 'main' && !canvasOn && (
              <CardDeck
                tasks={activeTasks}
                loading={loading}
                error={error}
                onComplete={handleCompleteTask}
                onDefer={handleDeferTask}
                onCardClick={handleCardClick}
                onCardLongPress={handleCardLongPress}
                onOpenSubdeck={handleOpenSubdeckFromCard}
                startRevealed={deckStartRevealed}
                onAddTask={handleAddTask}
                onViewCompleted={() => setCurrentView('completed')}
                onViewIntegrations={() => setCurrentView('integrate')}
                onViewSettings={() => setCurrentView('settings')}
                onUndo={getTaskStore().undoLast ? handleUndoLast : undefined}
                onDecks={decksEntryVisible && getTaskStore().getDecks ? openDecksSheet : undefined}
              />
            )}
            
            {currentView === 'completed' && (
              <motion.div
                className="relative flex flex-col flex-1"
                drag={canvasOn ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onPointerDownCapture={(e) => {
                  // room cards keep their own swipe grammar
                  if ((e.target as HTMLElement).closest('[data-oj-card]')) e.stopPropagation();
                }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 60 || (info.offset.x > 24 && info.velocity.x > 400)) setCurrentView('main');
                }}
              >
                {canvasOn && (
                  <CanvasPeek side="left"
                    label={deckOrder[deckOrder.length - 1]?.name ?? t('decks.unnamed')}
                    onTap={() => setCurrentView('main')} />
                )}
                <div className="p-4">
                  <button 
                    onClick={() => setCurrentView('main')}
                    className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {t('nav.backToTasks')}
                  </button>
                </div>
                {getTaskStore().archiveTask ? (
                  <ChainView
                    tasks={chainTasks}
                    onUncomplete={handleUncompleteTask}
                    onArchive={(id) => chainMove(id, 'archiveTask', 'toasts.archived')}
                    onUnarchive={(id) => chainMove(id, 'unarchiveTask', 'toasts.unarchived')}
                    onTrash={(id) => chainMove(id, 'trashTask', 'toasts.trashed')}
                    onRestoreFromTrash={(id) => chainMove(id, 'restoreFromTrash', 'toasts.restoredFromTrash')}
                    onPurge={handlePurgeTask}
                    onEmptyTrash={getTaskStore().emptyTrash ? handleEmptyTrash : undefined}
                  />
                ) : (
                  <CompletedTasks
                    tasks={completedTasks}
                    onUncomplete={getTaskStore().uncompleteTask ? handleUncompleteTask : undefined}
                  />
                )}
              </motion.div>
            )}
            
            {currentView === 'settings' && (
              <div className="flex flex-col flex-1">
                <div className="p-4">
                  <button
                    onClick={() => setCurrentView('main')}
                    className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {t('nav.backToTasks')}
                  </button>
                </div>
                <SettingsView onDataImported={refreshTasks} />
              </div>
            )}

            {currentView === 'integrate' && (
              <div className="flex flex-col flex-1">
                <div className="p-4">
                  <button 
                    onClick={() => setCurrentView('main')}
                    className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {t('nav.backToTasks')}
                  </button>
                </div>
                <TaskIntegration onImportTasks={handleImportTasks} onSourceImported={refreshAll} />
              </div>
            )}
          </div>

          <TaskDetails
            task={getCurrentSelectedTask()}
            isOpen={isTaskDetailsOpen}
            onClose={() => setIsTaskDetailsOpen(false)}
            onAddSubtasks={handleAddSubtasks}
            onOpenSubstack={handleOpenSubstack}
            onUpdateTask={handleUpdateTask}
          />
          {overlays}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Index;