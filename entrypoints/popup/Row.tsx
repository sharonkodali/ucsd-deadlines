import type { Deadline } from '@/lib/types';
import { shortCourse, dayLabel, timeLabel, relative } from '@/lib/format';

export default function Row({ d, color, showDate }: { d: Deadline; color: string; showDate?: boolean }) {
  const due = new Date(d.dueAt);
  const rel = relative(due);
  return (
    <a className={`row ${d.submitted ? 'done' : ''}`} href={d.url} target="_blank">
      <span className="bar" style={{ background: color }} />
      <span className="main">
        <span className="title" title={d.title}>{d.title}</span>
        <span className="meta">
          <span style={{ color }}>{shortCourse(d.course)}</span>
          {' · '}
          {showDate ? `${dayLabel(due)}, ` : ''}{timeLabel(due)}
          {rel && <span className="soon"> · {rel}</span>}
        </span>
      </span>
    </a>
  );
}
