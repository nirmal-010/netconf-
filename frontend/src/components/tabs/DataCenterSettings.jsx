import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateDatacenter } from '../../store/configSlice';

export default function DataCenterSettings() {
  const dispatch = useDispatch();
  const datacenter = useSelector(state => state.config.datacenter);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    dispatch(updateDatacenter({ [e.target.name]: value }));
  };

  const inputClass = "w-full bg-[#030712]/50 border border-white/10 rounded-2xl px-6 py-4 text-slate-100 text-lg focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 shadow-inner placeholder:text-slate-600";
  const labelClass = "text-sm font-black tracking-widest uppercase text-slate-400 block mb-3 ml-1";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Data Center Overlay</h2>
        <p className="text-slate-400 text-lg">Build scalable VXLAN fabrics and multi-chassis architectures.</p>
      </div>

      <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="p-8 flex justify-between items-center bg-white/5 relative z-10">
          <h3 className="text-xl font-black text-white tracking-wide">Virtual Port Channel (vPC)</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="enVpc" checked={datacenter.enVpc} onChange={handleChange} className="sr-only peer" />
            <div className="w-14 h-8 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-500 shadow-inner"></div>
          </label>
        </div>
        {datacenter.enVpc && (
          <div className="p-8 border-t border-white/5 animate-in slide-in-from-top-4 relative z-10 grid grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Domain ID</label>
              <input type="number" name="vpcDomain" value={datacenter.vpcDomain} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Keepalive Peer IP</label>
              <input type="text" name="peerIp" value={datacenter.peerIp} onChange={handleChange} className={inputClass} placeholder="10.1.1.2" />
            </div>
            <div>
              <label className={labelClass}>Peer-Link Po</label>
              <input type="number" name="peerLinkPo" value={datacenter.peerLinkPo} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="p-8 flex justify-between items-center bg-white/5 relative z-10">
          <h3 className="text-xl font-black text-white tracking-wide">BGP EVPN Overlay</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="enEvpn" checked={datacenter.enEvpn} onChange={handleChange} className="sr-only peer" />
            <div className="w-14 h-8 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-500 shadow-inner"></div>
          </label>
        </div>
        {datacenter.enEvpn && (
          <div className="p-8 border-t border-white/5 animate-in slide-in-from-top-4 relative z-10">
            <label className={labelClass}>Base L3 VNI</label>
            <input type="number" name="vni" value={datacenter.vni} onChange={handleChange} className={inputClass} placeholder="10000" />
          </div>
        )}
      </div>
    </div>
  );
}
