import Link from 'next/link';
import styles from '@/styles/DiscoverHero.module.css';
import { stories } from '@/data/mockContent';

const featured = stories[0];

export function DiscoverHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1>{featured.title}</h1>
        <p>{featured.description}</p>
        <div className={styles.meta}>
          <span>{featured.tags.join(' • ')}</span>
          <span>{featured.durationMinutes} min</span>
        </div>
        <div className={styles.actions}>
          <Link href={`/stories/${featured.id}`} className={`${styles.btn} ${styles.btnPrimary}`}>
            Start Listening
          </Link>
          <button className={`${styles.btn} ${styles.btnSecondary}`}>
            Add to Library
          </button>
        </div>
      </div>
      <div className={styles.artwork}>
        <img src={featured.coverImageUrl} alt={featured.title} />
      </div>
    </section>
  );
}