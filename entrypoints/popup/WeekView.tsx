import { useState } from 'react';
import type { Deadline } from '@/lib/types';
import { startOfWeek, startOfDay, sameDay, timeLabel } from '@/lib/format';

export default function WeekView({ items, colorOf }: { items: Deadline[]; colorOf: (c: string) => string }) {
  const [offset, setOffset] = useState(0);

  const start = startOfWeek(new Date());
  start.setDate(start.getDate() + offset * 7);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  const today = startOfDay(new Date()).getTime();
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <>
      <div className="weeknav">
        <span className="label">{fmt(days[0])} – {fmt(days[6])}</span>
        <button onClick={() => setOffset(offset - 1)}>‹</button>
        <button onClick={() => setOffset(0)}>Today</button>
        <button onClick={() => setOffset(offset + 1)}>›</button>
      </div>
      <div className="week">
        {days.map((day) => {
          const list = items.filter((d) => sameDay(new Date(d.dueAt), day));
          return (
            <div key={day.getTime()} className={`day ${day.getTime() === today ? 'today' : ''}`}>
              <div className="dayhead">
                <span>{day.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                <strong>{day.getDate()}</strong>
              </div>
              {list.map((d) => {
                const color = colorOf(d.course);
                return (
                  <a key={d.id} href={d.url} target="_blank" title={d.title}
                     className={`item ${d.submitted ? 'done' : ''}`}
                     style={{ borderLeftColor: color, background: color + '22' }}>
                    <span className="t">{d.title}</span>
                    <span className="m">{timeLabel(new Date(d.dueAt))}</span>
                  </a>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}