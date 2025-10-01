import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LuPlus } from "react-icons/lu";
import toast from "react-hot-toast";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import SummaryCard from '../../components/Cards/SummaryCard';
import Modal from '../../components/Modal';
import CreateSessionForm from './CreateSessionForm';
import DeleteAlertContent from '../../components/DeleteAlertContent';
import SessionFilter from '../../components/SessionFilter';
import useSessionFilter from '../../hooks/useSessionFilter';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import moment from "moment";
import { CARD_BG, getSessionCardColor } from "../../utils/data";
import RatingModal from '../../components/RatingModal';


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
    
    // State for rating modal
    const [ratingModal, setRatingModal] = useState({
        open: false,
        session: null
    });
    
    // Filter functionality for session cards
    const { filters, filteredSessions, updateFilters, getFilterStats } = useSessionFilter(sessions);

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [sessionsRes, reviewRes] = await Promise.all([
                axiosInstance.get(API_PATHS.SESSIONS.GET_MY_SESSIONS),
                axiosInstance.get(API_PATHS.SESSIONS.GET_REVIEW_QUEUE)
            ]);
            
            if (sessionsRes.data?.sessions) {
                // Calculate real progress data for each session
                const sessionsWithProgress = sessionsRes.data.sessions.map(session => {
                    // Use the actual progress data from the session model
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
            
            // Trigger analytics refresh after deleting session
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

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Listen for various refresh events to update dashboard
    useEffect(() => {
        const handleRefresh = () => {
            console.log('Dashboard refresh triggered');
            fetchDashboardData();
        };

        // Listen to multiple events
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

    return (
        <DashboardLayout>
            <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20'>
                {/* Enhanced Hero Section */}
                <div className="bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/20 border-b border-gray-100/60">
                    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
                            <div className="space-y-3 sm:space-y-4">
                                <div className="space-y-2">
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent leading-tight">
                                        My Interview Sessions
                                    </h1>
                                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl">
                                        Track your progress, practice with AI-generated questions, and ace your next interview
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-sm">
                                    <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-blue-100/50 shadow-sm">
                                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                                        <span className="font-medium text-gray-700">
                                            {getFilterStats().filtered} of {getFilterStats().total} sessions
                                        </span>
                                    </div>
                                    {getFilterStats().filtered !== getFilterStats().total && (
                                        <div className="flex items-center gap-2 bg-amber-50/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-amber-200/50">
                                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                            <span className="text-amber-700 font-medium">
                                                Filtered view active
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                                {reviewCount > 0 && (
                                    <Link 
                                        to="/review" 
                                        className="group flex flex-col items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-2 sm:px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 min-h-[80px] sm:min-h-[100px] relative"
                                    >
                                        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full animate-pulse"></div>
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-center text-xs sm:text-sm">
                                            <span className="hidden sm:inline">Start Review ({reviewCount})</span>
                                            <span className="sm:hidden">Review ({reviewCount})</span>
                                        </span>
                                    </Link>
                                )}
                                <Link
                                    to="/code-review"
                                    className="group flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 min-h-[100px]"
                                >
                                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    <span className="text-center text-sm">Code Review</span>
                                </Link>
                                <Link
                                    to="/resume-builder"
                                    className="group flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 min-h-[100px] relative"
                                >
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-center text-sm">Smart Resume Builder</span>
                                </Link>
                                <Link
                                    to="/live-coding"
                                    className="group flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 min-h-[100px] relative"
                                >
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-300 rounded-full animate-bounce"></div>
                                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-center text-sm">Live Coding</span>
                                </Link>
                                <button
                                    onClick={() => setOpenCreateModal(true)}
                                    className="group flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 min-h-[100px]"
                                >
                                    <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span className="text-center text-sm">Create New Session</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Filter Section */}
                <div className="container mx-auto px-4 md:px-6 py-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 p-8 mb-8 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Filter & Search Sessions</h2>
                        </div>
                        <SessionFilter 
                            onFilterChange={updateFilters} 
                            activeFilters={filters}
                        />
                        
                        {/* Color Legend */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Session Progress Colors</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-md" style={{background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'}}></div>
                                    <span className="text-gray-600">Ready to Start</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-md" style={{background: 'linear-gradient(135deg, #fff2e9 0%, #fff7ed 100%)'}}></div>
                                    <span className="text-gray-600">Getting Started</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-md" style={{background: 'linear-gradient(135deg, #f0ecff 0%, #f5f3ff 100%)'}}></div>
                                    <span className="text-gray-600">In Progress</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-md" style={{background: 'linear-gradient(135deg, #eaf7ff 0%, #f0f9ff 100%)'}}></div>
                                    <span className="text-gray-600">High Progress</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-md" style={{background: 'linear-gradient(135deg, #e6f8f3 0%, #f0fdf4 100%)'}}></div>
                                    <span className="text-gray-600">Completed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Sessions Grid */}
                <div className="container mx-auto px-4 md:px-6 pb-12">
                    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                        {isLoading ? (
                            <div className="col-span-full flex items-center justify-center py-24">
                                <div className="text-center space-y-6">
                                    <div className="relative">
                                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-400 animate-spin" style={{animationDelay: '0.2s', animationDuration: '2s'}}></div>
                                        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-purple-300 animate-spin" style={{animationDelay: '0.4s', animationDuration: '1.5s'}}></div>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-xl font-semibold text-gray-800">Loading your sessions...</p>
                                        <p className="text-gray-600">Preparing your interview prep dashboard</p>
                                        <div className="flex items-center justify-center gap-1 mt-4">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                        </div>
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
                                // Enhanced props with real data
                                userRating={data.userRating || { overall: 3, difficulty: 3, usefulness: 3 }}
                                status={data.status || 'Active'}
                                completionPercentage={data.completionPercentage || 0}
                                masteredQuestions={data.masteredQuestions || 0}
                                onRateClick={() => openRatingModal(data)}
                            />
                        ))
                    ) : getFilterStats().total > 0 ? (
                        <div className="col-span-full flex items-center justify-center py-24">
                            <div className="text-center space-y-8 max-w-lg">
                                <div className="relative">
                                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-amber-100 via-orange-100 to-red-100 rounded-full flex items-center justify-center shadow-xl">
                                        <svg className="w-16 h-16 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold text-gray-800">No matching sessions found</h3>
                                    <p className="text-gray-600 text-lg leading-relaxed">We couldn't find any sessions that match your current filters. Try adjusting your search criteria or explore different filter options.</p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                                        <button 
                                            onClick={() => updateFilters({})}
                                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Clear All Filters
                                        </button>
                                        <button
                                            onClick={() => setOpenCreateModal(true)}
                                            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Create New Session
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="col-span-full flex items-center justify-center py-24">
                            <div className="text-center space-y-8 max-w-2xl">
                                <div className="relative">
                                    <div className="w-40 h-40 mx-auto bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-full flex items-center justify-center shadow-2xl">
                                        <svg className="w-20 h-20 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                                            Ready to ace your interviews?
                                        </h3>
                                        <p className="text-xl text-gray-600 leading-relaxed max-w-xl mx-auto">
                                            Create your first interview session and get AI-generated questions tailored to your role and experience level. Start building your confidence today!
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                                        <button
                                            onClick={() => setOpenCreateModal(true)}
                                            className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
                                        >
                                            <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Create Your First Session
                                        </button>
                                        <Link
                                            to="/progress"
                                            className="group inline-flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 px-10 py-5 rounded-2xl font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                                        >
                                            <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            View Analytics
                                        </Link>
                                    </div>
                                    
                                    <div className="pt-6 border-t border-gray-100">
                                        <p className="text-sm text-gray-500 mb-4">✨ What you'll get with your first session:</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                AI-generated questions
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                Progress tracking
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                Performance analytics
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </div>
            <Modal isOpen={openCreateModal} onClose={() => setOpenCreateModal(false)} hideHeader>
                <CreateSessionForm onSuccess={() => {
                    setOpenCreateModal(false);
                    fetchDashboardData();
                    
                    // Trigger analytics refresh after creating session
                    window.dispatchEvent(new Event('analytics-refresh'));
                }} />
            </Modal>
            <Modal isOpen={openDeleteAlert.open} onClose={() => setOpenDeleteAlert({ open: false, data: null })} title="Delete Session">
                <div className='w-[30vw]'>
                    <DeleteAlertContent
                        content="Are you sure you want to delete this session?"
                        onDelete={() => deleteSession(openDeleteAlert.data)}
                        onCancel={() => setOpenDeleteAlert({ open: false, data: null })}
                    />
                </div>
            </Modal>
            
            {/* Rating Modal */}
            <RatingModal
                isOpen={ratingModal.open}
                onClose={() => setRatingModal({ open: false, session: null })}
                sessionData={ratingModal.session}
                onSubmit={(ratings) => handleSessionRating(ratingModal.session?.id, ratings)}
            />
        </DashboardLayout>
    );
};

export default Dashboard;
