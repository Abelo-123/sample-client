import { useState } from 'react';
import { login } from '../api.js';

export default function Login({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password.trim()) return;
    setError('');
    setLoading(true);
    try {
      const { token } = await login(password.trim());
      localStorage.setItem('admin_token', token);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Invalid password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="glass-card login-card">
        <div className="login-logo">✓</div>
        <h1 className="login-title">Admin Panel</h1>
        <p className="login-sub">Enter your password to manage users &amp; todos</p>

        {error && <div className="login-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            id="admin-password"
            type="password"
            className="login-input"
            placeholder="Admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
          />
          <button
            id="admin-login-btn"
            type="submit"
            className="login-btn"
            disabled={loading || !password.trim()}
          >
            {loading ? 'Verifying…' : 'Enter Admin Panel →'}
          </button>
        </form>
      </div>
    </div>
  );
}
