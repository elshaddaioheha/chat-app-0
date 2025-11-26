import React from 'react';
import './SetupGuide.css';

const SetupGuide: React.FC = () => {
  return (
    <div className="setup-guide">
      <div className="setup-container">
        <h1>🔧 Setup Required</h1>
        <p className="setup-description">
          To use this chat app, you need to configure environment variables with your API keys.
        </p>

        <div className="setup-section">
          <h2>1️⃣ Privy Authentication Setup</h2>
          <ol>
            <li>Go to <a href="https://privy.io" target="_blank" rel="noopener noreferrer">privy.io</a> and create a free account</li>
            <li>Create a new application</li>
            <li>Go to <strong>Settings → API Keys</strong> in the dashboard</li>
            <li>Copy your <strong>App ID</strong></li>
            <li>Add it to your <code>.env</code> file as <code>VITE_PRIVY_APP_ID</code></li>
            <li>Enable wallet connections in Privy dashboard (MetaMask, Coinbase Wallet, etc.)</li>
          </ol>
        </div>

        <div className="setup-section">
          <h2>2️⃣ Supabase Database Setup</h2>
          <ol>
            <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a> and create a free account</li>
            <li>Create a new project</li>
            <li>Go to <strong>Settings → API</strong></li>
            <li>Copy your <strong>Project URL</strong> and <strong>anon/public key</strong></li>
            <li>Add them to your <code>.env</code> file as <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code></li>
            <li>Go to <strong>SQL Editor</strong> and run the schema from <code>README.md</code> to create the database tables</li>
          </ol>
        </div>

        <div className="setup-section">
          <h2>3️⃣ Environment Variables</h2>
          <p>Create a <code>.env</code> file in the root directory with:</p>
          <pre className="env-example">
{`VITE_PRIVY_APP_ID=your_privy_app_id_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_supabase_key_here
VITE_CLANKER_API_KEY=your_clanker_api_key_here (optional)`}
          </pre>
          <p className="note">💡 You can copy <code>env.example</code> and replace the values</p>
        </div>

        <div className="setup-section">
          <h2>4️⃣ Restart the Server</h2>
          <p>After updating your <code>.env</code> file:</p>
          <ol>
            <li>Stop the dev server (Ctrl+C)</li>
            <li>Run <code>npm run dev</code> again</li>
          </ol>
        </div>

        <div className="setup-actions">
          <button onClick={() => window.location.reload()} className="reload-button">
            🔄 Refresh Page (After updating .env)
          </button>
          <a href="https://dashboard.privy.io" target="_blank" rel="noopener noreferrer" className="external-link">
            Get Privy App ID →
          </a>
          <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="external-link">
            Get Supabase Keys →
          </a>
        </div>

        <div className="setup-help">
          <p>📚 For detailed instructions, check the <code>README.md</code> file</p>
        </div>
      </div>
    </div>
  );
};

export default SetupGuide;

