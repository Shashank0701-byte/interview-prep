import React, { useEffect, useRef, useState } from "react";
import { LuChevronDown, LuPin, LuPinOff, LuMessageSquarePlus, LuCheck } from "react-icons/lu";
import AIResponsePreview from "../../pages/InterviewPrep/components/AIResponsePreview";

const QuestionCard = ({
    questionId,
    question,
    answer,
    userNote,
    onAskFollowUp,
    isMastered,
    onToggleMastered,
    isPinned,
    onTogglePin,
    onSaveNote,
    justification,
    category,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [height, setHeight] = useState(0);
    const contentRef = useRef(null);
    const [note, setNote] = useState(userNote || "");

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
    }, [isExpanded, answer, userNote]);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="card-editorial p-6 mb-6 overflow-hidden group bg-white dark:bg-navy transition-colors duration-300">
            <div className="flex items-start justify-between cursor-pointer" onClick={toggleExpand}>
                <div className="flex items-start gap-4 flex-1 min-w-0">
                    <span className="w-8 h-8 bg-charcoal dark:bg-cream text-cream dark:text-charcoal flex items-center justify-center font-bold text-sm rounded-sm shrink-0">
                        Q
                    </span>
                    <div className="flex-1 min-w-0 mr-0 md:mr-24">
                        <h3 className="text-base font-bold text-charcoal dark:text-cream leading-relaxed">
                            {question}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                    {/* Action buttons */}
                    <div className={`flex items-center gap-2 transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 ${isExpanded ? "!opacity-100" : ""}`}>
                        <button
                            className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-2 py-1.5 rounded-sm border-2 transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none ${
                                isMastered
                                ? 'bg-charcoal text-white border-charcoal dark:border-cream/40 -translate-y-0.5'
                                : 'bg-white dark:bg-navy-light text-charcoal dark:text-cream border-charcoal dark:border-cream/40 hover:-translate-y-0.5'
                            }`}
                            onClick={(e) => { e.stopPropagation(); onToggleMastered(); }}
                        >
                            <LuCheck className="w-3.5 h-3.5" strokeWidth={3} />
                            {isMastered ? "Mastered" : "Master"}
                        </button>
                        
                        <button
                            className="flex items-center gap-1 text-charcoal dark:text-cream font-bold bg-white dark:bg-navy-light px-2 py-1.5 rounded-sm border-2 border-charcoal dark:border-cream/40 shadow-[2px_2px_0px_0px_var(--color-shadow)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
                        >
                            {isPinned ? <LuPinOff className="w-3.5 h-3.5" strokeWidth={3} /> : <LuPin className="w-3.5 h-3.5" strokeWidth={3} />}
                        </button>
                        
                        <button
                            className="flex items-center gap-1 text-charcoal dark:text-cream font-bold bg-white dark:bg-navy-light px-2 py-1.5 rounded-sm border-2 border-charcoal dark:border-cream/40 shadow-[2px_2px_0px_0px_var(--color-shadow)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); onAskFollowUp(); }}
                        >
                            <LuMessageSquarePlus className="w-3.5 h-3.5" strokeWidth={3} />
                        </button>
                    </div>

                    <button className="text-charcoal dark:text-cream hover:text-charcoal/80 dark:hover:text-cream/80 transition-colors p-1 border-2 border-transparent hover:border-charcoal dark:hover:border-cream/40 rounded-sm">
                        <LuChevronDown
                            className={`w-5 h-5 transform transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                            strokeWidth={3}
                        />
                    </button>
                </div>
            </div>

            {/* Expanded content */}
            <div
                className="overflow-hidden transition-all duration-500 ease-in-out"
                style={{ maxHeight: `${height}px` }}
            >
                <div ref={contentRef} className="pt-6 space-y-4">
                    <div className="text-sm text-charcoal dark:text-cream bg-cream dark:bg-navy border-4 border-charcoal dark:border-cream/40 px-4 py-4 rounded-sm shadow-[4px_4px_0px_0px_var(--color-shadow)]">
                        <AIResponsePreview content={answer} />
                    </div>

                    {/* Full justification */}
                    {justification?.reasoning && (
                        <div className="bg-cream dark:bg-navy border-2 border-charcoal/30 dark:border-cream/30 px-4 py-3 rounded-sm">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal dark:text-cream mb-2 font-mono">Why this question matters</h4>
                            <p className="text-sm text-charcoal dark:text-cream leading-relaxed">{justification.reasoning}</p>
                            {justification.commonCompanies && justification.commonCompanies.length > 0 && (
                                <div className="mt-2 font-mono">
                                    <span className="text-xs text-charcoal/80 dark:text-cream/80 font-bold">Common at: </span>
                                    <span className="text-xs text-charcoal dark:text-cream font-bold">
                                        {justification.commonCompanies.join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Notes section */}
                    <div className="border-t-2 border-charcoal/20 dark:border-cream/20 pt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal dark:text-cream mb-2 font-mono">My Notes</h4>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Write your personal notes here..."
                            className="w-full h-20 p-3 text-sm border-2 border-charcoal dark:border-cream/40 rounded-sm bg-white dark:bg-navy-light dark:text-cream focus:bg-cream/20 focus:outline-none focus:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all resize-none"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSaveNote(questionId, note);
                            }}
                            disabled={note === (userNote || "")}
                            className="mt-4 px-6 py-2.5 bg-charcoal text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all border-2 border-charcoal dark:border-cream/40 cursor-pointer"
                        >
                            Save Note
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionCard;
