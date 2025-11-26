import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '../lib/supabase';
import { generateKeyPair, getPublicKey, getPrivateKey } from '../lib/encryption';
import type { User } from '../types/database';

export const useUser = () => {
  const { authenticated, user: privyUser, ready } = usePrivy();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [privateKey, setPrivateKey] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) {
      setLoading(true);
      return;
    }

    const loadUser = async () => {
      if (!authenticated || !privyUser) {
        setUser(null);
        setPrivateKey(null);
        setLoading(false);
        return;
      }

      try {
        // Get wallet address from Privy
        const walletAddress = privyUser.wallet?.address;
        if (!walletAddress) {
          setLoading(false);
          return;
        }

        // Try to get existing user
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('wallet_address', walletAddress.toLowerCase())
          .single();

        if (existingUser) {
          setUser(existingUser);

          // Load private key from localStorage
          const storedPrivateKey = localStorage.getItem(`privateKey_${walletAddress}`);
          if (storedPrivateKey) {
            setPrivateKey(storedPrivateKey);
          }
        } else {
          // Create new user with encryption keys
          const keyPair = generateKeyPair();
          const publicKeyStr = getPublicKey(keyPair);
          const privateKeyStr = getPrivateKey(keyPair);

          // Store private key in localStorage (client-side only)
          localStorage.setItem(`privateKey_${walletAddress}`, privateKeyStr);
          setPrivateKey(privateKeyStr);

          // Create user in database
          const { data: newUser, error } = await supabase
            .from('users')
            .insert({
              wallet_address: walletAddress.toLowerCase(),
              username: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4),
              xp: 0,
              total_active_time: 0,
              last_active: new Date().toISOString(),
              public_key: publicKeyStr,
              notification_enabled: false,
            })
            .select()
            .single();

          if (error) throw error;
          setUser(newUser);
        }

        // Set up real-time subscription for user updates
        if (user?.id || existingUser?.id) {
          const userId = user?.id || existingUser?.id;
          const channel = supabase
            .channel(`user:${userId}`)
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'users',
                filter: `id=eq.${userId}`,
              },
              (payload: any) => {
                setUser(payload.new as User);
              }
            )
            .subscribe();

          setLoading(false);

          return () => {
            supabase.removeChannel(channel);
          };
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setLoading(false);
      }
    };

    loadUser();
  }, [authenticated, privyUser, ready, user?.id]);

  return {
    user,
    loading,
    walletAddress: privyUser?.wallet?.address || null,
    privateKey,
    isAuthenticated: authenticated,
  };
};
