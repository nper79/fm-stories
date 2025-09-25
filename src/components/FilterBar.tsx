import styles from '@/styles/FilterBar.module.css';

interface FilterBarProps {
  filters: string[];
  activeFilter: string;
  onFilterChange: (value: string) => void;
  tags: string[];
  activeTag: string;
  onTagChange: (value: string) => void;
}

export function FilterBar({ filters, activeFilter, onFilterChange, tags, activeTag, onTagChange }: FilterBarProps) {
  return (
    <div className={styles.filters}>
      <div className={styles.section}>
        <div className={styles.label}>Collections</div>
        <div className={styles.group}>
          {filters.map((filter) => (
            <button
              key={filter}
              className={`${styles.btn} ${filter === activeFilter ? styles.active : ''}`}
              onClick={() => onFilterChange(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      
      <div className={styles.section}>
        <div className={styles.label}>Genres</div>
        <div className={styles.group}>
          <button
            className={`${styles.btn} ${activeTag === 'All' ? styles.active : ''}`}
            onClick={() => onTagChange('All')}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              className={`${styles.btn} ${activeTag === tag ? styles.active : ''}`}
              onClick={() => onTagChange(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}