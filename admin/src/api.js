const API_HOST = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE = `${API_HOST}/api/admin`;

function getToken() {
  return localStorage.getItem('admin_token') || '';
}

function headers() {
  return {
    'Content-Type': 'application/json',
    'X-Admin-Token': getToken(),
  };
}

async function request(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: headers(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    localStorage.removeItem('admin_token');
    window.location.reload();
    return;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─── Auth ────────────────────────────────────────────────────
export async function login(password) {
  const res = await fetch(BASE + '/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Invalid password');
  return data; // { token }
}

export function logout() {
  fetch(BASE + '/logout', { method: 'POST', headers: headers() }).catch(() => {});
  localStorage.removeItem('admin_token');
}

// ─── Stats ───────────────────────────────────────────────────
export function getStats() {
  return request('GET', '/stats');
}

// ─── Users ───────────────────────────────────────────────────
export function getUsers(search = '') {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  return request('GET', '/users' + q);
}

export function updateUser(tg_id, display_name) {
  return request('PATCH', `/users/${encodeURIComponent(tg_id)}`, { display_name });
}

export function deleteUser(tg_id) {
  return request('DELETE', `/users/${encodeURIComponent(tg_id)}`);
}

// ─── User Todos ──────────────────────────────────────────────
export function getUserTodos(tg_id) {
  return request('GET', `/users/${encodeURIComponent(tg_id)}/todos`);
}

export function addUserTodo(tg_id, title) {
  return request('POST', `/users/${encodeURIComponent(tg_id)}/todos`, { title });
}

// ─── Todo CRUD ───────────────────────────────────────────────
export function updateTodo(id, data) {
  return request('PATCH', `/todos/${id}`, data);
}

export function deleteTodo(id) {
  return request('DELETE', `/todos/${id}`);
}
