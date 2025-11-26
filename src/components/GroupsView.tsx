import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { supabase } from '../lib/supabase';
import { encryptGroupMessage, decryptGroupMessage } from '../lib/encryption';
import { setGroupKey, getGroupKey, generateGroupKey } from '../lib/groupEncryption';
import type { Group, Message } from '../types/database';
import './GroupsView.css';

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

    // Set up real-time subscription
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

    // Set up real-time subscription
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
        .insert({
          name: groupName,
          creator_id: user.id,
          min_xp_required: 0,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('group_members')
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
      // Get or create group key
      let groupKey = getGroupKey(selectedGroup.id);
      if (!groupKey) {
        groupKey = generateGroupKey();
        setGroupKey(selectedGroup.id, groupKey);
      }

      // Encrypt message for group
      const encrypted = encryptGroupMessage(message, groupKey);
      const encryptedContent = JSON.stringify(encrypted);

      const { error } = await supabase
        .from('messages')
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
      <div className="groups-view loading">
        <p>Loading groups...</p>
      </div>
    );
  }

  return (
    <div className="groups-view">
      <div className="groups-sidebar">
        <div className="groups-header">
          <h2>Groups</h2>
          <button className="create-group-btn" onClick={handleCreateGroup}>
            + Create
          </button>
        </div>
        <div className="create-group-form">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name..."
            className="group-name-input"
          />
        </div>
        <div className="groups-list">
          {groups.map((group) => (
            <button
              key={group.id}
              className={`group-item ${selectedGroup?.id === group.id ? 'active' : ''}`}
              onClick={() => setSelectedGroup(group)}
            >
              <div className="group-icon">👥</div>
              <div className="group-info">
                <h3>{group.name}</h3>
                {group.description && <p>{group.description}</p>}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="group-chat">
        {selectedGroup ? (
          <>
            <div className="group-chat-header">
              <h2>{selectedGroup.name}</h2>
              <span className="encrypted-badge">🔒</span>
              {selectedGroup.min_xp_required > 0 && (
                <span className="xp-required">⚡ {selectedGroup.min_xp_required}+ XP</span>
              )}
            </div>
            <div className="group-messages">
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
                  <div key={msg.id} className={`message ${isOwn ? 'own' : 'other'}`}>
                    <div className="message-content">
                      <div className="message-sender">{msg.sender?.username || 'Unknown'}</div>
                      <span className="encrypted-badge">🔒</span>
                      <p>{content}</p>
                      <span className="message-time">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="group-input">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="message-input"
              />
              <button
                onClick={() => handleSendMessage()}
                className="send-button"
                disabled={!message.trim()}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="no-group-selected">
            <p>Select or create a group to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsView;

