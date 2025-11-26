import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import '../styles/auth.css';

const LoginScreen: React.FC = () => {
  const { login, ready } = usePrivy();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  if (!ready) {
    return (
      <div className="login-screen">
        <div className="login-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h1 className="auth-title">ChatXP</h1>
          <p className="auth-subtitle">Decentralized encrypted chat on Base</p>
        </div>

        <div className="auth-actions">
          <button onClick={handleLogin} className="btn-primary">
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
