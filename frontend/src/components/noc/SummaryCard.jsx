import React from 'react';
import { useSelector } from 'react-redux';
import { compileConfiguration } from '../../compiler';
import { Server, Cpu, Network, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SummaryCard() {
  const fullState = useSelector(state => state.config);
  const devices = fullState.devices;
  const activeId = devices?.activeId || 'dev-01';
  const activeDevice = devices?.byId?.[activeId] || { hostname: 'Core-SW-01', vendor: 'Cisco', platform: 'IOS-XE' };
  
  const allInterfaces = fullState.interfaces?.allIds?.map(id => fullState.interfaces.byId[id]).filter(i => i && i.deviceId === activeId) || [];
  const configuredInterfaces = allInterfaces.filter(i => i && (i.mode !== 'access' || i.vlan !== '1' || i.description || i.portSecurity || i.channelGroup));
  const vlans = fullState.vlans?.allIds?.map(id => fullState.vlans.byId[id]).filter(v => v && v.deviceId === activeId) || [];
  const portChannels = new Set(allInterfaces.filter(i => i && i.channelGroup).map(i => i.channelGroup)).size;
  
  const isVerificationEnabled = Boolean(fullState.workspace?.includeVerification);
  const { report } = compileConfiguration(fullState);
  const isValid = report?.status !== 'FAILED';

  return (
    <div className="enterprise-card" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '6px',
            background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8'
          }}>
            <Server size={18} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--fg-pure)' }}>Live Configuration Summary</h4>
            <span style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>Real-time state telemetry & fabric status</span>
          </div>
        </div>
        <div style={{
          fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '4px',
          background: isValid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          color: isValid ? '#10B981' : '#EF4444',
          border: `1px solid ${isValid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          display: 'flex', alignItems: 'center', gap: '4px'
        }}>
          {isValid ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          {isValid ? 'Passed' : 'Errors Found'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
        
        <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Target Device</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fg-pure)', fontFamily: 'var(--font-mono)' }}>{activeDevice.hostname}</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Vendor OS</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#38BDF8' }}>{activeDevice.vendor} {activeDevice.platform}</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Interfaces</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fg-pure)' }}>
            {allInterfaces.length} <span style={{ fontSize: '11px', color: 'var(--fg-muted)', fontWeight: 500 }}>({configuredInterfaces.length} Configured)</span>
          </div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>VLANs</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#A855F7' }}>{vlans.length} Active</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Port Channels</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#F59E0B' }}>{portChannels} Groups</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Verification</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: isVerificationEnabled ? '#10B981' : 'var(--fg-muted)' }}>
            {isVerificationEnabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>

      </div>
    </div>
  );
}
