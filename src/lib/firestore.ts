import { stories as mockStories } from '@/data/mockContent';
import { getSupabaseBrowserClient, supabaseConfigured } from '@/lib/supabaseClient';
import { Story, UserProfile } from '@/types/index';
import { collection, doc, getDoc, getDocs, query, updateDoc, where, addDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { firestore } from './firebaseClient';

function mapStory(row: Record<string, any>): Story {
  return {
    id: row.id ?? row.slug ?? '',
    title: row.title ?? '',
    author: row.author ?? 'Unknown',
    description: row.description ?? '',
    coverImageUrl: row.cover_url ?? row.coverImageUrl ?? '',
    audioUrl: row.audio_url ?? row.audioUrl ?? '#',
    tags: (row.tags as string[]) ?? [],
    isPremium: Boolean(row.is_premium ?? row.isPremium ?? false),
    durationMinutes: Number(row.duration_minutes ?? row.durationMinutes ?? 0),
  };
}

function mapProfile(row: Record<string, any>): UserProfile {
  return {
    uid: row.id,
    email: row.email ?? '',
    displayName: row.display_name ?? row.displayName ?? 'Listener',
    photoURL: row.photo_url ?? row.photoURL ?? undefined,
    subscriptionTier: (row.subscription_tier as UserProfile['subscriptionTier']) ?? 'free',
    favoriteStoryIds: (row.favorite_story_ids as string[]) ?? [],
    progress: (row.progress as UserProfile['progress']) ?? [],
    createdAt: row.created_at ?? new Date().toISOString(),
    stripeCustomerId: row.stripe_customer_id ?? undefined,
    isAdmin: row.is_admin ?? false,
  };
}

export async function fetchStories(includePremium = false): Promise<Story[]> {
  const supabase = getSupabaseBrowserClient();
  if (supabaseConfigured && supabase) {
    let builder = supabase.from('stories').select('*').order('title');
    if (!includePremium) {
      builder = builder.eq('is_premium', false);
    }
    const { data, error } = await builder;
    if (!error && data) {
      return data.map(mapStory);
    }
    console.error('Supabase fetchStories error', error);
  }

  if (firestore) {
    const storiesCollection = collection(firestore, 'stories');
    const q = includePremium
      ? query(storiesCollection, orderBy('title'))
      : query(storiesCollection, where('isPremium', '==', false), orderBy('title'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({ ...(docSnap.data() as Story), id: docSnap.id }));
  }

  return includePremium ? mockStories : mockStories.filter((story) => !story.isPremium);
}

export async function fetchStory(id: string): Promise<Story | null> {
  const supabase = getSupabaseBrowserClient();
  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .or(`id.eq.${id},slug.eq.${id}`)
      .maybeSingle();
    if (!error && data) {
      return mapStory(data);
    }
  }

  if (firestore) {
    const ref = doc(collection(firestore, 'stories'), id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { ...(snap.data() as Story), id: snap.id };
    }
  }

  const fallback = mockStories.find((story) => story.id === id);
  return fallback ?? null;
}

export async function upsertStory(story: Partial<Story> & { id?: string }): Promise<string> {
  if (firestore) {
    const storiesCollection = collection(firestore, 'stories');
    if (story.id) {
      const { id: storyId, ...rest } = story;
      await updateDoc(doc(storiesCollection, storyId), rest);
      return storyId;
    }
    const newDoc = await addDoc(storiesCollection, story);
    return newDoc.id;
  }
  return story.id ?? 'mock-id';
}

export async function removeStory(id: string): Promise<void> {
  if (firestore) {
    await deleteDoc(doc(firestore, 'stories', id));
  }
}

export async function fetchUser(uid: string): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient();
  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (!error && data) {
      return mapProfile(data);
    }
  }

  if (firestore) {
    const userSnap = await getDoc(doc(firestore, 'users', uid));
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
  }

  return null;
}

export async function updateUser(uid: string, data: Partial<UserProfile>): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (supabaseConfigured && supabase) {
    const payload: Record<string, any> = {};
    if (data.email !== undefined) payload.email = data.email;
    if (data.displayName !== undefined) payload.display_name = data.displayName;
    if (data.photoURL !== undefined) payload.photo_url = data.photoURL;
    if (data.subscriptionTier !== undefined) payload.subscription_tier = data.subscriptionTier;
    if (data.favoriteStoryIds !== undefined) payload.favorite_story_ids = data.favoriteStoryIds;
    if (data.progress !== undefined) payload.progress = data.progress;
    if (data.stripeCustomerId !== undefined) payload.stripe_customer_id = data.stripeCustomerId;
    if (data.isAdmin !== undefined) payload.is_admin = data.isAdmin;
    const { error } = await supabase.from('profiles').update(payload).eq('id', uid);
    if (!error) {
      return;
    }
    console.error('Supabase updateUser error', error);
  }

  if (firestore) {
    await updateDoc(doc(firestore, 'users', uid), data);
  }
}
