import React, { useState, useEffect } from 'react';

const TerminalLoader = ({ text = "AUTHENTICATING..." }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => (p < 100 ? p + Math.random() * 15 : 100));
    }, 200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full flex flex-col justify-center min-h-[350px] font-mono">
      <div className="flex items-center gap-3 mb-8 bg-white border-4 border-charcoal p-3 shadow-[4px_4px_0px_0px_#1A1A1A]">
        <div className="w-4 h-4 bg-charcoal rounded-sm animate-pulse"></div>
        <div className="text-charcoal font-bold tracking-widest text-sm uppercase">{text}</div>
      </div>

      <div className="w-full border-t-4 border-charcoal border-dashed mb-6"></div>

      <div className="flex justify-between text-xs font-bold mb-6 text-charcoal">
        <span className="tracking-widest uppercase bg-charcoal text-cream px-2 py-1">Process</span>
        <span className="tracking-widest uppercase bg-charcoal text-cream px-2 py-1">Status</span>
      </div>

      <div className="space-y-4 font-bold text-[10px] sm:text-xs tracking-wider mb-8 text-charcoal">
        <div className="flex justify-between items-center border-b-2 border-charcoal/10 pb-2">
          <span className="uppercase">Verifying Session</span>
          <span className={progress > 30 ? "text-green-600" : "text-charcoal/50 animate-pulse"}>
            {progress > 30 ? "[ COMPLETE ]" : "[ PENDING ]"}
          </span>
        </div>
        <div className="flex justify-between items-center border-b-2 border-charcoal/10 pb-2">
          <span className="uppercase">Locating Workspace</span>
          <span className={progress > 60 ? "text-green-600" : (progress > 30 ? "text-charcoal/50 animate-pulse" : "text-transparent")}>
            {progress > 60 ? "[ COMPLETE ]" : (progress > 30 ? "[ PENDING ]" : "[ PENDING ]")}
          </span>
        </div>
        <div className="flex justify-between items-center pb-2">
          <span className="uppercase">Loading Architecture</span>
          <span className={progress > 90 ? "text-green-600" : (progress > 60 ? "text-charcoal/50 animate-pulse" : "text-transparent")}>
            {progress > 90 ? "[ COMPLETE ]" : (progress > 60 ? "[ PENDING ]" : "[ PENDING ]")}
          </span>
        </div>
      </div>

      {/* Brutalist Progress Bar */}
      <div className="w-full h-6 border-4 border-charcoal bg-white relative overflow-hidden">
        <div 
          className="h-full bg-charcoal transition-all duration-300 ease-out" 
          style={{ width: `${Math.min(100, progress)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default TerminalLoader;
