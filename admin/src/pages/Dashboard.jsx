import { useState, useEffect, useCallback } from 'react';
import StatCard from '../components/StatCard.jsx';
import { getStats, getUsers, updateUser, deleteUser } from '../api.js';

// ─── Avatar helpers ──────────────────────────────────────────
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

// ─── Inline Name Editor ──────────────────────────────────────
function NameEditor({ user, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue]     = useState(user.display_name || '');
  const [saving, setSaving]   = useState(false);

  async function save() {
    const trimmed = value.trim();
    if (!trimmed || trimmed === user.display_name) { setEditing(false); return; }
    setSaving(true);
    try {
      await onSave(user.tg_id, trimmed);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  function onKey(e) {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') { setValue(user.display_name); setEditing(false); }
  }

  if (editing) {
    return (
      <div className="inline-edit-wrap">
        <input
          className="inline-edit-input"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={onKey}
          autoFocus
          disabled={saving}
        />
        <button className="btn-icon success" onClick={save} title="Save" disabled={saving}>✓</button>
        <button className="btn-icon" onClick={() => { setValue(user.display_name); setEditing(false); }} title="Cancel">✕</button>
      </div>
    );
  }

  return (
    <div className="inline-edit-wrap">
      <span style={{ fontWeight: 600 }}>{user.display_name || user.tg_id}</span>
      <button className="btn-icon accent" onClick={() => setEditing(true)} title="Edit name">✏</button>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────
export default function Dashboard({ onViewUser }) {
  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [deleting, setDeleting] = useState(null);

  const loadData = useCallback(async (q = '') => {
    setLoading(true);
    setError('');
    try {
      const [s, u] = await Promise.all([getStats(), getUsers(q)]);
      setStats(s);
      setUsers(u);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => loadData(search), 350);
    return () => clearTimeout(t);
  }, [search, loadData]);

  async function handleSaveName(tg_id, display_name) {
    await updateUser(tg_id, display_name);
    setUsers(prev => prev.map(u => u.tg_id === tg_id ? { ...u, display_name } : u));
    // refresh stats in case it's first user seen
    getStats().then(setStats).catch(() => {});
  }

  async function handleDelete(tg_id) {
    if (!window.confirm(`Delete user ${tg_id} and all their todos? This cannot be undone.`)) return;
    setDeleting(tg_id);
    try {
      await deleteUser(tg_id);
      setUsers(prev => prev.filter(u => u.tg_id !== tg_id));
      getStats().then(setStats).catch(() => {});
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    } finally {
      setDeleting(null);
    }
  }

  function timeAgo(dateStr) {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)   return 'just now';
    if (m < 60)  return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24)  return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30)  return `${d}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Manage all users and their todo lists</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          label="Total Users"     value={stats?.total_users ?? '…'}
          icon="👥"               color="var(--accent)"
          accentFrom="#00d4ff"    accentTo="#0066aa"
        />
        <StatCard
          label="Total Todos"     value={stats?.total_todos ?? '…'}
          icon="📋"               color="#a78bfa"
          accentFrom="#7c3aed"    accentTo="#4c1d95"
        />
        <StatCard
          label="Completion"      value={stats ? `${stats.completion_pct}%` : '…'}
          icon="✅"               color="var(--success)"
          accentFrom="#2ed573"    accentTo="#0a8040"
        />
        <StatCard
          label="Active Today"    value={stats?.active_today ?? '…'}
          icon="⚡"               color="var(--warning)"
          accentFrom="#ffa502"    accentTo="#cc6600"
        />
      </div>

      {/* Users table */}
      <div className="glass-card">
        {/* Search */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="search-bar" style={{ marginBottom: 0 }}>
            <input
              id="users-search"
              className="search-input"
              placeholder="🔍  Search by name, username or Telegram ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div style={{ padding: '16px 20px', color: 'var(--danger)', fontSize: 13 }}>
            ⚠ {error}
          </div>
        )}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Telegram ID</th>
                <th>Todos</th>
                <th>Completion</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="loading-row">
                  <td colSpan={6}><span className="spinner" /></td>
                </tr>
              )}

              {!loading && users.length === 0 && (
                <tr className="loading-row">
                  <td colSpan={6} style={{ color: 'var(--text-muted)' }}>
                    {search ? 'No users match your search.' : 'No users yet — open the Mini App to register.'}
                  </td>
                </tr>
              )}

              {users.map(user => {
                const [fg, bg] = avatarColor(user.tg_id);
                return (
                  <tr key={user.tg_id}>
                    {/* User cell */}
                    <td>
                      <div className="user-cell">
                        <div className="avatar" style={{ background: bg, color: fg }}>
                          {initials(user.display_name || user.tg_id)}
                        </div>
                        <div className="user-cell-info">
                          <NameEditor user={user} onSave={handleSaveName} />
                          {user.username && (
                            <span className="user-cell-sub">@{user.username}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Telegram ID */}
                    <td>
                      <span className="badge badge-muted">{user.tg_id}</span>
                    </td>

                    {/* Todo count */}
                    <td>
                      <span className="badge badge-violet">{user.todo_count}</span>
                    </td>

                    {/* Completion */}
                    <td>
                      <div className="progress-wrap">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${user.completion_pct}%` }} />
                        </div>
                        <span className="progress-pct">{user.completion_pct}%</span>
                      </div>
                    </td>

                    {/* Last active */}
                    <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>
                      {timeAgo(user.last_todo_activity || user.updated_at)}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="action-group">
                        <button
                          className="btn-icon accent"
                          title="View todos"
                          onClick={() => onViewUser(user)}
                        >
                          👁
                        </button>
                        <button
                          className="btn-icon danger"
                          title="Delete user"
                          disabled={deleting === user.tg_id}
                          onClick={() => handleDelete(user.tg_id)}
                        >
                          {deleting === user.tg_id ? '…' : '🗑'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
