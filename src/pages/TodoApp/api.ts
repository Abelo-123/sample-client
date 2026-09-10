import type { Todo } from './types';

const API_HOST = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE = `${API_HOST}/api/todos`;

export async function fetchTodos(tgId: string): Promise<Todo[]> {
  const res = await fetch(`${BASE}?tg_id=${encodeURIComponent(tgId)}`);
  if (!res.ok) throw new Error('Failed to fetch todos');
  return res.json();
}

export async function createTodo(tgId: string, title: string): Promise<Todo> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tg_id: tgId, title }),
  });
  if (!res.ok) throw new Error('Failed to create todo');
  return res.json();
}

export async function updateTodo(
  id: number,
  data: Partial<Pick<Todo, 'title' | 'is_done'>>
): Promise<Todo> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update todo');
  return res.json();
}

export async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete todo');
}

export async function registerUser(user: {
  tg_id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}): Promise<void> {
  await fetch(`${API_HOST}/api/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
}
