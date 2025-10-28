export interface IOPReading {
  date: Date;
  value: number;
}

export type Screen = 'dashboard' | 'scan' | 'history';

export enum RiskLevel {
  Low = 'Low',
  Moderate = 'Moderate',
  High = 'High',
}

export type ConnectionType = 'WiFi' | 'Bluetooth' | 'None';

export interface ConnectionStatus {
    isConnected: boolean;
    type: ConnectionType;
}
