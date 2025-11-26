export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
        Relationships: []
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at' | 'sender'>
        Update: Partial<Omit<Message, 'id' | 'created_at' | 'sender'>>
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      groups: {
        Row: Group
        Insert: Omit<Group, 'id' | 'created_at' | 'members'>
        Update: Partial<Omit<Group, 'id' | 'created_at' | 'members'>>
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      group_members: {
        Row: GroupMember
        Insert: Omit<GroupMember, 'id' | 'joined_at' | 'user'>
        Update: Partial<Omit<GroupMember, 'id' | 'joined_at' | 'user'>>
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      xp_transactions: {
        Row: XPTransaction
        Insert: Omit<XPTransaction, 'id' | 'created_at'>
        Update: Partial<Omit<XPTransaction, 'id' | 'created_at'>>
        Relationships: []
      }
      token_deployments: {
        Row: TokenDeployment
        Insert: Omit<TokenDeployment, 'id' | 'created_at'>
        Update: Partial<Omit<TokenDeployment, 'id' | 'created_at'>>
        Relationships: []
      }
      premium_features: {
        Row: PremiumFeature
        Insert: Omit<PremiumFeature, 'id' | 'unlocked_at'>
        Update: Partial<Omit<PremiumFeature, 'id' | 'unlocked_at'>>
        Relationships: []
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at'>
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: {
      leaderboard: {
        Row: LeaderboardEntry
      }
    }
    Functions: {
      [_: string]: never
    }
    Enums: {
      [_: string]: never
    }
    CompositeTypes: {
      [_: string]: never
    }
  }
}

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
