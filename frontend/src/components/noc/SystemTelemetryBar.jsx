import React from 'react';
import { useSelector } from 'react-redux';
import { compileConfiguration } from '../../compiler';
import { CheckCircle2, AlertTriangle, Clock, Terminal } from 'lucide-react';

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
      height: '36px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', fontSize: '11px', fontFamily: 'var(--font-mono)',
      color: 'var(--fg-dim)', flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontWeight: 700 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }}></span>
          <span>READY</span>
        </div>
        <span>•</span>
        <div>
          Active Engine: <strong style={{ color: 'var(--fg-pure)' }}>{activeDevice.vendor} {activeDevice.platform}</strong>
        </div>
        <span>•</span>
        <div>
          Compiler Version: <strong style={{ color: 'var(--accent)' }}>v2.4-Caramel</strong>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} style={{ color: 'var(--fg-muted)' }} />
          <span>Compilation Time: <strong style={{ color: 'var(--fg-pure)' }}>{compilationMs}ms</strong></span>
        </div>
        <span>•</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Terminal size={12} style={{ color: 'var(--fg-muted)' }} />
          <span>Generated Lines: <strong style={{ color: 'var(--fg-pure)' }}>{lineCount}</strong></span>
        </div>
        <span>•</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isValid ? '#16A34A' : '#DC2626', fontWeight: 700 }}>
          {isValid ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
          <span>Audit Status: {isValid ? 'Passed' : 'Failed'}</span>
        </div>
      </div>
    </footer>
  );
}
