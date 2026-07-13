import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateL3, addOspfNetwork, removeOspfNetwork } from '../../store/configSlice';
import { Network, Plus, Trash2, ShieldCheck, Cpu, Layers } from 'lucide-react';

export default function OspfManager() {
  const dispatch = useDispatch();
  const activeId = useSelector(state => state.config?.devices?.activeId) || 'dev-01';
  const l3 = useSelector(state => state.config?.l3?.byId?.[activeId]) || { enableOspf: false, ospfProcessId: '100', ospfRouterId: '1.1.1.1', ospfNetworks: [] };

  const [netInput, setNetInput] = useState('');
  const [wildcardInput, setWildcardInput] = useState('0.0.0.255');
  const [areaInput, setAreaInput] = useState('0');

  const handleToggle = (checked) => {
    dispatch(updateL3({ deviceId: activeId, enableOspf: checked }));
  };

  const handleChange = (e) => {
    dispatch(updateL3({ deviceId: activeId, [e.target.name]: e.target.value }));
  };

  const handleAddNetwork = (e) => {
    e.preventDefault();
    if (!netInput) return;
    dispatch(addOspfNetwork({
      deviceId: activeId,
      network: {
        id: `ospf-${Date.now()}`,
        network: netInput,
        wildcard: wildcardInput || '0.0.0.255',
        area: areaInput || '0'
      }
    }));
    setNetInput('');
  };

  const inputStyle = {
    background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
    borderRadius: '8px', padding: '8px 12px', color: 'var(--fg-pure)',
    fontSize: '13px', fontFamily: 'var(--font-mono)', outline: 'none', width: '100%'
  };

  return (
    <div className="enterprise-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-base)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: l3.enableOspf ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.1)',
            border: `1px solid ${l3.enableOspf ? 'rgba(16, 185, 129, 0.3)' : 'rgba(100, 116, 139, 0.2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: l3.enableOspf ? '#10B981' : '#64748B'
          }}>
            <Network size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--fg-pure)', margin: 0 }}>
              OSPF Link-State Dynamic Routing
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: '4px 0 0 0' }}>
              Configure Open Shortest Path First Process ID, Loopback Router-ID, and multi-area network advertisements.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: l3.enableOspf ? '#10B981' : 'var(--fg-muted)' }}>
            {l3.enableOspf ? 'OSPF Active' : 'OSPF Disabled'}
          </span>
          <label className="toggle-switch">
            <input type="checkbox" checked={Boolean(l3.enableOspf)} onChange={e => handleToggle(e.target.checked)} />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {l3.enableOspf ? (
        <div className="animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', padding: '16px 20px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <span className="form-label">OSPF Process ID</span>
              <input type="text" name="ospfProcessId" value={l3.ospfProcessId || '100'} onChange={handleChange} placeholder="100" style={inputStyle} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <span className="form-label">Router-ID (Loopback IP binding)</span>
              <input type="text" name="ospfRouterId" value={l3.ospfRouterId || '1.1.1.1'} onChange={handleChange} placeholder="1.1.1.1" style={inputStyle} />
            </div>
          </div>

          <form onSubmit={handleAddNetwork} style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'flex-end', padding: '18px', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
            <div style={{ flex: '1 1 200px' }} className="form-group" style={{ margin: 0, flex: '1 1 200px' }}>
              <span className="form-label">Network Subnet Prefix</span>
              <input type="text" value={netInput} onChange={e => setNetInput(e.target.value)} placeholder="e.g. 10.10.0.0" required style={inputStyle} />
            </div>
            <div style={{ flex: '1 1 150px' }} className="form-group" style={{ margin: 0, flex: '1 1 150px' }}>
              <span className="form-label">Wildcard Mask</span>
              <input type="text" value={wildcardInput} onChange={e => setWildcardInput(e.target.value)} placeholder="0.0.0.255" style={inputStyle} />
            </div>
            <div style={{ flex: '0 1 110px' }} className="form-group" style={{ margin: 0, flex: '0 1 110px' }}>
              <span className="form-label">Area ID</span>
              <input type="text" value={areaInput} onChange={e => setAreaInput(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
            <button type="submit" style={{ padding: '9px 18px', background: '#10B981', color: '#0F172A', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', height: '37px' }}>
              <Plus size={16} /> Add Network
            </button>
          </form>

          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: 'var(--fg-pure)' }}>Active OSPF Network Advertisements</h4>
            {!l3.ospfNetworks || l3.ospfNetworks.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', background: 'var(--bg-base)', borderRadius: '8px', border: '1px dashed var(--border)', color: 'var(--fg-dim)', fontSize: '13px' }}>
                No OSPF network advertisements defined. Add subnet prefixes above to build OSPF neighbor adjacencies.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {l3.ospfNetworks.map(n => (
                  <div key={n.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                      <span style={{ color: '#10B981', fontWeight: 800 }}>network</span>
                      <span style={{ color: 'var(--fg-pure)', fontWeight: 700 }}>{n.network}</span>
                      <span style={{ color: 'var(--fg-muted)' }}>{n.wildcard}</span>
                      <span style={{ padding: '3px 10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>area {n.area}</span>
                    </div>
                    <button
                      onClick={() => dispatch(removeOspfNetwork({ deviceId: activeId, id: n.id }))}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                      title="Remove network statement"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Illustrated Disabled State */
        <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--bg-base)' }}>
          <p style={{ fontSize: '13px', color: 'var(--fg-muted)', maxWidth: '400px', margin: '0 auto 16px', lineHeight: 1.5 }}>
            OSPF dynamic routing is currently disabled for this device profile. Toggle the switch above to activate link-state route distribution.
          </p>
          <button onClick={() => handleToggle(true)} style={{
            padding: '10px 20px', background: '#10B981', color: '#0F172A', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 800, cursor: 'pointer'
          }}>
            Enable OSPF Routing
          </button>
        </div>
      )}
    </div>
  );
}
