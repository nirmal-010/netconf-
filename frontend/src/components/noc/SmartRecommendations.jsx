import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateGlobalSecurity, updateStp } from '../../store/configSlice';
import { ShieldCheck, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SmartRecommendations() {
  const dispatch = useDispatch();
  const devices = useSelector(state => state.config?.devices || {});
  const activeId = devices.activeId || 'dev-01';
  const security = useSelector(state => state.config?.globalSecurity?.byId?.[activeId] || {});
  const stp = useSelector(state => state.config?.stp?.byId?.[activeId] || {});

  const recommendations = [];

  if (!security.dhcpSnooping) {
    recommendations.push({
      id: 'dhcp',
      title: 'Enable DHCP Snooping',
      desc: 'Mitigates rogue DHCP servers and builds dynamic IP-to-MAC trust bindings across access VLANs.',
      actionLabel: 'Enable DHCP Snooping',
      onApply: () => dispatch(updateGlobalSecurity({ deviceId: activeId, updates: { dhcpSnooping: true } }))
    });
  }

  if (!security.bpduGuard) {
    recommendations.push({
      id: 'bpdu',
      title: 'Enable BPDU Guard on Access Ports',
      desc: 'Protects the Spanning Tree root bridge by automatically shutting down access ports if unexpected BPDUs are received.',
      actionLabel: 'Enable BPDU Guard',
      onApply: () => dispatch(updateGlobalSecurity({ deviceId: activeId, updates: { bpduGuard: true } }))
    });
  }

  if (!stp.portfast) {
    recommendations.push({
      id: 'portfast',
      title: 'Configure Spanning Tree PortFast',
      desc: 'Allows edge host access ports to immediately transition to the forwarding state, bypassing listening and learning delays.',
      actionLabel: 'Configure PortFast',
      onApply: () => dispatch(updateStp({ deviceId: activeId, updates: { portfast: true } }))
    });
  }

  if (recommendations.length === 0) {
    return (
      <div className="enterprise-card" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10B981', fontWeight: 700, fontSize: '13px' }}>
          <CheckCircle2 size={18} />
          <span>All Smart Enterprise Security Recommendations Are Currently Active!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="enterprise-card" style={{ background: 'rgba(245, 158, 11, 0.04)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: '#F59E0B', fontWeight: 700, fontSize: '14px' }}>
        <Zap size={18} />
        <span>Smart Enterprise Policy Recommendations</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {recommendations.map(rec => (
          <div key={rec.id} style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
            borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg-pure)', marginBottom: '4px' }}>{rec.title}</div>
              <p style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: 0, lineHeight: 1.4 }}>{rec.desc}</p>
            </div>
            <button
              onClick={rec.onApply}
              style={{
                alignSelf: 'flex-start', padding: '6px 12px', borderRadius: '6px',
                background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B',
                border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '12px',
                fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)'}
            >
              ⚡ {rec.actionLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
