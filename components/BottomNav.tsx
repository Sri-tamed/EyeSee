import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Screen } from '../types';
import { DashboardIcon } from './icons/DashboardIcon';
import { ScanIcon } from './icons/ScanIcon';
import { HistoryIcon } from './icons/HistoryIcon';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

const NavItem: React.FC<{
  label: string;
  screen: Screen;
  icon: React.ReactNode;
  isActive: boolean;
  onPress: (screen: Screen) => void;
}> = ({ label, screen, icon, isActive, onPress }) => {
  return (
    <TouchableOpacity style={styles.navItem} onPress={() => onPress(screen)} activeOpacity={0.7}>
      {icon}
      <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{label}</Text>
      {isActive && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  return (
    <View style={styles.nav}>
      <NavItem
        label="Dashboard"
        screen="dashboard"
        icon={<DashboardIcon width={24} height={24} color={activeScreen === 'dashboard' ? '#22d3ee' : '#94a3b8'} />}
        isActive={activeScreen === 'dashboard'}
        onPress={setActiveScreen}
      />
      <NavItem
        label="Scan"
        screen="scan"
        icon={<ScanIcon width={24} height={24} color={activeScreen === 'scan' ? '#22d3ee' : '#94a3b8'} />}
        isActive={activeScreen === 'scan'}
        onPress={setActiveScreen}
      />
      <NavItem
        label="History"
        screen="history"
        icon={<HistoryIcon width={24} height={24} color={activeScreen === 'history' ? '#22d3ee' : '#94a3b8'} />}
        isActive={activeScreen === 'history'}
        onPress={setActiveScreen}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingBottom: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#94a3b8',
  },
  navLabelActive: {
    color: '#22d3ee',
  },
  activeIndicator: {
    width: 32,
    height: 4,
    backgroundColor: '#22d3ee',
    borderRadius: 2,
    marginTop: 4,
  },
});

export default BottomNav;
