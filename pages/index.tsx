import { useMemo, useState } from 'react';
import { AppLayout } from '@/components/Layout';
import { DiscoverHero } from '@/components/DiscoverHero';
import { FilterBar } from '@/components/FilterBar';
import { StoryGrid } from '@/components/StoryGrid';
import { useStories } from '@/hooks/useStories';
import type { Story } from '@/types/index';

const FILTERS = ['Featured', 'Trending', 'New arrivals'];

export default function HomePage() {
  const { stories, loading, error } = useStories();
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [activeTag, setActiveTag] = useState('All');

  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    stories.forEach((story) => story.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [stories]);

  const displayedStories = useMemo(() => {
    let list = [...stories];
    if (activeFilter === 'Trending') {
      list.sort((a, b) => Number(b.isPremium) - Number(a.isPremium));
    } else if (activeFilter === 'New arrivals') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (activeTag !== 'All') {
      list = list.filter((story) => story.tags.includes(activeTag));
    }
    return list;
  }, [stories, activeFilter, activeTag]);

  return (
    <AppLayout>
      <DiscoverHero />
      <FilterBar
        filters={FILTERS}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        tags={tags}
        activeTag={activeTag}
        onTagChange={setActiveTag}
      />
      {loading && <p style={{ marginTop: '2rem' }}>Loading stories...</p>}
      {error && !loading && <p style={{ marginTop: '2rem', color: '#f87171' }}>{error}</p>}
      {!loading && !error && <StoryGrid stories={displayedStories} />}
    </AppLayout>
  );
}
