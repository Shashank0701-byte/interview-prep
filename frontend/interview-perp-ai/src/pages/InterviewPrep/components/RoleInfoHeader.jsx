import React from "react";

const RoleInfoHeader = ({
  role,
  topicsToFocus,
  experience,
  questions,
  description,
  lastUpdated,
}) => {
  return <div className="bg-cream dark:bg-navy relative border-b-2 border-charcoal/10 dark:border-cream/10">
            <div className="container mx-auto px-10 md:px-0">
                <div className="h-[200px] flex flex-col justify-center relative z-10">
                <div className="flex items-start">
                <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-charcoal dark:text-cream">{role}</h2>
                        <p className="text-base font-body text-charcoal/80 dark:text-cream/80 mt-2">
                            {topicsToFocus}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
            <div className="text-xs font-bold text-charcoal dark:text-cream uppercase tracking-wider bg-white dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 px-3 py-1.5 rounded-sm" style={{ boxShadow: '2px 2px 0px 0px var(--color-shadow)' }}>
                Experience: {experience} {experience == 1 ? "Year" : "Years"}
            </div>
            <div className="text-xs font-bold text-charcoal dark:text-cream uppercase tracking-wider bg-white dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 px-3 py-1.5 rounded-sm" style={{ boxShadow: '2px 2px 0px 0px var(--color-shadow)' }}>
                {questions} Q&A
            </div>
            <div className="text-xs font-bold text-charcoal dark:text-cream uppercase tracking-wider bg-white dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 px-3 py-1.5 rounded-sm" style={{ boxShadow: '2px 2px 0px 0px var(--color-shadow)' }}>
                Last Updated: {lastUpdated}
            </div>
        </div>
        </div>
    </div>
    </div>

};

export default RoleInfoHeader;