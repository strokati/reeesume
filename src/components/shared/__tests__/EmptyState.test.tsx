import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '@/components/shared/EmptyState';

describe('EmptyState', () => {
  it('renders the title and description', () => {
    render(<EmptyState title="No items" description="Add your first item" />);
    expect(screen.getByText('No items')).toBeInTheDocument();
    expect(screen.getByText('Add your first item')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const onClick = vi.fn();
    render(<EmptyState title="No items" action={<button onClick={onClick}>Add item</button>} />);
    const btn = screen.getByRole('button', { name: /add item/i });
    expect(btn).toBeInTheDocument();
  });

  it('does not render action when not provided', () => {
    render(<EmptyState title="No items" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls action handler when button is clicked', async () => {
    const onClick = vi.fn();
    render(<EmptyState title="No items" action={<button onClick={onClick}>Add</button>} />);
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
