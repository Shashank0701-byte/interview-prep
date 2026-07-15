import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Clock, Users, Award, ArrowLeft, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import AIInterviewAnalytics from '../../components/Analytics/AIInterviewAnalytics';

const AIInterviewCoach = () => {
    const navigate = useNavigate();
    const [selectedConfig, setSelectedConfig] = useState({
        interviewType: 'technical',
        industryFocus: 'faang',
        role: 'software-engineer',
        difficulty: 'mid-level',
        duration: 30
    });
    
    const [isCreating, setIsCreating] = useState(false);
    const [recentInterviews, setRecentInterviews] = useState([]);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [stats, setStats] = useState({
        totalInterviews: 0,
        averageScore: 0,
        improvementTrend: 0
    });

    useEffect(() => {
        fetchInterviewHistory();
    }, []);

    const fetchInterviewHistory = async () => {
        try {
            const response = await axiosInstance.get('/api/ai-interview-coach/history?limit=5');
            
            if (response.data.success) {
                setRecentInterviews(response.data.interviews);
                calculateStats(response.data.interviews);
            }
        } catch (error) {
            console.error('Error fetching interview history:', error);
        }
    };

    const calculateStats = (interviews) => {
        const completed = interviews.filter(i => i.status === 'completed');
        const totalScore = completed.reduce((sum, i) => sum + (i.scores?.overall || 0), 0);
        
        setStats({
            totalInterviews: interviews.length,
            averageScore: completed.length ? Math.round(totalScore / completed.length) : 0,
            improvementTrend: completed.length >= 2 ? 
                (completed[0].scores?.overall || 0) - (completed[1].scores?.overall || 0) : 0
        });
    };

    const createInterviewSession = async () => {
        setIsCreating(true);
        try {
            console.log('Creating interview session with config:', selectedConfig);
            const response = await axiosInstance.post('/api/ai-interview-coach/create', selectedConfig);
            
            if (response.data.success) {
                toast.success('Interview session created!');
                navigate(`/ai-interview/${response.data.interview.sessionId}`);
            }
        } catch (error) {
            console.error('Error creating interview session:', error);
            toast.error('Failed to create interview session');
        } finally {
            setIsCreating(false);
        }
    };

    const interviewTypes = [
        { id: 'technical', name: 'Technical Interview', icon: '💻', description: 'Coding and system design questions' },
        { id: 'behavioral', name: 'Behavioral Interview', icon: '🤝', description: 'Leadership and teamwork scenarios' },
        { id: 'system-design', name: 'System Design', icon: '🏗️', description: 'Architecture and scalability challenges' },
        { id: 'coding', name: 'Live Coding', icon: '⚡', description: 'Real-time coding challenges' }
    ];

    const industryFocus = [
        { id: 'faang', name: 'FAANG', icon: '🚀', description: 'Meta, Apple, Amazon, Netflix, Google' },
        { id: 'startup', name: 'Startup', icon: '💡', description: 'Fast-paced, innovative environments' },
        { id: 'enterprise', name: 'Enterprise', icon: '🏢', description: 'Large corporations and established companies' },
        { id: 'fintech', name: 'FinTech', icon: '💰', description: 'Financial technology companies' }
    ];

    const roles = [
        { id: 'software-engineer', name: 'Software Engineer' },
        { id: 'frontend-developer', name: 'Frontend Developer' },
        { id: 'backend-developer', name: 'Backend Developer' },
        { id: 'fullstack-developer', name: 'Full Stack Developer' },
        { id: 'devops-engineer', name: 'DevOps Engineer' }
    ];

    const difficulties = [
        { id: 'junior', name: 'Junior (0-2 years)' },
        { id: 'mid-level', name: 'Mid-Level (3-5 years)' },
        { id: 'senior', name: 'Senior (5+ years)' },
        { id: 'principal', name: 'Principal/Staff' }
    ];

    return (
        <div className="min-h-screen bg-cream dark:bg-navy font-body p-6 text-charcoal dark:text-cream transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header with Back Button */}
                <div className="relative mb-8 flex flex-col items-center">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="absolute left-0 top-0 w-10 h-10 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream rounded-sm flex items-center justify-center shadow-[2px_2px_0px_0px_var(--color-shadow)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5" strokeWidth={3} />
                    </button>
                    
                    <div className="text-center mt-12 sm:mt-0">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-white dark:bg-navy-light border-3 border-charcoal dark:border-cream/40 rounded-sm mb-4 shadow-[4px_4px_0px_0px_var(--color-shadow)]">
                            <Video className="w-7 h-7 text-charcoal dark:text-cream" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-4xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wider">
                            AI Interview Coach
                        </h1>
                        <p className="text-charcoal/70 dark:text-cream/70 text-sm max-w-2xl mx-auto leading-relaxed mt-2">
                            Practice with our intelligent interviewer that assesses eye contact, speech clarity, structure, and pacing in real-time.
                        </p>
                        
                        {/* Tab Switcher */}
                        <div className="mt-8 flex justify-center">
                            <div className="flex bg-white dark:bg-navy-light border-3 border-charcoal dark:border-cream/40 rounded-sm p-1 shadow-[3px_3px_0px_0px_var(--color-shadow)]">
                                <button
                                    onClick={() => setShowAnalytics(false)}
                                    className={`flex items-center gap-2 px-4 py-2 border border-transparent rounded-sm font-mono font-bold uppercase tracking-wider text-xs transition-all duration-200 cursor-pointer ${
                                        !showAnalytics
                                            ? 'bg-charcoal text-white dark:bg-cream dark:text-navy'
                                            : 'text-charcoal dark:text-cream hover:bg-charcoal/5 dark:hover:bg-navy-input'
                                    }`}
                                >
                                    <Video className="w-4 h-4" />
                                    <span>Setup Coach</span>
                                </button>
                                <button
                                    onClick={() => setShowAnalytics(true)}
                                    className={`flex items-center gap-2 px-4 py-2 border border-transparent rounded-sm font-mono font-bold uppercase tracking-wider text-xs transition-all duration-200 cursor-pointer ${
                                        showAnalytics
                                            ? 'bg-charcoal text-white dark:bg-cream dark:text-navy'
                                            : 'text-charcoal dark:text-cream hover:bg-charcoal/5 dark:hover:bg-navy-input'
                                    }`}
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    <span>Lobby Analytics</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                {!showAnalytics ? (
                    <>
                        {/* Stats Panel */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {[
                                { label: 'Total Sessions', value: stats.totalInterviews, icon: Users },
                                { label: 'Average Score', value: `${stats.averageScore}%`, icon: Award },
                                { label: 'Improvement', value: `${stats.improvementTrend >= 0 ? '+' : ''}${stats.improvementTrend}%`, icon: Clock }
                            ].map((stat, idx) => {
                                const IconComp = stat.icon;
                                return (
                                    <div key={idx} className="card-editorial p-6 bg-white dark:bg-navy-light">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal/50 dark:text-cream/50">{stat.label}</p>
                                                <p className="text-2xl font-display font-bold text-charcoal dark:text-cream mt-1">{stat.value}</p>
                                            </div>
                                            <div className="w-10 h-10 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/20 rounded-sm flex items-center justify-center shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                                <IconComp className="w-5 h-5 text-charcoal/60 dark:text-cream/60" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Configurations */}
                            <div className="lg:col-span-2">
                                <div className="card-editorial p-6 bg-white dark:bg-navy-light">
                                    <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide mb-6 border-b border-dashed border-charcoal/10 dark:border-cream/10 pb-4">
                                        Configure Session Parameters
                                    </h2>
                                    
                                    {/* Interview Type */}
                                    <div className="mb-6">
                                        <h3 className="text-xs font-mono font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-widest mb-3">1. Select Interview Type</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {interviewTypes.map((type) => (
                                                <div
                                                    key={type.id}
                                                    onClick={() => setSelectedConfig({...selectedConfig, interviewType: type.id})}
                                                    className={`p-4 rounded-sm border-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none ${
                                                        selectedConfig.interviewType === type.id
                                                            ? 'border-charcoal dark:border-cream bg-cream dark:bg-navy shadow-[3px_3px_0px_0px_var(--color-shadow)]'
                                                            : 'border-charcoal/20 dark:border-cream/20 bg-white dark:bg-navy-light hover:border-charcoal/50'
                                                    }`}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <span className="text-xl flex-shrink-0">{type.icon}</span>
                                                        <div className="min-w-0">
                                                            <h4 className="font-mono font-bold text-xs text-charcoal dark:text-cream uppercase tracking-wider">{type.name}</h4>
                                                            <p className="text-[10px] font-medium text-charcoal/60 dark:text-cream/60 mt-1 leading-relaxed">{type.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Industry focus */}
                                    <div className="mb-6">
                                        <h3 className="text-xs font-mono font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-widest mb-3">2. Select Target Focus</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {industryFocus.map((industry) => (
                                                <div
                                                    key={industry.id}
                                                    onClick={() => setSelectedConfig({...selectedConfig, industryFocus: industry.id})}
                                                    className={`p-4 rounded-sm border-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none ${
                                                        selectedConfig.industryFocus === industry.id
                                                            ? 'border-charcoal dark:border-cream bg-cream dark:bg-navy shadow-[3px_3px_0px_0px_var(--color-shadow)]'
                                                            : 'border-charcoal/20 dark:border-cream/20 bg-white dark:bg-navy-light hover:border-charcoal/50'
                                                    }`}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <span className="text-xl flex-shrink-0">{industry.icon}</span>
                                                        <div className="min-w-0">
                                                            <h4 className="font-mono font-bold text-xs text-charcoal dark:text-cream uppercase tracking-wider">{industry.name}</h4>
                                                            <p className="text-[10px] font-medium text-charcoal/60 dark:text-cream/60 mt-1 leading-relaxed">{industry.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Role & Level */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <h3 className="text-xs font-mono font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-widest mb-2">3. Role Target</h3>
                                            <select
                                                value={selectedConfig.role}
                                                onChange={(e) => setSelectedConfig({...selectedConfig, role: e.target.value})}
                                                className="w-full px-3 py-2.5 border-2 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy text-charcoal dark:text-cream font-mono font-bold text-xs rounded-sm outline-none cursor-pointer focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
                                            >
                                                {roles.map((role) => (
                                                    <option key={role.id} value={role.id}>{role.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-mono font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-widest mb-2">4. Experience Tier</h3>
                                            <select
                                                value={selectedConfig.difficulty}
                                                onChange={(e) => setSelectedConfig({...selectedConfig, difficulty: e.target.value})}
                                                className="w-full px-3 py-2.5 border-2 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy text-charcoal dark:text-cream font-mono font-bold text-xs rounded-sm outline-none cursor-pointer focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
                                            >
                                                {difficulties.map((diff) => (
                                                    <option key={diff.id} value={diff.id}>{diff.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Duration selector */}
                                    <div className="mb-8 border-t border-dashed border-charcoal/10 dark:border-cream/10 pt-4">
                                        <h3 className="text-xs font-mono font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-widest mb-3">5. Select Duration</h3>
                                        <div className="flex flex-wrap gap-2.5">
                                            {[15, 30, 45, 60].map((duration) => (
                                                <button
                                                    key={duration}
                                                    onClick={() => setSelectedConfig({...selectedConfig, duration})}
                                                    className={`px-4 py-2 border-2 rounded-sm font-mono font-bold uppercase tracking-wider text-xs transition-all duration-200 cursor-pointer shadow-[2.5px_2.5px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none ${
                                                        selectedConfig.duration === duration
                                                            ? 'bg-charcoal text-white border-charcoal dark:bg-cream dark:text-navy dark:border-cream/80'
                                                            : 'bg-white dark:bg-navy-light text-charcoal dark:text-cream border-charcoal dark:border-cream/40 hover:-translate-y-0.5'
                                                    }`}
                                                >
                                                    {duration} min
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Trigger button */}
                                    <button
                                        onClick={createInterviewSession}
                                        disabled={isCreating}
                                        className="w-full bg-charcoal text-white dark:bg-cream dark:text-navy border-3 border-charcoal dark:border-cream py-3.5 rounded-sm font-mono font-bold uppercase tracking-widest text-xs hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-[3px_3px_0px_0px_var(--color-shadow)] flex items-center justify-center gap-2"
                                    >
                                        {isCreating ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-navy"></div>
                                                <span>Initializing Coach...</span>
                                            </>
                                        ) : (
                                            <span>Initialize AI Interview Session</span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Recent Interviews list */}
                            <div className="lg:col-span-1">
                                <div className="card-editorial p-6 bg-white dark:bg-navy-light">
                                    <h2 className="text-lg font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide mb-4 border-b border-dashed border-charcoal/10 dark:border-cream/10 pb-3">
                                        Session Log
                                    </h2>
                                    
                                    {recentInterviews.length === 0 ? (
                                        <div className="text-center py-10 font-mono text-charcoal/50 dark:text-cream/50">
                                            <p className="text-xs font-bold uppercase tracking-wider">Log Empty</p>
                                            <p className="text-[9px] mt-1">Configure and initialize a coach session to build history logs.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {recentInterviews.map((interview) => (
                                                <div
                                                    key={interview.sessionId}
                                                    onClick={() => navigate(`/ai-interview/${interview.sessionId}/report`)}
                                                    className="p-4 bg-cream dark:bg-navy border-2 border-charcoal/15 dark:border-cream/20 rounded-sm hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-shadow)]"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-mono font-bold text-xs text-charcoal dark:text-cream capitalize truncate pr-2">
                                                            {interview.interviewType.replace('-', ' ')}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-sm border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-[9px] font-mono font-bold uppercase tracking-wider shadow-[1px_1px_0px_0px_var(--color-shadow)]">
                                                            {interview.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-charcoal/60 dark:text-cream/60">
                                                        <span className="capitalize">{interview.industryFocus} Focus</span>
                                                        {interview.scores?.overall && (
                                                            <span className="text-charcoal dark:text-cream">{interview.scores.overall}% Score</span>
                                                        )}
                                                    </div>
                                                    <div className="text-[9px] font-mono font-bold text-charcoal/40 dark:text-cream/40 uppercase tracking-widest mt-2">
                                                        {new Date(interview.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <AIInterviewAnalytics />
                )}
            </div>
        </div>
    );
};

export default AIInterviewCoach;
