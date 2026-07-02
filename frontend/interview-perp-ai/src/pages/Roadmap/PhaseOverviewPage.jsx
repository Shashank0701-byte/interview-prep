import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader.jsx';
import { 
    LuPlay, 
    LuBookOpen, 
    LuTarget, 
    LuClock, 
    LuTrendingUp, 
    LuCheck, 
    LuArrowRight,
    LuBrain,
    LuStar,
    LuLock,
    LuChevronRight,
    LuRocket,
    LuAward,
    LuCalendar
} from 'react-icons/lu';

const PhaseOverviewPage = () => {
    const { role, phaseId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [roadmap, setRoadmap] = useState(null);
    const [currentPhase, setCurrentPhase] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [recommendedSessions, setRecommendedSessions] = useState([]);
    const [sessionTemplates, setSessionTemplates] = useState([]);
    const [creatingSession, setCreatingSession] = useState(null);

    useEffect(() => {
        fetchRoadmapAndPhase();
    }, [role, phaseId]);

    const fetchRoadmapAndPhase = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.ROADMAP.GENERATE(role));
            const roadmapData = response.data;
            setRoadmap(roadmapData);
            
            // Find the current phase
            const phase = roadmapData.phases.find(p => p.id === phaseId);
            if (phase) {
                setCurrentPhase(phase);
                // Sort sessions by recommended order (incomplete first, then by creation date)
                const sortedSessions = [...phase.sessions].sort((a, b) => {
                    if (a.completionPercentage < 100 && b.completionPercentage >= 100) return -1;
                    if (a.completionPercentage >= 100 && b.completionPercentage < 100) return 1;
                    return new Date(a.createdAt) - new Date(b.createdAt);
                });
                setRecommendedSessions(sortedSessions);
                
                // Fetch session templates for this phase
                await fetchSessionTemplates();
            }
        } catch (error) {
            console.error("Failed to fetch roadmap and phase", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const fetchSessionTemplates = async () => {
        try {
            console.log('Fetching session templates for:', role, phaseId);
            const response = await axiosInstance.get(`/api/roadmap-sessions/phase/${role}/${phaseId}`);
            console.log('Session templates response:', response.data);
            if (response.data.success) {
                console.log('Setting session templates:', response.data.sessions);
                setSessionTemplates(response.data.sessions);
            }
        } catch (error) {
            console.error("Failed to fetch session templates", error);
        }
    };
    
    const handleStartSession = async (template) => {
        setCreatingSession(template._id);
        try {
            // Create the roadmap session with AI question generation
            const response = await axiosInstance.post('/api/roadmap-sessions/create', {
                role: template.role,
                experience: template.experience,
                topicsToFocus: template.topicsToFocus.join(', '),
                description: template.description,
                phaseId: phaseId,
                phaseName: currentPhase.name,
                phaseColor: currentPhase.color,
                roadmapRole: role
            });
            
            if (response.data.success) {
                // Navigate to the practice page
                navigate(`/roadmap-session/${response.data.session._id}?fromPhase=${phaseId}&role=${encodeURIComponent(role)}`);
            }
        } catch (error) {
            console.error("Failed to create session", error);
            alert('Failed to create session. Please try again.');
        } finally {
            setCreatingSession(null);
        }
    };

    const getPhaseColor = (color) => {
        const colors = {
            blue: 'from-blue-500 to-cyan-500',
            purple: 'from-purple-500 to-indigo-500',
            emerald: 'from-emerald-500 to-green-500',
            amber: 'from-amber-500 to-orange-500',
            cyan: 'from-cyan-500 to-blue-500',
            green: 'from-green-500 to-emerald-500',
            red: 'from-red-500 to-pink-500',
            indigo: 'from-indigo-500 to-purple-500',
            orange: 'from-orange-500 to-red-500'
        };
        return colors[color] || 'from-gray-500 to-gray-600';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <LuCheck className="w-4 h-4 text-emerald-500" />;
            case 'in_progress':
                return <LuPlay className="w-4 h-4 text-blue-500" />;
            case 'available':
                return <LuTarget className="w-4 h-4 text-purple-500" />;
            case 'locked':
                return <LuLock className="w-4 h-4 text-gray-400" />;
            default:
                return <LuTarget className="w-4 h-4 text-gray-400" />;
        }
    };

    const handleStartRecommendedSession = () => {
        if (recommendedSessions.length > 0) {
            const nextSession = recommendedSessions[0];
            navigate(`/interview-prep/${nextSession.id}?fromPhase=${phaseId}&role=${encodeURIComponent(role)}`);
        }
    };

    const handleBrowseSessions = () => {
        navigate(`/phase-sessions/${encodeURIComponent(role)}/${phaseId}`);
    };

    const handleStartPhaseQuiz = () => {
        navigate(`/phase-quiz/${role}/${phaseId}`);
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-screen font-body bg-cream">
                    <SpinnerLoader />
                    <p className="text-charcoal mt-4 text-center font-bold">
                        Preparing your phase overview... ✨
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    if (!currentPhase) {
        return (
            <DashboardLayout>
                <div className="text-center py-20 font-body bg-cream min-h-screen">
                    <div className="w-20 h-20 bg-charcoal rounded-full flex items-center justify-center mx-auto mb-6">
                        <LuTarget className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-charcoal mb-4">Phase Not Found</h2>
                    <p className="text-charcoal/80 mb-6">
                        The requested phase could not be found.
                    </p>
                    <button
                        onClick={() => navigate(`/roadmap?role=${encodeURIComponent(role)}`)}
                        className="px-6 py-3 bg-charcoal border-2 border-charcoal text-white font-bold uppercase tracking-wider text-sm rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all cursor-pointer"
                    >
                        Back to Roadmap
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-cream font-body">
                {/* Enhanced Hero Header */}
                <div className={`bg-charcoal text-white border-b-2 border-charcoal`}>
                    <div className="container mx-auto px-4 md:px-6 py-12">
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
                                <button
                                    onClick={() => navigate(`/roadmap?role=${encodeURIComponent(role)}`)}
                                    className="hover:text-white transition-colors"
                                >
                                    {role}
                                </button>
                                <LuChevronRight className="w-4 h-4" />
                                <span className="text-white font-medium">Phase {currentPhase.order}</span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                                        {currentPhase.name}
                                    </h1>
                                    <p className="text-xl text-white/90 mb-6 leading-relaxed">
                                        {currentPhase.description}
                                    </p>
                                    
                                    {/* Phase Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white text-charcoal border-2 border-charcoal rounded-md p-4 shadow-[4px_4px_0px_0px_#1A1A1A]">
                                            <div className="flex items-center gap-2 mb-2">
                                                <LuBookOpen className="w-5 h-5" />
                                                <span className="font-bold">Sessions</span>
                                            </div>
                                            <div className="text-2xl font-display font-bold">{currentPhase.sessionsCount}</div>
                                        </div>
                                        <div className="bg-white text-charcoal border-2 border-charcoal rounded-md p-4 shadow-[4px_4px_0px_0px_#1A1A1A]">
                                            <div className="flex items-center gap-2 mb-2">
                                                <LuTarget className="w-5 h-5" />
                                                <span className="font-bold">Questions</span>
                                            </div>
                                            <div className="text-2xl font-display font-bold">{currentPhase.totalQuestions}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:text-right">
                                    {/* Progress Circle */}
                                    <div className="inline-flex flex-col items-center">
                                        <div className="relative w-32 h-32 mb-4">
                                            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="40"
                                                    stroke="rgba(255,255,255,0.2)"
                                                    strokeWidth="8"
                                                    fill="none"
                                                />
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="40"
                                                    stroke="white"
                                                    strokeWidth="8"
                                                    fill="none"
                                                    strokeDasharray={`${2.51 * currentPhase.completionPercentage} 251.2`}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-1000 ease-out"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold text-white">
                                                        {currentPhase.completionPercentage}%
                                                    </div>
                                                    <div className="text-sm text-white/80">Complete</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/90">
                                            <LuCalendar className="w-4 h-4" />
                                            <span>{currentPhase.estimatedDays} days estimated</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Key Topics */}
                            <div className="card-editorial p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-10 h-10 bg-charcoal rounded-md flex items-center justify-center`}>
                                        <LuBrain className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-display font-bold text-charcoal">Key Topics</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentPhase.topics.map((topic, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-4 bg-white rounded-md border-2 border-charcoal shadow-[4px_4px_0px_0px_#1A1A1A]"
                                        >
                                            <div className="w-8 h-8 bg-charcoal rounded-sm flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">{index + 1}</span>
                                            </div>
                                            <span className="font-bold text-charcoal">{topic}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Session Templates */}
                            {console.log('Rendering session templates, count:', sessionTemplates.length)}
                            {sessionTemplates.length > 0 ? (
                                <div className="card-editorial p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`w-10 h-10 bg-charcoal rounded-md flex items-center justify-center`}>
                                            <LuRocket className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-display font-bold text-charcoal">Your Sessions ({sessionTemplates.length})</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {sessionTemplates.map((template, index) => (
                                            <div
                                                key={template._id}
                                                className="bg-white border-2 border-charcoal rounded-md p-6 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all duration-200"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <h3 className="font-display font-bold text-charcoal text-lg mb-2">
                                                            {template.role}
                                                        </h3>
                                                        <p className="text-sm text-charcoal/80 mb-3">
                                                            {template.description}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            {template.topicsToFocus.slice(0, 3).map((topic, i) => (
                                                                <span key={i} className="text-xs bg-charcoal/5 border border-charcoal text-charcoal font-bold px-2 py-1 rounded-sm">
                                                                    {topic}
                                                                </span>
                                                            ))}
                                                            {template.topicsToFocus.length > 3 && (
                                                                <span className="text-xs bg-cream border border-charcoal/20 text-charcoal/80 font-bold px-2 py-1 rounded-sm">
                                                                    +{template.topicsToFocus.length - 3} more
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-charcoal/80">
                                                            <span className="flex items-center gap-1 font-bold">
                                                                <LuTarget className="w-4 h-4" />
                                                                {template.questions?.length || 5} questions
                                                            </span>
                                                            <span className="flex items-center gap-1 font-bold">
                                                                <LuClock className="w-4 h-4" />
                                                                {template.experience} years
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {template.isStarted ? (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-sm mb-2">
                                                            <span className="text-charcoal/80 font-bold">Progress</span>
                                                            <span className="font-bold text-charcoal">{template.completionPercentage}%</span>
                                                        </div>
                                                        <div className="w-full bg-cream border-2 border-charcoal/20 rounded-full h-2 mb-3">
                                                            <div 
                                                                className="bg-charcoal h-2 transition-all duration-300"
                                                                style={{ width: `${template.completionPercentage}%` }}
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => navigate(`/roadmap-session/${template.sessionId}?fromPhase=${phaseId}&role=${encodeURIComponent(role)}`)}
                                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-charcoal border-2 border-charcoal font-bold uppercase tracking-wider text-xs rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all duration-200 cursor-pointer"
                                                        >
                                                            <LuPlay className="w-4 h-4" />
                                                            {template.completionPercentage === 100 ? 'Review Session' : 'Continue Session'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStartSession(template)}
                                                        disabled={creatingSession === template._id}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-charcoal text-white border-2 border-charcoal font-bold uppercase tracking-wider text-xs rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                    >
                                                        {creatingSession === template._id ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                Generating Questions...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <LuRocket className="w-4 h-4" />
                                                                Start Session
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="card-editorial p-8">
                                    <div className="text-center py-8">
                                        <p className="text-charcoal/80 font-bold">No session templates available for this phase yet.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Sidebar */}
                        <div className="space-y-6">
                            {/* Action Buttons */}
                            <div className="card-editorial p-6">
                                <h3 className="text-xl font-display font-bold text-charcoal mb-6">Ready to Learn?</h3>
                                <div className="space-y-4">
                                    <button
                                        onClick={handleBrowseSessions}
                                        className="w-full flex items-center justify-center gap-3 px-6 py-4 font-bold uppercase tracking-wider text-sm rounded-md text-charcoal bg-white border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all duration-300 cursor-pointer"
                                    >
                                        <LuBookOpen className="w-5 h-5" />
                                        <span>Browse All Sessions</span>
                                    </button>

                                    {currentPhase.completionPercentage >= 70 && (
                                        <button
                                            onClick={handleStartPhaseQuiz}
                                            className="w-full flex items-center justify-center gap-3 px-6 py-4 font-bold uppercase tracking-wider text-sm rounded-md text-white bg-charcoal border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all duration-300 cursor-pointer"
                                        >
                                            <LuAward className="w-5 h-5" />
                                            <span>Take Phase Quiz</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Progress Summary */}
                            <div className="card-editorial p-6">
                                <h3 className="text-xl font-display font-bold text-charcoal mb-4">Your Progress</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-charcoal/80 font-bold">Mastered Questions</span>
                                        <span className="font-bold text-charcoal">{currentPhase.masteredQuestions}/{currentPhase.totalQuestions}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-charcoal/80 font-bold">Sessions Started</span>
                                        <span className="font-bold text-charcoal">{currentPhase.sessionsCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-charcoal/80 font-bold">Estimated Time</span>
                                        <span className="font-bold text-charcoal">{currentPhase.estimatedDays} days</span>
                                    </div>
                                </div>
                            </div>

                            {/* Motivational Message */}
                            <div className={`bg-charcoal border-2 border-charcoal shadow-[4px_4px_0px_0px_#1A1A1A] rounded-md p-6 text-white`}>
                                <div className="text-center">
                                    <LuStar className="w-8 h-8 mx-auto mb-3" />
                                    <h4 className="font-display font-bold text-lg mb-2">
                                        {currentPhase.completionPercentage >= 100 
                                            ? "Phase Complete! 🎉" 
                                            : currentPhase.completionPercentage >= 50 
                                                ? "You're halfway there!" 
                                                : "Every expert was once a beginner"
                                        }
                                    </h4>
                                    <p className="text-white/90 text-sm font-bold">
                                        {currentPhase.completionPercentage >= 100 
                                            ? "Congratulations on mastering this phase. Ready for the next challenge?" 
                                            : "Take it one question at a time. You've got this!"
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PhaseOverviewPage;
