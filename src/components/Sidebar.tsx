import React from 'react';
import { useUser } from '../hooks/useUser';
import { useNotifications } from '../hooks/useNotifications';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Users, Trophy, Star, Settings, LogOut } from 'lucide-react';
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
    { path: '/chat', label: 'Chat', icon: <MessageSquare size={20} /> },
    { path: '/groups', label: 'Groups', icon: <Users size={20} /> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={20} /> },
    { path: '/premium', label: 'Premium', icon: <Star size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
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
        <button className="nav-item logout-btn" onClick={() => window.location.href = '/sign-out'}>
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

