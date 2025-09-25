import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/Layout';
import { StoryCard } from '@/components/StoryCard';
import { fetchStories } from '@/lib/firestore';
import { Story } from '@/types/index';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';

export default function LibraryPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const hasPremium = usePremiumAccess();

  useEffect(() => {
    let active = true;
    async function loadStories() {
      const data = await fetchStories(hasPremium);
      if (!active) {
        return;
      }
      setStories(data);
      setLoading(false);
    }
    void loadStories();
    return () => {
      active = false;
    };
  }, [hasPremium]);

  const filtered = stories.filter((story) => {
    const haystack = `${story.title} ${story.author} ${story.tags.join(' ')}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <AppLayout>
      <section>
        <h1>Story Library</h1>
        <p>Search top chart stories, trending originals, and curated playlists.</p>
        <input
          style={{
            marginTop: '1rem',
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: 'rgba(15, 23, 42, 0.6)',
            color: '#f8fafc',
          }}
          placeholder="Search stories, authors, or tags"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        {loading ? (
          <p>Loading stories...</p>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
            {filtered.map((story) => (
              <StoryCard key={story.id} story={story} onPlay={() => {}} isLocked={story.isPremium && !hasPremium} />
            ))}
            {!filtered.length && <p>No stories match your search yet.</p>}
          </div>
        )}
      </section>
    </AppLayout>
  );
}
