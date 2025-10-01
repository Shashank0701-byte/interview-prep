import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import * as pdfjsLib from 'pdfjs-dist';
import { 
    LuFileText, 
    LuCheck, 
    LuInfo, 
    LuUpload, 
    LuRotateCcw, 
    LuDownload,
    LuPen,
    LuType,
    LuCopy
} from 'react-icons/lu';

// Configure PDF.js worker - using local worker file for reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const SmartResumeBuilder = () => {
    const navigate = useNavigate();
    
    // Auto scroll to top when navigating to this page
    useScrollToTop();
    
    // State for resume analysis
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeText, setResumeText] = useState('');
    const [analysisResults, setAnalysisResults] = useState(null);
    const [error, setError] = useState(null);
    const [showTextInput, setShowTextInput] = useState(false);

    // Analyze resume content
    const analyzeResumeContent = (text) => {
        const analysis = {
            atsScore: 0,
            strengths: [],
            improvements: [],
            keywords: [],
            sections: {},
            metrics: {}
        };

        // Check for essential sections
        const sections = {
            contact: /contact|email|phone|linkedin|github/i.test(text),
            summary: /summary|objective|profile/i.test(text),
            experience: /experience|work|employment|job/i.test(text),
            education: /education|degree|university|college/i.test(text),
            skills: /skills|technologies|technical|programming/i.test(text)
        };

        // Calculate ATS score based on sections (more realistic scoring)
        let score = 0;
        
        // Essential sections (70 points total)
        if (sections.contact) score += 15;
        if (sections.experience) score += 30; // Most important - increased weight
        if (sections.education) score += 10;
        if (sections.skills) score += 15;
        
        // Check for quantifiable achievements (20 points)
        const hasMetrics = /\d+%|\$\d+|increased|decreased|improved|reduced|managed \d+|led \d+|\d+\+?\s*(years?|months?)|saved|generated|built|created \d+/i.test(text);
        if (hasMetrics) {
            score += 20;
            analysis.strengths.push({
                id: 'metrics',
                title: 'Quantifiable Achievements Present',
                description: 'Great job including measurable results and metrics in your experience!'
            });
        } else {
            analysis.improvements.push({
                id: 'metrics',
                title: 'Add Quantifiable Achievements',
                description: 'Include specific numbers, percentages, and metrics to demonstrate your impact.',
                priority: 'High'
            });
        }

        // Penalize missing critical sections
        if (!sections.experience) {
            score -= 50; // Severe penalty for no experience - this should make it impossible to get 100
            analysis.improvements.push({
                id: 'no-experience',
                title: 'Missing Work Experience Section',
                description: 'Your resume must include a work experience section with job titles, companies, and achievements.',
                priority: 'High'
            });
        }

        if (!sections.contact) {
            score -= 20;
            analysis.improvements.push({
                id: 'no-contact',
                title: 'Missing Contact Information',
                description: 'Include your email, phone number, and LinkedIn profile.',
                priority: 'High'
            });
        }

        // Check for action verbs
        const actionVerbs = ['led', 'managed', 'developed', 'implemented', 'created', 'designed', 'optimized', 'improved'];
        const hasActionVerbs = actionVerbs.some(verb => new RegExp(verb, 'i').test(text));
        
        if (hasActionVerbs) {
            analysis.strengths.push({
                id: 'action-verbs',
                title: 'Strong Action Verbs Used',
                description: 'Your resume uses powerful action verbs that demonstrate leadership and achievement.'
            });
        } else {
            analysis.improvements.push({
                id: 'action-verbs',
                title: 'Use Stronger Action Verbs',
                description: 'Start bullet points with powerful action verbs like "Led", "Developed", "Implemented".',
                priority: 'Medium'
            });
        }

        // Check for technical skills (10 points)
        const techKeywords = ['javascript', 'python', 'react', 'node', 'sql', 'aws', 'docker', 'kubernetes', 'git', 'java', 'cplusplus', 'html', 'css'];
        const foundTechSkills = techKeywords.filter(skill => {
            // Handle special cases for regex-unsafe characters
            if (skill === 'cplusplus') {
                return /\bc\+\+\b/i.test(text);
            }
            return new RegExp(`\\b${skill}\\b`, 'i').test(text);
        });

        if (foundTechSkills.length >= 3) {
            const displaySkills = foundTechSkills.slice(0, 3).map(skill => 
                skill === 'cplusplus' ? 'C++' : skill
            );
            analysis.strengths.push({
                id: 'tech-skills',
                title: 'Technical Skills Present',
                description: `Good job including relevant technical skills: ${displaySkills.join(', ')}`
            });
            score += 10;
        } else if (foundTechSkills.length > 0) {
            score += 5;
            analysis.improvements.push({
                id: 'tech-skills',
                title: 'Add More Technical Keywords',
                description: 'Include more job-specific technical keywords to pass ATS filters.',
                priority: 'Medium'
            });
        } else {
            analysis.improvements.push({
                id: 'tech-skills',
                title: 'Add Technical Keywords',
                description: 'Include relevant technical skills and keywords for your target role.',
                priority: 'High'
            });
        }

        // Check resume length (10 points)
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
        if (wordCount < 150) {
            analysis.improvements.push({
                id: 'length',
                title: 'Resume Too Short',
                description: `Your resume has only ${wordCount} words. Add more detail about your experience and achievements.`,
                priority: 'High'
            });
            score -= 10;
        } else if (wordCount > 1000) {
            analysis.improvements.push({
                id: 'length',
                title: 'Resume Too Long',
                description: `Your resume has ${wordCount} words. Consider shortening to focus on the most relevant information.`,
                priority: 'Medium'
            });
            score -= 5;
        } else if (wordCount >= 200 && wordCount <= 600) {
            score += 10; // Optimal length
        } else {
            score += 5; // Acceptable length
        }

        // Check for formatting issues (basic)
        if (text.includes('•') || text.includes('-')) {
            analysis.strengths.push({
                id: 'formatting',
                title: 'Good Use of Bullet Points',
                description: 'Your resume uses bullet points effectively for readability.'
            });
        } else {
            analysis.improvements.push({
                id: 'formatting',
                title: 'Improve Formatting',
                description: 'Use bullet points to make your resume more scannable and readable.',
                priority: 'Medium'
            });
        }

        // Apply realistic scoring rules
        // Without experience section, maximum possible score should be 60
        if (!sections.experience) {
            score = Math.min(score, 60);
        }
        
        // Ensure score is not negative and cap at 100
        analysis.atsScore = Math.max(0, Math.min(score, 100));
        analysis.sections = sections;
        analysis.keywords = foundTechSkills.map(skill => skill === 'cplusplus' ? 'C++' : skill);
        analysis.metrics = { wordCount, sectionsFound: Object.values(sections).filter(Boolean).length };

        return analysis;
    };

    // Extract text from PDF file
    const extractTextFromPDF = async (file) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            let fullText = '';

            // Process only first page for fastest performance
            const maxPages = Math.min(pdf.numPages, 1);
            
            for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map(item => item.str)
                    .join(' ')
                    .replace(/\s+/g, ' '); // Clean up extra whitespace
                fullText += pageText + ' ';
            }

            return fullText.trim();
        } catch (error) {
            console.error('Error extracting PDF text:', error);
            throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF.');
        }
    };

    // Handle file upload and conversion
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file only');
            return;
        }

        setResumeFile(file);
        setError(null);
        await analyzeResumeFromPDF(file);
    };

    // Analyze resume from PDF
    const analyzeResumeFromPDF = async (file) => {
        setIsAnalyzing(true);
        setAnalysisComplete(false);
        setError(null);

        try {
            // Add timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Analysis timeout')), 10000)
            );

            const analysisPromise = async () => {
                console.log('Extracting text from PDF...');
                const extractedText = await extractTextFromPDF(file);
                console.log('Text extracted, length:', extractedText.length);
                
                if (!extractedText || extractedText.trim().length < 50) {
                    throw new Error('Could not extract meaningful text from PDF. This might be an image-based PDF.');
                }

                setResumeText(extractedText);

                console.log('Analyzing content...');
                const analysis = analyzeResumeContent(extractedText);
                console.log('Analysis complete:', analysis);
                setAnalysisResults(analysis);
                
                return analysis;
            };

            await Promise.race([analysisPromise(), timeoutPromise]);
            setAnalysisComplete(true);
        } catch (error) {
            console.error('Error analyzing resume:', error);
            if (error.message === 'Analysis timeout') {
                setError('Analysis is taking too long. Please try with a smaller PDF file or paste your resume text instead.');
            } else {
                setError(error.message + ' Please try pasting your resume text instead.');
            }
            setShowTextInput(true);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const analyzeTextContent = (text) => {
        if (!text.trim()) {
            setError('Please enter your resume text');
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        // Simulate brief processing time for better UX
        setTimeout(() => {
            const analysis = analyzeResumeContent(text);
            setAnalysisResults(analysis);
            setResumeText(text);
            setAnalysisComplete(true);
            setIsAnalyzing(false);
        }, 1000);
    };

    // Download analysis report
    const downloadReport = () => {
        if (!analysisResults) return;

        const reportContent = `
ATS RESUME ANALYSIS REPORT
==========================

Analysis Date: ${new Date().toLocaleDateString()}
ATS Score: ${analysisResults.atsScore}/100

STRENGTHS:
${analysisResults.strengths.map(s => `• ${s.title}: ${s.description}`).join('\n')}

AREAS FOR IMPROVEMENT:
${analysisResults.improvements.map(i => `• ${i.title} (${i.priority} Priority): ${i.description}`).join('\n')}

TECHNICAL KEYWORDS FOUND:
${analysisResults.keywords.join(', ') || 'None detected'}

RESUME METRICS:
• Word Count: ${analysisResults.metrics.wordCount}
• Sections Found: ${analysisResults.metrics.sectionsFound}/5
• Technical Keywords: ${analysisResults.keywords.length}

RECOMMENDATIONS:
1. Focus on high-priority improvements first
2. Add more quantifiable achievements with specific numbers
3. Include relevant technical keywords for your target role
4. Ensure all essential resume sections are present
        `.trim();

        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume-analysis-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Create optimized version
    const createOptimizedVersion = () => {
        if (!analysisResults || !resumeText) return;

        const optimizedContent = `
OPTIMIZED RESUME SUGGESTIONS
============================

Based on your current resume, here are specific improvements:

ENHANCED SUMMARY SECTION:
${analysisResults.improvements.find(i => i.id === 'summary') ? 
    'Add a compelling professional summary highlighting your key achievements and skills.' : 
    'Your summary section looks good. Consider adding more specific metrics.'}

IMPROVED EXPERIENCE BULLETS:
${analysisResults.improvements.find(i => i.id === 'action-verbs') ? 
    '• Led cross-functional team of X developers to deliver Y project\n• Developed scalable solutions that improved performance by X%\n• Implemented new technologies resulting in X% cost reduction' :
    'Your experience section uses strong action verbs. Consider adding more quantifiable results.'}

TECHNICAL SKILLS TO ADD:
${['Cloud Platforms (AWS, Azure)', 'DevOps Tools (Docker, Kubernetes)', 'Databases (PostgreSQL, MongoDB)', 'Frontend Frameworks (React, Vue.js)', 'Backend Technologies (Node.js, Python)'].filter(skill => 
    !resumeText.toLowerCase().includes(skill.toLowerCase().split(' ')[0])
).slice(0, 3).join('\n• ')}

KEYWORDS FOR ATS OPTIMIZATION:
${['Agile Development', 'CI/CD Pipeline', 'Microservices Architecture', 'API Development', 'Performance Optimization'].join(', ')}

FORMATTING IMPROVEMENTS:
• Use consistent bullet points throughout
• Ensure proper spacing and alignment
• Include contact information at the top
• Use a clean, professional font
• Keep resume to 1-2 pages maximum
        `.trim();

        const blob = new Blob([optimizedContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `optimized-resume-suggestions-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRetry = () => {
        setResumeFile(null);
        setResumeText('');
        setAnalysisResults(null);
        setAnalysisComplete(false);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
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
    
    const getScoreBgColor = (score) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume ATS Analyzer</h1>
                        <p className="text-gray-600">Upload your PDF resume to get instant feedback and improve your ATS score</p>
                    </div>

                    {!analysisComplete ? (
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <div className="max-w-2xl mx-auto">
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        {isAnalyzing ? (
                                            <LuRotateCcw className="w-10 h-10 text-blue-600 animate-spin" />
                                        ) : (
                                            <LuFileText className="w-10 h-10 text-blue-600" />
                                        )}
                                    </div>
                                    
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        {isAnalyzing ? 'Analyzing Your Resume...' : 'Upload Your Resume'}
                                    </h2>
                                    
                                    <p className="text-gray-600 mb-6">
                                        {isAnalyzing 
                                            ? 'We\'re extracting text from your PDF and analyzing it for ATS optimization.'
                                            : 'Upload your PDF resume to get instant ATS analysis and personalized feedback.'}
                                    </p>
                                </div>
                                
                                {!isAnalyzing && !showTextInput && (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <label className="cursor-pointer inline-flex flex-col items-center px-8 py-6 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors duration-200">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    className="hidden" 
                                                    accept=".pdf" 
                                                    onChange={handleFileChange}
                                                    disabled={isAnalyzing}
                                                />
                                                <LuUpload className="w-12 h-12 text-blue-600 mb-4" />
                                                <span className="text-lg font-medium text-gray-700 mb-2">
                                                    Choose PDF File
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    Upload your resume in PDF format for instant analysis
                                                </span>
                                            </label>
                                        </div>
                                        
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-start">
                                                <LuInfo className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                                <div className="text-sm text-blue-800">
                                                    <p className="font-medium mb-1">PDF Requirements:</p>
                                                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                                                        <li>Text-based PDF (not scanned images)</li>
                                                        <li>Created from Word, Google Docs, or similar</li>
                                                        <li>First page will be analyzed for speed</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="text-center">
                                            <p className="text-sm text-gray-500 mb-2">Having trouble with PDF?</p>
                                            <button
                                                onClick={() => setShowTextInput(true)}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                Paste resume text instead
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {!isAnalyzing && showTextInput && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Resume Text
                                            </label>
                                            <button
                                                onClick={() => setShowTextInput(false)}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                Upload PDF instead
                                            </button>
                                        </div>
                                        <textarea
                                            className="w-full p-4 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            rows="12"
                                            placeholder="Paste your complete resume text here. Include all sections: contact info, summary, experience, education, skills, etc."
                                            value={resumeText}
                                            onChange={(e) => setResumeText(e.target.value)}
                                        />
                                        
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => analyzeTextContent(resumeText)}
                                                disabled={!resumeText.trim()}
                                                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Analyze Resume
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                {isAnalyzing && (
                                    <div className="mt-6 w-full bg-gray-200 rounded-full h-2.5">
                                        <div 
                                            className="h-2.5 rounded-full bg-blue-500 animate-pulse"
                                            style={{ width: '70%' }}
                                        ></div>
                                    </div>
                                )}

                                {error && (
                                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-700 text-sm">{error}</p>
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
                                            <p className="text-gray-600">{getScoreFeedback(analysisResults?.atsScore || 0)}</p>
                                        </div>
                                        <div className={`text-5xl font-bold ${getScoreColor(analysisResults?.atsScore || 0)}`}>
                                            {analysisResults?.atsScore || 0}
                                            <span className="text-2xl text-gray-500">/100</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                                        <div 
                                            className={`h-3 rounded-full ${getScoreBgColor(analysisResults?.atsScore || 0)}`}
                                            style={{ width: `${analysisResults?.atsScore || 0}%` }}
                                        ></div>
                                    </div>
                                    
                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <button 
                                            onClick={handleRetry}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            <LuRotateCcw className="w-4 h-4" />
                                            Analyze Another Resume
                                        </button>
                                        <button 
                                            onClick={downloadReport}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            <LuDownload className="w-4 h-4" />
                                            Download Report
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Strengths */}
                            {analysisResults?.strengths?.length > 0 && (
                                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                    <div className="p-6">
                                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <LuCheck className="w-5 h-5 text-green-500" />
                                            What's Working Well
                                        </h2>
                                        <div className="space-y-4">
                                            {analysisResults.strengths.map((strength) => (
                                                <div key={strength.id} className="p-4 bg-green-50 rounded-lg">
                                                    <h3 className="font-medium text-green-800">{strength.title}</h3>
                                                    <p className="text-sm text-green-700 mt-1">{strength.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Areas for Improvement */}
                            {analysisResults?.improvements?.length > 0 && (
                                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                    <div className="p-6">
                                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <LuInfo className="w-5 h-5 text-yellow-500" />
                                            Areas for Improvement
                                        </h2>
                                        <div className="space-y-4">
                                            {analysisResults.improvements.map((improvement) => (
                                                <div key={improvement.id} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-medium text-yellow-800">{improvement.title}</h3>
                                                            <p className="text-sm text-yellow-700 mt-1">{improvement.description}</p>
                                                        </div>
                                                        {improvement.priority && (
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                improvement.priority === 'High' ? 'bg-red-100 text-red-800' :
                                                                improvement.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {improvement.priority} Priority
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button 
                                    onClick={handleRetry}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    <LuRotateCcw className="w-4 h-4" />
                                    Analyze Another Resume
                                </button>
                                <button 
                                    onClick={createOptimizedVersion}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    <LuPen className="w-4 h-4" />
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

export default SmartResumeBuilder;
