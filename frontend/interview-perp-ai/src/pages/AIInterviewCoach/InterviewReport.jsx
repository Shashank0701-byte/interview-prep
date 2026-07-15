import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Download, Share2, Calendar, Clock, 
    Eye, Mic, User, TrendingUp, TrendingDown,
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
        toast.success('Report download simulated!');
    };

    const shareReport = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Report link copied to clipboard!');
    };

    const scheduleFollowUp = () => {
        navigate('/ai-interview-coach');
        toast.success('Initiating next session setup!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-cream dark:bg-navy flex items-center justify-center font-body text-charcoal dark:text-cream">
                <div className="text-center font-mono">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal dark:border-cream mx-auto mb-4"></div>
                    <p className="font-bold uppercase tracking-wider text-xs">Analyzing and compiling report...</p>
                </div>
            </div>
        );
    }

    if (!interview) {
        return (
            <div className="min-h-screen bg-cream dark:bg-navy flex items-center justify-center font-body text-charcoal dark:text-cream">
                <div className="text-center font-mono max-w-md p-6 bg-white dark:bg-navy-light border-3 border-charcoal dark:border-cream/40 rounded-sm shadow-[4px_4px_0px_0px_var(--color-shadow)]">
                    <AlertTriangle className="w-12 h-12 text-charcoal dark:text-cream mx-auto mb-4" />
                    <p className="font-bold uppercase tracking-wider text-xs">Interview session report not found</p>
                    <button
                        onClick={() => navigate('/ai-interview-coach')}
                        className="mt-6 w-full bg-charcoal text-white dark:bg-cream dark:text-navy px-4 py-2.5 rounded-sm font-bold uppercase tracking-wider text-xs transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none border-2 border-charcoal"
                    >
                        Back to Interview Coach
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', name: 'Overview', icon: BarChart3 },
        { id: 'performance', name: 'Performance', icon: TrendingUp },
        { id: 'analysis', name: 'Analysis Log', icon: Activity },
        { id: 'recommendations', name: 'Next Steps', icon: Target }
    ];

    return (
        <div className="min-h-screen bg-cream dark:bg-navy font-body text-charcoal dark:text-cream p-6 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-white dark:bg-navy-light border-4 border-charcoal dark:border-cream/40 rounded-sm p-6 mb-6 shadow-[4px_4px_0px_0px_var(--color-shadow)] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/ai-interview-coach')}
                            className="w-10 h-10 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy text-charcoal dark:text-cream rounded-sm flex items-center justify-center shadow-[2px_2px_0px_0px_var(--color-shadow)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                        >
                            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide">Interview Report</h1>
                            <p className="text-[10px] font-mono font-bold text-charcoal/60 dark:text-cream/60 capitalize tracking-widest mt-1">
                                {interview.interviewType.replace('-', ' ')} • {interview.industryFocus} Focus • {interview.role.replace('-', ' ')}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={shareReport}
                            className="flex items-center space-x-2 px-4 py-2 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy text-charcoal dark:text-cream rounded-sm font-mono font-bold uppercase tracking-wider text-xs transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]"
                        >
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                        </button>
                        <button
                            onClick={downloadReport}
                            className="flex items-center space-x-2 px-4 py-2 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy text-charcoal dark:text-cream rounded-sm font-mono font-bold uppercase tracking-wider text-xs transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                        </button>
                        <button
                            onClick={scheduleFollowUp}
                            className="flex items-center space-x-2 px-4 py-2 border-2 border-charcoal dark:border-cream bg-charcoal text-white dark:bg-cream dark:text-navy rounded-sm font-mono font-bold uppercase tracking-wider text-xs transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0px_0px_var(--color-shadow)]"
                        >
                            <Calendar className="w-4 h-4" />
                            <span>Schedule Follow-up</span>
                        </button>
                    </div>
                </div>

                {/* Session Info Grid */}
                <div className="card-editorial p-6 mb-6 bg-white dark:bg-navy-light">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Date Conducted', value: new Date(interview.createdAt).toLocaleDateString(), icon: Calendar },
                            { label: 'Session Duration', value: `${interview.totalDuration || interview.duration || 0} min`, icon: Clock },
                            { label: 'Conducting AI', value: interview.aiPersona?.name || 'Assigned AI', icon: User },
                            { label: 'Overall Score', value: `${interview.scores?.overall || 0}%`, icon: Award, highlight: true }
                        ].map((info, idx) => {
                            const IconComp = info.icon;
                            return (
                                <div key={idx} className="flex items-center space-x-4 border-r last:border-r-0 border-dashed border-charcoal/10 dark:border-cream/10 pr-4 last:pr-0">
                                    <div className={`w-10 h-10 border-2 rounded-sm flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)] ${
                                        info.highlight 
                                            ? 'bg-charcoal text-white dark:bg-cream dark:text-navy border-charcoal' 
                                            : 'bg-cream dark:bg-navy text-charcoal dark:text-cream border-charcoal/30 dark:border-cream/20'
                                    }`}>
                                        <IconComp className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-charcoal/50 dark:text-cream/50">{info.label}</p>
                                        <p className="font-display font-bold text-sm text-charcoal dark:text-cream mt-0.5">{info.value}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tabs Panel */}
                <div className="bg-white dark:bg-navy-light border-4 border-charcoal dark:border-cream/40 rounded-sm shadow-[4px_4px_0px_0px_var(--color-shadow)] overflow-hidden">
                    <div className="border-b-4 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy">
                        <nav className="flex flex-wrap">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 py-4 px-6 border-r-2 border-charcoal dark:border-cream/20 font-mono font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer ${
                                            activeTab === tab.id
                                                ? 'bg-white text-charcoal dark:bg-navy-light dark:text-cream'
                                                : 'text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.name}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-6 bg-cream dark:bg-navy">
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
            {/* Score Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ScoreCard title="Eye Contact" score={scores.eyeContact || 0} icon={Eye} />
                <ScoreCard title="Voice Clarity" score={scores.voiceClarity || 0} icon={Mic} />
                <ScoreCard title="Confidence" score={scores.confidence || 0} icon={TrendingUp} />
                <ScoreCard title="Professionalism" score={scores.professionalism || 0} icon={User} />
            </div>

            {/* Overall Performance */}
            <div className="card-editorial p-6 bg-white dark:bg-navy-light">
                <h3 className="text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest mb-4 border-b border-dashed border-charcoal/10 pb-2">Overall Assessment</h3>
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative w-32 h-32 flex-shrink-0">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                            <circle
                                cx="60"
                                cy="60"
                                r="50"
                                stroke="currentColor"
                                strokeWidth="10"
                                fill="none"
                                className="text-charcoal/10 dark:text-cream/10"
                            />
                            <circle
                                cx="60"
                                cy="60"
                                r="50"
                                stroke="currentColor"
                                strokeWidth="10"
                                fill="none"
                                strokeDasharray={`${(scores.overall || 0) * 3.14} 314`}
                                className="text-charcoal dark:text-cream"
                                strokeLinecap="square"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-display font-bold text-charcoal dark:text-cream">{scores.overall || 0}%</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 w-full space-y-4">
                        {[
                            { name: 'Technical Skills', val: scores.technical || 0 },
                            { name: 'Communication Style', val: scores.communication || 0 },
                            { name: 'Body Language', val: scores.bodyLanguage || 0 }
                        ].map((sc, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-center mb-1 text-xs font-mono font-bold">
                                    <span className="text-charcoal/80 dark:text-cream/80 uppercase tracking-wider">{sc.name}</span>
                                    <span>{sc.val}%</span>
                                </div>
                                <div className="w-full bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm h-3.5 p-[1px]">
                                    <div 
                                        className="bg-charcoal dark:bg-cream h-full rounded-none transition-all duration-1000"
                                        style={{ width: `${sc.val}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-editorial p-6 bg-white dark:bg-navy-light">
                    <div className="flex items-center space-x-2.5 mb-4 border-b border-dashed border-charcoal/10 pb-3">
                        <CheckCircle className="w-5 h-5 text-charcoal dark:text-cream" strokeWidth={2.5} />
                        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-charcoal dark:text-cream">Strengths</h3>
                    </div>
                    <ul className="space-y-3 font-body text-xs font-bold leading-relaxed text-charcoal/80 dark:text-cream/80">
                        {interview.report?.strengths?.map((str, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                                <span className="w-2 h-2 bg-charcoal dark:bg-cream rounded-none mt-1.5 flex-shrink-0"></span>
                                <span>{str}</span>
                            </li>
                        )) || (
                            <li className="flex items-start space-x-2">
                                <span className="w-2 h-2 bg-charcoal dark:bg-cream rounded-none mt-1.5 flex-shrink-0"></span>
                                <span>Pacing metrics were optimal and structure criteria were validated.</span>
                            </li>
                        )}
                    </ul>
                </div>

                <div className="card-editorial p-6 bg-white dark:bg-navy-light">
                    <div className="flex items-center space-x-2.5 mb-4 border-b border-dashed border-charcoal/10 pb-3">
                        <Target className="w-5 h-5 text-charcoal dark:text-cream" strokeWidth={2.5} />
                        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-charcoal dark:text-cream">Areas to Refine</h3>
                    </div>
                    <ul className="space-y-3 font-body text-xs font-bold leading-relaxed text-charcoal/80 dark:text-cream/80">
                        {interview.report?.improvements?.map((imp, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                                <span className="w-2 h-2 bg-charcoal dark:bg-cream rounded-none mt-1.5 flex-shrink-0"></span>
                                <span>{imp}</span>
                            </li>
                        )) || (
                            <li className="flex items-start space-x-2">
                                <span className="w-2 h-2 bg-charcoal dark:bg-cream rounded-none mt-1.5 flex-shrink-0"></span>
                                <span>Work on reducing fillers and aligning camera eye contact vectors.</span>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const PerformanceTab = ({ interview }) => {
    return (
        <div className="card-editorial p-8 bg-white dark:bg-navy-light text-center flex flex-col items-center">
            <PieChart className="w-12 h-12 text-charcoal/40 dark:text-cream/40 mb-4" strokeWidth={2} />
            <h3 className="text-xs font-mono font-bold text-charcoal dark:text-cream uppercase tracking-widest mb-1">Detailed Charts</h3>
            <p className="text-[10px] font-mono text-charcoal/60 dark:text-cream/60 uppercase tracking-wider leading-relaxed">
                Comparative logs and timeline score metrics will populate here upon completing standard evaluation sets.
            </p>
        </div>
    );
};

const AnalysisTab = ({ interview }) => {
    return (
        <div className="card-editorial p-8 bg-white dark:bg-navy-light text-center flex flex-col items-center">
            <Activity className="w-12 h-12 text-charcoal/40 dark:text-cream/40 mb-4" strokeWidth={2} />
            <h3 className="text-xs font-mono font-bold text-charcoal dark:text-cream uppercase tracking-widest mb-1">AI Diagnostics Timeline</h3>
            <p className="text-[10px] font-mono text-charcoal/60 dark:text-cream/60 uppercase tracking-wider leading-relaxed">
                Raw capture markers and noise suppression profiles are archived for structural reviews.
            </p>
        </div>
    );
};

const RecommendationsTab = ({ interview }) => {
    return (
        <div className="space-y-6">
            {/* Recommended Next Steps */}
            <div className="card-editorial p-6 bg-white dark:bg-navy-light">
                <div className="flex items-center space-x-2.5 mb-4 border-b border-dashed border-charcoal/10 pb-3">
                    <BookOpen className="w-5 h-5 text-charcoal dark:text-cream" strokeWidth={2.5} />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-charcoal dark:text-cream">Recommended Next Steps</h3>
                </div>
                <ul className="space-y-3 font-body text-xs font-bold leading-relaxed text-charcoal/80 dark:text-cream/80">
                    {interview.report?.nextSteps?.map((st, idx) => (
                        <li key={idx} className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-charcoal text-white dark:bg-cream dark:text-navy rounded-sm flex items-center justify-center text-xs font-mono font-bold border-2 border-charcoal">
                                {idx + 1}
                            </span>
                            <span className="mt-0.5">{st}</span>
                        </li>
                    )) || (
                        <li className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-charcoal text-white dark:bg-cream dark:text-navy rounded-sm flex items-center justify-center text-xs font-mono font-bold border-2 border-charcoal">
                                1
                            </span>
                            <span className="mt-0.5">Schedule a followup simulation focusing on FAANG scenario configurations.</span>
                        </li>
                    )}
                </ul>
            </div>

            {/* Practice Recommendations */}
            <div className="card-editorial p-6 bg-white dark:bg-navy-light">
                <div className="flex items-center space-x-2.5 mb-4 border-b border-dashed border-charcoal/10 pb-3">
                    <Target className="w-5 h-5 text-charcoal dark:text-cream" strokeWidth={2.5} />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-charcoal dark:text-cream">Core Tips</h3>
                </div>
                <ul className="space-y-3 font-body text-xs font-bold leading-relaxed text-charcoal/80 dark:text-cream/80">
                    {interview.report?.practiceRecommendations?.map((rec, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-charcoal dark:text-cream mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                        </li>
                    )) || (
                        <li className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-charcoal dark:text-cream mt-0.5 flex-shrink-0" />
                            <span>Align communication formats with standard STAR responses.</span>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

const ScoreCard = ({ title, score, icon: Icon }) => {
    return (
        <div className="card-editorial p-4 bg-white dark:bg-navy-light hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-default shadow-[2px_2px_0px_0px_var(--color-shadow)]">
            <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/20 rounded-sm flex items-center justify-center text-charcoal dark:text-cream shadow-[1px_1px_0px_0px_var(--color-shadow)]">
                    <Icon className="w-4.5 h-4.5" />
                </div>
                <span className="text-xl font-display font-bold text-charcoal dark:text-cream">{score}%</span>
            </div>
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal/60 dark:text-cream/60">{title}</h3>
            <div className="mt-2.5 w-full bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm h-3 p-[1px]">
                <div 
                    className="h-full rounded-none bg-charcoal dark:bg-cream"
                    style={{ width: `${score}%` }}
                ></div>
            </div>
        </div>
    );
};

export default InterviewReport;
