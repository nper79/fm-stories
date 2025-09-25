import { useState } from 'react';
import { AppLayout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';

export default function AccountPage() {
  const { profile, loading, signOutUser, getAccessToken, refreshProfile } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setError(null);
    setUpgrading(true);
    try {
      const token = await getAccessToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers,
      });
      if (!response.ok) {
        throw new Error('Unable to start checkout. Please try again.');
      }
      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;
    } catch (upgradeError) {
      console.error(upgradeError);
      setError(upgradeError instanceof Error ? upgradeError.message : 'Unable to start checkout');
    } finally {
      setUpgrading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    await refreshProfile();
  };

  if (loading) {
    return (
      <AppLayout>
        <p>Loading account...</p>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <p>
          Please <a href="/login">sign in</a> to manage your account.
        </p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <section style={{ display: 'grid', gap: '1.5rem' }}>
        <div>
          <h1>Account</h1>
          <p>{profile.email}</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(248,113,113,0.15)', borderRadius: '0.75rem', padding: '1rem' }}>
            <p>{error}</p>
          </div>
        )}

        <div style={{ background: 'rgba(15,23,42,0.85)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(148,163,184,0.3)' }}>
          <h2>Subscription</h2>
          <p>
            Current tier: <strong>{profile.subscriptionTier}</strong>
          </p>
          {profile.subscriptionTier === 'premium' ? (
            <p>Thanks for being a premium listener! Enjoy unlimited stories.</p>
          ) : (
            <button
              onClick={() => void handleUpgrade()}
              disabled={upgrading}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '999px',
                border: 'none',
                background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
                color: '#0f172a',
                fontWeight: 700,
                opacity: upgrading ? 0.7 : 1,
              }}
            >
              {upgrading ? 'Redirecting...' : 'Upgrade with Stripe'}
            </button>
          )}
        </div>

        <button
          onClick={() => void handleSignOut()}
          style={{
            justifySelf: 'start',
            background: 'none',
            color: '#fda4af',
            border: '1px solid rgba(248, 113, 113, 0.4)',
            padding: '0.5rem 1rem',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.6)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.4)';
          }}
        >
          Sign out
        </button>
      </section>
    </AppLayout>
  );
}
