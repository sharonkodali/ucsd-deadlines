import { useEffect, useMemo, useState } from 'react';
import type { Deadline } from '@/lib/types';
import { shortCourse, dayLabel, timeLabel, relative } from '@/lib/format';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#ef4444'];
const STALE_MS = 6 * 60 * 60 * 1000; // 6 hours

function Row({ d, color, showDate }: { d: Deadline; color: string; showDate?: boolean }) {
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

export default function App() {
  const [items, setItems] = useState<Deadline[]>([]);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const [showDone, setShowDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    browser.storage.local.get(['canvas', 'hiddenCourses']).then((r: any) => {
      if (r.canvas) {
        setItems(r.canvas.deadlines);
        setUpdatedAt(r.canvas.updatedAt);
      }
      setHidden(r.hiddenCourses ?? []);
      setLoading(false);
    });
  }, []);

  const courses = useMemo(
    () => [...new Set(items.map((d) => shortCourse(d.course)))].sort(),
    [items]
  );
  const colorOf = (course: string) =>
    COLORS[courses.indexOf(shortCourse(course)) % COLORS.length];

  function toggleCourse(c: string) {
    const next = hidden.includes(c) ? hidden.filter((x) => x !== c) : [...hidden, c];
    setHidden(next);
    browser.storage.local.set({ hiddenCourses: next });
  }

  if (loading) return <div className="app">Loading…</div>;

  if (!updatedAt) {
    return (
      <div className="app">
        <p className="empty">
          No data yet. Open{' '}
          <a href="https://canvas.ucsd.edu" target="_blank">canvas.ucsd.edu</a>{' '}
          (logged in), then click this icon again.
        </p>
      </div>
    );
  }

  const now = new Date();
  const visible = items
    .filter((d) => !hidden.includes(shortCourse(d.course)))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));

  const done = visible.filter((d) => d.submitted);
  const todo = visible.filter((d) => !d.submitted);
  const overdue = todo.filter((d) => new Date(d.dueAt) < now);
  const upcoming = todo.filter((d) => new Date(d.dueAt) >= now);

  // Group upcoming items by day label, keeping date order
  const groups: [string, Deadline[]][] = [];
  for (const d of upcoming) {
    const label = dayLabel(new Date(d.dueAt), now);
    const last = groups[groups.length - 1];
    if (last && last[0] === label) last[1].push(d);
    else groups.push([label, [d]]);
  }

  const stale = Date.now() - updatedAt > STALE_MS;

  return (
    <div className="app">
      <header>
        <h1>Upcoming</h1>
        <span className="updated">
          Updated {new Date(updatedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
        </span>
      </header>

      {stale && (
        <div className="stale">
          This list may be out of date.{' '}
          <a href="https://canvas.ucsd.edu" target="_blank">Open Canvas</a> to refresh.
        </div>
      )}

      <div className="chips">
        {courses.map((c) => (
          <button
            key={c}
            className={`chip ${hidden.includes(c) ? 'off' : ''}`}
            onClick={() => toggleCourse(c)}
          >
            <span className="dot" style={{ background: COLORS[courses.indexOf(c) % COLORS.length] }} />
            {c}
          </button>
        ))}
      </div>

      {overdue.length > 0 && (
        <>
          <h2 className="red">Overdue</h2>
          {overdue.map((d) => <Row key={d.id} d={d} color={colorOf(d.course)} showDate />)}
        </>
      )}

      {groups.map(([label, list]) => (
        <div key={label}>
          <h2>{label}</h2>
          {list.map((d) => <Row key={d.id} d={d} color={colorOf(d.course)} />)}
        </div>
      ))}

      {todo.length === 0 && <p className="empty">Nothing due 🎉</p>}

      {done.length > 0 && (
        <>
          <button className="link" onClick={() => setShowDone(!showDone)}>
            {showDone ? 'Hide' : 'Show'} {done.length} submitted
          </button>
          {showDone && done.map((d) => <Row key={d.id} d={d} color={colorOf(d.course)} showDate />)}
        </>
      )}
    </div>
  );
}