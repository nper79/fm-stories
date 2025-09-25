import { useAuth } from '@/context/AuthContext';

export function usePremiumAccess() {
  const { profile } = useAuth();
  return profile?.subscriptionTier === 'premium';
}
