import React from 'react';
import SideNavigation from '../components/noc/SideNavigation';
import TopNavigation from '../components/noc/TopNavigation';
import CliOutputPanel from '../components/CliOutputPanel';
import WorkspaceRouter from '../components/noc/WorkspaceRouter';

export default function NOCWorkspace() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', width: '100vw',
      background: 'var(--bg-deep)', color: 'var(--fg-primary)',
      fontFamily: 'var(--font-sans)', overflow: 'hidden'
    }}>
      <TopNavigation />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Side Navigation */}
        <div style={{ width: '220px', flexShrink: 0, overflow: 'hidden' }}>
          <SideNavigation />
        </div>

        {/* Center: Workspace */}
        <div style={{
          flex: 1, overflow: 'hidden',
          borderLeft: '1px solid var(--border-subtle)',
          borderRight: '1px solid var(--border-subtle)'
        }}>
          <WorkspaceRouter />
        </div>

        {/* Right: CLI Output */}
        <div style={{ width: '360px', flexShrink: 0, overflow: 'hidden' }}>
          <CliOutputPanel />
        </div>
      </div>
    </div>
  );
}
