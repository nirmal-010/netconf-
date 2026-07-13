import React from 'react';
import SummaryCard from './SummaryCard';
import SmartRecommendations from './SmartRecommendations';
import RouterDeviceProfile from './RouterDeviceProfile';
import OspfManager from './OspfManager';
import BgpManager from './BgpManager';
import StaticRouteManager from './StaticRouteManager';

export default function Layer3Dashboard() {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SummaryCard />
      <SmartRecommendations />
      <RouterDeviceProfile />
      <OspfManager />
      <BgpManager />
      <StaticRouteManager />
    </div>
  );
}
