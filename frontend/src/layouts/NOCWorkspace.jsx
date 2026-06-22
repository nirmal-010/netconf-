import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCompiledState } from '../store/configSlice';
import SideNavigation from '../components/noc/SideNavigation';
import TopNavigation from '../components/noc/TopNavigation';
import CliOutputPanel from '../components/CliOutputPanel';
import WorkspaceRouter from '../components/noc/WorkspaceRouter';
import DottedSurface from '../components/ui/DottedSurface';

export default function NOCWorkspace() {
  const dispatch = useDispatch();
  const isCompiled = useSelector(state => state.config.workspace.isCompiled);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', width: '100vw',
      background: 'var(--bg-deep)', color: 'var(--fg-primary)',
      fontFamily: 'var(--font-sans)', overflow: 'hidden', position: 'relative'
    }}>
      <DottedSurface theme="light" />
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%', padding: '20px', gap: '20px' }}>
        <TopNavigation />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: '20px' }}>
        {/* Left: Side Navigation */}
        <div style={{ width: '220px', flexShrink: 0, overflow: 'hidden', borderRadius: '16px', background: 'var(--bg-card)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <SideNavigation />
        </div>

        {/* Center: Workspace */}
        <div style={{
          flex: 1, overflow: 'hidden', position: 'relative',
          borderRadius: '16px', background: 'var(--bg-card)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          {isCompiled && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50,
              background: 'rgba(5, 5, 5, 0.4)', backdropFilter: 'blur(4px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              borderRadius: '16px'
            }}>
              <div style={{
                background: 'var(--bg-elevated)', padding: '30px 40px', borderRadius: '16px',
                border: '1px solid var(--border-subtle)', textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
              }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(39, 201, 63, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#27c93f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--fg-primary)', marginBottom: '8px' }}>Workspace Locked</h3>
                <p style={{ fontSize: '13px', color: 'var(--fg-muted)', marginBottom: '24px', maxWidth: '280px', lineHeight: 1.5 }}>
                  The configuration has been successfully compiled. The workspace is frozen to prevent accidental modifications.
                </p>
                <button 
                  onClick={() => dispatch(setCompiledState(false))}
                  style={{
                    padding: '12px 24px', background: 'var(--accent)', color: '#000',
                    border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.2s', width: '100%'
                  }}
                >
                  Unfreeze to Edit
                </button>
              </div>
            </div>
          )}
          <div style={{ 
            height: '100%', 
            pointerEvents: isCompiled ? 'none' : 'auto', 
            opacity: isCompiled ? 0.6 : 1,
            transition: 'opacity 0.3s ease'
          }}>
            <WorkspaceRouter />
          </div>
        </div>

        {/* Right: CLI Output */}
        <div style={{ width: '360px', flexShrink: 0, overflow: 'hidden', borderRadius: '16px', background: 'var(--bg-card)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <CliOutputPanel />
        </div>
      </div>
      </div>
    </div>
  );
}
