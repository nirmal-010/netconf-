import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setWorkspaceNav } from '../store/configSlice';
import { Network, Server, Cloud, Cpu, ShieldAlert } from 'lucide-react';

export default function HomeDashboard() {
  const dispatch = useDispatch();
  const devices = useSelector(state => state.config.devices);
  const interfaceCount = useSelector(state => state.config.interfaces.allIds.length);
  const vlanCount = useSelector(state => state.config.vlans.allIds.length);
  const activeDevice = devices.byId[devices.activeId];

  const Card = ({ icon: Icon, title, desc, value, color, tabId }) => (
    <div
      onClick={() => dispatch(setWorkspaceNav(tabId))}
      style={{
        background: 'var(--bg-card)', borderRadius: '16px',
        border: '1px solid var(--border-subtle)', padding: '28px',
        cursor: 'pointer', transition: 'all 0.2s ease',
        position: 'relative', overflow: 'hidden'
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <Icon size={28} style={{ color, marginBottom: '16px' }} />
      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--fg-primary)', margin: '0 0 6px 0' }}>{title}</h3>
      <p style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: '0 0 20px 0', lineHeight: 1.5 }}>{desc}</p>
      <div style={{ fontSize: '28px', fontWeight: 900, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Hero */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: '20px',
        border: '1px solid var(--border-subtle)', padding: '36px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'
      }}>
        <div>
          <div style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: '20px',
            background: 'rgba(34,197,94,0.1)', color: 'var(--accent)',
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', border: '1px solid rgba(34,197,94,0.2)',
            marginBottom: '16px'
          }}>
            Enterprise Network Configuration Platform
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 900, color: 'var(--fg-primary)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Command Center
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--fg-muted)', maxWidth: '520px', lineHeight: 1.6, margin: 0 }}>
            Select a module below to configure your network fabric, or review the topology status.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginBottom: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)' }}></div>
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>System Online</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--fg-primary)' }}>
            {activeDevice ? `${activeDevice.vendor} ${activeDevice.model}` : '—'}
          </div>
          <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', marginTop: '4px' }}>
            {activeDevice ? activeDevice.platform : ''}
          </div>
        </div>
      </div>

      {/* Module Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <Card icon={Cpu} title="Interfaces" desc="Configure physical and logical ports for the active device." value={`${interfaceCount}`} color="var(--accent)" tabId="interfaces" />
        <Card icon={Network} title="VLANs" desc="Manage the global VLAN database and fabric segmentation." value={`${vlanCount}`} color="var(--accent-blue)" tabId="vlans" />
        <Card icon={ShieldAlert} title="Security" desc="DHCP Snooping, DAI, BPDU Guard, and STP Policies." value="Policy" color="var(--accent-amber)" tabId="security" />
      </div>

      {/* Future Modules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <Card icon={Server} title="Layer 3 Routing" desc="OSPF, BGP, static routes, and SVI configuration." value="Soon" color="#8B5CF6" tabId="l3" />
        <Card icon={Cloud} title="Data Center" desc="VXLAN EVPN, vPC, and spine-leaf fabric design." value="Soon" color="#EC4899" tabId="l2" />
        <Card icon={Server} title="Automation" desc="NETCONF, RESTCONF, Ansible, and Python API generation." value="Soon" color="#06B6D4" tabId="cli" />
      </div>
    </div>
  );
}
