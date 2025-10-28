import React from 'react';

interface BatteryIconProps extends React.SVGProps<SVGSVGElement> {
  charge: number; // 0-100
}

export const BatteryIcon: React.FC<BatteryIconProps> = ({ charge, ...props }) => {
  const chargeWidth = Math.max(0, Math.min(18, (18 * charge) / 100));
  const chargeColor = charge > 20 ? 'currentColor' : '#ef4444'; // red-500

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="6" width="18" height="12" rx="2" ry="2"/>
      <line x1="22" y1="10" x2="22" y2="14"/>
      <rect x="4" y="8" width={chargeWidth} height="8" rx="1" ry="1" fill={chargeColor} stroke="none" />
    </svg>
  );
};
