export interface AnalysisResult {
  score: number;
  summary: string;
  matching_skills: string[];
  missing_skills: string[];
  improvement_suggestions: string[];
}
