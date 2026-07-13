import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateL3, addBgpNeighbor, removeBgpNeighbor } from '../../store/configSlice';
import { Globe, Plus, Trash2, Layers } from 'lucide-react';

export default function BgpManager() {
  const dispatch = useDispatch();
  const activeId = useSelector(state => state.config?.devices?.activeId) || 'dev-01';
  const l3 = useSelector(state => state.config?.l3?.byId?.[activeId]) || { enableBgp: false, bgpAsn: '65100', bgpRouterId: '1.1.1.1', bgpNeighbors: [] };

  const [ipInput, setIpInput] = useState('');
  const [remoteAsInput, setRemoteAsInput] = useState('65200');
  const [descInput, setDescInput] = useState('Upstream-Peer');

  const handleToggle = (checked) => {
    dispatch(updateL3({ deviceId: activeId, enableBgp: checked }));
  };

  const handleChange = (e) => {
    dispatch(updateL3({ deviceId: activeId, [e.target.name]: e.target.value }));
  };

  const handleAddNeighbor = (e) => {
    e.preventDefault();
    if (!ipInput || !remoteAsInput) return;
    dispatch(addBgpNeighbor({
      deviceId: activeId,
      neighbor: {
        id: `bgp-${Date.now()}`,
        ip: ipInput,
        remoteAs: remoteAsInput,
        description: descInput || 'BGP Peer'
      }
    }));
    setIpInput('');
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
            background: l3.enableBgp ? 'rgba(168, 85, 247, 0.12)' : 'rgba(100, 116, 139, 0.1)',
            border: `1px solid ${l3.enableBgp ? 'rgba(168, 85, 247, 0.3)' : 'rgba(100, 116, 139, 0.2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: l3.enableBgp ? '#A855F7' : '#64748B'
          }}>
            <Globe size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--fg-pure)', margin: 0 }}>
              BGP Exterior Gateway Peering
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: '4px 0 0 0' }}>
              Orchestrate Border Gateway Protocol Autonomous System Numbers (ASN), Router-ID, and eBGP/iBGP peer adjacencies.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: l3.enableBgp ? '#A855F7' : 'var(--fg-muted)' }}>
            {l3.enableBgp ? 'BGP Active' : 'BGP Disabled'}
          </span>
          <label className="toggle-switch">
            <input type="checkbox" checked={Boolean(l3.enableBgp)} onChange={e => handleToggle(e.target.checked)} />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {l3.enableBgp ? (
        <div className="animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', padding: '16px 20px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <span className="form-label">Local Autonomous System Number (ASN)</span>
              <input type="text" name="bgpAsn" value={l3.bgpAsn || '65100'} onChange={handleChange} placeholder="65100" style={inputStyle} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <span className="form-label">BGP Router-ID</span>
              <input type="text" name="bgpRouterId" value={l3.bgpRouterId || '1.1.1.1'} onChange={handleChange} placeholder="1.1.1.1" style={inputStyle} />
            </div>
          </div>

          <form onSubmit={handleAddNeighbor} style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'flex-end', padding: '18px', background: 'rgba(168, 85, 247, 0.04)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '8px' }}>
            <div style={{ flex: '1 1 180px' }} className="form-group" style={{ margin: 0, flex: '1 1 180px' }}>
              <span className="form-label">Neighbor IP Address</span>
              <input type="text" value={ipInput} onChange={e => setIpInput(e.target.value)} placeholder="e.g. 10.10.0.2" required style={inputStyle} />
            </div>
            <div style={{ flex: '0 1 140px' }} className="form-group" style={{ margin: 0, flex: '0 1 140px' }}>
              <span className="form-label">Remote ASN</span>
              <input type="text" value={remoteAsInput} onChange={e => setRemoteAsInput(e.target.value)} placeholder="65200" required style={inputStyle} />
            </div>
            <div style={{ flex: '1 1 200px' }} className="form-group" style={{ margin: 0, flex: '1 1 200px' }}>
              <span className="form-label">Description Tag</span>
              <input type="text" value={descInput} onChange={e => setDescInput(e.target.value)} placeholder="Upstream-Peer" style={{ ...inputStyle, fontFamily: 'var(--font-sans)' }} />
            </div>
            <button type="submit" style={{ padding: '9px 18px', background: '#A855F7', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', height: '37px' }}>
              <Plus size={16} /> Add Neighbor
            </button>
          </form>

          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: 'var(--fg-pure)' }}>Active BGP Peering Relationships</h4>
            {!l3.bgpNeighbors || l3.bgpNeighbors.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', background: 'var(--bg-base)', borderRadius: '8px', border: '1px dashed var(--border)', color: 'var(--fg-dim)', fontSize: '13px' }}>
                No BGP peering relationships defined. Add your neighbor IP and remote ASN above to initiate session establishment.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {l3.bgpNeighbors.map(nbr => (
                  <div key={nbr.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                      <span style={{ color: '#C084FC', fontWeight: 800 }}>neighbor</span>
                      <span style={{ color: 'var(--fg-pure)', fontWeight: 700 }}>{nbr.ip}</span>
                      <span style={{ padding: '3px 10px', background: 'rgba(168, 85, 247, 0.15)', color: '#C084FC', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>remote-as {nbr.remoteAs}</span>
                      {nbr.description && <span style={{ color: 'var(--fg-muted)', fontSize: '12px', fontFamily: 'var(--font-sans)' }}>({nbr.description})</span>}
                    </div>
                    <button
                      onClick={() => dispatch(removeBgpNeighbor({ deviceId: activeId, id: nbr.id }))}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                      title="Remove peer"
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
        <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--bg-base)' }}>
          <p style={{ fontSize: '13px', color: 'var(--fg-muted)', maxWidth: '400px', margin: '0 auto 16px', lineHeight: 1.5 }}>
            BGP exterior gateway routing is currently disabled. Activate the switch above to configure Autonomous System peering.
          </p>
          <button onClick={() => handleToggle(true)} style={{
            padding: '10px 20px', background: '#A855F7', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 800, cursor: 'pointer'
          }}>
            Enable BGP Routing
          </button>
        </div>
      )}
    </div>
  );
}
