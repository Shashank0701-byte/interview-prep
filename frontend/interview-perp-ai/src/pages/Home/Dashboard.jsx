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
import { CARD_BG } from "../../utils/data";
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
                setSessions(sessionsRes.data.sessions);
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

    return (
        <DashboardLayout>
            <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20'>
                {/* Hero Section */}
                <div className="bg-white border-b border-gray-100">
                    <div className="container mx-auto px-4 md:px-6 py-8">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                                    My Interview Sessions
                                </h1>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        {getFilterStats().filtered} of {getFilterStats().total} sessions
                                    </span>
                                    {getFilterStats().filtered !== getFilterStats().total && (
                                        <span className="text-amber-600 font-medium">
                                            (Filtered view)
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {reviewCount > 0 && (
                                    <Link 
                                        to="/review" 
                                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                    >
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                        Start Review ({reviewCount})
                                    </Link>
                                )}
                                <button
                                    onClick={() => setOpenCreateModal(true)}
                                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    New Session
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="container mx-auto px-4 md:px-6 py-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                        <SessionFilter 
                            onFilterChange={updateFilters} 
                            activeFilters={filters}
                        />
                    </div>
                </div>
                {/* Sessions Grid */}
                <div className="container mx-auto px-4 md:px-6 pb-12">
                    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                        {isLoading ? (
                            <div className="col-span-full flex items-center justify-center py-20">
                                <div className="text-center space-y-4">
                                    <div className="relative">
                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-400 animate-spin" style={{animationDelay: '0.1s', animationDuration: '1.5s'}}></div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-gray-700 font-medium">Loading your sessions...</p>
                                        <p className="text-gray-500 text-sm">This won't take long</p>
                                    </div>
                                </div>
                            </div>
                        ) : filteredSessions.length > 0 ? (
                        filteredSessions.map((data, index) => (
                            <SummaryCard
                                key={data._id}
                                sessionId={data._id}
                                colors={CARD_BG[index % CARD_BG.length]} 
                                role={data.role}
                                topicsToFocus={data.topicsToFocus}
                                experience={data.experience}
                                questions={data.questions.length}
                                description={data.description}
                                lastUpdated={moment(data.updatedAt).format("Do MMM YYYY")}
                                onSelect={() => navigate(`/interview-prep/${data._id}`)}
                                onDelete={() => setOpenDeleteAlert({ open: true, data })}
                                // Enhanced props
                                userRating={data.userRating || { overall: 3, difficulty: 3, usefulness: 3 }}
                                status={data.status || 'Active'}
                                completionPercentage={data.completionPercentage || 0}
                                masteredQuestions={data.masteredQuestions || 0}
                                onRateClick={() => openRatingModal(data)}
                            />
                        ))
                    ) : getFilterStats().total > 0 ? (
                        <div className="col-span-full flex items-center justify-center py-20">
                            <div className="text-center space-y-6 max-w-md">
                                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-xl font-semibold text-gray-800">No matching sessions</h3>
                                    <p className="text-gray-600">We couldn't find any sessions that match your current filters. Try adjusting your search criteria.</p>
                                    <button 
                                        onClick={() => updateFilters({})}
                                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Clear all filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="col-span-full flex items-center justify-center py-20">
                            <div className="text-center space-y-6 max-w-lg">
                                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                                    <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold text-gray-800">Ready to start your interview prep?</h3>
                                    <p className="text-gray-600 text-lg">Create your first interview session and get AI-generated questions tailored to your role and experience level.</p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <button
                                            onClick={() => setOpenCreateModal(true)}
                                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Create Your First Session
                                        </button>
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
