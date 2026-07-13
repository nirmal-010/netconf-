import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateGlobalL2 } from '../../store/configSlice';
import { Globe, Settings, Clock, Activity, Layers } from 'lucide-react';

export default function GlobalL2Settings() {
  const dispatch = useDispatch();
  const activeDevId = useSelector(state => state.config?.devices?.activeId) || 'dev-01';
  const settings = useSelector(state => state.config?.globalL2?.byId?.[activeDevId]) || {};

  const handleChange = (field, value) => {
    dispatch(updateGlobalL2({ deviceId: activeDevId, updates: { [field]: value } }));
  };

  const inputStyle = {
    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
    borderRadius: '8px', padding: '8px 12px', color: 'var(--fg-pure)',
    fontSize: '13px', fontFamily: 'var(--font-sans)', outline: 'none', width: '100%',
    transition: 'border-color 0.15s ease'
  };

  return (
    <div className="enterprise-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-base)' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '10px',
          background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8'
        }}>
          <Layers size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--fg-pure)', margin: 0 }}>Global Layer 2 Switch Parameters</h3>
          <p style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: '4px 0 0 0' }}>Configure VTP Domain/Mode, MAC Address Table Aging Time, and Errdisable Auto-Recovery.</p>
        </div>
      </div>

      <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
        
        {/* VTP Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8' }}>
            <Globe size={18} />
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>VTP Configuration</h4>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <span className="form-label">VTP Mode</span>
              <select value={settings.vtpMode || 'transparent'} onChange={e => handleChange('vtpMode', e.target.value)} style={inputStyle}>
                <option value="transparent">Transparent (Recommended)</option>
                <option value="server">Server</option>
                <option value="client">Client</option>
                <option value="off">Off</option>
              </select>
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <span className="form-label">Domain Name</span>
              <input placeholder="e.g. CORP" value={settings.vtpDomain || ''} onChange={e => handleChange('vtpDomain', e.target.value)} style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <span className="form-label">Password</span>
                <input type="password" placeholder="***" value={settings.vtpPassword || ''} onChange={e => handleChange('vtpPassword', e.target.value)} style={inputStyle} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <span className="form-label">Version</span>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981' }}>
            <Clock size={18} />
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>MAC Table Aging</h4>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <span className="form-label">Aging Time (seconds)</span>
              <input type="number" placeholder="300" value={settings.macAging || 300} onChange={e => handleChange('macAging', parseInt(e.target.value) || 0)} style={inputStyle} />
              <span style={{ fontSize: '11px', color: 'var(--fg-dim)', marginTop: '4px' }}>Default: 300s (5 mins). Set to 0 to disable dynamic aging.</span>
            </div>
          </div>
        </div>

        {/* Errdisable Recovery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B' }}>
            <Activity size={18} />
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Errdisable Recovery</h4>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-elevated)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--fg-pure)' }}>Auto-Recovery State</span>
              <label className="toggle-switch">
                <input type="checkbox" checked={Boolean(settings.errdisableRecovery)} onChange={e => handleChange('errdisableRecovery', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="form-group" style={{ margin: 0, opacity: settings.errdisableRecovery ? 1 : 0.5, pointerEvents: settings.errdisableRecovery ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
              <span className="form-label">Recovery Interval (seconds)</span>
              <input type="number" placeholder="300" value={settings.errdisableInterval || 300} onChange={e => handleChange('errdisableInterval', parseInt(e.target.value) || 30)} style={inputStyle} />
              <span style={{ fontSize: '11px', color: 'var(--fg-dim)', marginTop: '4px' }}>Time before port automatically attempts to clear errdisable state (30-86400s).</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
