import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setWorkspaceNav } from '../../store/configSlice';
import {
  LayoutDashboard, Server, Cpu, Network, GitBranch,
  ShieldAlert, Database, TerminalSquare
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'devices', icon: Server, label: 'Devices' },
  { id: 'interfaces', icon: Cpu, label: 'Interfaces' },
  { id: 'vlans', icon: Network, label: 'VLANs' },
  { id: 'l2', icon: GitBranch, label: 'Layer 2 / STP' },
  { id: 'l3', icon: Database, label: 'Layer 3' },
  { id: 'security', icon: ShieldAlert, label: 'Security' },
  { id: 'cli', icon: TerminalSquare, label: 'Templates' },
];

export default function SideNavigation() {
  const dispatch = useDispatch();
  const activeNav = useSelector(state => state.config.workspace.activeNav);

  return (
    <div style={{
      height: '100%', background: 'var(--bg-base)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column', paddingTop: '20px'
    }}>
      <div style={{
        padding: '0 20px', fontSize: '10px', fontWeight: 800,
        color: 'var(--fg-dim)', textTransform: 'uppercase',
        letterSpacing: '0.15em', marginBottom: '12px'
      }}>
        Network Layers
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 8px' }}>
        {navItems.map(item => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => dispatch(setWorkspaceNav(item.id))}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: '10px', border: 'none',
                cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                fontFamily: 'var(--font-sans)', transition: 'all 0.15s ease',
                background: isActive ? 'rgba(34,197,94,0.1)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--fg-muted)',
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
              }}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
