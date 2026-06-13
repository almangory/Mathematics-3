export type ActiveUnit = 'dashboard' | 'abacus' | 'multiplication' | 'division' | 'fractions' | 'clock' | 'geometry' | 'tutor' | 'exams' | 'storybook';

export interface GameScore {
  stars: number;
  streak: number;
}
