import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../hooks/useUser';
import { decryptMessage } from '../lib/encryption';
import type { Message, User } from '../types/database';
import '../styles/chat.css';

interface ChatInterfaceProps {
  recipientId: string;
  recipient?: User;
  messages: Message[];
  onSendMessage: (content: string, encrypted: boolean) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  recipient,
  messages,
  onSendMessage,
}) => {
  const { user, privateKey } = useUser();
  const [message, setMessage] = useState('');
  const [encrypted, setEncrypted] = useState(true); // Default to encrypted for DMs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message, encrypted);
      setMessage('');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Decrypt message content
  const getMessageContent = (msg: Message): string => {
    try {
      if (!msg.encrypted_content) return '[No content]';

      // Try to parse as JSON (encrypted message)
      const encryptedData = JSON.parse(msg.encrypted_content);

      // Check if it's an encrypted message format
      if (encryptedData.encrypted && encryptedData.nonce && encryptedData.ephemeralPublicKey) {
        if (!privateKey) return '[Decryption key not available]';
        return decryptMessage(encryptedData, privateKey);
      }

      // If not encrypted format, return as-is (shouldn't happen)
      return msg.encrypted_content;
    } catch {
      // If parsing fails, treat as plain text (backward compatibility)
      return msg.encrypted_content;
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="header-avatar placeholder">
          {recipient?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="header-info">
          <h3>{recipient?.username || 'Unknown User'}</h3>
          <p className="header-status">Online</p>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((msg) => {
          const isOwn = msg.sender_id === user?.id;
          const content = getMessageContent(msg);
          const isEncrypted = msg.encrypted_content && msg.encrypted_content.startsWith('{');

          return (
            <div key={msg.id} className={`message ${isOwn ? 'own' : 'other'}`}>
              <div className="message-content">
                {isEncrypted && <span className="encrypted-badge">🔒</span>}
                {msg.file_url && (
                  <a href={msg.file_url} download={msg.file_name} className="file-link">
                    📎 {msg.file_name} ({msg.file_size ? (msg.file_size / 1024).toFixed(1) + ' KB' : ''})
                  </a>
                )}
                <p>{content}</p>
                <span className="message-time">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-form" onSubmit={handleSubmit}>
        <div className="input-options">
          <label className="encrypt-checkbox">
            <input
              type="checkbox"
              checked={encrypted}
              onChange={(e) => setEncrypted(e.target.checked)}
            />
            <span>Encrypt</span>
          </label>
        </div>
        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="message-input"
          />
          <button type="submit" className="send-button" disabled={!message.trim()}>
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;

