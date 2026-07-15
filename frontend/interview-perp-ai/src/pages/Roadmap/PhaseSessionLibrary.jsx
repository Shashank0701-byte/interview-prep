import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
import { 
    LuSearch, 
    LuChevronRight, 
    LuArrowLeft, 
    LuBookOpen,
    LuCode,
    LuSettings,
    LuMessageSquare,
    LuBrain,
    LuCheck,
    LuPlay,
    LuTarget,
    LuTrendingUp,
    LuCalendar,
    LuClock,
    LuRocket
} from 'react-icons/lu';

const getStatusIcon = (completionPercentage) => {
    if (completionPercentage >= 100) {
        return <LuCheck className="w-4 h-4 text-emerald-500" strokeWidth={3} />;
    } else if (completionPercentage > 0) {
        return <LuPlay className="w-4 h-4 text-blue-500 animate-pulse" strokeWidth={3} />;
    } else {
        return <LuTarget className="w-4 h-4 text-charcoal/40 dark:text-cream/40" strokeWidth={3} />;
    }
};

const getStatusBadge = (completionPercentage) => {
    if (completionPercentage >= 100) {
        return <span className="px-2 py-0.5 border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider rounded-sm">Completed</span>;
    } else if (completionPercentage > 0) {
        return <span className="px-2 py-0.5 border-2 border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold uppercase tracking-wider rounded-sm">In Progress</span>;
    } else {
        return <span className="px-2 py-0.5 border-2 border-charcoal/20 dark:border-cream/20 bg-cream dark:bg-navy text-charcoal/50 dark:text-cream/50 text-[10px] font-mono font-bold uppercase tracking-wider rounded-sm">Not Started</span>;
    }
};

const getDifficultyBadge = (experience) => {
    if (experience <= 2) {
        return <span className="px-2.5 py-0.5 border-2 border-green-500 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-mono font-bold uppercase tracking-wider rounded-sm">Easy</span>;
    } else if (experience <= 5) {
        return <span className="px-2.5 py-0.5 border-2 border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider rounded-sm">Medium</span>;
    } else {
        return <span className="px-2.5 py-0.5 border-2 border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider rounded-sm">Hard</span>;
    }
};

const getTypeIcon = (topics) => {
    let topicStr = '';
    if (topics && Array.isArray(topics)) {
        topicStr = topics.join(' ').toLowerCase();
    } else if (typeof topics === 'string') {
        topicStr = topics.toLowerCase();
    }
    
    if (topicStr.includes('algorithm') || topicStr.includes('data structure') || topicStr.includes('coding')) {
        return <LuCode className="w-4 h-4 text-charcoal dark:text-cream" strokeWidth={2.5} />;
    } else if (topicStr.includes('system') || topicStr.includes('design')) {
        return <LuSettings className="w-4 h-4 text-charcoal dark:text-cream" strokeWidth={2.5} />;
    } else if (topicStr.includes('behavioral') || topicStr.includes('leadership')) {
        return <LuMessageSquare className="w-4 h-4 text-charcoal dark:text-cream" strokeWidth={2.5} />;
    }
    return <LuBrain className="w-4 h-4 text-charcoal dark:text-cream" strokeWidth={2.5} />;
};

