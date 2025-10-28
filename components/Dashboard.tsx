import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { IOPReading, ConnectionStatus } from '../types';
import { RiskLevel } from '../types';
import { NORMAL_IOP_RANGE, MODERATE_RISK_THRESHOLD, HIGH_RISK_THRESHOLD, NEON_BLUE } from '../constants';
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
    case RiskLevel.High: return 'text-red-500';
    case RiskLevel.Moderate: return 'text-yellow-400';
    case RiskLevel.Low: return 'text-green-400';
    default: return 'text-gray-400';
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-700/80 p-2 border border-slate-600 rounded-md shadow-lg">
        <p className="label text-sm text-cyan-300">{`${new Date(label).toLocaleDateString()}`}</p>
        <p className="intro text-lg font-bold">{`${payload[0].value} mmHg`}</p>
      </div>
    );
  }
  return null;
};


const Dashboard: React.FC<DashboardProps> = ({ readings, connectionStatus, onManageConnection }) => {
  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;
  const riskLevel = latestReading ? getRiskLevel(latestReading.value) : RiskLevel.Low;

  const chartData = readings.slice(-7).map(r => ({
    name: r.date.getTime(),
    IOP: r.value,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Device Status Card */}
      <div className="bg-slate-800/50 p-4 rounded-xl backdrop-blur-sm border border-slate-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg text-cyan-300">EyeSee Monitor</h2>
             <p className={`text-sm ${connectionStatus.isConnected ? 'text-green-400' : 'text-slate-400'}`}>
              {connectionStatus.isConnected ? `Connected via ${connectionStatus.type}` : 'Disconnected'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {connectionStatus.isConnected && connectionStatus.type === 'WiFi' && <WifiIcon className="w-6 h-6 text-cyan-400" />}
            {connectionStatus.isConnected && connectionStatus.type === 'Bluetooth' && <BluetoothIcon className="w-6 h-6 text-cyan-400" />}
            <BatteryIcon className="w-6 h-6 text-cyan-400" charge={90} />
          </div>
        </div>
        <button 
          onClick={onManageConnection} 
          className="mt-4 w-full text-center py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-cyan-300 font-semibold transition-colors"
        >
          Manage Connection
        </button>
      </div>
      
      {/* Main Reading Card */}
      <div className="text-center bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 shadow-2xl shadow-cyan-500/10">
        <p className="text-slate-400 text-sm">Last Reading (IOP)</p>
        <p className="text-6xl font-bold my-2 text-cyan-300">
          {latestReading ? latestReading.value.toFixed(1) : '--'}
          <span className="text-2xl text-slate-400 ml-2">mmHg</span>
        </p>
        <div className="flex items-center justify-center space-x-2">
            <p className={`font-semibold text-lg ${getRiskColor(riskLevel)}`}>
              {riskLevel} Risk
            </p>
        </div>
        <p className="text-xs text-slate-500 mt-2">
            {latestReading ? `Recorded on ${latestReading.date.toLocaleDateString()}` : 'No readings yet'}
        </p>
      </div>

      {/* Trend Graph Card */}
      <div className="bg-slate-800/50 p-4 rounded-xl backdrop-blur-sm border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-cyan-300">7-Day Trend</h3>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorIOP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={NEON_BLUE} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={NEON_BLUE} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="name" 
                tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="IOP" stroke={NEON_BLUE} strokeWidth={2} fillOpacity={1} fill="url(#colorIOP)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
