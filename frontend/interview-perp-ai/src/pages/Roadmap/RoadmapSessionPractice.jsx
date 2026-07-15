import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { LuCircleAlert, LuListCollapse, LuArrowLeft, LuChevronRight, LuBrain, LuTarget, LuTrendingUp } from "react-icons/lu";
import SpinnerLoader from "../../components/Loader/SpinnerLoader.jsx";
import { toast } from "react-hot-toast";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import QuestionCard from '../../components/Cards/QuestionCard_enhanced';
import Drawer from '../../components/Drawer';
import AIResponsePreview from '../InterviewPrep/components/AIResponsePreview';

const RoadmapSessionPractice = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Get roadmap context from URL params
    const fromPhase = searchParams.get('fromPhase');
    const role = searchParams.get('role');
    
    const [sessionData, setSessionData] = useState(null);
    const [phaseData, setPhaseData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdateLoader, setIsUpdateLoader] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // --- State for the Follow-up Drawer ---
    const [isFollowUpDrawerOpen, setIsFollowUpDrawerOpen] = useState(false);
    const [followUpContent, setFollowUpContent] = useState(null);
    const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
    const [followUpError, setFollowUpError] = useState("");

    const fetchRoadmapSessionDetailsById = async () => {
        try {
            // Fetch roadmap session details
            const response = await axiosInstance.get(API_PATHS.ROADMAP_SESSIONS.GET_ONE(sessionId));
            setSessionData(response.data.session);
            
            // If we have phase context, fetch phase details for UI
            if (fromPhase && role) {
                try {
                    const roadmapResponse = await axiosInstance.get(API_PATHS.ROADMAP.GENERATE(role));
                    const phase = roadmapResponse.data.phases.find(p => p.id === fromPhase);
                    setPhaseData(phase);
                } catch (phaseError) {
                    console.error("Error fetching phase data:", phaseError);
                }
            }
        } catch (error) {
            console.error("Error fetching roadmap session:", error);
            setErrorMsg("Failed to load session. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (sessionId) {
            fetchRoadmapSessionDetailsById();
        }
    }, [sessionId]);

    const handleNote = async (questionId, note) => {
        try {
            setIsUpdateLoader(true);
            await axiosInstance.put(API_PATHS.QUESTION.UPDATE_NOTE(questionId), { note });
            
            // Update local state
            setSessionData(prev => ({
                ...prev,
                questions: prev.questions.map(q => 
                    q._id === questionId ? { ...q, note } : q
                )
            }));
            
            toast.success("Note updated successfully!");
        } catch (error) {
            console.error("Error updating note:", error);
            toast.error("Failed to update note");
        } finally {
            setIsUpdateLoader(false);
        }
    };

    const handlePin = async (questionId) => {
        try {
            setIsUpdateLoader(true);
            const response = await axiosInstance.put(API_PATHS.QUESTION.PIN(questionId));
            
            // Update local state
            setSessionData(prev => ({
                ...prev,
                questions: prev.questions.map(q => 
                    q._id === questionId ? { ...q, isPinned: response.data.question.isPinned } : q
                )
            }));
            
            toast.success(response.data.question.isPinned ? "Question pinned!" : "Question unpinned!");
        } catch (error) {
            console.error("Error toggling pin:", error);
            toast.error("Failed to update pin status");
        } finally {
            setIsUpdateLoader(false);
        }
    };

    const handleMaster = async (questionId) => {
        try {
            setIsUpdateLoader(true);
            const response = await axiosInstance.put(API_PATHS.QUESTION.TOGGLE_MASTERED(questionId));
            
            // Update local state
            setSessionData(prev => ({
                ...prev,
                questions: prev.questions.map(q => 
                    q._id === questionId ? { ...q, isMastered: response.data.question.isMastered } : q
                )
            }));
            
            // Update session progress
            await axiosInstance.put(API_PATHS.ROADMAP_SESSIONS.UPDATE_PROGRESS(sessionId));
            
            toast.success(response.data.question.isMastered ? "Question mastered!" : "Question unmarked!");
        } catch (error) {
            console.error("Error toggling master:", error);
            toast.error("Failed to update mastery status");
        } finally {
            setIsUpdateLoader(false);
        }
    };

    const handleFollowUp = async (questionId) => {
        setIsFollowUpLoading(true);
        setFollowUpError("");
        setIsFollowUpDrawerOpen(true);
        
        try {
            const response = await axiosInstance.post(API_PATHS.AI.GENERATE_FOLLOW_UP, {
                questionId: questionId
            });
            setFollowUpContent(response.data);
        } catch (error) {
            console.error("Error generating follow-up:", error);
            setFollowUpError("Failed to generate follow-up questions. Please try again.");
        } finally {
            setIsFollowUpLoading(false);
        }
    };

    const handleRatingUpdate = async (questionId, ratings) => {
        try {
            await axiosInstance.put(API_PATHS.QUESTION.UPDATE_RATING(questionId), ratings);
            
            // Update local state
            setSessionData(prev => ({
                ...prev,
                questions: prev.questions.map(q => 
                    q._id === questionId ? { ...q, userRating: ratings } : q
                )
            }));
            
            toast.success("Rating updated successfully!");
        } catch (error) {
            console.error("Error updating rating:", error);
            toast.error("Failed to update rating");
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-screen bg-cream dark:bg-navy font-body">
                    <SpinnerLoader />
                    <p className="text-charcoal dark:text-cream mt-4 text-center font-bold font-mono text-xs uppercase tracking-widest">
                        Loading practice session... ✨
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    if (errorMsg) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-screen bg-cream dark:bg-navy font-body">
                    <div className="text-center py-20 bg-white dark:bg-navy-light border-4 border-charcoal dark:border-cream/40 rounded-sm shadow-[8px_8px_0px_0px_var(--color-shadow)] max-w-xl mx-auto my-12 px-6">
                        <LuCircleAlert className="w-16 h-16 text-charcoal dark:text-cream mx-auto mb-4" strokeWidth={2} />
                        <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-2">Error Loading Session</h2>
                        <p className="text-charcoal/80 dark:text-cream/80 mb-6 font-bold">{errorMsg}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-5 py-2.5 bg-charcoal text-white dark:bg-cream dark:text-navy font-bold uppercase tracking-widest text-xs rounded-sm border-3 border-charcoal dark:border-cream/40 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!sessionData) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-screen bg-cream dark:bg-navy font-body">
                    <div className="text-center py-20 bg-white dark:bg-navy-light border-4 border-charcoal dark:border-cream/40 rounded-sm shadow-[8px_8px_0px_0px_var(--color-shadow)] max-w-xl mx-auto my-12 px-6">
                        <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-2">Session Not Found</h2>
                        <p className="text-charcoal/80 dark:text-cream/80 font-bold mb-6">The requested session could not be found.</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-5 py-2.5 bg-charcoal text-white dark:bg-cream dark:text-navy font-bold uppercase tracking-widest text-xs rounded-sm border-3 border-charcoal dark:border-cream/40 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-cream dark:bg-navy font-body transition-colors duration-300">
                {/* Header */}
                <div className="bg-cream dark:bg-navy text-charcoal dark:text-cream border-b-4 border-charcoal/15 dark:border-cream/20">
                    <div className="container mx-auto px-4 py-8 max-w-6xl">
                        {/* Breadcrumb Navigation */}
                        {fromPhase && role && (
                            <div className="flex items-center gap-2 text-charcoal/60 dark:text-cream/60 text-xs font-mono font-bold uppercase tracking-wider mb-6">
                                <span 
                                    onClick={() => navigate(`/roadmap?role=${encodeURIComponent(role)}`)}
                                    className="hover:text-charcoal dark:hover:text-cream hover:underline cursor-pointer transition-colors"
                                >
                                    {role}
                                </span>
                                <LuChevronRight className="w-4 h-4 text-charcoal/45" strokeWidth={3} />
                                <span 
                                    onClick={() => navigate(`/phase/${encodeURIComponent(role)}/${fromPhase}`)}
                                    className="hover:text-charcoal dark:hover:text-cream hover:underline cursor-pointer transition-colors"
                                >
                                    {phaseData?.name || sessionData.phaseName}
                                </span>
                                <LuChevronRight className="w-4 h-4 text-charcoal/45" strokeWidth={3} />
                                <span 
                                    onClick={() => navigate(`/phase-sessions/${encodeURIComponent(role)}/${fromPhase}`)}
                                    className="hover:text-charcoal dark:hover:text-cream hover:underline cursor-pointer transition-colors"
                                >
                                    Session Library
                                </span>
                                <LuChevronRight className="w-4 h-4 text-charcoal/45" strokeWidth={3} />
                                <span className="text-charcoal dark:text-cream font-bold">Practice Session</span>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-navy-light border-3 border-charcoal dark:border-cream/40 rounded-sm flex items-center justify-center shadow-[3px_3px_0px_0px_var(--color-shadow)] shrink-0">
                                    <LuBrain className="w-6 h-6 text-charcoal dark:text-cream" strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-wider leading-tight truncate">
                                        {sessionData.role}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-charcoal/70 dark:text-cream/70 mt-1 font-bold">
                                        <span>{phaseData?.name || sessionData.phaseName}</span>
                                        <span className="hidden sm:inline text-charcoal/30 dark:text-cream/20">•</span>
                                        <span>{sessionData.experience}y experience</span>
                                        <span className="hidden sm:inline text-charcoal/30 dark:text-cream/20">•</span>
                                        <span className="flex items-center gap-1 font-mono">
                                            <LuTarget className="w-3.5 h-3.5" />
                                            {sessionData.questions?.length || 0} Questions
                                        </span>
                                        <span className="hidden sm:inline text-charcoal/30 dark:text-cream/20">•</span>
                                        <span className="flex items-center gap-1 font-mono">
                                            <LuTrendingUp className="w-3.5 h-3.5" />
                                            {sessionData.completionPercentage || 0}% Complete
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-navy-light text-charcoal dark:text-cream font-mono font-bold uppercase tracking-widest text-[10px] rounded-sm border-3 border-charcoal dark:border-cream/40 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)] shrink-0"
                            >
                                <LuArrowLeft className="w-3.5 h-3.5" strokeWidth={3} />
                                <span>Back</span>
                            </button>
                        </div>

                        {/* Phase Badge */}
                        <div className="mt-5">
                            <span className="px-3 py-1.5 bg-white dark:bg-navy-light text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 rounded-sm text-xs font-mono font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                🎯 Roadmap Session • {sessionData.sessionType || 'roadmap'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    {/* Questions Section */}
                    <div className="space-y-6">
                        {sessionData.questions && sessionData.questions.length > 0 ? (
                            sessionData.questions.map((question, index) => (
                                <div key={question._id}>
                                    <QuestionCard
                                        questionId={question._id}
                                        question={question.question}
                                        answer={question.answer}
                                        userNote={question.note}
                                        isMastered={question.isMastered}
                                        isPinned={question.isPinned}
                                        onSaveNote={(note) => handleNote(question._id, note)}
                                        onToggleMastered={() => handleMaster(question._id)}
                                        onTogglePin={() => handlePin(question._id)}
                                        onAskFollowUp={() => handleFollowUp(question._id)}
                                        onRatingUpdate={(ratings) => handleRatingUpdate(question._id, ratings)}
                                        justification={question.justification}
                                        userRating={question.userRating}
                                        difficulty={question.difficulty}
                                        tags={question.tags}
                                        category={question.category}
                                        isUpdateLoader={isUpdateLoader}
                                        isRoadmapSession={true}
                                        phaseColor={phaseData?.color || sessionData.phaseColor}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-navy-light border-4 border-charcoal dark:border-cream/40 rounded-sm shadow-[8px_8px_0px_0px_var(--color-shadow)] max-w-xl mx-auto">
                                <div className="w-16 h-16 bg-charcoal dark:bg-cream rounded-sm flex items-center justify-center mx-auto mb-6 shadow-[3px_3px_0px_0px_var(--color-shadow)]">
                                    <LuListCollapse className="w-8 h-8 text-white dark:text-navy" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide">No Questions Available</h3>
                                <p className="text-charcoal/60 dark:text-cream/60 font-body text-sm max-w-xs mx-auto leading-relaxed">
                                    This session doesn't have any questions configured yet.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Follow-up Drawer */}
            <Drawer
                isOpen={isFollowUpDrawerOpen}
                onClose={() => setIsFollowUpDrawerOpen(false)}
                title="AI Follow-up Questions"
            >
                <AIResponsePreview
                    content={followUpContent}
                    isLoading={isFollowUpLoading}
                    error={followUpError}
                />
            </Drawer>
        </DashboardLayout>
    );
};

export default RoadmapSessionPractice;
