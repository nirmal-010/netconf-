import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateDevice } from '../../store/configSlice';
import { Server, Cpu } from 'lucide-react';

export default function DeviceSettings() {
  const dispatch = useDispatch();
  const activeDevId = useSelector(state => state.config.devices.activeId) || 'dev-01';
  const device = useSelector(state => state.config.devices.byId[activeDevId]) || { hostname: 'Core-SW-01', platform: 'IOS-XE' };

  const handlePlatformChange = (platform) => {
    let vendor = 'Cisco';
    if (platform === 'EOS') vendor = 'Arista';
    if (platform === 'AOS-CX') vendor = 'HPE Aruba';
    if (platform === 'AW+') vendor = 'Allied Telesis';
    if (platform === 'JetStream') vendor = 'TP-Link';
    
    dispatch(updateDevice({ id: activeDevId, updates: { platform, vendor } }));
  };

  const inputStyle = {
    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
    borderRadius: '8px', padding: '10px 14px', color: 'var(--fg-pure)',
    fontSize: '13px', fontFamily: 'var(--font-sans)', outline: 'none', width: '100%',
    fontWeight: 700, transition: 'border-color 0.15s ease'
  };

  return (
    <div className="enterprise-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '10px',
          background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8'
        }}>
          <Cpu size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--fg-pure)', margin: 0 }}>
            Device Profile: <span style={{ color: '#38BDF8' }}>{device.hostname || 'Core-SW-01'}</span>
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--fg-muted)', margin: '4px 0 0 0' }}>
            Select the target operating system to dynamically adjust the compilation syntax and validation rules.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <span className="form-label">Target Platform & OS</span>
          <select 
            value={device.platform || 'IOS-XE'} 
            onChange={e => handlePlatformChange(e.target.value)} 
            style={{ ...inputStyle, width: '260px', color: '#38BDF8' }}
          >
            <optgroup label="Cisco Systems">
              <option value="IOS-XE">Cisco IOS-XE (Catalyst / ISR)</option>
              <option value="NX-OS">Cisco NX-OS (Nexus Data Center)</option>
            </optgroup>
            <optgroup label="Arista Networks">
              <option value="EOS">Arista EOS (Cloud / DC Core)</option>
            </optgroup>
            <optgroup label="Juniper Networks">
              <option value="JUNOS">Juniper Junos (EX/QFX Enterprise)</option>
            </optgroup>
            <optgroup label="HPE Aruba">
              <option value="AOS-CX">Aruba AOS-CX (CX 6200/6300/8325)</option>
            </optgroup>
            <optgroup label="Allied Telesis">
              <option value="AW+">AlliedWare Plus (x930 Core)</option>
            </optgroup>
            <optgroup label="Alcatel-Lucent Enterprise">
              <option value="AOS">Alcatel OmniSwitch AOS (6860E Core)</option>
            </optgroup>
            <optgroup label="TP-Link">
              <option value="JetStream">TP-Link JetStream Managed L3</option>
            </optgroup>
            <optgroup label="D-Link Systems">
              <option value="D-Link">D-Link DGS/DXS Enterprise Core</option>
            </optgroup>
          </select>
        </div>
      </div>
    </div>
  );
}
