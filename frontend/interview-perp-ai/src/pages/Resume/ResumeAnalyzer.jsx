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
            <div className="min-h-screen bg-cream dark:bg-navy font-body text-charcoal dark:text-cream py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-display font-bold text-charcoal dark:text-cream mb-2">Resume ATS Analyzer</h1>
                        <p className="text-charcoal/80 dark:text-cream/80 font-medium">Upload your resume to get instant feedback and improve your ATS score</p>
                    </div>

                    {!analysisComplete ? (
                        <div className="card-editorial p-8 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="w-20 h-20 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-md flex items-center justify-center mx-auto mb-6">
                                    {isAnalyzing ? (
                                        <LuRefreshCw className="w-10 h-10 text-charcoal dark:text-cream animate-spin" />
                                    ) : (
                                        <LuFileText className="w-10 h-10 text-charcoal dark:text-cream" />
                                    )}
                                </div>
                                
                                <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-2">
                                    {isAnalyzing ? 'Analyzing Your Resume...' : 'Upload Your Resume'}
                                </h2>
                                
                                <p className="text-charcoal/80 dark:text-cream/80 mb-6 font-medium">
                                    {isAnalyzing 
                                        ? 'We\'re analyzing your resume to provide personalized feedback.'
                                        : 'Get detailed feedback on how to optimize your resume for ATS systems.'}
                                </p>
                                
                                {!isAnalyzing && (
                                    <div className="mt-6">
                                        <label className="cursor-pointer inline-flex flex-col items-center px-6 py-4 bg-white dark:bg-navy-light border-2 border-dashed border-charcoal dark:border-cream/40 rounded-md hover:border-solid hover:bg-cream dark:hover:bg-cream/10 transition-colors duration-200">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                className="hidden" 
                                                accept=".pdf,.doc,.docx" 
                                                onChange={handleFileChange}
                                                disabled={isAnalyzing}
                                            />
                                            <LuArrowUpToLine className="w-8 h-8 text-charcoal dark:text-cream mb-2" />
                                            <span className="text-sm font-bold uppercase tracking-wider text-charcoal dark:text-cream">
                                                Choose a file
                                            </span>
                                            <span className="text-xs font-bold uppercase tracking-wider text-charcoal/60 dark:text-cream/60 mt-1">
                                                PDF, DOC, or DOCX (max 5MB)
                                            </span>
                                        </label>
                                    </div>
                                )}
                                
                                {isAnalyzing && (
                                    <div className="mt-6 w-full bg-cream dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 rounded-md h-3 p-[1px]">
                                        <div className="bg-charcoal dark:bg-cream h-full rounded-sm animate-pulse" style={{ width: '70%' }}></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Score Card */}
                            <div className="card-editorial overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-display font-bold text-charcoal dark:text-cream">Your ATS Score</h2>
                                            <p className="text-charcoal/80 dark:text-cream/80 font-medium">{getScoreFeedback(atsScore)}</p>
                                        </div>
                                        <div className={`text-5xl font-display font-bold text-charcoal dark:text-cream`}>
                                            {atsScore}
                                            <span className="text-2xl text-charcoal/60 dark:text-cream/60 font-body">/100</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 w-full bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-md h-4 p-[2px]">
                                        <div 
                                            className={`h-full rounded-sm bg-charcoal dark:bg-cream`}
                                            style={{ width: `${atsScore}%` }}
                                        ></div>
                                    </div>
                                    
                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <button 
                                            onClick={handleRetry}
                                            className="flex items-center gap-2 px-4 py-2 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream rounded-md text-sm font-bold uppercase tracking-wider hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all cursor-pointer"
                                        >
                                            <LuRefreshCw className="w-4 h-4" />
                                            Analyze Another
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2 border-2 border-charcoal dark:border-cream/40 bg-charcoal dark:bg-cream text-white dark:text-navy rounded-md text-sm font-bold uppercase tracking-wider hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all cursor-pointer">
                                            <LuDownload className="w-4 h-4" />
                                            Download Report
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Strengths */}
                            {strengths.length > 0 && (
                                <div className="card-editorial overflow-hidden">
                                    <div className="p-6">
                                        <h2 className="text-xl font-display font-bold text-charcoal dark:text-cream mb-4 flex items-center gap-2">
                                            <LuCheckCircle2 className="w-5 h-5" />
                                            What's Working Well
                                        </h2>
                                        <div className="space-y-4">
                                            {strengths.map((suggestion) => (
                                                <div key={suggestion.id} className="p-4 bg-cream dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 rounded-md">
                                                    <h3 className="font-bold text-charcoal dark:text-cream">{suggestion.title}</h3>
                                                    <p className="text-sm font-medium text-charcoal/80 dark:text-cream/80 mt-1">{suggestion.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Areas for Improvement */}
                            <div className="card-editorial overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-xl font-display font-bold text-charcoal dark:text-cream mb-4 flex items-center gap-2">
                                        <LuAlertCircle className="w-5 h-5" />
                                        Areas for Improvement
                                    </h2>
                                    <div className="space-y-4">
                                        {areasForImprovement.length > 0 ? (
                                            areasForImprovement.map((suggestion) => (
                                                <div key={suggestion.id} className="p-4 bg-white dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 rounded-md shadow-[4px_4px_0px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_0px_var(--color-shadow)]">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-bold text-charcoal dark:text-cream">{suggestion.title}</h3>
                                                            <p className="text-sm font-medium text-charcoal/80 dark:text-cream/80 mt-1">{suggestion.description}</p>
                                                        </div>
                                                        {suggestion.priority === 'high' && (
                                                            <span className="inline-flex items-center px-2 py-1 border-2 border-charcoal dark:border-cream/40 bg-charcoal dark:bg-cream text-white dark:text-navy rounded-sm text-xs font-bold uppercase tracking-wider">
                                                                High Priority
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-charcoal/60 dark:text-cream/60 font-bold uppercase tracking-wider text-center py-4">No major issues found! Your resume looks great.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button 
                                    onClick={handleRetry}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream rounded-md text-sm font-bold uppercase tracking-wider hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all cursor-pointer"
                                >
                                    <LuRefreshCw className="w-4 h-4" />
                                    Analyze Another Resume
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-charcoal dark:border-cream/40 bg-charcoal dark:bg-cream text-white dark:text-navy rounded-md text-sm font-bold uppercase tracking-wider hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all cursor-pointer">
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
