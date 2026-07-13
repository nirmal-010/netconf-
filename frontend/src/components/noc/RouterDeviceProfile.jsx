import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateL3, updateDevice } from '../../store/configSlice';
import { Router as RouterIcon, Cpu, CheckCircle2 } from 'lucide-react';

export default function RouterDeviceProfile() {
  const dispatch = useDispatch();
  const activeId = useSelector(state => state.config?.devices?.activeId) || 'dev-01';
  const device = useSelector(state => state.config?.devices?.byId?.[activeId]) || { hostname: 'RTR-CORE-01' };
  const l3 = useSelector(state => state.config?.l3?.byId?.[activeId]) || { routingVendor: 'cisco' };

  const handleDeviceChange = (e) => {
    dispatch(updateDevice({ id: activeId, updates: { [e.target.name]: e.target.value } }));
  };

  const handleVendorChange = (e) => {
    dispatch(updateL3({ deviceId: activeId, routingVendor: e.target.value }));
  };

  const vendorOptions = [
    { id: 'cisco', name: 'Cisco Systems', os: 'IOS-XE (ASR/ISR Routers)', desc: 'Enterprise WAN & Border Routers', color: '#38BDF8' },
    { id: 'nx-os', name: 'Cisco NX-OS', os: 'NX-OS (Nexus Data Center Core)', desc: 'High-Performance Spine/Leaf Routing', color: '#0EA5E9' },
    { id: 'arista', name: 'Arista Networks', os: 'EOS (7280/7500 series)', desc: 'High-Speed Data Center Core Routing', color: '#10B981' },
    { id: 'juniper', name: 'Juniper Networks', os: 'Juniper Junos (MX/SRX/QFX)', desc: 'Carrier & Enterprise Core Routing Engine', color: '#8B5CF6' },
    { id: 'aruba', name: 'HPE Aruba', os: 'AOS-CX (Router / Core Switch)', desc: 'Campus Core & Aggregation L3 Routing', color: '#F59E0B' },
    { id: 'allied', name: 'Allied Telesis', os: 'AlliedWare Plus (x930/x950)', desc: 'High-Resiliency Enterprise Core', color: '#A855F7' },
    { id: 'alcatel', name: 'Alcatel-Lucent', os: 'OmniSwitch AOS (6860E/6900)', desc: 'Enterprise Campus Core & Aggregation', color: '#6366F1' },
    { id: 'tplink', name: 'TP-Link', os: 'JetStream Managed L3', desc: 'Managed Gigabit Core Routing', color: '#EC4899' },
    { id: 'dlink', name: 'D-Link Systems', os: 'DGS/DXS Enterprise Core', desc: 'Managed Enterprise L3 Core Switch/Router', color: '#14B8A6' }
  ];

  const currentProfile = vendorOptions.find(v => v.id === l3.routingVendor) || vendorOptions[0];

  const inputStyle = {
    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
    borderRadius: '8px', padding: '10px 14px', color: 'var(--fg-pure)',
    fontSize: '13px', fontFamily: 'var(--font-sans)', outline: 'none', width: '100%',
    fontWeight: 700, transition: 'border-color 0.15s ease'
  };

  return (
    <div className="enterprise-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-base)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A855F7'
          }}>
            <RouterIcon size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--fg-pure)', margin: 0 }}>
              Layer 3 Target Router Profile
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: '4px 0 0 0' }}>
              Configure target hostname and select multi-vendor routing compilation syntax.
            </p>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '6px',
          background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#C084FC',
          fontSize: '12px', fontWeight: 700
        }}>
          <Cpu size={14} /> Active Compiler: {currentProfile.name}
        </div>
      </div>

      <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <span className="form-label">Router Hostname</span>
          <input
            type="text"
            name="hostname"
            value={device.hostname || 'RTR-CORE-01'}
            onChange={handleDeviceChange}
            placeholder="e.g. ASR-BORDER-01"
            style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <span className="form-label">Multi-Vendor Router OS Target</span>
          <select
            value={l3.routingVendor || 'cisco'}
            onChange={handleVendorChange}
            style={{ ...inputStyle, cursor: 'pointer', color: currentProfile.color }}
          >
            {vendorOptions.map(opt => (
              <option key={opt.id} value={opt.id} style={{ background: '#0F172A', color: '#FFFFFF' }}>
                {opt.name} — {opt.os}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{
        padding: '12px 24px', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--fg-muted)' }}>
          <CheckCircle2 size={15} color={currentProfile.color} />
          <span>Target Capabilities: <strong style={{ color: 'var(--fg-pure)' }}>{currentProfile.desc}</strong></span>
        </div>
        <span style={{ color: currentProfile.color, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
          [{currentProfile.id.toUpperCase()}_L3_ENGINE]
        </span>
      </div>
    </div>
  );
}
