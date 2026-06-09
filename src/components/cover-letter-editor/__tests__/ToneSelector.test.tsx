import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToneSelector } from '@/components/cover-letter-editor/ToneSelector';

// Mock Tooltip to just render the trigger content as a button
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({
    render: renderProp,
  }: {
    children: React.ReactNode;
    render: React.ReactElement;
  }) => {
    // Clone the render prop element and wrap children text as its content
    return renderProp;
  },
  TooltipContent: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

describe('ToneSelector', () => {
  it('renders all three tone options', () => {
    render(<ToneSelector value="professional" onChange={vi.fn()} />);
    // The buttons don't have visible text (text is in TooltipTrigger children)
    // so check by button count
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('calls onChange with the clicked tone value', async () => {
    const onChange = vi.fn();
    render(<ToneSelector value="professional" onChange={onChange} />);
    const buttons = screen.getAllByRole('button');
    // warm is the 3rd button (index 2)
    await userEvent.click(buttons[2]);
    expect(onChange).toHaveBeenCalledWith('warm');
  });

  it('calls onChange for confident tone', async () => {
    const onChange = vi.fn();
    render(<ToneSelector value="professional" onChange={onChange} />);
    const buttons = screen.getAllByRole('button');
    // confident is the 2nd button (index 1)
    await userEvent.click(buttons[1]);
    expect(onChange).toHaveBeenCalledWith('confident');
  });
});
