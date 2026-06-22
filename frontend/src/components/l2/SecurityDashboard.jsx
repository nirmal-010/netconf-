import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateL2 } from '../../store/configSlice';
import { ShieldAlert, AlertCircle } from 'lucide-react';
import ToggleSwitch from '../ui/ToggleSwitch';

export default function SecurityDashboard() {
  const dispatch = useDispatch();
  const globalSecurity = useSelector(state => state.config.l2.globalSecurity);
  const stp = useSelector(state => state.config.l2.stp);

  const handleSecurityChange = (e) => {
    dispatch(updateL2({ globalSecurity: { ...globalSecurity, [e.target.name]: e.target.checked } }));
  };
  const handleStpChange = (e) => {
    dispatch(updateL2({ stp: { ...stp, mode: e.target.value } }));
  };

  const Toggle = ({ label, name, checked }) => (
    <div className="flex items-center justify-between p-5 bg-[#030712]/50 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all">
      <span className="text-sm font-bold text-slate-200">{label}</span>
      <ToggleSwitch checked={checked} onChange={handleSecurityChange} name={name} colorClass="from-amber-400 to-orange-500" />
    </div>
  );

  return (
    <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none"></div>
      
      <div className="p-8 border-b border-white/5 relative z-10">
        <h3 className="text-2xl font-black text-white tracking-wide">Global Security & Spanning Tree</h3>
        <p className="text-slate-400 mt-2">Manage control plane protections and loop prevention.</p>
      </div>

      <div className="p-8 relative z-10 grid grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-amber-400 mb-4">
            <ShieldAlert size={20}/>
            <h4 className="font-black tracking-widest text-sm uppercase">Zero Trust Controls</h4>
          </div>
          <div className="space-y-3">
            <Toggle label="DHCP Snooping (Prevent Rogue DHCP)" name="dhcpSnooping" checked={globalSecurity.dhcpSnooping} />
            <Toggle label="Dynamic ARP Inspection (DAI)" name="dai" checked={globalSecurity.dai} />
          </div>
        </div>

        <div className="space-y-6 border-l border-white/5 pl-10">
          <div className="flex items-center gap-2 text-amber-400 mb-4">
            <AlertCircle size={20}/>
            <h4 className="font-black tracking-widest text-sm uppercase">STP Protections</h4>
          </div>
          <div className="space-y-4">
            <div className="p-5 bg-[#030712]/50 rounded-2xl border border-white/5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-3">STP Mode</label>
              <select value={stp.mode} onChange={handleStpChange} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20">
                <option value="pvst">PVST+</option>
                <option value="rapid-pvst">Rapid PVST+</option>
                <option value="mst">MST</option>
              </select>
            </div>
            <Toggle label="BPDU Guard (Default on Portfast)" name="bpduGuard" checked={globalSecurity.bpduGuard} />
            <Toggle label="Root Guard" name="rootGuard" checked={globalSecurity.rootGuard} />
            <Toggle label="Loop Guard" name="loopGuard" checked={globalSecurity.loopGuard} />
          </div>
        </div>
      </div>
    </div>
  );
}
