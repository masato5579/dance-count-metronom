export type VoiceType = 'male' | 'female';

const SOUND_NAMES = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'and'] as const;
export type SoundName = (typeof SOUND_NAMES)[number];

export const COUNT_SOUNDS: SoundName[] = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

export class AudioEngine {
  private context: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private loadedVoice: VoiceType | null = null;

  getContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
    }
    return this.context;
  }

  async resume(): Promise<void> {
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  getCurrentTime(): number {
    return this.getContext().currentTime;
  }

  getSampleRate(): number {
    return this.getContext().sampleRate;
  }

  async loadSounds(voice: VoiceType): Promise<void> {
    if (this.loadedVoice === voice && this.buffers.size > 0) {
      return; // Already loaded
    }

    const ctx = this.getContext();
    this.buffers.clear();

    const loadPromises = SOUND_NAMES.map(async (name) => {
      const url = `/sounds/${voice}/${name}.mp3`;
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.buffers.set(name, audioBuffer);
    });

    await Promise.all(loadPromises);
    this.loadedVoice = voice;
  }

  getBuffer(name: SoundName): AudioBuffer | null {
    return this.buffers.get(name) ?? null;
  }

  playSound(name: SoundName, time: number): void {
    const buffer = this.buffers.get(name);
    if (!buffer) return;

    const ctx = this.getContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(time);
  }
}

// Singleton
export const audioEngine = new AudioEngine();
