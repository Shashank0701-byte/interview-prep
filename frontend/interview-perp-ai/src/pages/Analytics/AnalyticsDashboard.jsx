// File: frontend/src/pages/Analytics/AnalyticsDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement, // Needed for Doughnut chart
} from 'chart.js';
import toast from "react-hot-toast";

import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

// Enhanced Progress Components
import ProgressRing from '../../components/Progress/ProgressRing';
import ProgressWave from '../../components/Progress/ProgressWave';
import ProgressMilestones from '../../components/Progress/ProgressMilestones';
import ProgressInsights from '../../components/Progress/ProgressInsights';
import EmptyProgressState from '../../components/Progress/EmptyProgressState';

// --- Register all necessary Chart.js components ---
ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler, ArcElement
);

// --- Main Component ---
const AnalyticsDashboard = () => {
    // Auto scroll to top when navigating to this page
    useScrollToTop();
    
    // --- State for all charts ---
    const [progressData, setProgressData] = useState({ labels: [], datasets: [] });
    const [performanceData, setPerformanceData] = useState({ labels: [], datasets: [] });
    const [dailyActivityData, setDailyActivityData] = useState({ labels: [], datasets: [] });
    const [masteryRatioData, setMasteryRatioData] = useState({ labels: [], datasets: [] });
    
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'performance', 'activity', or 'insights'
    const [progressStats, setProgressStats] = useState({
        overallProgress: 0,
        totalSessions: 0,
        completedSessions: 0,
        totalQuestions: 0,
        masteredQuestions: 0,
        averageRating: 0,
        weeklyProgress: 0,
        streakDays: 0
    });

    // --- Data Fetching & Transformation ---
    const fetchAnalyticsData = async () => {
        setIsLoading(true);
        try {
            // Fetch data for all charts and progress stats at the same time
            const [progressRes, performanceRes, activityRes, masteryRes, progressStatsRes, streakRes] = await Promise.all([
                axiosInstance.get(API_PATHS.ANALYTICS.GET_PERFORMANCE_OVER_TIME),
                axiosInstance.get(API_PATHS.ANALYTICS.GET_PERFORMANCE_BY_TOPIC),
                axiosInstance.get(API_PATHS.ANALYTICS.GET_DAILY_ACTIVITY),
                axiosInstance.get(API_PATHS.ANALYTICS.GET_MASTERY_RATIO),
                axiosInstance.get(API_PATHS.ANALYTICS.GET_PROGRESS_STATS),
                axiosInstance.get(API_PATHS.ANALYTICS.GET_STREAK_DATA),
            ]);

            // --- Transform Performance Charts Data ---
            if (progressRes.data?.data && progressRes.data.data.length > 0) {
                const labels = progressRes.data.data.map(d => `Week ${d.week.split('-')[1]}`);
                const data = progressRes.data.data.map(d => d.accuracy);
                setProgressData({
                    labels,
                    datasets: [{ label: 'Content Accuracy', data, borderColor: '#4f46e5', backgroundColor: 'rgba(79, 70, 229, 0.1)', fill: true, tension: 0.4 }],
                });
                
                // Calculate overall progress stats
                const latestAccuracy = data[data.length - 1] || 0;
                const previousAccuracy = data[data.length - 2] || 0;
                const weeklyImprovement = latestAccuracy - previousAccuracy;
                
                setProgressStats(prev => ({
                    ...prev,
                    overallProgress: latestAccuracy,
                    weeklyProgress: weeklyImprovement
                }));
            } else {
                setProgressData({
                    labels: ['This Week'],
                    datasets: [{ label: 'Content Accuracy', data: [0], borderColor: '#4f46e5', backgroundColor: 'rgba(79, 70, 229, 0.1)', fill: true, tension: 0.4 }],
                });
            }
            if (performanceRes.data?.data && performanceRes.data.data.length > 0) {
                const labels = performanceRes.data.data.map(d => d.topic);
                const data = performanceRes.data.data.map(d => d.performance);
                setPerformanceData({
                    labels,
                    datasets: [{ label: 'Performance', data, backgroundColor: '#818cf8', borderColor: '#6366f1', borderWidth: 1 }],
                });
            } else {
                setPerformanceData({
                    labels: ['No Data Yet'],
                    datasets: [{ label: 'Performance', data: [0], backgroundColor: '#818cf8', borderColor: '#6366f1', borderWidth: 1 }],
                });
            }

            // --- Transform Activity Charts Data ---
            if (activityRes.data?.data && activityRes.data.data.length > 0) {
                const labels = activityRes.data.data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                const data = activityRes.data.data.map(d => d.count);
                setDailyActivityData({
                    labels,
                    datasets: [{ label: 'Cards Reviewed', data, backgroundColor: '#34d399', borderColor: '#10b981', borderWidth: 1 }],
                });
            } else {
                // If no data, show empty chart with today's date
                const today = new Date();
                setDailyActivityData({
                    labels: [today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })],
                    datasets: [{ label: 'Cards Reviewed', data: [0], backgroundColor: '#34d399', borderColor: '#10b981', borderWidth: 1 }],
                });
            }
            if (masteryRes.data?.data) {
                const mastered = masteryRes.data.data.mastered || 0;
                const unmastered = masteryRes.data.data.unmastered || 0;
                const total = mastered + unmastered;
                
                setMasteryRatioData({
                    labels: ['Mastered', 'Unmastered'],
                    datasets: [{
                        data: [mastered, unmastered],
                        backgroundColor: ['#60a5fa', '#f87171'],
                        hoverOffset: 4,
                    }],
                });
                
                // Real progress stats from backend
                if (progressStatsRes.data?.data) {
                    const realStats = progressStatsRes.data.data;
                    const streakData = streakRes.data?.data || { streakDays: 0 };
                    
                    setProgressStats({
                        ...realStats,
                        streakDays: streakData.streakDays
                    });
                } else {
                    // Fallback if no progress stats available
                    setProgressStats(prev => ({
                        ...prev,
                        totalQuestions: total,
                        masteredQuestions: mastered
                    }));
                }
            } else {
                setMasteryRatioData({
                    labels: ['Mastered', 'Unmastered'],
                    datasets: [{
                        data: [0, 0],
                        backgroundColor: ['#60a5fa', '#f87171'],
                        hoverOffset: 4,
                    }],
                });
                
                // Set empty progress stats if no data
                if (!progressStatsRes.data?.data) {
                    setProgressStats({
                        overallProgress: 0,
                        totalSessions: 0,
                        completedSessions: 0,
                        totalQuestions: 0,
                        masteredQuestions: 0,
                        averageRating: 0,
                        weeklyProgress: 0,
                        streakDays: 0
                    });
                }
            }

        } catch (error) {
            toast.error("Failed to load analytics data.");
            console.error("Error fetching analytics data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const location = useLocation();
    
    useEffect(() => {
        fetchAnalyticsData();
        
        // Cleanup function to reset state when component unmounts
        return () => {
            setIsLoading(false);
        };
    }, [location.pathname]); // Re-fetch when route changes

    // Expose refresh function for other components
    useEffect(() => {
        // Add event listener for analytics refresh
        const handleAnalyticsRefresh = () => {
            fetchAnalyticsData();
            toast.success("Progress data updated!");
        };

        window.addEventListener('analytics-refresh', handleAnalyticsRefresh);
        
        return () => {
            window.removeEventListener('analytics-refresh', handleAnalyticsRefresh);
        };
    }, []);

    // --- Chart Options ---
    const lineChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, ticks: { callback: (value) => `${value}%` } } } };
    const barChartOptions = { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { callback: (value) => `${value}%` } } } };
    const activityBarOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } };
    const masteryPieOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

    return (
        <DashboardLayout>
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8 px-4 md:px-0">
                    <div className="bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/20 rounded-3xl p-8 border border-blue-100/50 shadow-lg">
                        <div className="flex justify-between items-start">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">My Progress Dashboard</h1>
                                        <p className="text-slate-600 mt-2 text-base sm:text-lg leading-relaxed">Your learning journey, visualized with care and encouragement.</p>
                                    </div>
                                </div>
                                
                                {/* Quick Stats */}
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-emerald-100/50 shadow-sm">
                                        <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full animate-pulse"></div>
                                        <span className="font-medium text-gray-700">
                                            {progressStats.masteredQuestions} questions mastered
                                        </span>
                                    </div>
                                    {progressStats.streakDays > 0 && (
                                        <div className="flex items-center gap-2 bg-amber-50/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-amber-200/50">
                                            <span className="text-lg">🔥</span>
                                            <span className="text-amber-700 font-medium">
                                                {progressStats.streakDays} day streak
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <button 
                                onClick={fetchAnalyticsData}
                                disabled={isLoading}
                                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-3 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                            >
                                <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {isLoading ? 'Updating...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                </header>

                {/* --- Enhanced Tab Navigation --- */}
                <div className="mb-8 px-4 md:px-0">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-2">
                        <nav className="flex space-x-2">
                            {[
                                { id: 'overview', label: 'Overview', icon: '🌟' },
                                { id: 'performance', label: 'Performance', icon: '📊' },
                                { id: 'activity', label: 'Activity', icon: '⚡' },
                                { id: 'insights', label: 'Insights', icon: '💡' }
                            ].map((tab) => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)} 
                                    className={`
                                        flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105
                                        ${activeTab === tab.id 
                                            ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-200/50' 
                                            : 'text-slate-600 hover:text-slate-800 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <span className="text-lg">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-16">
                        <div className="space-y-6">
                            <div className="relative mx-auto w-20 h-20">
                                <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-400 animate-spin" style={{animationDelay: '0.2s', animationDuration: '2s'}}></div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-xl font-semibold text-gray-800">Preparing your progress insights...</p>
                                <p className="text-gray-600">We're gathering your learning data with care</p>
                                <div className="flex items-center justify-center gap-1 mt-4">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* --- Overview Tab Content --- */}
                        {activeTab === 'overview' && (
                            progressStats.totalQuestions === 0 && progressStats.totalSessions === 0 ? (
                                <EmptyProgressState 
                                    type="getting-started"
                                    actionLink="/dashboard"
                                    animated={true}
                                />
                            ) : (
                                <div className="space-y-8">
                                    {/* Progress Rings Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-500">
                                            <ProgressRing 
                                                progress={progressStats.overallProgress} 
                                                color="emerald"
                                                label="Overall Progress"
                                                size={140}
                                            />
                                        </div>
                                        
                                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-500">
                                            <ProgressRing 
                                                progress={progressStats.totalQuestions > 0 ? (progressStats.masteredQuestions / progressStats.totalQuestions) * 100 : 0} 
                                                color="blue"
                                                label="Questions Mastered"
                                                size={140}
                                            />
                                        </div>
                                        
                                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-500">
                                            <ProgressRing 
                                                progress={progressStats.totalSessions > 0 ? (progressStats.completedSessions / progressStats.totalSessions) * 100 : 0} 
                                                color="purple"
                                                label="Sessions Completed"
                                                size={140}
                                            />
                                        </div>
                                    </div>

                                    {/* Progress Wave */}
                                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100/50">
                                        <div className="text-center mb-8">
                                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Learning Journey</h2>
                                            <p className="text-gray-600">Watch your progress flow like a gentle wave</p>
                                        </div>
                                        <div className="flex justify-center">
                                            <ProgressWave 
                                                progress={progressStats.overallProgress} 
                                                width={400} 
                                                height={150}
                                                color="blue"
                                            />
                                        </div>
                                    </div>

                                    {/* Milestones */}
                                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100/50">
                                        <div className="text-center mb-8">
                                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Learning Milestones</h2>
                                            <p className="text-gray-600">Celebrate every step of your progress</p>
                                        </div>
                                        <ProgressMilestones progress={progressStats.overallProgress} />
                                    </div>
                                </div>
                            )
                        )}

                        {/* --- Performance Tab Content --- */}
                        {activeTab === 'performance' && (
                            progressStats.totalQuestions === 0 ? (
                                <EmptyProgressState 
                                    type="no-data"
                                    title="Performance Analytics Coming Soon"
                                    message="Complete some sessions and answer questions to see detailed performance analytics and insights."
                                    actionText="Start Your First Session"
                                    actionLink="/dashboard"
                                    animated={true}
                                />
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-3xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-500">
                                        <div className="flex items-center gap-3 mb-6">
                                            <span className="text-2xl">📊</span>
                                            <h2 className="text-xl font-bold text-slate-900">Performance by Topic</h2>
                                        </div>
                                        <div className="h-96 w-full">
                                            <Bar options={barChartOptions} data={performanceData} />
                                        </div>
                                    </div>
                                     <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-500">
                                        <div className="flex items-center gap-3 mb-6">
                                            <span className="text-2xl">📈</span>
                                            <h2 className="text-xl font-bold text-slate-900">Progress Over Time</h2>
                                        </div>
                                        <div className="h-96 w-full">
                                            <Line options={lineChartOptions} data={progressData} />
                                        </div>
                                    </div>
                                </div>
                            )
                        )}

                        {/* --- Activity Tab Content --- */}
                        {activeTab === 'activity' && (
                            progressStats.totalSessions === 0 ? (
                                <EmptyProgressState 
                                    type="no-sessions"
                                    title="Activity Tracking Awaits"
                                    message="Start practicing with interview sessions to see your daily activity patterns and learning streaks."
                                    actionText="Begin Your Practice"
                                    actionLink="/dashboard"
                                    animated={true}
                                />
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-500">
                                        <div className="flex items-center gap-3 mb-6">
                                            <span className="text-2xl">⚡</span>
                                            <h2 className="text-xl font-bold text-slate-900">Daily Activity</h2>
                                        </div>
                                        <div className="h-80 w-full">
                                            <Bar options={activityBarOptions} data={dailyActivityData} />
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-500">
                                        <div className="flex items-center gap-3 mb-6">
                                            <span className="text-2xl">🎯</span>
                                            <h2 className="text-xl font-bold text-slate-900">Mastery Ratio</h2>
                                        </div>
                                        <div className="h-80 w-full flex items-center justify-center">
                                            <Doughnut options={masteryPieOptions} data={masteryRatioData} />
                                        </div>
                                    </div>
                                </div>
                            )
                        )}

                        {/* --- Insights Tab Content --- */}
                        {activeTab === 'insights' && (
                            <div className="max-w-4xl mx-auto">
                                <ProgressInsights progressData={progressStats} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AnalyticsDashboard;
