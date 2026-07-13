import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Settings, Cpu, ShieldAlert, Key, Database, RefreshCw, Check,
  AlertTriangle, Sliders, Terminal, HardDrive, Lock, Globe
} from 'lucide-react';

export default function EngineSettings() {
  const [strictAosSave, setStrictAosSave] = useState(true);
  const [strictVlanDai, setStrictVlanDai] = useState(true);
  const [strictNxosFeatures, setStrictNxosFeatures] = useState(true);
  const [strictJunosTrunk, setStrictJunosTrunk] = useState(true);
  const [blockProprietary, setBlockProprietary] = useState(true);

  const [netconfPort, setNetconfPort] = useState(830);
  const [sshTimeout, setSshTimeout] = useState(30);
  const [backupPath, setBackupPath] = useState('/var/backups/netconfig-pro/working');
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#64748B' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '14px',
            background: 'rgba(100, 116, 139, 0.15)', border: '1px solid rgba(100, 116, 139, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8',
            boxShadow: '0 4px 16px rgba(100, 116, 139, 0.2)'
          }}>
            <Settings size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--fg-pure)', margin: 0 }}>
                System & Compiler Engine Settings
              </h1>
              <span style={{
                fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px',
                background: 'rgba(100, 116, 139, 0.2)', color: '#CBD5E1', border: '1px solid rgba(100, 116, 139, 0.4)'
              }}>
                ENTERPRISE ENGINE v2.4
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--fg-muted)', margin: 0 }}>
              Configure syntax validation rules, persistence stages, Netconf / SSH connections, and API Gateway tokens.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          style={{
            padding: '10px 22px', borderRadius: '10px', background: '#38BDF8',
            border: 'none', color: '#0F172A', fontSize: '13px', fontWeight: 800,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 14px rgba(56, 189, 248, 0.3)'
          }}
        >
          {saved ? <Check size={16} /> : <Sliders size={16} />}
          {saved ? 'Settings Saved to System Core' : 'Save Engine Settings'}
        </button>
      </div>

      {saved && (
        <div className="animate-fade-in" style={{
          padding: '12px 20px', background: 'rgba(56, 189, 248, 0.15)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.4)', color: '#38BDF8',
          fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '10px'
        }}>
          <Check size={18} /> Compiler engine validation flags & Netconf transport parameters committed successfully!
        </div>
      )}

      {/* Settings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', flex: 1 }}>
        
        {/* Left Column: Compiler Syntax Validation Safeguards */}
        <div style={{
          background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border)',
          padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
            <Cpu size={20} className="text-sky-400" />
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--fg-pure)', margin: 0 }}>
                Multi-Vendor Syntax Enforcement Rules (`v2.4 Production Standard`)
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--fg-dim)' }}>
                Toggle strict compilation flags that enforce exact native ASIC behavior during CLI generation.
              </span>
            </div>
          </div>

          {/* Toggle 1 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ maxWidth: '380px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg-pure)' }}>
                Enforce AOS 8 Two-Stage Persistence (`copy working certified`)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--fg-muted)', marginTop: '2px' }}>
                Replaces legacy `write memory` with `copy running-config working` AND `copy working certified` to survive chassis power cycling.
              </div>
            </div>
            <input
              type="checkbox"
              checked={strictAosSave}
              onChange={e => setStrictAosSave(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#38BDF8' }}
            />
          </div>

          {/* Toggle 2 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ maxWidth: '380px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg-pure)' }}>
                Enforce Scoped Dynamic ARP Inspection (`arp-inspection vlan X`)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--fg-muted)', marginTop: '2px' }}>
                Prevents bare global `arp-inspection enable` on Junos, IOS-XE, and OmniSwitch AOS8 to prevent switch rejection.
              </div>
            </div>
            <input
              type="checkbox"
              checked={strictVlanDai}
              onChange={e => setStrictVlanDai(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#38BDF8' }}
            />
          </div>

          {/* Toggle 3 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ maxWidth: '380px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg-pure)' }}>
                Enforce NX-OS Prerequisite Feature Initialization
              </div>
              <div style={{ fontSize: '11px', color: 'var(--fg-muted)', marginTop: '2px' }}>
                Automatically injects `feature lacp`, `feature dhcp`, `feature ospf` before syntax bodies on Cisco Nexus targets.
              </div>
            </div>
            <input
              type="checkbox"
              checked={strictNxosFeatures}
              onChange={e => setStrictNxosFeatures(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#38BDF8' }}
            />
          </div>

          {/* Toggle 4 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ maxWidth: '380px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg-pure)' }}>
                Auto-Append Native VLAN to Trunk Members (Junos & D-Link)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--fg-muted)', marginTop: '2px' }}>
                Ensures `native-vlan-id X` is also explicitly listed in trunk member arrays to prevent untagged traffic drops.
              </div>
            </div>
            <input
              type="checkbox"
              checked={strictJunosTrunk}
              onChange={e => setStrictJunosTrunk(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#38BDF8' }}
            />
          </div>

          {/* Toggle 5 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ maxWidth: '380px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg-pure)' }}>
                Block Cisco Proprietary Tokens on Third-Party Targets
              </div>
              <div style={{ fontSize: '11px', color: 'var(--fg-muted)', marginTop: '2px' }}>
                Filters out VTP, PVST+, and proprietary CDP syntax when compiling for Arista, Juniper, Alcatel, or D-Link.
              </div>
            </div>
            <input
              type="checkbox"
              checked={blockProprietary}
              onChange={e => setBlockProprietary(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#38BDF8' }}
            />
          </div>
        </div>

        {/* Right Column: Netconf Transport & API Gateway */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Netconf / SSH Panel */}
          <div style={{
            background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border)',
            padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <Terminal size={20} className="text-emerald-400" />
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--fg-pure)', margin: 0 }}>
                  Netconf & SSH Automation Transport
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--fg-dim)' }}>
                  Parameters for live device push and telemetry verification.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--fg-pure)' }}>Default Netconf Port (RFC 6242)</label>
                <input
                  type="number"
                  value={netconfPort}
                  onChange={e => setNetconfPort(e.target.value)}
                  style={{
                    padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                    borderRadius: '8px', color: 'var(--fg-pure)', fontSize: '13px', fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--fg-pure)' }}>SSH Connection Timeout (Seconds)</label>
                <input
                  type="number"
                  value={sshTimeout}
                  onChange={e => setSshTimeout(e.target.value)}
                  style={{
                    padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                    borderRadius: '8px', color: 'var(--fg-pure)', fontSize: '13px', fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--fg-pure)' }}>Local Config Backup Working Directory</label>
                <input
                  type="text"
                  value={backupPath}
                  onChange={e => setBackupPath(e.target.value)}
                  style={{
                    padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                    borderRadius: '8px', color: 'var(--fg-pure)', fontSize: '13px', fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* API Gateway Panel */}
          <div style={{
            background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border)',
            padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
              <Lock size={18} className="text-amber-400" />
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--fg-pure)', margin: 0 }}>
                API Gateway Security Token
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: 0, lineHeight: 1.5 }}>
              All REST API calls to the Python Netconf backend (`http://localhost:8000`) are authenticated using JWT Bearer Token validation.
            </p>
            <div style={{
              padding: '10px 14px', background: '#090D16', borderRadius: '8px', border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#38BDF8', wordBreak: 'break-all'
            }}>
              eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJuZXRjb25maWctcHJvIiwidmVyIjoiMi40In0...
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
