import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  }

  function isActive(path: string) {
    return location.pathname === path;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>🎰 Admin</h2>
        </div>

        <nav className="sidebar-nav">
          <button
            className={isActive('/admin/dashboard') ? 'active' : ''}
            onClick={() => navigate('/admin/dashboard')}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </button>

          <button
            className={isActive('/admin/lotteries') ? 'active' : ''}
            onClick={() => navigate('/admin/lotteries')}
          >
            <span className="nav-icon">🎰</span>
            Lotteries
          </button>

          <button
            className={isActive('/admin/draws') ? 'active' : ''}
            onClick={() => navigate('/admin/draws')}
          >
            <span className="nav-icon">🎲</span>
            Draws
          </button>

          <button
            className={isActive('/admin/payouts') ? 'active' : ''}
            onClick={() => navigate('/admin/payouts')}
          >
            <span className="nav-icon">💰</span>
            Payouts
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          Logout
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <h1>Lottery Admin Dashboard</h1>
        </header>

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
