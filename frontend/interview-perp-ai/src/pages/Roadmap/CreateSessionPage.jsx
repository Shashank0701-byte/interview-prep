import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { 
    LuRocket, 
    LuArrowLeft, 
    LuCheck, 
    LuLoader,
    LuBrain,
    LuTarget,
    LuClock,
    LuBookOpen,
    LuChevronRight
} from 'react-icons/lu';

const CreateSessionPage = () => {
    const { role, phaseId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Get template data from URL params
    const templateId = searchParams.get('template');
    const templateName = searchParams.get('name');
    const templateTopics = searchParams.get('topics')?.split(',') || [];
    const templateExperience = searchParams.get('experience') || '1';
    const templateDescription = searchParams.get('description') || '';
    
    const [currentPhase, setCurrentPhase] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isCreated, setIsCreated] = useState(false);
    const [sessionData, setSessionData] = useState({
        role: templateName || '',
        experience: templateExperience,
        topicsToFocus: templateTopics.join(', '),
        description: templateDescription,
        numberOfQuestions: 10
    });
    const [createdSession, setCreatedSession] = useState(null);

    useEffect(() => {
        fetchPhaseData();
    }, [role, phaseId]);

    const fetchPhaseData = async () => {
        try {
            const roadmapResponse = await axiosInstance.get(API_PATHS.ROADMAP.GENERATE(role));
            const phase = roadmapResponse.data.phases.find(p => p.id === phaseId);
            setCurrentPhase(phase);
        } catch (error) {
            console.error("Failed to fetch phase data", error);
        }
    };

    const handleCreateSession = async () => {
        setIsCreating(true);
        try {
            const response = await axiosInstance.post(API_PATHS.ROADMAP_SESSIONS.CREATE, {
                ...sessionData,
                numberOfQuestions: parseInt(sessionData.numberOfQuestions),
                phaseId: phaseId,
                phaseName: currentPhase.name,
                phaseColor: currentPhase.color,
                roadmapRole: role
            });
            
            if (response.data && response.data.session) {
                setCreatedSession(response.data.session);
                setIsCreated(true);
            }
        } catch (error) {
            console.error("Failed to create roadmap session", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleStartSession = () => {
        if (createdSession) {
            navigate(`/roadmap-session/${createdSession._id}?fromPhase=${phaseId}&role=${encodeURIComponent(role)}`);
        }
    };

    const getPhaseColor = (color) => {
        const colors = {
            blue: 'from-blue-500 to-cyan-500',
            purple: 'from-purple-500 to-indigo-500',
            emerald: 'from-emerald-500 to-teal-500',
            orange: 'from-orange-500 to-red-500',
        };
        return colors[color] || 'from-indigo-500 to-purple-500';
    };

    if (!currentPhase) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-screen">
                    <LuLoader className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-cream dark:bg-navy font-body">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className={`bg-charcoal dark:bg-navy-input rounded-md p-8 mb-8 text-white dark:text-cream border-2 border-charcoal dark:border-cream/40 shadow-[4px_4px_0px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_0px_var(--color-shadow)]`}>
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-white/80 mb-6">
                            <span 
                                onClick={() => navigate('/roadmap')}
                                className="hover:text-white cursor-pointer transition-colors"
                            >
                                {role}
                            </span>
                            <LuChevronRight className="w-4 h-4" />
                            <span 
                                onClick={() => navigate(`/phase/${encodeURIComponent(role)}/${phaseId}`)}
                                className="hover:text-white cursor-pointer transition-colors"
                            >
                                {currentPhase.name}
                            </span>
                            <LuChevronRight className="w-4 h-4" />
                            <span 
                                onClick={() => navigate(`/phase-sessions/${encodeURIComponent(role)}/${phaseId}`)}
                                className="hover:text-white cursor-pointer transition-colors"
                            >
                                Session Library
                            </span>
                            <LuChevronRight className="w-4 h-4" />
                            <span className="text-white font-medium">Create Session</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                                    Create New Session
                                </h1>
                                <p className="text-xl text-white/90 font-body">
                                    Set up your personalized learning session
                                </p>
                            </div>
                            
                            <button
                                onClick={() => navigate(`/phase-sessions/${encodeURIComponent(role)}/${phaseId}`)}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-navy-light text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 font-bold uppercase tracking-wider text-sm rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all cursor-pointer"
                            >
                                <LuArrowLeft className="w-4 h-4" />
                                <span>Back to Library</span>
                            </button>
                        </div>
                    </div>

                    {!isCreated ? (
                        <>
                            {/* Session Creation Form */}
                            <div className="grid md:grid-cols-2 gap-8">
                            {/* Session Details */}
                            <div className="card-editorial p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`p-3 rounded-md bg-charcoal dark:bg-cream`}>
                                        <LuRocket className="w-6 h-6 text-white dark:text-navy" />
                                    </div>
                                    <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream">Session Details</h2>
                                </div>

                                <div className="space-y-6">
                                    {/* Session Name */}
                                    <div>
                                        <label className="block text-sm font-display font-bold text-charcoal dark:text-cream mb-2">
                                            Session Name
                                        </label>
                                        <input
                                            type="text"
                                            value={sessionData.role}
                                            onChange={(e) => setSessionData({...sessionData, role: e.target.value})}
                                            className="w-full px-4 py-3 border-2 border-charcoal dark:border-cream/40 rounded-md focus:ring-0 focus:border-charcoal outline-none bg-white dark:bg-navy-light text-charcoal dark:text-cream"
                                            placeholder="Enter session name"
                                        />
                                    </div>

                                    {/* Experience Level */}
                                    <div>
                                        <label className="block text-sm font-display font-bold text-charcoal dark:text-cream mb-2">
                                            Experience Level (Years)
                                        </label>
                                        <select
                                            value={sessionData.experience}
                                            onChange={(e) => setSessionData({...sessionData, experience: e.target.value})}
                                            className="w-full px-4 py-3 border-2 border-charcoal dark:border-cream/40 rounded-md focus:ring-0 focus:border-charcoal outline-none bg-white dark:bg-navy-light text-charcoal dark:text-cream cursor-pointer"
                                        >
                                            <option value="1">1 Year (Beginner)</option>
                                            <option value="2">2 Years (Junior)</option>
                                            <option value="3">3 Years (Mid-level)</option>
                                            <option value="4">4 Years (Senior)</option>
                                            <option value="5">5+ Years (Expert)</option>
                                        </select>
                                    </div>

                                    {/* Number of Questions */}
                                    <div>
                                        <label className="block text-sm font-display font-bold text-charcoal dark:text-cream mb-2">
                                            Number of Questions
                                        </label>
                                        <select
                                            value={sessionData.numberOfQuestions}
                                            onChange={(e) => setSessionData({...sessionData, numberOfQuestions: e.target.value})}
                                            className="w-full px-4 py-3 border-2 border-charcoal dark:border-cream/40 rounded-md focus:ring-0 focus:border-charcoal outline-none bg-white dark:bg-navy-light text-charcoal dark:text-cream cursor-pointer"
                                        >
                                            <option value="5">5 Questions (Quick Practice)</option>
                                            <option value="10">10 Questions (Standard)</option>
                                            <option value="15">15 Questions (Extended)</option>
                                            <option value="20">20 Questions (Comprehensive)</option>
                                            <option value="25">25 Questions (Intensive)</option>
                                        </select>
                                    </div>

                                    {/* Topics */}
                                    <div>
                                        <label className="block text-sm font-display font-bold text-charcoal dark:text-cream mb-2">
                                            Topics to Focus On
                                        </label>
                                        <textarea
                                            value={sessionData.topicsToFocus}
                                            onChange={(e) => setSessionData({...sessionData, topicsToFocus: e.target.value})}
                                            rows={3}
                                            className="w-full px-4 py-3 border-2 border-charcoal dark:border-cream/40 rounded-md focus:ring-0 focus:border-charcoal outline-none bg-white dark:bg-navy-light text-charcoal dark:text-cream"
                                            placeholder="Enter topics separated by commas"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-display font-bold text-charcoal dark:text-cream mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={sessionData.description}
                                            onChange={(e) => setSessionData({...sessionData, description: e.target.value})}
                                            rows={3}
                                            className="w-full px-4 py-3 border-2 border-charcoal dark:border-cream/40 rounded-md focus:ring-0 focus:border-charcoal outline-none bg-white dark:bg-navy-light text-charcoal dark:text-cream"
                                            placeholder="Describe what this session will cover"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Preview & Actions */}
                            <div className="space-y-6">
                                {/* Session Preview */}
                                <div className="card-editorial p-8">
                                    <h3 className="text-xl font-display font-bold text-charcoal dark:text-cream mb-4">Session Preview</h3>
                                    
                                    <div className="space-y-4 font-body">
                                        <div className="flex items-center gap-3">
                                            <LuBrain className="w-5 h-5 text-charcoal dark:text-cream" />
                                            <div>
                                                <div className="font-bold text-charcoal dark:text-cream">{sessionData.role || 'Session Name'}</div>
                                                <div className="text-sm text-charcoal/80 dark:text-cream/80">{sessionData.experience} years experience</div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <LuTarget className="w-5 h-5 text-charcoal dark:text-cream mt-1" />
                                            <div>
                                                <div className="font-bold text-charcoal dark:text-cream mb-1">Topics</div>
                                                <div className="text-sm text-charcoal/80 dark:text-cream/80">
                                                    {sessionData.topicsToFocus || 'No topics specified'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <LuBookOpen className="w-5 h-5 text-charcoal dark:text-cream mt-1" />
                                            <div>
                                                <div className="font-bold text-charcoal dark:text-cream mb-1">Description</div>
                                                <div className="text-sm text-charcoal/80 dark:text-cream/80">
                                                    {sessionData.description || 'No description provided'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <LuTarget className="w-5 h-5 text-charcoal dark:text-cream mt-1" />
                                            <div>
                                                <div className="font-bold text-charcoal dark:text-cream mb-1">Questions</div>
                                                <div className="text-sm text-charcoal/80 dark:text-cream/80">
                                                    {sessionData.numberOfQuestions} questions
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Create Button */}
                                <button
                                    onClick={handleCreateSession}
                                    disabled={isCreating || !sessionData.role.trim()}
                                    className={`w-full flex items-center justify-center gap-3 px-6 py-4 font-bold uppercase tracking-wider text-sm border-2 border-charcoal dark:border-cream/40 rounded-md transition-all duration-300 ${
                                        isCreating || !sessionData.role.trim()
                                            ? 'bg-charcoal/20 dark:bg-cream/20 text-charcoal/50 dark:text-cream/50 cursor-not-allowed'
                                            : `bg-charcoal dark:bg-cream text-white dark:text-navy hover:-translate-y-1 cursor-pointer`
                                    }`}
                                    onMouseEnter={(e) => { if (!isCreating && sessionData.role.trim()) e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-shadow)'; }}
                                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                                >
                                    {isCreating ? (
                                        <>
                                            <LuLoader className="w-5 h-5 animate-spin" />
                                            <span>Creating Session...</span>
                                        </>
                                    ) : (
                                        <>
                                            <LuRocket className="w-5 h-5" />
                                            <span>Create Session</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        </>
                    ) : (
                        <>
                            {/* Success State */}
                            <div className="card-editorial p-12 text-center">
                            <div className={`w-20 h-20 rounded-full bg-charcoal dark:bg-cream flex items-center justify-center mx-auto mb-6`}>
                                <LuCheck className="w-10 h-10 text-white dark:text-navy" />
                            </div>
                            
                            <h2 className="text-3xl font-display font-bold text-charcoal dark:text-cream mb-4">
                                Session Created Successfully!
                            </h2>
                            
                            <p className="text-xl text-charcoal/80 dark:text-cream/80 mb-8 font-body">
                                Your session "{createdSession?.role}" is ready for practice.
                            </p>

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={handleStartSession}
                                    className={`flex items-center gap-2 px-8 py-4 font-bold uppercase tracking-wider text-sm text-white dark:text-navy rounded-md bg-charcoal dark:bg-cream border-2 border-charcoal dark:border-cream/40 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all cursor-pointer`}
                                >
                                    <LuRocket className="w-5 h-5" />
                                    <span>Start Session</span>
                                </button>
                                
                                <button
                                    onClick={() => navigate(`/phase-sessions/${encodeURIComponent(role)}/${phaseId}`)}
                                    className="flex items-center gap-2 px-8 py-4 font-bold uppercase tracking-wider text-sm text-charcoal dark:text-cream bg-white dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 rounded-md hover:-translate-y-1 transition-all cursor-pointer"
                                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-shadow)'}
                                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                                >
                                    <LuArrowLeft className="w-5 h-5" />
                                    <span>Back to Library</span>
                                </button>
                            </div>
                        </div>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CreateSessionPage;
