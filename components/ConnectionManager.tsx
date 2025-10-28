import React, { useState, useEffect } from 'react';
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

const ConnectionManager: React.FC<ConnectionManagerProps> = ({
  isOpen,
  onClose,
  onConnect,
  onDisconnect,
  currentStatus,
}) => {
  type Tab = 'WiFi' | 'Bluetooth';
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
  }

  if (!isOpen) return null;

  const TabButton: React.FC<{ tabName: Tab; icon: React.ReactNode }> = ({ tabName, icon }) => (
    <button
      onClick={() => {
        setActiveTab(tabName);
        setFoundDevices([]);
        setIsScanning(false);
      }}
      className={`flex-1 flex items-center justify-center p-3 font-semibold border-b-2 transition-colors ${
        activeTab === tabName
          ? 'border-cyan-400 text-cyan-400'
          : 'border-slate-700 text-slate-400 hover:text-cyan-300'
      }`}
    >
      {icon}
      <span className="ml-2">{tabName}</span>
    </button>
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm m-4 text-white transform transition-all animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-cyan-300">Device Connection</h2>
                <button onClick={onClose} className="text-3xl font-light text-slate-400 hover:text-white leading-none">&times;</button>
            </div>
            {currentStatus.isConnected ? (
                <div className="text-center">
                    <p className="text-green-400">Connected via {currentStatus.type}</p>
                    <button onClick={onDisconnect} className="mt-4 w-full px-4 py-2 bg-red-600/80 text-white rounded-full font-semibold hover:bg-red-500 transition-colors">
                        Disconnect
                    </button>
                </div>
            ) : (
                 <p className="text-center text-slate-400">Not connected. Scan for a device below.</p>
            )}
        </div>
        
        <div className="border-t border-slate-700">
            <div className="flex">
                <TabButton tabName="WiFi" icon={<WifiIcon className="w-5 h-5"/>} />
                <TabButton tabName="Bluetooth" icon={<BluetoothIcon className="w-5 h-5"/>} />
            </div>
        </div>

        <div className="p-6 h-64 flex flex-col">
            <button
                onClick={handleScan}
                disabled={isScanning}
                className="w-full px-4 py-2 bg-cyan-500 text-slate-900 rounded-full font-semibold hover:bg-cyan-400 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/30"
            >
                {isScanning ? 'Scanning...' : `Scan for ${activeTab} Devices`}
            </button>
            <div className="flex-grow mt-4 overflow-y-auto">
                {isScanning ? (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        <div className="w-6 h-6 border-2 border-t-cyan-400 border-slate-600 rounded-full animate-spin"></div>
                        <span className="ml-3">Searching for devices...</span>
                    </div>
                ) : foundDevices.length > 0 ? (
                    <ul className="space-y-2">
                        {foundDevices.map(device => (
                            <li key={device} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg">
                                <span className="font-medium">{device}</span>
                                <button onClick={handleConnect} className="px-3 py-1 text-sm bg-green-500 text-white rounded-full font-semibold hover:bg-green-400">
                                    Connect
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <p>No devices found.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionManager;
