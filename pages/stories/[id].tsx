import { useRouter } from "next/router";
import { AppLayout } from "@/components/Layout";
import { useStory } from "@/hooks/useStories";
import { useEpisodes } from "@/hooks/useEpisodes";
import styles from "@/styles/StoryDetail.module.css";

export default function StoryDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { story, loading: storyLoading, error: storyError } = useStory(id);
  const { episodes: storyEpisodes, loading: episodesLoading } = useEpisodes(id);

  if (storyLoading) {
    return (
      <AppLayout>
        <p>Loading story...</p>
      </AppLayout>
    );
  }

  if (storyError || !story) {
    return (
      <AppLayout>
        <p>Story not found.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <section className={styles.hero}>
        <img className={styles.cover} src={story.coverImageUrl} alt={story.title} />
        <div className={styles.heroBody}>
          <h1>{story.title}</h1>
          <div className={styles.meta}>
            <span>▶ {storyEpisodes.length} Episodes</span>
            <span>UA 16+</span>
            <span>Series</span>
            <span>English</span>
          </div>
          <div className={styles.controls}>
            <button className={styles.playButton}>Play Episode 1</button>
            <button className={styles.secondary}>Save</button>
            <button className={styles.secondary}>Rate</button>
            <button className={styles.secondary}>Share</button>
          </div>
        </div>
      </section>

      <section className={styles.tabs}>
        <button className={styles.tabActive}>About Show</button>
        <button className={styles.tab}>Episodes</button>
        <button className={styles.tab}>Reviews</button>
        <button className={styles.tab}>Related</button>
      </section>

      <section className={styles.description}>
        <p>{story.description}</p>
      </section>

      <section className={styles.episodes}>
        <h2>Episodes</h2>
        <div className={styles.episodeList}>
          {episodesLoading ? (
            <p>Loading episodes...</p>
          ) : (
            storyEpisodes.map((episode) => (
              <article key={episode.id} className={styles.episodeCard}>
                <img src={story.coverImageUrl} alt="Episode cover" />
                <div>
                  <h3>{episode.title}</h3>
                  <p>
                    {episode.duration} · {episode.listens} Listening Now
                  </p>
                </div>
                <button className={styles.playIcon} aria-label="Play episode" />
              </article>
            ))
          )}
        </div>
        <div className={styles.viewMore}>View more ▸</div>
      </section>
    </AppLayout>
  );
}