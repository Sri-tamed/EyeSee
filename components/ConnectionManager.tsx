import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import type { ConnectionStatus, ConnectionType } from '../types';
import { WifiIcon } from './icons/WifiIcon';
import { BluetoothIcon } from './icons/BluetoothIcon';

interface ConnectionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (type: ConnectionType) => void;
  onDisconnect: () => void;
  currentStatus: ConnectionStatus;
}

type Tab = 'WiFi' | 'Bluetooth';

const ConnectionManager: React.FC<ConnectionManagerProps> = ({
  isOpen,
  onClose,
  onConnect,
  onDisconnect,
  currentStatus,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('WiFi');
  const [isScanning, setIsScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setIsScanning(false);
      setFoundDevices([]);
      setActiveTab(currentStatus.type === 'Bluetooth' ? 'Bluetooth' : 'WiFi');
    }
  }, [isOpen, currentStatus.type]);

  const handleScan = () => {
    setIsScanning(true);
    setFoundDevices([]);
    setTimeout(() => {
      const devices =
        activeTab === 'WiFi'
          ? ['EyeSee-WiFi-A5B2', 'EyeSee-WiFi-F9C1', 'MyHome-WiFi-Eyesee']
          : ['EyeSee-BLE-9C3F', 'EyeSee-BLE-1A0D'];
      setFoundDevices(devices);
      setIsScanning(false);
    }, 2500);
  };

  const handleConnect = () => {
    onConnect(activeTab);
    setFoundDevices([]);
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.modal} activeOpacity={1} onPress={() => {}}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Device Connection</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>&times;</Text>
            </TouchableOpacity>
          </View>

          {/* Connection Status */}
          <View style={styles.section}>
            {currentStatus.isConnected ? (
              <View style={styles.connectedSection}>
                <Text style={styles.connectedText}>Connected via {currentStatus.type}</Text>
                <TouchableOpacity style={styles.disconnectButton} onPress={onDisconnect} activeOpacity={0.7}>
                  <Text style={styles.disconnectButtonText}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.disconnectedText}>Not connected. Scan for a device below.</Text>
            )}
          </View>

          {/* Tabs */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'WiFi' && styles.tabActive]}
              onPress={() => {
                setActiveTab('WiFi');
                setFoundDevices([]);
                setIsScanning(false);
              }}
            >
              <WifiIcon width={20} height={20} color={activeTab === 'WiFi' ? '#22d3ee' : '#94a3b8'} />
              <Text style={[styles.tabText, activeTab === 'WiFi' && styles.tabTextActive]}>WiFi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'Bluetooth' && styles.tabActive]}
              onPress={() => {
                setActiveTab('Bluetooth');
                setFoundDevices([]);
                setIsScanning(false);
              }}
            >
              <BluetoothIcon width={20} height={20} color={activeTab === 'Bluetooth' ? '#22d3ee' : '#94a3b8'} />
              <Text style={[styles.tabText, activeTab === 'Bluetooth' && styles.tabTextActive]}>Bluetooth</Text>
            </TouchableOpacity>
          </View>

          {/* Scan Content */}
          <View style={styles.scanSection}>
            <TouchableOpacity
              style={[styles.scanButton, isScanning && styles.buttonDisabled]}
              onPress={handleScan}
              disabled={isScanning}
              activeOpacity={0.7}
            >
              <Text style={[styles.scanButtonText, isScanning && styles.buttonTextDisabled]}>
                {isScanning ? 'Scanning...' : `Scan for ${activeTab} Devices`}
              </Text>
            </TouchableOpacity>

            <ScrollView style={styles.deviceList}>
              {isScanning ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#22d3ee" />
                  <Text style={styles.loadingText}>Searching for devices...</Text>
                </View>
              ) : foundDevices.length > 0 ? (
                foundDevices.map((device) => (
                  <View key={device} style={styles.deviceItem}>
                    <Text style={styles.deviceName}>{device}</Text>
                    <TouchableOpacity style={styles.connectButton} onPress={handleConnect} activeOpacity={0.7}>
                      <Text style={styles.connectButtonText}>Connect</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No devices found.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#67e8f9',
  },
  closeButton: {
    fontSize: 28,
    color: '#94a3b8',
    lineHeight: 28,
  },
  section: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  connectedSection: {
    alignItems: 'center',
  },
  connectedText: {
    color: '#4ade80',
    fontSize: 16,
  },
  disconnectButton: {
    marginTop: 12,
    width: '100%',
    paddingVertical: 10,
    backgroundColor: 'rgba(220, 38, 38, 0.8)',
    borderRadius: 999,
    alignItems: 'center',
  },
  disconnectButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  disconnectedText: {
    color: '#94a3b8',
    textAlign: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#334155',
    gap: 8,
  },
  tabActive: {
    borderBottomColor: '#22d3ee',
  },
  tabText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#22d3ee',
  },
  scanSection: {
    padding: 24,
    height: 256,
  },
  scanButton: {
    width: '100%',
    paddingVertical: 10,
    backgroundColor: '#06b6d4',
    borderRadius: 999,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#0f172a',
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#475569',
  },
  buttonTextDisabled: {
    color: '#94a3b8',
  },
  deviceList: {
    flex: 1,
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 40,
  },
  loadingText: {
    color: '#94a3b8',
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  deviceName: {
    color: '#ffffff',
    fontWeight: '500',
  },
  connectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#22c55e',
    borderRadius: 999,
  },
  connectButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: '#64748b',
  },
});

export default ConnectionManager;
