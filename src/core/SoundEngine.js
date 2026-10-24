import { Audio } from 'expo-av';

export class SoundEngine {
  constructor() {
    this.onSound = null;
    this.offSound = null;
    this.soundsEnabled = true;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Загружаем звуки из assets
      const onSound = new Audio.Sound();
      const offSound = new Audio.Sound();

      await onSound.loadAsync(
        require('../assets/sounds/celestial_on.wav'),
        { isLooping: false }
      );

      await offSound.loadAsync(
        require('../assets/sounds/celestial_off.wav'),
        { isLooping: false }
      );

      this.onSound = onSound;
      this.offSound = offSound;
      this.initialized = true;

      console.log('[SoundEngine] Инициализирован');
    } catch (error) {
      console.warn('[SoundEngine] Ошибка инициализации:', error.message);
      this.initialized = false;
    }
  }

  playOn() {
    if (!this.soundsEnabled || !this.initialized || !this.onSound) return;
    
    this.onSound.replayAsync();
  }

  playOff() {
    if (!this.soundsEnabled || !this.initialized || !this.offSound) return;
    
    this.offSound.replayAsync();
  }

  toggleModule(enabled) {
    if (enabled) {
      this.playOn();
    } else {
      this.playOff();
    }
  }

  setSoundsEnabled(enabled) {
    this.soundsEnabled = enabled;
  }

  async cleanup() {
    if (this.onSound) {
      await this.onSound.unloadAsync();
    }
    if (this.offSound) {
      await this.offSound.unloadAsync();
    }
    this.initialized = false;
  }
}

// Глобальный экземпляр
export const soundEngine = new SoundEngine();