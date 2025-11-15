import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import CardDeck from '../CardDeck';
import { runAxe } from '@/test/axe-helper';
import type { Task } from '@/types/task';

describe('CardDeck Accessibility', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      completed: false,
      createdAt: new Date(),
    },
  ];

  const mockHandlers = {
    onComplete: vi.fn(),
    onDefer: vi.fn(),
    onCardClick: vi.fn(),
    onAddTask: vi.fn(),
    onViewCompleted: vi.fn(),
    onViewIntegrations: vi.fn(),
  };

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <CardDeck
        tasks={mockTasks}
        loading={false}
        error={null}
        {...mockHandlers}
      />
    );

    const results = await runAxe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels on main regions', () => {
    render(
      <CardDeck
        tasks={mockTasks}
        loading={false}
        error={null}
        {...mockHandlers}
      />
    );

    // Check for main region
    const mainRegion = screen.getByRole('main');
    expect(mainRegion).toBeInTheDocument();
    expect(mainRegion).toHaveAttribute('aria-label', expect.stringContaining('Task card deck'));
  });

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup();
    render(
      <CardDeck
        tasks={mockTasks}
        loading={false}
        error={null}
        {...mockHandlers}
      />
    );

    // Main region should exist
    const mainRegion = screen.getByRole('main');
    expect(mainRegion).toBeInTheDocument();

    // Card deck (the focusable element) should have tabIndex
    const focusableElement = screen.getByLabelText(/task deck.*press enter or space/i);
    expect(focusableElement).toHaveAttribute('tabIndex', '0');

    // Focus the card deck
    focusableElement.focus();
    expect(focusableElement).toHaveFocus();

    // Test keyboard shortcuts
    await user.keyboard(' '); // Space to flip
    // Note: Full interaction testing would require mocking the state changes
  });

  it('should announce loading state to screen readers', () => {
    render(
      <CardDeck
        tasks={mockTasks}
        loading={true}
        error={null}
        {...mockHandlers}
      />
    );

    // Check for loading announcement
    const loadingText = screen.getByText(/loading/i);
    expect(loadingText).toBeInTheDocument();
  });

  it('should announce error state to screen readers', () => {
    const errorMessage = 'Failed to load tasks';
    render(
      <CardDeck
        tasks={[]}
        loading={false}
        error={errorMessage}
        {...mockHandlers}
      />
    );

    // Check for error announcement
    const errorText = screen.getByText(new RegExp(errorMessage, 'i'));
    expect(errorText).toBeInTheDocument();
  });

  it('should have keyboard hint text visible', () => {
    render(
      <CardDeck
        tasks={mockTasks}
        loading={false}
        error={null}
        {...mockHandlers}
      />
    );

    // Check for keyboard hint
    const hint = screen.getByText(/press enter or space/i);
    expect(hint).toBeInTheDocument();
  });

  it('should have proper focus indicators', () => {
    render(
      <CardDeck
        tasks={mockTasks}
        loading={false}
        error={null}
        {...mockHandlers}
      />
    );

    // Get the focusable element (not the main container)
    const focusableElement = screen.getByLabelText(/task deck.*press enter or space/i);

    // Check for focus ring classes on the actual card element
    // Note: Focus styles are on the card itself in the implementation
    const cardElement = screen.getByRole('button', { name: /card deck with/i });
    expect(cardElement).toHaveClass('focus:ring-4');
    expect(cardElement).toHaveClass('focus:ring-orange-400');
  });
});
