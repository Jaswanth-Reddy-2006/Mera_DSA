export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Platform = 'LeetCode' | 'Codeforces' | 'CodeChef' | 'HackerRank' | 'GFG' | 'InterviewBit' | 'Other';
export type SolutionType = 'BRUTE' | 'BETTER' | 'OPTIMAL' | 'ALTERNATIVE';
export type SolutionLanguage = 'cpp' | 'java' | 'python' | 'javascript';
export type ProblemStatus = 'Solved' | 'Revising' | 'Attempted' | 'Todo';

export interface ProblemSolutionData {
  id?: string;
  type: SolutionType;
  language: SolutionLanguage;
  code: string;
  title?: string;
}

export interface ProblemTagData {
  id?: string;
  name: string;
}

export interface ProblemData {
  id: string;
  title: string;
  platform: Platform;
  problemUrl?: string | null;
  difficulty: Difficulty;
  topic: string;
  subtopic?: string | null;
  pattern?: string | null;
  status: ProblemStatus;
  rating: number;
  timeTakenMinutes?: number | null;
  mistakes?: string | null;
  notes?: string | null;
  dryRun?: string | null;
  timeComplexity?: string | null;
  spaceComplexity?: string | null;
  interviewTips?: string | null;
  isFavorite: boolean;
  solvedDate: string;
  lastRevisedAt: string;
  revisionCount: number;
  createdAt: string;
  updatedAt: string;

  solutions?: ProblemSolutionData[];
  tags?: ProblemTagData[];
}

export interface FormulaItemData {
  id: string;
  categoryId: string;
  title: string;
  syntax: string;
  description?: string | null;
  complexity?: string | null;
  codeSnippet?: string | null;
  commonMistakes?: string | null;
}

export interface FormulaCategoryData {
  id: string;
  name: string;
  icon?: string | null;
  order: number;
  items?: FormulaItemData[];
}

export interface AnalyticsStats {
  totalSolved: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  solvedTodayCount: number;
  revisedTodayCount: number;
  dueForRevisionCount: number;
  platformCounts: Record<string, number>;
  topicCounts: Record<string, number>;
  activityCalendar: Record<string, number>;
}
