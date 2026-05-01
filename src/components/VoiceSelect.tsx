'use client';

import { VoiceType } from '@/lib/audioEngine';
import styles from './VoiceSelect.module.css';

interface Props {
  voice: VoiceType;
  onVoiceChange: (voice: VoiceType) => void;
}

export default function VoiceSelect({ voice, onVoiceChange }: Props) {
  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor="voice-select">Voice</label>
      <div className={styles.toggleGroup}>
        <button
          id="voice-male"
          className={`${styles.toggleBtn} ${voice === 'male' ? styles.active : ''}`}
          onClick={() => onVoiceChange('male')}
          type="button"
        >
          Male
        </button>
        <button
          id="voice-female"
          className={`${styles.toggleBtn} ${voice === 'female' ? styles.active : ''}`}
          onClick={() => onVoiceChange('female')}
          type="button"
        >
          Female
        </button>
      </div>
    </div>
  );
}
