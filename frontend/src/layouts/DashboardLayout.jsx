import React from 'react';
import Sidebar from '../components/Sidebar';
import CliOutputPanel from '../components/CliOutputPanel';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#02040a] overflow-hidden relative font-sans text-slate-200">
      {/* Hyper-Modern Animated Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '10s' }}></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-rose-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '7s' }}></div>
      <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '12s' }}></div>
      
      <Sidebar />
      <main className="flex-1 flex flex-col h-full relative z-10">
        <div className="flex-1 overflow-y-auto p-12 scroll-smooth backdrop-blur-[2px]">
          <div className="max-w-[1400px] mx-auto animate-in slide-in-from-bottom-12 fade-in duration-1000 ease-out">
            {children}
          </div>
        </div>
      </main>
      <CliOutputPanel />
    </div>
  );
}
