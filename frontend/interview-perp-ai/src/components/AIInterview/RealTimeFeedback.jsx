import React, { useState, useEffect } from 'react';
import { 
    Eye, AlertTriangle, CheckCircle, X, Volume2, 
    Camera, Users, Phone, Bell, Zap, Clock 
} from 'lucide-react';

const RealTimeFeedback = ({ flags, onDismiss }) => {
    const [visibleFlags, setVisibleFlags] = useState([]);
    const [dismissedFlags, setDismissedFlags] = useState(new Set());

    useEffect(() => {
        // Filter out dismissed flags and add new ones
        const newFlags = flags.filter(flag => !dismissedFlags.has(flag.id || flag.type + flag.timestamp));
        setVisibleFlags(newFlags.slice(-5)); // Show only last 5 flags
    }, [flags, dismissedFlags]);

    const handleDismiss = (flag) => {
        const flagId = flag.id || flag.type + flag.timestamp;
        setDismissedFlags(prev => new Set([...prev, flagId]));
        if (onDismiss) {
            onDismiss(flagId);
        }
    };

    const getFlagIcon = (type) => {
        switch (type) {
            case 'eye-contact': return <Eye className="w-4 h-4" />;
            case 'nervousness': return <AlertTriangle className="w-4 h-4" />;
            case 'background-noise': return <Volume2 className="w-4 h-4" />;
            case 'speaking-pace': return <Zap className="w-4 h-4" />;
            case 'lighting': return <Camera className="w-4 h-4" />;
            case 'background-movement': return <Users className="w-4 h-4" />;
            case 'interruption': return <Phone className="w-4 h-4" />;
            case 'posture': return <CheckCircle className="w-4 h-4" />;
            case 'volume': return <Volume2 className="w-4 h-4" />;
            case 'clarity': return <Volume2 className="w-4 h-4" />;
            default: return <Bell className="w-4 h-4" />;
        }
    };

    const getFlagColor = (severity) => {
        switch (severity) {
            case 'critical': return 'border-red-500 bg-red-50 text-red-800';
            case 'warning': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
            case 'info': return 'border-blue-500 bg-blue-50 text-blue-800';
            default: return 'border-gray-500 bg-gray-50 text-gray-800';
        }
    };

    const getIconColor = (severity) => {
        switch (severity) {
            case 'critical': return 'text-red-500';
            case 'warning': return 'text-yellow-500';
            case 'info': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    };

    if (visibleFlags.length === 0) {
        return (
            <div className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Real-time Feedback</span>
                </div>
                <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-green-400 font-medium">All Good!</p>
                    <p className="text-xs text-gray-400">No issues detected</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-white">Real-time Feedback</span>
            </div>
            
            <div className="space-y-2">
                {visibleFlags.map((flag, index) => (
                    <FeedbackCard 
                        key={flag.id || `${flag.type}-${flag.timestamp}-${index}`}
                        flag={flag}
                        onDismiss={() => handleDismiss(flag)}
                        getFlagIcon={getFlagIcon}
                        getFlagColor={getFlagColor}
                        getIconColor={getIconColor}
                    />
                ))}
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="text-xs text-gray-400 text-center">
                    Tips appear here in real-time
                </div>
            </div>
        </div>
    );
};

const FeedbackCard = ({ flag, onDismiss, getFlagIcon, getFlagColor, getIconColor }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Animate in
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => {
            onDismiss();
        }, 300);
    };

    // Auto-dismiss info flags after 10 seconds
    useEffect(() => {
        if (flag.severity === 'info') {
            const timer = setTimeout(() => {
                handleDismiss();
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [flag.severity]);

    return (
        <div className={`
            transform transition-all duration-300 ease-in-out
            ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            ${isExiting ? 'translate-x-full opacity-0' : ''}
        `}>
            <div className={`
                relative p-3 rounded-lg border-l-4 ${getFlagColor(flag.severity)}
                shadow-sm hover:shadow-md transition-shadow duration-200
            `}>
                <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 ${getIconColor(flag.severity)}`}>
                        {getFlagIcon(flag.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                                {flag.message || getDefaultMessage(flag.type)}
                            </p>
                            <button
                                onClick={handleDismiss}
                                className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                        
                        {flag.suggestion && (
                            <p className="text-xs mt-1 opacity-75">
                                💡 {flag.suggestion}
                            </p>
                        )}
                        
                        {flag.severity === 'critical' && (
                            <div className="mt-2 flex items-center space-x-1 text-xs">
                                <Clock className="w-3 h-3" />
                                <span>Immediate attention needed</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Progress bar for auto-dismiss */}
                {flag.severity === 'info' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 rounded-b-lg overflow-hidden">
                        <div className="h-full bg-blue-500 animate-shrink-width"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

const getDefaultMessage = (type) => {
    switch (type) {
        case 'eye-contact': return 'Maintain eye contact with camera';
        case 'nervousness': return 'Take a deep breath and relax';
        case 'background-noise': return 'Background noise detected';
        case 'speaking-pace': return 'Adjust your speaking pace';
        case 'lighting': return 'Check your lighting setup';
        case 'background-movement': return 'Movement in background';
        case 'interruption': return 'Interruption detected';
        case 'posture': return 'Check your posture';
        case 'volume': return 'Adjust your volume level';
        case 'clarity': return 'Speak more clearly';
        default: return 'Feedback available';
    }
};

export default RealTimeFeedback;
