# ChatXP - Encrypted Chat Application

A modern, secure chat application built with React, TypeScript, Privy wallet authentication, and Supabase. Features end-to-end encryption, XP-based gamification, group chats, and blockchain integration.

## ✨ Features

- 🔐 **Wallet Authentication** - Powered by Privy for secure Web3 authentication
- 💬 **Real-time Messaging** - One-on-one and group chat with Supabase real-time subscriptions
- 🔒 **End-to-End Encryption** - TweetNaCl encryption for private messages and groups
- 🎮 **XP System** - Earn XP through active participation (50 XP per 3 hours)
- 👥 **Group Chats** - Create and manage encrypted group conversations
- 🏆 **Leaderboard** - Track user activity and XP rankings
- ⭐ **Premium Features** - Enhanced features with XP-based unlocking
- 📁 **File Sharing** - Upload and share files with XP-based storage limits
- 🪙 **Token Deployment** - Deploy tokens via Clanker API (coming soon)
- 📱 **Responsive Design** - Beautiful, modern UI that works on all devices
- 🔔 **Notifications** - Browser notifications for new messages

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Authentication**: Privy (Wallet-based)
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Encryption**: TweetNaCl (Box for DMs, Secretbox for groups)
- **Blockchain**: Viem, Wagmi
- **Styling**: CSS3 with modern design patterns
- **Routing**: React Router v6

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js (v18 or higher)
- npm or yarn package manager
- A Privy account ([privy.io](https://privy.io))
- A Supabase account ([supabase.com](https://supabase.com))

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd chat-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Privy

1. Create a new application at [privy.io](https://privy.io)
2. Copy your **App ID** from the Privy dashboard
3. Add the key to your `.env` file (see step 6)

### 4. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to find your:
   - Project URL
   - Anon/Public Key
3. Add these to your `.env` file

### 5. Create Supabase Database

Run the SQL migration file located at `supabase/migrations/001_create_chatxp_schema.sql` in your Supabase SQL Editor.

This will create all necessary tables:
- `users` - User profiles with wallet addresses and XP
- `messages` - Encrypted messages
- `groups` - Group chat information
- `group_members` - Group membership with encrypted keys
- `premium_features` - XP-unlocked features
- `xp_transactions` - XP transfer history
- `token_deployments` - Deployed token records
- `notifications` - User notifications

### 6. Create Environment Variables

Create a `.env` file in the root directory:

```env
# Privy Authentication
VITE_PRIVY_APP_ID=your_privy_app_id_here

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Clanker API Key
VITE_CLANKER_API_KEY=your_clanker_api_key_here
```

**Important**: 
- Replace all placeholder values with your actual keys
- Never commit the `.env` file to version control
- Use the provided `env.example` as a template

### 7. Create Supabase Storage Bucket

1. Go to Supabase Dashboard > Storage
2. Create a new bucket named `chat-files`
3. Set it to **Public** or configure appropriate RLS policies

### 8. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🏗️ Building for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

Preview the production build:

```bash
npm run preview
```

## 📦 Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Add environment variables in Vercel dashboard
4. Deploy: `vercel --prod`

See `DEPLOYMENT.md` for detailed deployment instructions.

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard
4. Set build command: `npm run build`
5. Set publish directory: `dist`

## 📁 Project Structure

```
chat-app/
├── src/
│   ├── components/          # React components
│   │   ├── ChatApp.tsx      # Main app container
│   │   ├── ChatInterface.tsx # Chat UI
│   │   ├── ChatView.tsx     # Chat view with user list
│   │   ├── GroupsView.tsx   # Groups interface
│   │   ├── Leaderboard.tsx  # XP leaderboard
│   │   ├── PremiumFeatures.tsx # Premium features
│   │   ├── TokenDeployment.tsx # Token deployment
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   │   ├── useUser.ts       # User authentication & data
│   │   ├── useActiveTime.ts # XP tracking
│   │   ├── usePremiumFeatures.ts # Premium feature management
│   │   └── useNotifications.ts # Notification system
│   ├── lib/                 # Utility libraries
│   │   ├── supabase.ts      # Supabase client
│   │   ├── encryption.ts    # TweetNaCl encryption
│   │   ├── groupEncryption.ts # Group encryption
│   │   ├── storage.ts       # File storage utilities
│   │   ├── clanker.ts       # Clanker API integration
│   │   └── notification.ts  # Browser notifications
│   ├── types/               # TypeScript type definitions
│   │   └── database.ts      # Database types
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point with Privy provider
│   └── index.css            # Global styles
├── supabase/
│   └── migrations/          # Database migrations
├── public/                  # Static assets
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🔐 Security Features

### Encryption

- **DM Encryption**: TweetNaCl Box (public-key encryption)
  - Each user has a keypair (public/private)
  - Messages encrypted with recipient's public key
  - Only recipient can decrypt with their private key

- **Group Encryption**: TweetNaCl Secretbox (symmetric encryption)
  - Shared group key encrypted for each member
  - Group messages encrypted with shared key
  - Keys stored encrypted in database

### Authentication

- Wallet-based authentication via Privy
- No passwords required
- Secure session management
- Private keys stored in localStorage (consider hardware wallet for production)

### Row Level Security

- Supabase RLS policies enforce access control
- Users can only access their own data
- Group members can only access group messages

## 🎮 XP System

- **Earning XP**: 50 XP per 3 hours of active time
- **XP Transfers**: Send XP to other users
- **Premium Features**: Unlock features with XP
- **Leaderboard**: Compete for top rankings
- **Storage Limits**: XP determines file storage capacity

## 🔧 Troubleshooting

### Privy Authentication Issues
- Verify your `VITE_PRIVY_APP_ID` is correct
- Check Privy dashboard for application settings
- Ensure your domain is whitelisted in Privy

### Supabase Connection Issues
- Verify your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check Supabase project status
- Verify RLS policies are correctly configured
- Ensure database migration has been run

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be v18+)
- Verify TypeScript compilation: `npx tsc --noEmit`

### Encryption Issues
- Ensure user has generated keypair (happens on first login)
- Check browser console for encryption errors
- Verify TweetNaCl is properly installed

## 📚 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_PRIVY_APP_ID` | Privy app ID for wallet authentication | Yes |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes |
| `VITE_CLANKER_API_KEY` | Clanker API key for token deployment | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the troubleshooting section
- Review Privy and Supabase documentation
- Open an issue on GitHub

## 🚀 Future Enhancements

- [x] End-to-end encryption
- [x] XP system
- [x] File sharing
- [ ] Token deployment UI completion
- [ ] Voice messages
- [ ] Video calls
- [ ] Mobile app versions
- [ ] Advanced analytics dashboard
- [ ] NFT integration

---

Built with ❤️ using React, Privy, Supabase, and TweetNaCl
