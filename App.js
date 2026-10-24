import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, Platform, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NexorMenu from './src/components/NexorMenu';
import { soundEngine } from './src/core/SoundEngine';
import { minecraftBridge } from './src/core/MinecraftBridge';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [overlayPermission, setOverlayPermission] = useState(null);
  const [minecraftInstalled, setMinecraftInstalled] = useState(null);
  const [serviceRunning, setServiceRunning] = useState(false);
  const [floatingButtonHidden, setFloatingButtonHidden] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [modulesState, setModulesState] = useState({});

  useEffect(() => {
    initializeApp();
    return () => {
      soundEngine.cleanup();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Инициализация звукового движка
      await soundEngine.initialize();

      // Загрузка сохранённых настроек
      const savedSounds = await AsyncStorage.getItem('soundsEnabled');
      if (savedSounds !== null) {
        setSoundsEnabled(JSON.parse(savedSounds));
        soundEngine.setSoundsEnabled(JSON.parse(savedSounds));
      }

      const savedModules = await AsyncStorage.getItem('modulesState');
      if (savedModules) {
        setModulesState(JSON.parse(savedModules));
      }

      checkPermissions();
      checkMinecraft();
    } catch (error) {
      console.warn('[App] Ошибка инициализации:', error.message);
    }
  };

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        setOverlayPermission(true);
      } catch (e) {
        setOverlayPermission(false);
      }
    } else {
      setOverlayPermission(true);
    }
  };

