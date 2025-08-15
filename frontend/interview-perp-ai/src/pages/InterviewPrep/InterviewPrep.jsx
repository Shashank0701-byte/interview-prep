import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import { LuCircleAlert, LuListCollapse } from "react-icons/lu";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import { toast } from "react-hot-toast";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import RoleInfoHeader from './components/RoleInfoHeader';
import axiosInstance from '../../utils/axiosInstance';
import QuestionCard from '../../components/Cards/QuestionCard';
import Drawer from '../../components/Drawer';
import SkeletonLoader from '../../components/Loader/SkeletonLoader';
import AIResponsePreview from './components/AIResponsePreview';

// ✅ FIX: Added the missing API path for the follow-up feature
const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register",
        LOGIN: "/api/auth/login",
        GET_PROFILE: "/api/auth/profile",
    },
    IMAGE: {
        UPLOAD_IMAGE: "/api/auth/upload-image",
    },
    AI: {
        GENERATE_QUESTIONS: "/api/ai/generate-questions",
        GENERATE_EXPLANATION: "/api/ai/generate-explanation",
        PRACTICE_FEEDBACK: "/api/ai/practice-feedback",
        GENERATE_FOLLOW_UP: "/api/ai/follow-up", // <-- This was missing
    },
    SESSIONS: { 
        CREATE: "/api/sessions/create",
        GET_MY_SESSIONS: "/api/sessions/my-sessions",
        GET_ONE: (id) => `/api/sessions/${id}`,
        DELETE: (id) => `/api/sessions/${id}`,
        GET_REVIEW_QUEUE: "/api/sessions/review-queue",
    },
    QUESTION: {
        ADD_TO_SESSION: "/api/questions/add",
        PIN: (id) => `/api/questions/${id}/pin`,
        UPDATE_NOTE: (id) => `/api/questions/${id}/note`,
        TOGGLE_MASTERED: (id) => `/api/questions/${id}/master`,
        REVIEW: (id) => `/api/questions/${id}/review`,
    },
};

const InterviewPrep = () => {
    const { sessionId } = useParams();
    const [sessionData, setSessionData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdateLoader, setIsUpdateLoader] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // --- State for the Follow-up Drawer ---
    const [isFollowUpDrawerOpen, setIsFollowUpDrawerOpen] = useState(false);
    const [followUpContent, setFollowUpContent] = useState(null);
    const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
    const [followUpError, setFollowUpError] = useState("");

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
        } catch (error) {
            console.error("Error pinning question:", error);
        }
    };

    const handleToggleMastered = async (questionId) => {
        try {
            await axiosInstance.put(API_PATHS.QUESTION.TOGGLE_MASTERED(questionId));
            fetchSessionDetailsById();
        } catch (error) {
            toast.error("Failed to update status.");
        }
    };

    const uploadMoreQuestions = async () => {
        setIsUpdateLoader(true);
        try {
            const aiResponse = await axiosInstance.post(API_PATHS.AI.GENERATE_QUESTIONS, {
                role: sessionData?.role,
                experience: sessionData?.experience,
                topicsToFocus: sessionData?.topicsToFocus,
                numberOfQuestions: 10,
            });
            await axiosInstance.post(API_PATHS.QUESTION.ADD_TO_SESSION, {
                sessionId,
                questions: aiResponse.data,
            });
            toast.success("Added More Q&A!");
            fetchSessionDetailsById();
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
