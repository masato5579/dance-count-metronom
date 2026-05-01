'use client';

import styles from './PlaybackControls.module.css';

interface Props {
  isPlaying: boolean;
  isLoading: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
}

export default function PlaybackControls({ isPlaying, isLoading, onTogglePlay, onReset }: Props) {
  return (
    <div className={styles.container}>
      <button
        id="play-toggle"
        className={`${styles.playBtn} ${isPlaying ? styles.playing : ''}`}
        onClick={onTogglePlay}
        disabled={isLoading}
        type="button"
      >
        <span className={styles.icon}>{isPlaying ? '⏸' : '▶'}</span>
        <span>{isPlaying ? 'Stop' : 'Start'}</span>
      </button>
      <button
        id="reset-btn"
        className={styles.resetBtn}
        onClick={onReset}
        type="button"
      >
        <span className={styles.icon}>↺</span>
        <span>Reset</span>
      </button>
    </div>
  );
}
