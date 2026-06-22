import React from 'react';

export default function ToggleSwitch({ checked, onChange, name, colorClass = "from-emerald-400 to-teal-500" }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer group">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
      <div className={`w-12 h-6 bg-[#0f172a] border border-white/10 peer-focus:outline-none rounded-full peer 
        peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] 
        after:bg-slate-400 peer-checked:after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all duration-300
        peer-checked:border-transparent peer-checked:bg-gradient-to-r ${colorClass} peer-checked:shadow-[0_0_15px_currentColor]
        group-hover:border-white/30`}
      ></div>
    </label>
  );
}
