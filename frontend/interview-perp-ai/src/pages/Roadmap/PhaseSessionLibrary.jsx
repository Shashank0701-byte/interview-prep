import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
import { 
    LuSearch, 
    LuFilter, 
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
    LuUsers,
    LuStar,
    LuRocket
} from 'react-icons/lu';

// Helper functions outside component
const getPhaseColor = (color) => {
    const colors = {
        blue: 'from-blue-500 to-cyan-500',
        purple: 'from-purple-500 to-indigo-500',
        emerald: 'from-emerald-500 to-teal-500',
        orange: 'from-orange-500 to-red-500',
    };
    return colors[color] || 'from-gray-500 to-gray-600';
};

const getStatusIcon = (completionPercentage) => {
    if (completionPercentage >= 100) {
        return <LuCheck className="w-4 h-4 text-emerald-500" />;
    } else if (completionPercentage > 0) {
        return <LuPlay className="w-4 h-4 text-blue-500" />;
    } else {
        return <LuTarget className="w-4 h-4 text-gray-400" />;
    }
};

const getStatusBadge = (completionPercentage) => {
    if (completionPercentage >= 100) {
        return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Completed</span>;
    } else if (completionPercentage > 0) {
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">In Progress</span>;
    } else {
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Not Started</span>;
    }
};

