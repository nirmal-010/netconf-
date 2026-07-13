import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 150 });

  // Gentle, luxury warm cream background floating nodes (BrewMaster Coffee / Caramel aesthetic)
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

    const pointsCount = Math.floor((width * height) / 26000);
    const points = Array.from({ length: Math.max(22, pointsCount) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 1.2,
      baseRadius: Math.random() * 2 + 1.2,
      pulse: Math.random() * Math.PI
    }));

    const render = () => {
      ctx.fillStyle = '#FAF8F5';
      ctx.fillRect(0, 0, width, height);

      // Soft warm grid
      ctx.strokeStyle = 'rgba(232, 226, 216, 0.5)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // Nodes & Links in warm caramel (#965D34)
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const dxMouse = p.x - mouseRef.current.x;
        const dyMouse = p.y - mouseRef.current.y;
        const distMouse = Math.hypot(dxMouse, dyMouse);
        if (distMouse < mouseRef.current.radius) {
          const force = (1 - distMouse / mouseRef.current.radius) * 0.6;
          p.x += (dxMouse / distMouse) * force;
          p.y += (dyMouse / distMouse) * force;
        }

        p.pulse += 0.03;
        p.radius = p.baseRadius + Math.sin(p.pulse) * 0.3;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#965D34';
        ctx.fill();

        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(150, 93, 52, ${(1 - dist / 140) * 0.18})`;
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
      backgroundColor: '#FAF8F5', position: 'relative', overflow: 'hidden', padding: '20px'
    }}>
      
      {/* Warm Cream Canvas Background */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}
      />

      {/* Luxury Warm White Card (Exact BrewMaster Pattern) */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '390px',
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(20px)',
        border: '1px solid #F0EAE1',
        borderRadius: '24px',
        padding: '40px 36px',
        boxShadow: '0 20px 50px -12px rgba(140, 120, 100, 0.12), 0 4px 14px -2px rgba(140, 120, 100, 0.05)'
      }}>
        
        {/* Simple Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '14px',
            backgroundColor: '#965D34', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFFFFF', fontWeight: 900, fontSize: '20px',
            boxShadow: '0 4px 14px rgba(150, 93, 52, 0.3)'
          }}>
            N
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#2B231D', letterSpacing: '-0.02em', lineHeight: 1.2 }}>NetConfig Pro</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B635B' }}>Network Automation Suite</div>
          </div>
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#2B231D', marginBottom: '6px', letterSpacing: '-0.02em' }}>
          {isRegister ? 'Create an account' : 'Welcome back'}
        </h1>
        <p style={{ fontSize: '13px', color: '#6B635B', marginBottom: '28px' }}>
          {isRegister ? 'Enter details to register new operator' : 'Enter your credentials to access console'}
        </p>

        {error && (
          <div style={{
            padding: '12px 14px', background: '#FEE2E2', border: '1px solid #FECACA',
            color: '#B91C1C', borderRadius: '12px', marginBottom: '20px', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#2B231D', marginBottom: '6px' }}>
              Username
            </label>
            <input 
              type="text"
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '12px',
                border: '1px solid #E8E2D8', backgroundColor: '#FFFFFF', color: '#2B231D',
                fontSize: '14px', fontWeight: 500, outline: 'none', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#965D34'; e.target.style.boxShadow = '0 0 0 4px rgba(150, 93, 52, 0.14)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E8E2D8'; e.target.style.boxShadow = 'none'; }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#2B231D', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '12px 40px 12px 14px', borderRadius: '12px',
                  border: '1px solid #E8E2D8', backgroundColor: '#FFFFFF', color: '#2B231D',
                  fontSize: '14px', fontWeight: 500, outline: 'none', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#965D34'; e.target.style.boxShadow = '0 0 0 4px rgba(150, 93, 52, 0.14)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E8E2D8'; e.target.style.boxShadow = 'none'; }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#8C827A', cursor: 'pointer', transition: 'color 0.15s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#2B231D'}
                onMouseOut={(e) => e.currentTarget.style.color = '#8C827A'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '6px', width: '100%', padding: '13px',
              backgroundColor: loading ? '#D6AD90' : '#965D34',
              color: '#FFFFFF', border: 'none', borderRadius: '12px',
              fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: loading ? 'none' : '0 6px 16px rgba(150, 93, 52, 0.28)'
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#834E26', e.currentTarget.style.transform = 'translateY(-1px)', e.currentTarget.style.boxShadow = '0 8px 20px rgba(150, 93, 52, 0.36)')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = '#965D34', e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 6px 16px rgba(150, 93, 52, 0.28)')}
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
        <div style={{ marginTop: '28px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #F0EAE1', paddingTop: '22px' }}>
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{
              background: 'none', border: 'none', color: '#2563EB', fontSize: '13px',
              fontWeight: 600, cursor: 'pointer', transition: 'color 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#1D4ED8'}
            onMouseOut={(e) => e.currentTarget.style.color = '#2563EB'}
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>

          {!isRegister && (
            <button
              type="button"
              onClick={fillDemo}
              style={{
                background: '#F7F3EE', border: '1px solid #E8E2D8', color: '#6B635B',
                fontSize: '11px', fontWeight: 600, padding: '8px 16px', borderRadius: '10px',
                cursor: 'pointer', margin: '2px auto 0', transition: 'all 0.15s ease',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#E8E2D8'; e.currentTarget.style.color = '#2B231D'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#F7F3EE'; e.currentTarget.style.color = '#6B635B'; }}
            >
              <span>💡</span> Quick fill: demo admin account
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
