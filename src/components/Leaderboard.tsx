import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { supabase } from '../lib/supabase';
import type { LeaderboardEntry } from '../types/database';
import { Trophy, Clock, Zap } from 'lucide-react';
import '../styles/features.css';

const Leaderboard: React.FC = () => {
  const { user } = useUser();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('id, username, xp, total_active_time')
          .order('xp', { ascending: false })
          .limit(100);

        if (error) throw error;

        const leaderboardData: LeaderboardEntry[] = (users || []).map((u: any, index: number) => ({
          user_id: u.id,
          username: u.username,
          xp: u.xp || 0,
          total_active_time: u.total_active_time || 0,
          rank: index + 1,
        }));

        setLeaderboard(leaderboardData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
        setLoading(false);
      }
    };

    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="feature-view">
        <div className="feature-header">
          <h1 className="feature-title">Leaderboard</h1>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="feature-view">
      <div className="feature-header">
        <h1 className="feature-title">Leaderboard</h1>
        <p className="feature-subtitle">Top users by XP and activity</p>
      </div>

      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>User</th>
            <th>XP</th>
            <th>Active Time</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry) => {
            const isCurrentUser = entry.user_id === user?.id;
            return (
              <tr key={entry.user_id} className={`leaderboard-row ${isCurrentUser ? 'current-user' : ''}`}>
                <td>
                  <div className={`rank-badge rank-${entry.rank <= 3 ? entry.rank : 'other'}`}>
                    {entry.rank}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 500 }}>{entry.username}</span>
                    {isCurrentUser && (
                      <span style={{ fontSize: '0.75rem', padding: '2px 6px', backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-text)', borderRadius: '4px' }}>You</span>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={14} />
                    {entry.xp}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} />
                    {formatTime(entry.total_active_time)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
