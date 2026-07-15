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
                return <LuCheck className="w-5 h-5 text-emerald-500" strokeWidth={3} />;
            case 'in_progress':
                return <LuPlay className="w-5 h-5 text-blue-500" strokeWidth={3} />;
            case 'available':
                return <LuTarget className="w-5 h-5 text-purple-500" strokeWidth={3} />;
            case 'locked':
                return <LuLock className="w-5 h-5 text-charcoal/50 dark:text-cream/50" strokeWidth={3} />;
            default:
                return <LuTarget className="w-5 h-5 text-charcoal/50" strokeWidth={3} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
            case 'in_progress':
                return 'border-2 border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400';
            case 'available':
                return 'border-2 border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400';
            case 'locked':
                return 'border-2 border-charcoal/30 bg-charcoal/5 text-charcoal/60 dark:text-cream/40 dark:border-cream/20';
            default:
                return 'border-2 border-charcoal/30 bg-charcoal/5 text-charcoal/60';
        }
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
            <div className="min-h-screen bg-cream dark:bg-navy font-body transition-colors duration-300">
                {/* Hero Header */}
                <div className="bg-cream dark:bg-navy text-charcoal dark:text-cream border-b-4 border-charcoal/15 dark:border-cream/20">
                    <div className="container mx-auto px-4 md:px-6 py-10">
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-white dark:bg-navy-light border-3 border-charcoal dark:border-cream/40 rounded-sm flex items-center justify-center shadow-[3px_3px_0px_0px_var(--color-shadow)]">
                                    <LuMap className="w-6 h-6 text-charcoal dark:text-cream" strokeWidth={3} />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wider">
                                    Learning Roadmap
                                </h1>
                            </div>
                            <p className="text-charcoal/70 dark:text-cream/70 text-base max-w-2xl mx-auto leading-relaxed">
                                Your personalized learning journey, crafted to guide you from where you are to where you want to be.
                            </p>
                            
                            {/* Role Selection */}
                            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                                {availableRoles.map((role) => (
                                    <button
                                        key={role.name}
                                        onClick={() => handleRoleChange(role.name)}
                                        className={`px-5 py-2.5 rounded-sm font-bold uppercase tracking-wider text-xs border-3 transition-all duration-200 cursor-pointer shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none ${
                                            selectedRole === role.name
                                                ? 'bg-charcoal text-white border-charcoal dark:bg-cream dark:text-navy dark:border-cream/85'
                                                : 'bg-white dark:bg-navy-light text-charcoal dark:text-cream border-charcoal dark:border-cream/40 hover:-translate-y-0.5'
                                        }`}
                                    >
                                        {role.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto p-4 md:p-8 max-w-5xl">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <SpinnerLoader />
                            <p className="text-charcoal dark:text-cream mt-4 text-center font-bold font-mono text-sm uppercase tracking-wider">
                                Crafting roadmap diagnostics... ✨
                            </p>
                        </div>
                    ) : roadmap ? (
                        <div className="space-y-10">
                            {/* Roadmap Overview */}
                            <div className="card-editorial p-8 bg-white dark:bg-navy-light">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="text-center">
                                        <div className="w-14 h-14 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm flex items-center justify-center mx-auto mb-3 shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                            <LuTrendingUp className="w-6 h-6 text-charcoal dark:text-cream" strokeWidth={2.5} />
                                        </div>
                                        <div className="text-2xl font-mono font-bold text-charcoal dark:text-cream">{roadmap.overallProgress}%</div>
                                        <div className="text-xs text-charcoal/50 dark:text-cream/50 font-bold uppercase tracking-wider mt-1">Progress</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-14 h-14 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm flex items-center justify-center mx-auto mb-3 shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                            <LuAward className="w-6 h-6 text-charcoal dark:text-cream" strokeWidth={2.5} />
                                        </div>
                                        <div className="text-2xl font-mono font-bold text-charcoal dark:text-cream">{roadmap.completedPhases}/{roadmap.totalPhases}</div>
                                        <div className="text-xs text-charcoal/50 dark:text-cream/50 font-bold uppercase tracking-wider mt-1">Complete</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-14 h-14 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm flex items-center justify-center mx-auto mb-3 shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                            <LuCalendar className="w-6 h-6 text-charcoal dark:text-cream" strokeWidth={2.5} />
                                        </div>
                                        <div className="text-2xl font-mono font-bold text-charcoal dark:text-cream">{roadmap.estimatedCompletionDays}</div>
                                        <div className="text-xs text-charcoal/50 dark:text-cream/50 font-bold uppercase tracking-wider mt-1">Days left</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-14 h-14 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm flex items-center justify-center mx-auto mb-3 shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                            <LuBookOpen className="w-6 h-6 text-charcoal dark:text-cream" strokeWidth={2.5} />
                                        </div>
                                        <div className="text-2xl font-mono font-bold text-charcoal dark:text-cream">{roadmap.phases.reduce((sum, phase) => sum + phase.sessionsCount, 0)}</div>
                                        <div className="text-xs text-charcoal/50 dark:text-cream/50 font-bold uppercase tracking-wider mt-1">Sessions</div>
                                    </div>
                                </div>
                            </div>

                            {/* Roadmap Phases */}
                            <div className="space-y-12">
                                {roadmap.phases.map((phase, index) => (
                                    <div
                                        key={phase.id}
                                        className={`relative card-editorial overflow-hidden transition-all duration-500 bg-white dark:bg-navy-light ${
                                            phase.status === 'locked' ? 'opacity-65' : ''
                                        }`}
                                    >
                                        {/* Phase Header */}
                                        <div className="bg-cream dark:bg-[#0a1118] p-6 text-charcoal dark:text-cream border-b-4 border-charcoal dark:border-cream/40">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 bg-white dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm flex items-center justify-center shadow-[3px_3px_0px_0px_var(--color-shadow)]`}>
                                                        {getStatusIcon(phase.status)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-display font-bold leading-tight">Phase {phase.order}: {phase.name}</h3>
                                                        <p className="text-charcoal/60 dark:text-cream/60 text-sm mt-1">{phase.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t-2 border-dashed border-charcoal/10 sm:border-t-0 pt-3 sm:pt-0">
                                                    <div className="text-2xl font-mono font-bold text-charcoal dark:text-cream">{phase.completionPercentage}%</div>
                                                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-charcoal/50 dark:text-cream/50">{phase.estimatedDays} days est.</div>
                                                </div>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            <div className="mt-5">
                                                <div className="w-full bg-white dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm h-3">
                                                    <div 
                                                        className="bg-charcoal dark:bg-cream h-full rounded-sm transition-all duration-1000 ease-out"
                                                        style={{ width: `${phase.completionPercentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Phase Content */}
                                        <div className="p-6">
                                            {/* Topics */}
                                            <div className="mb-6">
                                                <h4 className="font-display font-bold text-charcoal dark:text-cream mb-3 flex items-center gap-2 text-base uppercase tracking-wider">
                                                    <LuBrain className="w-4 h-4 text-charcoal/70 dark:text-cream/70" strokeWidth={2.5} />
                                                    Key Topics
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {phase.topics.map((topic, topicIndex) => (
                                                        <span
                                                            key={topicIndex}
                                                            className="px-3 py-1 bg-cream dark:bg-navy text-charcoal dark:text-cream rounded-sm text-xs font-bold font-mono border-2 border-charcoal dark:border-cream/30 shadow-[2px_2px_0px_0px_var(--color-shadow)]"
                                                        >
                                                            {topic}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                <div className="text-center p-3 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                                    <div className="text-lg font-bold font-mono text-charcoal dark:text-cream">{phase.sessionsCount}</div>
                                                    <div className="text-[10px] text-charcoal/50 dark:text-cream/50 font-bold uppercase tracking-wider">Sessions</div>
                                                </div>
                                                <div className="text-center p-3 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                                    <div className="text-lg font-bold font-mono text-charcoal dark:text-cream">{phase.totalQuestions}</div>
                                                    <div className="text-[10px] text-charcoal/50 dark:text-cream/50 font-bold uppercase tracking-wider">Questions</div>
                                                </div>
                                                <div className="text-center p-3 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                                    <div className="text-lg font-bold font-mono text-charcoal dark:text-cream">{phase.masteredQuestions}</div>
                                                    <div className="text-[10px] text-charcoal/50 dark:text-cream/50 font-bold uppercase tracking-wider">Mastered</div>
                                                </div>
                                                <div className="text-center p-3 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                                    <div className="text-lg font-bold font-mono text-charcoal dark:text-cream">{phase.estimatedDays}</div>
                                                    <div className="text-[10px] text-charcoal/50 dark:text-cream/50 font-bold uppercase tracking-wider">Est. Days</div>
                                                </div>
                                            </div>

                                            {/* Sessions */}
                                            {phase.sessions.length > 0 && (
                                                <div className="border-t-2 border-dashed border-charcoal/10 dark:border-cream/10 pt-6">
                                                    <h4 className="font-display font-bold text-charcoal dark:text-cream mb-4 flex items-center gap-2 text-base uppercase tracking-wider">
                                                        <LuRocket className="w-4 h-4 text-charcoal/70 dark:text-cream/70" strokeWidth={2.5} />
                                                        Active Sessions ({phase.sessions.length})
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {phase.sessions.slice(0, 4).map((session) => (
                                                            <div
                                                                key={session.id}
                                                                onClick={() => navigate(`/interview-prep/${session.id}`)}
                                                                className="p-4 bg-white dark:bg-navy border-2 border-charcoal dark:border-cream/40 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] shadow-[2px_2px_0px_0px_var(--color-shadow)] cursor-pointer transition-all duration-200 group rounded-sm"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="min-w-0 pr-2">
                                                                        <div className="font-bold text-charcoal dark:text-cream truncate">
                                                                            {session.role}
                                                                        </div>
                                                                        <div className="text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 mt-1">
                                                                            {session.experience}y exp • {session.questionsCount} questions
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                                        <div className="text-sm font-mono font-bold text-charcoal dark:text-cream bg-cream dark:bg-navy-light px-2 py-0.5 border border-charcoal dark:border-cream/20 rounded-sm">
                                                                            {session.completionPercentage}%
                                                                        </div>
                                                                        <LuChevronRight className="w-4 h-4 text-charcoal dark:text-cream group-hover:translate-x-0.5 transition-transform" strokeWidth={3} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {phase.sessions.length > 4 && (
                                                        <div className="mt-3 text-center">
                                                            <span className="text-xs text-charcoal/50 dark:text-cream/50 font-bold uppercase tracking-widest font-mono">
                                                                +{phase.sessions.length - 4} more sessions available
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Action Button */}
                                            {phase.status !== 'locked' && (
                                                <div className="mt-8 text-center">
                                                    <button
                                                        onClick={() => {
                                                            navigate(`/phase/${encodeURIComponent(selectedRole)}/${phase.id}`);
                                                        }}
                                                        className={`group flex items-center justify-center gap-2 mx-auto px-6 py-3 font-bold uppercase tracking-widest text-xs rounded-sm border-3 border-charcoal dark:border-cream/40 bg-charcoal dark:bg-cream text-white dark:text-navy hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all duration-200`}
                                                    >
                                                        {phase.status === 'completed' ? (
                                                            <>
                                                                <LuCheck className="w-4 h-4" strokeWidth={3} />
                                                                <span>Review Phase</span>
                                                            </>
                                                        ) : phase.status === 'in_progress' ? (
                                                            <>
                                                                <LuPlay className="w-4 h-4 animate-pulse" strokeWidth={3} />
                                                                <span>Continue Phase</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <LuTarget className="w-4 h-4" strokeWidth={3} />
                                                                <span>Start Phase</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Connection Line */}
                                        {index < roadmap.phases.length - 1 && (
                                            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-1.5 h-8 bg-charcoal dark:bg-cream/20"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-navy-light border-4 border-charcoal dark:border-cream/40 rounded-sm shadow-[8px_8px_0px_0px_var(--color-shadow)] max-w-xl mx-auto">
                            <div className="w-16 h-16 bg-charcoal dark:bg-cream rounded-sm flex items-center justify-center mx-auto mb-6 shadow-[3px_3px_0px_0px_var(--color-shadow)]">
                                <LuMap className="w-8 h-8 text-white dark:text-navy" strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide">No Roadmap Available</h2>
                            <p className="text-charcoal/60 dark:text-cream/60 font-body mb-6">
                                Select a target role above to initialize your personalized learning curriculum.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RoadmapPage;
