import React, { useState, useEffect, useRef } from 'react';
import { 
    MessageCircle, 
    Volume2, 
    Eye, 
    User, 
    Clock, 
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Zap,
    Heart
} from 'lucide-react';

const RealTimeCoach = ({ 
    isActive, 
    analysisData, 
    currentQuestion, 
    interviewStarted,
    onCoachingAction 
}) => {
    const [activeCoaching, setActiveCoaching] = useState([]);
    const [coachingHistory, setCoachingHistory] = useState([]);
    const [coachingSettings, setCoachingSettings] = useState({
        hints: true,
        paceCoaching: true,
        confidenceBooster: true,
        bodyLanguageCoaching: true,
        intensity: 'medium' // low, medium, high
    });

    const lastAnalysisRef = useRef({});
    const coachingTimeoutRef = useRef({});

    useEffect(() => {
        if (isActive && interviewStarted && analysisData) {
            analyzeAndCoach();
        }
    }, [analysisData, isActive, interviewStarted]);

    const analyzeAndCoach = () => {
        const newCoaching = [];
        const currentTime = Date.now();

        // 1. PACE COACHING - Speaking Speed Analysis
        if (analysisData.voice && coachingSettings.paceCoaching) {
            const pace = analysisData.voice.pace;
            
            if (pace > 180) { // Too fast
                newCoaching.push({
                    id: `pace-fast-${currentTime}`,
                    type: 'pace',
                    severity: 'warning',
                    message: "You're speaking quite fast. Try to slow down a bit.",
                    icon: Clock,
                    color: 'amber',
                    duration: 4000,
                    action: 'breathe'
                });
            } else if (pace < 120) { // Too slow
                newCoaching.push({
                    id: `pace-slow-${currentTime}`,
                    type: 'pace',
                    severity: 'info',
                    message: "You can speak a bit faster to sound more confident.",
                    icon: TrendingUp,
                    color: 'blue',
                    duration: 3000,
                    action: 'energize'
                });
            }

            // Filler words coaching
            if (analysisData.voice.fillerWords > 3) {
                newCoaching.push({
                    id: `filler-${currentTime}`,
                    type: 'speech',
                    severity: 'warning',
                    message: "Try to reduce 'um' and 'uh'. Take a pause instead.",
                    icon: Volume2,
                    color: 'orange',
                    duration: 5000,
                    action: 'pause'
                });
            }
        }

        // 2. CONFIDENCE BOOSTER - Nervousness Detection
        if (analysisData.facial && coachingSettings.confidenceBooster) {
            const nervousness = analysisData.facial.emotions?.nervousness || 0;
            const confidence = analysisData.facial.emotions?.confidence || 0;

            if (nervousness > 0.7) {
                newCoaching.push({
                    id: `confidence-boost-${currentTime}`,
                    type: 'confidence',
                    severity: 'encouragement',
                    message: "Take a deep breath. You're doing great! Remember your strengths.",
                    icon: Heart,
                    color: 'pink',
                    duration: 6000,
                    action: 'encourage'
                });
            }

            if (confidence < 0.3 && nervousness < 0.5) {
                newCoaching.push({
                    id: `confidence-build-${currentTime}`,
                    type: 'confidence',
                    severity: 'info',
                    message: "Speak with more conviction. You know this!",
                    icon: Zap,
                    color: 'purple',
                    duration: 4000,
                    action: 'motivate'
                });
            }
        }

        // 3. BODY LANGUAGE COACHING - Posture & Eye Contact
        if (analysisData.facial && coachingSettings.bodyLanguageCoaching) {
            const eyeContact = analysisData.facial.eyeContact?.lookingAtCamera;
            
            if (eyeContact === false) {
                // Don't spam eye contact reminders
                const lastEyeContactReminder = lastAnalysisRef.current.lastEyeContactReminder || 0;
                if (currentTime - lastEyeContactReminder > 10000) { // 10 seconds cooldown
                    newCoaching.push({
                        id: `eye-contact-${currentTime}`,
                        type: 'body-language',
                        severity: 'info',
                        message: "Try to look at the camera more often for better eye contact.",
                        icon: Eye,
                        color: 'blue',
                        duration: 4000,
                        action: 'eye-contact'
                    });
                    lastAnalysisRef.current.lastEyeContactReminder = currentTime;
                }
            }

            // Posture coaching
            if (analysisData.facial.posture?.distanceFromCamera === 'too-close') {
                newCoaching.push({
                    id: `posture-close-${currentTime}`,
                    type: 'body-language',
                    severity: 'info',
                    message: "You're a bit too close to the camera. Move back slightly.",
                    icon: User,
                    color: 'indigo',
                    duration: 3000,
                    action: 'adjust-distance'
                });
            }
        }

        // 4. CONTEXTUAL HINTS - Question-specific help
        if (coachingSettings.hints && currentQuestion) {
            const questionType = currentQuestion.category?.toLowerCase();
            const timeSinceQuestionStart = currentTime - (currentQuestion.askedAt || currentTime);
            
            // If struggling with question for more than 30 seconds
            if (timeSinceQuestionStart > 30000 && !lastAnalysisRef.current[`hint-${currentQuestion.id}`]) {
                const hint = generateContextualHint(questionType, currentQuestion.question);
                if (hint) {
                    newCoaching.push({
                        id: `hint-${currentQuestion.id}`,
                        type: 'hint',
                        severity: 'help',
                        message: hint,
                        icon: MessageCircle,
                        color: 'emerald',
                        duration: 8000,
                        action: 'hint'
                    });
                    lastAnalysisRef.current[`hint-${currentQuestion.id}`] = true;
                }
            }
        }

        // Add new coaching messages
        if (newCoaching.length > 0) {
            setActiveCoaching(prev => [...prev, ...newCoaching]);
            setCoachingHistory(prev => [...prev, ...newCoaching]);
            
            // Auto-remove coaching messages after their duration
            newCoaching.forEach(coaching => {
                coachingTimeoutRef.current[coaching.id] = setTimeout(() => {
                    removeCoaching(coaching.id);
                }, coaching.duration);
            });

            // Trigger coaching action callback
            if (onCoachingAction) {
                newCoaching.forEach(coaching => {
                    onCoachingAction(coaching);
                });
            }
        }
    };

    const generateContextualHint = (questionType, question) => {
        const hints = {
            'behavioral': [
                "Use the STAR method: Situation, Task, Action, Result.",
                "Think of a specific example from your experience.",
                "Focus on what YOU did, not what the team did."
            ],
            'technical': [
                "Break down the problem step by step.",
                "Think about edge cases and constraints.",
                "Explain your thought process out loud."
            ],
            'system-design': [
                "Start with requirements and constraints.",
                "Think about scalability and trade-offs.",
                "Consider data flow and system components."
            ],
            'coding': [
                "Start with a brute force approach, then optimize.",
                "Think about time and space complexity.",
                "Test your solution with examples."
            ]
        };

        const typeHints = hints[questionType] || hints['technical'];
        return typeHints[Math.floor(Math.random() * typeHints.length)];
    };

    const removeCoaching = (coachingId) => {
        setActiveCoaching(prev => prev.filter(c => c.id !== coachingId));
        if (coachingTimeoutRef.current[coachingId]) {
            clearTimeout(coachingTimeoutRef.current[coachingId]);
            delete coachingTimeoutRef.current[coachingId];
        }
    };

    const getCoachingColor = (color, severity) => {
        const colors = {
            amber: severity === 'warning' ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-amber-50 border-amber-200 text-amber-700',
            blue: 'bg-blue-100 border-blue-300 text-blue-800',
            orange: 'bg-orange-100 border-orange-300 text-orange-800',
            pink: 'bg-pink-100 border-pink-300 text-pink-800',
            purple: 'bg-purple-100 border-purple-300 text-purple-800',
            indigo: 'bg-indigo-100 border-indigo-300 text-indigo-800',
            emerald: 'bg-emerald-100 border-emerald-300 text-emerald-800'
        };
        return colors[color] || colors.blue;
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'warning': return AlertTriangle;
            case 'encouragement': return Heart;
            case 'help': return MessageCircle;
            default: return CheckCircle;
        }
    };

    if (!isActive || !interviewStarted) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
            {/* Coaching Settings Toggle */}
            <div className="bg-gray-800 rounded-lg p-2 mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-300">AI Coach</span>
                    <button
                        onClick={() => setCoachingSettings(prev => ({ ...prev, hints: !prev.hints }))}
                        className={`text-xs px-2 py-1 rounded ${
                            coachingSettings.hints 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-600 text-gray-300'
                        }`}
                    >
                        {coachingSettings.hints ? 'ON' : 'OFF'}
                    </button>
                </div>
            </div>

            {/* Active Coaching Messages */}
            {activeCoaching.map((coaching) => {
                const IconComponent = coaching.icon;
                const SeverityIcon = getSeverityIcon(coaching.severity);
                
                return (
                    <div
                        key={coaching.id}
                        className={`
                            ${getCoachingColor(coaching.color, coaching.severity)}
                            border-2 rounded-lg p-3 shadow-lg backdrop-blur-sm
                            animate-in slide-in-from-right duration-300
                            max-w-sm
                        `}
                    >
                        <div className="flex items-start space-x-2">
                            <div className="flex-shrink-0 mt-0.5">
                                <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-tight">
                                    {coaching.message}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs opacity-75 capitalize">
                                        {coaching.type}
                                    </span>
                                    <button
                                        onClick={() => removeCoaching(coaching.id)}
                                        className="text-xs opacity-50 hover:opacity-75"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Progress bar for message duration */}
                        <div className="mt-2 w-full bg-black/10 rounded-full h-1">
                            <div 
                                className="bg-current h-1 rounded-full animate-pulse"
                                style={{
                                    animation: `shrink ${coaching.duration}ms linear forwards`
                                }}
                            />
                        </div>
                    </div>
                );
            })}

            {/* Coaching History Summary */}
            {coachingHistory.length > 0 && (
                <div className="bg-gray-800/90 rounded-lg p-2 backdrop-blur-sm">
                    <div className="text-xs text-gray-300 text-center">
                        {coachingHistory.length} coaching tips given
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};

export default RealTimeCoach;
