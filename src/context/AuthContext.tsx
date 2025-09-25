import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { getSupabaseBrowserClient, supabaseConfigured } from '@/lib/supabaseClient';
import { firebaseConfigured, auth as firebaseAuth, firestore, googleProvider } from '@/lib/firebaseClient';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, type User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '@/types/index';

interface AuthContextValue {
  backend: 'supabase' | 'firebase' | 'mock';
  loading: boolean;
  userId: string | null;
  email: string | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase() ?? '';
const backend: AuthContextValue['backend'] = supabaseConfigured
  ? 'supabase'
  : firebaseConfigured && firebaseAuth
    ? 'firebase'
    : 'mock';

function mapSupabaseProfile(row: Record<string, any> | null): UserProfile | null {
  if (!row) {
    return null;
  }
  return {
    uid: row.id,
    email: row.email ?? '',
    displayName: row.display_name ?? row.email ?? 'Listener',
    photoURL: row.photo_url ?? undefined,
    subscriptionTier: (row.subscription_tier as UserProfile['subscriptionTier']) ?? 'free',
    favoriteStoryIds: (row.favorite_story_ids as string[]) ?? [],
    progress: (row.progress as UserProfile['progress']) ?? [],
    createdAt: row.created_at ?? new Date().toISOString(),
    stripeCustomerId: row.stripe_customer_id ?? undefined,
    isAdmin: row.is_admin ?? false,
  };
}

async function ensureSupabaseProfile(user: SupabaseUser): Promise<UserProfile> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  if (error) {
    throw error;
  }

  if (data) {
    return mapSupabaseProfile(data)!;
  }

  const defaultRow = {
    id: user.id,
    email: user.email ?? '',
    display_name: user.user_metadata?.full_name ?? user.email ?? 'Listener',
    photo_url: user.user_metadata?.avatar_url ?? null,
    subscription_tier: 'free',
    favorite_story_ids: [],
    progress: [],
  };

  const { error: upsertError } = await supabase.from('profiles').upsert(defaultRow, { onConflict: 'id' });
  if (upsertError) {
    throw upsertError;
  }

  const { data: createdRow } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return mapSupabaseProfile(createdRow) ?? {
    uid: user.id,
    email: user.email ?? '',
    displayName: user.user_metadata?.full_name ?? user.email ?? 'Listener',
    subscriptionTier: 'free',
    favoriteStoryIds: [],
    progress: [],
    createdAt: new Date().toISOString(),
  };
}

async function ensureFirebaseProfile(user: FirebaseUser): Promise<UserProfile> {
  if (!firestore) {
    throw new Error('Firestore is not available.');
  }
  const ref = doc(firestore, 'users', user.uid);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) {
    return snapshot.data() as UserProfile;
  }

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? 'Anonymous Listener',
    photoURL: user.photoURL ?? undefined,
    subscriptionTier: 'free',
    favoriteStoryIds: [],
    progress: [],
    createdAt: new Date().toISOString(),
  };

  await setDoc(ref, profile);
  return profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const refreshSupabaseProfile = useCallback(async () => {
    if (backend !== 'supabase') {
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !userId) {
      return;
    }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (!error) {
      setProfile(mapSupabaseProfile(data));
    }
  }, [userId]);

  const refreshFirebaseProfile = useCallback(async () => {
    if (backend !== 'firebase') {
      return;
    }
    if (!firebaseAuth?.currentUser) {
      setProfile(null);
      return;
    }
    const updated = await ensureFirebaseProfile(firebaseAuth.currentUser);
    setProfile(updated);
  }, []);

  useEffect(() => {
    if (backend === 'supabase') {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const handleSession = async (session: Session | null) => {
        if (session?.user) {
          setUserId(session.user.id);
          setEmail(session.user.email ?? null);
          const userProfile = await ensureSupabaseProfile(session.user);
          setProfile(userProfile);
        } else {
          setUserId(null);
          setEmail(null);
          setProfile(null);
        }
        setLoading(false);
      };

      supabase.auth.getSession().then(({ data }) => {
        void handleSession(data.session ?? null);
      });

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        void handleSession(session);
      });

      return () => {
        listener.subscription.unsubscribe();
      };
    }

    if (backend === 'firebase' && firebaseAuth) {
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
          setEmail(user.email ?? null);
          const userProfile = await ensureFirebaseProfile(user);
          setProfile(userProfile);
        } else {
          setUserId(null);
          setEmail(null);
          setProfile(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }

    setLoading(false);
    return undefined;
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    if (backend === 'supabase') {
      return {
        backend,
        loading,
        userId,
        email,
        profile,
        isAdmin:
          (profile?.isAdmin ?? false) || (!!profile?.email && !!ADMIN_EMAIL && profile.email.toLowerCase() === ADMIN_EMAIL),
        async signInWithGoogle() {
          const supabase = getSupabaseBrowserClient();
          if (!supabase) {
            throw new Error('Supabase client not available');
          }
          const redirectTo = `${window.location.origin}/`;
          await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
        },
        async signOutUser() {
          const supabase = getSupabaseBrowserClient();
          if (supabase) {
            await supabase.auth.signOut();
          }
          setProfile(null);
          setUserId(null);
          setEmail(null);
        },
        async getAccessToken() {
          const supabase = getSupabaseBrowserClient();
          if (!supabase) {
            return null;
          }
          const { data } = await supabase.auth.getSession();
          return data.session?.access_token ?? null;
        },
        refreshProfile: refreshSupabaseProfile,
      };
    }

    if (backend === 'firebase' && firebaseAuth) {
      return {
        backend,
        loading,
        userId,
        email,
        profile,
        isAdmin: !!profile?.email && !!ADMIN_EMAIL && profile.email.toLowerCase() === ADMIN_EMAIL,
        async signInWithGoogle() {
          if (firebaseAuth) {
            await signInWithPopup(firebaseAuth, googleProvider);
          }
        },
        async signOutUser() {
          if (firebaseAuth) {
            await signOut(firebaseAuth);
          }
          setProfile(null);
          setUserId(null);
          setEmail(null);
        },
        async getAccessToken() {
          if (!firebaseAuth?.currentUser) {
            return null;
          }
          return firebaseAuth.currentUser.getIdToken();
        },
        refreshProfile: refreshFirebaseProfile,
      };
    }

    return {
      backend,
      loading: false,
      userId: null,
      email: null,
      profile: null,
      isAdmin: false,
      async signInWithGoogle() {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Authentication is disabled in mock mode.');
        }
      },
      async signOutUser() {
        /* noop */
      },
      async getAccessToken() {
        return null;
      },
      async refreshProfile() {
        /* noop */
      },
    };
  }, [loading, userId, email, profile, refreshSupabaseProfile, refreshFirebaseProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
