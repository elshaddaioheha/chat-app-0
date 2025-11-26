import { supabase } from './supabase';
import type { Notification } from '../types/database';

export const sendNotification = async (
  userId: string,
  type: 'message' | 'group_invite' | 'premium',
  title: string,
  message: string
): Promise<Notification | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        read: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Request browser notification permission and show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/vite.svg',
      });
    }

    return data;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

