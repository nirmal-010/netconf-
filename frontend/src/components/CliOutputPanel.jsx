import React, { useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Copy, Check, Download, AlertTriangle, ShieldAlert, AlertCircle, Play, CheckCircle2, ListChecks } from 'lucide-react';
import { compileConfiguration } from '../compiler';
import { setCompiledState, setVerificationToggle } from '../store/configSlice';

export default function CliOutputPanel() {
  const dispatch = useDispatch();
  const config = useSelector(state => state.config);
  const includeVerification = useSelector(state => state.config.workspace.includeVerification);
  
  const [copied, setCopied] = useState(false);
  const [generatedCli, setGeneratedCli] = useState('');
  const [isDirty, setIsDirty] = useState(true);

  const compilation = useMemo(() => compileConfiguration(config), [config]);
  const { report, cli } = compilation;
  const hasErrors = report.status === 'FAILED';

  useEffect(() => {
    setIsDirty(true);
  }, [config]);

  const handleGenerate = async () => {
    if (hasErrors) return;
    setGeneratedCli(cli);
    setIsDirty(false);
    dispatch(setCompiledState(true)); // Lock the workspace

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch('/api/progress', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ state: config })
      });
    } catch (error) {
      console.error('Failed to save config to backend:', error);
    }
  };

  const handleCopy = () => {
    if (!generatedCli || isDirty) return;
    navigator.clipboard.writeText(generatedCli);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedCli || isDirty) return;
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
    if (/^(interface|vlan|spanning-tree|router|enable|configure|end|write|copy|feature)/.test(line))
      return <span key={i} style={{ color: 'var(--accent)', fontWeight: 700, display: 'block' }}>{line}</span>;
    if (/^( switchport| storm-control| channel-group| ip verify| description)/.test(line))
      return <span key={i} style={{ color: 'var(--accent-blue)', display: 'block' }}>{line}</span>;
    if (/^( port-security| ip dhcp| ip arp| udld| power| mac address-table| errdisable| vtp)/.test(line))
      return <span key={i} style={{ color: 'var(--accent-amber)', display: 'block' }}>{line}</span>;
    return <span key={i} style={{ display: 'block' }}>{line}</span>;
  };

  return (
    <aside style={{
      width: '100%', height: '100%', background: 'var(--bg-card)',
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
          Compiler Output
        </span>
        <div style={{ width: '50px', textAlign: 'right' }}>
          {isDirty && <span style={{ width: '8px', height: '8px', background: 'var(--accent-amber)', borderRadius: '50%', display: 'inline-block' }} title="Unsaved changes"></span>}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleGenerate} disabled={hasErrors || !isDirty} style={{
            flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 800,
            fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.05em',
            background: (!isDirty || hasErrors) ? 'rgba(255,255,255,0.05)' : 'var(--accent)', 
            color: (!isDirty || hasErrors) ? 'var(--fg-dim)' : '#000',
            border: 'none', cursor: (hasErrors || !isDirty) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <Play size={14} /> {isDirty ? 'Compile' : 'Up to Date'}
          </button>

          <button onClick={handleCopy} disabled={hasErrors || isDirty || !generatedCli} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
            fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.05em',
            background: 'rgba(255,255,255,0.05)', color: 'var(--fg-muted)',
            border: '1px solid var(--border-subtle)', cursor: (hasErrors || isDirty || !generatedCli) ? 'not-allowed' : 'pointer',
            opacity: (hasErrors || isDirty || !generatedCli) ? 0.4 : 1
          }}>
            {copied ? <Check size={14} style={{ color: '#27c93f' }} /> : <Copy size={14} />}
          </button>

          <button onClick={handleDownload} disabled={hasErrors || isDirty || !generatedCli} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
            fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.05em',
            background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)',
            border: '1px solid rgba(59,130,246,0.2)', cursor: (hasErrors || isDirty || !generatedCli) ? 'not-allowed' : 'pointer',
            opacity: (hasErrors || isDirty || !generatedCli) ? 0.4 : 1
          }}>
            <Download size={14} />
          </button>
        </div>
        
        <label style={{
          display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
          fontSize: '11px', fontWeight: 600, color: includeVerification ? 'var(--fg-primary)' : 'var(--fg-muted)',
          transition: 'color 0.2s'
        }}>
          <input 
            type="checkbox" 
            checked={includeVerification} 
            onChange={(e) => dispatch(setVerificationToggle(e.target.checked))} 
            style={{ accentColor: 'var(--accent)' }}
          />
          <ListChecks size={14} style={{ opacity: includeVerification ? 1 : 0.6 }} />
          Include Verification Commands
        </label>
      </div>

      {/* CLI Output Area */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {hasErrors ? (
          <div style={{
            padding: '40px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '100%'
          }}>
            <AlertTriangle size={40} style={{ color: 'var(--destructive)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--fg-primary)', marginBottom: '8px' }}>Compilation Failed</h3>
            <p style={{ fontSize: '12px', color: 'var(--fg-muted)', marginBottom: '24px' }}>Validation Engine caught critical structural errors.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', textAlign: 'left' }}>
              {report.errors.map((err, i) => (
                <div key={i} style={{
                  padding: '10px 14px', background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px',
                  color: 'var(--destructive)', fontSize: '12px', fontWeight: 600, lineHeight: 1.5
                }}>
                  {err}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px 20px', position: 'relative' }}>
            {isDirty && generatedCli && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(5,5,5,0.7)', backdropFilter: 'blur(2px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10
              }}>
                <button onClick={handleGenerate} style={{
                  padding: '12px 24px', background: 'var(--accent)', color: '#000',
                  border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 0 20px rgba(34,197,94,0.3)'
                }}>
                  <Play size={18} /> Compile Configuration
                </button>
              </div>
            )}
            
            {!generatedCli && isDirty && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '20px' }}>
                <div style={{ padding: '20px', borderRadius: '12px', background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ color: 'var(--fg-primary)', fontSize: '14px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={16} color="var(--accent-blue)" /> Risk Analyzer Report
                  </h4>
                  
                  {report.passed.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                      {report.passed.map((p, i) => (
                        <div key={`p${i}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--fg-muted)' }}>
                          <CheckCircle2 size={14} color="#27c93f" /> {p}
                        </div>
                      ))}
                    </div>
                  )}

                  {report.warnings.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {report.warnings.map((w, i) => (
                        <div key={`w${i}`} style={{
                          display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px',
                          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)',
                          borderRadius: '8px', color: 'var(--accent-amber)', fontSize: '12px', fontWeight: 600,
                          lineHeight: 1.4
                        }}>
                          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} /> {w}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'center', color: 'var(--fg-dim)', fontSize: '13px', fontWeight: 600, marginTop: '40px' }}>
                  <Play size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  Click Compile to view CLI syntax
                </div>
              </div>
            )}

            {generatedCli && !isDirty && (
              <>
                {report.warnings.length > 0 && (
                  <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                    {report.warnings.map((w, i) => (
                      <div key={`w${i}`} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 12px',
                        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)',
                        borderRadius: '8px', color: 'var(--accent-amber)', fontSize: '11px', fontWeight: 600,
                        marginBottom: '6px'
                      }}>
                        <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '1px' }} /> {w}
                      </div>
                    ))}
                  </div>
                )}
                <pre style={{
                  fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--fg-muted)',
                  whiteSpace: 'pre-wrap', lineHeight: 2, letterSpacing: '0.03em'
                }}>
                  {generatedCli.split('\n').map((line, i) => colorize(line, i))}
                  <span style={{ display: 'inline-block', width: '8px', height: '16px', background: 'var(--fg-muted)', animation: 'pulse 1s step-end infinite', marginLeft: '2px', verticalAlign: 'middle' }}></span>
                </pre>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
