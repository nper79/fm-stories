import Link from 'next/link';
import styles from '@/styles/HeroCarousel.module.css';
import { stories } from '@/data/mockContent';

const featured = stories.slice(0, 4);

export function HeroCarousel() {
  return (
    <section className={styles.carousel}>
      {featured.map((story, index) => (
        <article
          key={story.id}
          className={styles.slide}
          style={{ animationDelay: `${index * 2}s` }}
        >
          <div
            className={styles.backdrop}
            style={{ backgroundImage: `url(${story.coverImageUrl})` }}
          />
          <div className={styles.overlay}>
            <span className={styles.badge}>Exclusive</span>
            <h1>{story.title}</h1>
            <p>{story.description}</p>
            <div className={styles.actions}>
              <Link href={`/stories/${story.id}`} className={styles.playButton}>
                ? Play Episode 1
              </Link>
              <button className={styles.secondaryButton}>Save</button>
              <button className={styles.secondaryButton}>Share</button>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
