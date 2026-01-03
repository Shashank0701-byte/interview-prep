import React, { useEffect, useRef, useState } from 'react';
import { Monitor, Sun, AlertTriangle, CheckCircle, Users, Phone } from 'lucide-react';

const EnvironmentAnalyzer = ({ videoRef, isActive, onAnalysisUpdate }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentAnalysis, setCurrentAnalysis] = useState(null);
    const canvasRef = useRef(null);
    const previousFrameRef = useRef(null);
    const analysisIntervalRef = useRef(null);
    const [interruptions, setInterruptions] = useState([]);

    useEffect(() => {
        if (isActive && videoRef.current) {
            startAnalysis();
        } else {
            stopAnalysis();
        }

        return () => stopAnalysis();
    }, [isActive]);

    const startAnalysis = () => {
        setIsAnalyzing(true);
        
        // Analyze every 3 seconds for environment changes
        analysisIntervalRef.current = setInterval(() => {
            if (videoRef.current && videoRef.current.readyState === 4) {
                performEnvironmentAnalysis();
            }
        }, 3000);
    };

    const stopAnalysis = () => {
        setIsAnalyzing(false);
        if (analysisIntervalRef.current) {
            clearInterval(analysisIntervalRef.current);
        }
    };

    const performEnvironmentAnalysis = async () => {
        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Draw current frame
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Get image data for analysis
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Perform environment analysis
            const analysis = await analyzeEnvironment(imageData);
            
            setCurrentAnalysis(analysis);
            onAnalysisUpdate(analysis);
            
        } catch (error) {
            console.error('Error in environment analysis:', error);
        }
    };

    const analyzeEnvironment = async (imageData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = imageData.data;
                const width = imageData.width;
                const height = imageData.height;
                
                // Analyze lighting conditions
                const lighting = analyzeLighting(data);
                
                // Analyze background
                const background = analyzeBackground(data, width, height);
                
                // Detect motion/interruptions
                const motion = detectMotion(data, width, height);
                
                // Check for distractions
                const distractions = detectDistractions(data, width, height);
                
                const analysis = {
                    timestamp: Date.now(),
                    lighting: lighting,
                    background: background,
                    motion: motion,
                    distractions: distractions,
                    interruptions: generateInterruptions() // Simulate interruption detection
                };
                
                resolve(analysis);
            }, 50);
        });
    };

    const analyzeLighting = (data) => {
        let totalBrightness = 0;
        let darkPixels = 0;
        let brightPixels = 0;
        
        // Sample every 4th pixel for performance
        for (let i = 0; i < data.length; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Calculate luminance
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            totalBrightness += brightness;
            
            if (brightness < 50) darkPixels++;
            if (brightness > 200) brightPixels++;
        }
        
        const avgBrightness = totalBrightness / (data.length / 4);
        const totalPixels = data.length / 4;
        const darkRatio = darkPixels / totalPixels;
        const brightRatio = brightPixels / totalPixels;
        
        let quality = 'good';
        let shadows = false;
        let backlit = false;
        
        if (avgBrightness < 80) {
            quality = 'poor';
        } else if (avgBrightness < 120) {
            quality = 'adequate';
        } else if (avgBrightness > 200) {
            quality = 'excellent';
            if (brightRatio > 0.3) {
                backlit = true;
                quality = 'poor';
            }
        }
        
        if (darkRatio > 0.4) {
            shadows = true;
            quality = 'poor';
        }
        
        return {
            quality: quality,
            shadows: shadows,
            backlit: backlit,
            avgBrightness: Math.round(avgBrightness),
            contrast: Math.round((brightRatio - darkRatio) * 100)
        };
    };

    const analyzeBackground = (data, width, height) => {
        // Analyze the background area (assuming face is in center third)
        const centerX = width / 2;
        const centerY = height / 2;
        const faceRadius = Math.min(width, height) / 6;
        
        let backgroundPixels = [];
        let colorVariance = 0;
        let edgeCount = 0;
        
        // Sample background pixels (outside face area)
        for (let y = 0; y < height; y += 10) {
            for (let x = 0; x < width; x += 10) {
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                
                if (distance > faceRadius * 1.5) {
                    const index = (y * width + x) * 4;
                    if (index < data.length - 3) {
                        backgroundPixels.push({
                            r: data[index],
                            g: data[index + 1],
                            b: data[index + 2]
                        });
                    }
                }
            }
        }
        
        // Calculate color variance
        if (backgroundPixels.length > 0) {
            const avgColor = backgroundPixels.reduce((acc, pixel) => ({
                r: acc.r + pixel.r,
                g: acc.g + pixel.g,
                b: acc.b + pixel.b
            }), { r: 0, g: 0, b: 0 });
            
            avgColor.r /= backgroundPixels.length;
            avgColor.g /= backgroundPixels.length;
            avgColor.b /= backgroundPixels.length;
            
            colorVariance = backgroundPixels.reduce((acc, pixel) => {
                return acc + Math.abs(pixel.r - avgColor.r) + 
                           Math.abs(pixel.g - avgColor.g) + 
                           Math.abs(pixel.b - avgColor.b);
            }, 0) / backgroundPixels.length;
        }
        
        // Detect edges (indicating clutter)
        for (let y = 1; y < height - 1; y += 5) {
            for (let x = 1; x < width - 1; x += 5) {
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                
                if (distance > faceRadius * 1.5) {
                    const index = (y * width + x) * 4;
                    const currentBrightness = 0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
                    const rightBrightness = 0.299 * data[index + 4] + 0.587 * data[index + 5] + 0.114 * data[index + 6];
                    
                    if (Math.abs(currentBrightness - rightBrightness) > 30) {
                        edgeCount++;
                    }
                }
            }
        }
        
        // Determine background type and quality
        let type = 'plain-wall';
        let professional = true;
        let distracting = false;
        let movement = false;
        
        if (colorVariance > 50) {
            type = Math.random() > 0.5 ? 'office' : 'home';
            if (colorVariance > 80) {
                distracting = true;
                professional = false;
            }
        }
        
        if (edgeCount > 20) {
            distracting = true;
            professional = false;
            type = 'cluttered';
        }
        
        // Detect movement in background (simplified)
        if (previousFrameRef.current) {
            movement = detectBackgroundMovement(data, previousFrameRef.current, width, height, centerX, centerY, faceRadius);
        }
        
        previousFrameRef.current = new Uint8ClampedArray(data);
        
        return {
            professional: professional,
            distracting: distracting,
            movement: movement,
            type: type,
            colorVariance: Math.round(colorVariance),
            edgeCount: edgeCount
        };
    };

    const detectBackgroundMovement = (currentData, previousData, width, height, centerX, centerY, faceRadius) => {
        let movementPixels = 0;
        let totalChecked = 0;
        
        for (let y = 0; y < height; y += 15) {
            for (let x = 0; x < width; x += 15) {
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                
                if (distance > faceRadius * 1.5) {
                    const index = (y * width + x) * 4;
                    if (index < currentData.length - 3) {
                        const currentBrightness = 0.299 * currentData[index] + 0.587 * currentData[index + 1] + 0.114 * currentData[index + 2];
                        const previousBrightness = 0.299 * previousData[index] + 0.587 * previousData[index + 1] + 0.114 * previousData[index + 2];
                        
                        if (Math.abs(currentBrightness - previousBrightness) > 20) {
                            movementPixels++;
                        }
                        totalChecked++;
                    }
                }
            }
        }
        
        return totalChecked > 0 && (movementPixels / totalChecked) > 0.1;
    };

    const detectMotion = (data, width, height) => {
        // This would use more sophisticated motion detection in real implementation
        // For now, we'll simulate motion detection
        return {
            detected: Math.random() > 0.9,
            intensity: Math.random() * 100,
            area: Math.random() > 0.8 ? 'background' : 'foreground'
        };
    };

    const detectDistractions = (data, width, height) => {
        // Simulate distraction detection (notifications, people, etc.)
        const distractions = [];
        
        if (Math.random() > 0.95) {
            distractions.push({
                type: 'notification',
                severity: 'minor',
                description: 'Screen notification detected'
            });
        }
        
        if (Math.random() > 0.98) {
            distractions.push({
                type: 'person',
                severity: 'major',
                description: 'Person visible in background'
            });
        }
        
        return distractions;
    };

    const generateInterruptions = () => {
        // Simulate interruption detection
        const interruptions = [];
        
        if (Math.random() > 0.97) {
            const interruptionTypes = [
                { type: 'phone', severity: 'moderate', duration: 3 },
                { type: 'doorbell', severity: 'major', duration: 5 },
                { type: 'notification', severity: 'minor', duration: 1 },
                { type: 'people', severity: 'major', duration: 8 },
                { type: 'pets', severity: 'moderate', duration: 4 }
            ];
            
            const interruption = interruptionTypes[Math.floor(Math.random() * interruptionTypes.length)];
            interruptions.push(interruption);
            
            // Add to interruptions list for display
            setInterruptions(prev => [...prev.slice(-4), {
                ...interruption,
                timestamp: Date.now(),
                id: Date.now()
            }]);
        }
        
        return interruptions;
    };

    const getLightingStatus = () => {
        if (!currentAnalysis) return { status: 'Unknown', color: 'text-gray-400' };
        
        switch (currentAnalysis.lighting.quality) {
            case 'excellent': return { status: 'Excellent', color: 'text-green-400' };
            case 'good': return { status: 'Good', color: 'text-green-400' };
            case 'adequate': return { status: 'Adequate', color: 'text-yellow-400' };
            case 'poor': return { status: 'Poor', color: 'text-red-400' };
            default: return { status: 'Unknown', color: 'text-gray-400' };
        }
    };

    const getBackgroundStatus = () => {
        if (!currentAnalysis) return { status: 'Unknown', color: 'text-gray-400' };
        
        if (currentAnalysis.background.professional) {
            return { status: 'Professional', color: 'text-green-400' };
        } else if (currentAnalysis.background.distracting) {
            return { status: 'Distracting', color: 'text-red-400' };
        } else {
            return { status: 'Acceptable', color: 'text-yellow-400' };
        }
    };

    const lightingStatus = getLightingStatus();
    const backgroundStatus = getBackgroundStatus();

    return (
        <div className="bg-gray-800 rounded-xl p-4">
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="flex items-center space-x-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium text-white">Environment</span>
            </div>
            
            <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Sun className="w-3 h-3 text-yellow-400" />
                        <span className="text-gray-300">Lighting:</span>
                    </div>
                    <span className={lightingStatus.color}>{lightingStatus.status}</span>
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Monitor className="w-3 h-3 text-blue-400" />
                        <span className="text-gray-300">Background:</span>
                    </div>
                    <span className={backgroundStatus.color}>{backgroundStatus.status}</span>
                </div>
                
                {currentAnalysis?.lighting.shadows && (
                    <div className="flex items-center space-x-2 text-orange-400">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Shadows detected</span>
                    </div>
                )}
                
                {currentAnalysis?.lighting.backlit && (
                    <div className="flex items-center space-x-2 text-red-400">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Backlit - adjust lighting</span>
                    </div>
                )}
                
                {currentAnalysis?.background.movement && (
                    <div className="flex items-center space-x-2 text-yellow-400">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Background movement</span>
                    </div>
                )}
                
                {currentAnalysis?.distractions.length > 0 && (
                    <div className="space-y-1">
                        {currentAnalysis.distractions.map((distraction, index) => (
                            <div key={index} className="flex items-center space-x-2 text-red-400">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{distraction.description}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Recent Interruptions */}
            {interruptions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="text-xs text-gray-400 mb-2">Recent Interruptions:</div>
                    <div className="space-y-1">
                        {interruptions.slice(-3).map((interruption) => (
                            <div key={interruption.id} className="flex items-center space-x-2 text-xs">
                                {interruption.type === 'phone' && <Phone className="w-3 h-3 text-blue-400" />}
                                {interruption.type === 'people' && <Users className="w-3 h-3 text-purple-400" />}
                                {interruption.type === 'notification' && <Monitor className="w-3 h-3 text-yellow-400" />}
                                <span className={`${
                                    interruption.severity === 'major' ? 'text-red-400' :
                                    interruption.severity === 'moderate' ? 'text-yellow-400' :
                                    'text-blue-400'
                                }`}>
                                    {interruption.type} ({interruption.duration}s)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {currentAnalysis && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                        <div>Brightness: {currentAnalysis.lighting.avgBrightness}</div>
                        <div>Contrast: {currentAnalysis.lighting.contrast}%</div>
                        <div>BG Type: {currentAnalysis.background.type}</div>
                        <div>Variance: {currentAnalysis.background.colorVariance}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnvironmentAnalyzer;
