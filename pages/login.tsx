import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/Login.module.css';

export default function LoginPage() {
  const { signInWithGoogle, userId, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userId) {
      void router.replace('/');
    }
  }, [loading, userId, router]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1>Welcome back</h1>
        <p>Sign in to continue listening to your favorite PocketCast stories.</p>
        <button className={styles.googleButton} onClick={() => void signInWithGoogle()}>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
