import { useEffect, useMemo, useState } from 'react';
import type { Deadline } from '@/lib/types';
import { shortCourse, ago, relative } from '@/lib/format';
import { isLate } from './parts';
import TodayView from './TodayView';
import WeekView from './WeekView';
import ListView from './ListView';

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#2dd4bf', '#fb923c', '#f87171'];
const STALE_MS = 6 * 60 * 60 * 1000; // 6 hours

type Tab = 'today' | 'week' | 'month' | 'alerts' | 'exams';
const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'exams', label: 'Exams' },
];

function Icon({ name }: { name: Tab }) {
  const p = {
    width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'today':
      return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /><rect x="7" y="13" width="4" height="4" rx="0.5" /></svg>;
    case 'week':
      return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M9 5v14M15 5v14" /></svg>;
    case 'month':
      return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4M3 15.5h18M9 10v11M15 10v11" /></svg>;
    case 'alerts':
      return <svg {...p}><path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>;
    case 'exams':
      return <svg {...p}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4h6v3H9zM8.5 11h7M8.5 15h7" /></svg>;
  }
}

export default function App() {
  const [items, setItems] = useState<Deadline[]>([]);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const [tab, setTab] = useState<Tab>('today');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    browser.storage.local.get(['canvas', 'hiddenCourses', 'tab']).then((r: any) => {
      if (r.canvas) {
        setItems(r.canvas.deadlines);
        setUpdatedAt(r.canvas.updatedAt);
      }
      setHidden(r.hiddenCourses ?? []);
      if (TABS.some((t) => t.id === r.tab)) setTab(r.tab);
      setLoading(false);
    });

    // Update the popup live when new Canvas data is saved
    const onChange = (changes: any) => {
      const c = changes.canvas?.newValue;
      if (c) {
        setItems(c.deadlines);
        setUpdatedAt(c.updatedAt);
      }
    };
    browser.storage.onChanged.addListener(onChange);
    return () => browser.storage.onChanged.removeListener(onChange);
  }, []);

  const courses = useMemo(
    () => [...new Set(items.map((d) => shortCourse(d.course)))].sort(),
    [items]
  );
  const colorOf = (course: string) =>
    COLORS[Math.max(0, courses.indexOf(shortCourse(course))) % COLORS.length] ?? '#60a5fa';

  function toggleCourse(c: string) {
    const next = hidden.includes(c) ? hidden.filter((x) => x !== c) : [...hidden, c];
    setHidden(next);
    browser.storage.local.set({ hiddenCourses: next });
  }

  function changeTab(t: Tab) {
    setTab(t);
    browser.storage.local.set({ tab: t });
  }

  // Open Canvas in a background tab; the content script saves fresh data, then we close the tab
  async function syncNow() {
    setSyncing(true);
    const tab = await browser.tabs.create({ url: 'https://canvas.ucsd.edu/', active: false });
    const done = (changes: any) => {
      if (!changes.canvas) return;
      browser.storage.onChanged.removeListener(done);
      if (tab.id) browser.tabs.remove(tab.id);
      setSyncing(false);
    };
    browser.storage.onChanged.addListener(done);
    setTimeout(() => setSyncing(false), 20000); // give up after 20s (e.g. you're logged out)
  }

  function popOut() {
    browser.tabs.create({ url: browser.runtime.getURL('/popup.html') });
  }

  if (loading) return <div className="app" />;

  const now = new Date();
  const visible = items
    .filter((d) => !hidden.includes(shortCourse(d.course)))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const alertCount = visible.filter(
    (d) => isLate(d, now) || (!d.submitted && relative(new Date(d.dueAt), now) !== null)
  ).length;
  const stale = updatedAt !== null && Date.now() - updatedAt > STALE_MS;

  return (
    <div className="app">
      <header className="top">
        <span className="brand">UCSD Deadlines</span>
        <button className="iconbtn" title="Open in a tab" onClick={popOut}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
          </svg>
        </button>
      </header>

      <div className="status">
        <span>
          <span className={`sdot ${!updatedAt || stale ? 'warn' : ''}`} />
          Canvas · {updatedAt ? `updated ${ago(updatedAt)}` : 'not synced yet'}
        </span>
        <button className="sync" onClick={syncNow} disabled={syncing}>
          {syncing ? 'Syncing…' : '↻ Sync now'}
        </button>
      </div>

      {stale && (
        <div className="banner">⚠ Canvas last synced {ago(updatedAt!)}, so rows may be out of date</div>
      )}

      <main className="content">
        {!updatedAt ? (
          <p className="empty">
            No data yet. Click <b>Sync now</b> above.<br />You need to be logged into Canvas.
          </p>
        ) : (
          <>
            <div className="chips">
              {courses.map((c, i) => (
                <button key={c} className={`chip ${hidden.includes(c) ? 'off' : ''}`} onClick={() => toggleCourse(c)}>
                  <span className="dot" style={{ background: COLORS[i % COLORS.length] }} />
                  {c}
                </button>
              ))}
            </div>

            {tab === 'today' && <TodayView items={visible} colorOf={colorOf} />}
            {tab === 'week' && <WeekView items={visible} colorOf={colorOf} />}
            {tab === 'alerts' && <ListView items={visible} colorOf={colorOf} />}
            {tab === 'month' && <p className="empty">Month view is coming soon.</p>}
            {tab === 'exams' && <p className="empty">Exams will show here once a testing-center source is added.</p>}
          </>
        )}
      </main>

      <nav className="bottom">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => changeTab(t.id)}>
            <span className="ic">
              <Icon name={t.id} />
              {t.id === 'alerts' && alertCount > 0 && <span className="badge">{alertCount}</span>}
            </span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
