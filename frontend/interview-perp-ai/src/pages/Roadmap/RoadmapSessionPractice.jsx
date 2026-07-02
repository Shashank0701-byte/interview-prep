import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import { LuCircleAlert, LuListCollapse, LuArrowLeft, LuChevronRight, LuBrain, LuTarget, LuTrendingUp } from "react-icons/lu";
import SpinnerLoader from "../../components/Loader/SpinnerLoader.jsx";
import { toast } from "react-hot-toast";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import QuestionCard from '../../components/Cards/QuestionCard_enhanced';
import Drawer from '../../components/Drawer';
import SkeletonLoader from '../../components/Loader/SkeletonLoader';
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

    const getPhaseColor = (color) => {
        const colors = {
            blue: 'from-blue-500 to-cyan-500',
            purple: 'from-purple-500 to-indigo-500',
            emerald: 'from-emerald-500 to-teal-500',
            orange: 'from-orange-500 to-red-500',
        };
        return colors[color] || 'from-indigo-500 to-purple-500';
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-screen bg-cream dark:bg-navy font-body">
                    <SpinnerLoader />
                </div>
            </DashboardLayout>
        );
    }

    if (errorMsg) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-screen bg-cream dark:bg-navy font-body">
                    <div className="text-center">
                        <LuCircleAlert className="w-16 h-16 text-charcoal dark:text-cream mx-auto mb-4" />
                        <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-2">Error Loading Session</h2>
                        <p className="text-charcoal/80 dark:text-cream/80 mb-4 font-bold">{errorMsg}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 bg-charcoal text-white font-bold uppercase tracking-wider text-sm rounded-md border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all cursor-pointer"
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
                    <div className="text-center">
                        <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-2">Session Not Found</h2>
                        <p className="text-charcoal/80 dark:text-cream/80 font-bold mb-4">The requested session could not be found.</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 bg-charcoal text-white font-bold uppercase tracking-wider text-sm rounded-md border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all cursor-pointer"
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
            <div className="min-h-screen bg-cream dark:bg-navy font-body">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {/* Roadmap Session Header */}
                    <div className={`bg-charcoal dark:bg-navy-input border-2 border-charcoal dark:border-cream/40 shadow-[4px_4px_0px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_0px_var(--color-shadow)] rounded-md p-8 mb-8 text-white dark:text-cream`}>
                        {/* Breadcrumb Navigation */}
                        {fromPhase && role && (
                            <div className="flex items-center gap-2 text-white/80 mb-6 font-bold">
                                <span 
                                    onClick={() => navigate('/roadmap')}
                                    className="hover:text-white cursor-pointer transition-colors"
                                >
                                    {role}
                                </span>
                                <LuChevronRight className="w-4 h-4" />
                                <span 
                                    onClick={() => navigate(`/phase/${encodeURIComponent(role)}/${fromPhase}`)}
                                    className="hover:text-white cursor-pointer transition-colors"
                                >
                                    {phaseData?.name || sessionData.phaseName}
                                </span>
                                <LuChevronRight className="w-4 h-4" />
                                <span 
                                    onClick={() => navigate(`/phase-sessions/${encodeURIComponent(role)}/${fromPhase}`)}
                                    className="hover:text-white cursor-pointer transition-colors"
                                >
                                    Session Library
                                </span>
                                <LuChevronRight className="w-4 h-4" />
                                <span className="text-white">Practice Session</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-white dark:bg-navy-light rounded-md">
                                    <LuBrain className="w-8 h-8 text-charcoal dark:text-cream" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 text-white dark:text-cream">
                                        {sessionData.role}
                                    </h1>
                                    <p className="text-xl text-white/90 dark:text-cream/90 mb-2 font-bold">
                                        {phaseData?.name || sessionData.phaseName} • {sessionData.experience} years experience
                                    </p>
                                    <div className="flex items-center gap-4 text-white/80 dark:text-cream/80 font-bold">
                                        <div className="flex items-center gap-2">
                                            <LuTarget className="w-4 h-4" />
                                            <span>{sessionData.questions?.length || 0} Questions</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <LuTrendingUp className="w-4 h-4" />
                                            <span>{sessionData.completionPercentage || 0}% Complete</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-navy-light text-charcoal dark:text-cream font-bold uppercase tracking-wider text-sm rounded-md border-2 border-charcoal dark:border-cream/40 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all cursor-pointer"
                            >
                                <LuArrowLeft className="w-4 h-4" />
                                <span>Back</span>
                            </button>
                        </div>

                        {/* Phase Badge */}
                        <div className="mt-6">
                            <span className="px-4 py-2 bg-white dark:bg-navy-light text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 rounded-sm text-sm font-bold">
                                🎯 Roadmap Session • {sessionData.sessionType || 'roadmap'}
                            </span>
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className="space-y-6">
                        {sessionData.questions && sessionData.questions.length > 0 ? (
                            sessionData.questions.map((question, index) => (
                                <motion.div
                                    key={question._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
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
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-cream dark:bg-navy">
                                <div className="w-20 h-20 bg-charcoal dark:bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
                                    <LuListCollapse className="w-10 h-10 text-white dark:text-navy" />
                                </div>
                                <h3 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-4">No Questions Available</h3>
                                <p className="text-charcoal/80 dark:text-cream/80 font-bold">
                                    This session doesn't have any questions yet.
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
