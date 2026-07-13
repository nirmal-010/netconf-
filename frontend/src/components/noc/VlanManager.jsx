import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addVlan, updateVlan, removeVlan } from '../../store/configSlice';
import { Plus, Trash2, Network, CheckCircle2, AlertTriangle, ShieldAlert, Layers } from 'lucide-react';

export default function VlanManager() {
  const dispatch = useDispatch();
  const activeDevId = useSelector(state => state.config?.devices?.activeId) || 'dev-01';
  const allVlanIds = useSelector(state => state.config?.vlans?.allIds) || [];
  const vlansById = useSelector(state => state.config?.vlans?.byId) || {};

  const vlans = useMemo(() => {
    return allVlanIds.map(id => vlansById[id]).filter(v => v && v.deviceId === activeDevId);
  }, [allVlanIds, vlansById, activeDevId]);

  // Live validation calculations for VLANs
  const vlanIdsSet = new Set();
  let hasDuplicate = false;
  let hasInvalidId = false;
  let hasSpaceInName = false;

  vlans.forEach(v => {
    if (v.vlanId) {
      if (vlanIdsSet.has(v.vlanId)) hasDuplicate = true;
      vlanIdsSet.add(v.vlanId);
      const num = parseInt(v.vlanId, 10);
      if (isNaN(num) || num < 1 || num > 4094) hasInvalidId = true;
    }
    if (v.name && /\s/.test(v.name)) hasSpaceInName = true;
  });

  const handleAdd = () => {
    const id = `vlan-${Date.now()}`;
    dispatch(addVlan({ id, deviceId: activeDevId, vlanId: '', name: '', description: '' }));
  };

  const inputStyle = {
    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
    borderRadius: '8px', padding: '8px 12px', color: 'var(--fg-pure)',
    fontSize: '13px', fontFamily: 'var(--font-mono)', outline: 'none', width: '100%',
    transition: 'border-color 0.15s ease'
  };

  return (
    <div className="enterprise-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header with Colored Icon & Live Validation Badges */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-base)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A855F7'
          }}>
            <Network size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--fg-pure)', margin: 0 }}>VLAN Fabric Database</h3>
              
              {/* Live Validation Badges (Requirement 7) */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {!hasDuplicate && !hasInvalidId && !hasSpaceInName && vlans.length > 0 && (
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} /> ✔ VLANs Valid
                  </span>
                )}
                {hasDuplicate && (
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={12} /> ⚠ Duplicate VLAN ID
                  </span>
                )}
                {hasInvalidId && (
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldAlert size={12} /> ❌ Invalid Subnet/ID
                  </span>
                )}
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--fg-muted)', margin: '4px 0 0 0' }}>Assign global 802.1Q tags, descriptions, and STP root bridge priorities.</p>
          </div>
        </div>

        <button onClick={handleAdd} style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px',
          background: 'rgba(168, 85, 247, 0.15)', color: '#C084FC', border: '1px solid rgba(168, 85, 247, 0.35)',
          borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
          transition: 'all 0.15s ease', boxShadow: '0 2px 8px rgba(168, 85, 247, 0.2)'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(168, 85, 247, 0.25)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)'}
        >
          <Plus size={16} /> Add VLAN
        </button>
      </div>

      {/* Table Area */}
      <div style={{ padding: '20px 24px' }}>
        {vlans.length > 0 ? (
          <>
            {/* Table Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '110px 1fr 2fr 130px 50px', gap: '14px',
              padding: '10px 16px', background: 'var(--bg-base)', borderRadius: '8px',
              fontSize: '11px', fontWeight: 800, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.1em'
            }}>
              <div>VLAN ID</div>
              <div>Name</div>
              <div>Description</div>
              <div>STP Root Priority</div>
              <div style={{ textAlign: 'center' }}>Remove</div>
            </div>

            {/* Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              {vlans.map(vlan => {
                const isVlanIdInvalid = vlan.vlanId !== '' && (isNaN(vlan.vlanId) || parseInt(vlan.vlanId) < 1 || parseInt(vlan.vlanId) > 4094);
                const isNameInvalid = vlan.name.length > 0 && /\s/.test(vlan.name);

                return (
                  <div key={vlan.id} style={{
                    display: 'grid', gridTemplateColumns: '110px 1fr 2fr 130px 50px', gap: '14px',
                    padding: '10px 16px', alignItems: 'center', borderRadius: '8px',
                    background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
                    transition: 'border-color 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  >
                    <input 
                      type="number" placeholder="10" value={vlan.vlanId} 
                      onChange={e => dispatch(updateVlan({ id: vlan.id, updates: { vlanId: e.target.value } }))} 
                      style={{ ...inputStyle, borderColor: isVlanIdInvalid ? '#EF4444' : 'var(--border-subtle)' }} 
                      title={isVlanIdInvalid ? "VLAN ID must be between 1 and 4094" : ""}
                    />
                    <input 
                      placeholder="HR_NETWORK" value={vlan.name} 
                      onChange={e => dispatch(updateVlan({ id: vlan.id, updates: { name: e.target.value } }))} 
                      style={{ ...inputStyle, textTransform: 'uppercase', borderColor: isNameInvalid ? '#EF4444' : 'var(--border-subtle)' }} 
                      title={isNameInvalid ? "VLAN name cannot contain spaces" : ""}
                    />
                    <input 
                      placeholder="Human Resources Subnet" value={vlan.description} 
                      onChange={e => dispatch(updateVlan({ id: vlan.id, updates: { description: e.target.value } }))} 
                      style={{ ...inputStyle, fontFamily: 'var(--font-sans)' }} 
                    />
                    <select value={vlan.stpRoot || 'none'} onChange={e => dispatch(updateVlan({ id: vlan.id, updates: { stpRoot: e.target.value } }))} style={inputStyle}>
                      <option value="none">None</option>
                      <option value="primary">Primary (Root)</option>
                      <option value="secondary">Secondary</option>
                    </select>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button onClick={() => dispatch(removeVlan(vlan.id))} style={{
                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#EF4444', cursor: 'pointer', padding: '6px 8px', borderRadius: '6px',
                        transition: 'all 0.15s'
                      }}
                      title="Delete VLAN"
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Illustrated Empty State (Requirement 15) */
          <div style={{
            padding: '50px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', textAlign: 'center', background: 'var(--bg-base)',
            borderRadius: '12px', border: '1px dashed var(--border)'
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A855F7', marginBottom: '16px'
            }}>
              <Layers size={28} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--fg-pure)', marginBottom: '6px' }}>No VLANs Configured Yet</h4>
            <p style={{ fontSize: '13px', color: 'var(--fg-muted)', maxWidth: '380px', lineHeight: 1.5, marginBottom: '20px' }}>
              Your fabric currently has no active 802.1Q tags assigned. Create your first VLAN to enable network segmentation.
            </p>
            <button onClick={handleAdd} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
              background: '#A855F7', color: '#FFFFFF', border: 'none', borderRadius: '8px',
              fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(168, 85, 247, 0.3)'
            }}>
              <Plus size={16} /> Create First VLAN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
