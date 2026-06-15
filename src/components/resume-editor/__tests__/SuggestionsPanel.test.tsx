/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuggestionsPanel } from '@/components/resume-editor/SuggestionsPanel';
import type { ResumeSuggestions } from '@/lib/ai/prompts/resume-suggestions';

vi.mock('@/hooks/use-resume-suggestions', () => ({
  useResumeSuggestions: vi.fn(),
}));
vi.mock('@/lib/ai/provider-registry', () => ({
  PROVIDER_REGISTRY: [{ id: 'openai', name: 'OpenAI' }],
}));
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { useResumeSuggestions } from '@/hooks/use-resume-suggestions';

const mockConfigs = [{ providerId: 'openai', model: 'gpt-4o', isDefault: true, apiKey: 'sk-test' }];

const suggestions: ResumeSuggestions = {
  summary: { suggestion: 'Refined summary text', reasoning: 'Better keywords' },
  workExperience: [
    {
      companyId: 'c1',
      companyName: 'Acme',
      roleId: 'r1',
      roleTitle: 'Engineer',
      include: true,
      relevanceScore: 90,
      reasoning: 'Highly relevant',
      suggestedBullets: ['Led migration to TypeScript', 'Cut bundle size by 30%'],
    },
  ],
  skills: [],
  projects: [],
  sectionOrder: [],
};

function setupHook(overrides: Partial<ReturnType<typeof useResumeSuggestions>> = {}) {
  vi.mocked(useResumeSuggestions).mockReturnValue({
    getSuggestions: vi.fn(),
    suggestions,
    isLoading: false,
    error: null,
    ...overrides,
  } as any);
}

describe('SuggestionsPanel — apply to draft', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not render Apply buttons when no apply callbacks are passed', () => {
    setupHook();
    render(
      <SuggestionsPanel
        applicationId="app-1"
        configs={mockConfigs}
        existingSuggestions={suggestions}
      />
    );
    expect(screen.queryByRole('button', { name: /apply to draft/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /append to draft/i })).not.toBeInTheDocument();
  });

  it('clicking Apply on Suggested Summary fires applySummary with the suggestion text', async () => {
    setupHook();
    const applySummary = vi.fn();
    render(
      <SuggestionsPanel
        applicationId="app-1"
        configs={mockConfigs}
        existingSuggestions={suggestions}
        applySummary={applySummary}
        draftRoleIds={['r1']}
      />
    );
    const btn = screen.getByRole('button', { name: /apply to draft/i });
    await userEvent.click(btn);
    expect(applySummary).toHaveBeenCalledTimes(1);
    expect(applySummary).toHaveBeenCalledWith('Refined summary text');
  });

  it('summary Apply button switches to Applied state after click', async () => {
    setupHook();
    const applySummary = vi.fn();
    render(
      <SuggestionsPanel
        applicationId="app-1"
        configs={mockConfigs}
        existingSuggestions={suggestions}
        applySummary={applySummary}
        draftRoleIds={['r1']}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /apply to draft/i }));
    expect(screen.getByRole('button', { name: /applied/i })).toBeDisabled();
  });

  it('clicking Append on a Work item fires applyWorkBullets with roleId + bullets', async () => {
    setupHook();
    const applyWorkBullets = vi.fn();
    render(
      <SuggestionsPanel
        applicationId="app-1"
        configs={mockConfigs}
        existingSuggestions={suggestions}
        applyWorkBullets={applyWorkBullets}
        draftRoleIds={['r1']}
      />
    );
    // Expand the work item first
    await userEvent.click(screen.getByText(/Acme/i));
    const btn = screen.getByRole('button', { name: /append to draft/i });
    await userEvent.click(btn);
    expect(applyWorkBullets).toHaveBeenCalledWith('r1', [
      'Led migration to TypeScript',
      'Cut bundle size by 30%',
    ]);
  });

  it('Append button is disabled when the roleId is not in draftRoleIds', async () => {
    setupHook();
    const applyWorkBullets = vi.fn();
    render(
      <SuggestionsPanel
        applicationId="app-1"
        configs={mockConfigs}
        existingSuggestions={suggestions}
        applyWorkBullets={applyWorkBullets}
        draftRoleIds={['some-other-role']}
      />
    );
    await userEvent.click(screen.getByText(/Acme/i));
    const btn = screen.getByRole('button', { name: /append to draft/i });
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(applyWorkBullets).not.toHaveBeenCalled();
  });
});
