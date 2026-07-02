import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader.jsx';
import { 
    LuMap, 
    LuTarget, 
    LuStar, 
    LuCheck, 
    LuClock, 
    LuTrendingUp, 
    LuBookOpen, 
    LuPlay,
    LuLock,
    LuChevronRight,
    LuCalendar,
    LuAward,
    LuBrain,
    LuRocket
} from 'react-icons/lu';

const RoadmapPage = () => {
    // Auto scroll to top when navigating to this page
    useScrollToTop();
    
    const [selectedRole, setSelectedRole] = useState('');
    const [availableRoles, setAvailableRoles] = useState([]);
    const [roadmap, setRoadmap] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingRoles, setIsLoadingRoles] = useState(true);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        fetchAvailableRoles();
    }, []);

    const fetchAvailableRoles = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.ROADMAP.GET_ROLES);
            setAvailableRoles(response.data);
            
            // Check if there's a role in URL params, otherwise use first available role
            const urlRole = searchParams.get('role');
            const roleToSelect = urlRole && response.data.find(r => r.name === urlRole) 
                ? urlRole 
                : response.data[0]?.name;
                
            if (roleToSelect) {
                setSelectedRole(roleToSelect);
                fetchRoadmap(roleToSelect);
                // Update URL if needed
                if (!urlRole || urlRole !== roleToSelect) {
                    setSearchParams({ role: roleToSelect });
                }
            }
        } catch (error) {
            console.error("Failed to fetch available roles", error);
        } finally {
            setIsLoadingRoles(false);
        }
    };

    const fetchRoadmap = async (role) => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(API_PATHS.ROADMAP.GENERATE(role));
            setRoadmap(response.data);
        } catch (error) {
            console.error("Failed to fetch roadmap", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = (role) => {
        setSelectedRole(role);
        setSearchParams({ role: role }); // Update URL
        fetchRoadmap(role);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <LuCheck className="w-5 h-5 text-emerald-500" />;
            case 'in_progress':
                return <LuPlay className="w-5 h-5 text-blue-500" />;
            case 'available':
                return <LuTarget className="w-5 h-5 text-purple-500" />;
            case 'locked':
                return <LuLock className="w-5 h-5 text-gray-400" />;
            default:
                return <LuTarget className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'from-emerald-500 to-green-500';
            case 'in_progress':
                return 'from-blue-500 to-cyan-500';
            case 'available':
                return 'from-purple-500 to-indigo-500';
            case 'locked':
                return 'from-gray-400 to-gray-500';
            default:
                return 'from-gray-400 to-gray-500';
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

    if (isLoadingRoles) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-screen bg-cream dark:bg-navy font-body">
                    <SpinnerLoader />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-cream dark:bg-navy font-body">
                {/* Enhanced Hero Header */}
                <div className="bg-charcoal dark:bg-navy-light text-white dark:text-cream border-b-2 border-charcoal dark:border-cream/40">
                    <div className="container mx-auto px-4 md:px-6 py-8">
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-white dark:bg-navy-input rounded-md flex items-center justify-center">
                                    <LuMap className="w-6 h-6 text-charcoal dark:text-cream" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-display font-bold text-white dark:text-cream">
                                    Learning Roadmap
                                </h1>
                            </div>
                            <p className="text-white/80 dark:text-cream/80 text-lg max-w-2xl mx-auto leading-relaxed font-bold">
                                Your personalized learning journey, crafted to guide you from where you are to where you want to be.
                            </p>
                            
                            {/* Role Selection */}
                            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                                {availableRoles.map((role) => (
                                    <button
                                        key={role.name}
                                        onClick={() => handleRoleChange(role.name)}
                                        className={`px-6 py-3 rounded-md font-bold uppercase tracking-wider text-sm transition-all duration-200 border-2 border-charcoal dark:border-cream/40 cursor-pointer ${
                                            selectedRole === role.name
                                                ? 'bg-white dark:bg-navy-input text-charcoal dark:text-cream shadow-[4px_4px_0px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_0px_var(--color-shadow)] -translate-y-1'
                                                : 'bg-charcoal dark:bg-navy-light text-white dark:text-cream hover:bg-white dark:hover:bg-navy-input hover:text-charcoal dark:hover:text-cream hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)]'
                                        }`}
                                    >
                                        {role.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto p-4 md:p-8 max-w-6xl">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <SpinnerLoader />
                            <p className="text-charcoal dark:text-cream mt-4 text-center font-bold">
                                Crafting your personalized learning roadmap... ✨
                            </p>
                        </div>
                    ) : roadmap ? (
                        <div className="space-y-8">
                            {/* Roadmap Overview */}
                            <div className="card-editorial p-8">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-cream dark:bg-navy border-2 border-charcoal/20 dark:border-cream/20 rounded-md flex items-center justify-center mx-auto mb-3">
                                            <LuTrendingUp className="w-8 h-8 text-charcoal dark:text-cream" />
                                        </div>
                                        <div className="text-2xl font-display font-bold text-charcoal dark:text-cream">{roadmap.overallProgress}%</div>
                                        <div className="text-sm text-charcoal/80 dark:text-cream/80 font-bold">Overall Progress</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-cream dark:bg-navy border-2 border-charcoal/20 dark:border-cream/20 rounded-md flex items-center justify-center mx-auto mb-3">
                                            <LuAward className="w-8 h-8 text-charcoal dark:text-cream" />
                                        </div>
                                        <div className="text-2xl font-display font-bold text-charcoal dark:text-cream">{roadmap.completedPhases}/{roadmap.totalPhases}</div>
                                        <div className="text-sm text-charcoal/80 dark:text-cream/80 font-bold">Phases Complete</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-cream dark:bg-navy border-2 border-charcoal/20 dark:border-cream/20 rounded-md flex items-center justify-center mx-auto mb-3">
                                            <LuCalendar className="w-8 h-8 text-charcoal dark:text-cream" />
                                        </div>
                                        <div className="text-2xl font-display font-bold text-charcoal dark:text-cream">{roadmap.estimatedCompletionDays}</div>
                                        <div className="text-sm text-charcoal/80 dark:text-cream/80 font-bold">Days Remaining</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-cream dark:bg-navy border-2 border-charcoal/20 dark:border-cream/20 rounded-md flex items-center justify-center mx-auto mb-3">
                                            <LuBookOpen className="w-8 h-8 text-charcoal dark:text-cream" />
                                        </div>
                                        <div className="text-2xl font-display font-bold text-charcoal dark:text-cream">{roadmap.phases.reduce((sum, phase) => sum + phase.sessionsCount, 0)}</div>
                                        <div className="text-sm text-charcoal/80 dark:text-cream/80 font-bold">Total Sessions</div>
                                    </div>
                                </div>
                            </div>

                            {/* Roadmap Phases */}
                            <div className="space-y-6">
                                {roadmap.phases.map((phase, index) => (
                                    <div
                                        key={phase.id}
                                        className={`relative card-editorial overflow-hidden transition-all duration-500 ${
                                            phase.status === 'locked' ? 'opacity-60' : ''
                                        }`}
                                    >
                                        {/* Phase Header */}
                                        <div className={`bg-charcoal dark:bg-navy-input p-6 text-white dark:text-cream border-b-2 border-charcoal dark:border-cream/40`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white dark:bg-navy rounded-md flex items-center justify-center">
                                                        {getStatusIcon(phase.status)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-display font-bold">Phase {phase.order}: {phase.name}</h3>
                                                        <p className="text-white/90 dark:text-cream/90 text-sm font-bold">{phase.description}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-display font-bold">{phase.completionPercentage}%</div>
                                                    <div className="text-white/90 dark:text-cream/90 text-sm font-bold">{phase.estimatedDays} days</div>
                                                </div>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            <div className="mt-4">
                                                <div className="w-full bg-white/20 rounded-full h-2">
                                                    <div 
                                                        className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${phase.completionPercentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Phase Content */}
                                        <div className="p-6">
                                            {/* Topics */}
                                            <div className="mb-6">
                                                <h4 className="font-display font-bold text-charcoal dark:text-cream mb-3 flex items-center gap-2">
                                                    <LuBrain className="w-4 h-4" />
                                                    Key Topics
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {phase.topics.map((topic, topicIndex) => (
                                                        <span
                                                            key={topicIndex}
                                                            className="px-3 py-1 bg-cream dark:bg-navy text-charcoal dark:text-cream rounded-sm text-sm font-bold border border-charcoal/20 dark:border-cream/20"
                                                        >
                                                            {topic}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                <div className="text-center p-3 bg-white dark:bg-navy-light rounded-md border-2 border-charcoal/20 dark:border-cream/20">
                                                    <div className="text-lg font-bold text-charcoal dark:text-cream">{phase.sessionsCount}</div>
                                                    <div className="text-xs text-charcoal/80 dark:text-cream/80 font-bold">Sessions</div>
                                                </div>
                                                <div className="text-center p-3 bg-white dark:bg-navy-light rounded-md border-2 border-charcoal/20 dark:border-cream/20">
                                                    <div className="text-lg font-bold text-charcoal dark:text-cream">{phase.totalQuestions}</div>
                                                    <div className="text-xs text-charcoal/80 dark:text-cream/80 font-bold">Questions</div>
                                                </div>
                                                <div className="text-center p-3 bg-white dark:bg-navy-light rounded-md border-2 border-charcoal/20 dark:border-cream/20">
                                                    <div className="text-lg font-bold text-charcoal dark:text-cream">{phase.masteredQuestions}</div>
                                                    <div className="text-xs text-charcoal/80 dark:text-cream/80 font-bold">Mastered</div>
                                                </div>
                                                <div className="text-center p-3 bg-white dark:bg-navy-light rounded-md border-2 border-charcoal/20 dark:border-cream/20">
                                                    <div className="text-lg font-bold text-charcoal dark:text-cream">{phase.estimatedDays}</div>
                                                    <div className="text-xs text-charcoal/80 dark:text-cream/80 font-bold">Est. Days</div>
                                                </div>
                                            </div>

                                            {/* Sessions */}
                                            {phase.sessions.length > 0 && (
                                                <div>
                                                    <h4 className="font-display font-bold text-charcoal dark:text-cream mb-3 flex items-center gap-2">
                                                        <LuRocket className="w-4 h-4" />
                                                        Your Sessions ({phase.sessions.length})
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {phase.sessions.slice(0, 4).map((session) => (
                                                            <div
                                                                key={session.id}
                                                                onClick={() => navigate(`/interview-prep/${session.id}`)}
                                                                className="p-4 bg-cream dark:bg-navy rounded-md border-2 border-charcoal dark:border-cream/40 hover:-translate-y-1 cursor-pointer transition-all duration-200 group"
                                                                style={{ boxShadow: 'none' }}
                                                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-shadow)'}
                                                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <div className="font-bold text-charcoal dark:text-cream">
                                                                            {session.role}
                                                                        </div>
                                                                        <div className="text-sm text-charcoal/80 dark:text-cream/80 font-bold">
                                                                            {session.experience} Years • {session.questionsCount} Questions
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="text-sm font-bold text-charcoal dark:text-cream">
                                                                            {session.completionPercentage}%
                                                                        </div>
                                                                        <LuChevronRight className="w-4 h-4 text-charcoal dark:text-cream" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {phase.sessions.length > 4 && (
                                                        <div className="mt-3 text-center">
                                                            <span className="text-sm text-charcoal/50 dark:text-cream/50 font-bold">
                                                                +{phase.sessions.length - 4} more sessions
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Action Button */}
                                            {phase.status !== 'locked' && (
                                                <div className="mt-6 text-center">
                                                    <button
                                                        onClick={() => {
                                                            navigate(`/phase/${encodeURIComponent(selectedRole)}/${phase.id}`);
                                                        }}
                                                        className={`group flex items-center justify-center gap-2 mx-auto px-6 py-3 font-bold uppercase tracking-wider text-sm rounded-md border-2 border-charcoal dark:border-cream/40 bg-charcoal dark:bg-cream text-white dark:text-navy hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] cursor-pointer transition-all duration-300`}
                                                    >
                                                        {phase.status === 'completed' ? (
                                                            <>
                                                                <LuCheck className="w-4 h-4" />
                                                                <span>Review Phase</span>
                                                            </>
                                                        ) : phase.status === 'in_progress' ? (
                                                            <>
                                                                <LuPlay className="w-4 h-4" />
                                                                <span>Continue Phase</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <LuTarget className="w-4 h-4" />
                                                                <span>Start Phase</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Connection Line */}
                                        {index < roadmap.phases.length - 1 && (
                                            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-charcoal/20 dark:bg-cream/20"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-cream dark:bg-navy min-h-screen">
                            <div className="w-20 h-20 bg-charcoal dark:bg-cream rounded-md flex items-center justify-center mx-auto mb-6">
                                <LuMap className="w-10 h-10 text-white dark:text-navy" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-4">No Roadmap Available</h2>
                            <p className="text-charcoal/80 dark:text-cream/80 font-bold mb-6">
                                Select a role to generate your personalized learning roadmap.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RoadmapPage;
