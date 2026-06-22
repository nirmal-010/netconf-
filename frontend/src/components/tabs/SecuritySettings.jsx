import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateSecurity } from '../../store/configSlice';

export default function SecuritySettings() {
  const dispatch = useDispatch();
  const security = useSelector(state => state.config.security);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    dispatch(updateSecurity({ [e.target.name]: value }));
  };

  const inputClass = "w-full bg-[#030712]/50 border border-white/10 rounded-2xl px-6 py-4 text-slate-100 text-lg focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 transition-all duration-300 shadow-inner placeholder:text-slate-600";
  const labelClass = "text-sm font-black tracking-widest uppercase text-slate-400 block mb-3 ml-1";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Security & Identity</h2>
        <p className="text-slate-400 text-lg">Harden access and enforce Zero Trust Network Access (ZTNA).</p>
      </div>

      <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="p-8 flex justify-between items-center bg-white/5 relative z-10">
          <h3 className="text-xl font-black text-white tracking-wide">802.1X Port Authentication</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="en8021x" checked={security.en8021x} onChange={handleChange} className="sr-only peer" />
            <div className="w-14 h-8 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-rose-500 peer-checked:to-orange-500 shadow-inner"></div>
          </label>
        </div>
        {security.en8021x && (
          <div className="p-8 border-t border-white/5 animate-in slide-in-from-top-4 relative z-10 grid grid-cols-2 gap-8">
            <div>
              <label className={labelClass}>RADIUS Server IP</label>
              <input type="text" name="radiusServer" value={security.radiusServer} onChange={handleChange} className={inputClass} placeholder="10.10.10.100" />
            </div>
            <div>
              <label className={labelClass}>Shared Secret</label>
              <input type="password" name="radiusSecret" value={security.radiusSecret} onChange={handleChange} className={inputClass} placeholder="••••••••" />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="p-8 flex justify-between items-center bg-white/5 relative z-10">
          <h3 className="text-xl font-black text-white tracking-wide">Control Plane Policing (CoPP)</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="enCopp" checked={security.enCopp} onChange={handleChange} className="sr-only peer" />
            <div className="w-14 h-8 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-rose-500 peer-checked:to-orange-500 shadow-inner"></div>
          </label>
        </div>
        {security.enCopp && (
          <div className="p-8 border-t border-white/5 animate-in slide-in-from-top-4 relative z-10">
            <label className={labelClass}>Policy Enforcement Level</label>
            <select name="coppPolicy" value={security.coppPolicy} onChange={handleChange} className={inputClass}>
              <option value="strict">Strict (High Security)</option>
              <option value="moderate">Moderate (Balanced)</option>
              <option value="permissive">Permissive (Monitoring Only)</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
