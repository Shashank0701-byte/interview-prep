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
  ArcElement,
} from 'chart.js';
import toast from "react-hot-toast";
// import { ChartNoDataIllustration } from "../../components/ui/ChartNoDataIllustration"; // you'll create a small SVG/emoji comp here
import { ChartNoDataIllustration } from '../../components/ui/ChartNoDataIlustration';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler, ArcElement
);

const AnalyticsDashboard = () => {
  const [progressData, setProgressData] = useState({ labels: [], datasets: [] });
  const [performanceData, setPerformanceData] = useState({ labels: [], datasets: [] });
  const [dailyActivityData, setDailyActivityData] = useState({ labels: [], datasets: [] });
  const [masteryRatioData, setMasteryRatioData] = useState({ labels: [], datasets: [] });
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('performance');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        const [progressRes, performanceRes, activityRes, masteryRes] = await Promise.all([
          axiosInstance.get(API_PATHS.ANALYTICS.GET_PERFORMANCE_OVER_TIME),
          axiosInstance.get(API_PATHS.ANALYTICS.GET_PERFORMANCE_BY_TOPIC),
          axiosInstance.get(API_PATHS.ANALYTICS.GET_DAILY_ACTIVITY),
          axiosInstance.get(API_PATHS.ANALYTICS.GET_MASTERY_RATIO),
        ]);

        if (progressRes.data?.data?.length) {
          const labels = progressRes.data.data.map(d => `Week ${d.week.split('-')[1]}`);
          const data = progressRes.data.data.map(d => d.accuracy);
          setProgressData({
            labels,
            datasets: [{
              label: 'Content Accuracy',
              data,
              borderColor: '#4f46e5',
              backgroundColor: 'rgba(79, 70, 229, 0.15)',
              fill: true,
              tension: 0.4
            }],
          });
        }

        if (performanceRes.data?.data?.length) {
          const labels = performanceRes.data.data.map(d => d.topic);
          const data = performanceRes.data.data.map(d => d.performance);
          setPerformanceData({
            labels,
            datasets: [{
              label: 'Performance',
              data,
              backgroundColor: 'linear-gradient(90deg, #60a5fa, #9333ea)',
              borderColor: '#6366f1',
              borderWidth: 1
            }],
          });
        }

        if (activityRes.data?.data?.length) {
          const labels = activityRes.data.data.map(d =>
            new Date(d._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          );
          const data = activityRes.data.data.map(d => d.count);
          setDailyActivityData({
            labels,
            datasets: [{
              label: 'Cards Reviewed',
              data,
              backgroundColor: '#34d399',
              borderColor: '#10b981',
              borderWidth: 1
            }],
          });
        }

        if (masteryRes.data?.data) {
          setMasteryRatioData({
            labels: ['Mastered', 'Unmastered'],
            datasets: [{
              data: [masteryRes.data.data.mastered, masteryRes.data.data.unmastered],
              backgroundColor: ['#60a5fa', '#f87171'],
              hoverOffset: 4,
            }],
          });
        }

      } catch (error) {
        toast.error("Failed to load analytics data.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  const lineChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, ticks: { callback: (value) => `${value}%` } } } };
  const barChartOptions = { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { callback: (value) => `${value}%` } } } };
  const activityBarOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } };
  const masteryPieOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        
        <header className="mb-8 px-4 md:px-0">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            My Progress Dashboard
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Visualizing your learning journey and key performance trends.
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="mb-6 px-4 md:px-0 border-b border-slate-200">
          <nav className="-mb-px flex space-x-6">
            {['performance', 'activity'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600 scale-105'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab === 'performance' ? 'Performance' : 'Activity'}
              </button>
            ))}
          </nav>
        </div>

        {isLoading ? (
          <div className="text-center py-10 animate-pulse">
            <p className="text-slate-400">Loading your analytics...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'performance' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Performance by Topic</h2>
                  <div className="h-96 w-full flex items-center justify-center">
                    {performanceData.labels.length ? (
                      <Bar options={barChartOptions} data={performanceData} />
                    ) : (
                      <ChartNoDataIllustration text="No topic data available" />
                    )}
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Progress Over Time</h2>
                  <div className="h-96 w-full flex items-center justify-center">
                    {progressData.labels.length ? (
                      <Line options={lineChartOptions} data={progressData} />
                    ) : (
                      <ChartNoDataIllustration text="No progress data yet" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Cards Reviewed Per Day</h2>
                  <div className="h-80 w-full flex items-center justify-center">
                    {dailyActivityData.labels.length ? (
                      <Bar options={activityBarOptions} data={dailyActivityData} />
                    ) : (
                      <ChartNoDataIllustration text="No activity yet" />
                    )}
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Mastery Ratio</h2>
                  <div className="h-80 w-full flex items-center justify-center">
                    {masteryRatioData.labels.length ? (
                      <Doughnut options={masteryPieOptions} data={masteryRatioData} />
                    ) : (
                      <ChartNoDataIllustration text="No mastery data yet" />
                    )}
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
