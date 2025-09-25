import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AppLayout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Story, UserProfile } from '@/types/index';
import { useAuthedFetch } from '@/hooks/useAuthedFetch';

interface NewStoryForm {
  title: string;
  author: string;
  description: string;
  coverImageUrl: string;
  audioUrl: string;
  tags: string;
  durationMinutes: number;
  isPremium: boolean;
}

const initialForm: NewStoryForm = {
  title: '',
  author: '',
  description: '',
  coverImageUrl: '',
  audioUrl: '',
  tags: '',
  durationMinutes: 0,
  isPremium: false,
};

export default function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const authedFetch = useAuthedFetch();
  const [stories, setStories] = useState<Story[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [storyForm, setStoryForm] = useState<NewStoryForm>(initialForm);
  const [savingStory, setSavingStory] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canView = useMemo(() => !loading && isAdmin, [loading, isAdmin]);

  useEffect(() => {
    if (!canView) {
      return;
    }
    async function load() {
      setLoadingData(true);
      try {
        const [storiesResponse, usersResponse] = await Promise.all([
          authedFetch('/api/admin/stories'),
          authedFetch('/api/admin/users'),
        ]);
        if (!storiesResponse.ok) {
          throw new Error('Failed to fetch stories');
        }
        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users');
        }
        const storiesJson = await storiesResponse.json();
        const usersJson = await usersResponse.json();
        setStories(storiesJson.stories ?? []);
        setUsers(usersJson.users ?? []);
      } catch (fetchError) {
        console.error(fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load admin data');
      } finally {
        setLoadingData(false);
      }
    }
    void load();
  }, [authedFetch, canView]);

  if (loading) {
    return (
      <AppLayout>
        <p>Loading...</p>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AppLayout>
        <p>You need administrator access to view this page.</p>
      </AppLayout>
    );
  }

  const handleCreateStory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingStory(true);
    setError(null);
    try {
      const response = await authedFetch('/api/admin/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: storyForm.title,
          author: storyForm.author,
          description: storyForm.description,
          coverImageUrl: storyForm.coverImageUrl,
          audioUrl: storyForm.audioUrl,
          tags: storyForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
          isPremium: storyForm.isPremium,
          durationMinutes: Number(storyForm.durationMinutes) || 0,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create story');
      }
      setStoryForm(initialForm);
      const refreshed = await authedFetch('/api/admin/stories');
      const refreshedJson = await refreshed.json();
      setStories(refreshedJson.stories ?? []);
    } catch (submitError) {
      console.error(submitError);
      setError(submitError instanceof Error ? submitError.message : 'Unable to create story');
    } finally {
      setSavingStory(false);
    }
  };

  const handleDeleteStory = async (id: string) => {
    if (!confirm('Delete this story?')) {
      return;
    }
    try {
      const response = await authedFetch(`/api/admin/stories/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete story');
      }
      setStories((prev) => prev.filter((story) => story.id !== id));
    } catch (deleteError) {
      console.error(deleteError);
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete story');
    }
  };

  const handleSetPremium = async (uid: string, subscriptionTier: 'free' | 'premium') => {
    try {
      const response = await authedFetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, subscriptionTier }),
      });
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      setUsers((prev) =>
        prev.map((user) => (user.uid === uid ? { ...user, subscriptionTier } : user)),
      );
    } catch (updateError) {
      console.error(updateError);
      setError(updateError instanceof Error ? updateError.message : 'Unable to update user');
    }
  };

  return (
    <AppLayout>
      <section style={{ display: 'grid', gap: '2rem' }}>
        <header>
          <h1>Admin Console</h1>
          <p>Manage stories, audio assets, and listener subscriptions.</p>
        </header>

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '0.75rem' }}>
            <p>{error}</p>
          </div>
        )}

        {loadingData ? (
          <p>Loading data...</p>
        ) : (
          <div style={{ display: 'grid', gap: '2rem' }}>
            <section style={{ display: 'grid', gap: '1rem' }}>
              <h2>Stories</h2>
              <form onSubmit={handleCreateStory} style={{ display: 'grid', gap: '0.75rem', background: 'rgba(15,23,42,0.75)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(148,163,184,0.3)' }}>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <label>
                    Title
                    <input
                      required
                      value={storyForm.title}
                      onChange={(event) => setStoryForm((prev) => ({ ...prev, title: event.target.value }))}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem' }}
                    />
                  </label>
                  <label>
                    Author
                    <input
                      required
                      value={storyForm.author}
                      onChange={(event) => setStoryForm((prev) => ({ ...prev, author: event.target.value }))}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem' }}
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      value={storyForm.description}
                      onChange={(event) => setStoryForm((prev) => ({ ...prev, description: event.target.value }))}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', minHeight: '100px' }}
                    />
                  </label>
                  <label>
                    Cover image URL
                    <input
                      value={storyForm.coverImageUrl}
                      onChange={(event) => setStoryForm((prev) => ({ ...prev, coverImageUrl: event.target.value }))}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem' }}
                    />
                  </label>
                  <label>
                    Audio URL
                    <input
                      required
                      value={storyForm.audioUrl}
                      onChange={(event) => setStoryForm((prev) => ({ ...prev, audioUrl: event.target.value }))}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem' }}
                    />
                  </label>
                  <label>
                    Tags (comma separated)
                    <input
                      value={storyForm.tags}
                      onChange={(event) => setStoryForm((prev) => ({ ...prev, tags: event.target.value }))}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem' }}
                    />
                  </label>
                  <label>
                    Duration (minutes)
                    <input
                      type="number"
                      min={0}
                      value={storyForm.durationMinutes}
                      onChange={(event) => setStoryForm((prev) => ({ ...prev, durationMinutes: Number(event.target.value) }))}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem' }}
                    />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={storyForm.isPremium}
                      onChange={(event) => setStoryForm((prev) => ({ ...prev, isPremium: event.target.checked }))}
                    />
                    Premium story
                  </label>
                </div>
                <button type="submit" disabled={savingStory} style={{ justifySelf: 'start', padding: '0.65rem 1.25rem', borderRadius: '999px', border: 'none', background: savingStory ? 'rgba(148,163,184,0.5)' : 'linear-gradient(135deg, #a855f7, #6366f1)', color: '#0f172a', fontWeight: 700 }}>
                  {savingStory ? 'Saving...' : 'Create story'}
                </button>
              </form>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {stories.map((story) => (
                  <div key={story.id} style={{ display: 'grid', gap: '0.5rem', background: 'rgba(15,23,42,0.6)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(148,163,184,0.25)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <strong>{story.title}</strong>
                        <p style={{ margin: '0.25rem 0', color: 'rgba(148,163,184,0.8)' }}>{story.author}</p>
                      </div>
                      <button onClick={() => void handleDeleteStory(story.id)} style={{ background: 'none', border: '1px solid rgba(248, 113, 113, 0.4)', color: '#fca5a5', borderRadius: '0.5rem', padding: '0.35rem 0.75rem' }}>
                        Delete
                      </button>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(148,163,184,0.75)' }}>
                      Premium: {story.isPremium ? 'Yes' : 'No'} � Duration: {story.durationMinutes} min
                    </span>
                  </div>
                ))}
                {!stories.length && <p>No stories yet.</p>}
              </div>
            </section>

            <section style={{ display: 'grid', gap: '1rem' }}>
              <h2>Users</h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {users.map((user) => (
                  <div key={user.uid} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', background: 'rgba(15,23,42,0.6)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(148,163,184,0.25)' }}>
                    <div>
                      <strong>{user.displayName || user.email}</strong>
                      <p style={{ margin: 0, color: 'rgba(148,163,184,0.75)' }}>{user.email}</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(148,163,184,0.75)' }}>Tier: {user.subscriptionTier}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => void handleSetPremium(user.uid, 'free')}
                        style={{ padding: '0.4rem 0.9rem', borderRadius: '0.5rem', border: '1px solid rgba(148,163,184,0.25)', background: 'rgba(30,58,138,0.6)', color: '#e0e7ff' }}
                      >
                        Set Free
                      </button>
                      <button
                        onClick={() => void handleSetPremium(user.uid, 'premium')}
                        style={{ padding: '0.4rem 0.9rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg, #22d3ee, #0ea5e9)', color: '#0f172a', fontWeight: 600 }}
                      >
                        Set Premium
                      </button>
                    </div>
                  </div>
                ))}
                {!users.length && <p>No users found.</p>}
              </div>
            </section>
          </div>
        )}
      </section>
    </AppLayout>
  );
}

