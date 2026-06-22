import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../store/configSlice';
import { Settings, Network, Server, Shield, Lock, Cloud, Activity } from 'lucide-react';

export default function Sidebar() {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.config.activeTab);

  const mainTabs = [
    { id: 'home', label: 'Command Center', icon: <Activity size={20} />, color: 'from-blue-400 to-cyan-400' },
  ];

  const switchTabs = [
    { id: 'basic', label: 'Device Profile', icon: <Settings size={20} />, color: 'from-slate-400 to-slate-200' },
    { id: 'l2', label: 'Layer 2 Engine', icon: <Network size={20} />, color: 'from-emerald-400 to-teal-400' },
    { id: 'datacenter', label: 'Data Center', icon: <Cloud size={20} />, color: 'from-indigo-400 to-purple-400' },
  ];

  const routerTabs = [
    { id: 'l3', label: 'Layer 3 Engine', icon: <Server size={20} />, color: 'from-violet-400 to-fuchsia-400' },
    { id: 'security', label: 'Security Policer', icon: <Shield size={20} />, color: 'from-rose-400 to-orange-400' },
    { id: 'vpn', label: 'VPN & Crypto', icon: <Lock size={20} />, color: 'from-amber-400 to-yellow-400' },
  ];

  const renderTab = (tab) => {
    const isActive = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        onClick={() => dispatch(setActiveTab(tab.id))}
        className={`group relative flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-black tracking-wide transition-all duration-500 overflow-hidden ${
          isActive 
            ? 'text-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transform scale-[1.02] bg-white/10 border border-white/20' 
            : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
        }`}
      >
        {isActive && (
          <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} opacity-10`}></div>
        )}
        <div className={`relative z-10 p-2 rounded-xl transition-all duration-500 ${isActive ? `bg-gradient-to-br ${tab.color} text-black shadow-[0_0_20px_currentColor]` : 'bg-white/5 group-hover:bg-white/10'}`}>
          {tab.icon}
        </div>
        <span className="relative z-10">{tab.label}</span>
      </button>
    );
  };

  return (
    <aside className="w-[320px] bg-[#050914]/60 backdrop-blur-[100px] border-r border-white/5 flex flex-col z-20 relative shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
      
      <div className="p-10 relative">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)] mb-6 animate-pulse duration-1000">
          <Network size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">NetConfig<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Pro</span></h1>
        <p className="text-[10px] text-slate-400 mt-2 tracking-[0.4em] uppercase font-black">Enterprise Edition</p>
      </div>

      <nav className="flex-1 px-6 pb-10 flex flex-col gap-8 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {mainTabs.map(renderTab)}
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2 mb-2 flex items-center gap-2">
            <div className="w-8 h-px bg-slate-700"></div> Core Switching
          </h2>
          {switchTabs.map(renderTab)}
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2 mb-2 flex items-center gap-2">
            <div className="w-8 h-px bg-slate-700"></div> Core Routing
          </h2>
          {routerTabs.map(renderTab)}
        </div>
      </nav>
    </aside>
  );
}
