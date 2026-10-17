// "DSC 020 - Prgrmng/DataStruc..." -> "DSC 20"
export function shortCourse(name: string): string {
  const m = name.match(/^([A-Z]{2,5})\s*0*(\d+[A-Z]{0,2})\b/);
  if (m) return `${m[1]} ${m[2]}`;
  return (name.split(' - ')[0] ?? name).slice(0, 20);
}

export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const dow = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - dow);
  return x;
}

export function sameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

// "Today", "Tomorrow", "Wednesday", or "Thu, Oct 30"
export function dayLabel(due: Date, now = new Date()): string {
  const diff = Math.round((startOfDay(due).getTime() - startOfDay(now).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff < 7) return due.toLocaleDateString(undefined, { weekday: 'long' });
  return due.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function timeLabel(due: Date): string {
  return due.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

// "in 45m" or "in 5h" if due within 24 hours, otherwise null
export function relative(due: Date, now = new Date()): string | null {
  const mins = Math.round((due.getTime() - now.getTime()) / 60000);
  if (mins < 0 || mins >= 24 * 60) return null;
  if (mins < 60) return `in ${mins}m`;
  return `in ${Math.round(mins / 60)}h`;
}

// "40m late", "12h late", "3d late"
export function lateLabel(due: Date, now = new Date()): string {
  const mins = Math.max(1, Math.round((now.getTime() - due.getTime()) / 60000));
  if (mins < 60) return `${mins}m late`;
  const h = Math.round(mins / 60);
  if (h < 48) return `${h}h late`;
  return `${Math.round(h / 24)}d late`;
}

// "just now", "5m ago", "2h ago", "1d ago"
export function ago(ts: number, now = Date.now()): string {
  const mins = Math.round((now - ts) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
