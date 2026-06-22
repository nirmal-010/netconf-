import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setL2SubTab } from '../../store/configSlice';
import VlanManager from './VlanManager';
import InterfaceManager from './InterfaceManager';
import SecurityDashboard from './SecurityDashboard';
import { Network, Shield, Cpu } from 'lucide-react';

export default function L2Layout() {
  const dispatch = useDispatch();
  const l2SubTab = useSelector(state => state.config.l2SubTab);

  const tabs = [
    { id: 'vlans', label: 'VLAN Database', icon: <Network size={18}/> },
    { id: 'interfaces', label: 'Interface Manager', icon: <Cpu size={18}/> },
    { id: 'security', label: 'Global Security & STP', icon: <Shield size={18}/> }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Layer 2 Engine</h2>
        <p className="text-slate-400 text-lg">Enterprise Switching & Security Platform</p>
      </div>
      
      <div className="flex gap-4 border-b border-white/5 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => dispatch(setL2SubTab(tab.id))}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              l2SubTab === tab.id 
                ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] border border-emerald-500/30' 
                : 'text-slate-400 hover:bg-white/5 border border-transparent'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {l2SubTab === 'vlans' && <VlanManager />}
        {l2SubTab === 'interfaces' && <InterfaceManager />}
        {l2SubTab === 'security' && <SecurityDashboard />}
      </div>
    </div>
  );
}
