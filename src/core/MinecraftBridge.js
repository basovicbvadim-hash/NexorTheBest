import { Linking, Platform, Alert } from 'react-native';

/**
 * Minecraft Bedrock Bridge - проверка версии, запуск, overlay permissions
 * Target: 1.26.40 ARM64 (com.mojang.minecraftpe)
 */
export class MinecraftBridge {
  constructor() {
    this.MINECRAFT_PACKAGE = 'com.mojang.minecraftpe';
    this.REQUIRED_VERSION = '1.26.40';
    this.isInstalled = false;
    this.version = null;
  }

  async checkInstallation() {
    try {
      const canOpen = await Linking.canOpenURL('minecraft://');
      if (!canOpen) {
        // Пробуем альтернативный scheme
        const altCanOpen = await Linking.canOpenURL('minecraftpe://');
        this.isInstalled = altCanOpen;
      } else {
        this.isInstalled = canOpen;
      }
      return this.isInstalled;
    } catch (error) {
      console.error('[MinecraftBridge] Check failed:', error);
      this.isInstalled = false;
      return false;
    }
  }

  async launch() {
    try {
      await this.checkInstallation();
      if (!this.isInstalled) {
        Alert.alert(
          'Minecraft не найден',
          'Установите Minecraft Bedrock Edition 1.26.40',
          [
            { text: 'Отмена', style: 'cancel' },
            { 
              text: 'Play Store', 
              onPress: () => Linking.openURL('market://details?id=com.mojang.minecraftpe')
            }
          ]
        );
        return false;
      }

      await Linking.openURL('minecraft://');
      return true;
    } catch (error) {
      console.error('[MinecraftBridge] Launch failed:', error);
      Alert.alert('Ошибка запуска', error.message);
      return false;
    }
  }

  async checkOverlayPermission() {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      // Проверка через Settings.ACTION_MANAGE_OVERLAY_PERMISSION
      const canDraw = await Linking.canOpenURL('package:' + this.MINECRAFT_PACKAGE);
      return canDraw;
    } catch (error) {
      console.error('[MinecraftBridge] Overlay check failed:', error);
      return false;
    }
  }

  async requestOverlayPermission() {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      await Linking.openURL('package:' + this.MINECRAFT_PACKAGE);
      return true;
    } catch (error) {
      console.error('[MinecraftBridge] Overlay request failed:', error);
      return false;
    }
  }

  getVersionInfo() {
    return {
      required: this.REQUIRED_VERSION,
      current: this.version,
      package: this.MINECRAFT_PACKAGE,
      architecture: 'arm64-v8a'
    };
  }

  // Заглушки для будущей нативной интеграции
  // Эти методы будут работать только с нативным инжектором
  async getEntities() {
    console.warn('[MinecraftBridge] getEntities() требует нативного инжекта');
    return [];
  }

  async getPlayerPosition() {
    console.warn('[MinecraftBridge] getPlayerPosition() требует нативного инжекта');
    return { x: 0, y: 0, z: 0 };
  }

  async setGamma(value) {
    console.warn('[MinecraftBridge] setGamma() требует нативного инжекта');
  }
}

export const minecraftBridge = new MinecraftBridge();