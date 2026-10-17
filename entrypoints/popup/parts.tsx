import type { Deadline, Source } from '@/lib/types';
import { shortCourse } from '@/lib/format';

export const SOURCE_NAMES: Record<Source, string> = {
  canvas: 'Canvas',
  gradescope: 'Gradescope',
  prairielearn: 'PrairieLearn',
  zybooks: 'zyBooks',
  website: 'Course site',
};

export function isLate(d: Deadline, now = new Date()): boolean {
  return !d.submitted && new Date(d.dueAt) < now;
}

// The small coloured course tag, e.g. [DSC 20]
export function Pill({ d, color, late }: { d: Deadline; color: string; late?: boolean }) {
  return (
    <span
      className="pill"
      style={late
        ? { background: 'var(--late-bg)', color: 'var(--late)' }
        : { background: color + '26', color }}
    >
      {shortCourse(d.course)}
    </span>
  );
}
