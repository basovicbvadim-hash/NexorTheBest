import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Modal,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'combat', name: 'Combat', icon: '⚔️' },
  { id: 'movement', name: 'Movement', icon: '🏃' },
  { id: 'visual', name: 'Visuals', icon: '👁️' },
  { id: 'player', name: 'Player', icon: '👤' },
  { id: 'other', name: 'Other', icon: '⚙️' },
];

const MODULES = {
  combat: [
    { id: 'aura', name: 'Aura', status: 'needs_inject' },
    { id: 'autoclicker', name: 'AutoClicker', status: 'needs_inject' },
    { id: 'hitbox', name: 'Hitbox', status: 'needs_inject' },
  ],
  movement: [
    { id: 'speed', name: 'Speed', status: 'needs_inject' },
    { id: 'antibot', name: 'AntiBot', status: 'needs_inject' },
    { id: 'velocity', name: 'Velocity', status: 'needs_inject' },
    { id: 'nojumpdelay', name: 'NoJumpDelay', status: 'needs_inject' },
    { id: 'jetpack', name: 'JetPack', status: 'needs_inject' },
    { id: 'noslowdown', name: 'NoSlowDown', status: 'needs_inject' },
    { id: 'spider', name: 'Spider', status: 'needs_inject' },
    { id: 'phase', name: 'Phase', status: 'needs_inject' },
  ],
  visual: [
    { id: 'esp', name: 'ESP', status: 'needs_inject' },
    { id: 'itemesp', name: 'ItemESP', status: 'needs_inject' },
    { id: 'fullbright', name: 'Fullbright', status: 'needs_inject' },
    { id: 'targetesp', name: 'TargetESP', status: 'needs_inject' },
    { id: 'ambience', name: 'Ambience', status: 'needs_inject' },
    { id: 'nameprotect', name: 'NameProtect', status: 'needs_inject' },
  ],
  player: [
    { id: 'itemphysics', name: 'ItemPhysics', status: 'needs_inject' },
  ],
  other: [],
};

const UI_MODULES = [
  { id: 'clickgui', name: 'ClickGUI', status: 'implemented' },
  { id: 'watermark', name: 'Watermark', status: 'implemented' },
  { id: 'arraylist', name: 'ArrayList', status: 'implemented' },
  { id: 'togglesounds', name: 'ToggleSounds', status: 'implemented' },
];

export default function NexorMenu({ visible, onClose, onModuleToggle, soundsEnabled, onToggleSounds, modulesState }) {
  const [activeCategory, setActiveCategory] = useState('combat');
  const [localModules, setLocalModules] = useState({});
  const [localUiModules, setLocalUiModules] = useState([]);

  useEffect(() => {
    if (visible) {
      // Инициализация состояния модулей при открытии меню
      const initModules = {};
      CATEGORIES.forEach(cat => {
        initModules[cat.id] = MODULES[cat.id].map(m => ({
          ...m,
          enabled: modulesState?.[m.id] || false,
        }));
      });
      setLocalModules(initModules);

      const initUi = UI_MODULES.map(m => ({
        ...m,
        enabled: modulesState?.[m.id] || false,
      }));
      setLocalUiModules(initUi);
    }
  }, [visible, modulesState]);

  const handleToggle = (moduleId, category) => {
    if (category === 'ui') {
      // Специальная обработка ToggleSounds
      if (moduleId === 'togglesounds') {
        onToggleSounds?.(!soundsEnabled);
      }

      const updated = localUiModules.map((m) =>
        m.id === moduleId ? { ...m, enabled: !m.enabled } : m
      );
      setLocalUiModules(updated);
      onModuleToggle?.(moduleId, !updated.find((m) => m.id === moduleId)?.enabled);
    } else {
      const updated = {
        ...localModules,
        [category]: localModules[category].map((m) =>
          m.id === moduleId ? { ...m, enabled: !m.enabled } : m
        ),
      };
      setLocalModules(updated);
      onModuleToggle?.(moduleId, !updated[category].find((m) => m.id === moduleId)?.enabled);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'implemented':
        return '#4ade80';
      case 'needs_inject':
        return '#f59e0b';
      case 'unavailable':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'implemented':
        return '';
      case 'needs_inject':
        return 'Требует инжекта';
      case 'unavailable':
        return 'Недоступно';
      default:
        return '';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.menuContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoSection}>
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>N</Text>
              </View>
              <Text style={styles.menuTitle}>NexorClient</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Category tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryTab,
                  activeCategory === cat.id && styles.categoryTabActive,
                ]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    activeCategory === cat.id && styles.categoryTabTextActive,
                  ]}
                >
                  {cat.icon} {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Module list */}
          <ScrollView style={styles.moduleList}>
            {activeCategory === 'other' ? (
              localUiModules.map((module) => (
                <View key={module.id} style={styles.moduleRow}>
                  <View style={styles.moduleInfo}>
                    <Text style={styles.moduleName}>{module.name}</Text>
                    {getStatusText(module.status) !== '' && (
                      <Text style={[styles.moduleStatus, { color: getStatusColor(module.status) }]}>
                        {getStatusText(module.status)}
                      </Text>
                    )}
                  </View>
                  <Switch
                    value={module.enabled}
                    onValueChange={() => handleToggle(module.id, 'ui')}
                    trackColor={{ false: '#334155', true: '#4ade80' }}
                    thumbColor="#f0f9ff"
                  />
                </View>
              ))
            ) : (
              localModules[activeCategory]?.map((module) => (
                <View key={module.id} style={styles.moduleRow}>
                  <View style={styles.moduleInfo}>
                    <Text style={styles.moduleName}>{module.name}</Text>
                    {getStatusText(module.status) !== '' && (
                      <Text style={[styles.moduleStatus, { color: getStatusColor(module.status) }]}>
                        {getStatusText(module.status)}
                      </Text>
                    )}
                  </View>
                  <Switch
                    value={module.enabled}
                    onValueChange={() => handleToggle(module.id, activeCategory)}
                    trackColor={{ false: '#334155', true: '#4ade80' }}
                    thumbColor="#f0f9ff"
                  />
                </View>
              ))
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>v1.0.0 • Bedrock 1.26.40</Text>
            <Text style={styles.footerSubtext}>
              {soundsEnabled ? '🔊 Звуки включены' : '🔇 Звуки выключены'}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: width * 0.95,
    height: height * 0.85,
    backgroundColor: '#0a0e14',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3b82f6',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#60a5fa',
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f0f9ff',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#f0f9ff',
    fontWeight: 'bold',
  },
  categoryScroll: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  categoryTabActive: {
    borderBottomColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  categoryTabText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTabTextActive: {
    color: '#60a5fa',
  },
  moduleList: {
    flex: 1,
    padding: 16,
  },
  moduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    color: '#f0f9ff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  moduleStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: '#64748b',
    fontSize: 12,
  },
  footerSubtext: {
    color: '#94a3b8',
    fontSize: 11,
  },
});