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
        <h1>ChatXP</h1>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => handleNavigate(item.path)}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.path === '/chat' && unreadCount > 0 && (
              <span className="nav-badge">{unreadCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <div className="user-address">{user?.username || 'User'}</div>
            <div className="user-xp">{user?.xp || 0} XP</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

