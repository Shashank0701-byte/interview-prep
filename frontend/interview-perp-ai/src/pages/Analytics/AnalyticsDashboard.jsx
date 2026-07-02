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
                    datasets: [{ label: 'Content Accuracy', data, borderColor: '#1A1A1A', backgroundColor: 'rgba(26, 26, 26, 0.1)', fill: true, tension: 0.4 }],
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
                    datasets: [{ label: 'Content Accuracy', data: [0], borderColor: '#1A1A1A', backgroundColor: 'rgba(26, 26, 26, 0.1)', fill: true, tension: 0.4 }],
                });
            }
            if (performanceRes.data?.data && performanceRes.data.data.length > 0) {
                const labels = performanceRes.data.data.map(d => d.topic);
                const data = performanceRes.data.data.map(d => d.performance);
                setPerformanceData({
                    labels,
                    datasets: [{ label: 'Performance', data, backgroundColor: '#1A1A1A', borderColor: '#1A1A1A', borderWidth: 1 }],
                });
            } else {
                setPerformanceData({
                    labels: ['No Data Yet'],
                    datasets: [{ label: 'Performance', data: [0], backgroundColor: '#1A1A1A', borderColor: '#1A1A1A', borderWidth: 1 }],
                });
            }

            // --- Transform Activity Charts Data ---
            if (activityRes.data?.data && activityRes.data.data.length > 0) {
                const labels = activityRes.data.data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                const data = activityRes.data.data.map(d => d.count);
                setDailyActivityData({
                    labels,
                    datasets: [{ label: 'Cards Reviewed', data, backgroundColor: '#1A1A1A', borderColor: '#1A1A1A', borderWidth: 1 }],
                });
            } else {
                // If no data, show empty chart with today's date
                const today = new Date();
                setDailyActivityData({
                    labels: [today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })],
                    datasets: [{ label: 'Cards Reviewed', data: [0], backgroundColor: '#1A1A1A', borderColor: '#1A1A1A', borderWidth: 1 }],
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
                        backgroundColor: ['#1A1A1A', '#DC2626'],
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
                        backgroundColor: ['#1A1A1A', '#DC2626'],
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
                    <div className="card-editorial p-8 bg-white dark:bg-navy-light">
                        <div className="flex justify-between items-start">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-charcoal dark:bg-cream text-white dark:text-navy rounded-md flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white dark:text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-3xl sm:text-4xl font-display text-charcoal dark:text-cream">My Progress Dashboard</h1>
                                        <p className="text-charcoal/80 dark:text-cream/80 mt-2 text-base sm:text-lg leading-relaxed">Your learning journey, visualized with care and encouragement.</p>
                                    </div>
                                </div>
                                
                                {/* Quick Stats */}
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-3 bg-white dark:bg-navy-input px-4 py-2.5 rounded-md border-2 border-charcoal/20 dark:border-cream/20">
                                        <div className="w-3 h-3 bg-charcoal dark:bg-cream rounded-full animate-pulse"></div>
                                        <span className="font-bold text-charcoal dark:text-cream uppercase tracking-wider text-xs">
                                            {progressStats.masteredQuestions} questions mastered
                                        </span>
                                    </div>
                                    {progressStats.streakDays > 0 && (
                                        <div className="flex items-center gap-2 bg-white dark:bg-navy-input px-4 py-2.5 rounded-md border-2 border-charcoal/20 dark:border-cream/20">
                                            <span className="text-lg">🔥</span>
                                            <span className="font-bold text-charcoal dark:text-cream uppercase tracking-wider text-xs">
                                                {progressStats.streakDays} day streak
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <button 
                                onClick={fetchAnalyticsData}
                                disabled={isLoading}
                                className="btn-small w-auto"
                            >
                                <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {isLoading ? 'Updating...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                </header>

                <div className="mb-8 px-4 md:px-0">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'overview', label: 'Overview', icon: '🌟' },
                            { id: 'performance', label: 'Performance', icon: '📊' },
                            { id: 'activity', label: 'Activity', icon: '⚡' },
                            { id: 'insights', label: 'Insights', icon: '💡' }
                        ].map((tab) => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)} 
                                className={activeTab === tab.id ? 'chip-active' : 'chip-inactive'}
                            >
                                <span className="text-lg mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-16">
                        <div className="space-y-6">
                            <div className="relative mx-auto w-16 h-16">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-charcoal/20 dark:border-cream/20 border-t-charcoal dark:border-t-cream"></div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-xl font-display font-semibold text-charcoal dark:text-cream">Loading analytics...</p>
                                <p className="text-charcoal/80 dark:text-cream/80 font-body">Gathering your progress data</p>
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="card-editorial p-6 flex items-center justify-center">
                                            <ProgressRing 
                                                progress={progressStats.overallProgress} 
                                                color="gray"
                                                label="Overall Progress"
                                                size={120}
                                            />
                                        </div>
                                        
                                        <div className="card-editorial p-6 flex items-center justify-center">
                                            <ProgressRing 
                                                progress={progressStats.totalQuestions > 0 ? (progressStats.masteredQuestions / progressStats.totalQuestions) * 100 : 0} 
                                                color="gray"
                                                label="Questions Mastered"
                                                size={120}
                                            />
                                        </div>
                                        
                                        <div className="card-editorial p-6 flex items-center justify-center">
                                            <ProgressRing 
                                                progress={progressStats.totalSessions > 0 ? (progressStats.completedSessions / progressStats.totalSessions) * 100 : 0} 
                                                color="gray"
                                                label="Sessions Completed"
                                                size={120}
                                            />
                                        </div>
                                    </div>

                                    {/* Progress Wave */}
                                    <div className="card-editorial p-8 relative z-10">
                                        <div className="text-center mb-8 border-b-2 border-charcoal/20 dark:border-cream/20 pb-4">
                                            <h2 className="text-3xl font-display text-charcoal dark:text-cream mb-2">Learning Progress</h2>
                                            <p className="text-charcoal/80 dark:text-cream/80">Your overall progress overview</p>
                                        </div>
                                        <div className="flex justify-center relative z-0">
                                            <ProgressWave 
                                                progress={progressStats.overallProgress} 
                                                width={400} 
                                                height={150}
                                                color="gray"
                                            />
                                        </div>
                                    </div>

                                    {/* Milestones */}
                                    <div className="card-editorial p-8">
                                        <div className="text-center mb-8 border-b-2 border-charcoal/20 dark:border-cream/20 pb-4">
                                            <h2 className="text-3xl font-display text-charcoal dark:text-cream mb-2">Learning Milestones</h2>
                                            <p className="text-charcoal/80 dark:text-cream/80">Track your progress milestones</p>
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
                                    <div className="lg:col-span-2 card-editorial p-6">
                                        <div className="flex items-center gap-3 mb-6 border-b-2 border-charcoal/20 dark:border-cream/20 pb-4">
                                            <span className="text-2xl">📊</span>
                                            <h2 className="text-2xl font-display text-charcoal dark:text-cream">Performance by Topic</h2>
                                        </div>
                                        <div className="h-96 w-full">
                                            <Bar options={barChartOptions} data={performanceData} />
                                        </div>
                                    </div>
                                     <div className="card-editorial p-6">
                                        <div className="flex items-center gap-3 mb-6 border-b-2 border-charcoal/20 dark:border-cream/20 pb-4">
                                            <span className="text-2xl">📈</span>
                                            <h2 className="text-2xl font-display text-charcoal dark:text-cream">Progress Over Time</h2>
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
                                    <div className="card-editorial p-6">
                                        <div className="flex items-center gap-3 mb-6 border-b-2 border-charcoal/20 dark:border-cream/20 pb-4">
                                            <span className="text-2xl">⚡</span>
                                            <h2 className="text-2xl font-display text-charcoal dark:text-cream">Daily Activity</h2>
                                        </div>
                                        <div className="h-80 w-full">
                                            <Bar options={activityBarOptions} data={dailyActivityData} />
                                        </div>
                                    </div>
                                    <div className="card-editorial p-6">
                                        <div className="flex items-center gap-3 mb-6 border-b-2 border-charcoal/20 dark:border-cream/20 pb-4">
                                            <span className="text-2xl">🎯</span>
                                            <h2 className="text-2xl font-display text-charcoal dark:text-cream">Mastery Ratio</h2>
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
