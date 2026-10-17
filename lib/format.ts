// "DSC 020 - Prgrmng/DataStruc..." -> "DSC 20"
export function shortCourse(name: string): string {
  const m = name.match(/^([A-Z]{2,5})\s*0*(\d+[A-Z]{0,2})\b/);
  if (m) return `${m[1]} ${m[2]}`;
  return name.split(' - ')[0].slice(0, 20);
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// "Today", "Tomorrow", "Wednesday", or "Thu, Oct 30"
export function dayLabel(due: Date, now = new Date()): string {
  const diff = Math.round((startOfDay(due).getTime() - startOfDay(now).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
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