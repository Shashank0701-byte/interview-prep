import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
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

// Configure PDF.js worker using the bundled worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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
    
    // Ref for file input
    const fileInputRef = useRef(null);

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

        // Check for essential sections (strict matching for section headers)
        const sections = {
            contact: /@|email|phone|\d{3}[-.]?\d{3}[-.]?\d{4}|linkedin|github/i.test(text),
            summary: /^\s*(professional\s+)?summary|^\s*objective|^\s*profile/im.test(text),
            experience: /^\s*(work\s+)?experience|^\s*employment\s+history|^\s*professional\s+experience/im.test(text),
            education: /^\s*education/im.test(text),
            skills: /^\s*(technical\s+)?skills|^\s*technologies|^\s*core\s+competencies/im.test(text),
            projects: /^\s*projects|^\s*key\s+projects/im.test(text)
        };

        // Calculate ATS score based on sections (realistic scoring)
        let score = 0;
        
        // Essential sections (60 points total)
        if (sections.contact) score += 10;
        if (sections.summary) score += 10; // Professional summary is important
        if (sections.experience) score += 25; // Most important for experienced roles
        if (sections.education) score += 10;
        if (sections.skills) score += 15;
        
        // Projects can partially substitute for experience (for students/new grads)
        if (!sections.experience && sections.projects) {
            score += 10; // Partial credit, but not full experience points
        }
        
        // Check for quantifiable achievements (15 points) - stricter detection
        const hasPercentages = /%|percent/i.test(text);
        const hasUserMetrics = /\d+[,.]?\d*\s*[kK]?\+?\s*(users?|customers?|clients?)/i.test(text);
        const hasPerformanceMetrics = /(improved|increased|reduced|decreased|optimized)\s+.*?\d+/i.test(text);
        const hasTeamMetrics = /(led|managed|mentored)\s+.*?\d+/i.test(text);
        
        const metricsCount = [hasPercentages, hasUserMetrics, hasPerformanceMetrics, hasTeamMetrics].filter(Boolean).length;
        
        if (metricsCount >= 2) {
            score += 15;
            analysis.strengths.push({
                id: 'metrics',
                title: 'Quantifiable Achievements Present',
                description: 'Great job including measurable results and metrics in your experience!'
            });
        } else if (metricsCount === 1) {
            score += 7;
            analysis.improvements.push({
                id: 'more-metrics',
                title: 'Add More Quantifiable Achievements',
                description: 'Include more specific numbers: user counts, performance improvements (%), team sizes, revenue impact.',
                priority: 'High'
            });
        } else {
            analysis.improvements.push({
                id: 'metrics',
                title: 'Add Quantifiable Achievements',
                description: 'Include specific numbers, percentages, and metrics to demonstrate your impact. Examples: "Improved performance by 40%", "Served 10K+ users", "Led team of 5"',
                priority: 'Critical'
            });
        }

        // Penalize missing critical sections
        if (!sections.experience && !sections.projects) {
            analysis.improvements.push({
                id: 'no-experience-or-projects',
                title: 'Missing Work Experience or Projects',
                description: 'Add a Work Experience section or Projects section with specific achievements and impact.',
                priority: 'Critical'
            });
        } else if (!sections.experience && sections.projects) {
            analysis.improvements.push({
                id: 'no-experience',
                title: 'Missing Work Experience Section',
                description: 'Consider adding internships, freelance work, or part-time jobs. For entry-level roles, strong projects can help, but work experience is preferred.',
                priority: 'High'
            });
        }
        
        if (!sections.summary) {
            analysis.improvements.push({
                id: 'no-summary',
                title: 'Missing Professional Summary',
                description: 'Add a 2-3 sentence professional summary at the top highlighting your expertise and career goals.',
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

        // Check for technical skills (15 points) - expanded keyword list
        const techKeywords = [
            'javascript', 'python', 'react', 'node', 'sql', 'aws', 'docker', 'kubernetes', 'git', 'java', 'cplusplus',
            'typescript', 'mongodb', 'postgresql', 'redis', 'graphql', 'express', 'flask', 'django', 'spring',
            'angular', 'vue', 'tailwind', 'bootstrap', 'jest', 'cypress', 'webpack', 'azure', 'gcp'
        ];
        const foundTechSkills = techKeywords.filter(skill => {
            if (skill === 'cplusplus') {
                return /\bc\+\+\b/i.test(text);
            }
            return new RegExp(`\\b${skill}\\b`, 'i').test(text);
        });

        if (foundTechSkills.length >= 6) {
            const displaySkills = foundTechSkills.slice(0, 3).map(skill => 
                skill === 'cplusplus' ? 'C++' : skill
            );
            analysis.strengths.push({
                id: 'tech-skills',
                title: 'Technical Skills Present',
                description: `Good job including relevant technical skills: ${displaySkills.join(', ')}, and ${foundTechSkills.length - 3} more`
            });
            score += 15;
        } else if (foundTechSkills.length >= 3) {
            score += 10;
            analysis.improvements.push({
                id: 'more-tech-skills',
                title: 'Add More Technical Keywords',
                description: 'Include 2-3 more trending technical skills from job descriptions (TypeScript, Docker, AWS, etc.).',
                priority: 'Medium'
            });
        } else {
            score += 5;
            analysis.improvements.push({
                id: 'tech-skills',
                title: 'Add More Technical Keywords',
                description: 'Include more job-specific technical keywords to pass ATS filters. Aim for 6+ relevant technologies.',
                priority: 'High'
            });
        }

        // Check resume length (10 points)
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
        if (wordCount < 250) {
            analysis.improvements.push({
                id: 'length',
                title: 'Resume Too Short',
                description: `Your resume has only ${wordCount} words (need 400+). Add more detail: quantify achievements, expand project descriptions, include relevant coursework.`,
                priority: 'High'
            });
            score += Math.round((wordCount / 400) * 10); // Partial credit based on length
        } else if (wordCount > 900) {
            analysis.improvements.push({
                id: 'length',
                title: 'Resume Too Long',
                description: `Your resume has ${wordCount} words. Consider shortening to 600-700 words to focus on the most impactful information.`,
                priority: 'Medium'
            });
            score += 7;
        } else if (wordCount >= 400 && wordCount <= 700) {
            score += 10; // Optimal length
        } else {
            score += 8; // Acceptable length
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
        // Without experience section, maximum possible score should be 70 (for students with strong projects)
        if (!sections.experience && sections.projects) {
            score = Math.min(score, 70);
        } else if (!sections.experience && !sections.projects) {
            score = Math.min(score, 40); // Very low without either
        }
        
        // Without professional summary, cap at 85
        if (!sections.summary) {
            score = Math.min(score, 85);
        }
        
        // Without metrics, cap at 75
        if (metricsCount === 0) {
            score = Math.min(score, 75);
        }
        
        // Ensure score is not negative and cap at 100
        analysis.atsScore = Math.max(0, Math.min(score, 100));
        analysis.sections = sections;
        analysis.keywords = foundTechSkills.map(skill => skill === 'cplusplus' ? 'C++' : skill);
        analysis.metrics = { 
            wordCount, 
            sectionsFound: Object.values(sections).filter(Boolean).length,
            metricsCount,
            techSkillsCount: foundTechSkills.length
        };

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
            <div className="min-h-screen bg-cream dark:bg-navy font-body text-charcoal dark:text-cream py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-display font-bold text-charcoal dark:text-cream mb-2">Resume ATS Analyzer</h1>
                        <p className="text-charcoal/80 dark:text-cream/80 font-medium">Upload your PDF resume to get instant feedback and improve your ATS score</p>
                    </div>

                    {!analysisComplete ? (
                        <div className="card-editorial p-8">
                            <div className="max-w-2xl mx-auto">
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-md flex items-center justify-center mx-auto mb-6">
                                        {isAnalyzing ? (
                                            <LuRotateCcw className="w-10 h-10 text-charcoal dark:text-cream animate-spin" />
                                        ) : (
                                            <LuFileText className="w-10 h-10 text-charcoal dark:text-cream" />
                                        )}
                                    </div>
                                    
                                    <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-2">
                                        {isAnalyzing ? 'Analyzing Your Resume...' : 'Upload Your Resume'}
                                    </h2>
                                    
                                    <p className="text-charcoal/80 dark:text-cream/80 mb-6 font-medium">
                                        {isAnalyzing 
                                            ? 'We\'re extracting text from your PDF and analyzing it for ATS optimization.'
                                            : 'Upload your PDF resume to get instant ATS analysis and personalized feedback.'}
                                    </p>
                                </div>
                                
                                {!isAnalyzing && !showTextInput && (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <label className="cursor-pointer inline-flex flex-col items-center px-8 py-6 bg-white dark:bg-navy-light border-2 border-dashed border-charcoal dark:border-cream/40 rounded-md hover:border-solid hover:bg-cream dark:hover:bg-cream/10 transition-colors duration-200">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    className="hidden" 
                                                    accept=".pdf" 
                                                    onChange={handleFileChange}
                                                    disabled={isAnalyzing}
                                                />
                                                <LuUpload className="w-12 h-12 text-charcoal dark:text-cream mb-4" />
                                                <span className="text-lg font-bold uppercase tracking-wider text-charcoal dark:text-cream mb-2">
                                                    Choose PDF File
                                                </span>
                                                <span className="text-sm font-bold uppercase tracking-wider text-charcoal/60 dark:text-cream/60">
                                                    Upload your resume in PDF format for instant analysis
                                                </span>
                                            </label>
                                        </div>
                                        
                                        <div className="bg-white dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 rounded-md p-4 shadow-[4px_4px_0px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_0px_var(--color-shadow)]">
                                            <div className="flex items-start">
                                                <LuInfo className="w-5 h-5 text-charcoal dark:text-cream mt-0.5 mr-3 flex-shrink-0" />
                                                <div className="text-sm font-medium text-charcoal/80 dark:text-cream/80">
                                                    <p className="font-bold text-charcoal dark:text-cream mb-1">PDF Requirements:</p>
                                                    <ul className="list-disc list-inside space-y-1 text-charcoal/80 dark:text-cream/80">
                                                        <li>Text-based PDF (not scanned images)</li>
                                                        <li>Created from Word, Google Docs, or similar</li>
                                                        <li>First page will be analyzed for speed</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="text-center">
                                            <p className="text-sm font-bold uppercase tracking-wider text-charcoal/60 dark:text-cream/60 mb-2">Having trouble with PDF?</p>
                                            <button
                                                onClick={() => setShowTextInput(true)}
                                                className="text-charcoal dark:text-cream border-b-2 border-charcoal dark:border-cream hover:opacity-70 text-sm font-bold uppercase tracking-wider transition-opacity"
                                            >
                                                Paste resume text instead
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {!isAnalyzing && showTextInput && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-bold uppercase tracking-wider text-charcoal dark:text-cream">
                                                Resume Text
                                            </label>
                                            <button
                                                onClick={() => setShowTextInput(false)}
                                                className="text-charcoal dark:text-cream border-b-2 border-charcoal dark:border-cream hover:opacity-70 text-sm font-bold uppercase tracking-wider transition-opacity"
                                            >
                                                Upload PDF instead
                                            </button>
                                        </div>
                                        <textarea
                                            className="w-full p-4 bg-white dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 text-charcoal dark:text-cream rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-charcoal dark:focus:ring-cream"
                                            rows="12"
                                            placeholder="Paste your complete resume text here. Include all sections: contact info, summary, experience, education, skills, etc."
                                            value={resumeText}
                                            onChange={(e) => setResumeText(e.target.value)}
                                        />
                                        
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => analyzeTextContent(resumeText)}
                                                disabled={!resumeText.trim()}
                                                className="px-8 py-3 border-2 border-charcoal dark:border-cream bg-charcoal dark:bg-cream text-white dark:text-navy rounded-md font-bold uppercase tracking-wider hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all cursor-pointer"
                                            >
                                                Analyze Resume
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                {isAnalyzing && (
                                    <div className="mt-6 w-full bg-cream dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 rounded-md h-3 p-[1px]">
                                        <div 
                                            className="h-full rounded-sm bg-charcoal dark:bg-cream animate-pulse"
                                            style={{ width: '70%' }}
                                        ></div>
                                    </div>
                                )}

                                {error && (
                                    <div className="mt-4 p-4 bg-white dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 rounded-md shadow-[4px_4px_0px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_0px_var(--color-shadow)]">
                                        <p className="text-charcoal dark:text-cream font-bold">{error}</p>
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
                                            <p className="text-charcoal/80 dark:text-cream/80 font-medium">{getScoreFeedback(analysisResults?.atsScore || 0)}</p>
                                        </div>
                                        <div className={`text-5xl font-display font-bold text-charcoal dark:text-cream`}>
                                            {analysisResults?.atsScore || 0}
                                            <span className="text-2xl text-charcoal/60 dark:text-cream/60 font-body">/100</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 w-full bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-md h-4 p-[2px]">
                                        <div 
                                            className={`h-full rounded-sm bg-charcoal dark:bg-cream`}
                                            style={{ width: `${analysisResults?.atsScore || 0}%` }}
                                        ></div>
                                    </div>
                                    
                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <button 
                                            onClick={handleRetry}
                                            className="flex items-center gap-2 px-4 py-2 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream rounded-md text-sm font-bold uppercase tracking-wider hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all cursor-pointer"
                                        >
                                            <LuRotateCcw className="w-4 h-4" />
                                            Analyze Another
                                        </button>
                                        <button 
                                            onClick={downloadReport}
                                            className="flex items-center gap-2 px-4 py-2 border-2 border-charcoal dark:border-cream/40 bg-charcoal dark:bg-cream text-white dark:text-navy rounded-md text-sm font-bold uppercase tracking-wider hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all cursor-pointer"
                                        >
                                            <LuDownload className="w-4 h-4" />
                                            Download Report
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Strengths */}
                            {analysisResults?.strengths?.length > 0 && (
                                <div className="card-editorial overflow-hidden">
                                    <div className="p-6">
                                        <h2 className="text-xl font-display font-bold text-charcoal dark:text-cream mb-4 flex items-center gap-2">
                                            <LuCheck className="w-5 h-5" />
                                            What's Working Well
                                        </h2>
                                        <div className="space-y-4">
                                            {analysisResults.strengths.map((strength) => (
                                                <div key={strength.id} className="p-4 bg-cream dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 rounded-md">
                                                    <h3 className="font-bold text-charcoal dark:text-cream">{strength.title}</h3>
                                                    <p className="text-sm font-medium text-charcoal/80 dark:text-cream/80 mt-1">{strength.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Areas for Improvement */}
                            {analysisResults?.improvements?.length > 0 && (
                                <div className="card-editorial overflow-hidden">
                                    <div className="p-6">
                                        <h2 className="text-xl font-display font-bold text-charcoal dark:text-cream mb-4 flex items-center gap-2">
                                            <LuInfo className="w-5 h-5" />
                                            Areas for Improvement
                                        </h2>
                                        <div className="space-y-4">
                                            {analysisResults.improvements.map((improvement) => (
                                                <div key={improvement.id} className="p-4 bg-white dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 rounded-md shadow-[4px_4px_0px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_0px_var(--color-shadow)]">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-bold text-charcoal dark:text-cream">{improvement.title}</h3>
                                                            <p className="text-sm font-medium text-charcoal/80 dark:text-cream/80 mt-1">{improvement.description}</p>
                                                        </div>
                                                        {improvement.priority && (
                                                            <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-sm border-2 border-charcoal dark:border-cream/40 bg-charcoal dark:bg-cream text-white dark:text-navy`}>
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
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button 
                                    onClick={handleRetry}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream rounded-md text-sm font-bold uppercase tracking-wider hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all cursor-pointer"
                                >
                                    <LuRotateCcw className="w-4 h-4" />
                                    Analyze Another Resume
                                </button>
                                <button 
                                    onClick={createOptimizedVersion}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-charcoal dark:border-cream/40 bg-charcoal dark:bg-cream text-white dark:text-navy rounded-md text-sm font-bold uppercase tracking-wider hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all cursor-pointer"
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
