import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { supabase } from '../lib/supabase';
import type { Message, User } from '../types/database';
import ChatInterface from './ChatInterface';
import './ChatView.css';
import { encryptMessage } from '../lib/encryption';

const ChatView: React.FC = () => {
  const { user, privateKey } = useUser();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .neq('id', user.id)
          .order('username');

        if (error) throw error;
        setUsers(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading users:', error);
        setLoading(false);
      }
    };

    loadUsers();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedUserId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*, sender:users!sender_id(*)')
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},recipient_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel(`messages:${user.id}:${selectedUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user.id},recipient_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},recipient_id.eq.${user.id}))`,
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedUserId]);

  const handleSendMessage = async (content: string, encrypted: boolean = true) => {
    if (!user || !selectedUserId || !content.trim()) return;

    try {
      // Get recipient's public key
      const { data: recipient } = await supabase
        .from('users')
        .select('public_key')
        .eq('id', selectedUserId)
        .single();

      if (!recipient?.public_key) {
        throw new Error('Recipient not found or missing public key');
      }

      let encryptedContent = '';
      let nonce = '';

      if (encrypted && privateKey) {
        // Encrypt message with recipient's public key
        const encrypted = encryptMessage(content, recipient.public_key, privateKey);
        encryptedContent = JSON.stringify(encrypted);
        nonce = encrypted.nonce;
      } else {
        // Plain text (not recommended for production)
        encryptedContent = content;
        nonce = '';
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: selectedUserId,
          encrypted_content: encryptedContent,
          nonce: nonce,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="chat-view loading">
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="chat-view">
      <div className="chat-users-list">
        <h2>Users</h2>
        <div className="users-container">
          {users.map((u) => (
            <button
              key={u.id}
              className={`user-item ${selectedUserId === u.id ? 'active' : ''}`}
              onClick={() => setSelectedUserId(u.id)}
            >
              <div className="user-avatar-small placeholder">
                {u.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span>{u.username}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="chat-interface-container">
        {selectedUserId ? (
          <ChatInterface
            recipientId={selectedUserId}
            recipient={users.find(u => u.id === selectedUserId)}
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="no-chat-selected">
            <p>Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatView;

