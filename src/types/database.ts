// Updated database types for ChatXP
export interface User {
  id: string;
  wallet_address: string;
  username: string;
  xp: number;
  total_active_time: number; // in milliseconds
  last_active: string;
  public_key: string;
  notification_enabled: boolean;
  premium_status?: boolean;
  premium_expires_at?: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id?: string;
  group_id?: string;
  encrypted_content: string; // JSON string with { encrypted, nonce, ephemeralPublicKey } or { encrypted, nonce } for groups
  encrypted_key?: string; // For group messages
  nonce: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_path?: string;
  created_at: string;
  sender?: User;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  creator_id: string;
  min_xp_required: number;
  group_key_encrypted?: string;
  created_at: string;
  members?: GroupMember[];
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  encrypted_group_key?: string;
  key_nonce?: string;
  key_ephemeral_public?: string;
  joined_at: string;
  user?: User;
}

export interface XPTransaction {
  id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  created_at: string;
}

export interface TokenDeployment {
  id: string;
  token_address: string;
  token_name: string;
  token_symbol: string;
  total_supply: string;
  deployer_id: string;
  tx_hash: string;
  created_at: string;
}

export interface PremiumFeature {
  id: string;
  user_id: string;
  feature_name: string;
  unlocked_at: string;
  expires_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'group_invite' | 'premium' | 'xp';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  xp: number;
  total_active_time: number;
  rank: number;
}
