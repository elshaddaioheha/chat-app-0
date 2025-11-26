// XP System: Active time tracking hook
// Earns 50 XP per 3 hours of active time
import { useEffect, useState, useCallback } from 'react';
import { useUser } from './useUser';
import { supabase } from '../lib/supabase';

const THREE_HOURS_MS = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
const XP_PER_THREE_HOURS = 50;
const UPDATE_INTERVAL = 60 * 1000; // Update every 60 seconds
const INACTIVITY_THRESHOLD = 30 * 1000; // 30 seconds of inactivity

interface ActivityState {
  isActive: boolean;
  sessionStartTime: number;
  lastActivityTime: number;
  sessionActiveTime: number; // milliseconds
  totalActiveTime: number; // milliseconds
  currentXP: number;
}

export const useActiveTime = () => {
  const { user } = useUser();
  const [activity, setActivity] = useState<ActivityState>({
    isActive: false,
    sessionStartTime: 0,
    lastActivityTime: 0,
    sessionActiveTime: 0,
    totalActiveTime: 0,
    currentXP: 0,
  });

  // Track user activity
  const trackActivity = useCallback(() => {
    const now = Date.now();
    setActivity(prev => {
      if (!prev.isActive) {
        return {
          ...prev,
          isActive: true,
          sessionStartTime: now,
          lastActivityTime: now,
        };
      }
      return {
        ...prev,
        lastActivityTime: now,
      };
    });
  }, []);

  // Start tracking on mount
  useEffect(() => {
    if (!user) return;

    // Initialize activity state
    setActivity(prev => ({
      ...prev,
      totalActiveTime: user.total_active_time || 0,
      currentXP: user.xp || 0,
    }));

    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, trackActivity, { passive: true });
    });

    // Start active session
    trackActivity();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, trackActivity);
      });
    };
  }, [user, trackActivity]);

  // Check for inactivity and update XP
  useEffect(() => {
    if (!user || !activity.isActive) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - activity.lastActivityTime;

      // Check for inactivity
      if (timeSinceLastActivity > INACTIVITY_THRESHOLD) {
        setActivity(prev => ({
          ...prev,
          isActive: false,
        }));
        return;
      }

      // Calculate session active time
      const sessionTime = now - activity.sessionStartTime;
      
      setActivity(prev => {
        const newTotalTime = (prev.totalActiveTime || 0) + (sessionTime - prev.sessionActiveTime);
        const newXP = Math.floor((newTotalTime / THREE_HOURS_MS) * XP_PER_THREE_HOURS);
        
        // Update database every minute
        const updateXP = async () => {
          try {
            const { error } = await supabase
              .from('users')
              .update({
                xp: newXP,
                total_active_time: newTotalTime,
                last_active: new Date().toISOString(),
              })
              .eq('id', user.id);

            if (error) console.error('XP update error:', error);
          } catch (error) {
            console.error('XP update error:', error);
          }
        };

        updateXP();

        return {
          ...prev,
          sessionActiveTime: sessionTime,
          totalActiveTime: newTotalTime,
          currentXP: newXP,
        };
      });
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [user, activity.isActive, activity.lastActivityTime, activity.sessionStartTime, activity.sessionActiveTime, activity.totalActiveTime]);

  // Calculate session stats
  const sessionStats = {
    activeTime: activity.sessionActiveTime,
    activeTimeFormatted: formatTime(activity.sessionActiveTime),
    totalXP: activity.currentXP,
    sessionXP: Math.floor((activity.sessionActiveTime / THREE_HOURS_MS) * XP_PER_THREE_HOURS),
  };

  return {
    ...sessionStats,
    isActive: activity.isActive,
    totalActiveTime: activity.totalActiveTime,
  };
};

// Format time in milliseconds to human readable
const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};
