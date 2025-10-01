import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { useScrollToTop } from '../../hooks/useScrollToTop';
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import { LuCircleAlert, LuListCollapse } from "react-icons/lu";
import SpinnerLoader from "../../components/Loader/SpinnerLoader.jsx";
import { toast } from "react-hot-toast";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import RoleInfoHeader from './components/RoleInfoHeader';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import QuestionCard from '../../components/Cards/QuestionCard_enhanced';
import Drawer from '../../components/Drawer';
import SkeletonLoader from '../../components/Loader/SkeletonLoader';
import AIResponsePreview from './components/AIResponsePreview';

const InterviewPrep = () => {
    const { sessionId } = useParams();
    
    // Auto scroll to top when navigating to this page or changing sessions
    useScrollToTop(true, [sessionId]);
    
    const [sessionData, setSessionData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdateLoader, setIsUpdateLoader] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // --- State for the Follow-up Drawer ---
    const [isFollowUpDrawerOpen, setIsFollowUpDrawerOpen] = useState(false);
    const [followUpContent, setFollowUpContent] = useState(null);
    const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
    const [followUpError, setFollowUpError] = useState("");
    
    // Filter functionality removed - moved to Dashboard

    const fetchSessionDetailsById = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.SESSIONS.GET_ONE(sessionId));
            setSessionData(response.data.session);
        } catch (error) {
            console.error("Error fetching session:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (sessionId) {
            fetchSessionDetailsById();
        }
    }, [sessionId]);

    const handleNote = async (questionId, note) => {
        try {
            setIsUpdateLoader(true);
            const response = await axiosInstance.put(API_PATHS.QUESTION.UPDATE_NOTE(questionId), { note });
            if (response.data) {
                toast.success("Note saved successfully!");
                fetchSessionDetailsById();
                
                // Trigger analytics refresh after saving note
                window.dispatchEvent(new Event('analytics-refresh'));
            }
        } catch (error) {
            toast.error("Failed to save note.");
        } finally {
            setIsUpdateLoader(false);
        }
    };

    const handleAskFollowUp = async (originalQuestion, originalAnswer) => {
        setIsFollowUpDrawerOpen(true);
        setIsFollowUpLoading(true);
        setFollowUpContent(null);
        setFollowUpError("");
        try {
            const response = await axiosInstance.post(API_PATHS.AI.GENERATE_FOLLOW_UP, {
                originalQuestion,
                originalAnswer,
            });
            setFollowUpContent(response.data.followUp);
        } catch (error) {
            setFollowUpError("Failed to generate a follow-up. Please try again.");
        } finally {
            setIsFollowUpLoading(false);
        }
    };

    const toggleQuestionPinStatus = async (questionId) => {
        try {
            await axiosInstance.post(API_PATHS.QUESTION.PIN(questionId));
            fetchSessionDetailsById();
            
            // Trigger analytics refresh after pinning/unpinning
            window.dispatchEvent(new Event('analytics-refresh'));
        } catch (error) {
            console.error("Error pinning question:", error);
        }
    };

    const handleToggleMastered = async (questionId) => {
        try {
            await axiosInstance.put(API_PATHS.QUESTION.TOGGLE_MASTERED(questionId));
            fetchSessionDetailsById();
            
            // Trigger analytics refresh after mastering/unmastering
            window.dispatchEvent(new Event('analytics-refresh'));
        } catch (error) {
            toast.error("Failed to update status.");
        }
    };

    const handleUpdateRating = async (questionId, rating) => {
        try {
            await axiosInstance.put(API_PATHS.QUESTION.UPDATE_RATING(questionId), { userRating: rating });
            toast.success("Rating updated successfully!");
            fetchSessionDetailsById();
            
            // Trigger analytics refresh after rating update
            window.dispatchEvent(new Event('analytics-refresh'));
        } catch (error) {
            toast.error("Failed to update rating.");
        }
    };
    
    // Removed handleRatingUpdate - ratings are now only for sessions

    const uploadMoreQuestions = async () => {
        setIsUpdateLoader(true);
        try {
            const aiResponse = await axiosInstance.post(API_PATHS.AI.GENERATE_QUESTIONS, {
                role: sessionData?.role,
                experience: sessionData?.experience,
                topicsToFocus: sessionData?.topicsToFocus,
                numberOfQuestions: 10,
            });
            const addQuestionsResponse = await axiosInstance.post(API_PATHS.QUESTION.ADD_TO_SESSION, {
                sessionId,
                questions: aiResponse.data,
            });
            
            console.log('Questions added, session updated:', addQuestionsResponse.data.session);
            toast.success("Added More Q&A!");
            
            // Wait a bit for backend to fully process, then refresh
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Refresh session data
            await fetchSessionDetailsById();
            
            // Wait another moment, then trigger dashboard refresh
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Trigger refresh events with proper sequencing
            window.dispatchEvent(new Event('analytics-refresh'));
            window.dispatchEvent(new Event('dashboard-refresh'));
            window.dispatchEvent(new Event('session-updated'));
            
            // Final refresh with longer delay to ensure everything is updated
            setTimeout(() => {
                window.dispatchEvent(new Event('force-dashboard-refresh'));
                console.log('Final refresh triggered after adding questions');
            }, 1500);
        } catch (error) {
            setErrorMsg("Something went wrong while loading more questions.");
        } finally {
            setIsUpdateLoader(false);
        }
    };

    if (isLoading) {
        return <DashboardLayout><div className="flex-center h-screen"><SpinnerLoader /></div></DashboardLayout>;
    }

    if (!sessionData) {
        return <DashboardLayout><div className="flex-center h-screen"><p>Session not found.</p></div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <RoleInfoHeader
                role={sessionData?.role || ""}
                topicsToFocus={sessionData?.topicsToFocus || ""}
                experience={sessionData?.experience || "-"}
                questions={sessionData?.questions?.length || "-"}
                description={sessionData?.description || ""}
                lastUpdated={moment(sessionData.updatedAt).format("Do MMM YYYY")}
            />
            <div className='container mx-auto pt-4 pb-4 px-4 md:px-8'>
                <h2 className='text-lg font-semibold text-black'>Interview Q & A</h2>
                <div className='grid grid-cols-12 gap-4 mt-5 mb-10'>
                    <div className={`col-span-12 ${isFollowUpDrawerOpen ? "md:col-span-7" : "md:col-span-8"}`}>
                        <AnimatePresence>
                            {sessionData?.questions?.map((data, index) => (
                                <motion.div
                                    key={data._id}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, type: "spring", stiffness: 100, delay: index * 0.1, damping: 15 }}
                                    layout
                                    layoutId={`question-${data._id}`}
                                >
                                    <QuestionCard
                                        questionId={data._id}
                                        question={data.question}
                                        answer={data.answer}
                                        userNote={data.note}
                                        onSaveNote={handleNote}
                                        isMastered={data.isMastered}
                                        onToggleMastered={() => handleToggleMastered(data._id)}
                                        isPinned={data.isPinned}
                                        onTogglePin={() => toggleQuestionPinStatus(data._id)}
                                        onAskFollowUp={() => handleAskFollowUp(data.question, data.answer)}
                                        // Enhanced props
                                        justification={data.justification}
                                        userRating={data.userRating}
                                        onUpdateRating={handleUpdateRating}
                                        difficulty={data.difficulty}
                                        tags={data.tags}
                                        category={data.category}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <div className='flex items-center justify-center mt-5'>
                            <button
                                className='flex items-center gap-3 text-sm text-white font-medium bg-black px-5 py-2 rounded cursor-pointer'
                                disabled={isUpdateLoader}
                                onClick={uploadMoreQuestions}
                            >
                                {isUpdateLoader ? <SpinnerLoader /> : <LuListCollapse className='text-lg' />}
                                Load More
                            </button>
                        </div>
                    </div>
                </div>

                <Drawer
                    isOpen={isFollowUpDrawerOpen}
                    onClose={() => setIsFollowUpDrawerOpen(false)}
                    title="Follow-up Question"
                >
                    {isFollowUpLoading && <SkeletonLoader />}
                    {followUpError && <p className="text-amber-600 flex items-center gap-2"><LuCircleAlert /> {followUpError}</p>}
                    {followUpContent && (
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-4">{followUpContent.question}</h3>
                            <AIResponsePreview content={followUpContent.answer} />
                        </div>
                    )}
                </Drawer>
            </div>
        </DashboardLayout>
    );
};

export default InterviewPrep;
