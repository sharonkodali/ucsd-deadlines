import { useEffect, useState } from 'react';
import { fetchCanvas } from '@/lib/canvas';
import type { Deadline } from '@/lib/types';

export default function App() {
  const [items, setItems] = useState<Deadline[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCanvas()
      .then((d) => setItems(d.sort((a, b) => a.dueAt.localeCompare(b.dueAt))))
      .catch((e) => setError(e.message === 'NOT_LOGGED_IN'
        ? 'Log in to canvas.ucsd.edu, then reopen this.'
        : e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: 12 }}>Loading…</p>;
  if (error) return <p style={{ padding: 12 }}>{error}</p>;

  return (
    <div style={{ width: 360, padding: 12, fontFamily: 'system-ui' }}>
      <h3>Upcoming</h3>
      {items.length === 0 && <p>Nothing due 🎉</p>}
      {items.map((d) => (
        <a key={d.id} href={d.url} target="_blank"
           style={{ display: 'block', marginBottom: 10, opacity: d.submitted ? 0.5 : 1 }}>
          <strong>{d.title}</strong><br />
          <small>{d.course} · {new Date(d.dueAt).toLocaleString()}</small>
        </a>
      ))}
    </div>
  );
}
