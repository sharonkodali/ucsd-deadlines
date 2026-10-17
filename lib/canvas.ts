import type { Deadline } from './types';

const BASE = 'https://canvas.ucsd.edu';

export async function fetchCanvas(): Promise<Deadline[]> {
  const start = new Date();
  start.setDate(start.getDate() - 1);

  const res = await fetch(
    `${BASE}/api/v1/planner/items?start_date=${start.toISOString()}&per_page=100`,
    { credentials: 'include', headers: { Accept: 'application/json' } }
  );

  const type = res.headers.get('content-type') ?? '';
  if (res.status === 401 || res.redirected || !type.includes('json')) {
    throw new Error('NOT_LOGGED_IN');
  }
  if (!res.ok) throw new Error(`Canvas error ${res.status}`);

  const text = await res.text();
  const items = JSON.parse(text.replace(/^while\(1\);/, ''));

  return items
    .filter((i: any) => i.plannable?.due_at)
    .map((i: any): Deadline => ({
      id: `canvas:${i.plannable_type}:${i.plannable_id}`,
      source: 'canvas',
      course: i.context_name ?? 'Canvas',
      title: i.plannable.title ?? 'Untitled',
      dueAt: i.plannable.due_at,
      url: BASE + i.html_url,
      kind: i.plannable_type === 'quiz' ? 'quiz' : 'assignment',
      submitted: Boolean(i.submissions?.submitted),
    }));
}