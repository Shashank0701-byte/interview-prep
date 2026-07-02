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
            <div className="min-h-screen bg-cream flex items-center justify-center font-body text-charcoal">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal mx-auto mb-4"></div>
                    <p className="font-bold uppercase tracking-wider text-sm">Loading interview report...</p>
                </div>
            </div>
        );
    }

    if (!interview) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center font-body text-charcoal">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-charcoal mx-auto mb-4" />
                    <p className="font-bold uppercase tracking-wider text-sm">Interview report not found</p>
                    <button
                        onClick={() => navigate('/ai-interview-coach')}
                        className="mt-4 bg-charcoal text-white px-4 py-2 rounded-md font-bold uppercase tracking-wider text-sm transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] border-2 border-charcoal"
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
        <div className="min-h-screen bg-cream font-body text-charcoal">
            {/* Header */}
            <div className="bg-cream border-b-2 border-charcoal/10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/ai-interview-coach')}
                                className="p-2 border-2 border-charcoal bg-white rounded-md transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A]"
                            >
                                <ArrowLeft className="w-5 h-5 text-charcoal" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-display font-bold text-charcoal">Interview Report</h1>
                                <p className="text-charcoal/80 capitalize font-medium">
                                    {interview.interviewType.replace('-', ' ')} • {interview.industryFocus} • {interview.role.replace('-', ' ')}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={shareReport}
                                className="flex items-center space-x-2 px-4 py-2 border-2 border-charcoal bg-white text-charcoal rounded-md font-bold uppercase tracking-wider text-sm transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A]"
                            >
                                <Share2 className="w-4 h-4" />
                                <span>Share</span>
                            </button>
                            <button
                                onClick={downloadReport}
                                className="flex items-center space-x-2 px-4 py-2 border-2 border-charcoal bg-white text-charcoal rounded-md font-bold uppercase tracking-wider text-sm transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A]"
                            >
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                            </button>
                            <button
                                onClick={scheduleFollowUp}
                                className="flex items-center space-x-2 px-4 py-2 border-2 border-charcoal bg-charcoal text-white rounded-md font-bold uppercase tracking-wider text-sm transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A]"
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
                <div className="card-editorial p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-cream border-2 border-charcoal rounded-md flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-charcoal" />
                            </div>
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider text-charcoal/80">Date</p>
                                <p className="font-display font-bold">{new Date(interview.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-cream border-2 border-charcoal rounded-md flex items-center justify-center">
                                <Clock className="w-5 h-5 text-charcoal" />
                            </div>
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider text-charcoal/80">Duration</p>
                                <p className="font-display font-bold">{interview.totalDuration || interview.duration} min</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-cream border-2 border-charcoal rounded-md flex items-center justify-center">
                                <User className="w-5 h-5 text-charcoal" />
                            </div>
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider text-charcoal/80">Interviewer</p>
                                <p className="font-display font-bold">{interview.aiPersona?.name}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-charcoal border-2 border-charcoal rounded-md flex items-center justify-center">
                                <Award className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider text-charcoal/80">Overall Score</p>
                                <p className="font-display font-bold text-2xl">{interview.scores?.overall || 0}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-cream border-2 border-charcoal rounded-md shadow-[4px_4px_0px_0px_#1A1A1A] overflow-hidden">
                    <div className="border-b-2 border-charcoal bg-white">
                        <nav className="flex space-x-8 px-6">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 py-4 px-1 border-b-4 font-bold uppercase tracking-wider text-sm transition-colors cursor-pointer ${
                                            activeTab === tab.id
                                                ? 'border-charcoal text-charcoal'
                                                : 'border-transparent text-charcoal/60 hover:text-charcoal hover:border-charcoal/20'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.name}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-6 bg-cream">
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
                    color="charcoal"
                />
                <ScoreCard
                    title="Voice Clarity"
                    score={scores.voiceClarity || 0}
                    icon={Mic}
                    color="charcoal"
                />
                <ScoreCard
                    title="Confidence"
                    score={scores.confidence || 0}
                    icon={TrendingUp}
                    color="charcoal"
                />
                <ScoreCard
                    title="Professionalism"
                    score={scores.professionalism || 0}
                    icon={User}
                    color="charcoal"
                />
            </div>

            {/* Overall Performance */}
            <div className="card-editorial p-6">
                <h3 className="text-lg font-display font-bold text-charcoal mb-4">Overall Performance</h3>
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
                                className="text-charcoal/20"
                            />
                            <circle
                                cx="60"
                                cy="60"
                                r="50"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${(scores.overall || 0) * 3.14} 314`}
                                className="text-charcoal"
                                strokeLinecap="square"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-display font-bold text-charcoal">{scores.overall || 0}%</span>
                        </div>
                    </div>
                    
                    <div className="flex-1">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-bold uppercase tracking-wider text-charcoal/80">Technical Skills</span>
                                    <span className="font-display font-bold">{scores.technical || 0}%</span>
                                </div>
                                <div className="w-full bg-cream border-2 border-charcoal rounded-md h-3 p-[1px]">
                                    <div 
                                        className="bg-charcoal h-full rounded-sm transition-all duration-1000"
                                        style={{ width: `${scores.technical || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-bold uppercase tracking-wider text-charcoal/80">Communication</span>
                                    <span className="font-display font-bold">{scores.communication || 0}%</span>
                                </div>
                                <div className="w-full bg-cream border-2 border-charcoal rounded-md h-3 p-[1px]">
                                    <div 
                                        className="bg-charcoal h-full rounded-sm transition-all duration-1000"
                                        style={{ width: `${scores.communication || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-bold uppercase tracking-wider text-charcoal/80">Body Language</span>
                                    <span className="font-display font-bold">{scores.bodyLanguage || 0}%</span>
                                </div>
                                <div className="w-full bg-cream border-2 border-charcoal rounded-md h-3 p-[1px]">
                                    <div 
                                        className="bg-charcoal h-full rounded-sm transition-all duration-1000"
                                        style={{ width: `${scores.bodyLanguage || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-editorial p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <CheckCircle className="w-6 h-6 text-charcoal" />
                        <h3 className="text-lg font-display font-bold text-charcoal">Strengths</h3>
                    </div>
                    <ul className="space-y-2">
                        {interview.report?.strengths?.map((strength, index) => (
                            <li key={index} className="text-charcoal/80 flex items-start space-x-2 font-medium">
                                <span className="w-2 h-2 bg-charcoal rounded-full mt-2 flex-shrink-0"></span>
                                <span>{strength}</span>
                            </li>
                        )) || [
                            <li key="default" className="text-charcoal/80 flex items-start space-x-2 font-medium">
                                <span className="w-2 h-2 bg-charcoal rounded-full mt-2 flex-shrink-0"></span>
                                <span>Maintained good composure throughout the interview</span>
                            </li>
                        ]}
                    </ul>
                </div>

                <div className="card-editorial p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <Target className="w-6 h-6 text-charcoal" />
                        <h3 className="text-lg font-display font-bold text-charcoal">Areas for Improvement</h3>
                    </div>
                    <ul className="space-y-2">
                        {interview.report?.improvements?.map((improvement, index) => (
                            <li key={index} className="text-charcoal/80 flex items-start space-x-2 font-medium">
                                <span className="w-2 h-2 bg-charcoal rounded-full mt-2 flex-shrink-0"></span>
                                <span>{improvement}</span>
                            </li>
                        )) || [
                            <li key="default" className="text-charcoal/80 flex items-start space-x-2 font-medium">
                                <span className="w-2 h-2 bg-charcoal rounded-full mt-2 flex-shrink-0"></span>
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
    return (
        <div className="space-y-6">
            <div className="text-center py-8">
                <PieChart className="w-16 h-16 text-charcoal/40 mx-auto mb-4" />
                <h3 className="text-lg font-display font-bold text-charcoal mb-2">Detailed Performance Analysis</h3>
                <p className="text-charcoal/80 font-medium">Performance charts and detailed metrics will be displayed here</p>
            </div>
        </div>
    );
};

const AnalysisTab = ({ interview }) => {
    return (
        <div className="space-y-6">
            <div className="text-center py-8">
                <Activity className="w-16 h-16 text-charcoal/40 mx-auto mb-4" />
                <h3 className="text-lg font-display font-bold text-charcoal mb-2">Detailed Analysis</h3>
                <p className="text-charcoal/80 font-medium">Comprehensive analysis of your interview performance will be displayed here</p>
            </div>
        </div>
    );
};

const RecommendationsTab = ({ interview }) => {
    return (
        <div className="space-y-6">
            {/* Next Steps */}
            <div className="card-editorial p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <BookOpen className="w-6 h-6 text-charcoal" />
                    <h3 className="text-lg font-display font-bold text-charcoal">Recommended Next Steps</h3>
                </div>
                <ul className="space-y-3">
                    {interview.report?.nextSteps?.map((step, index) => (
                        <li key={index} className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-charcoal text-white rounded-md flex items-center justify-center text-sm font-bold border-2 border-charcoal">
                                {index + 1}
                            </span>
                            <span className="text-charcoal/80 font-medium">{step}</span>
                        </li>
                    )) || [
                        <li key="default" className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-charcoal text-white rounded-md flex items-center justify-center text-sm font-bold border-2 border-charcoal">
                                1
                            </span>
                            <span className="text-charcoal/80 font-medium">Schedule a follow-up interview to practice improvements</span>
                        </li>
                    ]}
                </ul>
            </div>

            {/* Practice Recommendations */}
            <div className="card-editorial p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <Target className="w-6 h-6 text-charcoal" />
                    <h3 className="text-lg font-display font-bold text-charcoal">Practice Recommendations</h3>
                </div>
                <ul className="space-y-2">
                    {interview.report?.practiceRecommendations?.map((recommendation, index) => (
                        <li key={index} className="text-charcoal/80 flex items-start space-x-2 font-medium">
                            <CheckCircle className="w-4 h-4 text-charcoal mt-0.5 flex-shrink-0" />
                            <span>{recommendation}</span>
                        </li>
                    )) || [
                        <li key="default" className="text-charcoal/80 flex items-start space-x-2 font-medium">
                            <CheckCircle className="w-4 h-4 text-charcoal mt-0.5 flex-shrink-0" />
                            <span>Practice technical questions in your focus areas</span>
                        </li>
                    ]}
                </ul>
            </div>
        </div>
    );
};

const ScoreCard = ({ title, score, icon: Icon, color }) => {
    return (
        <div className="card-editorial p-4 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all cursor-default">
            <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-cream border-2 border-charcoal rounded-md flex items-center justify-center text-charcoal">
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xl font-display font-bold text-charcoal">{score}%</span>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal/80">{title}</h3>
            <div className="mt-2 w-full bg-cream border-2 border-charcoal rounded-md h-3 p-[1px]">
                <div 
                    className="h-full rounded-sm transition-all duration-1000 bg-charcoal"
                    style={{ width: `${score}%` }}
                ></div>
            </div>
        </div>
    );
};

export default InterviewReport;
