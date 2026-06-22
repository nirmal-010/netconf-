import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import InterfaceManager from './InterfaceManager';
import VlanManager from './VlanManager';
import SecurityDashboard from './SecurityDashboard';
import HomeDashboard from '../HomeDashboard';

export default function WorkspaceRouter() {
  const activeNav = useSelector(state => state.config.workspace.activeNav);

  const placeholder = (label) => (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', color: 'var(--fg-dim)',
      fontFamily: 'var(--font-mono)', fontSize: '13px', gap: '16px',
      letterSpacing: '0.1em'
    }}>
      <div style={{
        width: '48px', height: '48px', border: '3px dashed var(--fg-dim)',
        borderRadius: '50%', animation: 'spin 8s linear infinite'
      }}></div>
      [{label.toUpperCase()} — COMING SOON]
    </div>
  );

  return (
    <div style={{
      height: '100%', background: 'var(--bg-deep)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }} className="animate-fade-in">
        {activeNav === 'dashboard' && <HomeDashboard />}
        {activeNav === 'interfaces' && <InterfaceManager />}
        {activeNav === 'vlans' && <VlanManager />}
        {activeNav === 'security' && <SecurityDashboard />}
        {activeNav === 'devices' && placeholder('Device Inventory')}
        {activeNav === 'l2' && placeholder('Layer 2 Engine')}
        {activeNav === 'l3' && placeholder('Layer 3 Routing')}
        {activeNav === 'cli' && placeholder('Templates')}
      </div>
    </div>
  );
}
