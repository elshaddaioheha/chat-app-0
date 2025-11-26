import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/chat.css';

const ChatApp: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="chat-app">
      <Sidebar onNavigate={handleNavigate} />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default ChatApp;

