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

  const [theme, setTheme] = useState('dark');

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
      height: '64px', borderBottom: '1px solid var(--border)',
      background: 'var(--bg-card)', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 24px',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
    }}>
      {/* Left: Brand & Live Device Info Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: 'var(--accent-glow)', border: '1px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)', fontWeight: 900, fontSize: '18px'
          }}>
            N
          </div>
          <div>
            <span style={{ fontWeight: 900, fontSize: '16px', letterSpacing: '-0.02em', color: 'var(--fg-pure)' }}>
              NetConfig<span style={{ color: 'var(--accent)' }}> Pro</span>
            </span>
            <div style={{ fontSize: '10px', color: 'var(--fg-dim)', fontWeight: 600, letterSpacing: '0.06em' }}>
              ENTERPRISE AUTOMATION SUITE
            </div>
          </div>
        </div>

        {/* Device & OS Telemetry Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'var(--bg-base)', padding: '6px 14px', borderRadius: '8px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--fg-pure)' }}>
            <Cpu size={14} className="text-emerald-400" />
            <span>{activeDevice.hostname}</span>
          </div>
          <span style={{ color: 'var(--border)' }}>|</span>
          <div style={{ fontSize: '12px', color: 'var(--accent-blue)', fontWeight: 600 }}>
            {currentVendorName}
          </div>
          <span style={{ color: 'var(--border)' }}>|</span>
          <div style={{
            padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
            background: activeNav === 'l3' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(56, 189, 248, 0.15)',
            color: activeNav === 'l3' ? '#C084FC' : '#38BDF8',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            <Layers size={12} />
            {activeNav === 'l3' ? 'Layer 3 Routing' : 'Layer 2 Switching'}
          </div>
        </div>
      </div>

      {/* Center: Live Validation Status Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          padding: '6px 14px', borderRadius: '20px',
          background: isValid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: `1px solid ${isValid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: isValid ? '#10B981' : '#EF4444',
          fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          {isValid ? (
            <>
              <CheckCircle2 size={15} />
              <span>✔ Validation Passed</span>
              {warningCount > 0 && (
                <span style={{ color: '#F59E0B', marginLeft: '4px' }}>({warningCount} ⚠)</span>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        
        {/* Generate CLI Button */}
        <button
          onClick={handleGenerate}
          style={{
            padding: '8px 16px', borderRadius: '6px', border: 'none',
            background: 'linear-gradient(135deg, #38BDF8, #10B981)',
            color: '#0F172A', fontSize: '13px', fontWeight: 800,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Terminal size={15} /> Generate CLI
        </button>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          style={{
            padding: '8px 14px', borderRadius: '6px',
            background: 'var(--bg-base)', border: '1px solid var(--border)',
            color: 'var(--fg-pure)', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.color = '#10B981'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg-pure)'; }}
          title="Download Configuration File"
        >
          <Download size={15} /> Download
        </button>

        {/* Deploy Button (Future/Disabled) */}
        <button
          disabled
          style={{
            padding: '8px 14px', borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)',
            color: 'var(--fg-dim)', fontSize: '13px', fontWeight: 600,
            cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px',
            opacity: 0.6
          }}
          title="Direct Device Deployment (Coming Soon in v2.5)"
        >
          <UploadCloud size={15} /> Deploy
        </button>

        {/* Theme Switch */}
        <button
          onClick={toggleTheme}
          style={{
            width: '36px', height: '36px', borderRadius: '6px',
            background: 'var(--bg-base)', border: '1px solid var(--border)',
            color: 'var(--fg-pure)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} NOC Theme`}
        >
          {theme === 'dark' ? <Moon size={16} className="text-emerald-400" /> : <Sun size={16} className="text-amber-400" />}
        </button>

      </div>
    </header>
  );
}
