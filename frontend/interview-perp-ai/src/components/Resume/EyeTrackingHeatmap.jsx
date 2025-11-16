import React, { useState, useEffect } from 'react';
import {
    LuEye,
    LuClock,
    LuTarget,
    LuInfo,
    LuPlay,
    LuPause,
    LuRefreshCw,
    LuZap,
    LuTrendingUp
} from 'react-icons/lu';

const EyeTrackingHeatmap = ({ isActive, resumeContent }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [heatmapData, setHeatmapData] = useState([]);
    const [insights, setInsights] = useState({});

    // Simulated eye-tracking data based on resume analysis
    const generateHeatmapData = () => {
        const sections = [
            { name: 'Header/Contact', priority: 'high', readTime: 2.3, attention: 95 },
            { name: 'Professional Summary', priority: 'high', readTime: 4.1, attention: 88 },
            { name: 'Experience Section', priority: 'high', readTime: 8.7, attention: 92 },
            { name: 'Technical Skills', priority: 'medium', readTime: 3.2, attention: 76 },
            { name: 'Education', priority: 'low', readTime: 1.8, attention: 45 },
            { name: 'Additional Sections', priority: 'low', readTime: 1.2, attention: 32 }
        ];

        return sections.map((section, index) => ({
            ...section,
            x: 20 + (index % 2) * 300,
            y: 80 + Math.floor(index / 2) * 120,
            width: 280,
            height: 80,
            intensity: section.attention / 100
        }));
    };

    // Eye movement simulation steps
    const eyeMovementSteps = [
        { x: 150, y: 100, duration: 2300, section: 'Header/Contact', description: 'First fixation on name and contact info' },
        { x: 200, y: 180, duration: 4100, section: 'Professional Summary', description: 'Reading professional summary' },
        { x: 180, y: 280, duration: 3200, section: 'Experience', description: 'Scanning job titles and companies' },
        { x: 220, y: 320, duration: 2800, section: 'Experience', description: 'Reading key achievements' },
        { x: 400, y: 200, duration: 1900, section: 'Skills', description: 'Quick scan of technical skills' },
        { x: 380, y: 380, duration: 1200, section: 'Education', description: 'Brief look at education' }
    ];

    const startSimulation = () => {
        setIsPlaying(true);
        setCurrentStep(0);
        
        const runStep = (stepIndex) => {
            if (stepIndex >= eyeMovementSteps.length) {
                setIsPlaying(false);
                return;
            }
            
            setCurrentStep(stepIndex);
            setTimeout(() => {
                if (isPlaying) {
                    runStep(stepIndex + 1);
                }
            }, eyeMovementSteps[stepIndex].duration);
        };
        
        runStep(0);
    };

    const pauseSimulation = () => {
        setIsPlaying(false);
    };

    const resetSimulation = () => {
        setIsPlaying(false);
        setCurrentStep(0);
    };

    useEffect(() => {
        setHeatmapData(generateHeatmapData());
        setInsights({
            totalReadTime: '15.3 seconds',
            primaryFocus: 'Experience section (57% of time)',
            readingPattern: 'F-pattern (optimal)',
            attentionScore: 78,
            improvements: [
                'Move key achievements higher in experience section',
                'Strengthen professional summary with metrics',
                'Consider adding visual hierarchy with better formatting'
            ]
        });
    }, [resumeContent]);

    if (!isActive) return null;

    return (
        <div className="absolute inset-0 bg-black/5 backdrop-blur-sm z-20 rounded-2xl overflow-hidden">
            {/* Control Panel */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-30">
                <div className="flex items-center gap-2 mb-3">
                    <LuEye className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-slate-800">Eye Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={isPlaying ? pauseSimulation : startSimulation}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200 transition-colors"
                    >
                        {isPlaying ? <LuPause className="w-3 h-3" /> : <LuPlay className="w-3 h-3" />}
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button
                        onClick={resetSimulation}
                        className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm hover:bg-slate-200 transition-colors"
                    >
                        <LuRefreshCw className="w-3 h-3" />
                        Reset
                    </button>
                </div>
            </div>

            {/* Heatmap Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    <radialGradient id="heatmapHigh" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(239, 68, 68, 0.4)" />
                        <stop offset="50%" stopColor="rgba(245, 158, 11, 0.3)" />
                        <stop offset="100%" stopColor="rgba(245, 158, 11, 0.1)" />
                    </radialGradient>
                    <radialGradient id="heatmapMedium" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(245, 158, 11, 0.3)" />
                        <stop offset="50%" stopColor="rgba(234, 179, 8, 0.2)" />
                        <stop offset="100%" stopColor="rgba(234, 179, 8, 0.1)" />
                    </radialGradient>
                    <radialGradient id="heatmapLow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
                        <stop offset="50%" stopColor="rgba(59, 130, 246, 0.1)" />
                        <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
                    </radialGradient>
                </defs>

                {/* Static Heatmap Areas */}
                {heatmapData.map((area, index) => (
                    <rect
                        key={index}
                        x={area.x}
                        y={area.y}
                        width={area.width}
                        height={area.height}
                        fill={
                            area.intensity > 0.8 ? 'url(#heatmapHigh)' :
                            area.intensity > 0.5 ? 'url(#heatmapMedium)' :
                            'url(#heatmapLow)'
                        }
                        rx="8"
                        className="animate-pulse"
                    />
                ))}

                {/* Current Eye Position */}
                {isPlaying && currentStep < eyeMovementSteps.length && (
                    <g>
                        <circle
                            cx={eyeMovementSteps[currentStep].x}
                            cy={eyeMovementSteps[currentStep].y}
                            r="20"
                            fill="rgba(147, 51, 234, 0.2)"
                            className="animate-ping"
                        />
                        <circle
                            cx={eyeMovementSteps[currentStep].x}
                            cy={eyeMovementSteps[currentStep].y}
                            r="8"
                            fill="rgba(147, 51, 234, 0.8)"
                        />
                    </g>
                )}

                {/* Eye Movement Path */}
                {currentStep > 0 && (
                    <path
                        d={`M ${eyeMovementSteps[0].x} ${eyeMovementSteps[0].y} ${
                            eyeMovementSteps.slice(1, currentStep + 1)
                                .map(step => `L ${step.x} ${step.y}`)
                                .join(' ')
                        }`}
                        stroke="rgba(147, 51, 234, 0.6)"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="5,5"
                        className="animate-pulse"
                    />
                )}
            </svg>

            {/* Current Step Info */}
            {isPlaying && currentStep < eyeMovementSteps.length && (
                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <LuTarget className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-slate-800">
                            Step {currentStep + 1} of {eyeMovementSteps.length}
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                        {eyeMovementSteps[currentStep].description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                            <LuClock className="w-3 h-3" />
                            <span>{(eyeMovementSteps[currentStep].duration / 1000).toFixed(1)}s</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <LuEye className="w-3 h-3" />
                            <span>{eyeMovementSteps[currentStep].section}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Insights Panel */}
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
                <div className="flex items-center gap-2 mb-3">
                    <LuTrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-slate-800">Reading Analytics</span>
                </div>
                
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <div className="text-slate-500">Total Time</div>
                            <div className="font-semibold text-slate-800">{insights.totalReadTime}</div>
                        </div>
                        <div>
                            <div className="text-slate-500">Attention Score</div>
                            <div className="font-semibold text-slate-800">{insights.attentionScore}%</div>
                        </div>
                    </div>
                    
                    <div>
                        <div className="text-slate-500 text-sm mb-1">Primary Focus</div>
                        <div className="text-sm font-medium text-slate-800">{insights.primaryFocus}</div>
                    </div>
                    
                    <div>
                        <div className="text-slate-500 text-sm mb-1">Reading Pattern</div>
                        <div className="text-sm font-medium text-emerald-600">{insights.readingPattern}</div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3">
                <div className="text-sm font-medium text-slate-800 mb-2">Heat Intensity</div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-400 rounded"></div>
                        <span className="text-xs text-slate-600">High (80%+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-amber-400 rounded"></div>
                        <span className="text-xs text-slate-600">Medium (50-80%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-400 rounded"></div>
                        <span className="text-xs text-slate-600">Low (0-50%)</span>
                    </div>
                </div>
            </div>

            {/* Improvement Tips */}
            {!isPlaying && currentStep === 0 && (
                <div className="absolute inset-x-4 bottom-20 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <LuZap className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Optimization Tips</span>
                    </div>
                    <ul className="text-sm text-blue-700 space-y-1">
                        {insights.improvements?.map((tip, index) => (
                            <li key={index}>• {tip}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default EyeTrackingHeatmap;
