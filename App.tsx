import React, { useState, useCallback } from 'react';
import type { IOPReading, Screen, ConnectionStatus, ConnectionType } from './types';
import { initialReadings } from './constants';

import Dashboard from './components/Dashboard';
import EyeScan from './components/EyeScan';
import History from './components/History';
import BottomNav from './components/BottomNav';
import { EyeIcon } from './components/icons/EyeIcon';
import ConnectionManager from './components/ConnectionManager';
import IrisBackground from './components/IrisBackground';

const App: React.FC = () => {
  const [readings, setReadings] = useState<IOPReading[]>(initialReadings);
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ isConnected: true, type: 'WiFi' });
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);


  const addReading = useCallback((newValue: number) => {
    const newReading: IOPReading = {
      date: new Date(),
      value: newValue,
    };
    setReadings(prevReadings => [...prevReadings, newReading]);
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
        return <Dashboard 
          readings={readings} 
          connectionStatus={connectionStatus}
          onManageConnection={() => setIsConnectionModalOpen(true)}
        />;
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-900">
      {/* Animated Background Layer */}
      <IrisBackground />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-slate-900/70 z-0" />
      
      <div className="relative z-10 text-white flex flex-col items-center min-h-screen">
        <div className="w-full max-w-md mx-auto flex flex-col h-screen">
          <header className="flex items-center justify-center p-4 space-x-3 text-2xl font-bold text-cyan-300 font-poppins sticky top-0 bg-slate-900/80 backdrop-blur-sm z-20">
            <EyeIcon className="w-8 h-8"/>
            <h1>EyeSee</h1>
          </header>

          <main className="flex-grow p-4 overflow-y-auto">
            {renderScreen()}
          </main>

          <footer className="sticky bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-slate-900/80 backdrop-blur-sm z-20">
            <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
          </footer>
        </div>
      </div>
      {isConnectionModalOpen && (
        <ConnectionManager
            isOpen={isConnectionModalOpen}
            onClose={() => setIsConnectionModalOpen(false)}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            currentStatus={connectionStatus}
        />
      )}
    </div>
  );
};

export default App;