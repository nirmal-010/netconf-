import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateL2 } from '../../store/configSlice';
import { Plus, Trash2 } from 'lucide-react';
import ToggleSwitch from '../ui/ToggleSwitch';

export default function InterfaceManager() {
  const dispatch = useDispatch();
  const interfaces = useSelector(state => state.config.l2.interfaces);

  const addInterface = () => {
    dispatch(updateL2({ 
      interfaces: [...interfaces, { 
        id: Date.now().toString(), name: '', description: '', mode: 'access', accessVlan: '', trunkAllowed: '', nativeVlan: '',
        portSecurity: false, ipSourceGuard: false, stormControl: '', channelGroup: '', channelMode: ''
      }] 
    }));
  };

  const updateInterface = (id, field, value) => {
    dispatch(updateL2({ 
      interfaces: interfaces.map(i => i.id === id ? { ...i, [field]: value } : i) 
    }));
  };

  const removeInterface = (id) => {
    dispatch(updateL2({ interfaces: interfaces.filter(i => i.id !== id) }));
  };

  const inputClass = "bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";

  return (
    <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none"></div>
      
      <div className="p-8 border-b border-white/5 flex justify-between items-center relative z-10">
        <h3 className="text-2xl font-black text-white tracking-wide">Interface Manager</h3>
        <button onClick={addInterface} className="px-5 py-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl text-sm font-bold hover:bg-cyan-500/30 flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <Plus size={18}/> Add Interface
        </button>
      </div>

      <div className="p-8 relative z-10 space-y-6">
        {interfaces.map(intf => (
          <div key={intf.id} className="bg-[#030712]/50 p-6 rounded-2xl border border-white/5 flex flex-col gap-6 hover:border-cyan-500/30 transition-all shadow-lg">
            
            <div className="flex gap-4 items-center">
              <input type="text" placeholder="Interface (e.g. Gi0/1)" value={intf.name} onChange={(e)=>updateInterface(intf.id, 'name', e.target.value)} className={`${inputClass} w-48 py-3`} />
              <input type="text" placeholder="Description" value={intf.description} onChange={(e)=>updateInterface(intf.id, 'description', e.target.value)} className={`${inputClass} flex-1 py-3`} />
              <select value={intf.mode} onChange={(e)=>updateInterface(intf.id, 'mode', e.target.value)} className={`${inputClass} py-3 font-bold w-36`}>
                <option value="access">Access</option>
                <option value="trunk">Trunk</option>
              </select>
              <button onClick={()=>removeInterface(intf.id)} className="p-3 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all ml-auto"><Trash2 size={20}/></button>
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-6">
              
              <div className="space-y-4 border-r border-white/5 pr-8">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">VLAN Mapping</h4>
                {intf.mode === 'access' ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-300 w-28">Access VLAN</span>
                    <input type="number" placeholder="VLAN ID" value={intf.accessVlan} onChange={(e)=>updateInterface(intf.id, 'accessVlan', e.target.value)} className={`${inputClass} flex-1`} />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-slate-300 w-28">Allowed VLANs</span>
                      <input type="text" placeholder="e.g. 10,20,30-40" value={intf.trunkAllowed} onChange={(e)=>updateInterface(intf.id, 'trunkAllowed', e.target.value)} className={`${inputClass} flex-1`} />
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-slate-300 w-28">Native VLAN</span>
                      <input type="number" placeholder="99" value={intf.nativeVlan} onChange={(e)=>updateInterface(intf.id, 'nativeVlan', e.target.value)} className={`${inputClass} w-24`} />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Security & Features</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-300 font-bold bg-[#0f172a]/50 p-3 rounded-xl border border-white/5">
                    Port Security
                    <ToggleSwitch checked={intf.portSecurity} onChange={(e)=>updateInterface(intf.id, 'portSecurity', e.target.checked)} name="portSec" colorClass="from-cyan-400 to-blue-500"/>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-300 font-bold bg-[#0f172a]/50 p-3 rounded-xl border border-white/5">
                    IP Source Guard
                    <ToggleSwitch checked={intf.ipSourceGuard} onChange={(e)=>updateInterface(intf.id, 'ipSourceGuard', e.target.checked)} name="ipSg" colorClass="from-cyan-400 to-blue-500"/>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-[#0f172a]/50 p-3 rounded-xl border border-white/5">
                  <span className="text-sm text-slate-300 font-bold w-24">Storm %</span>
                  <input type="number" placeholder="Level" value={intf.stormControl} onChange={(e)=>updateInterface(intf.id, 'stormControl', e.target.value)} className={`${inputClass} w-20`} />
                  <span className="text-sm text-slate-300 font-bold ml-4">LACP Grp</span>
                  <input type="number" placeholder="Po" value={intf.channelGroup} onChange={(e)=>updateInterface(intf.id, 'channelGroup', e.target.value)} className={`${inputClass} w-16`} />
                  <select value={intf.channelMode} onChange={(e)=>updateInterface(intf.id, 'channelMode', e.target.value)} className={`${inputClass} flex-1`}>
                    <option value="">None</option>
                    <option value="active">Active</option>
                    <option value="passive">Passive</option>
                    <option value="on">On</option>
                  </select>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
