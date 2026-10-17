import { useEffect, useState } from 'react';
import type { Deadline } from '@/lib/types';

export default function App() {
  const [items, setItems] = useState<Deadline[]>([]);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    browser.storage.local.get('canvas').then((r: any) => {
      if (r.canvas) {
        const list: Deadline[] = r.canvas.deadlines;
        setItems(list.sort((a, b) => a.dueAt.localeCompare(b.dueAt)));
        setUpdatedAt(r.canvas.updatedAt);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <p style={{ padding: 12 }}>Loading…</p>;

  if (!updatedAt) {
    return (
      <p style={{ padding: 12, width: 300 }}>
        No data yet. Open{' '}
        <a href="https://canvas.ucsd.edu" target="_blank">canvas.ucsd.edu</a>{' '}
        (logged in), then click this icon again.
      </p>
    );
  }

  return (
    <div style={{ width: 360, padding: 12, fontFamily: 'system-ui' }}>
      <h3 style={{ marginBottom: 4 }}>Upcoming</h3>
      <small>Updated {new Date(updatedAt).toLocaleString()}</small>
      {items.length === 0 && <p>Nothing due 🎉</p>}
      {items.map((d) => (
        <a key={d.id} href={d.url} target="_blank"
           style={{ display: 'block', margin: '10px 0', opacity: d.submitted ? 0.5 : 1 }}>
          <strong>{d.title}</strong><br />
          <small>{d.course} · {new Date(d.dueAt).toLocaleString()}</small>
        </a>
      ))}
    </div>
  );
}