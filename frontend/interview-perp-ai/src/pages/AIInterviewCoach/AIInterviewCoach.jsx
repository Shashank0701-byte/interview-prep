import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Mic, MicOff, VideoOff, Settings, Play, Clock, Users, Award, ArrowLeft, BarChart3 } from 'lucide-react';
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
            // Don't show error toast for initial load if no interviews exist
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
            
            console.log('Create interview response:', response.data);
            
            if (response.data.success) {
                toast.success('Interview session created!');
                navigate(`/ai-interview/${response.data.interview.sessionId}`);
            }
        } catch (error) {
            console.error('Error creating interview session:', error);
            console.error('Create interview error details:', error.response?.data);
            toast.error('Failed to create interview session');
        } finally {
            setIsCreating(false);
        }
    };

    // // Test function to verify backend connection
    // const testBackendConnection = async () => {
    //     try {
    //         console.log('Testing backend connection...');
    //         const response = await axiosInstance.get('/api/test');
    //         console.log('Backend test response:', response.data);
    //         toast.success('Backend connection successful!');
    //     } catch (error) {
    //         console.error('Backend connection test failed:', error);
    //         console.error('Test error details:', error.response?.data);
    //         toast.error('Backend connection failed');
    //     }
    // };

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
        { id: 'junior', name: 'Junior (0-2 years)', color: 'text-slate-600' },
        { id: 'mid-level', name: 'Mid-Level (3-5 years)', color: 'text-slate-700' },
        { id: 'senior', name: 'Senior (5+ years)', color: 'text-slate-800' },
        { id: 'principal', name: 'Principal/Staff', color: 'text-slate-900' }
    ];

    return (
        <div className="min-h-screen bg-cream font-body p-4 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header with Back Button */}
                <div className="relative mb-8">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="absolute left-0 top-0 flex items-center space-x-2 text-charcoal hover:text-charcoal/80 transition-colors duration-200 group cursor-pointer hover:-translate-y-1"
                    >
                        <div className="p-2 rounded-md hover:bg-charcoal/5 transition-colors duration-200">
                            <ArrowLeft className="w-5 h-5 group-hover:transform group-hover:-translate-x-1 transition-transform duration-200" />
                        </div>
                        <span className="font-bold uppercase tracking-wider text-sm">Back to Dashboard</span>
                    </button>
                    
                    {/* Centered Header Content */}
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-charcoal rounded-md mb-4 shadow-[4px_4px_0px_0px_#1A1A1A]">
                            <Video className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-display font-bold text-charcoal mb-2 transition-colors duration-300">
                            AI Interview Coach
                        </h1>
                        <p className="text-charcoal/80 text-lg max-w-2xl mx-auto transition-colors duration-300">
                            Practice with our AI interviewer that analyzes your performance in real-time. 
                            Get feedback on eye contact, voice clarity, confidence, and technical responses.
                        </p>
                        
                        {/* Analytics Toggle */}
                        <div className="mt-6 flex justify-center">
                            <div className="flex bg-white border-2 border-charcoal rounded-md p-1 shadow-[4px_4px_0px_0px_#1A1A1A]">
                                <button
                                    onClick={() => setShowAnalytics(false)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold uppercase tracking-wider text-sm transition-all duration-200 cursor-pointer ${
                                        !showAnalytics
                                            ? 'bg-charcoal text-white'
                                            : 'text-charcoal hover:bg-charcoal/10'
                                    }`}
                                >
                                    <Video className="w-4 h-4" />
                                    Interview Setup
                                </button>
                                <button
                                    onClick={() => setShowAnalytics(true)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold uppercase tracking-wider text-sm transition-all duration-200 cursor-pointer ${
                                        showAnalytics
                                            ? 'bg-charcoal text-white'
                                            : 'text-charcoal hover:bg-charcoal/10'
                                    }`}
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    Advanced Analytics
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conditional Content */}
                {!showAnalytics ? (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card-editorial p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider text-charcoal/80 transition-colors duration-300">Total Interviews</p>
                                <p className="text-2xl font-display font-bold text-charcoal transition-colors duration-300">{stats.totalInterviews}</p>
                            </div>
                            <div className="w-12 h-12 bg-cream border-2 border-charcoal rounded-md flex items-center justify-center shadow-[2px_2px_0px_0px_#1A1A1A]">
                                <Users className="w-6 h-6 text-charcoal" />
                            </div>
                        </div>
                    </div>

                    <div className="card-editorial p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider text-charcoal/80 transition-colors duration-300">Average Score</p>
                                <p className="text-2xl font-display font-bold text-charcoal transition-colors duration-300">{stats.averageScore}%</p>
                            </div>
                            <div className="w-12 h-12 bg-cream border-2 border-charcoal rounded-md flex items-center justify-center shadow-[2px_2px_0px_0px_#1A1A1A]">
                                <Award className="w-6 h-6 text-charcoal" />
                            </div>
                        </div>
                    </div>

                    <div className="card-editorial p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider text-charcoal/80 transition-colors duration-300">Improvement</p>
                                <p className={`text-2xl font-display font-bold text-charcoal transition-colors duration-300`}>
                                    {stats.improvementTrend >= 0 ? '+' : ''}{stats.improvementTrend}%
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-cream border-2 border-charcoal rounded-md flex items-center justify-center shadow-[2px_2px_0px_0px_#1A1A1A]">
                                <Clock className="w-6 h-6 text-charcoal" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Configuration Panel */}
                    <div className="lg:col-span-2">
                        <div className="card-editorial p-6">
                            <h2 className="text-2xl font-display font-bold text-charcoal mb-6">Configure Your Interview</h2>
                            
                            {/* Interview Type */}
                            <div className="mb-6">
                                <h3 className="text-lg font-display font-semibold text-charcoal mb-3">Interview Type</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {interviewTypes.map((type) => (
                                        <div
                                            key={type.id}
                                            onClick={() => setSelectedConfig({...selectedConfig, interviewType: type.id})}
                                            className={`p-4 rounded-md border-2 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] ${
                                                selectedConfig.interviewType === type.id
                                                    ? 'border-charcoal bg-charcoal/5 shadow-[4px_4px_0px_0px_#1A1A1A] translate-y-[-4px]'
                                                    : 'border-charcoal/20 bg-white hover:border-charcoal'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <span className="text-2xl">{type.icon}</span>
                                                <div>
                                                    <h4 className="font-display font-semibold text-charcoal">{type.name}</h4>
                                                    <p className="text-sm text-charcoal/80">{type.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Industry Focus */}
                            <div className="mb-6">
                                <h3 className="text-lg font-display font-semibold text-charcoal mb-3">Industry Focus</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {industryFocus.map((industry) => (
                                        <div
                                            key={industry.id}
                                            onClick={() => setSelectedConfig({...selectedConfig, industryFocus: industry.id})}
                                            className={`p-4 rounded-md border-2 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] ${
                                                selectedConfig.industryFocus === industry.id
                                                    ? 'border-charcoal bg-charcoal/5 shadow-[4px_4px_0px_0px_#1A1A1A] translate-y-[-4px]'
                                                    : 'border-charcoal/20 bg-white hover:border-charcoal'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <span className="text-2xl">{industry.icon}</span>
                                                <div>
                                                    <h4 className="font-display font-semibold text-charcoal">{industry.name}</h4>
                                                    <p className="text-sm text-charcoal/80">{industry.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Role & Difficulty */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="text-lg font-display font-semibold text-charcoal mb-3">Role</h3>
                                    <select
                                        value={selectedConfig.role}
                                        onChange={(e) => setSelectedConfig({...selectedConfig, role: e.target.value})}
                                        className="w-full p-3 border-2 border-charcoal bg-white text-charcoal rounded-md focus:ring-2 focus:ring-charcoal focus:border-transparent outline-none cursor-pointer hover:shadow-[2px_2px_0px_0px_#1A1A1A] transition-shadow"
                                    >
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <h3 className="text-lg font-display font-semibold text-charcoal mb-3">Difficulty Level</h3>
                                    <select
                                        value={selectedConfig.difficulty}
                                        onChange={(e) => setSelectedConfig({...selectedConfig, difficulty: e.target.value})}
                                        className="w-full p-3 border-2 border-charcoal bg-white text-charcoal rounded-md focus:ring-2 focus:ring-charcoal focus:border-transparent outline-none cursor-pointer hover:shadow-[2px_2px_0px_0px_#1A1A1A] transition-shadow"
                                    >
                                        {difficulties.map((diff) => (
                                            <option key={diff.id} value={diff.id}>{diff.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="mb-6">
                                <h3 className="text-lg font-display font-semibold text-charcoal mb-3">Duration</h3>
                                <div className="flex space-x-3">
                                    {[15, 30, 45, 60].map((duration) => (
                                        <button
                                            key={duration}
                                            onClick={() => setSelectedConfig({...selectedConfig, duration})}
                                            className={`px-4 py-2 rounded-md font-bold uppercase tracking-wider text-sm transition-all duration-200 cursor-pointer hover:-translate-y-1 ${
                                                selectedConfig.duration === duration
                                                    ? 'bg-charcoal text-white border-2 border-charcoal shadow-[4px_4px_0px_0px_#1A1A1A]'
                                                    : 'bg-white border-2 border-charcoal text-charcoal hover:shadow-[4px_4px_0px_0px_#1A1A1A]'
                                            }`}
                                        >
                                            {duration} min
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Start Button */}
                            <button
                                onClick={createInterviewSession}
                                disabled={isCreating}
                                className="w-full border-2 border-charcoal bg-charcoal text-white py-4 px-6 rounded-md font-display font-bold uppercase tracking-wider text-lg hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#1A1A1A] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center space-x-2 cursor-pointer"
                            >
                                {isCreating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Creating Session...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5" />
                                        <span>Start AI Interview</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Recent Interviews */}
                    <div className="lg:col-span-1">
                        <div className="card-editorial p-6">
                            <h2 className="text-xl font-display font-bold text-charcoal mb-4">Recent Interviews</h2>
                            
                            {recentInterviews.length === 0 ? (
                                <div className="text-center py-8">
                                    <Video className="w-12 h-12 text-charcoal/40 mx-auto mb-3" />
                                    <p className="text-charcoal/80 font-medium">No interviews yet</p>
                                    <p className="text-sm text-charcoal/60">Start your first AI interview above</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentInterviews.map((interview) => (
                                        <div
                                            key={interview.sessionId}
                                            onClick={() => navigate(`/ai-interview/${interview.sessionId}/report`)}
                                            className="p-4 border-2 border-charcoal bg-white rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] cursor-pointer transition-all duration-200"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-display font-bold text-charcoal capitalize">
                                                    {interview.interviewType.replace('-', ' ')}
                                                </span>
                                                <span className="px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider border-2 border-charcoal bg-cream text-charcoal">
                                                    {interview.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-charcoal/80">
                                                <span className="capitalize font-medium">{interview.industryFocus}</span>
                                                {interview.scores?.overall && (
                                                    <span className="font-bold">{interview.scores.overall}%</span>
                                                )}
                                            </div>
                                            <div className="text-xs font-medium text-charcoal/60 mt-2">
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
