import React from "react";

const RoleInfoHeader = ({
  role,
  topicsToFocus,
  experience,
  questions,
  description,
  lastUpdated,
}) => {
  return <div className="bg-cream relative border-b-2 border-charcoal/10">
            <div className="container mx-auto px-10 md:px-0">
                <div className="h-[200px] flex flex-col justify-center relative z-10">
                <div className="flex items-start">
                <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-charcoal">{role}</h2>
                        <p className="text-base font-body text-charcoal/80 mt-2">
                            {topicsToFocus}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
            <div className="text-xs font-bold text-charcoal uppercase tracking-wider bg-white border-2 border-charcoal shadow-[2px_2px_0px_0px_#1A1A1A] px-3 py-1.5 rounded-sm">
                Experience: {experience} {experience == 1 ? "Year" : "Years"}
            </div>
            <div className="text-xs font-bold text-charcoal uppercase tracking-wider bg-white border-2 border-charcoal shadow-[2px_2px_0px_0px_#1A1A1A] px-3 py-1.5 rounded-sm">
                {questions} Q&A
            </div>
            <div className="text-xs font-bold text-charcoal uppercase tracking-wider bg-white border-2 border-charcoal shadow-[2px_2px_0px_0px_#1A1A1A] px-3 py-1.5 rounded-sm">
                Last Updated: {lastUpdated}
            </div>
        </div>
        </div>
    </div>
    </div>

};

export default RoleInfoHeader;