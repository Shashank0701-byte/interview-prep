import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LuPlus } from "react-icons/lu";
import toast from "react-hot-toast";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import SummaryCard from '../../components/Cards/SummaryCard';
import Modal from '../../components/Modal';
import CreateInterviewModal from '../../components/Modals/CreateInterviewModal';
import DeleteAlertContent from '../../components/DeleteAlertContent';
import SessionFilter from '../../components/SessionFilter';
import useSessionFilter from '../../hooks/useSessionFilter';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import moment from "moment";
import { CARD_BG, getSessionCardColor } from "../../utils/data";
import RatingModal from '../../components/RatingModal';
import StudyBuddyChat from '../../components/StudyBuddy/StudyBuddyChat';


const Dashboard = () => {
    const navigate = useNavigate();
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reviewCount, setReviewCount] = useState(0);
    const [openDeleteAlert, setOpenDeleteAlert] = useState({
        open: false,
        data: null,
    });
    
    const [ratingModal, setRatingModal] = useState({
        open: false,
        session: null
    });
    
    const { filters, filteredSessions, updateFilters, getFilterStats } = useSessionFilter(sessions);

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [sessionsRes, reviewRes] = await Promise.all([
                axiosInstance.get(API_PATHS.SESSIONS.GET_MY_SESSIONS),
                axiosInstance.get(API_PATHS.SESSIONS.GET_REVIEW_QUEUE)
            ]);
            
            if (sessionsRes.data?.sessions) {
                const sessionsWithProgress = sessionsRes.data.sessions.map(session => {
                    return {
                        ...session,
                        completionPercentage: session.completionPercentage || 0,
                        masteredQuestions: session.masteredQuestions || 0
                    };
                });
                setSessions(sessionsWithProgress);
            }
            if (reviewRes.data?.reviewQueue) {
                setReviewCount(reviewRes.data.reviewQueue.length);
            }
        } catch (error) {
            toast.error("Failed to load dashboard data.");
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteSession = async (sessionData) => {
        try {
            await axiosInstance.delete(API_PATHS.SESSIONS.DELETE(sessionData._id));
            toast.success("Session Deleted Successfully");
            setOpenDeleteAlert({ open: false, data: null });
            fetchDashboardData();
            window.dispatchEvent(new Event('analytics-refresh'));
        } catch (error) {
            toast.error("Failed to delete session.");
        }
    };
    
    const handleSessionRating = async (sessionId, ratings) => {
        try {
            await axiosInstance.put(API_PATHS.SESSIONS.UPDATE_RATING(sessionId), ratings);
            toast.success("Session rating updated successfully!");
            setRatingModal({ open: false, session: null });
            fetchDashboardData();
        } catch (error) {
            toast.error("Failed to update session rating.");
        }
    };
    
    const openRatingModal = (session) => {
        setRatingModal({
            open: true,
            session: {
                id: session._id,
                role: session.role,
                topicsToFocus: session.topicsToFocus,
                userRating: session.userRating || { overall: 3, difficulty: 3, usefulness: 3 }
            }
        });
    };

    const handleCreateSession = async (formData) => {
        try {
            const sessionData = {
                role: formData.targetRole,
                experience: formData.experience,
                topicsToFocus: formData.topics,
                description: formData.description
            };

            let aiResponse;
            
            if (formData.targetCompany) {
                aiResponse = await axiosInstance.post(API_PATHS.AI.COMPANY_QUESTIONS, {
                    companyName: formData.targetCompany,
                    role: formData.targetRole,
                    experience: formData.experience,
                    topicsToFocus: formData.topics,
                    numberOfQuestions: 10,
                });
            } else {
                aiResponse = await axiosInstance.post(API_PATHS.AI.GENERATE_QUESTIONS, {
                    role: formData.targetRole,
                    experience: formData.experience,
                    topicsToFocus: formData.topics,
                    numberOfQuestions: 10,
                });
            }

            const generatedQuestions = aiResponse.data;
            const response = await axiosInstance.post(API_PATHS.SESSIONS.CREATE, {
                ...sessionData,
                questions: generatedQuestions,
            });

            if (response.data?.session?._id) {
                toast.success("Session created successfully!");
                setOpenCreateModal(false);
                fetchDashboardData();
                window.dispatchEvent(new Event('analytics-refresh'));
                navigate(`/interview-prep/${response.data?.session?._id}`);
            }
        } catch (error) {
            console.error("Error creating session:", error);
            if (error.response && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Something went wrong. Please try again.");
            }
            throw error;
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        const handleRefresh = () => {
            console.log('Dashboard refresh triggered');
            fetchDashboardData();
        };

        window.addEventListener('analytics-refresh', handleRefresh);
        window.addEventListener('dashboard-refresh', handleRefresh);
        window.addEventListener('session-updated', handleRefresh);
        window.addEventListener('force-dashboard-refresh', handleRefresh);
        
        return () => {
            window.removeEventListener('analytics-refresh', handleRefresh);
            window.removeEventListener('dashboard-refresh', handleRefresh);
            window.removeEventListener('session-updated', handleRefresh);
            window.removeEventListener('force-dashboard-refresh', handleRefresh);
        };
    }, [fetchDashboardData]);

    const featureLinks = [
        { to: '/code-review', label: 'Code Review', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
        { to: '/resume-builder', label: 'Resume Builder', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { to: '/live-coding', label: 'Live Coding', icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', badge: 'LIVE' },
        { to: '/salary-negotiation', label: 'Salary Negotiation', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', badge: 'NEW' },
        { to: '/study-rooms', label: 'Study Rooms', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', badge: 'NEW' },
        { to: '/ai-interview-coach', label: 'AI Interview Coach', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', badge: 'AI' },
    ];

    return (
        <DashboardLayout>
            <div className='min-h-screen bg-cream dark:bg-navy transition-colors duration-300'>
                {/* Hero Section */}
                <div className="border-b-2 border-charcoal/10 dark:border-cream/10 transition-colors duration-300">
                    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display text-charcoal dark:text-cream leading-tight">
                                        My Interview Sessions
                                    </h1>
                                    <p className="text-base sm:text-lg text-charcoal/50 dark:text-cream/50 max-w-2xl transition-colors duration-300">
                                        Track your progress, practice with AI-generated questions, and ace your next interview
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-sm">
                                    <div className="flex items-center gap-3 bg-white dark:bg-navy-light border-2 border-charcoal/10 dark:border-cream/10 px-4 py-2 rounded-md transition-colors duration-300">
                                        <div className="w-2 h-2 bg-charcoal dark:bg-cream rounded-full"></div>
                                        <span className="font-semibold text-charcoal/70 dark:text-cream/70 text-xs uppercase tracking-[0.1em]">
                                            {getFilterStats().filtered} of {getFilterStats().total} sessions
                                        </span>
                                    </div>
                                    {getFilterStats().filtered !== getFilterStats().total && (
                                        <div className="flex items-center gap-2 bg-white dark:bg-navy-light border-2 border-crimson/30 px-4 py-2 rounded-md transition-colors duration-300">
                                            <div className="w-2 h-2 bg-crimson rounded-full"></div>
                                            <span className="text-crimson font-semibold text-xs uppercase tracking-[0.1em]">
                                                Filtered view active
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {reviewCount > 0 && (
                                    <Link 
                                        to="/review" 
                                        className="bg-transparent border-2 border-charcoal dark:border-cream/40 flex flex-col items-center justify-center gap-3 px-4 py-5 min-h-[110px] relative rounded-md transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)]"
                                    >
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-crimson rounded-full"></div>
                                        <div className="w-9 h-9 border-2 border-charcoal dark:border-cream/40 rounded-md flex items-center justify-center">
                                            <svg className="w-4 h-4 text-charcoal dark:text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-center text-xs font-bold uppercase tracking-[0.08em] text-charcoal dark:text-cream">
                                            Review ({reviewCount})
                                        </span>
                                    </Link>
                                )}
                                {featureLinks.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className="bg-transparent border-2 border-charcoal dark:border-cream/40 flex flex-col items-center justify-center gap-3 px-4 py-5 min-h-[110px] relative rounded-md transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)]"
                                    >
                                        {link.badge && (
                                            <div className="absolute top-2 right-2 bg-charcoal dark:bg-cream text-white dark:text-navy text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
                                                {link.badge}
                                            </div>
                                        )}
                                        <div className="w-9 h-9 border-2 border-charcoal dark:border-cream/40 rounded-md flex items-center justify-center">
                                            <svg className="w-4 h-4 text-charcoal dark:text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                                            </svg>
                                        </div>
                                        <span className="text-center text-xs font-bold uppercase tracking-[0.08em] text-charcoal dark:text-cream">{link.label}</span>
                                    </Link>
                                ))}
                                
                                <button
                                    onClick={() => setOpenCreateModal(true)}
                                    className="flex flex-col items-center justify-center gap-3 bg-transparent border-2 border-dashed border-charcoal/30 dark:border-cream/20 hover:border-charcoal dark:hover:border-cream/60 px-4 py-5 rounded-md transition-all duration-200 min-h-[110px] group hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)]"
                                >
                                    <div className="w-9 h-9 border-2 border-charcoal/30 dark:border-cream/20 group-hover:border-charcoal dark:group-hover:border-cream/60 rounded-md flex items-center justify-center transition-colors">
                                        <svg className="w-4 h-4 text-charcoal/40 dark:text-cream/40 group-hover:text-charcoal dark:group-hover:text-cream group-hover:rotate-90 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <span className="text-center text-xs font-bold uppercase tracking-[0.08em] text-charcoal/40 dark:text-cream/40 group-hover:text-charcoal dark:group-hover:text-cream transition-colors">Create New Session</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="container mx-auto px-4 md:px-6 py-2">
                    <div className="mb-8 border-b-2 border-charcoal/10 dark:border-cream/10 pb-6 pt-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-charcoal dark:bg-cream rounded-md flex items-center justify-center">
                                <svg className="w-4 h-4 text-white dark:text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-display text-charcoal dark:text-cream">Filter & Search Sessions</h2>
                        </div>
                        <SessionFilter 
                            onFilterChange={updateFilters} 
                            activeFilters={filters}
                        />
                        
                        {/* Color Legend */}
                        <div className="mt-6 pt-6 border-t-2 border-charcoal/10 dark:border-cream/10">
                            <h3 className="section-label mb-3">Session Progress</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                                {[
                                    { label: 'Ready to Start', color: '#F5F0E8' },
                                    { label: 'Getting Started', color: '#E8DDD0' },
                                    { label: 'In Progress', color: '#D4C4B0' },
                                    { label: 'High Progress', color: '#C0B49A' },
                                    { label: 'Completed', color: '#1A1A1A' },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-sm border border-charcoal/20 dark:border-cream/20" style={{background: item.color}}></div>
                                        <span className="text-charcoal/50 dark:text-cream/50 font-medium uppercase tracking-wider text-[10px]">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sessions Grid */}
                <div className="container mx-auto px-4 md:px-6 pb-12">
                    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
                        {isLoading ? (
                            <div className="col-span-full flex items-center justify-center py-24">
                                <div className="text-center space-y-6">
                                    <div className="relative">
                                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-charcoal/10 dark:border-cream/10 border-t-charcoal dark:border-t-cream mx-auto"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-lg font-display text-charcoal dark:text-cream">Loading your sessions...</p>
                                        <p className="text-sm text-charcoal/40 dark:text-cream/40 uppercase tracking-wider">Preparing your dashboard</p>
                                    </div>
                                </div>
                            </div>
                        ) : filteredSessions.length > 0 ? (
                        filteredSessions.map((data, index) => (
                            <SummaryCard
                                key={data._id}
                                sessionId={data._id}
                                colors={getSessionCardColor(data.completionPercentage || 0, data.status || 'Active')} 
                                role={data.role}
                                topicsToFocus={data.topicsToFocus}
                                experience={data.experience}
                                questions={data.questions.length}
                                description={data.description}
                                lastUpdated={moment(data.updatedAt).format("Do MMM YYYY")}
                                onSelect={() => navigate(`/interview-prep/${data._id}`)}
                                onDelete={() => setOpenDeleteAlert({ open: true, data })}
                                userRating={data.userRating || { overall: 3, difficulty: 3, usefulness: 3 }}
                                status={data.status || 'Active'}
                                completionPercentage={data.completionPercentage || 0}
                                masteredQuestions={data.masteredQuestions || 0}
                                onRateClick={() => openRatingModal(data)}
                            />
                        ))
                    ) : getFilterStats().total > 0 ? (
                        <div className="col-span-full flex items-center justify-center py-24">
                            <div className="text-center space-y-6 max-w-lg">
                                <div className="w-20 h-20 mx-auto border-2 border-charcoal dark:border-cream/40 rounded-md flex items-center justify-center">
                                    <svg className="w-10 h-10 text-charcoal/40 dark:text-cream/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-display text-charcoal dark:text-cream">No matching sessions found</h3>
                                    <p className="text-charcoal/50 dark:text-cream/50">Try adjusting your search criteria or explore different filter options.</p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                                        <button 
                                            onClick={() => updateFilters({})}
                                            className="btn-primary max-w-xs"
                                        >
                                            Clear All Filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="col-span-full flex items-center justify-center py-24">
                            <div className="text-center space-y-6 max-w-xl">
                                <div className="w-24 h-24 mx-auto border-2 border-charcoal dark:border-cream/40 rounded-md flex items-center justify-center">
                                    <svg className="w-12 h-12 text-charcoal/30 dark:text-cream/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-3xl font-display text-charcoal dark:text-cream">
                                        Ready to ace your interviews?
                                    </h3>
                                    <p className="text-charcoal/50 dark:text-cream/50">
                                        Create your first interview session and get AI-generated questions tailored to your role.
                                    </p>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                                    <button
                                        onClick={() => setOpenCreateModal(true)}
                                        className="btn-primary max-w-xs"
                                    >
                                        Create Your First Session
                                    </button>
                                    <Link
                                        to="/progress"
                                        className="inline-flex items-center justify-center gap-2 text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 px-6 py-3 rounded-md font-bold text-sm uppercase tracking-wider hover:bg-charcoal hover:text-white dark:hover:bg-cream dark:hover:text-navy transition-all"
                                    >
                                        View Analytics
                                    </Link>
                                </div>
                                
                                <div className="pt-6 border-t-2 border-charcoal/10 dark:border-cream/10">
                                    <p className="section-label mb-4">What you'll get with your first session</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                        <div className="flex items-center gap-2 text-charcoal/60 dark:text-cream/60">
                                            <div className="w-2 h-2 bg-charcoal dark:bg-cream rounded-full"></div>
                                            AI-generated questions
                                        </div>
                                        <div className="flex items-center gap-2 text-charcoal/60 dark:text-cream/60">
                                            <div className="w-2 h-2 bg-charcoal dark:bg-cream rounded-full"></div>
                                            Progress tracking
                                        </div>
                                        <div className="flex items-center gap-2 text-charcoal/60 dark:text-cream/60">
                                            <div className="w-2 h-2 bg-charcoal dark:bg-cream rounded-full"></div>
                                            Performance analytics
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </div>
            <CreateInterviewModal 
                isOpen={openCreateModal} 
                onClose={() => setOpenCreateModal(false)}
                onCreateSession={handleCreateSession}
            />
            <Modal isOpen={openDeleteAlert.open} onClose={() => setOpenDeleteAlert({ open: false, data: null })} title="Delete Session">
                <div className='w-[30vw]'>
                    <DeleteAlertContent
                        content="Are you sure you want to delete this session?"
                        onDelete={() => deleteSession(openDeleteAlert.data)}
                        onCancel={() => setOpenDeleteAlert({ open: false, data: null })}
                    />
                </div>
            </Modal>
            
            <RatingModal
                isOpen={ratingModal.open}
                onClose={() => setRatingModal({ open: false, session: null })}
                sessionData={ratingModal.session}
                onSubmit={(ratings) => handleSessionRating(ratingModal.session?.id, ratings)}
            />
            
            <StudyBuddyChat userId="current-user" />
        </DashboardLayout>
    );
};

export default Dashboard;
