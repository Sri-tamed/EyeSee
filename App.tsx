import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { IOPReading, Screen, ConnectionStatus, ConnectionType } from './types';
import { initialReadings } from './constants';

import Dashboard from './components/Dashboard';
import EyeScan from './components/EyeScan';
import History from './components/History';
import BottomNav from './components/BottomNav';
import { EyeIcon } from './components/icons/EyeIcon';
import ConnectionManager from './components/ConnectionManager';
import IrisBackground from './components/IrisBackground';
import Onboarding from './components/Onboarding';

const App: React.FC = () => {
  const [readings, setReadings] = useState<IOPReading[]>(initialReadings);
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: true,
    type: 'WiFi',
  });
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    };
    checkOnboarding();
  }, []);

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  const addReading = useCallback((newValue: number) => {
    const newReading: IOPReading = {
      date: new Date(),
      value: newValue,
    };
    setReadings((prevReadings) => [...prevReadings, newReading]);
    setActiveScreen('dashboard');
  }, []);

  const handleConnect = (type: ConnectionType) => {
    setConnectionStatus({ isConnected: true, type });
    setIsConnectionModalOpen(false);
  };

  const handleDisconnect = () => {
    setConnectionStatus({ isConnected: false, type: 'None' });
    setIsConnectionModalOpen(false);
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'scan':
        return <EyeScan onSave={addReading} />;
      case 'history':
        return <History readings={readings} />;
      case 'dashboard':
      default:
        return (
          <Dashboard
            readings={readings}
            connectionStatus={connectionStatus}
            onManageConnection={() => setIsConnectionModalOpen(true)}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="light" />
        <IrisBackground />
        <View style={styles.overlay} />
        <SafeAreaView style={styles.content} edges={['top']}>
          <View style={styles.header}>
            <EyeIcon width={32} height={32} color="#67e8f9" />
            <Text style={styles.headerTitle}>EyeSee</Text>
          </View>
          <View style={styles.main}>{renderScreen()}</View>
          <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
        </SafeAreaView>
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
        {isConnectionModalOpen && (
          <ConnectionManager
            isOpen={isConnectionModalOpen}
            onClose={() => setIsConnectionModalOpen(false)}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            currentStatus={connectionStatus}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#67e8f9',
  },
  main: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default App;
