import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setWorkspaceNav } from '../../store/configSlice';
import Layer2Dashboard from './Layer2Dashboard';
import Layer3Dashboard from './Layer3Dashboard';
import ConfigurationTemplates from './ConfigurationTemplates';
import { GitBranch, Database, FileCode, Layers } from 'lucide-react';

export default function ConfigStudio() {
  const dispatch = useDispatch();
  const activeNav = useSelector(state => state.config.workspace.activeNav) || 'l2';
  
  // Ensure we are in one of the 3 subtabs
  const currentTab = ['l2', 'l3', 'templates'].includes(activeNav) ? activeNav : 'l2';

  const subtabs = [
    { id: 'l2', icon: GitBranch, label: 'Layer 2 Switching (VLANs & Ports)' },
    { id: 'l3', icon: Database, label: 'Layer 3 Routing (IP, OSPF & BGP)' },
    { id: 'templates', icon: FileCode, label: 'Config Templates (Pre-Flight)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Studio Top Subtab Bar in Warm Tan/Cream */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '14px 28px', background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px', fontWeight: 800, fontSize: '12px', color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <Layers size={16} style={{ color: 'var(--accent)' }} /> Config Studio:
        </div>
        
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-elevated)', padding: '5px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          {subtabs.map(tab => {
            const isSelected = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => dispatch(setWorkspaceNav(tab.id))}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 18px', borderRadius: '10px', border: 'none',
                  background: isSelected ? 'var(--accent)' : 'transparent',
                  color: isSelected ? '#FFFFFF' : 'var(--fg-muted)',
                  fontSize: '13px', fontWeight: isSelected ? 700 : 600,
                  cursor: 'pointer', transition: 'all 0.18s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(150, 93, 52, 0.25)' : 'none'
                }}
              >
                <tab.icon size={15} style={{ color: isSelected ? '#FFFFFF' : 'var(--fg-muted)' }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subtab Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-deep)' }}>
        {currentTab === 'l2' && <Layer2Dashboard />}
        {currentTab === 'l3' && <Layer3Dashboard />}
        {currentTab === 'templates' && <ConfigurationTemplates />}
      </div>
    </div>
  );
}
