import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateBasic } from '../../store/configSlice';

export default function BasicSettings() {
  const dispatch = useDispatch();
  const basic = useSelector(state => state.config.basic);

  const handleChange = (e) => {
    dispatch(updateBasic({ [e.target.name]: e.target.value }));
  };

  const inputClass = "w-full bg-[#030712]/50 border border-white/10 rounded-2xl px-6 py-4 text-slate-100 text-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 shadow-inner placeholder:text-slate-600";
  const labelClass = "text-sm font-black tracking-widest uppercase text-slate-400 block mb-3 ml-1";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Basic Configuration</h2>
        <p className="text-slate-400 text-lg">Set up device identity and core management interfaces.</p>
      </div>

      <div className="grid grid-cols-2 gap-8 bg-white/5 backdrop-blur-3xl p-10 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="space-y-2 relative z-10">
          <label className={labelClass}>Device Platform</label>
          <select 
            name="deviceType" 
            value={basic.deviceType} 
            onChange={handleChange}
            className={inputClass}
          >
            <option value="router">Cisco IOS Router</option>
            <option value="switch">Cisco IOS Switch</option>
            <option value="nexus">Cisco Nexus (NX-OS)</option>
          </select>
        </div>
        
        <div className="space-y-2 relative z-10">
          <label className={labelClass}>Hostname</label>
          <input 
            type="text" 
            name="hostname" 
            value={basic.hostname} 
            onChange={handleChange}
            placeholder="e.g., CORE-RTR-01"
            className={inputClass}
          />
        </div>

        <div className="space-y-2 relative z-10">
          <label className={labelClass}>Enable Secret</label>
          <input 
            type="password" 
            name="secret" 
            value={basic.secret} 
            onChange={handleChange}
            placeholder="••••••••"
            className={inputClass}
          />
        </div>

        <div className="space-y-2 relative z-10">
          <label className={labelClass}>Management IP</label>
          <input 
            type="text" 
            name="ipAddress" 
            value={basic.ipAddress} 
            onChange={handleChange}
            placeholder="10.0.0.5"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
