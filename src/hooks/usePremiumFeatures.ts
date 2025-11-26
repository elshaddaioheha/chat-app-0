// Premium Features hook - XP-based feature gating
import { useEffect, useState } from 'react';
import { useUser } from './useUser';
import { supabase } from '../lib/supabase';
import type { PremiumFeature } from '../types/database';

export const usePremiumFeatures = () => {
  const { user } = useUser();
  const [unlockedFeatures, setUnlockedFeatures] = useState<PremiumFeature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUnlockedFeatures([]);
      setLoading(false);
      return;
    }

    const loadPremiumFeatures = async () => {
      try {
        const { data, error } = await supabase
          .from('premium_features')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        setUnlockedFeatures(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading premium features:', error);
        setLoading(false);
      }
    };

    loadPremiumFeatures();
  }, [user]);

  const isFeatureUnlocked = (featureName: string): boolean => {
    const feature = unlockedFeatures.find(f => f.feature_name === featureName);
    if (!feature) return false;
    
    // Check if expired
    if (feature.expires_at) {
      const expiresAt = new Date(feature.expires_at);
      const now = new Date();
      return expiresAt > now;
    }
    
    return true; // Permanent unlock
  };

  const unlockFeature = async (featureName: string, xpCost: number): Promise<boolean> => {
    if (!user || user.xp < xpCost) {
      return false;
    }

    try {
      // Check if already unlocked
      if (isFeatureUnlocked(featureName)) {
        return true;
      }

      // Deduct XP and unlock feature
      const { error: featureError } = await supabase
        .from('premium_features')
        .insert({
          user_id: user.id,
          feature_name: featureName,
        });

      if (featureError) throw featureError;

      // Deduct XP
      const { error: xpError } = await supabase
        .from('users')
        .update({ xp: user.xp - xpCost })
        .eq('id', user.id);

      if (xpError) throw xpError;

      // Reload features
      const { data } = await supabase
        .from('premium_features')
        .select('*')
        .eq('user_id', user.id);

      setUnlockedFeatures(data || []);
      return true;
    } catch (error) {
      console.error('Error unlocking feature:', error);
      return false;
    }
  };

  return {
    unlockedFeatures,
    isFeatureUnlocked,
    unlockFeature,
    loading,
  };
};