const PhaseSessionLibrary = () => {
    const { role, phaseId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [currentPhase, setCurrentPhase] = useState(null);
    const [allSessions, setAllSessions] = useState([]);
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    const handleStartTemplate = async (template) => {
        try {
            setIsLoading(true);
            
            // Create a roadmap session from the template
            const sessionData = {
                role: template.role,
                experience: template.experience,
                topicsToFocus: template.topicsToFocus.join(', '),
                description: template.description,
                phaseId: phaseId,
                phaseName: currentPhase?.name,
                phaseColor: currentPhase?.color,
                roadmapRole: role
            };
            
            const response = await axiosInstance.post(API_PATHS.ROADMAP_SESSIONS.CREATE, sessionData);
            
            if (response.data.success) {
                // Navigate directly to the practice session
                navigate(`/roadmap-session/${response.data.session._id}?fromPhase=${phaseId}&role=${encodeURIComponent(role)}`);
            }
        } catch (error) {
            console.error("Failed to start template session:", error);
            // Refresh the page to show updated sessions
            fetchPhaseAndSessions();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        applyFilters();
    }, [allSessions, searchTerm, selectedTopic, selectedDifficulty, selectedType, selectedStatus, currentPhase]);

    useEffect(() => {
        fetchPhaseAndSessions();
    }, [role, phaseId]);

    const fetchPhaseAndSessions = async () => {
        try {
            // Fetch roadmap to get phase details
            const roadmapResponse = await axiosInstance.get(API_PATHS.ROADMAP.GENERATE(role));
            const phase = roadmapResponse.data.phases.find(p => p.id === phaseId);
            setCurrentPhase(phase);

            // Fetch roadmap sessions for this specific phase
            const sessionUrl = API_PATHS.ROADMAP_SESSIONS.GET_PHASE_SESSIONS(role, phaseId);
            const sessionsResponse = await axiosInstance.get(sessionUrl);
            
            let userSessions = [];
            if (Array.isArray(sessionsResponse.data)) {
                userSessions = sessionsResponse.data;
            } else if (sessionsResponse.data.sessions && Array.isArray(sessionsResponse.data.sessions)) {
                userSessions = sessionsResponse.data.sessions;
            } else if (sessionsResponse.data.data && Array.isArray(sessionsResponse.data.data)) {
                userSessions = sessionsResponse.data.data;
            }
            
            const phaseSessions = userSessions.map(session => ({
                ...session,
                isRelevant: true,
                isRoadmapSession: true,
                isTemplate: !session.isStarted, // Templates that haven't been started yet
                isUserSession: session.isStarted // Only started sessions are user sessions
            }));
            
            setAllSessions(phaseSessions);
        } catch (error) {
            console.error("Failed to fetch phase and sessions", error);
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...allSessions];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(session => {
                const roleMatch = session.role?.toLowerCase().includes(searchTerm.toLowerCase());
                const topicMatch = session.topicsToFocus && Array.isArray(session.topicsToFocus) 
                    ? session.topicsToFocus.some(topic => 
                        topic && typeof topic === 'string' && topic.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    : false;
                return roleMatch || topicMatch;
            });
        }

        // Topic filter
        if (selectedTopic !== 'all' && currentPhase) {
            filtered = filtered.filter(session => {
                return session.topicsToFocus && Array.isArray(session.topicsToFocus)
                    ? session.topicsToFocus.some(topic => 
                        topic && typeof topic === 'string' && topic.toLowerCase().includes(selectedTopic.toLowerCase())
                    )
                    : false;
            });
        }

        // Difficulty filter (based on experience level)
        if (selectedDifficulty !== 'all') {
            filtered = filtered.filter(session => {
                const experience = session.experience || 0;
                switch (selectedDifficulty) {
                    case 'easy':
                        return experience <= 2;
                    case 'medium':
                        return experience > 2 && experience <= 5;
                    case 'hard':
                        return experience > 5;
                    default:
                        return true;
                }
            });
        }

        // Type filter (based on topics)
        if (selectedType !== 'all') {
            filtered = filtered.filter(session => {
                const topics = session.topicsToFocus && Array.isArray(session.topicsToFocus) ? session.topicsToFocus : [];
                switch (selectedType) {
                    case 'coding':
                        return topics.some(topic => 
                            topic && typeof topic === 'string' && (
                                topic.toLowerCase().includes('algorithm') ||
                                topic.toLowerCase().includes('data structure') ||
                                topic.toLowerCase().includes('coding')
                            )
                        );
                    case 'system':
                        return topics.some(topic => 
                            topic && typeof topic === 'string' && (
                                topic.toLowerCase().includes('system') ||
                                topic.toLowerCase().includes('design') ||
                                topic.toLowerCase().includes('architecture')
                            )
                        );
                    case 'behavioral':
                        return topics.some(topic => 
                            topic && typeof topic === 'string' && (
                                topic.toLowerCase().includes('behavioral') ||
                                topic.toLowerCase().includes('leadership') ||
                                topic.toLowerCase().includes('communication')
                            )
                        );
                    default:
                        return true;
                }
            });
        }

        // Status filter
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(session => {
                const completion = session.completionPercentage || 0;
                switch (selectedStatus) {
                    case 'recommended':
                        return session.isRelevant === true;
                    case 'not_started':
                        return completion === 0;
                    case 'in_progress':
                        return completion > 0 && completion < 100;
                    case 'completed':
                        return completion >= 100;
                    default:
                        return true;
                }
            });
        }

        setFilteredSessions(filtered);
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-screen bg-cream dark:bg-navy font-body">
                    <SpinnerLoader />
                    <p className="text-charcoal dark:text-cream mt-4 text-center font-bold font-mono text-xs uppercase tracking-widest">
                        Loading library sessions... ✨
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    if (!currentPhase) {
        return (
            <DashboardLayout>
                <div className="text-center py-20 bg-white dark:bg-navy-light border-4 border-charcoal dark:border-cream/40 rounded-sm shadow-[8px_8px_0px_0px_var(--color-shadow)] max-w-xl mx-auto my-12 font-body">
                    <div className="w-16 h-16 bg-charcoal dark:bg-cream rounded-sm flex items-center justify-center mx-auto mb-6 shadow-[3px_3px_0px_0px_var(--color-shadow)]">
                        <LuBookOpen className="w-8 h-8 text-white dark:text-navy" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide">Phase Not Found</h2>
                    <p className="text-charcoal/65 dark:text-cream/65 mb-6">
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
                {/* Header */}
                <div className="bg-cream dark:bg-navy text-charcoal dark:text-cream border-b-4 border-charcoal/15 dark:border-cream/20">
                    <div className="container mx-auto px-4 md:px-6 py-10 max-w-6xl">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-charcoal/60 dark:text-cream/60 text-xs font-mono font-bold uppercase tracking-wider mb-6">
                            <button
                                onClick={() => navigate(`/roadmap?role=${encodeURIComponent(role)}`)}
                                className="hover:text-charcoal dark:hover:text-cream hover:underline transition-colors cursor-pointer"
                            >
                                {role}
                            </button>
                            <LuChevronRight className="w-4 h-4 text-charcoal/45" strokeWidth={3} />
                            <button
                                onClick={() => navigate(`/phase/${encodeURIComponent(role)}/${phaseId}`)}
                                className="hover:text-charcoal dark:hover:text-cream hover:underline transition-colors cursor-pointer"
                            >
                                {currentPhase.name}
                            </button>
                            <LuChevronRight className="w-4 h-4 text-charcoal/45" strokeWidth={3} />
                            <span className="text-charcoal dark:text-cream">Session Library</span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-wider leading-tight">
                                    {currentPhase.name} Sessions
                                </h1>
                                <p className="text-sm text-charcoal/70 dark:text-cream/70 mt-1.5 font-bold">
                                    {filteredSessions.length} sessions available • {filteredSessions.filter(s => s.isRelevant).length} recommended
                                </p>
                            </div>
                            
                            <button
                                onClick={() => navigate(`/phase/${encodeURIComponent(role)}/${phaseId}`)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-navy-light text-charcoal dark:text-cream font-mono font-bold uppercase tracking-widest text-[10px] rounded-sm border-3 border-charcoal dark:border-cream/40 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)]"
                            >
                                <LuArrowLeft className="w-3.5 h-3.5" strokeWidth={3} />
                                <span>Back to Phase</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
                    {/* Filters */}
                    <div className="card-editorial p-6 mb-8 bg-white dark:bg-navy-light">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 font-bold text-charcoal dark:text-cream">
                            {/* Search */}
                            <div className="lg:col-span-2">
                                <div className="relative">
                                    <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/50 dark:text-cream/50 w-4 h-4" strokeWidth={3} />
                                    <input
                                        type="text"
                                        placeholder="Search sessions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border-2 border-charcoal dark:border-cream/40 rounded-sm outline-none focus:ring-0 text-charcoal dark:text-cream bg-cream dark:bg-navy text-xs font-mono font-bold focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
                                    />
                                </div>
                            </div>

                            {/* Topic Filter */}
                            <div>
                                <select
                                    value={selectedTopic}
                                    onChange={(e) => setSelectedTopic(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-charcoal dark:border-cream/40 rounded-sm outline-none focus:ring-0 text-charcoal dark:text-cream bg-cream dark:bg-navy text-xs font-mono font-bold cursor-pointer focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
                                >
                                    <option value="all">All Topics</option>
                                    {currentPhase.topics.map(topic => (
                                        <option key={topic} value={topic}>{topic}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Difficulty Filter */}
                            <div>
                                <select
                                    value={selectedDifficulty}
                                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-charcoal dark:border-cream/40 rounded-sm outline-none focus:ring-0 text-charcoal dark:text-cream bg-cream dark:bg-navy text-xs font-mono font-bold cursor-pointer focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
                                >
                                    <option value="all">All Levels</option>
                                    <option value="easy">Easy (0-2y)</option>
                                    <option value="medium">Medium (3-5y)</option>
                                    <option value="hard">Hard (5y+)</option>
                                </select>
                            </div>

                            {/* Type Filter */}
                            <div>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-charcoal dark:border-cream/40 rounded-sm outline-none focus:ring-0 text-charcoal dark:text-cream bg-cream dark:bg-navy text-xs font-mono font-bold cursor-pointer focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
                                >
                                    <option value="all">All Types</option>
                                    <option value="coding">Coding</option>
                                    <option value="system">System Design</option>
                                    <option value="behavioral">Behavioral</option>
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-charcoal dark:border-cream/40 rounded-sm outline-none focus:ring-0 text-charcoal dark:text-cream bg-cream dark:bg-navy text-xs font-mono font-bold cursor-pointer focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
                                >
                                    <option value="all">All Status</option>
                                    <option value="recommended">Recommended</option>
                                    <option value="not_started">Not Started</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Sessions Grid */}
                    {filteredSessions.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-navy-light border-4 border-charcoal dark:border-cream/40 rounded-sm shadow-[8px_8px_0px_0px_var(--color-shadow)] max-w-xl mx-auto">
                            <div className="w-16 h-16 bg-charcoal dark:bg-cream rounded-sm flex items-center justify-center mx-auto mb-6 shadow-[3px_3px_0px_0px_var(--color-shadow)]">
                                <LuBookOpen className="w-8 h-8 text-white dark:text-navy" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide">No Sessions Found</h3>
                            <p className="text-charcoal/60 dark:text-cream/60 mb-6 font-body text-sm max-w-xs mx-auto leading-relaxed">
                                {allSessions.length === 0 
                                    ? "No sessions available for this phase yet."
                                    : "No sessions match your active filters. Try adjusting search queries."
                                }
                            </p>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-5 py-2.5 bg-charcoal text-white dark:bg-cream dark:text-navy font-bold uppercase tracking-widest text-xs border-3 border-charcoal dark:border-cream/40 rounded-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                            >
                                Create Custom Session
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSessions.map((session) => (
                                <div
                                    key={session._id}
                                    className="bg-white dark:bg-navy-light border-4 border-charcoal dark:border-cream/40 rounded-sm p-6 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_var(--color-shadow)] shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all duration-300 group flex flex-col justify-between min-h-[300px]"
                                >
                                    <div>
                                        {/* Session Header */}
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 border-2 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy rounded-sm flex items-center justify-center shadow-[2px_2px_0px_0px_var(--color-shadow)] flex-shrink-0">
                                                    {getTypeIcon(session.topicsToFocus)}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-display font-bold text-charcoal dark:text-cream group-hover:text-charcoal/80 dark:group-hover:text-cream/80 transition-colors truncate">
                                                        {session.role}
                                                    </h3>
                                                    <p className="text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 mt-0.5">
                                                        {session.experience} years experience
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 mt-1">
                                                {getStatusIcon(session.completionPercentage)}
                                            </div>
                                        </div>

                                        {/* Topics */}
                                        <div className="mb-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {session.topicsToFocus ? (
                                                    (() => {
                                                        const topics = Array.isArray(session.topicsToFocus) 
                                                            ? session.topicsToFocus 
                                                            : session.topicsToFocus.split(',').map(t => t.trim()).filter(t => t);
                                                        
                                                        return topics.length > 0 ? (
                                                            <>
                                                                {topics.slice(0, 2).map((topic, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className="px-2 py-0.5 bg-cream dark:bg-navy border-2 border-charcoal/15 dark:border-cream/20 text-charcoal dark:text-cream text-[10px] font-mono font-bold rounded-sm"
                                                                    >
                                                                        {topic}
                                                                    </span>
                                                                ))}
                                                                {topics.length > 2 && (
                                                                    <span className="px-2 py-0.5 bg-cream dark:bg-navy border-2 border-charcoal/15 dark:border-cream/20 text-charcoal/50 dark:text-cream/50 text-[10px] font-mono font-bold rounded-sm">
                                                                        +{topics.length - 2}
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="px-2 py-0.5 bg-cream dark:bg-navy border border-charcoal/20 dark:border-cream/20 text-charcoal/80 dark:text-cream/80 text-[10px] font-mono font-bold rounded-sm">
                                                                General
                                                            </span>
                                                        );
                                                    })()
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-cream dark:bg-navy border border-charcoal/20 dark:border-cream/20 text-charcoal/80 dark:text-cream/80 text-[10px] font-mono font-bold rounded-sm">
                                                        General
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="text-center p-2.5 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                                <LuTarget className="w-3.5 h-3.5 text-charcoal/50 dark:text-cream/50 mx-auto mb-1" />
                                                <div className="text-sm font-mono font-bold text-charcoal dark:text-cream">{session.questions?.length || 0}</div>
                                                <div className="text-[9px] text-charcoal/50 dark:text-cream/50 font-bold uppercase tracking-wider font-mono">Questions</div>
                                            </div>
                                            <div className="text-center p-2.5 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                                <LuTrendingUp className="w-3.5 h-3.5 text-charcoal/50 dark:text-cream/50 mx-auto mb-1" />
                                                <div className="text-sm font-mono font-bold text-charcoal dark:text-cream">{session.completionPercentage || 0}%</div>
                                                <div className="text-[9px] text-charcoal/50 dark:text-cream/50 font-bold uppercase tracking-wider font-mono">Complete</div>
                                            </div>
                                        </div>

                                        {/* Badges */}
                                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                            <div className="flex items-center gap-1.5">
                                                {getDifficultyBadge(session.experience)}
                                                {session.isTemplate && (
                                                    <span className="px-2.5 py-0.5 border-2 border-charcoal bg-charcoal text-white dark:border-cream dark:bg-cream dark:text-navy text-[10px] font-mono font-bold uppercase tracking-wider rounded-sm">
                                                        Template
                                                    </span>
                                                )}
                                                {session.isRelevant && !session.isTemplate && (
                                                    <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-sm border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream">
                                                        {session.isRoadmapSession ? 'Roadmap' : 'Custom'}
                                                    </span>
                                                )}
                                            </div>
                                            {getStatusBadge(session.completionPercentage)}
                                        </div>
                                    </div>

                                    <div>
                                        {/* Description for templates or Created Date for user sessions */}
                                        {session.isTemplate ? (
                                            <div className="mb-4 text-xs text-charcoal/70 dark:text-cream/70 font-bold leading-normal">
                                                {session.description}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-charcoal/50 dark:text-cream/50 mb-4 uppercase tracking-wider">
                                                <LuCalendar className="w-3.5 h-3.5" />
                                                <span>Created {new Date(session.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        )}

                                        {/* Action Button */}
                                        {session.isTemplate ? (
                                            <button
                                                onClick={() => handleStartTemplate(session)}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-charcoal text-white dark:bg-cream dark:text-navy border-3 border-charcoal dark:border-cream/40 font-mono font-bold uppercase tracking-widest text-[10px] rounded-sm hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 cursor-pointer"
                                            >
                                                <LuPlay className="w-3.5 h-3.5" strokeWidth={3} />
                                                <span>Start Session</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    // Navigate to roadmap session practice for roadmap sessions, regular interview prep for others
                                                    if (session.isRoadmapSession) {
                                                        navigate(`/roadmap-session/${session.sessionId}?fromPhase=${phaseId}&role=${encodeURIComponent(role)}`);
                                                    } else {
                                                        navigate(`/interview-prep/${session.sessionId}?fromPhase=${phaseId}&role=${encodeURIComponent(role)}`);
                                                    }
                                                }}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-navy-light text-charcoal dark:text-cream border-3 border-charcoal dark:border-cream/40 font-mono font-bold uppercase tracking-widest text-[10px] rounded-sm hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 cursor-pointer"
                                            >
                                                <LuPlay className="w-3.5 h-3.5" strokeWidth={3} />
                                                <span>
                                                    {session.completionPercentage >= 100 
                                                        ? 'Review Practice' 
                                                        : 'Continue Practice'
                                                    }
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PhaseSessionLibrary;
