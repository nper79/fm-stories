export type SubscriptionTier = 'free' | 'premium';

export interface Story {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImageUrl: string;
  audioUrl: string;
  tags: string[];
  isPremium: boolean;
  durationMinutes: number;
}

export interface ListeningProgress {
  storyId: string;
  positionSeconds: number;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  subscriptionTier: SubscriptionTier;
  favoriteStoryIds: string[];
  progress: ListeningProgress[];
  createdAt: string;
  stripeCustomerId?: string;
  isAdmin?: boolean;
}
