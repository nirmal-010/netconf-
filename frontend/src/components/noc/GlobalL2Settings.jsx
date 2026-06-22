import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateGlobalL2 } from '../../store/configSlice';
import { Globe, Settings, Clock, Activity } from 'lucide-react';

export default function GlobalL2Settings() {
  const dispatch = useDispatch();
  const activeDevId = useSelector(state => state.config.devices.activeId);
  const settings = useSelector(state => state.config.globalL2.byId[activeDevId]) || {};

  const handleChange = (field, value) => {
    dispatch(updateGlobalL2({ deviceId: activeDevId, updates: { [field]: value } }));
  };

  const inputStyle = {
    background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)',
    borderRadius: '8px', padding: '8px 12px', color: 'var(--fg-primary)',
    fontSize: '13px', fontFamily: 'var(--font-sans)', outline: 'none', width: '100%'
  };

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
      <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-subtle)' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--fg-primary)', margin: 0 }}>Global Layer 2 Settings</h3>
        <p style={{ fontSize: '13px', color: 'var(--fg-muted)', marginTop: '4px' }}>Configure VTP, MAC Address Table, and Errdisable Recovery.</p>
      </div>

      <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
        
        {/* VTP Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)' }}>
            <Globe size={18} />
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>VTP Configuration</h4>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)' }}>VTP Mode</label>
              <select value={settings.vtpMode || 'transparent'} onChange={e => handleChange('vtpMode', e.target.value)} style={inputStyle}>
                <option value="transparent">Transparent (Recommended)</option>
                <option value="server">Server</option>
                <option value="client">Client</option>
                <option value="off">Off</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)' }}>Domain Name</label>
              <input placeholder="e.g. CORP" value={settings.vtpDomain || ''} onChange={e => handleChange('vtpDomain', e.target.value)} style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)' }}>Password</label>
                <input type="password" placeholder="***" value={settings.vtpPassword || ''} onChange={e => handleChange('vtpPassword', e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)' }}>Version</label>
                <select value={settings.vtpVersion || '2'} onChange={e => handleChange('vtpVersion', e.target.value)} style={inputStyle}>
                  <option value="1">v1</option>
                  <option value="2">v2</option>
                  <option value="3">v3</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* MAC Address Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
            <Clock size={18} />
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>MAC Address Table</h4>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)' }}>Aging Time (seconds)</label>
              <input type="number" placeholder="300" value={settings.macAging || 300} onChange={e => handleChange('macAging', parseInt(e.target.value) || 0)} style={inputStyle} />
              <span style={{ fontSize: '11px', color: 'var(--fg-dim)' }}>Default: 300s (5 mins). 0 to disable.</span>
            </div>
          </div>
        </div>

        {/* Errdisable Recovery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-amber)' }}>
            <Activity size={18} />
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Auto-Errdisable Recovery</h4>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--fg-primary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={settings.errdisableRecovery || false} onChange={e => handleChange('errdisableRecovery', e.target.checked)} />
              Enable Auto-Recovery
            </label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', opacity: settings.errdisableRecovery ? 1 : 0.5, pointerEvents: settings.errdisableRecovery ? 'auto' : 'none' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)' }}>Recovery Interval (seconds)</label>
              <input type="number" placeholder="300" value={settings.errdisableInterval || 300} onChange={e => handleChange('errdisableInterval', parseInt(e.target.value) || 300)} style={inputStyle} />
              <span style={{ fontSize: '11px', color: 'var(--fg-dim)' }}>Recovers BPDUGuard & Port-Security violations automatically.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
