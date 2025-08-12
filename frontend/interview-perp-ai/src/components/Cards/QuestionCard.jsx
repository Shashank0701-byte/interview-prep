import React, { useEffect, useRef, useState } from "react";
import { LuChevronDown, LuPin, LuPinOff, LuSparkles, LuCheck } from "react-icons/lu";
import AIResponsePreview from "../../pages/InterviewPrep/components/AIResponsePreview";

const QuestionCard = ({
    questionId, // New prop to identify the question
    question,
    answer,
    userNote,   // New prop for the saved note
    onLearnMore,
    isMastered, // New Prop for the Marked status
    onToggleMastered,  // New Prop for the Marked status
    isPinned,
    onTogglePin,
    onSaveNote, // New prop to handle saving the note
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [height, setHeight] = useState(0);
    const contentRef = useRef(null);

    // New state to manage the note input field
    const [note, setNote] = useState(userNote || "");

    // This effect syncs the local note state if the prop changes
    useEffect(() => {
        setNote(userNote || "");
    }, [userNote]);

    useEffect(() => {
        if (isExpanded && contentRef.current) {
            const contentHeight = contentRef.current.scrollHeight;
            setHeight(contentHeight + 20);
        } else {
            setHeight(0);
        }
    }, [isExpanded, answer, userNote]); // Rerun if note changes

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="bg-white rounded-lg mb-4 overflow-hidden py-4 px-5 shadow-xl shadow-gray-100/70 border border-gray-100/60 group">
            <div className="flex items-start justify-between cursor-pointer" onClick={toggleExpand}>
                <div className="flex items-start gap-3.5">
                    <span className="text-xs md:text-[15px] font-semibold text-gray-400 leading-[18px]">Q</span>
                    <h3 className="text-xs md:text-[14px] font-medium text-gray-800 mr-0 md:mr-20">
                        {question}
                    </h3>
                </div>

                <div className="flex items-center justify-end ml-4 relative">
                    <div className={`flex items-center transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 ${isExpanded ? "!opacity-100" : ""}`}>
                        <button
                          className={`flex items-center gap-2 text-xs font-medium px-3 py-1 mr-2 rounded border  cursor-pointer ${
                          isMastered
                            ? 'bg-green-100 text-green-800 border-green-100 hover:border-green-300'
                            : 'bg-slate-100 text-slate-600 border-slate-100 hover:border-slate-300'
                        }`}
                            onClick={(e) => { e.stopPropagation(); onToggleMastered(); }}
                        >
                          <LuCheck className="text-xs" />
                              {isMastered ? "Mastered" : "Mark as Mastered"}
                        </button>
                        
                        <button
                            className="flex items-center gap-2 text-xs text-indigo-800 font-medium bg-indigo-50 px-3 py-1 mr-2 rounded text-nowrap border border-indigo-50 hover:border-indigo-200 cursor-pointer transition-transform duration-200 hover:scale-105"
                            onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
                        >
                            {isPinned ? <LuPinOff className="text-xs" /> : <LuPin className="text-xs" />}
                        </button>
                        <button
                            className="flex items-center gap-2 text-xs text-cyan-800 font-medium bg-cyan-50 px-3 py-1 mr-2 rounded text-nowrap border border-cyan-50 hover:border-cyan-200 cursor-pointer transition-transform duration-200 hover:scale-105"
                            onClick={(e) => { e.stopPropagation(); onLearnMore(); }}
                        >
                            <LuSparkles />
                            <span className="hidden md:block">Learn More</span>
                        </button>
                    </div>

                    <button className="text-gray-400 hover:text-gray-500">
                        <LuChevronDown
                            size={20}
                            className={`transform transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                        />
                    </button>
                </div>
            </div>

            <div
                className="overflow-hidden transition-all duration-500 ease-in-out"
                style={{ maxHeight: `${height}px` }}
            >
                <div ref={contentRef} className="pt-4 space-y-4">
                    <div className="text-sm text-gray-700 bg-gray-50 px-5 py-3 rounded-lg">
                        <AIResponsePreview content={answer} />
                    </div>

                    {/* --- ADDED THIS NEW NOTES SECTION --- */}
                    <div className="border-t pt-3">
                        <h4 className="text-xs font-semibold text-slate-500 mb-2">My Notes</h4>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Write your personal notes here..."
                            className="w-full h-24 p-2 text-sm border rounded bg-white focus:ring-2 focus:ring-orange-300 outline-none"
                            onClick={(e) => e.stopPropagation()} // Prevent card from collapsing when clicking
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSaveNote(questionId, note);
                            }}
                            disabled={note === (userNote || "")} // Disable if note hasn't changed
                            className="btn-primary text-xs px-3 py-1 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save Note
                        </button>
                    </div>
                    {/* --- END OF NEW SECTION --- */}
                </div>
            </div>
        </div>
    );
};

export default QuestionCard;