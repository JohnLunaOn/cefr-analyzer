import { CEFRLevel } from '../types';

export interface DifficultyScoreResult {
  score: number;
  level: CEFRLevel;
  note?: string;
}
