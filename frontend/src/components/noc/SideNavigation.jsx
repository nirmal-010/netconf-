import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setWorkspaceNav } from '../../store/configSlice';
import {
  GitBranch, Database, FileCode, ChevronLeft, ChevronRight, CheckCircle2
} from 'lucide-react';

const navItems = [
  { id: 'l2', icon: GitBranch, label: 'Layer 2 Switching', badge: 'VLANs / Ports' },
  { id: 'l3', icon: Database, label: 'Layer 3 Routing', badge: 'IP / OSPF / BGP' },
  { id: 'templates', icon: FileCode, label: 'Config Templates', badge: 'Pre-Flight' },
];

export default function SideNavigation({ isCollapsed, onToggleCollapse }) {
  const dispatch = useDispatch();
  const activeNav = useSelector(state => state.config.workspace.activeNav) || 'l2';

  return (
    <div style={{
      height: '100%', background: 'var(--bg-card)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 14px',
      position: 'relative', transition: 'width 0.2s ease',
      width: isCollapsed ? '70px' : '240px',
      borderRight: '1px solid var(--border-subtle)',
      boxShadow: '2px 0 16px rgba(140, 120, 100, 0.04)'
    }}>
      {/* Top Sidebar Brand Section (Inspired by BrewMaster Dashboard) */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between',
        marginBottom: '28px', padding: isCollapsed ? '0' : '0 6px'
      }}>
        {!isCollapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '12px',
              background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', fontWeight: 900, fontSize: '18px',
              boxShadow: '0 4px 12px rgba(150, 93, 52, 0.25)'
            }}>
              N
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--fg-pure)', letterSpacing: '-0.02em' }}>
                NetConfig Pro
              </div>
              <div style={{ fontSize: '11px', color: 'var(--fg-muted)', fontWeight: 500 }}>
                Automation Console
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            width: '36px', height: '36px', borderRadius: '12px',
            background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFFFFF', fontWeight: 900, fontSize: '18px',
            boxShadow: '0 4px 12px rgba(150, 93, 52, 0.25)'
          }}>
            N
          </div>
        )}
      </div>

      {/* Navigation List - Exact Caramel Active Button Pattern */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {navItems.map(item => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => dispatch(setWorkspaceNav(item.id))}
              style={{
                display: 'flex', alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between',
                padding: isCollapsed ? '13px 0' : '13px 16px',
                borderRadius: '14px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: isActive ? 700 : 600,
                fontFamily: 'var(--font-sans)', transition: 'all 0.18s ease',
                background: isActive ? 'var(--accent)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--fg-muted)',
                boxShadow: isActive ? '0 4px 14px rgba(150, 93, 52, 0.28)' : 'none'
              }}
              title={isCollapsed ? item.label : ''}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-elevated)';
                  e.currentTarget.style.color = 'var(--fg-pure)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--fg-muted)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <item.icon size={18} style={{ color: isActive ? '#FFFFFF' : 'var(--fg-muted)' }} />
                {!isCollapsed && <span>{item.label}</span>}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom System Status Badge (Exact BrewMaster Green Check Pattern) */}
      {!isCollapsed && (
        <div style={{
          padding: '14px 16px', borderRadius: '14px',
          background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'flex-start', gap: '10px'
        }}>
          <CheckCircle2 size={18} style={{ color: '#16A34A', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--fg-pure)' }}>
              System Status
            </div>
            <div style={{ fontSize: '11px', color: 'var(--fg-muted)', marginTop: '2px' }}>
              All systems operational
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
