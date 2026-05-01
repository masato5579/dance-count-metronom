'use client';

import { useMetronome } from '@/hooks/useMetronome';
import CountDisplay from './CountDisplay';
import BpmControl from './BpmControl';
import VoiceSelect from './VoiceSelect';
import PlaybackControls from './PlaybackControls';
import styles from './Metronome.module.css';

export default function Metronome() {
  const [state, actions] = useMetronome();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <CountDisplay
          currentCount={state.currentCount}
          isPlaying={state.isPlaying}
        />

        <div className={styles.divider} />

        <BpmControl bpm={state.bpm} onBpmChange={actions.setBpm} />

        <div className={styles.options}>
          <VoiceSelect voice={state.voice} onVoiceChange={actions.setVoice} />

          <label className={styles.andToggle} htmlFor="with-and-toggle">
            <input
              id="with-and-toggle"
              type="checkbox"
              checked={state.withAnd}
              onChange={(e) => actions.setWithAnd(e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.checkboxCustom} />
            <span className={styles.andLabel}>With &quot;And&quot;</span>
          </label>
        </div>

        <PlaybackControls
          isPlaying={state.isPlaying}
          isLoading={state.isLoading}
          onTogglePlay={actions.togglePlay}
          onReset={actions.reset}
        />
      </div>
    </div>
  );
}
