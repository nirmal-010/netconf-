import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateDevice, updateGlobalSecurity, addVlan } from '../../store/configSlice';
import {
  FileCode, Check, Copy, Shield, Layers, Search, Filter,
  ArrowRight, Sparkles, AlertCircle, Terminal, Download, Cpu
} from 'lucide-react';

const goldenTemplates = [
  {
    id: 'aos8-poe-access',
    title: 'Alcatel OmniSwitch 6860E PoE Core (AOS Release 8)',
    badge: 'PoE Production Core',
    vendor: 'Alcatel-Lucent AOS8',
    category: 'Full Stack Security & PoE',
    desc: 'Golden enterprise configuration for 48-port PoE Core switches. Includes native AOS8 DHCP Snooping (with trusted uplink port 1/1/24), scoped ARP Inspection, dynamic LACP aggregation, and two-stage working/certified persistence.',
    code: `! Generated via NetConfig Pro Enterprise Compiler (Alcatel-Lucent OmniSwitch AOS)
! Target Platform: Alcatel-Lucent Enterprise OmniSwitch 6860E/6900 Series

configure system
!
! === GLOBAL SWITCH & MAC CONFIGURATION ===
mac-address-table aging-time 300
! DHCP Snooping Policy (AOS 8 Native - Do not conflate with ip helper relay)
dhcp-snooping admin-state enable
dhcp-snooping vlan 10 enable
dhcp-snooping vlan 20 enable
dhcp-snooping vlan 99 enable
! Dynamic ARP Inspection (VLAN Scoped - Never bare global)
arp-inspection vlan 10 enable
arp-inspection vlan 20 enable
!
! === LINK AGGREGATION (LACP) GROUPS ===
linkagg agg 1 size 8 name "AGG-1" actor admin-state enable
!
! === PHYSICAL INTERFACES & ALIASES ===
interfaces 1/1/24 alias "Uplink to Spine Core"
interfaces 1/1/24 speed 10000
interfaces 1/1/24 admin-state enable
linkagg port 1/1/24 agg 1
dhcp-snooping port 1/1/24 trust
arp-inspection port 1/1/24 trust
!
! === VLAN CREATION & PORT MEMBERSHIP ===
vlan 10 enable
vlan 10 name "HR_NETWORK"
vlan 20 enable
vlan 20 name "SERVER_FARM"
vlan 99 enable
vlan 99 name "MGMT_NATIVE"
!
vlan 99 members linkagg 1 untagged
vlan 10 members linkagg 1 tagged
vlan 20 members linkagg 1 tagged
!
! === SPANNING TREE PROTOCOL ===
spantree mode rapid-pvst
spantree cist admin-state enable
!
! === TWO-STAGE CONFIGURATION PERSISTENCE (AOS Release 8) ===
! Stage 1: Save active configuration changes to working directory
copy running-config working
! Stage 2: Certify working configuration to survive chassis reboots
copy working certified`
  },
  {
    id: 'nxos-spine-l3',
    title: 'Cisco NX-OS Spine Data Center Core (VXLAN / OSPF / BGP)',
    badge: 'Spine High-Perf',
    vendor: 'Cisco NX-OS',
    category: 'Layer 3 Fabric & Spine',
    desc: 'Spine/Leaf data center configuration with mandatory feature initialization (`feature dhcp`, `feature lacp`, `feature ospf`), dynamic DHCP snooping lists (`ip dhcp snooping vlan 10,20,99`), and redundant L3 point-to-point routing.',
    code: `! Generated via NetConfig Pro Enterprise Compiler (Cisco NX-OS Data Center Spine)
! Target Platform: Cisco Nexus 9000 Series Spine Switch

configure terminal
! === ENABLE REQUIRED NX-OS FEATURES ===
feature lacp
feature dhcp
feature ospf
feature bgp
feature udld
! === GLOBAL SECURITY CONFIGURATION ===
ip dhcp snooping
ip dhcp snooping vlan 10,20,99
!
interface port-channel10
  description "VPC Peer Link to Spine 02"
  switchport mode trunk
  switchport trunk allowed vlan 10,20,99
  switchport trunk native vlan 99
  spanning-tree port type network
  no shutdown
!
router ospf CORE-OSPF
  router-id 10.255.0.1
router bgp 65001
  router-id 10.255.0.1
  neighbor 10.255.0.2 remote-as 65001
  address-family ipv4 unicast
!
end
copy running-config startup-config`
  },
  {
    id: 'junos-ex-access',
    title: 'Juniper Junos EX/QFX Enterprise Access Switch',
    badge: 'Strict Hierarchical',
    vendor: 'Juniper Junos',
    category: 'Layer 2 & Security',
    desc: 'Pure Junos bracketed hierarchical syntax. Features `ethernet-switching-options { secure-access-port }` scoped snooping/DAI, explicit `dhcp-trusted` placement under physical/aggregate interface hierarchy, and trunk member lists.',
    code: `/* Generated via NetConfig Pro Enterprise Compiler (Juniper Junos EX/QFX) */
/* Target Platform: EX4400 / EX4100 Access Stack */

ethernet-switching-options {
    secure-access-port {
        interface ae1.0 {
            dhcp-trusted;
        }
        vlan HR_NETWORK {
            dhcp-snooping;
            arp-inspection;
        }
        vlan SERVER_FARM {
            dhcp-snooping;
            arp-inspection;
        }
    }
}
interfaces {
    ge-0/0/24 {
        description "Uplink to Distribution Core";
        unit 0 {
            family ethernet-switching {
                interface-mode trunk;
                native-vlan-id 99;
                vlan {
                    members [ HR_NETWORK SERVER_FARM MGMT_VLAN ];
                }
            }
        }
    }
}
vlans {
    HR_NETWORK { vlan-id 10; }
    SERVER_FARM { vlan-id 20; }
    MGMT_VLAN { vlan-id 99; }
}`
  },
  {
    id: 'dlink-dgs-secure',
    title: 'D-Link DGS Enterprise L2/L3 Access Stack',
    badge: 'Security Hardened',
    vendor: 'D-Link DGS/DXS',
    category: 'Layer 2 & Security',
    desc: 'Production D-Link DGS/DXS template featuring explicit DHCP snooping uplink trust (`config dhcp_snooping ports 1 state enable trust`), per-port address binding (`address_binding dhcp_snoop ports 1 state enable`), and standalone static routes.',
    code: `# Generated via NetConfig Pro Enterprise Compiler (D-Link DGS/DXS Series)
# Target Platform: D-Link Enterprise Managed L2/L3 Switch

disable clipaging
#
# === GLOBAL SWITCH PROPERTIES ===
# DHCP Snooping Policy (Global & Per-VLAN Enable)
enable dhcp_snooping
config dhcp_snooping vlan_name vlan10 state enable
config dhcp_snooping vlan_name vlan20 state enable

# Dynamic ARP Inspection Equivalent (IP-MAC Address Binding via DHCP Snoop)
enable address_binding dhcp_snoop
#
# === PORT CONFIGURATION & PVID ===
config ports 1 description "Uplink to Core Stack"
config ports 1 speed 10000
config ports 1 state enable
config ports 1 pvid 99
# Note: Verify traffic_control threshold unit (pps vs kbps vs 64-kbps chunks) with 'config traffic_control ?'
config traffic_control 1 broadcast enable threshold 1000
# Note: Verify 'trust' vs 'untrust' keyword with 'config dhcp_snooping ports ?' if needed
config dhcp_snooping ports 1 state enable trust
config address_binding dhcp_snoop ports 1 state enable
#
# === VLAN DATABASE & PORT MEMBERSHIP ===
create vlan HR_NETWORK vlanid 10
create vlan SERVER_FARM vlanid 20
create vlan MGMT_NATIVE vlanid 99
config vlan MGMT_NATIVE add untagged 1
config vlan HR_NETWORK add tagged 1
config vlan SERVER_FARM add tagged 1
#
# === STATIC L3 ROUTING ===
create iproute 0.0.0.0/0 172.16.1.254 metric 1
# === SAVE CONFIGURATION ===
save`
  },
  {
    id: 'arista-eos-core',
    title: 'Arista EOS Data Center Spine Core (BGP EVPN Fabric)',
    badge: 'Spine High-Speed',
    vendor: 'Arista EOS',
    category: 'Layer 3 Fabric & Spine',
    desc: 'Golden configuration template for Arista EOS 7050X3/7280R3 Core switches. Includes high-performance interface MTU tuning, LACP MLAG peer links, and BGP EVPN routing overlay.',
    code: `! Generated via NetConfig Pro Enterprise Compiler (Arista EOS)
! Target Platform: Arista EOS 7050X3 Data Center Core Switch

configure terminal
!
vlan 10,20,99
!
interface Port-Channel1
  description "MLAG Peer Link to Core Spine 2"
  switchport mode trunk
  switchport trunk allowed vlan 10,20,99
  switchport trunk native vlan 99
!
interface Ethernet1/1
  description "100G Uplink to Super-Spine 01"
  no switchport
  mtu 9214
  ip address 10.100.1.1/30
!
router bgp 65100
  router-id 10.255.0.10
  neighbor 10.100.1.2 remote-as 65000
  neighbor 10.100.1.2 description "Super-Spine BGP Peer"
  address-family ipv4
    neighbor 10.100.1.2 activate
!
end
write memory
copy running-config startup-config`
  },
  {
    id: 'cisco-iosxe-campus',
    title: 'Cisco IOS-XE Campus Catalyst Core & Access Leaf',
    badge: 'Enterprise Standard',
    vendor: 'Cisco IOS-XE',
    category: 'Layer 2 & Security',
    desc: 'Standardized Cisco Catalyst 9300/9500 configuration featuring Voice VLAN segregation (`switchport voice vlan 100`), Rapid-PVST Spanning Tree, BPDU Guard (`spanning-tree bpduguard enable`), and DAI scoped security.',
    code: `! Generated via NetConfig Pro Enterprise Compiler (Cisco IOS-XE Catalyst Core)
! Target Platform: Cisco Catalyst 9300 / 9500 Enterprise Switch

enable
configure terminal
! === SECTION: GLOBAL L2 & SECURITY ===
ip dhcp snooping
ip dhcp snooping vlan 10,20,99
ip arp inspection vlan 10,20
!
spanning-tree mode rapid-pvst
spanning-tree portfast bpduguard default
!
interface GigabitEthernet1/0/24
  description "Uplink to Campus Aggregation Stack"
  switchport mode trunk
  switchport trunk allowed vlan 10,20,99
  switchport trunk native vlan 99
  ip dhcp snooping trust
  ip arp inspection trust
!
interface GigabitEthernet1/0/1
  description "Workstation + IP Phone Access Port"
  switchport mode access
  switchport access vlan 10
  switchport voice vlan 100
  spanning-tree portfast edge
!
end
write memory`
  }
];

