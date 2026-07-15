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
                <div className="flex flex-col items-center justify-center h-screen font-body bg-cream dark:bg-navy">
                    <SpinnerLoader />
                    <p className="text-charcoal dark:text-cream mt-4 text-center font-bold font-mono text-xs uppercase tracking-widest">
                        Preparing phase diagnostics... ✨
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    if (!currentPhase) {
        return (
            <DashboardLayout>
                <div className="text-center py-20 font-body bg-white dark:bg-navy-light border-4 border-charcoal dark:border-cream/40 rounded-sm shadow-[8px_8px_0px_0px_var(--color-shadow)] max-w-xl mx-auto my-12">
                    <div className="w-16 h-16 bg-charcoal dark:bg-cream rounded-sm flex items-center justify-center mx-auto mb-6 shadow-[3px_3px_0px_0px_var(--color-shadow)]">
                        <LuTarget className="w-8 h-8 text-white dark:text-navy" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide">Phase Not Found</h2>
                    <p className="text-charcoal/60 dark:text-cream/60 mb-6">
                        The requested phase could not be found.
                    </p>
                    <button
                        onClick={() => navigate(`/roadmap?role=${encodeURIComponent(role)}`)}
                        className="px-5 py-2.5 bg-charcoal text-white dark:bg-cream dark:text-navy font-bold uppercase tracking-widest text-xs rounded-sm border-3 border-charcoal dark:border-cream/40 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                    >
                        Back to Roadmap
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-cream dark:bg-navy font-body transition-colors duration-300">
                {/* Hero Header */}
                <div className="bg-cream dark:bg-navy text-charcoal dark:text-cream border-b-4 border-charcoal/15 dark:border-cream/20">
                    <div className="container mx-auto px-4 md:px-6 py-10 max-w-5xl">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-charcoal/60 dark:text-cream/60 text-xs font-mono font-bold uppercase tracking-wider mb-6">
                            <button
                                onClick={() => navigate(`/roadmap?role=${encodeURIComponent(role)}`)}
                                className="hover:text-charcoal dark:hover:text-cream hover:underline transition-colors"
                            >
                                {role}
                            </button>
                            <LuChevronRight className="w-4 h-4 text-charcoal/45" strokeWidth={3} />
                            <span className="text-charcoal dark:text-cream">Phase {currentPhase.order}</span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 uppercase tracking-wider">
                                    {currentPhase.name}
                                </h1>
                                <p className="text-sm text-charcoal/70 dark:text-cream/70 mb-6 leading-relaxed max-w-md">
                                    {currentPhase.description}
                                </p>
                                
                                {/* Phase Stats */}
                                <div className="grid grid-cols-2 gap-4 max-w-sm">
                                    <div className="bg-white dark:bg-navy-light text-charcoal dark:text-cream border-3 border-charcoal dark:border-cream/40 rounded-sm p-4 shadow-[3px_3px_0px_0px_var(--color-shadow)]">
                                        <div className="flex items-center gap-2 mb-2 font-mono text-[10px] uppercase tracking-wider text-charcoal/50 dark:text-cream/50 font-bold">
                                            <LuBookOpen className="w-4 h-4" />
                                            <span>Sessions</span>
                                        </div>
                                        <div className="text-2xl font-mono font-bold">{currentPhase.sessionsCount}</div>
                                    </div>
                                    <div className="bg-white dark:bg-navy-light text-charcoal dark:text-cream border-3 border-charcoal dark:border-cream/40 rounded-sm p-4 shadow-[3px_3px_0px_0px_var(--color-shadow)]">
                                        <div className="flex items-center gap-2 mb-2 font-mono text-[10px] uppercase tracking-wider text-charcoal/50 dark:text-cream/50 font-bold">
                                            <LuTarget className="w-4 h-4" />
                                            <span>Questions</span>
                                        </div>
                                        <div className="text-2xl font-mono font-bold">{currentPhase.totalQuestions}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:text-right">
                                {/* Progress Circle */}
                                <div className="inline-flex flex-col items-center">
                                    <div className="relative w-32 h-32 mb-4 bg-white dark:bg-navy-light border-3 border-charcoal dark:border-cream/40 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_var(--color-shadow)]">
                                        <svg className="w-[110px] h-[110px] transform -rotate-90" viewBox="0 0 100 100">
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                stroke="rgba(26,26,26,0.08)"
                                                strokeWidth="10"
                                                fill="none"
                                            />
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                stroke="var(--color-text)"
                                                strokeWidth="10"
                                                fill="none"
                                                strokeDasharray={`${2.51 * currentPhase.completionPercentage} 251.2`}
                                                strokeLinecap="round"
                                                className="transition-all duration-1000 ease-out"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-2xl font-mono font-bold text-charcoal dark:text-cream">
                                                    {currentPhase.completionPercentage}%
                                                </div>
                                                <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal/40 dark:text-cream/40">Done</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-charcoal/60 dark:text-cream/60 font-mono text-[10px] font-bold uppercase tracking-widest">
                                        <LuCalendar className="w-3.5 h-3.5" />
                                        <span>{currentPhase.estimatedDays} days est.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Key Topics */}
                            <div className="card-editorial p-6 sm:p-8 bg-white dark:bg-navy-light">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-9 h-9 bg-charcoal dark:bg-cream rounded-sm flex items-center justify-center border-2 border-charcoal shadow-[2px_2px_0px_0px_var(--color-shadow)]`}>
                                        <LuBrain className="w-5 h-5 text-white dark:text-navy" strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide">Key Topics</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentPhase.topics.map((topic, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-4 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm shadow-[3px_3px_0px_0px_var(--color-shadow)]"
                                        >
                                            <div className="w-8 h-8 bg-charcoal dark:bg-cream rounded-sm flex items-center justify-center shrink-0">
                                                <span className="text-white dark:text-navy font-bold text-sm font-mono">{index + 1}</span>
                                            </div>
                                            <span className="font-bold text-charcoal dark:text-cream text-sm leading-tight">{topic}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Session Templates */}
                            {sessionTemplates.length > 0 ? (
                                <div className="card-editorial p-6 sm:p-8 bg-white dark:bg-navy-light">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`w-9 h-9 bg-charcoal dark:bg-cream rounded-sm flex items-center justify-center border-2 border-charcoal shadow-[2px_2px_0px_0px_var(--color-shadow)]`}>
                                            <LuRocket className="w-5 h-5 text-white dark:text-navy" strokeWidth={2.5} />
                                        </div>
                                        <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide">Sessions ({sessionTemplates.length})</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {sessionTemplates.map((template) => (
                                            <div
                                                key={template._id}
                                                className="bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm p-6 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-shadow)] flex flex-col justify-between"
                                            >
                                                <div>
                                                    <h3 className="font-display font-bold text-charcoal dark:text-cream text-lg mb-2 truncate">
                                                        {template.role}
                                                    </h3>
                                                    <p className="text-xs text-charcoal/60 dark:text-cream/60 mb-4 line-clamp-2 leading-relaxed font-body">
                                                        {template.description}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                                        {template.topicsToFocus.slice(0, 2).map((topic, i) => (
                                                            <span key={i} className="text-[10px] bg-white dark:bg-navy-light border-2 border-charcoal/15 dark:border-cream/20 text-charcoal dark:text-cream font-mono font-bold px-2 py-0.5 rounded-sm">
                                                                {topic}
                                                            </span>
                                                        ))}
                                                        {template.topicsToFocus.length > 2 && (
                                                            <span className="text-[10px] bg-white dark:bg-navy-light border-2 border-charcoal/15 dark:border-cream/20 text-charcoal/50 dark:text-cream/50 font-mono font-bold px-2 py-0.5 rounded-sm">
                                                                +{template.topicsToFocus.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-wider mb-4 border-t-2 border-dashed border-charcoal/10 dark:border-cream/10 pt-3">
                                                        <span className="flex items-center gap-1">
                                                            <LuTarget className="w-3.5 h-3.5" />
                                                            {template.questions?.length || 5} Qs
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <LuClock className="w-3.5 h-3.5" />
                                                            {template.experience} Years
                                                        </span>
                                                    </div>
                                                    
                                                    {template.isStarted ? (
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between text-xs font-mono font-bold">
                                                                <span className="text-charcoal/50 dark:text-cream/50">Done</span>
                                                                <span className="text-charcoal dark:text-cream">{template.completionPercentage}%</span>
                                                            </div>
                                                            <div className="w-full bg-white dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 rounded-sm h-2.5">
                                                                <div 
                                                                    className="bg-charcoal dark:bg-cream h-full rounded-sm transition-all duration-300"
                                                                    style={{ width: `${template.completionPercentage}%` }}
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={() => navigate(`/roadmap-session/${template.sessionId}?fromPhase=${phaseId}&role=${encodeURIComponent(role)}`)}
                                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-navy-light text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 font-mono font-bold uppercase tracking-wider text-[10px] rounded-sm hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 cursor-pointer"
                                                            >
                                                                <LuPlay className="w-3.5 h-3.5" strokeWidth={3} />
                                                                {template.completionPercentage === 100 ? 'Review Practice' : 'Continue Practice'}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleStartSession(template)}
                                                            disabled={creatingSession === template._id}
                                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-charcoal text-white dark:bg-cream dark:text-navy border-2 border-charcoal dark:border-cream/40 font-mono font-bold uppercase tracking-wider text-[10px] rounded-sm hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                        >
                                                            {creatingSession === template._id ? (
                                                                <>
                                                                    <div className="w-3 h-3 border-2 border-white dark:border-navy border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
                                                                    <span>Analyzing...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <LuRocket className="w-3.5 h-3.5" strokeWidth={3} />
                                                                    <span>Start Practice</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="card-editorial p-8 bg-white dark:bg-navy-light text-center py-12">
                                    <p className="text-charcoal/50 dark:text-cream/50 font-bold font-mono text-xs uppercase tracking-wider">No sessions initialized for this phase.</p>
                                </div>
                            )}
                        </div>

                        {/* Action Sidebar */}
                        <div className="space-y-6">
                            {/* Action Buttons */}
                            <div className="card-editorial p-6 bg-white dark:bg-navy-light">
                                <h3 className="text-xl font-display font-bold text-charcoal dark:text-cream mb-4 uppercase tracking-wider border-b-2 border-charcoal/10 pb-2">Options</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleBrowseSessions}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 font-mono font-bold uppercase tracking-widest text-[10px] rounded-sm text-charcoal dark:text-cream bg-white dark:bg-navy-light border-3 border-charcoal dark:border-cream/40 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 cursor-pointer"
                                    >
                                        <LuBookOpen className="w-4 h-4" strokeWidth={2.5} />
                                        <span>Browse Sessions</span>
                                    </button>

                                    {currentPhase.completionPercentage >= 70 && (
                                        <button
                                            onClick={handleStartPhaseQuiz}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 font-mono font-bold uppercase tracking-widest text-[10px] rounded-sm text-white dark:text-navy bg-charcoal dark:bg-cream border-3 border-charcoal dark:border-cream/40 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 cursor-pointer"
                                        >
                                            <LuAward className="w-4 h-4" strokeWidth={2.5} />
                                            <span>Take Phase Quiz</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Progress Summary */}
                            <div className="card-editorial p-6 bg-white dark:bg-navy-light font-mono">
                                <h3 className="text-xl font-display font-bold text-charcoal dark:text-cream mb-4 uppercase tracking-wider border-b-2 border-charcoal/10 pb-2 font-sans">Metrics</h3>
                                <div className="space-y-3 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-charcoal/50 dark:text-cream/50 uppercase font-bold">Mastery</span>
                                        <span className="font-bold text-charcoal dark:text-cream">{currentPhase.masteredQuestions}/{currentPhase.totalQuestions}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-charcoal/50 dark:text-cream/50 uppercase font-bold">Active</span>
                                        <span className="font-bold text-charcoal dark:text-cream">{currentPhase.sessionsCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-charcoal/50 dark:text-cream/50 uppercase font-bold">Est. Time</span>
                                        <span className="font-bold text-charcoal dark:text-cream">{currentPhase.estimatedDays} days</span>
                                    </div>
                                </div>
                            </div>

                            {/* Motivational Message */}
                            <div className="bg-cream dark:bg-navy-light border-3 border-charcoal dark:border-cream/40 shadow-[4px_4px_0px_0px_var(--color-shadow)] rounded-sm p-6 text-charcoal dark:text-cream">
                                <div className="text-center">
                                    <LuStar className="w-7 h-7 mx-auto mb-3 text-charcoal/60 dark:text-cream/60" strokeWidth={2.5} />
                                    <h4 className="font-display font-bold text-lg mb-2">
                                        {currentPhase.completionPercentage >= 100 
                                            ? "Phase Complete! 🎉" 
                                            : currentPhase.completionPercentage >= 50 
                                                ? "Halfway completed!" 
                                                : "Begin the challenge"
                                        }
                                    </h4>
                                    <p className="text-xs text-charcoal/70 dark:text-cream/70 leading-relaxed font-body">
                                        {currentPhase.completionPercentage >= 100 
                                            ? "Congratulations on mastering this phase. Ready for the next milestone?" 
                                            : "Take it one step at a time. Every code block solved gets you closer!"
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
