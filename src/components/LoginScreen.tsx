import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import './LoginScreen.css';

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
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <h1>ChatXP</h1>
          <p>Decentralized encrypted chat on Base</p>
          <p className="subtitle">Connect your wallet to get started</p>
        </div>
        <div className="login-form">
          <button onClick={handleLogin} className="wallet-connect-button">
            <span className="wallet-icon">🔐</span>
            Connect Wallet
          </button>
          <p className="wallet-info">
            Supports MetaMask, Coinbase Wallet, WalletConnect, and more
          </p>
        </div>
        <div className="login-features">
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <span>End-to-End Encrypted</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span>Earn XP Rewards</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🪙</span>
            <span>Deploy Tokens</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
