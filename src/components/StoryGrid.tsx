import Link from 'next/link';
import styles from '@/styles/StoryGrid.module.css';
import type { Story } from '@/types/index';

interface StoryGridProps {
  stories: Story[];
}

export function StoryGrid({ stories }: StoryGridProps) {
  return (
    <section className={styles.section}>
      <h2>Discover Stories</h2>
      <p>Immersive audio adventures</p>
      <div className={styles.grid}>
        {stories.map((story) => (
          <Link key={story.id} href={`/stories/${story.id}`} className={styles.card}>
            <div className={styles.cover}>
              <img src={story.coverImageUrl} alt={story.title} />
              {story.isPremium && (
                <div className={styles.premium}>Premium</div>
              )}
              <button className={styles.playBtn}>▶</button>
            </div>
            <div className={styles.content}>
              <h3>{story.title}</h3>
              <div className={styles.author}>{story.author}</div>
              <div className={styles.tags}>{story.tags.join(' • ')}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}