import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { supabase } from '../lib/supabase';
import { encryptGroupMessage, decryptGroupMessage } from '../lib/encryption';
import { setGroupKey, getGroupKey, generateGroupKey } from '../lib/groupEncryption';
import type { Group, Message } from '../types/database';
import { Users, Plus, Send } from 'lucide-react';
import '../styles/chat.css';

const GroupsView: React.FC = () => {
  const { user } = useUser();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadGroups = async () => {
      try {
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGroups(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading groups:', error);
        setLoading(false);
      }
    };

    loadGroups();

    const channel = supabase
      .channel('groups')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'groups',
        },
        () => {
          loadGroups();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (!selectedGroup || !user) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*, sender:users!sender_id(*)')
          .eq('group_id', selectedGroup.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();

    const channel = supabase
      .channel(`group:${selectedGroup.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${selectedGroup.id}`,
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedGroup, user]);

  const handleCreateGroup = async () => {
    if (!user || !groupName.trim()) return;

    try {
      const { data: group, error: groupError } = await supabase
        .from('groups')
        // @ts-ignore
        .insert({
          name: groupName,
          creator_id: user.id,
          min_xp_required: 0,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      const { error: memberError } = await supabase
        .from('group_members')
        // @ts-ignore
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) throw memberError;

      setGroupName('');
      setSelectedGroup(group);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !selectedGroup || !message.trim()) return;

    try {
      let groupKey = getGroupKey(selectedGroup.id);
      if (!groupKey) {
        groupKey = generateGroupKey();
        setGroupKey(selectedGroup.id, groupKey);
      }

      const encrypted = encryptGroupMessage(message, groupKey);
      const encryptedContent = JSON.stringify(encrypted);

      const { error } = await supabase
        .from('messages')
        // @ts-ignore
        .insert({
          sender_id: user.id,
          group_id: selectedGroup.id,
          encrypted_content: encryptedContent,
          nonce: encrypted.nonce,
        });

      if (error) throw error;
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="chat-view loading">
        <p>Loading groups...</p>
      </div>
    );
  }

  return (
    <div className="chat-view">
      <div className="chat-list">
        <div className="chat-list-header">
          <h2>Groups</h2>
          <button className="refresh-btn" onClick={handleCreateGroup} title="Create Group">
            <Plus size={20} />
          </button>
        </div>
        <div style={{ padding: 'var(--spacing-sm)' }}>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="New group name..."
            className="chat-input"
            style={{ padding: '8px', fontSize: '0.9rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
          />
        </div>
        <div className="user-list">
          {groups.map((group) => (
            <div
              key={group.id}
              className={`user-item ${selectedGroup?.id === group.id ? 'active' : ''}`}
              onClick={() => setSelectedGroup(group)}
            >
              <div className="user-status" style={{ backgroundColor: 'var(--color-primary)' }} />
              <div className="user-info-item">
                <span className="username">{group.name}</span>
                <span className="user-address-tiny">{group.description || 'No description'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="chat-area">
        {selectedGroup ? (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
                <h3>{selectedGroup.name}</h3>
              </div>
            </div>
            <div className="messages-container">
              {messages.map((msg) => {
                const isOwn = msg.sender_id === user?.id;
                let content = '[Decryption failed]';

                try {
                  const groupKey = getGroupKey(selectedGroup.id);
                  if (groupKey && msg.encrypted_content) {
                    const encryptedData = JSON.parse(msg.encrypted_content);
                    if (encryptedData.encrypted && encryptedData.nonce) {
                      content = decryptGroupMessage(encryptedData.encrypted, encryptedData.nonce, groupKey);
                    } else {
                      content = msg.encrypted_content;
                    }
                  } else {
                    content = msg.encrypted_content || '[No content]';
                  }
                } catch (error) {
                  console.error('Error decrypting message:', error);
                  content = msg.encrypted_content || '[No content]';
                }

                return (
                  <div key={msg.id} className={`message ${isOwn ? 'sent' : 'received'}`}>
                    <div className="message-bubble">
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 4, color: isOwn ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' }}>
                        {msg.sender?.username || 'Unknown'}
                      </div>
                      <p>{content}</p>
                      <span className="message-time">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="chat-input-area">
              <div className="chat-input-form">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="chat-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button onClick={handleSendMessage} className="send-button" disabled={!message.trim()}>
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-chat">
            <Users size={64} />
            <p>Select or create a group to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsView;
