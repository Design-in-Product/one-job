// src/domain/cardEdit.ts
// What an open card saves when a field loses focus or the card closes.

export interface CardEdit { title: string; description: string }

/** The update to send, or null when there is nothing to save. A title
    blanked out reverts to the original: the store refuses empty
    titles, and autosave is the wrong moment to raise an error the
    user can't act on. Emptying a title is not a way to delete a card. */
export function pendingEdit(
  task: { title: string; description?: string },
  editedTitle: string,
  editedDescription: string,
): CardEdit | null {
  const title = editedTitle.trim() || task.title;
  if (title === task.title && editedDescription === (task.description ?? '')) return null;
  return { title, description: editedDescription };
}
