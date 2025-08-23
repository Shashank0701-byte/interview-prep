// File: frontend/src/pages/Analytics/AnalyticsDashboard.jsx

import React, { useState, useEffect } from 'react';
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

// --- Register all necessary Chart.js components ---
ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler, ArcElement
);

// --- Main Component ---
const AnalyticsDashboard = () => {
    // --- State for all charts ---
    const [progressData, setProgressData] = useState({ labels: [], datasets: [] });
    const [performanceData, setPerformanceData] = useState({ labels: [], datasets: [] });
    const [dailyActivityData, setDailyActivityData] = useState({ labels: [], datasets: [] });
    const [masteryRatioData, setMasteryRatioData] = useState({ labels: [], datasets: [] });
    
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('performance'); // 'performance' or 'activity'

    // --- Data Fetching & Transformation ---
    const fetchAnalyticsData = async () => {
        setIsLoading(true);
        try {
            // Fetch data for all four charts at the same time
            const [progressRes, performanceRes, activityRes, masteryRes] = await Promise.all([
                axiosInstance.get(API_PATHS.ANALYTICS.GET_PERFORMANCE_OVER_TIME),
                axiosInstance.get(API_PATHS.ANALYTICS.GET_PERFORMANCE_BY_TOPIC),
                axiosInstance.get(API_PATHS.ANALYTICS.GET_DAILY_ACTIVITY),
                axiosInstance.get(API_PATHS.ANALYTICS.GET_MASTERY_RATIO),
            ]);

            // --- Transform Performance Charts Data ---
            if (progressRes.data?.data && progressRes.data.data.length > 0) {
                const labels = progressRes.data.data.map(d => `Week ${d.week.split('-')[1]}`);
                const data = progressRes.data.data.map(d => d.accuracy);
                setProgressData({
                    labels,
                    datasets: [{ label: 'Content Accuracy', data, borderColor: '#4f46e5', backgroundColor: 'rgba(79, 70, 229, 0.1)', fill: true, tension: 0.4 }],
                });
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
                setMasteryRatioData({
                    labels: ['Mastered', 'Unmastered'],
                    datasets: [{
                        data: [masteryRes.data.data.mastered || 0, masteryRes.data.data.unmastered || 0],
                        backgroundColor: ['#60a5fa', '#f87171'],
                        hoverOffset: 4,
                    }],
                });
            } else {
                setMasteryRatioData({
                    labels: ['Mastered', 'Unmastered'],
                    datasets: [{
                        data: [0, 0],
                        backgroundColor: ['#60a5fa', '#f87171'],
                        hoverOffset: 4,
                    }],
                });
            }

        } catch (error) {
            toast.error("Failed to load analytics data.");
            console.error("Error fetching analytics data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalyticsData();
    }, []);

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
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">My Progress Dashboard</h1>
                            <p className="text-slate-500 mt-2 text-base sm:text-lg">Visualizing your learning journey and key performance trends.</p>
                        </div>
                        <button 
                            onClick={fetchAnalyticsData}
                            disabled={isLoading}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </header>

                {/* --- Main Tab Navigation --- */}
                <div className="mb-6 px-4 md:px-0 border-b border-slate-200">
                    <nav className="-mb-px flex space-x-6">
                        <button onClick={() => setActiveTab('performance')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'performance' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Performance</button>
                        <button onClick={() => setActiveTab('activity')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'activity' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Activity</button>
                    </nav>
                </div>

                {isLoading ? (
                    <div className="text-center py-10"><p className="text-slate-500">Loading your analytics...</p></div>
                ) : (
                    <div>
                        {/* --- Performance Tab Content --- */}
                        {activeTab === 'performance' && (
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-lg shadow-slate-200/50">
                                    <h2 className="text-xl font-bold text-slate-900 mb-4">Performance by Topic</h2>
                                    <div className="h-96 w-full">
                                        <Bar options={barChartOptions} data={performanceData} />
                                    </div>
                                </div>
                                 <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg shadow-slate-200/50">
                                    <h2 className="text-xl font-bold text-slate-900 mb-4">Progress Over Time</h2>
                                    <div className="h-96 w-full">
                                        <Line options={lineChartOptions} data={progressData} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- Activity Tab Content --- */}
                        {activeTab === 'activity' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg shadow-slate-200/50">
                                    <h2 className="text-xl font-bold text-slate-900 mb-4">Cards Reviewed Per Day</h2>
                                    <div className="h-80 w-full">
                                        <Bar options={activityBarOptions} data={dailyActivityData} />
                                    </div>
                                </div>
                                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg shadow-slate-200/50">
                                    <h2 className="text-xl font-bold text-slate-900 mb-4">Mastery Ratio</h2>
                                    <div className="h-80 w-full flex items-center justify-center">
                                        <Doughnut options={masteryPieOptions} data={masteryRatioData} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AnalyticsDashboard;
