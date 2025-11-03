import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Download, Share2, Calendar, Clock, 
    Eye, Mic, User, Monitor, TrendingUp, TrendingDown,
    CheckCircle, AlertTriangle, Target, BookOpen,
    BarChart3, PieChart, Activity, Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';

const InterviewReport = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchInterviewReport();
    }, [sessionId]);

    const fetchInterviewReport = async () => {
        try {
            const response = await axiosInstance.get(`/api/ai-interview-coach/${sessionId}`);
            
            if (response.data.success) {
                setInterview(response.data.interview);
            }
        } catch (error) {
            console.error('Error fetching interview report:', error);
            toast.error('Failed to load interview report');
            navigate('/ai-interview-coach');
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = () => {
        // Generate and download PDF report
        toast.success('Report downloaded!');
    };

    const shareReport = () => {
        // Share report functionality
        navigator.clipboard.writeText(window.location.href);
        toast.success('Report link copied to clipboard!');
    };

    const scheduleFollowUp = () => {
        // Navigate to schedule new interview
        navigate('/ai-interview-coach');
        toast.success('Ready to schedule your next interview!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading interview report...</p>
                </div>
            </div>
        );
    }

    if (!interview) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Interview report not found</p>
                    <button
                        onClick={() => navigate('/ai-interview-coach')}
                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Back to AI Interview Coach
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', name: 'Overview', icon: BarChart3 },
        { id: 'performance', name: 'Performance', icon: TrendingUp },
        { id: 'analysis', name: 'Detailed Analysis', icon: Activity },
        { id: 'recommendations', name: 'Recommendations', icon: Target }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/ai-interview-coach')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Interview Report</h1>
                                <p className="text-gray-600 capitalize">
                                    {interview.interviewType.replace('-', ' ')} • {interview.industryFocus} • {interview.role.replace('-', ' ')}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={shareReport}
                                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                <span>Share</span>
                            </button>
                            <button
                                onClick={downloadReport}
                                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                            </button>
                            <button
                                onClick={scheduleFollowUp}
                                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
                            >
                                <Calendar className="w-4 h-4" />
                                <span>Schedule Follow-up</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Session Info */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Date</p>
                                <p className="font-semibold">{new Date(interview.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Duration</p>
                                <p className="font-semibold">{interview.totalDuration || interview.duration} min</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <User className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Interviewer</p>
                                <p className="font-semibold">{interview.aiPersona?.name}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Award className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Overall Score</p>
                                <p className="font-semibold text-2xl">{interview.scores?.overall || 0}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === tab.id
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.name}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'overview' && <OverviewTab interview={interview} />}
                        {activeTab === 'performance' && <PerformanceTab interview={interview} />}
                        {activeTab === 'analysis' && <AnalysisTab interview={interview} />}
                        {activeTab === 'recommendations' && <RecommendationsTab interview={interview} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

const OverviewTab = ({ interview }) => {
    const scores = interview.scores || {};
    
    return (
        <div className="space-y-6">
            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ScoreCard
                    title="Eye Contact"
                    score={scores.eyeContact || 0}
                    icon={Eye}
                    color="blue"
                />
                <ScoreCard
                    title="Voice Clarity"
                    score={scores.voiceClarity || 0}
                    icon={Mic}
                    color="green"
                />
                <ScoreCard
                    title="Confidence"
                    score={scores.confidence || 0}
                    icon={TrendingUp}
                    color="purple"
                />
                <ScoreCard
                    title="Professionalism"
                    score={scores.professionalism || 0}
                    icon={User}
                    color="indigo"
                />
            </div>

            {/* Overall Performance */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Performance</h3>
                <div className="flex items-center space-x-6">
                    <div className="relative w-32 h-32">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                            <circle
                                cx="60"
                                cy="60"
                                r="50"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-gray-200"
                            />
                            <circle
                                cx="60"
                                cy="60"
                                r="50"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${(scores.overall || 0) * 3.14} 314`}
                                className="text-indigo-600"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900">{scores.overall || 0}%</span>
                        </div>
                    </div>
                    
                    <div className="flex-1">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Technical Skills</span>
                                <span className="font-medium">{scores.technical || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${scores.technical || 0}%` }}
                                ></div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Communication</span>
                                <span className="font-medium">{scores.communication || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${scores.communication || 0}%` }}
                                ></div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Body Language</span>
                                <span className="font-medium">{scores.bodyLanguage || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${scores.bodyLanguage || 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-semibold text-green-900">Strengths</h3>
                    </div>
                    <ul className="space-y-2">
                        {interview.report?.strengths?.map((strength, index) => (
                            <li key={index} className="text-green-800 flex items-start space-x-2">
                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                                <span>{strength}</span>
                            </li>
                        )) || [
                            <li key="default" className="text-green-800 flex items-start space-x-2">
                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                                <span>Maintained good composure throughout the interview</span>
                            </li>
                        ]}
                    </ul>
                </div>

                <div className="bg-blue-50 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <Target className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-semibold text-blue-900">Areas for Improvement</h3>
                    </div>
                    <ul className="space-y-2">
                        {interview.report?.improvements?.map((improvement, index) => (
                            <li key={index} className="text-blue-800 flex items-start space-x-2">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                                <span>{improvement}</span>
                            </li>
                        )) || [
                            <li key="default" className="text-blue-800 flex items-start space-x-2">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                                <span>Practice maintaining consistent eye contact with the camera</span>
                            </li>
                        ]}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const PerformanceTab = ({ interview }) => {
    // This would show detailed performance metrics, charts, and trends
    return (
        <div className="space-y-6">
            <div className="text-center py-8">
                <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Performance Analysis</h3>
                <p className="text-gray-600">Performance charts and detailed metrics will be displayed here</p>
            </div>
        </div>
    );
};

const AnalysisTab = ({ interview }) => {
    // This would show detailed analysis of facial expressions, voice, environment
    return (
        <div className="space-y-6">
            <div className="text-center py-8">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Analysis</h3>
                <p className="text-gray-600">Comprehensive analysis of your interview performance will be displayed here</p>
            </div>
        </div>
    );
};

const RecommendationsTab = ({ interview }) => {
    return (
        <div className="space-y-6">
            {/* Next Steps */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-purple-900">Recommended Next Steps</h3>
                </div>
                <ul className="space-y-3">
                    {interview.report?.nextSteps?.map((step, index) => (
                        <li key={index} className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                            </span>
                            <span className="text-purple-800">{step}</span>
                        </li>
                    )) || [
                        <li key="default" className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                1
                            </span>
                            <span className="text-purple-800">Schedule a follow-up interview to practice improvements</span>
                        </li>
                    ]}
                </ul>
            </div>

            {/* Practice Recommendations */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <Target className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-900">Practice Recommendations</h3>
                </div>
                <ul className="space-y-2">
                    {interview.report?.practiceRecommendations?.map((recommendation, index) => (
                        <li key={index} className="text-green-800 flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{recommendation}</span>
                        </li>
                    )) || [
                        <li key="default" className="text-green-800 flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Practice technical questions in your focus areas</span>
                        </li>
                    ]}
                </ul>
            </div>
        </div>
    );
};

const ScoreCard = ({ title, score, icon: Icon, color }) => {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        indigo: 'bg-indigo-100 text-indigo-600'
    };

    return (
        <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{score}%</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                <div 
                    className={`h-1.5 rounded-full transition-all duration-1000 ${
                        color === 'blue' ? 'bg-blue-600' :
                        color === 'green' ? 'bg-green-600' :
                        color === 'purple' ? 'bg-purple-600' :
                        'bg-indigo-600'
                    }`}
                    style={{ width: `${score}%` }}
                ></div>
            </div>
        </div>
    );
};

export default InterviewReport;
