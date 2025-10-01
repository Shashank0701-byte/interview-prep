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
                <div className="flex items-center justify-center h-screen">
                    <SpinnerLoader />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
                {/* Enhanced Hero Header */}
                <div className="bg-gradient-to-r from-white via-indigo-50/30 to-purple-50/20 border-b border-gray-100/60">
                    <div className="container mx-auto px-4 md:px-6 py-8">
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                                    <LuMap className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                                    Learning Roadmap
                                </h1>
                            </div>
                            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
                                Your personalized learning journey, crafted to guide you from where you are to where you want to be.
                            </p>
                            
                            {/* Role Selection */}
                            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                                {availableRoles.map((role) => (
                                    <button
                                        key={role.name}
                                        onClick={() => handleRoleChange(role.name)}
                                        className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                                            selectedRole === role.name
                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                                                : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white border border-indigo-100/50 hover:border-indigo-200'
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
                            <p className="text-slate-600 mt-4 text-center">
                                Crafting your personalized learning roadmap... ✨
                            </p>
                        </div>
                    ) : roadmap ? (
                        <div className="space-y-8">
                            {/* Roadmap Overview */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-indigo-100/50 border border-white/50 p-8">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                                            <LuTrendingUp className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-800">{roadmap.overallProgress}%</div>
                                        <div className="text-sm text-slate-600">Overall Progress</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                                            <LuAward className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-800">{roadmap.completedPhases}/{roadmap.totalPhases}</div>
                                        <div className="text-sm text-slate-600">Phases Complete</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                                            <LuCalendar className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-800">{roadmap.estimatedCompletionDays}</div>
                                        <div className="text-sm text-slate-600">Days Remaining</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                                            <LuBookOpen className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="text-2xl font-bold text-gray-800">{roadmap.phases.reduce((sum, phase) => sum + phase.sessionsCount, 0)}</div>
                                        <div className="text-sm text-slate-600">Total Sessions</div>
                                    </div>
                                </div>
                            </div>

                            {/* Roadmap Phases */}
                            <div className="space-y-6">
                                {roadmap.phases.map((phase, index) => (
                                    <div
                                        key={phase.id}
                                        className={`relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden transition-all duration-500 hover:shadow-2xl ${
                                            phase.status === 'locked' ? 'opacity-60' : ''
                                        }`}
                                    >
                                        {/* Phase Header */}
                                        <div className={`bg-gradient-to-r ${getPhaseColor(phase.color)} p-6 text-white`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                                        {getStatusIcon(phase.status)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold">Phase {phase.order}: {phase.name}</h3>
                                                        <p className="text-white/90 text-sm">{phase.description}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold">{phase.completionPercentage}%</div>
                                                    <div className="text-white/90 text-sm">{phase.estimatedDays} days</div>
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
                                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                    <LuBrain className="w-4 h-4 text-indigo-500" />
                                                    Key Topics
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {phase.topics.map((topic, topicIndex) => (
                                                        <span
                                                            key={topicIndex}
                                                            className="px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100"
                                                        >
                                                            {topic}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                                                    <div className="text-lg font-bold text-blue-600">{phase.sessionsCount}</div>
                                                    <div className="text-xs text-blue-600">Sessions</div>
                                                </div>
                                                <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                                                    <div className="text-lg font-bold text-emerald-600">{phase.totalQuestions}</div>
                                                    <div className="text-xs text-emerald-600">Questions</div>
                                                </div>
                                                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                                                    <div className="text-lg font-bold text-purple-600">{phase.masteredQuestions}</div>
                                                    <div className="text-xs text-purple-600">Mastered</div>
                                                </div>
                                                <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                                                    <div className="text-lg font-bold text-amber-600">{phase.estimatedDays}</div>
                                                    <div className="text-xs text-amber-600">Est. Days</div>
                                                </div>
                                            </div>

                                            {/* Sessions */}
                                            {phase.sessions.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                        <LuRocket className="w-4 h-4 text-purple-500" />
                                                        Your Sessions ({phase.sessions.length})
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {phase.sessions.slice(0, 4).map((session) => (
                                                            <div
                                                                key={session.id}
                                                                onClick={() => navigate(`/interview-prep/${session.id}`)}
                                                                className="p-4 bg-gradient-to-br from-white to-gray-50/50 rounded-xl border border-gray-200 hover:border-indigo-200 cursor-pointer transition-all duration-200 hover:shadow-md group"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <div className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">
                                                                            {session.role}
                                                                        </div>
                                                                        <div className="text-sm text-gray-500">
                                                                            {session.experience} Years • {session.questionsCount} Questions
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="text-sm font-medium text-gray-600">
                                                                            {session.completionPercentage}%
                                                                        </div>
                                                                        <LuChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {phase.sessions.length > 4 && (
                                                        <div className="mt-3 text-center">
                                                            <span className="text-sm text-gray-500">
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
                                                        className={`group flex items-center gap-2 mx-auto px-6 py-3 font-semibold rounded-2xl text-white bg-gradient-to-r ${getStatusColor(phase.status)} hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                                                    >
                                                        {phase.status === 'completed' ? (
                                                            <>
                                                                <LuCheck className="w-4 h-4" />
                                                                <span>Review Phase</span>
                                                            </>
                                                        ) : phase.status === 'in_progress' ? (
                                                            <>
                                                                <LuPlay className="w-4 h-4 group-hover:animate-pulse" />
                                                                <span>Continue Phase</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <LuTarget className="w-4 h-4 group-hover:animate-pulse" />
                                                                <span>Start Phase</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Connection Line */}
                                        {index < roadmap.phases.length - 1 && (
                                            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-gradient-to-b from-indigo-200 to-purple-200 rounded-full"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <LuMap className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Roadmap Available</h2>
                            <p className="text-gray-600 mb-6">
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
