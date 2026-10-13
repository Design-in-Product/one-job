// The open card saves on blur and on close (xian, 2026-07-06: never
// lose field edits to navigation). This decides WHAT gets saved.
import { describe, it, expect } from 'vitest';
import { pendingEdit } from '../cardEdit';

const card = { title: 'Buy milk', description: 'two litres' };

describe('pendingEdit', () => {
  it('is null when nothing changed, so no save and no toast', () => {
    expect(pendingEdit(card, 'Buy milk', 'two litres')).toBeNull();
    expect(pendingEdit({ title: 'T' }, 'T', '')).toBeNull();
  });
  it('carries a changed title and leaves the description as it was', () => {
    expect(pendingEdit(card, 'Buy oat milk', 'two litres')).toEqual({ title: 'Buy oat milk', description: 'two litres' });
  });
  it('carries a changed description', () => {
    expect(pendingEdit(card, 'Buy milk', 'one litre')).toEqual({ title: 'Buy milk', description: 'one litre' });
  });
  it('lets a description be cleared', () => {
    expect(pendingEdit(card, 'Buy milk', '')).toEqual({ title: 'Buy milk', description: '' });
  });
  it('a blanked title reverts to the original: emptying a title is not a way to delete a card', () => {
    expect(pendingEdit(card, '   ', 'two litres')).toBeNull();
    expect(pendingEdit(card, '', 'changed')).toEqual({ title: 'Buy milk', description: 'changed' });
  });
  it('trims the title', () => {
    expect(pendingEdit(card, '  Buy oat milk ', 'two litres')).toEqual({ title: 'Buy oat milk', description: 'two litres' });
  });
});
