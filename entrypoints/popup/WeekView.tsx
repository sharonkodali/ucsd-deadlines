import { useState } from 'react';
import type { Deadline } from '@/lib/types';
import { startOfWeek, sameDay, timeLabel, lateLabel } from '@/lib/format';
import { Pill, isLate } from './parts';

export default function WeekView({ items, colorOf }: { items: Deadline[]; colorOf: (c: string) => string }) {
  const [offset, setOffset] = useState(0);
  const now = new Date();

  const start = startOfWeek(now);
  start.setDate(start.getDate() + offset * 7);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const daysWithItems = days.filter((day) => items.some((d) => sameDay(new Date(d.dueAt), day)));

  return (
    <>
      <div className="weeknav">
        <button className="navbtn" onClick={() => setOffset(offset - 1)}>‹</button>
        <span className="label">{fmt(days[0]!)} – {fmt(days[6]!)}</span>
        <button className="navbtn" onClick={() => setOffset(offset + 1)}>›</button>
        {offset !== 0 && <button className="thisweek" onClick={() => setOffset(0)}>This week</button>}
      </div>

      {daysWithItems.length === 0 && <p className="empty">Nothing due this week.</p>}

      {daysWithItems.map((day) => {
        const list = items.filter((d) => sameDay(new Date(d.dueAt), day));
        const isToday = sameDay(day, now);
        return (
          <div key={day.getTime()} className={`dayblock ${isToday ? 'today' : ''}`}>
            <div className="daycol">
              <span className="dow">{day.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()}</span>
              <span className="dnum">{day.getDate()}</span>
              {isToday && <span className="todaytag">TODAY</span>}
            </div>
            <div className="dayrows">
              {list.map((d) => {
                const due = new Date(d.dueAt);
                const late = isLate(d, now);
                return (
                  <a key={d.id} href={d.url} target="_blank" className={`wrow ${d.submitted ? 'done' : ''}`}>
                    <Pill d={d} color={colorOf(d.course)} late={late} />
                    <span className="wtitle" title={d.title}>{d.title}</span>
                    <span className={`wtime ${late ? 'latetxt' : ''}`}>
                      {late ? lateLabel(due, now) : timeLabel(due)}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
