import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateGlobalSecurity, updateStp } from '../../store/configSlice';
import { ShieldAlert, AlertCircle } from 'lucide-react';

export default function SecurityDashboard() {
  const dispatch = useDispatch();
  const activeDevId = useSelector(state => state.config.devices.activeId);
  const globalSecurity = useSelector(state => state.config.globalSecurity.byId[activeDevId]) || { dhcpSnooping: false, dai: false, bpduGuard: false, rootGuard: false, loopGuard: false };
  const stp = useSelector(state => state.config.stp.byId[activeDevId]) || { mode: 'rapid-pvst' };

  const handleToggle = (name, checked) => {
    dispatch(updateGlobalSecurity({ deviceId: activeDevId, updates: { [name]: checked } }));
  };

  const Toggle = ({ label, name, checked }) => (
    <label style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px', background: 'var(--bg-deep)', borderRadius: '12px',
      border: '1px solid var(--border-subtle)', cursor: 'pointer'
    }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--fg-primary)' }}>{label}</span>
      <input type="checkbox" name={name} checked={checked} onChange={e => handleToggle(name, e.target.checked)} />
    </label>
  );

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
      <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-subtle)' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--fg-primary)', margin: 0 }}>Security & STP Policy</h3>
        <p style={{ fontSize: '13px', color: 'var(--fg-muted)', marginTop: '4px' }}>Manage control plane protections and loop prevention.</p>
      </div>

      <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Left: Zero Trust */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-amber)', marginBottom: '8px' }}>
            <ShieldAlert size={18} />
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Zero Trust Controls</span>
          </div>
          <Toggle label="DHCP Snooping" name="dhcpSnooping" checked={globalSecurity.dhcpSnooping} />
          <Toggle label="Dynamic ARP Inspection" name="dai" checked={globalSecurity.dai} />
        </div>

        {/* Right: STP */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-amber)', marginBottom: '8px' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>STP Protections</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', background: 'var(--bg-deep)', borderRadius: '12px',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--fg-primary)' }}>STP Mode</span>
            <select value={stp.mode} onChange={e => dispatch(updateStp({ deviceId: activeDevId, updates: { mode: e.target.value } }))} style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              borderRadius: '8px', padding: '6px 12px', color: 'var(--fg-primary)',
              fontSize: '13px', fontFamily: 'var(--font-sans)', outline: 'none'
            }}>
              <option value="pvst">PVST+</option>
              <option value="rapid-pvst">Rapid PVST+</option>
              <option value="mst">MST</option>
            </select>
          </div>
          <Toggle label="BPDU Guard (Portfast)" name="bpduGuard" checked={globalSecurity.bpduGuard} />
          <Toggle label="Root Guard" name="rootGuard" checked={globalSecurity.rootGuard} />
          <Toggle label="Loop Guard" name="loopGuard" checked={globalSecurity.loopGuard} />
        </div>
      </div>
    </div>
  );
}
