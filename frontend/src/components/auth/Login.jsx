import React, { useState, useEffect, useRef } from 'react';
import { Network, Eye, EyeOff, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 150 });

  // Gentle, minimal light-themed network background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const pointsCount = Math.floor((width * height) / 24000);
    const points = Array.from({ length: Math.max(26, pointsCount) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.8 + 1.2,
      baseRadius: Math.random() * 1.8 + 1.2,
      pulse: Math.random() * Math.PI
    }));

    const render = () => {
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, width, height);

      // Soft grid
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.38)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // Nodes & Links
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Subtle mouse interaction
        const dxMouse = p.x - mouseRef.current.x;
        const dyMouse = p.y - mouseRef.current.y;
        const distMouse = Math.hypot(dxMouse, dyMouse);
        if (distMouse < mouseRef.current.radius) {
          const force = (1 - distMouse / mouseRef.current.radius) * 0.6;
          p.x += (dxMouse / distMouse) * force;
          p.y += (dyMouse / distMouse) * force;
        }

        p.pulse += 0.04;
        p.radius = p.baseRadius + Math.sin(p.pulse) * 0.3;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#16A34A';
        ctx.fill();

        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 135) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(22, 163, 74, ${(1 - dist / 135) * 0.24})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }

    setLoading(true);
    setError('');

    const API_BASE = import.meta.env.VITE_API_URL || '';
    const endpoint = isRegister ? `${API_BASE}/api/auth/register` : `${API_BASE}/api/auth/login`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Unexpected server response (${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data.msg || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
  };

  return (
    <div style={{
      width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#F8FAFC', position: 'relative', overflow: 'hidden', padding: '20px'
    }}>
      
      {/* Minimal Background Canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}
      />

      {/* Ultra Simple, Premium Light Glassmorphic Login Card */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '380px',
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(203, 213, 225, 0.65)',
        borderRadius: '20px',
        padding: '38px 34px',
        boxShadow: '0 20px 45px -12px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.03)'
      }}>
        
        {/* Simple Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '26px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #16A34A 0%, #0D9488 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
          }}>
            <Network size={20} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.2 }}>NetConfig Pro</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>Network Automation Console</div>
          </div>
        </div>

        <h1 style={{ fontSize: '21px', fontWeight: 800, color: '#0F172A', marginBottom: '6px', letterSpacing: '-0.02em' }}>
          {isRegister ? 'Create an account' : 'Sign in'}
        </h1>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '26px' }}>
          {isRegister ? 'Enter details to register new operator' : 'Enter your credentials to continue'}
        </p>

        {error && (
          <div style={{
            padding: '10px 12px', background: '#FEF2F2', border: '1px solid #FCA5A5',
            color: '#DC2626', borderRadius: '10px', marginBottom: '18px', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500
          }}>
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Username
            </label>
            <input 
              type="text"
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: '10px',
                border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#0F172A',
                fontSize: '14px', fontWeight: 500, outline: 'none', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#16A34A'; e.target.style.boxShadow = '0 0 0 4px rgba(22, 163, 74, 0.12)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)'; }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '11px 38px 11px 14px', borderRadius: '10px',
                  border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#0F172A',
                  fontSize: '14px', fontWeight: 500, outline: 'none', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#16A34A'; e.target.style.boxShadow = '0 0 0 4px rgba(22, 163, 74, 0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)'; }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', transition: 'color 0.15s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#0F172A'}
                onMouseOut={(e) => e.currentTarget.style.color = '#64748B'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '6px', width: '100%', padding: '12px',
              background: loading ? '#86EFAC' : 'linear-gradient(135deg, #16A34A 0%, #0D9488 100%)',
              color: '#FFFFFF', border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(22, 163, 74, 0.3)'
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)', e.currentTarget.style.boxShadow = '0 6px 18px rgba(22, 163, 74, 0.42)')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 4px 14px rgba(22, 163, 74, 0.3)')}
            onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.99)')}
            onMouseUp={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw className="animate-spin" size={17} /> Signing in...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isRegister ? 'Register' : 'Sign in'} <ArrowRight size={17} />
              </span>
            )}
          </button>
        </form>

        {/* Minimal Toggle & Demo Options */}
        <div style={{ marginTop: '26px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid rgba(203, 213, 225, 0.4)', paddingTop: '20px' }}>
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{
              background: 'none', border: 'none', color: '#0284C7', fontSize: '13px',
              fontWeight: 600, cursor: 'pointer', transition: 'color 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#0369A1'}
            onMouseOut={(e) => e.currentTarget.style.color = '#0284C7'}
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>

          {!isRegister && (
            <button
              type="button"
              onClick={fillDemo}
              style={{
                background: 'rgba(241, 245, 249, 0.8)', border: '1px solid #E2E8F0', color: '#475569',
                fontSize: '11px', fontWeight: 600, padding: '7px 14px', borderRadius: '8px',
                cursor: 'pointer', margin: '2px auto 0', transition: 'all 0.15s ease',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#E2E8F0'; e.currentTarget.style.color = '#0F172A'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(241, 245, 249, 0.8)'; e.currentTarget.style.color = '#475569'; }}
            >
              <span>💡</span> Quick fill: demo admin account
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
