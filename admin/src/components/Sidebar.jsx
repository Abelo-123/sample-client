import { useState } from 'react';
import { logout } from '../api.js';

const NAV = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
];

export default function Sidebar({ activePage, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    logout();
    window.location.reload();
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">✓</div>
        <div className="sidebar-logo-text">
          Todo Admin
          <div className="sidebar-logo-sub">Control Panel</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(item => (
          <button
            key={item.id}
            className={`sidebar-link ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-link" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
          <span className="sidebar-link-icon">⎋</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
