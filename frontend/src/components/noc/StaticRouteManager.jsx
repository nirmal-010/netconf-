import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addStaticRoute, removeStaticRoute } from '../../store/configSlice';
import { Route, Plus, Trash2, ArrowRight, Layers } from 'lucide-react';

export default function StaticRouteManager() {
  const dispatch = useDispatch();
  const activeId = useSelector(state => state.config?.devices?.activeId) || 'dev-01';
  const l3 = useSelector(state => state.config?.l3?.byId?.[activeId]) || { staticRoutes: [] };

  const [prefixInput, setPrefixInput] = useState('');
  const [maskInput, setMaskInput] = useState('255.255.255.0');
  const [nextHopInput, setNextHopInput] = useState('');
  const [distanceInput, setDistanceInput] = useState('1');

  const handleAddRoute = (e) => {
    e.preventDefault();
    if (!prefixInput || !nextHopInput) return;
    dispatch(addStaticRoute({
      deviceId: activeId,
      route: {
        id: `rt-${Date.now()}`,
        prefix: prefixInput,
        mask: maskInput || '255.255.255.0',
        nextHop: nextHopInput,
        distance: distanceInput || '1'
      }
    }));
    setPrefixInput('');
    setNextHopInput('');
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
            background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8'
          }}>
            <Route size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--fg-pure)', margin: 0 }}>
              Static & Default Gateway Routing Table
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: '4px 0 0 0' }}>
              Configure explicit next-hop routing statements, default gateways (`0.0.0.0/0`), and Administrative Distance metrics.
            </p>
          </div>
        </div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#38BDF8', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '6px 12px', borderRadius: '6px' }}>
          {l3.staticRoutes.length} Active Route Entries
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <form onSubmit={handleAddRoute} style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'flex-end', padding: '18px', background: 'rgba(56, 189, 248, 0.04)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px' }}>
          <div style={{ flex: '1 1 180px' }} className="form-group" style={{ margin: 0, flex: '1 1 180px' }}>
            <span className="form-label">Destination Subnet Prefix</span>
            <input type="text" value={prefixInput} onChange={e => setPrefixInput(e.target.value)} placeholder="e.g. 192.168.100.0" required style={inputStyle} />
          </div>
          <div style={{ flex: '1 1 150px' }} className="form-group" style={{ margin: 0, flex: '1 1 150px' }}>
            <span className="form-label">Subnet Mask</span>
            <input type="text" value={maskInput} onChange={e => setMaskInput(e.target.value)} placeholder="255.255.255.0" style={inputStyle} />
          </div>
          <div style={{ flex: '1 1 180px' }} className="form-group" style={{ margin: 0, flex: '1 1 180px' }}>
            <span className="form-label">Next-Hop Gateway IP</span>
            <input type="text" value={nextHopInput} onChange={e => setNextHopInput(e.target.value)} placeholder="e.g. 10.10.0.1" required style={inputStyle} />
          </div>
          <div style={{ flex: '0 1 100px' }} className="form-group" style={{ margin: 0, flex: '0 1 100px' }}>
            <span className="form-label">AD / Metric</span>
            <input type="text" value={distanceInput} onChange={e => setDistanceInput(e.target.value)} placeholder="1" style={inputStyle} />
          </div>
          <button type="submit" style={{ padding: '9px 18px', background: '#38BDF8', color: '#0F172A', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', height: '37px' }}>
            <Plus size={16} /> Add Route Entry
          </button>
        </form>

        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: 'var(--fg-pure)' }}>Configured Routing Table Entries</h4>
          {!l3.staticRoutes || l3.staticRoutes.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', background: 'var(--bg-base)', borderRadius: '8px', border: '1px dashed var(--border)', color: 'var(--fg-dim)', fontSize: '13px' }}>
              No static routing table entries defined. Add your destination prefix and next-hop IP above to populate the FIB.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {l3.staticRoutes.map(rt => (
                <div key={rt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                    <span style={{ color: '#38BDF8', fontWeight: 800 }}>ip route</span>
                    <span style={{ color: 'var(--fg-pure)', fontWeight: 700 }}>{rt.prefix}</span>
                    <span style={{ color: 'var(--fg-muted)' }}>{rt.mask}</span>
                    <ArrowRight size={14} className="text-slate-500" />
                    <span style={{ color: '#10B981', fontWeight: 700 }}>{rt.nextHop}</span>
                    {rt.distance && rt.distance !== '1' && (
                      <span style={{ padding: '3px 8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', fontSize: '11px', color: 'var(--fg-muted)', fontWeight: 700 }}>AD {rt.distance}</span>
                    )}
                  </div>
                  <button
                    onClick={() => dispatch(removeStaticRoute({ deviceId: activeId, id: rt.id }))}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                    title="Remove route entry"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
