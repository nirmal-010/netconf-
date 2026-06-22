import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addInterface, updateInterface, removeInterface } from '../../store/configSlice';
import { Plus, Trash2 } from 'lucide-react';

export default function InterfaceManager() {
  const dispatch = useDispatch();
  const activeDevId = useSelector(state => state.config.devices.activeId);
  const allInterfaceIds = useSelector(state => state.config.interfaces.allIds);
  const interfacesById = useSelector(state => state.config.interfaces.byId);

  const interfaces = useMemo(() => {
    return allInterfaceIds.map(id => interfacesById[id]).filter(i => i.deviceId === activeDevId);
  }, [allInterfaceIds, interfacesById, activeDevId]);

  const handleAdd = () => {
    const id = `int-${Date.now()}`;
    dispatch(addInterface({
      id, deviceId: activeDevId, name: '', description: '', mode: 'access',
      accessVlan: '', trunkAllowed: '', nativeVlan: '',
      portSecurity: false, ipSourceGuard: false, stormControl: '', channelGroup: '', channelMode: ''
    }));
  };

  const handleChange = (id, field, value) => {
    dispatch(updateInterface({ id, updates: { [field]: value } }));
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
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--fg-primary)', margin: 0 }}>Interface Manager</h3>
          <p style={{ fontSize: '13px', color: 'var(--fg-muted)', marginTop: '4px' }}>Configure physical and logical ports.</p>
        </div>
        <button onClick={handleAdd} style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
          background: 'rgba(34,197,94,0.12)', color: 'var(--accent)', border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'var(--font-sans)'
        }}>
          <Plus size={16} /> Add Interface
        </button>
      </div>

      {/* Interface Cards */}
      <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {interfaces.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--fg-dim)', fontWeight: 600, border: '2px dashed var(--border-subtle)', borderRadius: '16px' }}>
            No interfaces configured. Click "Add Interface" to begin.
          </div>
        )}
        {interfaces.map(intf => (
          <div key={intf.id} style={{
            background: 'var(--bg-deep)', padding: '20px', borderRadius: '14px',
            border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            {/* Row 1: Name, Description, Mode, Delete */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input placeholder="e.g. Gi0/1" value={intf.name} onChange={e => handleChange(intf.id, 'name', e.target.value)} style={{ ...inputStyle, width: '160px' }} />
              <input placeholder="Description" value={intf.description} onChange={e => handleChange(intf.id, 'description', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              <select value={intf.mode} onChange={e => handleChange(intf.id, 'mode', e.target.value)} style={{ ...inputStyle, width: '120px', fontWeight: 700 }}>
                <option value="access">Access</option>
                <option value="trunk">Trunk</option>
              </select>
              <button onClick={() => dispatch(removeInterface(intf.id))} style={{
                background: 'none', border: 'none', color: 'var(--destructive)',
                cursor: 'pointer', padding: '8px'
              }}>
                <Trash2 size={18} />
              </button>
            </div>

            {/* Row 2: VLAN Mapping + Security */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>VLAN Mapping</span>
                {intf.mode === 'access' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)', width: '90px' }}>Access VLAN</span>
                    <input type="number" placeholder="VLAN ID" value={intf.accessVlan} onChange={e => handleChange(intf.id, 'accessVlan', e.target.value)} style={{ ...inputStyle, width: '120px' }} />
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)', width: '90px' }}>Allowed</span>
                      <input placeholder="10,20,30-40" value={intf.trunkAllowed} onChange={e => handleChange(intf.id, 'trunkAllowed', e.target.value)} style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)', width: '90px' }}>Native</span>
                      <input type="number" placeholder="99" value={intf.nativeVlan} onChange={e => handleChange(intf.id, 'nativeVlan', e.target.value)} style={{ ...inputStyle, width: '80px' }} />
                    </div>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Security</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={intf.portSecurity} onChange={e => handleChange(intf.id, 'portSecurity', e.target.checked)} /> Port Security
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={intf.ipSourceGuard} onChange={e => handleChange(intf.id, 'ipSourceGuard', e.target.checked)} /> IP Source Guard
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg-muted)' }}>Storm %</span>
                  <input type="number" placeholder="5" value={intf.stormControl} onChange={e => handleChange(intf.id, 'stormControl', e.target.value)} style={{ ...inputStyle, width: '70px' }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
