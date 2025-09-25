import { Story } from '@/types/index';
import styles from '@/styles/AudioPlayer.module.css';
import { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  story: Story | null;
}

export function AudioPlayer({ story }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }
    const handleTimeUpdate = () => {
      const element = audioRef.current;
      if (!element) {
        return;
      }
      setProgress((element.currentTime / element.duration) * 100);
    };

    const audioElement = audioRef.current;
    audioElement.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [story?.id]);

  if (!story) {
    return (
      <section className={styles.placeholder}>
        <p>Select a story to start listening.</p>
      </section>
    );
  }

  return (
    <section className={styles.player}>
      <div className={styles.info}>
        <img className={styles.cover} src={story.coverImageUrl} alt={story.title} />
        <div>
          <h3>{story.title}</h3>
          <p>{story.author}</p>
          <div className={styles.progressBarWrapper}>
            <div className={styles.progressBar} style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
      <audio ref={audioRef} className={styles.audio} src={story.audioUrl} controls autoPlay />
    </section>
  );
}
