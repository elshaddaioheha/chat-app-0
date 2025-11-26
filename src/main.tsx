import React from 'react';
import ReactDOM from 'react-dom/client';
import { PrivyProvider } from '@privy-io/react-auth';
import App from './App.tsx';
import SetupGuide from './components/SetupGuide.tsx';
import './index.css';

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID;

// Check if Privy App ID is valid
const isInvalidKey = !PRIVY_APP_ID || 
  PRIVY_APP_ID.includes('your_privy_app_id') ||
  PRIVY_APP_ID === 'your_privy_app_id_here';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isInvalidKey ? (
      <SetupGuide />
    ) : (
      <PrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          loginMethods: ['wallet', 'email', 'sms', 'google', 'github'],
          appearance: {
            theme: 'dark',
            accentColor: '#6366f1',
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
          // Configure Base as default chain
          defaultChain: {
            id: 8453, // Base mainnet
            name: 'Base',
            network: 'base',
            nativeCurrency: {
              decimals: 18,
              name: 'Ethereum',
              symbol: 'ETH',
            },
            rpcUrls: {
              default: {
                http: ['https://mainnet.base.org'],
              },
              public: {
                http: ['https://mainnet.base.org'],
              },
            },
            blockExplorers: {
              default: {
                name: 'BaseScan',
                url: 'https://basescan.org',
              },
            },
          } as any,
        }}
      >
        <App />
      </PrivyProvider>
    )}
  </React.StrictMode>,
);
