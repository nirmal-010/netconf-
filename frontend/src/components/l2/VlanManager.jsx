import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateL2 } from '../../store/configSlice';
import { Plus, Trash2 } from 'lucide-react';

export default function VlanManager() {
  const dispatch = useDispatch();
  const vlans = useSelector(state => state.config.l2.vlans);

  const addVlan = () => {
    dispatch(updateL2({ vlans: [...vlans, { id: '', name: '', description: '' }] }));
  };

  const updateVlan = (index, field, value) => {
    const newVlans = [...vlans];
    newVlans[index] = { ...newVlans[index], [field]: value };
    dispatch(updateL2({ vlans: newVlans }));
  };

  const removeVlan = (index) => {
    dispatch(updateL2({ vlans: vlans.filter((_, i) => i !== index) }));
  };

  const inputClass = "bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

  return (
    <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>
      
      <div className="p-8 border-b border-white/5 flex justify-between items-center relative z-10">
        <h3 className="text-2xl font-black text-white tracking-wide">VLAN Database</h3>
        <button onClick={addVlan} className="px-5 py-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold hover:bg-emerald-500/30 flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <Plus size={18}/> Add VLAN
        </button>
      </div>
      
      <div className="p-8 relative z-10">
        <div className="w-full text-left rounded-2xl border border-white/5 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 bg-white/5 p-4 text-xs font-black tracking-widest uppercase text-slate-400">
            <div className="col-span-2">VLAN ID</div>
            <div className="col-span-3">VLAN Name</div>
            <div className="col-span-6">Description</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
          
          <div className="divide-y divide-white/5">
            {vlans.map((vlan, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center bg-[#030712]/50 hover:bg-white/5 transition-all">
                <div className="col-span-2">
                  <input type="number" placeholder="10" value={vlan.id} onChange={(e) => updateVlan(i, 'id', e.target.value)} className={`${inputClass} w-full`} />
                </div>
                <div className="col-span-3">
                  <input type="text" placeholder="HR_NETWORK" value={vlan.name} onChange={(e) => updateVlan(i, 'name', e.target.value)} className={`${inputClass} w-full uppercase`} />
                </div>
                <div className="col-span-6">
                  <input type="text" placeholder="Human Resources Subnet" value={vlan.description} onChange={(e) => updateVlan(i, 'description', e.target.value)} className={`${inputClass} w-full`} />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button onClick={() => removeVlan(i)} className="p-3 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 rounded-xl transition-all">
                    <Trash2 size={20}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
