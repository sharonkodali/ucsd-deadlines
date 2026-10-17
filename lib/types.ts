export type Source = 'canvas' | 'gradescope' | 'prairielearn' | 'zybooks' | 'website';

export interface Deadline {
  id: string;
  source: Source;
  course: string;
  title: string;
  dueAt: string;
  url: string;
  kind: 'assignment' | 'quiz' | 'exam' | 'other';
  submitted?: boolean;
}