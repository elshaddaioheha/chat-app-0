import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { useActiveTime } from '../hooks/useActiveTime';
import { useNotifications } from '../hooks/useNotificatons';
import { requestNotificationPermission } from '../lib/notification';
import { supabase } from '../lib/supabase';
import './SettingsView.css';

const SettingsView: React.FC = () => {
  const { user } = useUser();
  const { activeTimeFormatted, totalActiveTime } = useActiveTime();
  const { markAllAsRead } = useNotifications();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [username, setUsername] = useState(user?.username || '');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
  }, [user]);

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      alert('Notifications enabled!');
    }
  };

  const handleUpdateUsername = async () => {
    if (!user || !username.trim()) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ username: username.trim() })
        .eq('id', user.id);

      if (error) throw error;
      alert('Username updated!');
    } catch (error) {
      console.error('Error updating username:', error);
      alert('Error updating username. Please try again.');
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="settings-view">
      <div className="settings-header">
        <h1>⚙️ Settings</h1>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2>Profile</h2>
          <div className="setting-item">
            <label>Username</label>
            <div className="input-group">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="setting-input"
              />
              <button onClick={handleUpdateUsername} className="save-button">
                Save
              </button>
            </div>
          </div>
          <div className="setting-item">
            <label>Wallet Address</label>
            <input
              type="text"
              value={user?.wallet_address || ''}
              disabled
              className="setting-input"
            />
            <p className="setting-description">Wallet address is managed by Privy</p>
          </div>
          <div className="setting-item">
            <label>XP</label>
            <div className="stat-display">
              {user?.xp || 0} XP
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Activity</h2>
          <div className="setting-item">
            <label>Total Active Time</label>
            <div className="stat-display">
              {activeTimeFormatted || formatTime(totalActiveTime || 0)}
            </div>
          </div>
          <div className="setting-item">
            <label>Account Created</label>
            <div className="stat-display">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Notifications</h2>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={handleEnableNotifications}
                className="setting-checkbox"
              />
              <span>Enable Browser Notifications</span>
            </label>
            <p className="setting-description">
              Get notified when you receive new messages
            </p>
          </div>
          <div className="setting-item">
            <button onClick={markAllAsRead} className="action-button">
              Mark All Notifications as Read
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2>Appearance</h2>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                className="setting-checkbox"
              />
              <span>Dark Mode</span>
            </label>
            <p className="setting-description">
              Dark mode is always enabled in this version
            </p>
          </div>
        </div>

        <div className="settings-section">
          <h2>Account</h2>
          <div className="setting-item">
            <button
              onClick={() => window.location.href = '/sign-out'}
              className="danger-button"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

