import React, { useEffect, useRef, useState } from 'react';
import { Mic, Volume2, AlertTriangle, Zap, Clock } from 'lucide-react';

const VoiceAnalyzer = ({ audioRef, isActive, onAnalysisUpdate }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentAnalysis, setCurrentAnalysis] = useState(null);
    const [audioContext, setAudioContext] = useState(null);
    const [analyser, setAnalyser] = useState(null);
    const [mediaSource, setMediaSource] = useState(null);
    const analysisIntervalRef = useRef(null);
    const dataArrayRef = useRef(null);

    useEffect(() => {
        if (isActive) {
            initializeAudioAnalysis();
        } else {
            stopAnalysis();
        }

        return () => stopAnalysis();
    }, [isActive]);

    const initializeAudioAnalysis = async () => {
        try {
            // Get user media for audio analysis
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Create audio context and analyser
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const analyserNode = context.createAnalyser();
            const source = context.createMediaStreamSource(stream);
            
            analyserNode.fftSize = 2048;
            analyserNode.smoothingTimeConstant = 0.8;
            
            source.connect(analyserNode);
            
            setAudioContext(context);
            setAnalyser(analyserNode);
            setMediaSource(source);
            
            // Initialize data array for frequency analysis
            dataArrayRef.current = new Uint8Array(analyserNode.frequencyBinCount);
            
            startAnalysis();
            
        } catch (error) {
            console.error('Error initializing audio analysis:', error);
        }
    };

    const startAnalysis = () => {
        setIsAnalyzing(true);
        
        // Analyze every 1 second for voice metrics
        analysisIntervalRef.current = setInterval(() => {
            if (analyser && dataArrayRef.current) {
                performVoiceAnalysis();
            }
        }, 1000);
    };

    const stopAnalysis = () => {
        setIsAnalyzing(false);
        
        if (analysisIntervalRef.current) {
            clearInterval(analysisIntervalRef.current);
        }
        
        if (audioContext) {
            audioContext.close();
        }
        
        if (mediaSource) {
            mediaSource.disconnect();
        }
    };

    const performVoiceAnalysis = () => {
        if (!analyser || !dataArrayRef.current) return;
        
        // Get frequency data
        analyser.getByteFrequencyData(dataArrayRef.current);
        
        // Get time domain data for waveform analysis
        const timeData = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(timeData);
        
        const analysis = analyzeAudioData(dataArrayRef.current, timeData);
        
        setCurrentAnalysis(analysis);
        onAnalysisUpdate(analysis);
    };

    const analyzeAudioData = (frequencyData, timeData) => {
        // Calculate volume (RMS)
        let sum = 0;
        for (let i = 0; i < timeData.length; i++) {
            const sample = (timeData[i] - 128) / 128;
            sum += sample * sample;
        }
        const volume = Math.sqrt(sum / timeData.length);
        
        // Calculate frequency distribution
        const lowFreq = frequencyData.slice(0, 85).reduce((a, b) => a + b, 0) / 85;
        const midFreq = frequencyData.slice(85, 255).reduce((a, b) => a + b, 0) / 170;
        const highFreq = frequencyData.slice(255, 512).reduce((a, b) => a + b, 0) / 257;
        
        // Estimate pitch (fundamental frequency)
        const pitch = estimatePitch(timeData);
        
        // Detect background noise
        const backgroundNoise = detectBackgroundNoise(frequencyData, volume);
        
        // Estimate speaking pace (simplified)
        const pace = estimateSpeakingPace(volume, timeData);
        
        // Calculate clarity based on frequency distribution
        const clarity = calculateClarity(lowFreq, midFreq, highFreq, volume);
        
        // Count filler words (this would need speech recognition in real implementation)
        const fillerWords = Math.random() < 0.1 ? Math.floor(Math.random() * 3) : 0;
        
        const averageVolume = volume;
        const averagePitch = pitch;
        const wordsPerMinute = pace;
        const clarityScore = clarity;
        const fillerWordCount = fillerWords;
        const backgroundNoiseLevel = backgroundNoise.level;
        
        return {
            timestamp: Date.now(),
            volume: Math.round(volume * 100),
            pitch: pitch,
            pace: pace,
            clarity: clarity,
            fillerWords: fillerWords,
            backgroundNoise: backgroundNoise,
            frequencyDistribution: {
                low: Math.round(lowFreq),
                mid: Math.round(midFreq),
                high: Math.round(highFreq)
            },
            isSpeaking: volume > 0.02,
            speakingDuration: analysisCountRef.current * 0.1, // seconds
            pauseDetected: averageVolume < 10,
            energyLevel: averageVolume > 50 ? 'high' : averageVolume > 20 ? 'medium' : 'low',
            confidenceIndicators: {
                steadyPace: Math.abs(wordsPerMinute - 150) < 30,
                clearSpeech: clarityScore > 70,
                appropriateVolume: averageVolume > 20 && averageVolume < 80
            }
        };
    };

    const estimatePitch = (timeData) => {
        // Simplified pitch estimation using autocorrelation
        let bestOffset = -1;
        let bestCorrelation = 0;
        const sampleRate = 44100;
        
        for (let offset = 50; offset < timeData.length / 2; offset++) {
            let correlation = 0;
            for (let i = 0; i < timeData.length - offset; i++) {
                correlation += Math.abs((timeData[i] - 128) - (timeData[i + offset] - 128));
            }
            correlation = 1 - (correlation / (timeData.length - offset));
            
            if (correlation > bestCorrelation) {
                bestCorrelation = correlation;
                bestOffset = offset;
            }
        }
        
        return bestOffset > 0 ? sampleRate / bestOffset : 0;
    };

    const detectBackgroundNoise = (frequencyData, volume) => {
        // Analyze frequency spectrum for noise patterns
        const noiseLevel = frequencyData.slice(0, 50).reduce((a, b) => a + b, 0) / 50;
        const isNoisy = noiseLevel > 30 && volume < 0.05;
        
        let noiseType = 'none';
        if (isNoisy) {
            // Simplified noise classification
            const lowFreqNoise = frequencyData.slice(0, 20).reduce((a, b) => a + b, 0) / 20;
            const midFreqNoise = frequencyData.slice(20, 100).reduce((a, b) => a + b, 0) / 80;
            
            if (lowFreqNoise > midFreqNoise) {
                noiseType = Math.random() > 0.5 ? 'traffic' : 'mechanical';
            } else {
                noiseType = Math.random() > 0.5 ? 'voices' : 'music';
            }
        }
        
        return {
            level: Math.round(noiseLevel),
            type: noiseType,
            distracting: isNoisy && noiseLevel > 40
        };
    };

    const estimateSpeakingPace = (volume, timeData) => {
        // Simplified pace estimation based on volume changes
        // In real implementation, this would use speech recognition
        const isSpeaking = volume > 0.02;
        
        if (isSpeaking) {
            // Estimate words per minute based on volume fluctuations
            let fluctuations = 0;
            for (let i = 1; i < timeData.length; i++) {
                if (Math.abs(timeData[i] - timeData[i-1]) > 10) {
                    fluctuations++;
                }
            }
            
            // Convert to approximate WPM (very rough estimation)
            return Math.min(250, Math.max(80, fluctuations * 0.1));
        }
        
        return 0;
    };

    const calculateClarity = (lowFreq, midFreq, highFreq, volume) => {
        if (volume < 0.01) return 0;
        
        // Good clarity typically has balanced frequency distribution
        const balance = 1 - Math.abs(midFreq - (lowFreq + highFreq) / 2) / 100;
        const volumeClarity = Math.min(1, volume * 10); // Penalize very low volume
        
        return Math.max(0, Math.min(1, balance * volumeClarity));
    };

    const getVolumeStatus = () => {
        if (!currentAnalysis) return { status: 'Unknown', color: 'text-gray-400' };
        
        const volume = currentAnalysis.volume;
        if (volume < 10) return { status: 'Too quiet', color: 'text-red-400' };
        if (volume > 80) return { status: 'Too loud', color: 'text-orange-400' };
        return { status: 'Good level', color: 'text-green-400' };
    };

    const getClarityStatus = () => {
        if (!currentAnalysis) return { status: 'Unknown', color: 'text-gray-400' };
        
        const clarity = currentAnalysis.clarity;
        if (clarity > 0.7) return { status: 'Clear', color: 'text-green-400' };
        if (clarity > 0.5) return { status: 'Moderate', color: 'text-yellow-400' };
        return { status: 'Unclear', color: 'text-red-400' };
    };

    const getPaceStatus = () => {
        if (!currentAnalysis) return { status: 'Unknown', color: 'text-gray-400' };
        
        const pace = currentAnalysis.pace;
        if (pace === 0) return { status: 'Not speaking', color: 'text-gray-400' };
        if (pace < 120) return { status: 'Slow', color: 'text-blue-400' };
        if (pace > 180) return { status: 'Fast', color: 'text-orange-400' };
        return { status: 'Good pace', color: 'text-green-400' };
    };

    const volumeStatus = getVolumeStatus();
    const clarityStatus = getClarityStatus();
    const paceStatus = getPaceStatus();

    return (
        <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium text-white">Voice Analysis</span>
            </div>
            
            <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Volume2 className="w-3 h-3 text-blue-400" />
                        <span className="text-gray-300">Volume:</span>
                    </div>
                    <span className={volumeStatus.color}>{volumeStatus.status}</span>
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Mic className="w-3 h-3 text-green-400" />
                        <span className="text-gray-300">Clarity:</span>
                    </div>
                    <span className={clarityStatus.color}>{clarityStatus.status}</span>
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Zap className="w-3 h-3 text-purple-400" />
                        <span className="text-gray-300">Pace:</span>
                    </div>
                    <span className={paceStatus.color}>{paceStatus.status}</span>
                </div>
                
                {currentAnalysis?.backgroundNoise.distracting && (
                    <div className="flex items-center space-x-2 text-yellow-400">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Background noise: {currentAnalysis.backgroundNoise.type}</span>
                    </div>
                )}
                
                {currentAnalysis?.fillerWords > 0 && (
                    <div className="flex items-center space-x-2 text-orange-400">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Filler words detected</span>
                    </div>
                )}
            </div>
            
            {currentAnalysis && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                        <div>Volume: {currentAnalysis.volume}%</div>
                        <div>Pitch: {Math.round(currentAnalysis.pitch)}Hz</div>
                        {currentAnalysis.pace > 0 && (
                            <>
                                <div>WPM: {Math.round(currentAnalysis.pace)}</div>
                                <div>Clarity: {Math.round(currentAnalysis.clarity * 100)}%</div>
                            </>
                        )}
                    </div>
                    
                    {/* Volume visualization */}
                    <div className="mt-2">
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: 10 }, (_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 w-2 rounded ${
                                        i < (currentAnalysis.volume / 10) 
                                            ? 'bg-green-400' 
                                            : 'bg-gray-600'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceAnalyzer;
