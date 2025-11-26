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
    <div className="chat-interface" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="chat-header">
        <div className="chat-header-info">
          <h3>{recipient?.username || 'Unknown User'}</h3>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((msg) => {
          const isOwn = msg.sender_id === user?.id;
          const content = getMessageContent(msg);
          const isEncrypted = msg.encrypted_content && msg.encrypted_content.startsWith('{');

          return (
            <div key={msg.id} className={`message ${isOwn ? 'sent' : 'received'}`}>
              <div className="message-bubble">
                {isEncrypted && <span style={{ marginRight: 4 }}>🔒</span>}
                {msg.file_url && (
                  <a href={msg.file_url} download={msg.file_name} className="file-link">
                    📎 {msg.file_name}
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

      <div className="chat-input-area">
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="chat-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button type="submit" className="send-button" disabled={!message.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;

