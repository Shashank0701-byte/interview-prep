import React, { useState, useEffect } from 'react';
import { 
    LuTrendingUp, 
    LuBrain, 
    LuMessageSquare, 
    LuTarget, 
    LuStar, 
    LuTrendingDown,
    LuInfo,
    LuArrowUp,
    LuArrowDown,
    LuMinus
} from 'react-icons/lu';
import axiosInstance from '../../utils/axiosInstance';

const AIInterviewAnalytics = () => {
    const [insights, setInsights] = useState(null);
    const [communicationAnalysis, setCommunicationAnalysis] = useState(null);
    const [skillGapAnalysis, setSkillGapAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    const fetchAnalyticsData = async () => {
        try {
            setIsLoading(true);
            
            const [insightsRes, communicationRes, skillGapRes] = await Promise.all([
                axiosInstance.get('/api/analytics/ai-interview-insights'),
                axiosInstance.get('/api/analytics/communication-analysis'),
                axiosInstance.get('/api/analytics/skill-gap-analysis?targetRole=software-engineer')
            ]);

            setInsights(insightsRes.data.data);
            setCommunicationAnalysis(communicationRes.data.data);
            setSkillGapAnalysis(skillGapRes.data.data);
        } catch (error) {
            console.error('Error fetching analytics data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getInsightIcon = (type) => {
        switch (type) {
            case 'success': return (
                <div className="w-5 h-5 bg-green-600 dark:bg-green-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                </div>
            );
            case 'warning': return (
                <div className="w-5 h-5 bg-yellow-600 dark:bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                </div>
            );
            case 'improvement': return <LuInfo className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
            default: return <LuInfo className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
        }
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'improving': return <LuArrowUp className="w-4 h-4 text-green-600" />;
            case 'declining': return <LuArrowDown className="w-4 h-4 text-red-600" />;
            case 'stable': return <LuMinus className="w-4 h-4 text-gray-600" />;
            default: return <LuMinus className="w-4 h-4 text-gray-600" />;
        }
    };

    const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = '#6b7280' }) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const strokeDasharray = circumference;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#e5e7eb"
                        strokeWidth={strokeWidth}
                        fill="none"
                        className="dark:stroke-slate-600"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {percentage}%
                    </span>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-600 dark:bg-slate-600 rounded-xl flex items-center justify-center">
                        <LuBrain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Interview Analytics</h2>
                        <p className="text-gray-600 dark:text-gray-400">Advanced insights and actionable recommendations</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                    {[
                        { id: 'overview', label: 'Overview', icon: LuTrendingUp },
                        { id: 'communication', label: 'Communication', icon: LuMessageSquare },
                        { id: 'skills', label: 'Skill Gaps', icon: LuTarget }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                                activeTab === tab.id
                                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && insights && (
                <div className="space-y-6">
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Readiness Score</h3>
                                {getTrendIcon(insights.recentTrend)}
                            </div>
                            <CircularProgress 
                                percentage={insights.readinessScore || 0} 
                                size={80}
                                color="#6b7280"
                            />
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Technical Score</h3>
                                <LuTarget className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {insights.performanceMetrics?.technicalAccuracy || 0}%
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Technical accuracy</p>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Communication</h3>
                                <LuMessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {insights.performanceMetrics?.communicationClarity || 0}%
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Communication clarity</p>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Confidence</h3>
                                <LuStar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {insights.performanceMetrics?.confidenceLevel || 0}%
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Confidence level</p>
                        </div>
                    </div>

                    {/* Actionable Insights */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actionable Insights</h3>
                        <div className="space-y-4">
                            {insights.insights?.map((insight, index) => (
                                <div key={index} className="flex gap-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                    {getInsightIcon(insight.type)}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-gray-900 dark:text-white">{insight.category}</span>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                insight.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                insight.type === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                            }`}>
                                                {insight.type}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 mb-2">{insight.message}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                            Action: {insight.action}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Personalized Recommendations */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personalized Recommendations</h3>
                        <div className="space-y-3">
                            {insights.recommendations?.map((recommendation, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                    <div className="w-6 h-6 bg-gray-600 dark:bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-sm font-bold">{index + 1}</span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300">{recommendation}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Communication Tab */}
            {activeTab === 'communication' && communicationAnalysis && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Communication Score */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Communication Score</h3>
                            <div className="flex items-center justify-center">
                                <CircularProgress 
                                    percentage={communicationAnalysis.communicationScore || 0}
                                    size={120}
                                    color="#6b7280"
                                />
                            </div>
                        </div>

                        {/* Trends */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Communication Trends</h3>
                            <div className="space-y-3">
                                {communicationAnalysis.trends?.map((trend, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                        <LuTrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        <span className="text-gray-700 dark:text-gray-300">{trend}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Strengths and Improvements */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Strengths</h3>
                            <div className="space-y-2">
                                {communicationAnalysis.strengths?.map((strength, index) => (
                                    <div key={index} className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <div className="w-4 h-4 bg-green-600 dark:bg-green-400 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">✓</span>
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Areas for Improvement</h3>
                            <div className="space-y-2">
                                {communicationAnalysis.improvements?.map((improvement, index) => (
                                    <div key={index} className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <LuInfo className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <span className="text-gray-700 dark:text-gray-300">{improvement}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && skillGapAnalysis && (
                <div className="space-y-6">
                    {/* Readiness Level */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Readiness Level</h3>
                        <div className="flex items-center gap-4">
                            <div className={`px-4 py-2 rounded-lg font-medium ${
                                skillGapAnalysis.readinessLevel === 'senior' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                skillGapAnalysis.readinessLevel === 'mid-level' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                skillGapAnalysis.readinessLevel === 'junior' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                                {skillGapAnalysis.readinessLevel.charAt(0).toUpperCase() + skillGapAnalysis.readinessLevel.slice(1)} Level
                            </div>
                        </div>
                    </div>

                    {/* Skill Gaps */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skill Gaps to Address</h3>
                        <div className="space-y-4">
                            {skillGapAnalysis.skillGaps?.map((gap, index) => (
                                <div key={index} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-900 dark:text-white capitalize">{gap.skill}</span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            gap.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        }`}>
                                            {gap.priority} priority
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <span>Current: {gap.currentLevel}%</span>
                                        <span>Target: {gap.targetLevel}%</span>
                                        <div className="flex-1 bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                                            <div 
                                                className="bg-gray-600 dark:bg-slate-400 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${gap.currentLevel}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Strengths and Recommendations */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Strengths</h3>
                            <div className="space-y-2">
                                {skillGapAnalysis.strengths?.map((strength, index) => (
                                    <div key={index} className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <div className="w-4 h-4 bg-green-600 dark:bg-green-400 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">✓</span>
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300 capitalize">{strength}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Action Plan</h3>
                            <div className="space-y-3">
                                {skillGapAnalysis.recommendations?.map((recommendation, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-sm font-bold">{index + 1}</span>
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300">{recommendation}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIInterviewAnalytics;
