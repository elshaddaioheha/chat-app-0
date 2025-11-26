import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { supabase } from '../lib/supabase';
import '../styles/features.css';

const PremiumFeatures: React.FC = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  // Check if user has premium status based on user data
  const isPremium = user?.premium_status || false;
  const daysRemaining = user?.premium_expires_at
    ? Math.ceil((new Date(user.premium_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const handleUpgrade = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      // In a real app, this would integrate with a payment processor
      // For now, we'll simulate premium activation
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month from now

      const { error } = await supabase
        .from('users')
        .update({
          premium_status: true,
          premium_expires_at: expiresAt.toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      alert('Premium activated! (This is a demo - implement payment processing)');
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      alert('Error upgrading to premium. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: '🔒',
      title: 'End-to-End Encryption',
      description: 'Advanced encryption for all your messages and groups',
    },
    {
      icon: '🎨',
      title: 'Custom Themes',
      description: 'Personalize your chat experience with custom themes',
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Detailed statistics and insights about your activity',
    },
    {
      icon: '👥',
      title: 'Unlimited Groups',
      description: 'Create and join unlimited groups',
    },
    {
      icon: '☁️',
      title: 'Cloud Storage',
      description: 'Unlimited file storage and sharing',
    },
    {
      icon: '⚡',
      title: 'Priority Support',
      description: 'Get priority customer support',
    },
  ];

  return (
    <div className="premium-features">
      <div className="premium-header">
        <h1>⭐ Premium Features</h1>
        {isPremium ? (
          <div className="premium-status active">
            <span>Active Premium</span>
            {daysRemaining !== null && (
              <span className="days-remaining">
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
              </span>
            )}
          </div>
        ) : (
          <div className="premium-status inactive">
            <span>Free Plan</span>
          </div>
        )}
      </div>

      {!isPremium && (
        <div className="upgrade-section">
          <div className="upgrade-card">
            <h2>Upgrade to Premium</h2>
            <div className="price">
              <span className="currency">$</span>
              <span className="amount">9.99</span>
              <span className="period">/month</span>
            </div>
            <button
              className="upgrade-button"
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Upgrade Now'}
            </button>
            <p className="upgrade-note">
              * This is a demo. Implement payment processing (Stripe, PayPal, etc.) for production.
            </p>
          </div>
        </div>
      )}

      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className={`feature-card ${isPremium ? 'premium' : 'locked'}`}>
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            {!isPremium && (
              <div className="locked-overlay">
                <span>🔒 Premium Only</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PremiumFeatures;
