import React, { useEffect, useRef, useState } from 'react';
import { Eye, AlertTriangle, CheckCircle } from 'lucide-react';

const FacialAnalyzer = ({ videoRef, isActive, onAnalysisUpdate }) => {
    const canvasRef = useRef(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentAnalysis, setCurrentAnalysis] = useState(null);
    const analysisIntervalRef = useRef(null);

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
        
        // Analyze every 2 seconds
        analysisIntervalRef.current = setInterval(() => {
            if (videoRef.current && videoRef.current.readyState === 4) {
                performFacialAnalysis();
            }
        }, 2000);
    };

    const stopAnalysis = () => {
        setIsAnalyzing(false);
        if (analysisIntervalRef.current) {
            clearInterval(analysisIntervalRef.current);
        }
    };

    const performFacialAnalysis = async () => {
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
            
            // Simulate facial analysis (in real implementation, you'd use a library like face-api.js)
            const analysis = await simulateFacialAnalysis(imageData);
            
            setCurrentAnalysis(analysis);
            onAnalysisUpdate(analysis);
            
        } catch (error) {
            console.error('Error in facial analysis:', error);
        }
    };

    const simulateFacialAnalysis = async (imageData) => {
        // This is a simulation. In real implementation, you'd use:
        // - face-api.js for face detection and emotion recognition
        // - MediaPipe for face landmarks and eye tracking
        // - TensorFlow.js models for expression analysis
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate realistic analysis results
                const baseConfidence = 0.6 + Math.random() * 0.3;
                const eyeContactProbability = Math.random();
                const isLookingAtCamera = eyeContactProbability > 0.3;
                
                const analysis = {
                    timestamp: Date.now(),
                    emotions: {
                        confidence: Math.max(0, Math.min(1, baseConfidence + (Math.random() - 0.5) * 0.2)),
                        nervousness: Math.max(0, Math.min(1, 0.3 + (Math.random() - 0.5) * 0.4)),
                        engagement: Math.max(0, Math.min(1, 0.7 + (Math.random() - 0.5) * 0.3)),
                        stress: Math.max(0, Math.min(1, 0.2 + (Math.random() - 0.5) * 0.3)),
                        happiness: Math.max(0, Math.min(1, 0.5 + (Math.random() - 0.5) * 0.4)),
                        surprise: Math.max(0, Math.min(1, 0.1 + Math.random() * 0.2)),
                        neutral: Math.max(0, Math.min(1, 0.4 + (Math.random() - 0.5) * 0.3))
                    },
                    eyeContact: {
                        lookingAtCamera: isLookingAtCamera,
                        gazeDirection: isLookingAtCamera ? 'center' : ['left', 'right', 'up', 'down'][Math.floor(Math.random() * 4)],
                        blinkRate: 15 + Math.random() * 10 // blinks per minute
                    },
                    posture: {
                        headPosition: Math.random() > 0.8 ? ['tilted-left', 'tilted-right'][Math.floor(Math.random() * 2)] : 'straight',
                        shoulderAlignment: Math.random() > 0.9 ? 'uneven' : 'aligned',
                        distanceFromCamera: Math.random() > 0.1 ? 'optimal' : ['too-close', 'too-far'][Math.floor(Math.random() * 2)]
                    },
                    faceDetected: true,
                    faceCount: 1,
                    quality: {
                        lighting: Math.random() > 0.2 ? 'good' : 'poor',
                        clarity: Math.random() > 0.1 ? 'clear' : 'blurry',
                        angle: Math.random() > 0.15 ? 'frontal' : 'angled'
                    }
                };
                
                resolve(analysis);
            }, 100);
        });
    };

    const getEyeContactStatus = () => {
        if (!currentAnalysis) return { status: 'unknown', color: 'text-gray-400' };
        
        if (currentAnalysis.eyeContact.lookingAtCamera) {
            return { status: 'Good eye contact', color: 'text-green-400' };
        } else {
            return { 
                status: `Looking ${currentAnalysis.eyeContact.gazeDirection}`, 
                color: 'text-yellow-400' 
            };
        }
    };

    const getConfidenceLevel = () => {
        if (!currentAnalysis) return { level: 'Unknown', color: 'text-gray-400' };
        
        const confidence = currentAnalysis.emotions.confidence;
        if (confidence > 0.7) return { level: 'High', color: 'text-green-400' };
        if (confidence > 0.5) return { level: 'Medium', color: 'text-yellow-400' };
        return { level: 'Low', color: 'text-red-400' };
    };

    const eyeContactStatus = getEyeContactStatus();
    const confidenceLevel = getConfidenceLevel();

    return (
        <div className="absolute top-4 left-4 bg-black/50 rounded-lg p-3 backdrop-blur-sm">
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="flex items-center space-x-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-xs font-medium text-white">Facial Analysis</span>
            </div>
            
            <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                    <Eye className="w-3 h-3 text-blue-400" />
                    <span className={eyeContactStatus.color}>{eyeContactStatus.status}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-purple-400" />
                    <span className={confidenceLevel.color}>Confidence: {confidenceLevel.level}</span>
                </div>
                
                {currentAnalysis?.emotions.nervousness > 0.6 && (
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-3 h-3 text-yellow-400" />
                        <span className="text-yellow-400">High nervousness detected</span>
                    </div>
                )}
                
                {currentAnalysis?.posture.headPosition !== 'straight' && (
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-3 h-3 text-orange-400" />
                        <span className="text-orange-400">Head tilted</span>
                    </div>
                )}
                
                {currentAnalysis?.quality.lighting === 'poor' && (
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        <span className="text-red-400">Poor lighting</span>
                    </div>
                )}
            </div>
            
            {currentAnalysis && (
                <div className="mt-2 pt-2 border-t border-gray-600">
                    <div className="text-xs text-gray-300">
                        Engagement: {Math.round(currentAnalysis.emotions.engagement * 100)}%
                    </div>
                    <div className="text-xs text-gray-300">
                        Blink Rate: {Math.round(currentAnalysis.eyeContact.blinkRate)}/min
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacialAnalyzer;
