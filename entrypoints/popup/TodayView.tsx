import type { Deadline } from '@/lib/types';
import { sameDay, dayLabel, timeLabel, relative, lateLabel } from '@/lib/format';
import { Pill, isLate, SOURCE_NAMES } from './parts';

function Card({ d, color, now }: { d: Deadline; color: string; now: Date }) {
  const due = new Date(d.dueAt);
  const late = isLate(d, now);
  const rel = relative(due, now);
  return (
    <a className={`card ${late ? 'late' : ''} ${d.submitted ? 'done' : ''}`} href={d.url} target="_blank">
      <div className="cardtop">
        <Pill d={d} color={color} late={late} />
        <span className="src">· {SOURCE_NAMES[d.source]}</span>
      </div>
      <div className="cardtitle">{d.title}</div>
      <div className="cardmeta">
        {sameDay(due, now) ? timeLabel(due) : `${dayLabel(due, now)} ${timeLabel(due)}`}
        {late && <span className="latetxt"> {lateLabel(due, now)}</span>}
        {!late && !d.submitted && rel && <span className="soon"> {rel}</span>}
        {d.submitted && <span> · submitted</span>}
      </div>
    </a>
  );
}

function Section({ title, tone, items, colorOf, now }: {
  title: string; tone?: 'late'; items: Deadline[]; colorOf: (c: string) => string; now: Date;
}) {
  if (items.length === 0) return null;
  return (
    <>
      <div className={`sechead ${tone ?? ''}`}>
        <span>{title}</span>
        <span className="pillcount">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
      </div>
      {items.map((d) => <Card key={d.id} d={d} color={colorOf(d.course)} now={now} />)}
    </>
  );
}

export default function TodayView({ items, colorOf }: { items: Deadline[]; colorOf: (c: string) => string }) {
  const now = new Date();
  const late = items.filter((d) => isLate(d, now));
  const today = items.filter((d) => sameDay(new Date(d.dueAt), now) && !isLate(d, now));
  const total = late.length + today.length;

  return (
    <>
      <div className="dayhero">
        <h1>{now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h1>
        <span className="count">{total} {total === 1 ? 'item' : 'items'}</span>
      </div>
      <Section title="Late" tone="late" items={late} colorOf={colorOf} now={now} />
      <Section title="Due today" items={today} colorOf={colorOf} now={now} />
      {total === 0 && <p className="empty">Nothing due today 🎉</p>}
    </>
  );
}