const checkMinecraft = async () => {
    try {
      const installed = await minecraftBridge.checkInstallation();
      setMinecraftInstalled(installed);
      
      if (installed) {
        const versionInfo = minecraftBridge.getVersionInfo();
        console.log('[App] Minecraft:', versionInfo);
      } else {
        console.warn('[App] Minecraft не установлен');
      }
    } catch (error) {
      console.warn('[App] Minecraft check failed:', error);
      setMinecraftInstalled(false);
    }
  };

  const handleStart = async () => {
    if (!minecraftInstalled) {
      Alert.alert(
        'Minecraft не найден',
        'Установите Minecraft Bedrock Edition 1.26.40',
        [
          { text: 'OK' },
          { 
            text: 'Play Store', 
            onPress: () => Linking.openURL('market://details?id=com.mojang.minecraftpe')
          }
        ]
      );
      return;
    }
    
    const launched = await minecraftBridge.launch();
    if (launched) {
      setServiceRunning(true);
      Alert.alert('Запуск', 'NexorClient запущен. Нажмите на плавающую кнопку для меню.');
    }
  };

  const handleImportGame = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    } else {
      Alert.alert('Информация', 'Выберите Minecraft в настройках.');
    }
  };

  const handleOverlay = async () => {
    if (Platform.OS === 'android') {
      try {
        await Linking.openURL('android.settings.action.MANAGE_OVERLAY_PERMISSION');
      } catch {
        Alert.alert('Ошибка', 'Не удалось открыть настройки.');
      }
    } else {
      Alert.alert('Информация', 'Доступно только на Android.');
    }
  };

  const handleStop = () => {
    setServiceRunning(false);
    Alert.alert('Остановлено', 'NexorClient остановлен.');
  };

  const handleModuleToggle = async (moduleId, enabled) => {
    // Воспроизведение звука
    soundEngine.toggleModule(enabled);

    // Сохранение состояния
    const newState = {
      ...modulesState,
      [moduleId]: enabled,
    };
    setModulesState(newState);

    try {
      await AsyncStorage.setItem('modulesState', JSON.stringify(newState));
    } catch (error) {
      console.warn('[App] Ошибка сохранения модуля:', error.message);
    }

    console.log(`[App] Модуль ${moduleId}: ${enabled ? 'включён' : 'выключен'}`);
  };

  const handleToggleSounds = async (enabled) => {
    setSoundsEnabled(enabled);
    soundEngine.setSoundsEnabled(enabled);

    try {
      await AsyncStorage.setItem('soundsEnabled', JSON.stringify(enabled));
    } catch (error) {
      console.warn('[App] Ошибка сохранения звуков:', error.message);
    }
  };

  const getStatusColor = () => {
    return serviceRunning ? '#4ade80' : '#ef4444';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>N</Text>
          </View>
          <Text style={styles.title}>NexorClient</Text>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
      </View>

      {/* Main buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.startButton]}
          onPress={handleStart}
          disabled={serviceRunning}
        >
          <Text style={styles.actionButtonText}>Start</Text>
          <Text style={styles.actionButtonSubtext}>Запустить клиент</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.importButton]}
          onPress={handleImportGame}
        >
          <Text style={styles.actionButtonText}>Import Game</Text>
          <Text style={styles.actionButtonSubtext}>Выбрать Minecraft</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.overlayButton]}
          onPress={handleOverlay}
        >
          <Text style={styles.actionButtonText}>Overlay</Text>
          <Text style={styles.actionButtonSubtext}>
            {overlayPermission ? 'Разрешено' : 'Настроить'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.stopButton]}
          onPress={handleStop}
          disabled={!serviceRunning}
        >
          <Text style={styles.actionButtonText}>Stop</Text>
          <Text style={styles.actionButtonSubtext}>Остановить сервис</Text>
        </TouchableOpacity>

        {/* Настройка звуков */}
        <TouchableOpacity
          style={[styles.actionButton, styles.soundsButton(soundsEnabled)]}
          onPress={() => handleToggleSounds(!soundsEnabled)}
        >
          <Text style={styles.actionButtonText}>
            Звуки: {soundsEnabled ? 'ВКЛ' : 'ВЫКЛ'}
          </Text>
          <Text style={styles.actionButtonSubtext}>
            {soundsEnabled ? 'Отключить звуки' : 'Включить звуки'}
          </Text>
        </TouchableOpacity>

        {/* Кнопка скрытия плавающей кнопки */}
        <TouchableOpacity
          style={[styles.actionButton, styles.hideButton]}
          onPress={() => setFloatingButtonHidden(!floatingButtonHidden)}
        >
          <Text style={styles.actionButtonText}>
            {floatingButtonHidden ? 'Показать кнопку' : 'Скрыть кнопку'}
          </Text>
          <Text style={styles.actionButtonSubtext}>
            {floatingButtonHidden ? 'Вернуть плавающую кнопку' : 'Скрыть плавающую кнопку'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info section */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Minecraft:</Text>
          <Text style={[styles.infoValue, minecraftInstalled ? styles.infoOk : styles.infoError]}>
            {minecraftInstalled ? 'Установлен' : 'Не найден'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Overlay:</Text>
          <Text style={[styles.infoValue, overlayPermission ? styles.infoOk : styles.infoError]}>
            {overlayPermission ? 'Разрешён' : 'Требуется'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Сервис:</Text>
          <Text style={[styles.infoValue, serviceRunning ? styles.infoOk : styles.infoError]}>
            {serviceRunning ? 'Активен' : 'Остановлен'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Звуки:</Text>
          <Text style={[styles.infoValue, soundsEnabled ? styles.infoOk : styles.infoError]}>
            {soundsEnabled ? 'Включены' : 'Выключены'}
          </Text>
        </View>
      </View>

      {/* Плавающая кнопка (эмуляция для web preview) */}
      {!floatingButtonHidden && serviceRunning && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setMenuVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.fabGlow} />
          <View style={styles.fabInner}>
            <Text style={styles.fabText}>N</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Меню NexorClient */}
      <NexorMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onModuleToggle={handleModuleToggle}
        soundsEnabled={soundsEnabled}
        onToggleSounds={handleToggleSounds}
        modulesState={modulesState}
      />

      {/* Footer */}
      <Text style={styles.footer}>v1.0.0 • Bedrock 1.26.40</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e14',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#60a5fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f0f9ff',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  startButton: {
    borderColor: '#4ade80',
    backgroundColor: '#064e3b',
  },
  importButton: {
    borderColor: '#60a5fa',
  },
  overlayButton: {
    borderColor: '#a78bfa',
  },
  stopButton: {
    borderColor: '#ef4444',
    backgroundColor: '#450a0a',
  },
  soundsButton: (enabled) => ({
    borderColor: enabled ? '#4ade80' : '#ef4444',
  }),
  hideButton: {
    borderColor: '#f59e0b',
  },
  actionButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f0f9ff',
    marginBottom: 4,
  },
  actionButtonSubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  infoContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#94a3b8',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoOk: {
    color: '#4ade80',
  },
  infoError: {
    color: '#ef4444',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    width: 64,
    height: 64,
  },
  fabGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  fabInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
    alignSelf: 'center',
    marginTop: 2,
  },
  fabText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#60a5fa',
  },
  footer: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 12,
    marginTop: 'auto',
    marginBottom: 24,
  },
});