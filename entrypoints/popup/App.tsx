import { useEffect, useMemo, useState } from 'react';
import type { Deadline } from '@/lib/types';
import { shortCourse } from '@/lib/format';
import ListView from './ListView';
import WeekView from './WeekView';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#ef4444'];
const STALE_MS = 6 * 60 * 60 * 1000;
type Tab = 'week' | 'list';

export default function App() {
  const [items, setItems] = useState<Deadline[]>([]);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const [tab, setTab] = useState<Tab>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    browser.storage.local.get(['canvas', 'hiddenCourses', 'tab']).then((r: any) => {
      if (r.canvas) {
        setItems(r.canvas.deadlines);
        setUpdatedAt(r.canvas.updatedAt);
      }
      setHidden(r.hiddenCourses ?? []);
      if (r.tab) setTab(r.tab);
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

  function changeTab(t: Tab) {
    setTab(t);
    browser.storage.local.set({ tab: t });
  }

  if (loading) return <div className="app">Loading…</div>;

  if (!updatedAt) {
    return (
      <div className="app">
        <p className="empty">
          No data yet. Open <a href="https://canvas.ucsd.edu" target="_blank">canvas.ucsd.edu</a>{' '}
          (logged in), then click this icon again.
        </p>
      </div>
    );
  }

  const visible = items
    .filter((d) => !hidden.includes(shortCourse(d.course)))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));

  return (
    <div className={`app ${tab === 'week' ? 'wide' : ''}`}>
      <header>
        <div className="tabs">
          <button className={tab === 'week' ? 'active' : ''} onClick={() => changeTab('week')}>Week</button>
          <button className={tab === 'list' ? 'active' : ''} onClick={() => changeTab('list')}>To do</button>
        </div>
        <span className="updated">
          Updated {new Date(updatedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
        </span>
      </header>

      {Date.now() - updatedAt > STALE_MS && (
        <div className="stale">
          This list may be out of date. <a href="https://canvas.ucsd.edu" target="_blank">Open Canvas</a> to refresh.
        </div>
      )}

      <div className="chips">
        {courses.map((c, i) => (
          <button key={c} className={`chip ${hidden.includes(c) ? 'off' : ''}`} onClick={() => toggleCourse(c)}>
            <span className="dot" style={{ background: COLORS[i % COLORS.length] }} />
            {c}
          </button>
        ))}
      </div>

      {tab === 'week'
        ? <WeekView items={visible} colorOf={colorOf} />
        : <ListView items={visible} colorOf={colorOf} />}
    </div>
  );
}