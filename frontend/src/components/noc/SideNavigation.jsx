import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setWorkspaceNav } from '../../store/configSlice';
import {
  GitBranch, Database, FileCode, Server, FolderGit2, Settings,
  ChevronLeft, ChevronRight, Layers, ShieldCheck, Activity
} from 'lucide-react';

const navItems = [
  { id: 'l2', icon: GitBranch, label: 'Layer 2 Switching', badge: 'Active', color: '#38BDF8' },
  { id: 'l3', icon: Database, label: 'Layer 3 Routing', badge: 'Active', color: '#A855F7' },
  { id: 'templates', icon: FileCode, label: 'Configuration Templates', badge: 'v2.4', color: '#10B981' },
  { id: 'inventory', icon: Server, label: 'Device Inventory', badge: '48 Nodes', color: '#F59E0B' },
  { id: 'projects', icon: FolderGit2, label: 'NOC Projects & Topology', badge: 'Git Sync', color: '#EC4899' },
  { id: 'settings', icon: Settings, label: 'System & Engine Settings', badge: 'ENT', color: '#64748B' },
];

export default function SideNavigation({ isCollapsed, onToggleCollapse }) {
  const dispatch = useDispatch();
  const activeNav = useSelector(state => state.config.workspace.activeNav) || 'l2';
  const devices = useSelector(state => state.config.devices);
  const activeId = devices.activeId || 'dev-01';

  return (
    <div style={{
      height: '100%', background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column',
      paddingTop: '16px', paddingBottom: '16px',
      position: 'relative', transition: 'width 0.2s ease',
      width: isCollapsed ? '64px' : '230px'
    }}>
      {/* Top Sidebar Header & Collapse Toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between',
        padding: isCollapsed ? '0' : '0 16px', marginBottom: '16px', minHeight: '28px'
      }}>
        {!isCollapsed && (
          <div style={{
            fontSize: '11px', fontWeight: 800, color: 'var(--fg-dim)',
            textTransform: 'uppercase', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <Layers size={14} className="text-emerald-400" /> NOC MODULES
          </div>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            style={{
              width: '26px', height: '26px', borderRadius: '6px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--fg-pure)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 8px', flex: 1 }}>
        {navItems.map(item => {
          const isActive = activeNav === item.id;
          const badgeText = item.id === 'inventory' ? `${devices?.allIds?.length || 1} Nodes` : item.badge;
          return (
            <button
              key={item.id}
              onClick={() => dispatch(setWorkspaceNav(item.id))}
              style={{
                display: 'flex', alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between',
                padding: isCollapsed ? '12px 0' : '10px 12px',
                borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: isActive ? 700 : 600,
                fontFamily: 'var(--font-sans)', transition: 'all 0.15s ease',
                background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--fg-muted)',
                borderLeft: isActive ? `3px solid ${item.color}` : '3px solid transparent',
                position: 'relative'
              }}
              title={isCollapsed ? item.label : ''}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <item.icon size={18} style={{ color: isActive ? item.color : 'var(--fg-dim)' }} />
                {!isCollapsed && <span>{item.label}</span>}
              </div>
              {!isCollapsed && badgeText && (
                <span style={{
                  fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                  background: isActive ? item.color : 'rgba(255, 255, 255, 0.06)',
                  color: isActive ? '#0F172A' : 'var(--fg-dim)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {badgeText}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Telemetry Mini Card */}
      {!isCollapsed && (
        <div style={{
          margin: '0 12px', padding: '12px', borderRadius: '8px',
          background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
          display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--fg-pure)', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={13} className="text-emerald-400" /> Cluster State
            </span>
            <span style={{ color: '#10B981', fontFamily: 'var(--font-mono)' }}>HEALTHY</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--fg-muted)' }}>
            <span>Target Node:</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-pure)' }}>{activeId}</span>
          </div>
        </div>
      )}
    </div>
  );
}
