import { useState } from 'react';
import type { Deadline } from '@/lib/types';
import { dayLabel } from '@/lib/format';
import Row from './Row';

export default function ListView({ items, colorOf }: { items: Deadline[]; colorOf: (c: string) => string }) {
  const [showDone, setShowDone] = useState(false);
  const now = new Date();

  const done = items.filter((d) => d.submitted);
  const todo = items.filter((d) => !d.submitted);
  const overdue = todo.filter((d) => new Date(d.dueAt) < now);
  const upcoming = todo.filter((d) => new Date(d.dueAt) >= now);

  const groups: [string, Deadline[]][] = [];
  for (const d of upcoming) {
    const label = dayLabel(new Date(d.dueAt), now);
    const last = groups[groups.length - 1];
    if (last && last[0] === label) last[1].push(d);
    else groups.push([label, [d]]);
  }

  return (
    <>
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
    </>
  );
}
