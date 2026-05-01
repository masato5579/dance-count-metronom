'use client';

import styles from './BpmControl.module.css';

interface Props {
  bpm: number;
  onBpmChange: (bpm: number) => void;
}

export default function BpmControl({ bpm, onBpmChange }: Props) {
  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor="bpm-input">BPM</label>
      <div className={styles.controls}>
        <input
          id="bpm-input"
          type="number"
          className={styles.numberInput}
          value={bpm}
          min={60}
          max={200}
          onChange={(e) => onBpmChange(Number(e.target.value))}
        />
        <input
          id="bpm-slider"
          type="range"
          className={styles.slider}
          value={bpm}
          min={60}
          max={200}
          step={1}
          onChange={(e) => onBpmChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
