import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { supabase } from '../lib/supabase';
import { Lock, Palette, BarChart, Users, Cloud, Zap, Check } from 'lucide-react';
import '../styles/features.css';

const PremiumFeatures: React.FC = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const isPremium = user?.premium_status || false;
  const daysRemaining = user?.premium_expires_at
    ? Math.ceil((new Date(user.premium_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const handleUpgrade = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { error } = await supabase
        .from('users')
        .update({
          premium_status: true,
          premium_expires_at: expiresAt.toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      alert('Premium activated! (Demo)');
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      alert('Error upgrading to premium. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Lock size={24} />,
      title: 'End-to-End Encryption',
      description: 'Advanced encryption for all your messages and groups',
    },
    {
      icon: <Palette size={24} />,
      title: 'Custom Themes',
      description: 'Personalize your chat experience with custom themes',
    },
    {
      icon: <BarChart size={24} />,
      title: 'Advanced Analytics',
      description: 'Detailed statistics and insights about your activity',
    },
    {
      icon: <Users size={24} />,
      title: 'Unlimited Groups',
      description: 'Create and join unlimited groups',
    },
    {
      icon: <Cloud size={24} />,
      title: 'Cloud Storage',
      description: 'Unlimited file storage and sharing',
    },
    {
      icon: <Zap size={24} />,
      title: 'Priority Support',
      description: 'Get priority customer support',
    },
  ];

  return (
    <div className="feature-view">
      <div className="feature-header">
        <h1 className="feature-title">Premium Features</h1>
        <p className="feature-subtitle">Unlock the full potential of ChatXP</p>
      </div>

      <div style={{ marginBottom: 'var(--spacing-xl)', padding: 'var(--spacing-lg)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600 }}>
              {isPremium ? 'Active Premium' : 'Free Plan'}
            </h2>
            {isPremium && daysRemaining !== null && (
              <p style={{ color: 'var(--color-text-secondary)' }}>
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
              </p>
            )}
          </div>
          {!isPremium && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>$9.99</div>
              <div style={{ color: 'var(--color-text-secondary)' }}>/month</div>
            </div>
          )}
        </div>

        {!isPremium && (
          <button
            onClick={handleUpgrade}
            disabled={loading}
            style={{
              width: '100%',
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-primary-text)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Processing...' : 'Upgrade Now'}
          </button>
        )}
      </div>

      <div className="premium-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="card-icon">{feature.icon}</div>
            <h3 className="card-title" style={{ fontSize: 'var(--font-size-lg)', marginTop: 'var(--spacing-sm)' }}>{feature.title}</h3>
            <p className="card-description">{feature.description}</p>
            {!isPremium && (
              <div style={{ marginTop: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                <Lock size={14} /> Premium Only
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PremiumFeatures;
