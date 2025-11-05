import React from "react";

const RoleInfoHeader = ({
  role,
  topicsToFocus,
  experience,
  questions,
  description,
  lastUpdated,
}) => {
  return <div className="bg-gray-50 dark:bg-slate-900 relative border-b border-gray-200 dark:border-slate-700">
            <div className="container mx-auto px-10 md:px-0">
                <div className="h-[200px] flex flex-col justify-center relative z-10">
                <div className="flex items-start">
                <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{role}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {topicsToFocus}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-slate-700 px-3 py-1 rounded-full">
                Experience: {experience} {experience == 1 ? "Year" : "Years"}
            </div>
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-slate-700 px-3 py-1 rounded-full">
                {questions} Q&A
            </div>
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-slate-700 px-3 py-1 rounded-full">
                Last Updated: {lastUpdated}
            </div>
        </div>
        </div>
    </div>
    </div>

};

export default RoleInfoHeader;