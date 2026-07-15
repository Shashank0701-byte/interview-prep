import React from "react";

const RoleInfoHeader = ({
  role,
  topicsToFocus,
  experience,
  questions,
  description,
  lastUpdated,
}) => {
  return (
    <div className="bg-cream dark:bg-navy relative border-b-4 border-charcoal/10 dark:border-cream/10">
      <div className="container mx-auto px-10 md:px-0">
        <div className="min-h-[220px] flex flex-col justify-center py-8 relative z-10">
          {/* Top bar — SESSION DIAGNOSTICS */}
          <div className="flex items-center gap-2 mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-charcoal/60 dark:text-cream/60">
              Session Diagnostics
            </span>
          </div>

          {/* Role name — massive display italic */}
          <div className="flex items-start">
            <div className="flex-grow">
              <h1 className="text-4xl md:text-5xl font-display italic font-bold text-charcoal dark:text-cream leading-tight">
                {role}
              </h1>
              {/* Topics — monospace */}
              <p className="text-sm font-mono text-charcoal/60 dark:text-cream/60 mt-3 leading-relaxed max-w-2xl">
                &gt; {topicsToFocus}
              </p>
            </div>
          </div>

          {/* Thin horizontal divider */}
          <div className="border-t border-charcoal/15 dark:border-cream/15 my-5"></div>

          {/* Status badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div
              className="text-xs font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wider bg-white dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 px-3 py-1.5 rounded-sm shadow-[2px_2px_0px_0px_var(--color-shadow)]"
            >
              EXP: {experience} {experience == 1 ? "yr" : "yrs"}
            </div>
            <div
              className="text-xs font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wider bg-white dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 px-3 py-1.5 rounded-sm shadow-[2px_2px_0px_0px_var(--color-shadow)]"
            >
              Q&A: {questions}
            </div>
            <div
              className="text-xs font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wider bg-white dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 px-3 py-1.5 rounded-sm shadow-[2px_2px_0px_0px_var(--color-shadow)]"
            >
              Updated: {lastUpdated}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleInfoHeader;