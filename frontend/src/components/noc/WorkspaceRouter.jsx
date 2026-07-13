import React from 'react';
import { useSelector } from 'react-redux';
import Layer2Dashboard from './Layer2Dashboard';
import Layer3Dashboard from './Layer3Dashboard';
import ConfigurationTemplates from './ConfigurationTemplates';

export default function WorkspaceRouter() {
  const activeNav = useSelector(state => state.config.workspace.activeNav) || 'l2';

  return (
    <div style={{
      height: '100%', background: 'var(--bg-deep)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {activeNav === 'l2' && <Layer2Dashboard />}
        {activeNav === 'l3' && <Layer3Dashboard />}
        {activeNav === 'templates' && <ConfigurationTemplates />}
      </div>
    </div>
  );
}
