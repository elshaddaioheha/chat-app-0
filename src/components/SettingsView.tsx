import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { useActiveTime } from '../hooks/useActiveTime';
import { useNotifications } from '../hooks/useNotifications';
import { requestNotificationPermission } from '../lib/notification';
import { supabase } from '../lib/supabase';
import { User, Bell, Moon, LogOut, Clock, Calendar, Save } from 'lucide-react';
import '../styles/features.css';

const SettingsView: React.FC = () => {
  const { user } = useUser();
  const { activeTimeFormatted, totalActiveTime } = useActiveTime();
  const { markAllAsRead } = useNotifications();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [username, setUsername] = useState(user?.username || '');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
  }, [user]);

  useEffect(() => {
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
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="feature-view">
      <div className="feature-header">
        <h1 className="feature-title">Settings</h1>
        <p className="feature-subtitle">Manage your account and preferences</p>
      </div>

      <div className="settings-section">
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={20} /> Profile
        </div>
        <div className="form-group">
          <label className="form-label">Username</label>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="form-input"
            />
            <button
              onClick={handleUpdateUsername}
              style={{
                padding: '0 var(--spacing-lg)',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-primary-text)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Save size={16} /> Save
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Wallet Address</label>
          <input
            type="text"
            value={user?.wallet_address || ''}
            disabled
            className="form-input"
            style={{ opacity: 0.7, cursor: 'not-allowed' }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">XP</label>
          <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
            {user?.xp || 0} XP
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} /> Activity
        </div>
        <div className="form-group">
          <label className="form-label">Total Active Time</label>
          <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 500 }}>
            {activeTimeFormatted || formatTime(totalActiveTime || 0)}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Account Created</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)' }}>
            <Calendar size={16} />
            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={20} /> Notifications
        </div>
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={handleEnableNotifications}
              style={{ width: '16px', height: '16px' }}
            />
            <span>Enable Browser Notifications</span>
          </label>
          <p style={{ marginTop: '4px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Get notified when you receive new messages
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            backgroundColor: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)'
          }}
        >
          Mark All Notifications as Read
        </button>
      </div>

      <div className="settings-section">
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogOut size={20} /> Account
        </div>
        <button
          onClick={() => window.location.href = '/sign-out'}
          style={{
            padding: 'var(--spacing-md) var(--spacing-lg)',
            backgroundColor: 'var(--color-error)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600
          }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
