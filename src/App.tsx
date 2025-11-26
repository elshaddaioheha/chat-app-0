import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useUser } from './hooks/useUser';
import LoginScreen from './components/LoginScreen';
import ChatApp from './components/ChatApp';
import ChatView from './components/ChatView';
import GroupsView from './components/GroupsView';
import Leaderboard from './components/Leaderboard';
import PremiumFeatures from './components/PremiumFeatures';
import SettingsView from './components/SettingsView';
import TokenDeployment from './components/TokenDeployment';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

const App: React.FC = () => {
  const { ready, authenticated } = usePrivy();
  const { loading: userLoading } = useUser();

  if (!ready || userLoading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      {!authenticated ? (
        <Routes>
          <Route path="*" element={<LoginScreen />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<ChatApp />}>
            <Route index element={<Navigate to="/chat" replace />} />
            <Route path="chat" element={<ChatView />} />
            <Route path="groups" element={<GroupsView />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="premium" element={<PremiumFeatures />} />
            <Route path="token" element={<TokenDeployment />} />
            <Route path="settings" element={<SettingsView />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  );
};

export default App;
