import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import type { IOPReading, ConnectionStatus } from '../types';
import { RiskLevel } from '../types';
import { NORMAL_IOP_RANGE, MODERATE_RISK_THRESHOLD, HIGH_RISK_THRESHOLD } from '../constants';
import { WifiIcon } from './icons/WifiIcon';
import { BatteryIcon } from './icons/BatteryIcon';
import { BluetoothIcon } from './icons/BluetoothIcon';

interface DashboardProps {
  readings: IOPReading[];
  connectionStatus: ConnectionStatus;
  onManageConnection: () => void;
}

const getRiskLevel = (value: number): RiskLevel => {
  if (value >= HIGH_RISK_THRESHOLD) return RiskLevel.High;
  if (value >= MODERATE_RISK_THRESHOLD) return RiskLevel.Moderate;
  return RiskLevel.Low;
};

const getRiskColor = (level: RiskLevel): string => {
  switch (level) {
    case RiskLevel.High:
      return '#ef4444';
    case RiskLevel.Moderate:
      return '#facc15';
    case RiskLevel.Low:
      return '#4ade80';
    default:
      return '#94a3b8';
  }
};

const screenWidth = Dimensions.get('window').width;

const Dashboard: React.FC<DashboardProps> = ({ readings, connectionStatus, onManageConnection }) => {
  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;
  const riskLevel = latestReading ? getRiskLevel(latestReading.value) : RiskLevel.Low;

  const last7 = readings.slice(-7);
  const chartLabels = last7.map((r) =>
    r.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );
  const chartValues = last7.map((r) => r.value);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Device Status Card */}
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <View>
            <Text style={styles.cardTitle}>EyeSee Monitor</Text>
            <Text style={[styles.statusText, connectionStatus.isConnected ? styles.connected : styles.disconnected]}>
              {connectionStatus.isConnected ? `Connected via ${connectionStatus.type}` : 'Disconnected'}
            </Text>
          </View>
          <View style={styles.iconRow}>
            {connectionStatus.isConnected && connectionStatus.type === 'WiFi' && (
              <WifiIcon width={24} height={24} color="#22d3ee" />
            )}
            {connectionStatus.isConnected && connectionStatus.type === 'Bluetooth' && (
              <BluetoothIcon width={24} height={24} color="#22d3ee" />
            )}
            <BatteryIcon width={24} height={24} color="#22d3ee" charge={90} />
          </View>
        </View>
        <TouchableOpacity style={styles.manageButton} onPress={onManageConnection} activeOpacity={0.7}>
          <Text style={styles.manageButtonText}>Manage Connection</Text>
        </TouchableOpacity>
      </View>

      {/* Main Reading Card */}
      <View style={styles.readingCard}>
        <Text style={styles.readingLabel}>Last Reading (IOP)</Text>
        <View style={styles.readingRow}>
          <Text style={styles.readingValue}>{latestReading ? latestReading.value.toFixed(1) : '--'}</Text>
          <Text style={styles.readingUnit}>mmHg</Text>
        </View>
        <Text style={[styles.riskText, { color: getRiskColor(riskLevel) }]}>{riskLevel} Risk</Text>
        <Text style={styles.readingDate}>
          {latestReading ? `Recorded on ${latestReading.date.toLocaleDateString()}` : 'No readings yet'}
        </Text>
      </View>

      {/* Trend Graph Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>7-Day Trend</Text>
        {chartValues.length > 0 ? (
          <LineChart
            data={{
              labels: chartLabels,
              datasets: [{ data: chartValues }],
            }}
            width={screenWidth - 64}
            height={200}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: '#1e293b',
              backgroundGradientTo: '#1e293b',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 191, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#06b6d4',
              },
              fillShadowGradientFrom: '#00BFFF',
              fillShadowGradientFromOpacity: 0.5,
              fillShadowGradientTo: '#00BFFF',
              fillShadowGradientToOpacity: 0,
              propsForBackgroundLines: {
                strokeDasharray: '3 3',
                stroke: '#334155',
              },
            }}
            bezier
            style={styles.chart}
            withInnerLines
            withOuterLines={false}
          />
        ) : (
          <Text style={styles.noDataText}>No data yet</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 16,
    gap: 24,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#67e8f9',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
  },
  connected: {
    color: '#4ade80',
  },
  disconnected: {
    color: '#94a3b8',
  },
  iconRow: {
    flexDirection: 'row',
    gap: 12,
  },
  manageButton: {
    marginTop: 16,
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#67e8f9',
    fontWeight: '600',
  },
  readingCard: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  readingLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 8,
  },
  readingValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#67e8f9',
  },
  readingUnit: {
    fontSize: 20,
    color: '#94a3b8',
    marginLeft: 8,
  },
  riskText: {
    fontWeight: '600',
    fontSize: 18,
  },
  readingDate: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 8,
  },
  chart: {
    borderRadius: 16,
    marginTop: 8,
  },
  noDataText: {
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 40,
  },
});

export default Dashboard;
