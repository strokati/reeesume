import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MasterResumesView } from '@/app/(app)/master-resume/_components/MasterResumesView';
import type { MasterResumeSummary } from '@/types/master-resume';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/components/master-resume/MasterResumeCard', () => ({
  MasterResumeCard: ({ resume }: { resume: MasterResumeSummary }) => (
    <div data-testid="resume-card">{resume.name}</div>
  ),
}));

vi.mock('@/components/master-resume/NewResumeButton', () => ({
  NewResumeButton: () => <button>New Resume</button>,
}));

const baseResume: MasterResumeSummary = {
  id: 'r1',
  name: 'Test Resume',
  language: 'en',
  isDefault: true,
  updatedAt: new Date(),
};

describe('MasterResumesView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders PageHeader with title "Master Resumes"', () => {
    render(<MasterResumesView resumes={[baseResume]} />);
    expect(screen.getByText('Master Resumes')).toBeInTheDocument();
  });

  it('renders card grid when resumes array is non-empty', () => {
    render(<MasterResumesView resumes={[baseResume]} />);
    expect(screen.getByTestId('resume-card')).toBeInTheDocument();
  });

  it('renders correct number of cards', () => {
    const resumes = [
      baseResume,
      { ...baseResume, id: 'r2', name: 'Second' },
      { ...baseResume, id: 'r3', name: 'Third' },
    ];
    render(<MasterResumesView resumes={resumes} />);
    expect(screen.getAllByTestId('resume-card')).toHaveLength(3);
  });

  it('renders EmptyState when resumes array is empty', () => {
    render(<MasterResumesView resumes={[]} />);
    expect(screen.getByText('No resumes yet')).toBeInTheDocument();
  });

  it('renders NewResumeButton in header and in empty state', () => {
    const { rerender } = render(<MasterResumesView resumes={[baseResume]} />);
    expect(screen.getByRole('button', { name: /new resume/i })).toBeInTheDocument();

    // Empty state has buttons in both header and empty state area
    rerender(<MasterResumesView resumes={[]} />);
    expect(screen.getAllByRole('button', { name: /new resume/i })).toHaveLength(2);
  });
});
