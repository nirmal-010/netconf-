import React from 'react';
import SummaryCard from './SummaryCard';
import SmartRecommendations from './SmartRecommendations';
import DeviceSettings from './DeviceSettings';
import GlobalL2Settings from './GlobalL2Settings';
import VlanManager from './VlanManager';
import InterfaceManager from './InterfaceManager';
import SecurityDashboard from './SecurityDashboard';

export default function Layer2Dashboard() {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SummaryCard />
      <SmartRecommendations />
      <DeviceSettings />
      <GlobalL2Settings />
      <VlanManager />
      <InterfaceManager />
      <SecurityDashboard />
    </div>
  );
}
