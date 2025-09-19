import React, { useEffect, useState } from 'react';

const ProgressWave = ({ 
    progress = 0, 
    height = 120, 
    width = 200,
    color = 'blue',
    animated = true,
    showPercentage = true,
    label = '',
    encouragingIcon = '🌊'
}) => {
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const [waveOffset, setWaveOffset] = useState(0);

    // Gentle animation for progress
    useEffect(() => {
        if (animated) {
            const timer = setTimeout(() => {
                setAnimatedProgress(progress);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setAnimatedProgress(progress);
        }
    }, [progress, animated]);

    // Wave animation
    useEffect(() => {
        if (!animated) return;
        
        const interval = setInterval(() => {
            setWaveOffset(prev => (prev + 2) % 100);
        }, 100);

        return () => clearInterval(interval);
    }, [animated]);

    // Color schemes
    const colorSchemes = {
        blue: {
            wave: '#3B82F6',
            waveLight: '#93C5FD',
            bg: '#EFF6FF',
            text: 'text-blue-600',
            border: 'border-blue-200'
        },
        emerald: {
            wave: '#10B981',
            waveLight: '#6EE7B7',
            bg: '#ECFDF5',
            text: 'text-emerald-600',
            border: 'border-emerald-200'
        },
        purple: {
            wave: '#8B5CF6',
            waveLight: '#C4B5FD',
            bg: '#F5F3FF',
            text: 'text-purple-600',
            border: 'border-purple-200'
        },
        amber: {
            wave: '#F59E0B',
            waveLight: '#FCD34D',
            bg: '#FFFBEB',
            text: 'text-amber-600',
            border: 'border-amber-200'
        }
    };

    const scheme = colorSchemes[color] || colorSchemes.blue;
    const waveHeight = (animatedProgress / 100) * height;

    // Generate wave path
    const generateWavePath = (offset = 0, amplitude = 8) => {
        const points = [];
        const steps = 20;
        
        for (let i = 0; i <= steps; i++) {
            const x = (i / steps) * width;
            const y = height - waveHeight + Math.sin((i / steps) * Math.PI * 4 + offset * 0.1) * amplitude;
            points.push(`${x},${y}`);
        }
        
        return `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            {/* Wave Container */}
            <div className={`relative rounded-2xl border-2 ${scheme.border} overflow-hidden transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl`}
                 style={{ width, height, backgroundColor: scheme.bg }}>
                
                {/* Animated Wave */}
                <svg
                    className="absolute inset-0"
                    width={width}
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                >
                    {/* Main wave */}
                    <path
                        d={generateWavePath(waveOffset, 6)}
                        fill={scheme.wave}
                        opacity="0.8"
                        className="transition-all duration-1000 ease-out"
                    />
                    
                    {/* Secondary wave for depth */}
                    <path
                        d={generateWavePath(waveOffset + 50, 4)}
                        fill={scheme.waveLight}
                        opacity="0.6"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>

                {/* Progress Text Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {showPercentage && (
                        <div className={`text-2xl font-bold ${scheme.text} transition-all duration-300 drop-shadow-sm`}>
                            {Math.round(animatedProgress)}%
                        </div>
                    )}
                    {label && (
                        <div className="text-xs text-gray-600 font-medium text-center mt-1">
                            {label}
                        </div>
                    )}
                </div>

                {/* Floating particles for extra delight */}
                {animatedProgress > 0 && (
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-white rounded-full opacity-60 animate-bounce"
                                style={{
                                    left: `${20 + i * 30}%`,
                                    top: `${height - waveHeight - 20 + Math.sin(waveOffset * 0.1 + i) * 10}px`,
                                    animationDelay: `${i * 0.5}s`,
                                    animationDuration: '2s'
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Encouraging Message */}
            <div className="text-center max-w-xs">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-lg">{encouragingIcon}</span>
                    <span className={`text-sm font-medium ${scheme.text}`}>
                        {animatedProgress === 0 ? 'Ready to dive in?' : 
                         animatedProgress < 50 ? 'Making waves!' : 
                         animatedProgress < 100 ? 'Riding the wave!' : 
                         'Surfing to success!'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProgressWave;