const getDifficultyBadge = (experience) => {
    if (experience <= 2) {
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Easy</span>;
    } else if (experience <= 5) {
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Medium</span>;
    } else {
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Hard</span>;
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
        return <LuCode className="w-4 h-4 text-blue-500" />;
    } else if (topicStr.includes('system') || topicStr.includes('design')) {
        return <LuSettings className="w-4 h-4 text-purple-500" />;
    } else if (topicStr.includes('behavioral') || topicStr.includes('leadership')) {
        return <LuMessageSquare className="w-4 h-4 text-emerald-500" />;
    }
    return <LuBrain className="w-4 h-4 text-gray-500" />;
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

    // Generate phase-specific session templates
    const generatePhaseSessionTemplates = (phase, role) => {
        const sessionTemplates = {
            'Foundation': [
                {
                    _id: 'template-big-o',
                    role: 'Big O Notation Fundamentals',
                    experience: 1,
                    topicsToFocus: ['Big O Notation', 'Time Complexity', 'Space Complexity'],
                    completionPercentage: 0,
                    status: 'Available',
                    questions: Array(12).fill({}),
                    masteredQuestions: 0,
                    createdAt: new Date().toISOString(),
                    isTemplate: true,
                    isRelevant: true,
                    description: 'Master the fundamentals of algorithm analysis and complexity'
                },
                {
                    _id: 'template-arrays',
                    role: 'Arrays & Strings Basics',
                    experience: 1,
                    topicsToFocus: ['Arrays', 'Strings', 'Two Pointers'],
                    completionPercentage: 0,
                    status: 'Available',
                    questions: Array(15).fill({}),
                    masteredQuestions: 0,
                    createdAt: new Date().toISOString(),
                    isTemplate: true,
                    isRelevant: true,
                    description: 'Essential array and string manipulation techniques'
                },
                {
                    _id: 'template-linked-lists',
                    role: 'Linked Lists Introduction',
                    experience: 1,
                    topicsToFocus: ['Linked Lists', 'Pointers', 'Node Manipulation'],
                    completionPercentage: 0,
                    status: 'Available',
                    questions: Array(10).fill({}),
                    masteredQuestions: 0,
                    createdAt: new Date().toISOString(),
                    isTemplate: true,
                    isRelevant: true,
                    description: 'Understanding linked data structures and pointer manipulation'
                },
                {
                    _id: 'template-stacks-queues',
                    role: 'Stacks & Queues Fundamentals',
                    experience: 1,
                    topicsToFocus: ['Stacks', 'Queues', 'LIFO', 'FIFO'],
                    completionPercentage: 0,
                    status: 'Available',
                    questions: Array(8).fill({}),
                    masteredQuestions: 0,
                    createdAt: new Date().toISOString(),
                    isTemplate: true,
                    isRelevant: true,
                    description: 'Master stack and queue data structures'
                },
                {
                    _id: 'template-basic-sorting',
                    role: 'Basic Sorting Algorithms',
                    experience: 2,
                    topicsToFocus: ['Bubble Sort', 'Selection Sort', 'Insertion Sort'],
                    completionPercentage: 0,
                    status: 'Available',
                    questions: Array(6).fill({}),
                    masteredQuestions: 0,
                    createdAt: new Date().toISOString(),
                    isTemplate: true,
                    isRelevant: true,
                    description: 'Introduction to fundamental sorting techniques'
                }
            ],
            'Problem Solving': [
                {
                    _id: 'template-advanced-arrays',
                    role: 'Advanced Array Techniques',
                    experience: 3,
                    topicsToFocus: ['Sliding Window', 'Prefix Sum', 'Kadane Algorithm'],
                    completionPercentage: 0,
                    status: 'Available',
                    questions: Array(18).fill({}),
                    masteredQuestions: 0,
                    createdAt: new Date().toISOString(),
                    isTemplate: true,
                    isRelevant: true,
                    description: 'Advanced array manipulation and optimization techniques'
                },
                {
                    _id: 'template-trees',
                    role: 'Binary Trees & BST',
                    experience: 3,
                    topicsToFocus: ['Binary Trees', 'BST', 'Tree Traversal'],
                    completionPercentage: 0,
                    status: 'Available',
                    questions: Array(20).fill({}),
                    masteredQuestions: 0,
                    createdAt: new Date().toISOString(),
                    isTemplate: true,
                    isRelevant: true,
                    description: 'Master tree data structures and traversal algorithms'
                },
                {
                    _id: 'template-graphs',
                    role: 'Graph Algorithms',
                    experience: 4,
                    topicsToFocus: ['Graphs', 'DFS', 'BFS', 'Shortest Path'],
                    completionPercentage: 0,
                    status: 'Available',
                    questions: Array(16).fill({}),
                    masteredQuestions: 0,
                    createdAt: new Date().toISOString(),
                    isTemplate: true,
                    isRelevant: true,
                    description: 'Graph representation and traversal algorithms'
                }
            ],
            'System Design': [
                {
                    _id: 'template-scalability',
                    role: 'Scalability Fundamentals',
                    experience: 4,
                    topicsToFocus: ['Load Balancing', 'Caching', 'Database Scaling'],
                    completionPercentage: 0,
                    status: 'Available',
                    questions: Array(12).fill({}),
                    masteredQuestions: 0,
                    createdAt: new Date().toISOString(),
                    isTemplate: true,
                    isRelevant: true,
                    description: 'Learn to design scalable distributed systems'
                },
                {
                    _id: 'template-databases',
                    role: 'Database Design Patterns',
                    experience: 4,
                    topicsToFocus: ['SQL vs NoSQL', 'ACID', 'CAP Theorem'],
                    completionPercentage: 0,
                    status: 'Available',
                    questions: Array(10).fill({}),
                    masteredQuestions: 0,
                    createdAt: new Date().toISOString(),
                    isTemplate: true,
                    isRelevant: true,
                    description: 'Database selection and design principles'
                }
            ],
            'Behavioral': [
                {
                    _id: 'template-leadership',
                    role: 'Leadership & Communication',
                    experience: 3,
                    topicsToFocus: ['Leadership', 'Team Management', 'Communication'],
                    completionPercentage: 0,
                    status: 'Available',
                    questions: Array(8).fill({}),
                    masteredQuestions: 0,
                    createdAt: new Date().toISOString(),
                    isTemplate: true,
                    isRelevant: true,
                    description: 'Demonstrate leadership and communication skills'
                },
                {
                    _id: 'template-conflict',
                    role: 'Conflict Resolution',
                    experience: 3,
                    topicsToFocus: ['Conflict Resolution', 'Problem Solving', 'Collaboration'],
                    completionPercentage: 0,
                    status: 'Available',
                    questions: Array(6).fill({}),
                    masteredQuestions: 0,
                    createdAt: new Date().toISOString(),
                    isTemplate: true,
                    isRelevant: true,
                    description: 'Handle workplace conflicts and challenges'
                }
            ]
        };
        return sessionTemplates[phase.name] || [];
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
            console.log('Calling roadmap sessions API:', sessionUrl);
            console.log('Role:', role, 'PhaseId:', phaseId);
            
            let sessionsResponse;
            try {
                sessionsResponse = await axiosInstance.get(sessionUrl);
                console.log('Roadmap sessions response:', sessionsResponse.data);
            } catch (sessionError) {
                console.error('Error fetching roadmap sessions:', sessionError);
                console.error('Session URL that failed:', sessionUrl);
                throw sessionError;
            }
            
            // Handle different response structures
            let userSessions = [];
            if (Array.isArray(sessionsResponse.data)) {
                userSessions = sessionsResponse.data;
            } else if (sessionsResponse.data.sessions && Array.isArray(sessionsResponse.data.sessions)) {
                userSessions = sessionsResponse.data.sessions;
            } else if (sessionsResponse.data.data && Array.isArray(sessionsResponse.data.data)) {
                userSessions = sessionsResponse.data.data;
            }
            
            console.log('User sessions after processing:', userSessions);
            
            console.log('User sessions:', userSessions);
            console.log('Phase topics:', phase?.topics);
            
            // Generate phase-specific session recommendations
            let phaseSessions = [];
            
            // The API now returns pre-defined templates with status, so use them directly
            phaseSessions = userSessions.map(session => ({
                ...session,
                isRelevant: true,
                isRoadmapSession: true,
                isTemplate: !session.isStarted, // Templates that haven't been started yet
                isUserSession: session.isStarted // Only started sessions are user sessions
            }));
            
            console.log('Filtered phase sessions:', phaseSessions);

            setAllSessions(phaseSessions);
        } catch (error) {
            console.error("Failed to fetch phase and sessions", error);
            console.error("Error details:", error.response?.data || error.message);
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
                <div className="flex flex-col items-center justify-center h-screen">
                    <SpinnerLoader />
                    <p className="text-slate-600 mt-4 text-center">
                        Loading phase sessions... ✨
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    if (!currentPhase) {
        return (
            <DashboardLayout>
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LuBookOpen className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Phase Not Found</h2>
                    <p className="text-gray-600 mb-6">
                        The requested phase could not be found.
                    </p>
                    <button
                        onClick={() => navigate(`/roadmap?role=${encodeURIComponent(role)}`)}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-2xl hover:shadow-lg transition-all duration-300"
                    >
                        Back to Roadmap
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
                {/* Header */}
                <div className={`bg-gradient-to-r ${getPhaseColor(currentPhase.color)} text-white`}>
                    <div className="container mx-auto px-4 md:px-6 py-8">
                        <div className="max-w-6xl mx-auto">
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-white/80 text-sm mb-4">
                                <button
                                    onClick={() => navigate(`/roadmap?role=${encodeURIComponent(role)}`)}
                                    className="hover:text-white transition-colors"
                                >
                                    {role}
                                </button>
                                <LuChevronRight className="w-4 h-4" />
                                <button
                                    onClick={() => navigate(`/phase/${encodeURIComponent(role)}/${phaseId}`)}
                                    className="hover:text-white transition-colors"
                                >
                                    {currentPhase.name}
                                </button>
                                <LuChevronRight className="w-4 h-4" />
                                <span className="text-white font-medium">Session Library</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                        {currentPhase.name} Sessions
                                    </h1>
                                    <p className="text-xl text-white/90">
                                        {filteredSessions.length} sessions available • {filteredSessions.filter(s => s.isRelevant).length} recommended
                                    </p>
                                </div>
                                
                                <button
                                    onClick={() => navigate(`/phase/${encodeURIComponent(role)}/${phaseId}`)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
                                >
                                    <LuArrowLeft className="w-4 h-4" />
                                    <span>Back to Phase</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
                    {/* Filters */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                            {/* Search */}
                            <div className="lg:col-span-2">
                                <div className="relative">
                                    <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search sessions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Topic Filter */}
                            <div>
                                <select
                                    value={selectedTopic}
                                    onChange={(e) => setSelectedTopic(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="all">All Levels</option>
                                    <option value="easy">Easy (0-2 years)</option>
                                    <option value="medium">Medium (3-5 years)</option>
                                    <option value="hard">Hard (5+ years)</option>
                                </select>
                            </div>

                            {/* Type Filter */}
                            <div>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <LuBookOpen className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">No Sessions Found</h3>
                            <p className="text-gray-600 mb-6">
                                {allSessions.length === 0 
                                    ? "No sessions available for this phase yet. Create some sessions to get started!"
                                    : "No sessions match your current filters. Try adjusting your search criteria."
                                }
                            </p>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-2xl hover:shadow-lg transition-all duration-300"
                            >
                                Create New Session
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSessions.map((session) => (
                                <div
                                    key={session._id}
                                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 group"
                                >
                                    {/* Session Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {getTypeIcon(session.topicsToFocus)}
                                            <div>
                                                <h3 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                                                    {session.role}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {session.experience} years experience
                                                </p>
                                            </div>
                                        </div>
                                        {getStatusIcon(session.completionPercentage)}
                                    </div>

                                    {/* Topics */}
                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-2">
                                            {session.topicsToFocus ? (
                                                (() => {
                                                    // Handle both string and array formats
                                                    const topics = Array.isArray(session.topicsToFocus) 
                                                        ? session.topicsToFocus 
                                                        : session.topicsToFocus.split(',').map(t => t.trim()).filter(t => t);
                                                    
                                                    return topics.length > 0 ? (
                                                        <>
                                                            {topics.slice(0, 3).map((topic, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full"
                                                                >
                                                                    {topic}
                                                                </span>
                                                            ))}
                                                            {topics.length > 3 && (
                                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                                                    +{topics.length - 3} more
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                                            General Practice
                                                        </span>
                                                    );
                                                })()
                                            ) : (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                                    General Practice
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
                                            <LuTarget className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                                            <div className="text-sm font-bold text-blue-600">{session.questions?.length || 0}</div>
                                            <div className="text-xs text-blue-600">Questions</div>
                                        </div>
                                        <div className="text-center p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl">
                                            <LuTrendingUp className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                                            <div className="text-sm font-bold text-emerald-600">{session.completionPercentage || 0}%</div>
                                            <div className="text-xs text-emerald-600">Complete</div>
                                        </div>
                                    </div>

                                    {/* Badges */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            {getDifficultyBadge(session.experience)}
                                            {session.isTemplate && (
                                                <span className="px-2 py-1 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 text-xs font-medium rounded-full">
                                                    Template
                                                </span>
                                            )}
                                            {session.isRelevant && !session.isTemplate && (
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    session.isRoadmapSession 
                                                        ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700' 
                                                        : 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700'
                                                }`}>
                                                    {session.isRoadmapSession ? 'Roadmap Session' : 'Your Session'}
                                                </span>
                                            )}
                                        </div>
                                        {getStatusBadge(session.completionPercentage)}
                                    </div>

                                    {/* Description for templates or Created Date for user sessions */}
                                    {session.isTemplate ? (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600 italic">
                                                {session.description}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                            <LuCalendar className="w-3 h-3" />
                                            <span>Created {new Date(session.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    {session.isTemplate ? (
                                        <button
                                            onClick={() => handleStartTemplate(session)}
                                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-2xl text-white bg-gradient-to-r ${getPhaseColor(currentPhase.color)} hover:shadow-lg transition-all duration-300 transform group-hover:scale-105`}
                                        >
                                            <LuPlay className="w-4 h-4" />
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
                                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-2xl text-white bg-gradient-to-r ${getPhaseColor(currentPhase.color)} hover:shadow-lg transition-all duration-300 transform group-hover:scale-105`}
                                        >
                                            <LuPlay className="w-4 h-4" />
                                            <span>
                                                {session.completionPercentage >= 100 
                                                    ? 'Review Session' 
                                                    : 'Continue Session'
                                                }
                                            </span>
                                        </button>
                                    )}
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
