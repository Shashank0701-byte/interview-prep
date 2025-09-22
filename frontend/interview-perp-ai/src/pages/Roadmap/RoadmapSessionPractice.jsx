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
                <div className="flex items-center justify-center h-screen">
                    <SpinnerLoader />
                </div>
            </DashboardLayout>
        );
    }

    if (errorMsg) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <LuCircleAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Session</h2>
                        <p className="text-gray-600 mb-4">{errorMsg}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-2xl hover:shadow-lg transition-all duration-300"
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
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Session Not Found</h2>
                        <p className="text-gray-600 mb-4">The requested session could not be found.</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-2xl hover:shadow-lg transition-all duration-300"
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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {/* Roadmap Session Header */}
                    <div className={`bg-gradient-to-r ${getPhaseColor(phaseData?.color || sessionData.phaseColor)} rounded-3xl p-8 mb-8 text-white`}>
                        {/* Breadcrumb Navigation */}
                        {fromPhase && role && (
                            <div className="flex items-center gap-2 text-white/80 mb-6">
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
                                <span className="text-white font-medium">Practice Session</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                                    <LuBrain className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                        {sessionData.role}
                                    </h1>
                                    <p className="text-xl text-white/90 mb-2">
                                        {phaseData?.name || sessionData.phaseName} • {sessionData.experience} years experience
                                    </p>
                                    <div className="flex items-center gap-4 text-white/80">
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
                                className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
                            >
                                <LuArrowLeft className="w-4 h-4" />
                                <span>Back</span>
                            </button>
                        </div>

                        {/* Phase Badge */}
                        <div className="mt-6">
                            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
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
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <LuListCollapse className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">No Questions Available</h3>
                                <p className="text-gray-600">
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
