import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addInterface, updateInterface, removeInterface } from '../../store/configSlice';
import { Plus, Trash2, Power, PowerOff, Settings2, Shield, Activity, Zap } from 'lucide-react';

export default function InterfaceManager() {
  const dispatch = useDispatch();
  const activeDevId = useSelector(state => state.config.devices.activeId);
  const allInterfaceIds = useSelector(state => state.config.interfaces.allIds);
  const interfacesById = useSelector(state => state.config.interfaces.byId);
  
  const [expandedIntf, setExpandedIntf] = useState(null);

  const interfaces = useMemo(() => {
    return allInterfaceIds.map(id => interfacesById[id]).filter(i => i.deviceId === activeDevId);
  }, [allInterfaceIds, interfacesById, activeDevId]);

  const handleAdd = () => {
    const id = `int-${Date.now()}`;
    dispatch(addInterface({
      id, deviceId: activeDevId, name: '', description: '', mode: 'access',
      accessVlan: '', voiceVlan: '', trunkAllowed: '', nativeVlan: '',
      status: 'enabled', speed: 'auto', duplex: 'auto',
      portSecurity: false, ipSourceGuard: false, stormControl: '', channelGroup: '', channelMode: '',
      dtp: true, portfast: false, bpduGuard: 'default', poe: 'auto', udld: 'enable',
      portSecMax: 1, portSecViolation: 'restrict', portSecSticky: false
    }));
    setExpandedIntf(id);
  };

  const handleChange = (id, field, value) => {
    dispatch(updateInterface({ id, updates: { [field]: value } }));
  };

  const handleTypeChange = (intf, newType) => {
    const newName = `${newType}${intf.number || ''}`;
    dispatch(updateInterface({ id: intf.id, updates: { type: newType, name: newName } }));
  };

  const handleNumberChange = (intf, newNumber) => {
    const newName = `${intf.type || 'GigabitEthernet'}${newNumber}`;
    dispatch(updateInterface({ id: intf.id, updates: { number: newNumber, name: newName } }));
  };

  const inputStyle = {
    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
    borderRadius: '8px', padding: '8px 12px', color: 'var(--fg-primary)',
    fontSize: '13px', fontFamily: 'var(--font-sans)', outline: 'none', width: '100%'
  };

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
      <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--fg-primary)', margin: 0 }}>Interface Manager</h3>
          <p style={{ fontSize: '13px', color: 'var(--fg-muted)', marginTop: '4px' }}>Configure physical/logical ports, EtherChannel, and advanced settings.</p>
        </div>
        <button onClick={handleAdd} style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
          background: 'rgba(34,197,94,0.12)', color: 'var(--accent)', border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)'
        }}>
          <Plus size={16} /> Add Interface
        </button>
      </div>

      <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {interfaces.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--fg-dim)', fontWeight: 600, border: '2px dashed var(--border-subtle)', borderRadius: '16px' }}>
            No interfaces configured. Click "Add Interface" to begin.
          </div>
        )}
        {interfaces.map(intf => {
          const isNameInvalid = intf.name.length > 0 && /\s/.test(intf.name);
          const isAccessVlanInvalid = intf.accessVlan !== '' && (isNaN(intf.accessVlan) || parseInt(intf.accessVlan) < 1 || parseInt(intf.accessVlan) > 4094);
          const isVoiceVlanInvalid = intf.voiceVlan !== '' && (isNaN(intf.voiceVlan) || parseInt(intf.voiceVlan) < 1 || parseInt(intf.voiceVlan) > 4094);
          const isNativeVlanInvalid = intf.nativeVlan !== '' && (isNaN(intf.nativeVlan) || parseInt(intf.nativeVlan) < 1 || parseInt(intf.nativeVlan) > 4094);
          const isTrunkAllowedInvalid = intf.trunkAllowed !== '' && !/^[\d,\-]+$/.test(intf.trunkAllowed);

          return (
          <div key={intf.id} style={{
            background: 'var(--bg-deep)', padding: '20px', borderRadius: '14px',
            border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            {/* Row 1: Status, Name, Description, Mode, Advanced Toggle, Delete */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button 
                onClick={() => handleChange(intf.id, 'status', intf.status === 'enabled' ? 'disabled' : 'enabled')}
                style={{ 
                  background: intf.status === 'enabled' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', 
                  border: `1px solid ${intf.status === 'enabled' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  color: intf.status === 'enabled' ? 'var(--accent)' : 'var(--destructive)',
                  cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                title={intf.status === 'enabled' ? 'Port Enabled (No Shutdown)' : 'Port Disabled (Shutdown)'}
              >
                {intf.status === 'enabled' ? <Power size={18} /> : <PowerOff size={18} />}
              </button>

              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <select 
                  value={intf.type || 'GigabitEthernet'} 
                  onChange={e => handleTypeChange(intf, e.target.value)}
                  style={{ ...inputStyle, width: '100px', padding: '8px 4px', borderColor: isNameInvalid ? 'var(--destructive)' : 'var(--border-subtle)' }}
                >
                  <option value="GigabitEthernet">Gi (1G)</option>
                  <option value="FastEthernet">Fa (100M)</option>
                  <option value="TenGigabitEthernet">Te (10G)</option>
                  <option value="Ethernet">Eth</option>
                  <option value="Port-channel">Po (LAG)</option>
                  <option value="Loopback">Lo</option>
                  <option value="Vlan">Vlan (SVI)</option>
                </select>
                <input 
                  placeholder="1/0/1" value={intf.number || ''} 
                  onChange={e => handleNumberChange(intf, e.target.value)} 
                  style={{ ...inputStyle, width: '70px', borderColor: isNameInvalid ? 'var(--destructive)' : 'var(--border-subtle)' }} 
                  title={isNameInvalid ? "Interface name cannot contain spaces" : ""}
                />
              </div>
              <input placeholder="Description" value={intf.description} onChange={e => handleChange(intf.id, 'description', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              <select value={intf.mode} onChange={e => handleChange(intf.id, 'mode', e.target.value)} style={{ ...inputStyle, width: '120px', fontWeight: 700 }}>
                <option value="access">Access</option>
                <option value="trunk">Trunk</option>
              </select>
              
              <button onClick={() => setExpandedIntf(expandedIntf === intf.id ? null : intf.id)} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px',
                background: expandedIntf === intf.id ? 'var(--bg-elevated)' : 'transparent',
                color: 'var(--fg-primary)', border: '1px solid var(--border-subtle)',
                borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
              }}>
                <Settings2 size={16} /> Advanced
              </button>

              <button onClick={() => dispatch(removeInterface(intf.id))} style={{
                background: 'none', border: 'none', color: 'var(--destructive)', cursor: 'pointer', padding: '8px'
              }}>
                <Trash2 size={18} />
              </button>
            </div>

            {/* Row 2: VLAN Mapping, Port-Channel, Security Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>VLAN Mapping</span>
                {intf.mode === 'access' ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)', width: '80px' }}>Access ID</span>
                      <input 
                        type="number" placeholder="VLAN ID" value={intf.accessVlan} 
                        onChange={e => handleChange(intf.id, 'accessVlan', e.target.value)} 
                        style={{ ...inputStyle, width: '120px', borderColor: isAccessVlanInvalid ? 'var(--destructive)' : 'var(--border-subtle)' }} 
                        title={isAccessVlanInvalid ? "VLAN ID must be 1-4094" : ""}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)', width: '80px' }}>Voice ID</span>
                      <input 
                        type="number" placeholder="VLAN ID" value={intf.voiceVlan} 
                        onChange={e => handleChange(intf.id, 'voiceVlan', e.target.value)} 
                        style={{ ...inputStyle, width: '120px', borderColor: isVoiceVlanInvalid ? 'var(--destructive)' : 'var(--border-subtle)' }} 
                        title={isVoiceVlanInvalid ? "VLAN ID must be 1-4094" : ""}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)', width: '80px' }}>Allowed</span>
                      <input 
                        placeholder="10,20,30-40" value={intf.trunkAllowed} 
                        onChange={e => handleChange(intf.id, 'trunkAllowed', e.target.value)} 
                        style={{ ...inputStyle, borderColor: isTrunkAllowedInvalid ? 'var(--destructive)' : 'var(--border-subtle)' }} 
                        title={isTrunkAllowedInvalid ? "Invalid format. Use numbers, commas, or dashes (e.g., 10,20-30)" : ""}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)', width: '80px' }}>Native ID</span>
                      <input 
                        type="number" placeholder="99" value={intf.nativeVlan} 
                        onChange={e => handleChange(intf.id, 'nativeVlan', e.target.value)} 
                        style={{ ...inputStyle, width: '120px', borderColor: isNativeVlanInvalid ? 'var(--destructive)' : 'var(--border-subtle)' }} 
                        title={isNativeVlanInvalid ? "VLAN ID must be 1-4094" : ""}
                      />
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Port-Channel & Speed</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)', width: '70px' }}>Group</span>
                  <input type="number" placeholder="1-48" value={intf.channelGroup} onChange={e => handleChange(intf.id, 'channelGroup', e.target.value)} style={{ ...inputStyle, width: '60px' }} />
                  <select value={intf.channelMode} onChange={e => handleChange(intf.id, 'channelMode', e.target.value)} style={{ ...inputStyle, width: '90px', padding: '8px 4px' }}>
                    <option value="">None</option>
                    <option value="active">Active</option>
                    <option value="passive">Passive</option>
                    <option value="desirable">Desirable</option>
                    <option value="auto">Auto</option>
                    <option value="on">On</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)', width: '70px' }}>Speed</span>
                  <select value={intf.speed} onChange={e => handleChange(intf.id, 'speed', e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                    <option value="auto">Auto</option>
                    <option value="10">10 Mbps</option>
                    <option value="100">100 Mbps</option>
                    <option value="1000">1000 Mbps</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Basic Security</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={intf.portSecurity} onChange={e => handleChange(intf.id, 'portSecurity', e.target.checked)} /> Port Security (Enable)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)' }}>Storm %</span>
                  <input type="number" placeholder="5" value={intf.stormControl} onChange={e => handleChange(intf.id, 'stormControl', e.target.value)} style={{ ...inputStyle, width: '70px' }} />
                </div>
              </div>
            </div>

            {/* Advanced Settings Drawer */}
            {expandedIntf === intf.id && (
              <div className="animate-fade-in" style={{ 
                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '12px',
                padding: '20px', marginTop: '4px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '24px'
              }}>
                
                {/* Advanced L2 Protocol Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-blue)', fontSize: '13px', fontWeight: 700 }}>
                    <Activity size={16} /> L2 Protocols & Hardware
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--fg-primary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={intf.dtp} onChange={e => handleChange(intf.id, 'dtp', e.target.checked)} /> Enable DTP (Dynamic Trunking)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--fg-primary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={intf.portfast} onChange={e => handleChange(intf.id, 'portfast', e.target.checked)} /> Enable PortFast (Edge Port)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--fg-muted)', width: '70px' }}>BPDU Guard</span>
                    <select value={intf.bpduGuard} onChange={e => handleChange(intf.id, 'bpduGuard', e.target.value)} style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px' }}>
                      <option value="default">Global Default</option>
                      <option value="enable">Force Enable</option>
                      <option value="disable">Force Disable</option>
                    </select>
                  </div>
                </div>

                {/* PoE & UDLD */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-amber)', fontSize: '13px', fontWeight: 700 }}>
                    <Zap size={16} /> PoE & UDLD
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--fg-muted)', width: '60px' }}>PoE Mode</span>
                    <select value={intf.poe} onChange={e => handleChange(intf.id, 'poe', e.target.value)} style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px' }}>
                      <option value="auto">Auto (Default)</option>
                      <option value="never">Never (Disabled)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--fg-muted)', width: '60px' }}>UDLD</span>
                    <select value={intf.udld} onChange={e => handleChange(intf.id, 'udld', e.target.value)} style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px' }}>
                      <option value="enable">Enable (Normal)</option>
                      <option value="aggressive">Aggressive</option>
                      <option value="disable">Disable</option>
                    </select>
                  </div>
                </div>

                {/* Advanced Port Security */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: intf.portSecurity ? 1 : 0.4, pointerEvents: intf.portSecurity ? 'auto' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontSize: '13px', fontWeight: 700 }}>
                    <Shield size={16} /> Port Security Limits
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--fg-muted)', width: '70px' }}>Max MACs</span>
                    <input type="number" value={intf.portSecMax} onChange={e => handleChange(intf.id, 'portSecMax', e.target.value)} style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px', width: '60px' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--fg-muted)', width: '70px' }}>Violation</span>
                    <select value={intf.portSecViolation} onChange={e => handleChange(intf.id, 'portSecViolation', e.target.value)} style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px' }}>
                      <option value="restrict">Restrict</option>
                      <option value="protect">Protect</option>
                      <option value="shutdown">Shutdown</option>
                    </select>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--fg-primary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={intf.portSecSticky} onChange={e => handleChange(intf.id, 'portSecSticky', e.target.checked)} /> Sticky MAC Learning
                  </label>
                </div>

                {/* Trust & Inspection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-blue)', fontSize: '13px', fontWeight: 700 }}>
                    <Shield size={16} /> Trust & Inspection
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--fg-primary)', cursor: 'pointer' }} title="Trust this port for DHCP replies (typically uplinks)">
                    <input type="checkbox" checked={intf.dhcpSnoopingTrust || false} onChange={e => handleChange(intf.id, 'dhcpSnoopingTrust', e.target.checked)} /> DHCP Snooping Trust
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--fg-primary)', cursor: 'pointer' }} title="Trust this port for ARP replies (typically uplinks)">
                    <input type="checkbox" checked={intf.daiTrust || false} onChange={e => handleChange(intf.id, 'daiTrust', e.target.checked)} /> ARP Inspection Trust
                  </label>
                </div>

              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}
