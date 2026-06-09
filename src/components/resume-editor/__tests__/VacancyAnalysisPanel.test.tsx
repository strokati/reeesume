/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VacancyAnalysisPanel } from '@/components/resume-editor/VacancyAnalysisPanel';

vi.mock('@/hooks/use-analyze-vacancy', () => ({
  useAnalyzeVacancy: vi.fn(),
}));
vi.mock('@/lib/ai/providers', () => ({
  PROVIDER_REGISTRY: [
    { id: 'openai', name: 'OpenAI' },
    { id: 'anthropic', name: 'Anthropic' },
  ],
}));

import { useAnalyzeVacancy } from '@/hooks/use-analyze-vacancy';

const mockConfigs = [{ providerId: 'openai', model: 'gpt-4o', isDefault: true, apiKey: 'sk-test' }];

const existingAnalysis = {
  summary: 'Senior frontend role',
  responsibilities: ['Build features'],
  mustHaves: ['React'],
  niceToHaves: [],
  atsKeywords: ['TypeScript'],
  tone: 'casual',
  companyCulture: 'Startup vibe',
  masterResumeMatchPreview: { relevant: ['React'], gaps: [] },
};

describe('VacancyAnalysisPanel', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows lock icon when no providers configured', () => {
    vi.mocked(useAnalyzeVacancy).mockReturnValue({
      analyze: vi.fn(),
      analysis: null,
      isLoading: false,
      error: null,
    } as any);
    render(<VacancyAnalysisPanel applicationId="app-1" configs={[]} existingAnalysis={null} />);
    expect(screen.getByText(/configure an ai provider/i)).toBeInTheDocument();
  });

  it('shows Analyze button when no analysis exists', () => {
    vi.mocked(useAnalyzeVacancy).mockReturnValue({
      analyze: vi.fn(),
      analysis: null,
      isLoading: false,
      error: null,
    } as any);
    render(
      <VacancyAnalysisPanel applicationId="app-1" configs={mockConfigs} existingAnalysis={null} />
    );
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
  });

  it('displays existing analysis', () => {
    vi.mocked(useAnalyzeVacancy).mockReturnValue({
      analyze: vi.fn(),
      analysis: null,
      isLoading: false,
      error: null,
    } as any);
    render(
      <VacancyAnalysisPanel
        applicationId="app-1"
        configs={mockConfigs}
        existingAnalysis={existingAnalysis}
      />
    );
    expect(screen.getByText('Senior frontend role')).toBeInTheDocument();
  });

  it('shows Re-Analyze button when analysis exists', () => {
    vi.mocked(useAnalyzeVacancy).mockReturnValue({
      analyze: vi.fn(),
      analysis: null,
      isLoading: false,
      error: null,
    } as any);
    render(
      <VacancyAnalysisPanel
        applicationId="app-1"
        configs={mockConfigs}
        existingAnalysis={existingAnalysis}
      />
    );
    expect(screen.getByRole('button', { name: /re-analyze/i })).toBeInTheDocument();
  });

  it('shows loading skeleton during analysis', () => {
    vi.mocked(useAnalyzeVacancy).mockReturnValue({
      analyze: vi.fn(),
      analysis: null,
      isLoading: true,
      error: null,
    } as any);
    render(
      <VacancyAnalysisPanel applicationId="app-1" configs={mockConfigs} existingAnalysis={null} />
    );
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
  });

  it('shows error message', () => {
    vi.mocked(useAnalyzeVacancy).mockReturnValue({
      analyze: vi.fn(),
      analysis: null,
      isLoading: false,
      error: 'Analysis failed — check your API key',
    } as any);
    render(
      <VacancyAnalysisPanel applicationId="app-1" configs={mockConfigs} existingAnalysis={null} />
    );
    expect(screen.getByText(/analysis failed/i)).toBeInTheDocument();
  });

  it('calls analyze when Analyze button is clicked', async () => {
    const mockAnalyze = vi.fn();
    vi.mocked(useAnalyzeVacancy).mockReturnValue({
      analyze: mockAnalyze,
      analysis: null,
      isLoading: false,
      error: null,
    } as any);
    render(
      <VacancyAnalysisPanel applicationId="app-1" configs={mockConfigs} existingAnalysis={null} />
    );
    await userEvent.click(screen.getByRole('button', { name: /analyze/i }));
    expect(mockAnalyze).toHaveBeenCalledWith('openai');
  });
});
