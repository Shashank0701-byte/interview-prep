import React from 'react';
import { LuTarget } from 'react-icons/lu';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-cream text-charcoal font-body flex selection:bg-charcoal selection:text-cream">
      
      {/* Left System Panel - Hidden on mobile */}
      <div className="hidden lg:flex w-[450px] border-r-4 border-charcoal bg-white flex-col p-10 relative overflow-hidden z-10 shadow-[8px_0_0_0_rgba(26,26,26,0.1)]">
        
        {/* Brand */}
        <div className="flex items-center gap-3 mb-16 text-charcoal font-display text-2xl font-bold">
          <div className="w-8 h-8 bg-charcoal rounded-sm flex items-center justify-center">
            <span className="text-cream text-sm font-bold">IP</span>
          </div>
          <span>Interview Prep AI</span>
        </div>

        {/* Readiness Header */}
        <div className="flex items-center justify-between mb-6 border-b-4 border-charcoal pb-4">
          <div className="text-xs tracking-widest text-charcoal uppercase font-bold flex items-center gap-2">
            <LuTarget className="w-4 h-4 text-charcoal" />
            Candidate Profile
          </div>
        </div>

        {/* Brutalist Skill Graph */}
        <div className="w-full border-4 border-charcoal rounded-sm mb-10 bg-amber-50 shadow-[4px_4px_0px_0px_#1A1A1A] p-6 flex flex-col justify-between h-56">
          <div className="text-[10px] font-bold text-charcoal tracking-widest uppercase mb-4 bg-white self-start px-2 py-1 border-2 border-charcoal">
            Skill Mastery Map
          </div>
          
          <div className="flex-1 flex items-end gap-3 px-2 mt-2">
            {/* Bar 1 */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full h-24 bg-blue-400 border-4 border-charcoal relative group">
                 <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold">85%</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-charcoal/70 text-center">Frontend</span>
            </div>
            
            {/* Bar 2 */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full h-12 bg-red-400 border-4 border-charcoal relative">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold">40%</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-charcoal/70 text-center">Sys Design</span>
            </div>
            
            {/* Bar 3 */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full h-16 bg-yellow-400 border-4 border-charcoal relative">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold">60%</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-charcoal/70 text-center">Algorithms</span>
            </div>

            {/* Bar 4 */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full h-28 bg-green-400 border-4 border-charcoal relative">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold">95%</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-charcoal/70 text-center">Behavioral</span>
            </div>
          </div>
        </div>

        {/* Readiness Table */}
        <div className="space-y-3 text-sm font-mono font-bold">
          <div className="flex justify-between items-center border-b-2 border-charcoal/20 pb-3">
            <span className="text-charcoal/60 uppercase">Target Role</span>
            <span className="text-charcoal bg-cream px-2 py-0.5 border-2 border-charcoal text-[10px] uppercase">Senior Engineer</span>
          </div>
          <div className="flex justify-between items-center border-b-2 border-charcoal/20 pb-3">
            <span className="text-charcoal/60 uppercase">Prep Phase</span>
            <span className="text-charcoal">Phase 2</span>
          </div>
          <div className="flex justify-between items-center border-b-2 border-charcoal/20 pb-3">
            <span className="text-charcoal/60 uppercase">Simulations</span>
            <span className="text-blue-600 bg-blue-100 px-2 py-0.5 border border-blue-600">12 COMPLETED</span>
          </div>
          <div className="flex justify-between items-center pb-3">
            <span className="text-charcoal/60 uppercase">Overall Readiness</span>
            <span className="text-green-600">STRONG</span>
          </div>
        </div>

        <div className="mt-auto pt-8 border-t-4 border-charcoal">
           <div className="text-[10px] text-charcoal/50 font-mono uppercase font-bold leading-relaxed">
             AI CRITIQUE ENGINE v2.0<br/>
             SPACED REPETITION ACTIVE<br/>
             RESUME PARSER: ONLINE
           </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative bg-cream">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-multiply z-0"></div>
        <div className="relative z-10 w-full max-w-md px-4 sm:px-6 py-12">
          {children}
        </div>
      </div>
      
    </div>
  );
};

export default AuthLayout;
