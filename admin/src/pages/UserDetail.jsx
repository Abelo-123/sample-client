import { useState, useEffect, useCallback } from 'react';
import { getUserTodos, addUserTodo, updateTodo, deleteTodo } from '../api.js';

// ─── Avatar helpers (same as Dashboard) ─────────────────────
const AVATAR_COLORS = [
  ['#00d4ff','#003344'],['#7c3aed','#2d1a5e'],['#2ed573','#0a3320'],
  ['#ffa502','#3d2800'],['#ff4757','#3d0a0e'],['#1e90ff','#001a3d'],
];
function avatarColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ─── Single Todo Item ────────────────────────────────────────
function TodoRow({ todo, onToggle, onEdit, onDelete }) {
  const [editing, setEditing]   = useState(false);
  const [value, setValue]       = useState(todo.title);
  const [busy, setBusy]         = useState(false);

  async function saveEdit() {
    const trimmed = value.trim();
    if (!trimmed || trimmed === todo.title) { setEditing(false); return; }
    setBusy(true);
    try { await onEdit(todo.id, trimmed); }
    finally { setBusy(false); setEditing(false); }
  }

  function onKey(e) {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') { setValue(todo.title); setEditing(false); }
  }

  return (
    <div className="todo-item">
      {/* Checkbox */}
      <button
        className={`todo-checkbox ${todo.is_done ? 'done' : ''}`}
        onClick={() => onToggle(todo.id, !todo.is_done)}
        title={todo.is_done ? 'Mark active' : 'Mark done'}
      />

      {/* Title / edit input */}
      {editing ? (
        <input
          className="todo-edit-input"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={onKey}
          autoFocus
          disabled={busy}
        />
      ) : (
        <span
          className={`todo-title ${todo.is_done ? 'done' : ''}`}
          onDoubleClick={() => setEditing(true)}
          title="Double-click to edit"
        >
          {todo.title}
        </span>
      )}

      {/* Actions */}
      <div className="action-group" style={{ marginLeft: 'auto', flexShrink: 0 }}>
        {editing ? (
          <>
            <button className="btn-icon success" onClick={saveEdit} disabled={busy}>✓</button>
            <button className="btn-icon" onClick={() => { setValue(todo.title); setEditing(false); }}>✕</button>
          </>
        ) : (
          <>
            <button className="btn-icon accent" onClick={() => setEditing(true)} title="Edit">✏</button>
            <button className="btn-icon danger" onClick={() => onDelete(todo.id)} title="Delete">🗑</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── User Detail Page ────────────────────────────────────────
export default function UserDetail({ user, onBack }) {
  const [todos, setTodos]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding]   = useState(false);
  const [filter, setFilter]   = useState('all'); // all | active | done

  const [fg, bg] = avatarColor(user.tg_id);

  const loadTodos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUserTodos(user.tg_id);
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.tg_id]);

  useEffect(() => { loadTodos(); }, [loadTodos]);

  async function handleAdd(e) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setAdding(true);
    try {
      const created = await addUserTodo(user.tg_id, title);
      setTodos(prev => [created, ...prev]);
      setNewTitle('');
    } catch (err) {
      alert('Failed to add todo: ' + err.message);
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(id, is_done) {
    try {
      const updated = await updateTodo(id, { is_done });
      setTodos(prev => prev.map(t => t.id === id ? updated : t));
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  }

  async function handleEdit(id, title) {
    const updated = await updateTodo(id, { title });
    setTodos(prev => prev.map(t => t.id === id ? updated : t));
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this todo?')) return;
    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  }

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.is_done;
    if (filter === 'done')   return  t.is_done;
    return true;
  });

  const doneCount   = todos.filter(t => t.is_done).length;
  const activeCount = todos.filter(t => !t.is_done).length;

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button className="breadcrumb-link" onClick={onBack}>← Dashboard</button>
        <span>/</span>
        <span>{user.display_name || user.tg_id}</span>
      </div>

      {/* User profile header */}
      <div className="user-profile-header">
        <div className="avatar" style={{ width: 52, height: 52, fontSize: 18, background: bg, color: fg }}>
          {initials(user.display_name || user.tg_id)}
        </div>
        <div className="user-profile-info">
          <h2>{user.display_name || user.tg_id}</h2>
          <p>
            Telegram ID: {user.tg_id}
            {user.username && <> · @{user.username}</>}
            {' · '}
            <span style={{ color: 'var(--success)' }}>{doneCount} done</span>
            {' · '}
            <span style={{ color: 'var(--accent)' }}>{activeCount} active</span>
          </p>
        </div>
      </div>

      {/* Todos panel */}
      <div className="glass-card">
        <div className="todos-panel">
          {/* Header + filter tabs */}
          <div className="todos-panel-header">
            <span className="todos-panel-title">Todo List</span>
            <div className="action-group">
              {['all', 'active', 'done'].map(f => (
                <button
                  key={f}
                  className="btn-icon"
                  style={{
                    padding: '5px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 20,
                    background: filter === f ? 'var(--accent-dim)' : 'transparent',
                    color: filter === f ? 'var(--accent)' : 'var(--text-muted)',
                    textTransform: 'capitalize',
                  }}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Add todo form */}
          <form className="add-todo-row" onSubmit={handleAdd}>
            <input
              id="admin-add-todo-input"
              className="add-todo-input"
              placeholder="Add a new todo for this user…"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              disabled={adding}
            />
            <button
              id="admin-add-todo-btn"
              type="submit"
              className="btn-primary"
              disabled={adding || !newTitle.trim()}
            >
              {adding ? '…' : '+ Add'}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>⚠ {error}</div>
          )}

          {/* Todo list */}
          {loading ? (
            <div className="empty-state"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-text">
                {filter === 'all'
                  ? 'No todos yet. Add the first one above!'
                  : `No ${filter} todos.`}
              </div>
            </div>
          ) : (
            filtered.map(todo => (
              <TodoRow
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
