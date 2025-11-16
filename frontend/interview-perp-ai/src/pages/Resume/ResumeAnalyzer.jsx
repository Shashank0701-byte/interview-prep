import React, { useState, useRef } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import {
    LuFileText,
    LuCheckCircle2,
    LuAlertCircle,
    LuArrowUpToLine,
    LuRefreshCw,
    LuDownload,
    LuFileEdit
} from 'react-icons/lu';

const ResumeAnalyzer = () => {
    const fileInputRef = useRef(null);
    
    // State for resume analysis
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeText, setResumeText] = useState('');
    
    // Analysis results
    const [atsScore, setAtsScore] = useState(0);
    const [suggestions, setSuggestions] = useState([]);
    const [strengths, setStrengths] = useState([]);
    const [areasForImprovement, setAreasForImprovement] = useState([]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setResumeFile(file);
        analyzeResume(file);
    };

    const analyzeResume = async (file) => {
        setIsAnalyzing(true);
        setAnalysisComplete(false);

        try {
            // Simulate API call to analyze resume
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Mock data for demonstration
            const mockResumeText = await extractTextFromFile(file);
            setResumeText(mockResumeText);
            
            // Simulate analysis results
            setAtsScore(calculateATSScore(mockResumeText));
            
            const mockSuggestions = generateMockSuggestions(mockResumeText);
            setSuggestions(mockSuggestions);
            
            // Categorize suggestions
            setStrengths(mockSuggestions.filter(s => s.type === 'strength'));
            setAreasForImprovement(mockSuggestions.filter(s => s.type === 'improvement'));
            
            setAnalysisComplete(true);
        } catch (error) {
            console.error('Error analyzing resume:', error);
            alert('Failed to analyze resume. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const extractTextFromFile = async (file) => {
        // In a real app, you would use a PDF parsing library here
        // For now, we'll return mock text
        return `John Doe\nSenior Software Engineer\n\nEXPERIENCE\nSenior Software Engineer at TechCorp (2020-Present)\n- Led a team of 5 developers\n- Improved system performance by 40%\n- Technologies: React, Node.js, AWS\n\nEDUCATION\nB.S. in Computer Science, MIT (2016-2020)\n\nSKILLS\nJavaScript, React, Node.js, Python, AWS`;
    };
    
    const calculateATSScore = (text) => {
        // Simple scoring based on common ATS criteria
        let score = 40; // Base score
        const keywords = ['react', 'node', 'javascript', 'aws', 'python', 'leadership', 'performance'];
        const matches = keywords.filter(keyword => 
            text.toLowerCase().includes(keyword)
        );
        
        // Increase score based on matched keywords (up to 30 points)
        score += Math.min(matches.length * 4, 30);
        
        // Check for quantifiable achievements (up to 20 points)
        if (/(\d+%|\$\d+|\d+\+?\s*(?:years?|yrs?|\+?))/.test(text)) {
            score += 15;
        }
        
        // Check for action verbs (up to 10 points)
        const actionVerbs = ['led', 'developed', 'implemented', 'improved', 'increased', 'reduced'];
        if (actionVerbs.some(verb => text.toLowerCase().includes(verb))) {
            score += 10;
        }
        
        return Math.min(Math.max(score, 0), 100); // Ensure score is between 0-100
    };
    
    const generateMockSuggestions = (text) => {
        const suggestions = [
            {
                id: 'quant-achievements',
                title: 'Add Quantifiable Achievements',
                description: 'Include metrics and numbers to demonstrate your impact (e.g., "Increased performance by 40%").',
                type: 'improvement',
                priority: 'high',
                applied: false
            },
            {
                id: 'action-verbs',
                title: 'Use Stronger Action Verbs',
                description: 'Start bullet points with powerful action verbs like "Led", "Developed", "Implemented".',
                type: 'improvement',
                priority: 'medium',
                applied: false
            },
            {
                id: 'skills',
                title: 'Technical Skills Present',
                description: 'Good job including relevant technical skills!',
                type: 'strength',
                priority: 'high',
                applied: true
            },
            {
                id: 'keywords',
                title: 'Add More Keywords',
                description: 'Incorporate more job-specific keywords from the job description to pass ATS filters.',
                type: 'improvement',
                priority: 'high',
                applied: false
            },
            {
                id: 'formatting',
                title: 'Improve Readability',
                description: 'Use consistent formatting and bullet points for better readability.',
                type: 'improvement',
                priority: 'medium',
                applied: false
            }
        ];
        
        // Adjust suggestions based on content analysis
        if (/(\d+%|\$\d+|\d+\+?\s*(?:years?|yrs?|\+?))/.test(text)) {
            suggestions[0].applied = true;
            suggestions[0].type = 'strength';
            suggestions[0].title = 'Quantifiable Achievements Present';
            suggestions[0].description = 'Great job including measurable results!';
        }
        
        return suggestions;
    };
    
    const handleRetry = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        }
    };
    
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };
    
    const getScoreFeedback = (score) => {
        if (score >= 80) return 'Excellent! Your resume is well-optimized for ATS.';
        if (score >= 60) return 'Good, but could use some improvements to be more competitive.';
        return 'Needs significant improvements to pass most ATS filters.';
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume ATS Analyzer</h1>
                        <p className="text-gray-600">Upload your resume to get instant feedback and improve your ATS score</p>
                    </div>

                    {!analysisComplete ? (
                        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    {isAnalyzing ? (
                                        <LuRefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
                                    ) : (
                                        <LuFileText className="w-10 h-10 text-blue-600" />
                                    )}
                                </div>
                                
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    {isAnalyzing ? 'Analyzing Your Resume...' : 'Upload Your Resume'}
                                </h2>
                                
                                <p className="text-gray-600 mb-6">
                                    {isAnalyzing 
                                        ? 'We\'re analyzing your resume to provide personalized feedback.'
                                        : 'Get detailed feedback on how to optimize your resume for ATS systems.'}
                                </p>
                                
                                {!isAnalyzing && (
                                    <div className="mt-6">
                                        <label className="cursor-pointer inline-flex flex-col items-center px-6 py-4 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors duration-200">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                className="hidden" 
                                                accept=".pdf,.doc,.docx" 
                                                onChange={handleFileChange}
                                                disabled={isAnalyzing}
                                            />
                                            <LuArrowUpToLine className="w-8 h-8 text-blue-600 mb-2" />
                                            <span className="text-sm font-medium text-gray-700">
                                                Choose a file
                                            </span>
                                            <span className="text-xs text-gray-500 mt-1">
                                                PDF, DOC, or DOCX (max 5MB)
                                            </span>
                                        </label>
                                    </div>
                                )}
                                
                                {isAnalyzing && (
                                    <div className="mt-6 w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Score Card */}
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-800">Your ATS Score</h2>
                                            <p className="text-gray-600">{getScoreFeedback(atsScore)}</p>
                                        </div>
                                        <div className={`text-5xl font-bold ${getScoreColor(atsScore)}`}>
                                            {atsScore}
                                            <span className="text-2xl text-gray-500">/100</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                                        <div 
                                            className={`h-3 rounded-full ${atsScore >= 80 ? 'bg-green-500' : atsScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                            style={{ width: `${atsScore}%` }}
                                        ></div>
                                    </div>
                                    
                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <button 
                                            onClick={handleRetry}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            <LuRefreshCw className="w-4 h-4" />
                                            Analyze Another Resume
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                            <LuDownload className="w-4 h-4" />
                                            Download Report
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Strengths */}
                            {strengths.length > 0 && (
                                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                    <div className="p-6">
                                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <LuCheckCircle2 className="w-5 h-5 text-green-500" />
                                            What's Working Well
                                        </h2>
                                        <div className="space-y-4">
                                            {strengths.map((suggestion) => (
                                                <div key={suggestion.id} className="p-4 bg-green-50 rounded-lg">
                                                    <h3 className="font-medium text-green-800">{suggestion.title}</h3>
                                                    <p className="text-sm text-green-700 mt-1">{suggestion.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Areas for Improvement */}
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <LuAlertCircle className="w-5 h-5 text-yellow-500" />
                                        Areas for Improvement
                                    </h2>
                                    <div className="space-y-4">
                                        {areasForImprovement.length > 0 ? (
                                            areasForImprovement.map((suggestion) => (
                                                <div key={suggestion.id} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-medium text-yellow-800">{suggestion.title}</h3>
                                                            <p className="text-sm text-yellow-700 mt-1">{suggestion.description}</p>
                                                        </div>
                                                        {suggestion.priority === 'high' && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                High Priority
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">No major issues found! Your resume looks great.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button 
                                    onClick={handleRetry}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    <LuRefreshCw className="w-4 h-4" />
                                    Analyze Another Resume
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                    <LuFileEdit className="w-4 h-4" />
                                    Create Optimized Version
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ResumeAnalyzer;
