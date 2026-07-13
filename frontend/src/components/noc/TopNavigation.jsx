import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCompiledState } from '../../store/configSlice';
import { 
  CheckCircle2, AlertTriangle, Terminal, Download, UploadCloud, 
  Moon, Sun, Cpu, Layers, ShieldAlert 
} from 'lucide-react';
import { compileConfiguration } from '../../compiler';

export default function TopNavigation() {
  const dispatch = useDispatch();
  const devices = useSelector(state => state.config.devices);
  const activeNav = useSelector(state => state.config.workspace.activeNav);
  const fullState = useSelector(state => state.config);
  const activeId = devices.activeId || 'dev-01';
  const activeDevice = devices.byId[activeId] || { hostname: 'Core-SW-01', vendor: 'Cisco', platform: 'IOS-XE' };
  const l3 = fullState.l3?.byId?.[activeId] || { routingVendor: 'cisco' };

  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Run live validation calculation
  const { report } = compileConfiguration(fullState);
  const isValid = report?.status !== 'FAILED';
  const errorCount = report?.validation?.errors?.length || 0;
  const warningCount = report?.validation?.warnings?.length || 0;

  const l3VendorMap = {
    'cisco': 'Cisco IOS-XE', 'nx-os': 'Cisco NX-OS', 'arista': 'Arista EOS',
    'juniper': 'Juniper Junos', 'aruba': 'Aruba AOS-CX', 'allied': 'Allied AW+',
    'alcatel': 'Alcatel AOS', 'tplink': 'TP-Link JetStream', 'dlink': 'D-Link DGS/DXS'
  };
  const l2PlatformMap = {
    'IOS-XE': 'Cisco IOS-XE', 'NX-OS': 'Cisco NX-OS', 'EOS': 'Arista EOS',
    'JUNOS': 'Juniper Junos', 'AOS-CX': 'Aruba AOS-CX', 'AW+': 'AlliedWare Plus',
    'AOS': 'Alcatel OmniSwitch', 'JetStream': 'TP-Link JetStream', 'D-Link': 'D-Link DGS/DXS'
  };

  const currentVendorName = activeNav === 'l3' 
    ? (l3VendorMap[l3.routingVendor] || 'Cisco IOS-XE')
    : (l2PlatformMap[activeDevice.platform] || `${activeDevice.vendor || 'Cisco'} ${activeDevice.platform || 'IOS-XE'}`);

  const handleGenerate = () => {
    dispatch(setCompiledState(true));
  };

  const handleDownload = () => {
    const { cli } = compileConfiguration(fullState);
    const blob = new Blob([cli], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDevice.hostname || 'config'}_${activeNav.toUpperCase()}.cfg`;
    a.click();
  };

  return (
    <header style={{
      height: '68px', borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-card)', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 28px',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 12px rgba(140, 120, 100, 0.04)'
    }}>
      {/* Left: Device & OS Telemetry Bar in Warm Cream */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'var(--bg-elevated)', padding: '8px 16px', borderRadius: '12px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--fg-pure)' }}>
            <Cpu size={15} style={{ color: 'var(--accent)' }} />
            <span>{activeDevice.hostname}</span>
          </div>
          <span style={{ color: 'var(--border)' }}>•</span>
          <div style={{ fontSize: '12px', color: 'var(--accent-blue)', fontWeight: 600 }}>
            {currentVendorName}
          </div>
          <span style={{ color: 'var(--border)' }}>•</span>
          <div style={{
            padding: '2px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
            background: 'rgba(150, 93, 52, 0.12)', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', gap: '5px'
          }}>
            <Layers size={13} />
            {activeNav === 'l3' ? 'Layer 3 Routing' : 'Layer 2 Switching'}
          </div>
        </div>
      </div>

      {/* Center: Live Validation Status Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          padding: '6px 16px', borderRadius: '20px',
          background: isValid ? '#DCFCE7' : '#FEE2E2',
          border: `1px solid ${isValid ? '#BBF7D0' : '#FECACA'}`,
          color: isValid ? '#15803D' : '#B91C1C',
          fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          {isValid ? (
            <>
              <CheckCircle2 size={15} />
              <span>✔ Configuration Valid & Pre-Flight Passed</span>
              {warningCount > 0 && (
                <span style={{ color: '#D97706', marginLeft: '4px' }}>({warningCount} ⚠)</span>
              )}
            </>
          ) : (
            <>
              <ShieldAlert size={15} />
              <span>❌ {errorCount} Validation Error{errorCount > 1 ? 's' : ''}</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Actions & Theme Switch */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {/* Generate CLI Button in Warm Caramel */}
        <button
          onClick={handleGenerate}
          style={{
            padding: '9px 18px', borderRadius: '12px', border: 'none',
            background: 'var(--accent)', color: '#FFFFFF', fontSize: '13px', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 14px rgba(150, 93, 52, 0.3)',
            transition: 'all 0.18s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Terminal size={16} /> Generate CLI Output
        </button>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          style={{
            padding: '9px 16px', borderRadius: '12px',
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            color: 'var(--fg-pure)', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg-pure)'; }}
          title="Download Configuration File"
        >
          <Download size={16} /> Download
        </button>

        {/* Theme Switch */}
        <button
          onClick={toggleTheme}
          style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            color: 'var(--fg-pure)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
        >
          {theme === 'dark' ? <Sun size={17} style={{ color: '#FBBF24' }} /> : <Moon size={17} style={{ color: 'var(--accent)' }} />}
        </button>

      </div>
    </header>
  );
}
