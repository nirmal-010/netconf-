import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addVlan, updateVlan, removeVlan } from '../../store/configSlice';
import { Plus, Trash2 } from 'lucide-react';

export default function VlanManager() {
  const dispatch = useDispatch();
  const activeDevId = useSelector(state => state.config.devices.activeId);
  const allVlanIds = useSelector(state => state.config.vlans.allIds);
  const vlansById = useSelector(state => state.config.vlans.byId);

  const vlans = useMemo(() => {
    return allVlanIds.map(id => vlansById[id]).filter(v => v.deviceId === activeDevId);
  }, [allVlanIds, vlansById, activeDevId]);

  const handleAdd = () => {
    const id = `vlan-${Date.now()}`;
    dispatch(addVlan({ id, deviceId: activeDevId, vlanId: '', name: '', description: '' }));
  };

  const inputStyle = {
    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
    borderRadius: '8px', padding: '8px 12px', color: 'var(--fg-primary)',
    fontSize: '13px', fontFamily: 'var(--font-sans)', outline: 'none', width: '100%'
  };

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--fg-primary)', margin: 0 }}>VLAN Database</h3>
          <p style={{ fontSize: '13px', color: 'var(--fg-muted)', marginTop: '4px' }}>Manage global VLAN tags for the active fabric.</p>
        </div>
        <button onClick={handleAdd} style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
          background: 'rgba(59,130,246,0.12)', color: 'var(--accent-blue)', border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'var(--font-sans)'
        }}>
          <Plus size={16} /> Add VLAN
        </button>
      </div>

      {/* Table */}
      <div style={{ padding: '20px 28px' }}>
        {/* Table Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '100px 1fr 2fr 50px', gap: '12px',
          padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
          fontSize: '10px', fontWeight: 800, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.12em'
        }}>
          <div>VLAN ID</div>
          <div>Name</div>
          <div>Description</div>
          <div style={{ textAlign: 'center' }}>⌦</div>
        </div>

        {/* Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
          {vlans.map(vlan => (
            <div key={vlan.id} style={{
              display: 'grid', gridTemplateColumns: '100px 1fr 2fr 50px', gap: '12px',
              padding: '8px 16px', alignItems: 'center', borderRadius: '8px',
              background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)'
            }}>
              <input type="number" placeholder="10" value={vlan.vlanId} onChange={e => dispatch(updateVlan({ id: vlan.id, updates: { vlanId: e.target.value } }))} style={inputStyle} />
              <input placeholder="HR_NETWORK" value={vlan.name} onChange={e => dispatch(updateVlan({ id: vlan.id, updates: { name: e.target.value } }))} style={{ ...inputStyle, textTransform: 'uppercase' }} />
              <input placeholder="Human Resources Subnet" value={vlan.description} onChange={e => dispatch(updateVlan({ id: vlan.id, updates: { description: e.target.value } }))} style={inputStyle} />
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => dispatch(removeVlan(vlan.id))} style={{ background: 'none', border: 'none', color: 'var(--destructive)', cursor: 'pointer', padding: '6px' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {vlans.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--fg-dim)', fontWeight: 600, border: '2px dashed var(--border-subtle)', borderRadius: '12px', marginTop: '8px' }}>
              No VLANs configured. Click "Add VLAN" to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
