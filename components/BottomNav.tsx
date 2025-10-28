import React from 'react';
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
  onClick: (screen: Screen) => void;
}> = ({ label, screen, icon, isActive, onClick }) => {
  return (
    <button
      onClick={() => onClick(screen)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
        isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-300'
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
      {isActive && <div className="w-8 h-1 bg-cyan-400 rounded-full mt-1"></div>}
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  return (
    <nav className="flex justify-around items-start border-t border-slate-700/50">
      <NavItem
        label="Dashboard"
        screen="dashboard"
        icon={<DashboardIcon className="w-6 h-6" />}
        isActive={activeScreen === 'dashboard'}
        onClick={setActiveScreen}
      />
      <NavItem
        label="Scan"
        screen="scan"
        icon={<ScanIcon className="w-6 h-6" />}
        isActive={activeScreen === 'scan'}
        onClick={setActiveScreen}
      />
      <NavItem
        label="History"
        screen="history"
        icon={<HistoryIcon className="w-6 h-6" />}
        isActive={activeScreen === 'history'}
        onClick={setActiveScreen}
      />
    </nav>
  );
};

export default BottomNav;
