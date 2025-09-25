import Link from 'next/link';
import styles from '@/styles/CategoryRow.module.css';
import { categories, stories } from '@/data/mockContent';

function getStories(ids: string[]) {
  return ids
    .map((id) => stories.find((story) => story.id === id))
    .filter((story): story is NonNullable<typeof story> => Boolean(story));
}

export function CategoryRows() {
  return (
    <div className={styles.rows}>
      {categories.map((category) => {
        const collection = getStories(category.storyIds);
        return (
          <section key={category.id} className={styles.row}>
            <div className={styles.rowHeader}>
              <h2>{category.title}</h2>
              <button>View more ?</button>
            </div>
            <div className={styles.scroller}>
              {collection.map((story) => (
                <Link key={story.id} href={`/stories/${story.id}`} className={styles.card}>
                  <img src={story.coverImageUrl} alt={story.title} />
                  <div className={styles.cardBody}>
                    <p className={styles.cardTitle}>{story.title}</p>
                    <span>{story.author}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
