import React from 'react';
import { useSelector } from 'react-redux';
import { compileConfiguration } from '../../compiler';
import { CheckCircle2, AlertTriangle, ShieldCheck, Clock, Terminal, Cpu } from 'lucide-react';

export default function SystemTelemetryBar() {
  const fullState = useSelector(state => state.config);
  const devices = fullState?.devices || {};
  const activeId = devices.activeId || 'dev-01';
  const activeDevice = devices.byId?.[activeId] || { vendor: 'Cisco', platform: 'IOS-XE' };
  
  const startTime = performance.now();
  const { report, cli } = compileConfiguration(fullState);
  const endTime = performance.now();
  const compilationMs = Math.max(0.8, (endTime - startTime)).toFixed(1);
  
  const lineCount = cli ? cli.split('\n').filter(Boolean).length : 0;
  const isValid = report?.status !== 'FAILED';

  return (
    <footer style={{
      height: '32px', background: 'var(--bg-base)', borderTop: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', fontSize: '11px', fontFamily: 'var(--font-mono)',
      color: 'var(--fg-dim)', flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontWeight: 700 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }}></span>
          <span>READY</span>
        </div>
        <span>|</span>
        <div>
          Vendor: <strong style={{ color: 'var(--fg-pure)' }}>{activeDevice.vendor} {activeDevice.platform}</strong>
        </div>
        <span>|</span>
        <div>
          Build Version: <strong style={{ color: '#38BDF8' }}>v2.4.2-ENT</strong>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} className="text-slate-400" />
          <span>Compilation Time: <strong style={{ color: 'var(--fg-pure)' }}>{compilationMs}ms</strong></span>
        </div>
        <span>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Terminal size={12} className="text-slate-400" />
          <span>Generated Lines: <strong style={{ color: 'var(--fg-pure)' }}>{lineCount}</strong></span>
        </div>
        <span>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isValid ? '#10B981' : '#EF4444', fontWeight: 700 }}>
          {isValid ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
          <span>Validation Status: {isValid ? 'Passed' : 'Failed'}</span>
        </div>
      </div>
    </footer>
  );
}
