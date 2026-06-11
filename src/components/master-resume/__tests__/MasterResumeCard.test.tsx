import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MasterResumeCard } from '@/components/master-resume/MasterResumeCard';
import type { MasterResumeSummary } from '@/types/master-resume';

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), refresh: mockRefresh }),
}));

vi.mock('@/server/actions/master-resume', () => ({
  setDefaultMasterResume: vi.fn().mockResolvedValue(undefined),
  deleteMasterResume: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/components/master-resume/RenameResumeDialog', () => ({
  RenameResumeDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="rename-dialog">Rename</div> : null,
}));

vi.mock('@/lib/utils/language', () => ({
  languageFlag: (code: string) => (code === 'en' ? '🇬🇧' : '🌐'),
  languageLabel: (code: string) => (code === 'en' ? 'English' : code),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const baseResume: MasterResumeSummary = {
  id: 'resume-1',
  name: 'My Resume',
  language: 'en',
  isDefault: false,
  updatedAt: new Date(),
};

describe('MasterResumeCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders resume name and language', () => {
    render(<MasterResumeCard resume={baseResume} />);
    expect(screen.getByText('My Resume')).toBeInTheDocument();
    expect(screen.getByText(/English/)).toBeInTheDocument();
  });

  it('does not render "Default" badge when isDefault is false', () => {
    render(<MasterResumeCard resume={baseResume} />);
    expect(screen.queryByText(/Default/)).not.toBeInTheDocument();
  });

  it('renders default badge when isDefault is true', () => {
    render(<MasterResumeCard resume={{ ...baseResume, isDefault: true }} />);
    expect(screen.getByText(/Default/)).toBeInTheDocument();
  });

  it('shows relative updated time', () => {
    render(<MasterResumeCard resume={baseResume} />);
    expect(screen.getByText(/Updated/)).toBeInTheDocument();
  });

  it('navigates to /master-resume/${id} on card click', async () => {
    render(<MasterResumeCard resume={baseResume} />);
    await userEvent.click(screen.getByText('My Resume'));
    expect(mockPush).toHaveBeenCalledWith('/master-resume/resume-1');
  });

  it('opens rename dialog from context menu', async () => {
    render(<MasterResumeCard resume={baseResume} />);
    const menuButton = screen.getByRole('button', { name: '' });
    await userEvent.click(menuButton);

    const renameItem = await screen.findByText('Rename');
    await userEvent.click(renameItem);
    expect(screen.getByTestId('rename-dialog')).toBeInTheDocument();
  });

  it('calls setDefaultMasterResume when "Set as Default" is clicked', async () => {
    const { setDefaultMasterResume } = await import('@/server/actions/master-resume');
    render(<MasterResumeCard resume={baseResume} />);

    const menuButton = screen.getByRole('button', { name: '' });
    await userEvent.click(menuButton);

    const setDefaultItem = await screen.findByText('Set as Default');
    await userEvent.click(setDefaultItem);
    expect(vi.mocked(setDefaultMasterResume)).toHaveBeenCalledWith('resume-1');
  });

  it('does not show "Set as Default" for default resumes', async () => {
    render(<MasterResumeCard resume={{ ...baseResume, isDefault: true }} />);
    const menuButton = screen.getByRole('button', { name: '' });
    await userEvent.click(menuButton);

    expect(screen.queryByText('Set as Default')).not.toBeInTheDocument();
  });

  it('shows delete confirmation when "Delete" is clicked', async () => {
    render(<MasterResumeCard resume={baseResume} />);
    const menuButton = screen.getByRole('button', { name: '' });
    await userEvent.click(menuButton);

    const deleteItem = await screen.findByText('Delete');
    await userEvent.click(deleteItem);
    expect(screen.getByText(/Are you sure/)).toBeInTheDocument();
  });

  it('calls deleteMasterResume on confirm and redirects', async () => {
    const { deleteMasterResume } = await import('@/server/actions/master-resume');
    render(<MasterResumeCard resume={baseResume} />);

    const menuButton = screen.getByRole('button', { name: '' });
    await userEvent.click(menuButton);

    const deleteItem = await screen.findByText('Delete');
    await userEvent.click(deleteItem);

    const confirmBtn = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(confirmBtn);

    expect(vi.mocked(deleteMasterResume)).toHaveBeenCalledWith('resume-1');
  });

  it('context menu click does not trigger card navigation', async () => {
    render(<MasterResumeCard resume={baseResume} />);
    const menuButton = screen.getByRole('button', { name: '' });
    await userEvent.click(menuButton);

    expect(mockPush).not.toHaveBeenCalled();
  });
});
