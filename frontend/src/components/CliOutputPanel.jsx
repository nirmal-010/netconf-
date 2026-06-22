import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Copy, Check, Download, AlertTriangle, ShieldAlert, AlertCircle } from 'lucide-react';
import { validateConfig } from '../utils/validator';
import { generateMasterConfig } from '../utils/cliGenerator';

export default function CliOutputPanel() {
  const config = useSelector(state => state.config);
  const [copied, setCopied] = useState(false);

  const validationResults = useMemo(() => validateConfig(config), [config]);
  const hasErrors = validationResults.some(r => r.type === 'ERROR');

  const generatedCli = useMemo(() => {
    if (hasErrors) return '';
    return generateMasterConfig(config);
  }, [config, hasErrors]);

  const handleCopy = () => {
    if (!generatedCli) return;
    navigator.clipboard.writeText(generatedCli);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedCli) return;
    const blob = new Blob([generatedCli], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cisco-config.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const colorize = (line, i) => {
    if (line.startsWith('!')) return <span key={i} style={{ color: 'var(--fg-dim)', display: 'block' }}>{line}</span>;
    if (/^(interface|vlan|spanning-tree|router|enable|configure|end|write)/.test(line))
      return <span key={i} style={{ color: 'var(--accent)', fontWeight: 700, display: 'block' }}>{line}</span>;
    if (/^( switchport| storm-control| channel-group| ip verify| description)/.test(line))
      return <span key={i} style={{ color: 'var(--accent-blue)', display: 'block' }}>{line}</span>;
    if (/^( port-security| ip dhcp| ip arp)/.test(line))
      return <span key={i} style={{ color: 'var(--accent-amber)', display: 'block' }}>{line}</span>;
    return <span key={i} style={{ display: 'block' }}>{line}</span>;
  };

  return (
    <aside style={{
      width: '100%', height: '100%', background: '#050505',
      display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border-subtle)',
      overflow: 'hidden'
    }}>
      {/* Terminal Header */}
      <div style={{
        padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.02)'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
        </div>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--fg-dim)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Live Config Output
        </span>
        <div style={{ width: '50px' }}></div>
      </div>

      {/* Action Buttons */}
      <div style={{ padding: '12px 20px', display: 'flex', gap: '8px' }}>
        <button onClick={handleCopy} disabled={hasErrors} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
          fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.05em',
          background: 'rgba(255,255,255,0.05)', color: 'var(--fg-muted)',
          border: '1px solid var(--border-subtle)', cursor: hasErrors ? 'not-allowed' : 'pointer',
          opacity: hasErrors ? 0.4 : 1
        }}>
          {copied ? <Check size={14} style={{ color: '#27c93f' }} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button onClick={handleDownload} disabled={hasErrors} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
          fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.05em',
          background: 'rgba(34,197,94,0.1)', color: 'var(--accent)',
          border: '1px solid rgba(34,197,94,0.2)', cursor: hasErrors ? 'not-allowed' : 'pointer',
          opacity: hasErrors ? 0.4 : 1
        }}>
          <Download size={14} /> Export
        </button>
      </div>

      {/* CLI Output Area */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {hasErrors ? (
          <div style={{
            padding: '40px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center', height: '100%'
          }}>
            <AlertTriangle size={40} style={{ color: 'var(--destructive)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--fg-primary)', marginBottom: '8px' }}>Validation Errors</h3>
            <p style={{ fontSize: '12px', color: 'var(--fg-muted)', marginBottom: '24px' }}>Config generation halted.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', textAlign: 'left' }}>
              {validationResults.filter(r => r.type === 'ERROR').map((err, i) => (
                <div key={i} style={{
                  padding: '10px 14px', background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px',
                  color: 'var(--destructive)', fontSize: '12px', fontWeight: 600
                }}>
                  {err.msg}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px 20px' }}>
            {validationResults.filter(r => r.type === 'WARNING').map((w, i) => (
              <div key={`w${i}`} style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 12px',
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)',
                borderRadius: '8px', color: 'var(--accent-amber)', fontSize: '11px', fontWeight: 600,
                marginBottom: '6px'
              }}>
                <ShieldAlert size={14} style={{ flexShrink: 0, marginTop: '1px' }} /> {w.msg}
              </div>
            ))}
            {validationResults.filter(r => r.type === 'RECOMMENDATION').map((r, i) => (
              <div key={`r${i}`} style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 12px',
                background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
                borderRadius: '8px', color: 'var(--accent-blue)', fontSize: '11px', fontWeight: 600,
                marginBottom: '6px'
              }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} /> {r.msg}
              </div>
            ))}
            <pre style={{
              fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--fg-muted)',
              whiteSpace: 'pre-wrap', lineHeight: 2, letterSpacing: '0.03em',
              marginTop: '12px'
            }}>
              {generatedCli.split('\n').map((line, i) => colorize(line, i))}
              <span style={{ display: 'inline-block', width: '8px', height: '16px', background: 'var(--fg-muted)', animation: 'pulse 1s step-end infinite', marginLeft: '2px', verticalAlign: 'middle' }}></span>
            </pre>
          </div>
        )}
      </div>
    </aside>
  );
}
