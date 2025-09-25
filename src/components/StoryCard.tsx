import styles from '@/styles/StoryCard.module.css';
import { Story } from '@/types/index';

interface StoryCardProps {
  story: Story;
  onPlay: (story: Story) => void;
  isLocked: boolean;
}

export function StoryCard({ story, onPlay, isLocked }: StoryCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.coverWrapper}>
        <img className={styles.cover} src={story.coverImageUrl} alt={story.title} />
        {isLocked && <span className={styles.locked}>Premium</span>}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{story.title}</h3>
        <p className={styles.author}>by {story.author}</p>
        <p className={styles.description}>{story.description}</p>
        <div className={styles.meta}>
          <span>{story.durationMinutes} min</span>
          <div className={styles.tags}>
            {story.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <button className={styles.playButton} onClick={() => onPlay(story)} disabled={isLocked}>
          {isLocked ? 'Subscribe to listen' : 'Play'}
        </button>
      </div>
    </article>
  );
}
