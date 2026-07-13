import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addInterface, updateInterface, removeInterface } from '../../store/configSlice';
import { 
  Plus, Trash2, Power, PowerOff, Settings2, Shield, Activity, Zap, 
  Cpu, CheckCircle2, AlertTriangle, ShieldAlert, Search, Filter, CheckSquare, Square 
} from 'lucide-react';

export default function InterfaceManager() {
  const dispatch = useDispatch();
  const activeDevId = useSelector(state => state.config?.devices?.activeId) || 'dev-01';
  const allInterfaceIds = useSelector(state => state.config?.interfaces?.allIds) || [];
  const interfacesById = useSelector(state => state.config?.interfaces?.byId) || {};
  const allVlansById = useSelector(state => state.config?.vlans?.byId) || {};
  const allVlanIds = useSelector(state => state.config?.vlans?.allIds) || [];

  const [expandedIntf, setExpandedIntf] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkMode, setBulkMode] = useState('access');
  const [bulkVlan, setBulkVlan] = useState('1');

  const interfaces = useMemo(() => {
    return allInterfaceIds.map(id => interfacesById[id]).filter(i => i && i.deviceId === activeDevId);
  }, [allInterfaceIds, interfacesById, activeDevId]);

  const activeVlans = useMemo(() => {
    return allVlanIds.map(id => allVlansById[id]).filter(v => v && v.deviceId === activeDevId && v.vlanId);
  }, [allVlanIds, allVlansById, activeDevId]);

  // Live validation calculation
  let hasMissingNativeVlan = false;
  let hasInvalidVlanId = false;
  interfaces.forEach(intf => {
    if (intf.mode === 'trunk' && !intf.nativeVlan) hasMissingNativeVlan = true;
    if (intf.accessVlan && (isNaN(intf.accessVlan) || parseInt(intf.accessVlan) < 1 || parseInt(intf.accessVlan) > 4094)) {
      hasInvalidVlanId = true;
    }
  });

  // Filter & Sort interfaces
  const filteredInterfaces = useMemo(() => {
    return interfaces.filter(intf => {
      if (modeFilter !== 'all' && intf.mode !== modeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = (intf.name || '').toLowerCase().includes(q);
        const matchDesc = (intf.description || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '', undefined, { numeric: true });
      if (sortBy === 'mode') return (a.mode || '').localeCompare(b.mode || '');
      if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
      return 0;
    });
  }, [interfaces, modeFilter, searchQuery, sortBy]);

  const handleAdd = () => {
    const id = `int-${Date.now()}`;
    dispatch(addInterface({
      id, deviceId: activeDevId, name: 'GigabitEthernet1/0/1', type: 'GigabitEthernet', number: '1/0/1', description: '', mode: 'access',
      accessVlan: '1', voiceVlan: '', trunkAllowed: '1-4094', nativeVlan: '1',
      status: 'enabled', speed: 'auto', duplex: 'auto',
      portSecurity: false, ipSourceGuard: false, stormControl: '', channelGroup: '', channelMode: 'active',
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

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredInterfaces.length && filteredInterfaces.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredInterfaces.map(i => i.id)));
    }
  };

  const handleBulkApply = () => {
    selectedIds.forEach(id => {
      dispatch(updateInterface({
        id,
        updates: { mode: bulkMode, ...(bulkMode === 'access' ? { accessVlan: bulkVlan } : {}) }
      }));
    });
    setSelectedIds(new Set());
  };

  const inputStyle = {
    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
    borderRadius: '8px', padding: '8px 12px', color: 'var(--fg-pure)',
    fontSize: '13px', fontFamily: 'var(--font-mono)', outline: 'none', width: '100%',
    transition: 'border-color 0.15s ease'
  };

  return (
    <div className="enterprise-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header with Colored Icon & Validation Badges */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-base)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981'
          }}>
            <Cpu size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--fg-pure)', margin: 0 }}>Interface & Switchport Manager</h3>
              
              {/* Live Validation Badges */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {!hasMissingNativeVlan && !hasInvalidVlanId && interfaces.length > 0 && (
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} /> ✔ Interfaces Valid
                  </span>
                )}
                {hasMissingNativeVlan && (
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={12} /> ⚠ Native VLAN Missing on Trunk
                  </span>
                )}
                {hasInvalidVlanId && (
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldAlert size={12} /> ❌ Invalid Subnet/VLAN ID
                  </span>
                )}
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: '4px 0 0 0' }}>Configure physical Ethernet ports, LACP Port Channels, and port security.</p>
          </div>
        </div>

        <button onClick={handleAdd} style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px',
          background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
          transition: 'all 0.15s ease', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'}
        >
          <Plus size={16} /> Add Interface
        </button>
      </div>

      {/* Toolbar: Sorting, Filtering, Search, Bulk Edit (Requirement 18) */}
      <div style={{ padding: '14px 24px', background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-dim)' }} />
            <input
              type="text" placeholder="Filter interface name or desc..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '32px', fontSize: '12px', width: '220px', fontFamily: 'var(--font-sans)' }}
            />
          </div>

          {/* Mode Filter Pills */}
          <div style={{ display: 'flex', background: 'var(--bg-base)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            {['all', 'access', 'trunk'].map(mode => (
              <button
                key={mode}
                onClick={() => setModeFilter(mode)}
                style={{
                  padding: '4px 10px', borderRadius: '4px', border: 'none',
                  background: modeFilter === mode ? 'var(--accent-blue)' : 'transparent',
                  color: modeFilter === mode ? '#0F172A' : 'var(--fg-muted)',
                  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--fg-muted)' }}>
            <span>Sort:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...inputStyle, width: '110px', padding: '4px 8px', fontSize: '12px' }}>
              <option value="name">Port Name</option>
              <option value="mode">Mode</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {/* Bulk Edit Toolbar */}
        {selectedIds.size > 0 && (
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(56, 189, 248, 0.1)', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#38BDF8' }}>{selectedIds.size} Selected:</span>
            <select value={bulkMode} onChange={e => setBulkMode(e.target.value)} style={{ ...inputStyle, width: '100px', padding: '4px 8px', fontSize: '12px' }}>
              <option value="access">Access</option>
              <option value="trunk">Trunk</option>
            </select>
            {bulkMode === 'access' && (
              <select value={bulkVlan} onChange={e => setBulkVlan(e.target.value)} style={{ ...inputStyle, width: '110px', padding: '4px 8px', fontSize: '12px' }}>
                <option value="1">VLAN 1</option>
                {activeVlans.map(v => <option key={v.id} value={v.vlanId}>VLAN {v.vlanId} ({v.name || 'VLAN'})</option>)}
              </select>
            )}
            <button onClick={handleBulkApply} style={{
              padding: '6px 14px', background: '#38BDF8', color: '#0F172A', border: 'none',
              borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer'
            }}>
              Apply Bulk Edit
            </button>
          </div>
        )}
      </div>

      {/* Interfaces List */}
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {interfaces.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
            <button onClick={toggleSelectAll} style={{ background: 'none', border: 'none', color: 'var(--fg-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
              {selectedIds.size === filteredInterfaces.length && filteredInterfaces.length > 0 ? <CheckSquare size={16} className="text-blue-400" /> : <Square size={16} />}
              Select All ({filteredInterfaces.length})
            </button>
          </div>
        )}

        {filteredInterfaces.length === 0 ? (
          /* Illustrated Empty State */
          <div style={{
            padding: '50px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', textAlign: 'center', background: 'var(--bg-base)',
            borderRadius: '12px', border: '1px dashed var(--border)'
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', marginBottom: '16px'
            }}>
              <Cpu size={28} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--fg-pure)', marginBottom: '6px' }}>
              {interfaces.length === 0 ? 'No Interfaces Configured Yet' : 'No Matching Interfaces Found'}
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--fg-muted)', maxWidth: '380px', lineHeight: 1.5, marginBottom: '20px' }}>
              {interfaces.length === 0 
                ? 'Add physical Ethernet ports (e.g. GigabitEthernet1/0/1) or LACP Port Channels to get started.'
                : 'Try clearing your search query or mode filters.'}
            </p>
            {interfaces.length === 0 && (
              <button onClick={handleAdd} style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                background: '#10B981', color: '#0F172A', border: 'none', borderRadius: '8px',
                fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
              }}>
                <Plus size={16} /> Create First Interface
              </button>
            )}
          </div>
        ) : (
          filteredInterfaces.map(intf => {
            const isSelected = selectedIds.has(intf.id);
            const isExpanded = expandedIntf === intf.id;
            const isNameInvalid = intf.name && /\s/.test(intf.name);

            return (
              <div key={intf.id} style={{
                background: isSelected ? 'rgba(56, 189, 248, 0.04)' : 'var(--bg-base)',
                padding: '16px 20px', borderRadius: '12px',
                border: `1px solid ${isSelected ? 'rgba(56, 189, 248, 0.4)' : 'var(--border-subtle)'}`,
                display: 'flex', flexDirection: 'column', gap: '14px', transition: 'all 0.15s ease'
              }}>
                {/* Main Row */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={() => toggleSelect(intf.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSelected ? '#38BDF8' : 'var(--fg-dim)' }}>
                      {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>

                    <button 
                      onClick={() => handleChange(intf.id, 'status', intf.status === 'enabled' ? 'disabled' : 'enabled')}
                      style={{ 
                        background: intf.status === 'enabled' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', 
                        border: `1px solid ${intf.status === 'enabled' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        color: intf.status === 'enabled' ? '#10B981' : '#EF4444',
                        cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center'
                      }}
                      title={intf.status === 'enabled' ? 'Port Enabled (no shutdown)' : 'Port Disabled (shutdown)'}
                    >
                      {intf.status === 'enabled' ? <Power size={16} /> : <PowerOff size={16} />}
                    </button>

                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <select 
                        value={intf.type || 'GigabitEthernet'} 
                        onChange={e => handleTypeChange(intf, e.target.value)}
                        style={{ ...inputStyle, width: '135px', padding: '6px 8px', fontSize: '12px' }}
                      >
                        <option value="FastEthernet">FastEthernet</option>
                        <option value="GigabitEthernet">GigabitEthernet</option>
                        <option value="TenGigabitEthernet">TenGigabitEthernet</option>
                        <option value="TwentyFiveGigE">TwentyFiveGigE</option>
                        <option value="FortyGigabitEthernet">FortyGigabitEthernet</option>
                        <option value="HundredGigE">HundredGigE</option>
                        <option value="Port-channel">Port-channel</option>
                      </select>
                      <input 
                        type="text" placeholder="1/0/1" value={intf.number || ''} 
                        onChange={e => handleNumberChange(intf, e.target.value)}
                        style={{ ...inputStyle, width: '75px', padding: '6px 8px', fontSize: '12px', borderColor: isNameInvalid ? '#EF4444' : 'var(--border-subtle)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '200px' }}>
                    <input 
                      type="text" placeholder="Port Description (e.g. Core Uplink)" value={intf.description || ''} 
                      onChange={e => handleChange(intf.id, 'description', e.target.value)}
                      style={{ ...inputStyle, fontFamily: 'var(--font-sans)', fontSize: '12px' }}
                    />

                    <select 
                      value={intf.mode || 'access'} 
                      onChange={e => handleChange(intf.id, 'mode', e.target.value)}
                      style={{ ...inputStyle, width: '100px', padding: '6px 8px', fontSize: '12px', fontWeight: 700, color: intf.mode === 'trunk' ? '#A855F7' : '#38BDF8' }}
                    >
                      <option value="access">Access</option>
                      <option value="trunk">Trunk</option>
                    </select>

                    {intf.mode === 'access' ? (
                      <select 
                        value={intf.accessVlan || '1'} 
                        onChange={e => handleChange(intf.id, 'accessVlan', e.target.value)}
                        style={{ ...inputStyle, width: '130px', padding: '6px 8px', fontSize: '12px' }}
                      >
                        <option value="1">VLAN 1 (Default)</option>
                        {activeVlans.map(v => <option key={v.id} value={v.vlanId}>VLAN {v.vlanId} ({v.name || 'VLAN'})</option>)}
                      </select>
                    ) : (
                      <input 
                        type="text" placeholder="Allowed VLANs (1-4094)" value={intf.trunkAllowed || '1-4094'} 
                        onChange={e => handleChange(intf.id, 'trunkAllowed', e.target.value)}
                        style={{ ...inputStyle, width: '130px', padding: '6px 8px', fontSize: '12px' }}
                      />
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => setExpandedIntf(isExpanded ? null : intf.id)}
                      style={{
                        background: isExpanded ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)', color: isExpanded ? '#38BDF8' : 'var(--fg-dim)',
                        cursor: 'pointer', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <Settings2 size={14} /> Advanced {isExpanded ? '▲' : '▼'}
                    </button>
                    <button onClick={() => dispatch(removeInterface(intf.id))} style={{
                      background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#EF4444', cursor: 'pointer', padding: '6px 8px', borderRadius: '6px'
                    }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Advanced Expansion Drawer */}
                {isExpanded && (
                  <div className="animate-fade-in" style={{
                    padding: '16px', background: 'var(--bg-panel)', borderRadius: '8px',
                    border: '1px solid var(--border-subtle)', display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '12px'
                  }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <span className="form-label">Voice VLAN ID</span>
                      <input type="number" placeholder="e.g. 100" value={intf.voiceVlan || ''} onChange={e => handleChange(intf.id, 'voiceVlan', e.target.value)} style={{ ...inputStyle, padding: '6px 8px' }} />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <span className="form-label">Native VLAN (Trunk)</span>
                      <input type="number" placeholder="1" value={intf.nativeVlan || ''} onChange={e => handleChange(intf.id, 'nativeVlan', e.target.value)} style={{ ...inputStyle, padding: '6px 8px' }} />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <span className="form-label">EtherChannel Group ID</span>
                      <input type="number" placeholder="e.g. 1" value={intf.channelGroup || ''} onChange={e => handleChange(intf.id, 'channelGroup', e.target.value)} style={{ ...inputStyle, padding: '6px 8px' }} />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <span className="form-label">Port-Security Enforcement</span>
                      <label className="toggle-switch" style={{ marginTop: '4px' }}>
                        <input type="checkbox" checked={Boolean(intf.portSecurity)} onChange={e => handleChange(intf.id, 'portSecurity', e.target.checked)} />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <span className="form-label">Spanning Tree BPDU Guard</span>
                      <select value={intf.bpduGuard || 'default'} onChange={e => handleChange(intf.id, 'bpduGuard', e.target.value)} style={{ ...inputStyle, padding: '6px 8px' }}>
                        <option value="default">Default (Global)</option>
                        <option value="enable">Enable (Strict)</option>
                        <option value="disable">Disable</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <span className="form-label">Spanning Tree PortFast</span>
                      <label className="toggle-switch" style={{ marginTop: '4px' }}>
                        <input type="checkbox" checked={Boolean(intf.portfast)} onChange={e => handleChange(intf.id, 'portfast', e.target.checked)} />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
