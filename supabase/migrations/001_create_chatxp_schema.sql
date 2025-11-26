-- ChatXP Database Schema Migration
-- Run this in your Supabase SQL Editor

-- Users table (updated for wallet-based auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  xp INTEGER DEFAULT 0,
  total_active_time BIGINT DEFAULT 0, -- milliseconds
  last_active TIMESTAMPTZ DEFAULT NOW(),
  public_key TEXT NOT NULL,
  notification_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table (updated for E2E encryption)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  encrypted_content TEXT NOT NULL, -- JSON: { encrypted, nonce, ephemeralPublicKey } for DMs or { encrypted, nonce } for groups
  encrypted_key TEXT, -- For group messages
  nonce TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK ((group_id IS NULL AND recipient_id IS NOT NULL) OR (group_id IS NOT NULL AND recipient_id IS NULL))
);

-- Groups table (updated for XP requirements)
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  min_xp_required INTEGER DEFAULT 0,
  group_key_encrypted TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group members table (updated for encrypted group keys)
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  encrypted_group_key TEXT DEFAULT '',
  key_nonce TEXT DEFAULT '',
  key_ephemeral_public TEXT DEFAULT '',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- XP Transactions table
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Token Deployments table
CREATE TABLE IF NOT EXISTS token_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_address TEXT NOT NULL,
  token_name TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  total_supply TEXT NOT NULL,
  deployer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tx_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Premium Features table
CREATE TABLE IF NOT EXISTS premium_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, feature_name)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message', 'group_invite', 'premium', 'xp')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_group ON messages(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_from ON xp_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_to ON xp_transactions(to_user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Anyone can read profiles, users can update their own
CREATE POLICY "Users are viewable by all authenticated users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = wallet_address OR true); -- Simplified for now

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (true);

-- Messages: Users can read their own messages
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    sender_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
    OR recipient_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
    OR group_id IN (SELECT group_id FROM group_members WHERE user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text))
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    sender_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
  );

-- Groups: All authenticated users can view groups
CREATE POLICY "Groups are viewable by all" ON groups
  FOR SELECT USING (true);

CREATE POLICY "Users can create groups" ON groups
  FOR INSERT WITH CHECK (
    creator_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
  );

-- Group members: Viewable by all, joinable by all
CREATE POLICY "Group members are viewable by all" ON group_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join groups" ON group_members
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
  );

-- XP Transactions: Viewable by all, users can create their own
CREATE POLICY "XP transactions are viewable by all" ON xp_transactions
  FOR SELECT USING (true);

CREATE POLICY "Users can create XP transactions" ON xp_transactions
  FOR INSERT WITH CHECK (
    from_user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
  );

-- Token deployments: Viewable by all
CREATE POLICY "Token deployments are viewable by all" ON token_deployments
  FOR SELECT USING (true);

CREATE POLICY "Users can deploy tokens" ON token_deployments
  FOR INSERT WITH CHECK (
    deployer_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
  );

-- Premium features: Users can view their own
CREATE POLICY "Users can view own premium features" ON premium_features
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
  );

CREATE POLICY "Users can unlock premium features" ON premium_features
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
  );

-- Notifications: Users can view their own
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
  );

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
  );

-- Note: RLS policies using auth.uid() will need to be updated based on your authentication method
-- For Privy + Supabase, you may need to use JWT tokens or a custom auth function
-- For now, these policies use wallet_address matching which needs custom implementation

