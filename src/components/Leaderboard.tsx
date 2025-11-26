import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { supabase } from '../lib/supabase';
import type { LeaderboardEntry } from '../types/database';
import './Leaderboard.css';

const Leaderboard: React.FC = () => {
  const { user } = useUser();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        // Get users with XP and active time
        const { data: users, error } = await supabase
          .from('users')
          .select('id, username, xp, total_active_time')
          .order('xp', { ascending: false })
          .limit(100);

        if (error) throw error;

        // Create leaderboard entries
        const leaderboardData: LeaderboardEntry[] = (users || []).map((u: any, index: number) => {
          return {
            user_id: u.id,
            username: u.username,
            xp: u.xp || 0,
            total_active_time: u.total_active_time || 0,
            rank: index + 1,
          };
        });

        setLeaderboard(leaderboardData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
        setLoading(false);
      }
    };

    loadLeaderboard();

    // Refresh leaderboard every 30 seconds
    const interval = setInterval(loadLeaderboard, 30000);

    return () => clearInterval(interval);
  }, [timeframe]);

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

  if (loading) {
    return (
      <div className="leaderboard loading">
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  const userRank = leaderboard.findIndex(entry => entry.user_id === user?.id) + 1;

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <div className="timeframe-selector">
          <button
            className={timeframe === 'all' ? 'active' : ''}
            onClick={() => setTimeframe('all')}
          >
            All Time
          </button>
          <button
            className={timeframe === 'week' ? 'active' : ''}
            onClick={() => setTimeframe('week')}
          >
            This Week
          </button>
          <button
            className={timeframe === 'month' ? 'active' : ''}
            onClick={() => setTimeframe('month')}
          >
            This Month
          </button>
        </div>
      </div>

      {userRank > 0 && (
        <div className="user-rank-card">
          <h2>Your Rank: #{userRank}</h2>
          <div className="user-stats">
            <div className="stat">
              <span className="stat-label">XP</span>
              <span className="stat-value">
                {leaderboard[userRank - 1]?.xp || 0}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Active Time</span>
              <span className="stat-value">
                {formatTime(leaderboard[userRank - 1]?.total_active_time || 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="leaderboard-list">
        <div className="leaderboard-header-row">
          <div className="rank-col">Rank</div>
          <div className="user-col">User</div>
          <div className="xp-col">XP</div>
          <div className="time-col">Active Time</div>
        </div>
        {leaderboard.slice(0, 50).map((entry) => {
          const isCurrentUser = entry.user_id === user?.id;
          return (
            <div
              key={entry.user_id}
              className={`leaderboard-entry ${isCurrentUser ? 'current-user' : ''} ${entry.rank <= 3 ? `rank-${entry.rank}` : ''}`}
            >
              <div className="rank-col">
                {entry.rank <= 3 && (
                  <span className="medal">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                  </span>
                )}
                {entry.rank > 3 && <span className="rank-number">#{entry.rank}</span>}
              </div>
              <div className="user-col">
                <span className="username">{entry.username}</span>
                {isCurrentUser && <span className="you-badge">You</span>}
              </div>
              <div className="xp-col">{entry.xp}</div>
              <div className="time-col">{formatTime(entry.total_active_time)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;

