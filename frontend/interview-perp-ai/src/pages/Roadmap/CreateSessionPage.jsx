import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader.jsx';
import { 
    LuRocket, 
    LuArrowLeft, 
    LuCheck, 
    LuBrain,
    LuTarget,
    LuBookOpen,
    LuChevronRight
} from 'react-icons/lu';

const CreateSessionPage = () => {
    const { role, phaseId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Get template data from URL params
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

    if (!currentPhase) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-screen bg-cream dark:bg-navy font-body">
                    <SpinnerLoader />
                    <p className="text-charcoal dark:text-cream mt-4 text-center font-bold font-mono text-xs uppercase tracking-widest">
                        Loading phase details... ✨
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-cream dark:bg-navy font-body transition-colors duration-300">
                {/* Header */}
                <div className="bg-cream dark:bg-navy text-charcoal dark:text-cream border-b-4 border-charcoal/15 dark:border-cream/20">
                    <div className="container mx-auto px-4 py-8 max-w-4xl">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-charcoal/60 dark:text-cream/60 text-xs font-mono font-bold uppercase tracking-wider mb-6">
                            <span 
                                onClick={() => navigate(`/roadmap?role=${encodeURIComponent(role)}`)}
                                className="hover:text-charcoal dark:hover:text-cream hover:underline cursor-pointer transition-colors"
                            >
                                {role}
                            </span>
                            <LuChevronRight className="w-4 h-4 text-charcoal/45" strokeWidth={3} />
                            <span 
                                onClick={() => navigate(`/phase/${encodeURIComponent(role)}/${phaseId}`)}
                                className="hover:text-charcoal dark:hover:text-cream hover:underline cursor-pointer transition-colors"
                            >
                                {currentPhase.name}
                            </span>
                            <LuChevronRight className="w-4 h-4 text-charcoal/45" strokeWidth={3} />
                            <span 
                                onClick={() => navigate(`/phase-sessions/${encodeURIComponent(role)}/${phaseId}`)}
                                className="hover:text-charcoal dark:hover:text-cream hover:underline cursor-pointer transition-colors"
                            >
                                Session Library
                            </span>
                            <LuChevronRight className="w-4 h-4 text-charcoal/45" strokeWidth={3} />
                            <span className="text-charcoal dark:text-cream font-bold">Create Session</span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-wider leading-tight">
                                    Create Session
                                </h1>
                                <p className="text-sm text-charcoal/70 dark:text-cream/70 mt-1 font-bold">
                                    Set up your custom practice diagnostics
                                </p>
                            </div>
                            
                            <button
                                onClick={() => navigate(`/phase-sessions/${encodeURIComponent(role)}/${phaseId}`)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-navy-light text-charcoal dark:text-cream font-mono font-bold uppercase tracking-widest text-[10px] rounded-sm border-3 border-charcoal dark:border-cream/40 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)]"
                            >
                                <LuArrowLeft className="w-3.5 h-3.5" strokeWidth={3} />
                                <span>Back to Library</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    {!isCreated ? (
                        <>
                            {/* Session Creation Form */}
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Session Details */}
                                <div className="card-editorial p-6 sm:p-8 bg-white dark:bg-navy-light">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-9 h-9 border-2 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy rounded-sm flex items-center justify-center shadow-[2px_2px_0px_0px_var(--color-shadow)] flex-shrink-0">
                                            <LuRocket className="w-5 h-5 text-charcoal dark:text-cream" strokeWidth={2.5} />
                                        </div>
                                        <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide">Session Details</h2>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Session Name */}
                                        <div>
                                            <label className="block text-xs font-mono font-bold text-charcoal dark:text-cream mb-2 uppercase tracking-wider">
                                                Session Name
                                            </label>
                                            <input
                                                type="text"
                                                value={sessionData.role}
                                                onChange={(e) => setSessionData({...sessionData, role: e.target.value})}
                                                className="w-full px-4 py-2.5 border-2 border-charcoal dark:border-cream/40 rounded-sm focus:ring-0 outline-none bg-cream dark:bg-navy text-charcoal dark:text-cream text-sm font-bold focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
                                                placeholder="Enter session name"
                                            />
                                        </div>

                                        {/* Experience Level */}
                                        <div>
                                            <label className="block text-xs font-mono font-bold text-charcoal dark:text-cream mb-2 uppercase tracking-wider">
                                                Experience Level
                                            </label>
                                            <select
                                                value={sessionData.experience}
                                                onChange={(e) => setSessionData({...sessionData, experience: e.target.value})}
                                                className="w-full px-4 py-2.5 border-2 border-charcoal dark:border-cream/40 rounded-sm focus:ring-0 outline-none bg-cream dark:bg-navy text-charcoal dark:text-cream text-sm font-bold cursor-pointer focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
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
                                            <label className="block text-xs font-mono font-bold text-charcoal dark:text-cream mb-2 uppercase tracking-wider">
                                                Number of Questions
                                            </label>
                                            <select
                                                value={sessionData.numberOfQuestions}
                                                onChange={(e) => setSessionData({...sessionData, numberOfQuestions: e.target.value})}
                                                className="w-full px-4 py-2.5 border-2 border-charcoal dark:border-cream/40 rounded-sm focus:ring-0 outline-none bg-cream dark:bg-navy text-charcoal dark:text-cream text-sm font-bold cursor-pointer focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
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
                                            <label className="block text-xs font-mono font-bold text-charcoal dark:text-cream mb-2 uppercase tracking-wider">
                                                Topics to Focus On
                                            </label>
                                            <textarea
                                                value={sessionData.topicsToFocus}
                                                onChange={(e) => setSessionData({...sessionData, topicsToFocus: e.target.value})}
                                                rows={3}
                                                className="w-full px-4 py-2.5 border-2 border-charcoal dark:border-cream/40 rounded-sm focus:ring-0 outline-none bg-cream dark:bg-navy text-charcoal dark:text-cream text-sm font-bold focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all leading-relaxed"
                                                placeholder="Enter topics separated by commas"
                                            />
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-xs font-mono font-bold text-charcoal dark:text-cream mb-2 uppercase tracking-wider">
                                                Description
                                            </label>
                                            <textarea
                                                value={sessionData.description}
                                                onChange={(e) => setSessionData({...sessionData, description: e.target.value})}
                                                rows={3}
                                                className="w-full px-4 py-2.5 border-2 border-charcoal dark:border-cream/40 rounded-sm focus:ring-0 outline-none bg-cream dark:bg-navy text-charcoal dark:text-cream text-sm font-bold focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all leading-relaxed"
                                                placeholder="Describe what this session will cover"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Preview & Actions */}
                                <div className="space-y-6">
                                    {/* Session Preview */}
                                    <div className="card-editorial p-6 sm:p-8 bg-white dark:bg-navy-light">
                                        <h3 className="text-xl font-display font-bold text-charcoal dark:text-cream mb-4 uppercase tracking-wider border-b-2 border-charcoal/10 pb-2">Session Preview</h3>
                                        
                                        <div className="space-y-4 font-body">
                                            <div className="flex items-center gap-3">
                                                <LuBrain className="w-5 h-5 text-charcoal/70 dark:text-cream/70" strokeWidth={2.5} />
                                                <div>
                                                    <div className="font-bold text-charcoal dark:text-cream">{sessionData.role || 'Session Name'}</div>
                                                    <div className="text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 mt-0.5">{sessionData.experience} years experience</div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 border-t border-dashed border-charcoal/10 pt-3">
                                                <LuTarget className="w-5 h-5 text-charcoal/70 dark:text-cream/70 mt-0.5" strokeWidth={2.5} />
                                                <div>
                                                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal/50 dark:text-cream/50 mb-1">Topics</div>
                                                    <div className="text-xs font-bold text-charcoal dark:text-cream leading-relaxed">
                                                        {sessionData.topicsToFocus || 'No topics specified'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 border-t border-dashed border-charcoal/10 pt-3">
                                                <LuBookOpen className="w-5 h-5 text-charcoal/70 dark:text-cream/70 mt-0.5" strokeWidth={2.5} />
                                                <div>
                                                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal/50 dark:text-cream/50 mb-1">Description</div>
                                                    <div className="text-xs font-bold text-charcoal dark:text-cream leading-relaxed">
                                                        {sessionData.description || 'No description provided'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 border-t border-dashed border-charcoal/10 pt-3">
                                                <LuTarget className="w-5 h-5 text-charcoal/70 dark:text-cream/70 mt-0.5" strokeWidth={2.5} />
                                                <div>
                                                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal/50 dark:text-cream/50 mb-1">Questions</div>
                                                    <div className="text-xs font-mono font-bold text-charcoal dark:text-cream">
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
                                        className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 font-mono font-bold uppercase tracking-widest text-xs border-3 rounded-sm transition-all duration-200 shadow-[3px_3px_0px_0px_var(--color-shadow)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer ${
                                            isCreating || !sessionData.role.trim()
                                                ? 'bg-white dark:bg-navy-light text-charcoal/45 dark:text-cream/45 border-charcoal/25 dark:border-cream/15 cursor-not-allowed shadow-none'
                                                : 'bg-charcoal text-white dark:bg-cream dark:text-navy border-charcoal dark:border-cream/40'
                                        }`}
                                    >
                                        {isCreating ? (
                                            <>
                                                <div className="w-3.5 h-3.5 border-2 border-white dark:border-navy border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
                                                <span>Creating Session...</span>
                                            </>
                                        ) : (
                                            <>
                                                <LuRocket className="w-4 h-4" strokeWidth={3} />
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
                            <div className="card-editorial p-10 text-center bg-white dark:bg-navy-light max-w-xl mx-auto my-12">
                                <div className="w-16 h-16 bg-green-500 border-3 border-charcoal rounded-sm flex items-center justify-center mx-auto mb-6 shadow-[3px_3px_0px_0px_var(--color-shadow)]">
                                    <LuCheck className="w-8 h-8 text-white" strokeWidth={3} />
                                </div>
                                
                                <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide mb-2">
                                    Session Configured!
                                </h2>
                                
                                <p className="text-sm font-bold text-charcoal/70 dark:text-cream/70 mb-8 font-mono">
                                    "{createdSession?.role}" is initialized and ready.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button
                                        onClick={handleStartSession}
                                        className="px-5 py-2.5 bg-charcoal text-white dark:bg-cream dark:text-navy border-3 border-charcoal dark:border-cream/40 font-mono font-bold uppercase tracking-widest text-[10px] rounded-sm hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 cursor-pointer"
                                    >
                                        <LuRocket className="w-3.5 h-3.5 inline mr-1.5" strokeWidth={3} />
                                        <span>Start Session</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => navigate(`/phase-sessions/${encodeURIComponent(role)}/${phaseId}`)}
                                        className="px-5 py-2.5 bg-white dark:bg-navy-light text-charcoal dark:text-cream border-3 border-charcoal dark:border-cream/40 font-mono font-bold uppercase tracking-widest text-[10px] rounded-sm hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)]"
                                    >
                                        <LuArrowLeft className="w-3.5 h-3.5 inline mr-1.5" strokeWidth={3} />
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
