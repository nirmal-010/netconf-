import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateGlobalSecurity, updateStp } from '../../store/configSlice';
import { ShieldAlert, AlertCircle, ShieldCheck } from 'lucide-react';

export default function SecurityDashboard() {
  const dispatch = useDispatch();
  const activeDevId = useSelector(state => state.config?.devices?.activeId) || 'dev-01';
  const globalSecurity = useSelector(state => state.config?.globalSecurity?.byId?.[activeDevId]) || { dhcpSnooping: false, dai: false, bpduGuard: false, rootGuard: false, loopGuard: false };
  const stp = useSelector(state => state.config?.stp?.byId?.[activeDevId]) || { mode: 'rapid-pvst' };

  const handleToggle = (name, checked) => {
    dispatch(updateGlobalSecurity({ deviceId: activeDevId, updates: { [name]: checked } }));
  };

  const Toggle = ({ label, name, checked }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: '8px',
      border: '1px solid var(--border-subtle)', transition: 'border-color 0.15s'
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
    >
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--fg-pure)' }}>{label}</span>
      <label className="toggle-switch">
        <input type="checkbox" name={name} checked={Boolean(checked)} onChange={e => handleToggle(name, e.target.checked)} />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );

  return (
    <div className="enterprise-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-base)' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '10px',
          background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B'
        }}>
          <ShieldAlert size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--fg-pure)', margin: 0 }}>Enterprise Security & STP Policy</h3>
          <p style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: '4px 0 0 0' }}>Manage control plane zero-trust protections, DHCP snooping, and Spanning Tree loop prevention.</p>
        </div>
      </div>

      <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
        {/* Left: Zero Trust Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B', marginBottom: '4px' }}>
            <ShieldCheck size={18} />
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Zero Trust Control Plane</span>
          </div>
          <Toggle label="DHCP Snooping Enforcement" name="dhcpSnooping" checked={globalSecurity.dhcpSnooping} />
          <Toggle label="Dynamic ARP Inspection (DAI)" name="dai" checked={globalSecurity.dai} />
        </div>

        {/* Right: STP Protections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8', marginBottom: '4px' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Spanning Tree Protections</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: '8px',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--fg-pure)' }}>STP Operating Mode</span>
            <select value={stp.mode || 'rapid-pvst'} onChange={e => dispatch(updateStp({ deviceId: activeDevId, updates: { mode: e.target.value } }))} style={{
              background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
              borderRadius: '6px', padding: '6px 12px', color: '#38BDF8', fontWeight: 700,
              fontSize: '12px', outline: 'none'
            }}>
              <option value="pvst">PVST+ (Per-VLAN)</option>
              <option value="rapid-pvst">Rapid PVST+ (802.1w)</option>
              <option value="mst">MST (802.1s Multiple Instance)</option>
            </select>
          </div>
          <Toggle label="Global BPDU Guard (Portfast)" name="bpduGuard" checked={globalSecurity.bpduGuard} />
          <Toggle label="Root Guard Protection" name="rootGuard" checked={globalSecurity.rootGuard} />
          <Toggle label="Loop Guard Protection" name="loopGuard" checked={globalSecurity.loopGuard} />
        </div>
      </div>
    </div>
  );
}