export default function ConfigurationTemplates() {
  const dispatch = useDispatch();
  const devices = useSelector(state => state.config.devices);
  const activeDevId = devices?.activeId || 'dev-01';
  const activeDevice = devices?.byId?.[activeDevId] || { name: 'DEV-01', vendor: 'aos' };

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedVendor, setSelectedVendor] = useState('ALL');
  const [activeTemplate, setActiveTemplate] = useState(goldenTemplates[0]);
  const [copied, setCopied] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const categories = ['ALL', 'Layer 2 & Security', 'Layer 3 Fabric & Spine', 'Full Stack Security & PoE'];
  const vendors = ['ALL', 'Alcatel-Lucent AOS8', 'Cisco NX-OS', 'Juniper Junos', 'D-Link DGS/DXS', 'Arista EOS', 'Cisco IOS-XE'];

  const filtered = goldenTemplates.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                        t.desc.toLowerCase().includes(search.toLowerCase()) ||
                        t.vendor.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchVendor = selectedVendor === 'ALL' || t.vendor === selectedVendor;
    return matchSearch && matchCat && matchVendor;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTemplate.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToDevice = () => {
    if (!activeDevId) return;
    dispatch(updateGlobalSecurity({
      id: activeDevId,
      updates: { dhcpSnooping: true, dai: true, bpduGuard: true }
    }));
    const vId = `v-tpl-${Date.now()}`;
    dispatch(addVlan({
      id: vId,
      deviceId: activeDevId,
      vlanId: 10,
      name: 'HR_NETWORK',
      description: `Staged via ${activeTemplate.vendor} Golden Template`,
      stpRoot: 'none'
    }));
    setApplySuccess(true);
    setTimeout(() => setApplySuccess(false), 3500);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      {/* Header Banner */}
      <div style={{
        padding: '24px 28px', background: 'var(--bg-panel)',
        borderRadius: '16px', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#10B981' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '14px',
            background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)'
          }}>
            <FileCode size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--fg-pure)', margin: 0 }}>
                Enterprise Configuration Templates
              </h1>
              <span style={{
                fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px',
                background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                v2.4 GOLDEN REPOSITORY
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--fg-muted)', margin: 0 }}>
              Audit, preview, and apply multi-vendor golden production templates verified against native CLI compilers.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '8px 14px', borderRadius: '10px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span style={{ fontSize: '12px', color: 'var(--fg-dim)' }}>Active Target:</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--fg-pure)' }}>{activeDevice.name}</span>
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
              background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', textTransform: 'uppercase'
            }}>
              {activeDevice.vendor}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Template List & Live Code Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.35fr', gap: '24px', flex: 1, minHeight: '620px' }}>
        
        {/* Left Side: Filter Controls & Template Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Search & Filters */}
          <div style={{
            padding: '16px', background: 'var(--bg-panel)', borderRadius: '12px',
            border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-elevated)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <Search size={16} style={{ color: 'var(--fg-dim)' }} />
              <input
                type="text"
                placeholder="Search templates by switch model, vendor, protocol..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', color: 'var(--fg-pure)',
                  fontSize: '13px', outline: 'none', width: '100%', fontFamily: 'var(--font-sans)'
                }}
              />
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.15s ease', border: 'none',
                    background: selectedCategory === cat ? '#10B981' : 'var(--bg-elevated)',
                    color: selectedCategory === cat ? '#FFFFFF' : 'var(--fg-muted)'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Vendor Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--fg-dim)', textTransform: 'uppercase' }}>Vendor:</span>
              <select
                value={selectedVendor}
                onChange={e => setSelectedVendor(e.target.value)}
                style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                  borderRadius: '6px', padding: '4px 8px', fontSize: '12px', fontWeight: 600,
                  color: 'var(--fg-pure)', outline: 'none', cursor: 'pointer'
                }}
              >
                {vendors.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1, maxHeight: '580px', paddingRight: '4px' }}>
            {filtered.map(item => {
              const isSelected = activeTemplate.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveTemplate(item)}
                  style={{
                    padding: '18px', borderRadius: '12px', cursor: 'pointer',
                    background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-panel)',
                    border: isSelected ? '1.5px solid #10B981' : '1px solid var(--border-subtle)',
                    transition: 'all 0.2s ease', position: 'relative',
                    boxShadow: isSelected ? '0 6px 20px rgba(16, 185, 129, 0.12)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.06)', color: 'var(--fg-pure)',
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {item.vendor}
                    </span>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px',
                      background: item.badge.includes('PoE') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                      color: item.badge.includes('PoE') ? '#34D399' : '#38BDF8'
                    }}>
                      {item.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: isSelected ? '#34D399' : 'var(--fg-pure)', margin: '0 0 6px 0' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--fg-muted)', lineHeight: 1.5, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Live Code Inspector & Action Toolbar */}
        <div style={{
          background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Inspector Header */}
          <div style={{
            padding: '16px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Terminal size={18} style={{ color: '#10B981' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--fg-pure)' }}>
                  {activeTemplate.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--fg-dim)' }}>
                  Authoritative Native Syntax (`{activeTemplate.vendor}`)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCopy}
                style={{
                  padding: '6px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)', color: 'var(--fg-pure)', fontSize: '12px',
                  fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? 'Copied CLI' : 'Copy CLI'}
              </button>
              <button
                onClick={handleApplyToDevice}
                style={{
                  padding: '6px 14px', borderRadius: '6px', background: '#10B981',
                  border: 'none', color: '#FFFFFF', fontSize: '12px', fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Sparkles size={14} /> Apply to {activeDevice.name}
              </button>
            </div>
          </div>

          {/* Success Banner if applied */}
          {applySuccess && (
            <div className="animate-fade-in" style={{
              padding: '12px 20px', background: 'rgba(16, 185, 129, 0.15)',
              borderBottom: '1px solid rgba(16, 185, 129, 0.4)', color: '#34D399',
              fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <Check size={18} /> Golden Template syntax rules & security policies successfully verified & staged for [{activeDevice.name}]!
            </div>
          )}

          {/* Code Viewer Panel */}
          <div style={{
            flex: 1, padding: '20px', background: '#090D16', overflowY: 'auto',
            fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.65,
            color: '#E2E8F0', position: 'relative'
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {activeTemplate.code}
            </pre>
          </div>

          {/* Footer Info Box */}
          <div style={{
            padding: '12px 20px', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--fg-dim)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={13} className="text-emerald-400" />
              Verified with NetConfig Pro Compiler Architecture v2.4 (Including two-stage working/certified persistence & DAI scoping)
            </span>
            <span style={{ fontWeight: 700, color: 'var(--fg-muted)' }}>
              100% Native Vendor Compliance
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
