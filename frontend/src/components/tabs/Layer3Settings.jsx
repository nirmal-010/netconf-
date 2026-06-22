import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateL3 } from '../../store/configSlice';

export default function Layer3Settings() {
  const dispatch = useDispatch();
  const l3 = useSelector(state => state.config.l3);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    dispatch(updateL3({ [e.target.name]: value }));
  };

  const inputClass = "w-full bg-[#030712]/50 border border-white/10 rounded-2xl px-6 py-4 text-slate-100 text-lg focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-300 shadow-inner placeholder:text-slate-600";
  const labelClass = "text-sm font-black tracking-widest uppercase text-slate-400 block mb-3 ml-1";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Layer 3 Routing</h2>
        <p className="text-slate-400 text-lg">Deploy complex routing topologies with dynamic protocols.</p>
      </div>

      {/* OSPF Feature */}
      <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="p-8 flex justify-between items-center bg-white/5 relative z-10">
          <h3 className="text-xl font-black text-white tracking-wide">OSPF Routing</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="enOspf" checked={l3.enOspf} onChange={handleChange} className="sr-only peer" />
            <div className="w-14 h-8 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-fuchsia-500 shadow-inner"></div>
          </label>
        </div>
        {l3.enOspf && (
          <div className="p-8 border-t border-white/5 animate-in slide-in-from-top-4 relative z-10 grid grid-cols-2 gap-8">
            <div>
              <label className={labelClass}>Process ID</label>
              <input 
                type="number" name="ospfPid" value={l3.ospfPid} onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Network & Area</label>
              <input 
                type="text" name="ospfNet" value={l3.ospfNet} onChange={handleChange}
                placeholder="10.0.0.0 0.0.0.255 area 0"
                className={inputClass}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
