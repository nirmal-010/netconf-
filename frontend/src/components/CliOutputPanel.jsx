import React, { useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Copy, Check, Download, AlertTriangle, ShieldAlert, Play, CheckCircle2, 
  Maximize2, Minimize2, Search, ChevronDown, ChevronRight, ListChecks, ArrowRight 
} from 'lucide-react';
import { compileConfiguration } from '../compiler';
import { setCompiledState, setVerificationToggle, setWorkspaceNav } from '../store/configSlice';

export default function CliOutputPanel() {
  const dispatch = useDispatch();
  const config = useSelector(state => state.config);
  const includeVerification = useSelector(state => state.config.workspace.includeVerification);
  
  const [copied, setCopied] = useState(false);
  const [generatedCli, setGeneratedCli] = useState('');
  const [isDirty, setIsDirty] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState(new Set());

  const compilation = useMemo(() => compileConfiguration(config), [config]);
  const { report, cli } = compilation;
  const hasErrors = report?.status === 'FAILED';

  useEffect(() => {
    setIsDirty(true);
  }, [config]);

  const handleGenerate = async () => {
    if (hasErrors) return;
    setGeneratedCli(cli);
    setIsDirty(false);
    dispatch(setCompiledState(true));

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const API_BASE = import.meta.env.VITE_API_URL || '';
      await fetch(`${API_BASE}/api/progress`, {
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
    a.download = 'cisco-enterprise-config.cfg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSectionCollapse = (sectionTitle) => {
    const next = new Set(collapsedSections);
    if (next.has(sectionTitle)) next.delete(sectionTitle);
    else next.add(sectionTitle);
    setCollapsedSections(next);
  };

  const colorizeLine = (line) => {
    if (line.startsWith('!')) {
      return <span style={{ color: 'var(--fg-dim)', fontStyle: 'italic' }}>{line}</span>;
    }
    if (/^(interface|vlan|spanning-tree|router|enable|configure|end|write|copy|feature)/.test(line)) {
      return <span style={{ color: '#10B981', fontWeight: 700 }}>{line}</span>;
    }
    if (/^( switchport| storm-control| channel-group| ip verify| description| network| neighbor| area| passive-interface)/.test(line)) {
      return <span style={{ color: '#38BDF8' }}>{line}</span>;
    }
    if (/^( port-security| ip dhcp| ip arp| udld| power| mac address-table| errdisable| vtp| ip route)/.test(line)) {
      return <span style={{ color: '#F59E0B' }}>{line}</span>;
    }
    return <span style={{ color: 'var(--fg-pure)' }}>{line}</span>;
  };

  const lines = useMemo(() => {
    if (!generatedCli || isDirty) return [];
    return generatedCli.split('\n');
  }, [generatedCli, isDirty]);

  // Group CLI lines into sections by '!' headers for collapsible blocks
  const sections = useMemo(() => {
    const result = [];
    let currentHeader = 'General Configuration';
    let currentLines = [];

    lines.forEach((line, idx) => {
      if (line.startsWith('! ===') || (line.startsWith('!') && line.includes('---'))) {
        if (currentLines.length > 0) {
          result.push({ title: currentHeader, lines: currentLines });
        }
        currentHeader = line.replace(/^!\s*/, '').replace(/[=-]+/g, '').trim() || `Section ${result.length + 1}`;
        currentLines = [];
      } else {
        currentLines.push({ text: line, index: idx + 1 });
      }
    });
    if (currentLines.length > 0) {
      result.push({ title: currentHeader, lines: currentLines });
    }
    return result;
  }, [lines]);

  const containerStyle = isFullScreen ? {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'var(--bg-card)', display: 'flex', flexDirection: 'column',
    boxShadow: '0 0 100px rgba(0,0,0,0.8)'
  } : {
    width: '100%', height: '100%', background: 'var(--bg-card)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden'
  };

  return (
    <aside style={containerStyle}>
      {/* Terminal Header */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg-base)', flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }}></div>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }}></div>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }}></div>
          </div>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--fg-dim)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginLeft: '6px' }}>
            Compiler Output
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isDirty && <span style={{ width: '8px', height: '8px', background: '#F59E0B', borderRadius: '50%', display: 'inline-block' }} title="Unsaved edits present"></span>}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            style={{
              background: 'transparent', border: 'none', color: 'var(--fg-dim)',
              cursor: 'pointer', padding: '4px', borderRadius: '4px'
            }}
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen CLI View'}
          >
            {isFullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Action Bar & Search */}
      <div style={{ padding: '10px 14px', background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleGenerate} disabled={hasErrors || !isDirty} style={{
            flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800,
            fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.05em',
            background: (!isDirty || hasErrors) ? 'rgba(255, 255, 255, 0.05)' : '#10B981', 
            color: (!isDirty || hasErrors) ? 'var(--fg-dim)' : '#0F172A',
            border: 'none', cursor: (hasErrors || !isDirty) ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease'
          }}>
            <Play size={13} /> {isDirty ? 'Compile Now' : 'Up to Date'}
          </button>

          <button onClick={handleCopy} disabled={hasErrors || isDirty || !generatedCli} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
            background: 'rgba(255,255,255,0.05)', color: 'var(--fg-pure)',
            border: '1px solid var(--border-subtle)', cursor: (hasErrors || isDirty || !generatedCli) ? 'not-allowed' : 'pointer',
            opacity: (hasErrors || isDirty || !generatedCli) ? 0.4 : 1
          }}>
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />} Copy
          </button>

          <button onClick={handleDownload} disabled={hasErrors || isDirty || !generatedCli} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
            background: 'rgba(56, 189, 248, 0.12)', color: '#38BDF8',
            border: '1px solid rgba(56, 189, 248, 0.25)', cursor: (hasErrors || isDirty || !generatedCli) ? 'not-allowed' : 'pointer',
            opacity: (hasErrors || isDirty || !generatedCli) ? 0.4 : 1
          }}>
            <Download size={13} /> Export
          </button>
        </div>

        {/* Search inside CLI input */}
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-dim)' }} />
          <input
            type="text"
            placeholder="Filter keywords in CLI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
              borderRadius: '6px', padding: '6px 10px 6px 30px', fontSize: '11px',
              color: 'var(--fg-pure)', outline: 'none', fontFamily: 'var(--font-mono)'
            }}
          />
        </div>
        
        <label style={{
          display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
          fontSize: '11px', fontWeight: 600, color: includeVerification ? 'var(--fg-pure)' : 'var(--fg-muted)',
          transition: 'color 0.2s'
        }}>
          <input 
            type="checkbox" 
            checked={includeVerification} 
            onChange={(e) => dispatch(setVerificationToggle(e.target.checked))} 
            style={{ accentColor: '#10B981' }}
          />
          <ListChecks size={13} style={{ opacity: includeVerification ? 1 : 0.6 }} />
          Include Diagnostic Commands (`show ip ...`)
        </label>
      </div>

      {/* CLI Output Area */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {hasErrors ? (
          /* Better Error Card (Requirement 14) */
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#EF4444', fontWeight: 800, fontSize: '15px' }}>
                <AlertTriangle size={22} />
                <span>Validation Failed</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--fg-muted)' }}>
                The multi-vendor verification engine halted compilation due to structural discrepancies:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {report?.errors?.map((err, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-base)', padding: '12px', borderRadius: '8px',
                    borderLeft: '3px solid #EF4444', display: 'flex', flexDirection: 'column', gap: '6px'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#EF4444' }}>
                      Reason: {typeof err === 'string' ? err : JSON.stringify(err)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--fg-dim)' }}>
                      Suggested Fix: Verify subnets (`/24`), resolve duplicate VLAN IDs, or make sure interface IPs do not overlap.
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => dispatch(setWorkspaceNav('l2'))}
                style={{
                  padding: '10px 16px', background: '#EF4444', color: '#FFFFFF',
                  border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifySelf: 'flex-start',
                  width: 'fit-content', gap: '6px'
                }}
              >
                Jump to Section <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '12px 0', position: 'relative' }}>
            {isDirty && generatedCli && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(11, 15, 25, 0.75)', backdropFilter: 'blur(3px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
              }}>
                <button onClick={handleGenerate} style={{
                  padding: '12px 24px', background: '#10B981', color: '#0F172A',
                  border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
                }}>
                  <Play size={16} /> Re-Compile Configuration
                </button>
              </div>
            )}
            
            {!generatedCli && isDirty && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
                <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ color: 'var(--fg-pure)', fontSize: '13px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={16} className="text-blue-400" /> Pre-Compilation Risk Analyzer
                  </h4>
                  
                  {report?.passed?.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                      {report.passed.map((p, i) => (
                        <div key={`p${i}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--fg-muted)' }}>
                          <CheckCircle2 size={13} className="text-emerald-400" /> {p}
                        </div>
                      ))}
                    </div>
                  )}

                  {report?.warnings?.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {report.warnings.map((w, i) => (
                        <div key={`w${i}`} style={{
                          display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 10px',
                          background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)',
                          borderRadius: '6px', color: '#F59E0B', fontSize: '11px', fontWeight: 600
                        }}>
                          <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: '2px' }} /> {w}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'center', color: 'var(--fg-dim)', fontSize: '12px', fontWeight: 600, marginTop: '24px' }}>
                  <Play size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                  Click Compile Now to audit exact CLI syntax
                </div>
              </div>
            )}

            {generatedCli && !isDirty && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: 1.8 }}>
                {sections.map((section, sIdx) => {
                  const isCollapsed = collapsedSections.has(section.title);
                  return (
                    <div key={sIdx} style={{ marginBottom: '8px' }}>
                      {/* Section Header */}
                      <div
                        onClick={() => toggleSectionCollapse(section.title)}
                        style={{
                          background: 'var(--bg-base)', padding: '6px 12px',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                          borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)',
                          fontSize: '11px', fontWeight: 700, color: 'var(--fg-dim)', selectNone: 'none'
                        }}
                      >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                        <span>{section.title}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--fg-dim)' }}>
                          ({section.lines.length} lines)
                        </span>
                      </div>

                      {/* Section Lines with Line Number Gutter */}
                      {!isCollapsed && (
                        <div style={{ padding: '6px 0' }}>
                          {section.lines.map((lineObj) => {
                            if (searchQuery && !lineObj.text.toLowerCase().includes(searchQuery.toLowerCase())) {
                              return null;
                            }
                            return (
                              <div key={lineObj.index} style={{ display: 'flex', paddingRight: '12px', minHeight: '22px' }}>
                                <span style={{
                                  width: '42px', flexShrink: 0, textAlign: 'right', paddingRight: '12px',
                                  color: 'var(--fg-dim)', userSelect: 'none', fontSize: '11px', opacity: 0.5
                                }}>
                                  {lineObj.index}
                                </span>
                                <span style={{ flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                  {colorizeLine(lineObj.text)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
