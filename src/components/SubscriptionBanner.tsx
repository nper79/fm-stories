import styles from '@/styles/SubscriptionBanner.module.css';
import { useAuth } from '@/context/AuthContext';

interface SubscriptionBannerProps {
  onUpgrade: () => void;
}

export function SubscriptionBanner({ onUpgrade }: SubscriptionBannerProps) {
  const { profile } = useAuth();
  if (profile?.subscriptionTier === 'premium') {
    return null;
  }

  return (
    <section className={styles.banner}>
      <div>
        <h2>Unlock Premium Stories</h2>
        <p>Get access to the full PocketCast catalog, offline listening, and new episodes each week.</p>
      </div>
      <button className={styles.cta} onClick={onUpgrade}>
        Upgrade Now
      </button>
    </section>
  );
}
