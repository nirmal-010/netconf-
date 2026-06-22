import React, { useState, useEffect, useRef } from 'react';
import { Network, Lock, User, ArrowRight, ShieldCheck, UserPlus } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(0);

  useEffect(() => {
    // Dynamically load the lottie-player script
    const lottieScript = document.createElement("script");
    lottieScript.src = "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js";
    lottieScript.async = true;
    document.body.appendChild(lottieScript);

    // Load Vanta TRUNK dependencies
    const loadVanta = async () => {
      if (!window.p5) {
        const p5Script = document.createElement('script');
        p5Script.src = "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.1.9/p5.min.js";
        p5Script.async = false;
        document.body.appendChild(p5Script);
        await new Promise(resolve => p5Script.onload = resolve);
      }
      
      if (!window.VANTA || !window.VANTA.TRUNK) {
        const vantaScript = document.createElement('script');
        vantaScript.src = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.trunk.min.js";
        vantaScript.async = false;
        document.body.appendChild(vantaScript);
        await new Promise(resolve => vantaScript.onload = resolve);
      }

      if (!vantaEffect && vantaRef.current && window.VANTA && window.VANTA.TRUNK) {
        setVantaEffect(
          window.VANTA.TRUNK({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0xfcfcfc,
            spacing: 2.50,
            chaos: 2.00
          })
        );
      }
    };

    loadVanta();

    return () => {
      document.body.removeChild(lottieScript);
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

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

  const inputStyle = {
    width: '100%',
    padding: '14px 16px 14px 46px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 500,
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
  };

  return (
    <div ref={vantaRef} style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '10vw', backgroundColor: '#000000' }}>
      <div className="animate-fade-in relative z-10" style={{
        background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px',
        width: '100%', maxWidth: '420px', padding: '48px 40px',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 20px rgba(34,197,94,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <lottie-player
            src="https://lottie.host/8cf4ba71-e5fb-44f3-8134-178c4d389417/0CCsdcgNIP.json"
            background="transparent"
            speed="1"
            style={{ width: "160px", height: "160px", marginBottom: '-10px', marginTop: '-20px' }}
            loop
            autoplay
          ></lottie-player>

          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px', letterSpacing: '-0.03em' }}>
            NetConfig Pro
          </h1>
          <p style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 500 }}>
            Enterprise Network Automation Engine
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(220, 38, 38, 0.2)', border: '1px solid rgba(220, 38, 38, 0.3)', color: '#FCA5A5', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <User size={20} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}
              style={inputStyle} onFocus={e => e.target.style.borderColor = '#16A34A'} onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'} required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={20} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
              style={inputStyle} onFocus={e => e.target.style.borderColor = '#16A34A'} onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'} required
            />
          </div>

          {!isRegister && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94A3B8', cursor: 'pointer', fontWeight: 500 }}>
                <input type="checkbox" style={{ accentColor: '#16A34A', width: '16px', height: '16px' }} /> Remember me
              </label>
            </div>
          )}

          <button type="submit" disabled={loading} style={{
              marginTop: '12px', padding: '14px', background: loading ? '#86EFAC' : '#16A34A',
              color: loading ? '#0F172A' : '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', transition: 'all 0.2s ease', boxShadow: '0 4px 14px rgba(22,163,74,0.3)'
            }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck className="animate-spin" size={20} /> Authenticating...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isRegister ? 'Create Account' : 'Sign In'} {isRegister ? <UserPlus size={18} /> : <ArrowRight size={18} />}
              </span>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button 
            type="button" 
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#60A5FA', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s ease' }}
            onMouseOver={(e) => e.target.style.color = '#93C5FD'}
            onMouseOut={(e) => e.target.style.color = '#60A5FA'}
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '24px' }}>
          <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Secure Access Gateway v2.4.1
          </p>
        </div>
      </div>
    </div>
  );
}
