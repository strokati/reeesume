export interface VacancyAnalysis {
  summary: string;
  responsibilities: string[];
  mustHaves: string[];
  niceToHaves: string[];
  atsKeywords: string[];
  tone: string;
  companyCulture: string;
  masterResumeMatchPreview: {
    relevant: string[];
    gaps: string[];
  };
}
