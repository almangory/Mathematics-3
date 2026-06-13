export type ActiveUnit = 'dashboard' | 'abacus' | 'multiplication' | 'division' | 'fractions' | 'clock' | 'geometry' | 'tutor';

export interface GameScore {
  stars: number;
  streak: number;
}
