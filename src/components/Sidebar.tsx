import React from 'react';
import { useUser } from '../hooks/useUser';
import { useNotifications } from '../hooks/useNotifications';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/layout.css';

interface SidebarProps {
  onNavigate: (path: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { user } = useUser();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/chat', label: 'Chat', icon: '💬' },
    { path: '/groups', label: 'Groups', icon: '👥' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { path: '/premium', label: 'Premium', icon: '⭐' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="user-info">
          <div className="user-avatar-placeholder">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <h3>{user?.username || 'User'}</h3>
            <div className="user-stats">
              <p className="user-xp">⚡ {user?.xp || 0} XP</p>
              <p className="user-status">Online</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => handleNavigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.path === '/chat' && unreadCount > 0 && (
              <span className="nav-badge">{unreadCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={() => window.location.href = '/sign-out'}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

