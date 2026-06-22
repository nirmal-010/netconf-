import React from 'react';
import { Search, Bell, Shield } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function TopNavigation() {
  const devices = useSelector(state => state.config.devices);
  const activeDevice = devices.byId[devices.activeId];

  return (
    <header style={{
      height: '52px', borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-base)', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 24px', flexShrink: 0
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--accent)', boxShadow: '0 0 10px var(--accent-glow)'
          }}></div>
          <span style={{ fontWeight: 900, fontSize: '16px', letterSpacing: '-0.02em', color: 'var(--fg-primary)' }}>
            NetConfig<span style={{ color: 'var(--accent)' }}> Pro</span>
          </span>
        </div>
        <div style={{
          fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600,
          background: 'var(--bg-elevated)', padding: '4px 12px', borderRadius: '6px',
          color: 'var(--accent)', border: '1px solid rgba(34,197,94,0.15)',
          letterSpacing: '0.05em', textTransform: 'uppercase'
        }}>
          {activeDevice ? `${activeDevice.hostname} · ${activeDevice.model}` : 'No Device'}
        </div>
      </div>

      {/* Search + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-dim)' }} />
          <input
            type="text" placeholder="Search interfaces, VLANs..."
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              borderRadius: '8px', padding: '6px 12px 6px 32px', fontSize: '12px',
              color: 'var(--fg-primary)', width: '240px', outline: 'none',
              fontFamily: 'var(--font-sans)'
            }}
          />
        </div>
        <button style={{ color: 'var(--fg-dim)', background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
          <Bell size={16} />
          <span style={{
            position: 'absolute', top: '-2px', right: '-2px', width: '6px',
            height: '6px', background: 'var(--destructive)', borderRadius: '50%'
          }}></span>
        </button>
        <button style={{ color: 'var(--fg-dim)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <Shield size={16} />
        </button>
      </div>
    </header>
  );
}
