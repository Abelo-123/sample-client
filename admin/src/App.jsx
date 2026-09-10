import { useState } from 'react';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import UserDetail from './pages/UserDetail.jsx';
import Sidebar from './components/Sidebar.jsx';

export default function App() {
  const [authed, setAuthed]       = useState(!!localStorage.getItem('admin_token'));
  const [page, setPage]           = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState(null);

  if (!authed) {
    return <Login onSuccess={() => setAuthed(true)} />;
  }

  function viewUser(user) {
    setSelectedUser(user);
    setPage('user-detail');
  }

  function backToDashboard() {
    setSelectedUser(null);
    setPage('dashboard');
  }

  return (
    <div className="admin-layout">
      <Sidebar activePage={page === 'user-detail' ? 'dashboard' : page} onNavigate={p => { setPage(p); setSelectedUser(null); }} />

      <main className="admin-main">
        {page === 'dashboard' && (
          <Dashboard onViewUser={viewUser} />
        )}
        {page === 'user-detail' && selectedUser && (
          <UserDetail user={selectedUser} onBack={backToDashboard} />
        )}
      </main>
    </div>
  );
}
