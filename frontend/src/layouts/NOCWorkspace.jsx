import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCompiledState } from '../store/configSlice';
import SideNavigation from '../components/noc/SideNavigation';
import TopNavigation from '../components/noc/TopNavigation';
import SystemTelemetryBar from '../components/noc/SystemTelemetryBar';
import CliOutputPanel from '../components/CliOutputPanel';
import WorkspaceRouter from '../components/noc/WorkspaceRouter';
import DottedSurface from '../components/ui/DottedSurface';

export default function NOCWorkspace() {
  const dispatch = useDispatch();
  const isCompiled = useSelector(state => state.config.workspace.isCompiled);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', width: '100vw',
      background: 'var(--bg-deep)', color: 'var(--fg-primary)',
      fontFamily: 'var(--font-sans)', overflow: 'hidden', position: 'relative'
    }}>
      <DottedSurface theme="light" />
      
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Sticky Header */}
        <TopNavigation />

        {/* Main Workspace Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '16px 20px', gap: '20px' }}>
          
          {/* Left: Collapsible Side Navigation */}
          <div style={{
            width: isSidebarCollapsed ? '64px' : '230px',
            flexShrink: 0, overflow: 'hidden', borderRadius: '12px',
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
            transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <SideNavigation
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </div>

          {/* Center: Workspace Router */}
          <div style={{
            flex: 1, overflow: 'hidden', position: 'relative',
            borderRadius: '12px', background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.4)'
          }}>
            {isCompiled && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50,
                background: 'rgba(11, 15, 25, 0.65)', backdropFilter: 'blur(6px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                borderRadius: '12px'
              }}>
                <div style={{
                  background: 'var(--bg-panel)', padding: '32px 44px', borderRadius: '16px',
                  border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'center',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
                }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px',
                    border: '1px solid #10B981', color: '#10B981'
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--fg-pure)', marginBottom: '8px' }}>
                    Enterprise Workspace Locked
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--fg-muted)', marginBottom: '24px', maxWidth: '300px', lineHeight: 1.6 }}>
                    The multi-vendor configuration has been compiled. The workspace is frozen during CLI audit.
                  </p>
                  <button 
                    onClick={() => dispatch(setCompiledState(false))}
                    style={{
                      padding: '12px 24px', background: '#10B981', color: '#0F172A',
                      border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 800,
                      cursor: 'pointer', transition: 'all 0.2s', width: '100%',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    Unfreeze & Return to Editing
                  </button>
                </div>
              </div>
            )}
            <div style={{
              height: '100%', pointerEvents: isCompiled ? 'none' : 'auto',
              opacity: isCompiled ? 0.4 : 1, transition: 'opacity 0.3s ease'
            }}>
              <WorkspaceRouter />
            </div>
          </div>

          {/* Right: CLI Output Panel */}
          <div style={{
            width: '380px', flexShrink: 0, overflow: 'hidden', borderRadius: '12px',
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.4)'
          }}>
            <CliOutputPanel />
          </div>

        </div>

        {/* Bottom Status Bar */}
        <SystemTelemetryBar />
      </div>
    </div>
  );
}
