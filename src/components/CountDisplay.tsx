'use client';

import styles from './CountDisplay.module.css';

interface Props {
  currentCount: number; // 0-7
  isPlaying: boolean;
}

const COUNT_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export default function CountDisplay({ currentCount, isPlaying }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.dots}>
        {COUNT_LABELS.map((label, i) => (
          <div
            key={i}
            className={`${styles.dot} ${i === currentCount && isPlaying ? styles.active : ''}`}
          >
            <span className={styles.dotLabel}>{label}</span>
          </div>
        ))}
      </div>
      <div className={styles.countText}>
        {isPlaying ? COUNT_LABELS[currentCount] : '—'}
      </div>
    </div>
  );
}
