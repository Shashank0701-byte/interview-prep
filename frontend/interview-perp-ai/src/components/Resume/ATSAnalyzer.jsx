import React, { useState, useEffect } from 'react';
import {
    LuTarget,
    LuCheck,
    LuTriangleAlert,
    LuX,
    LuInfo,
    LuTrendingUp,
    LuZap,
    LuShield,
    LuEye,
    LuRefreshCw
} from 'react-icons/lu';

const ATSAnalyzer = ({ resumeContent, onScoreUpdate }) => {
    const [atsScore, setAtsScore] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState({
        keywords: { score: 0, issues: [], suggestions: [] },
        formatting: { score: 0, issues: [], suggestions: [] },
        sections: { score: 0, issues: [], suggestions: [] },
        length: { score: 0, issues: [], suggestions: [] }
    });

    // ATS Keywords database
    const atsKeywords = {
        technical: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'TypeScript', 'GraphQL', 'MongoDB'],
        soft: ['leadership', 'collaboration', 'communication', 'problem-solving', 'analytical', 'creative', 'adaptable'],
        action: ['developed', 'implemented', 'designed', 'optimized', 'managed', 'led', 'created', 'improved', 'achieved', 'delivered'],
        metrics: ['%', 'increased', 'decreased', 'reduced', 'improved', 'million', 'thousand', 'users', 'revenue', 'performance']
    };

    // Required resume sections
    const requiredSections = [
        'Professional Summary',
        'Technical Skills', 
        'Experience',
        'Education'
    ];

    const analyzeResume = () => {
        setIsAnalyzing(true);
        
        // Simulate real-time analysis
        setTimeout(() => {
            const newAnalysis = {
                keywords: analyzeKeywords(resumeContent),
                formatting: analyzeFormatting(resumeContent),
                sections: analyzeSections(resumeContent),
                length: analyzeLength(resumeContent)
            };

            const overallScore = Math.round(
                (newAnalysis.keywords.score * 0.3 +
                 newAnalysis.formatting.score * 0.25 +
                 newAnalysis.sections.score * 0.25 +
                 newAnalysis.length.score * 0.2)
            );

            setAnalysis(newAnalysis);
            setAtsScore(overallScore);
            setIsAnalyzing(false);
            
            if (onScoreUpdate) {
                onScoreUpdate(overallScore);
            }
        }, 2000);
    };

    const analyzeKeywords = (content) => {
        const issues = [];
        const suggestions = [];
        let score = 0;

        // Check for technical keywords
        const technicalMatches = atsKeywords.technical.filter(keyword => 
            content.toLowerCase().includes(keyword.toLowerCase())
        ).length;
        
        if (technicalMatches < 3) {
            issues.push('Insufficient technical keywords');
            suggestions.push('Add more relevant technical skills like React, Node.js, or cloud technologies');
        } else {
            score += 25;
        }

        // Check for action verbs
        const actionMatches = atsKeywords.action.filter(verb => 
            content.toLowerCase().includes(verb.toLowerCase())
        ).length;
        
        if (actionMatches < 5) {
            issues.push('Limited action verbs');
            suggestions.push('Use more action verbs like "developed", "implemented", "optimized"');
        } else {
            score += 25;
        }

        // Check for metrics
        const metricMatches = atsKeywords.metrics.filter(metric => 
            content.toLowerCase().includes(metric.toLowerCase())
        ).length;
        
        if (metricMatches < 3) {
            issues.push('Missing quantified achievements');
            suggestions.push('Add specific numbers, percentages, and metrics to your accomplishments');
        } else {
            score += 25;
        }

        // Check for soft skills
        const softMatches = atsKeywords.soft.filter(skill => 
            content.toLowerCase().includes(skill.toLowerCase())
        ).length;
        
        if (softMatches < 2) {
            issues.push('Limited soft skills mentioned');
            suggestions.push('Include soft skills like leadership, communication, or problem-solving');
        } else {
            score += 25;
        }

        return { score, issues, suggestions };
    };

    const analyzeFormatting = (content) => {
        const issues = [];
        const suggestions = [];
        let score = 0;

        // Check for consistent formatting (simplified)
        const lines = content.split('\n');
        const hasConsistentBullets = lines.some(line => line.trim().startsWith('•') || line.trim().startsWith('-'));
        
        if (hasConsistentBullets) {
            score += 30;
        } else {
            issues.push('Inconsistent bullet point formatting');
            suggestions.push('Use consistent bullet points (• or -) for all lists');
        }

        // Check for proper spacing
        const hasProperSpacing = content.includes('\n\n');
        if (hasProperSpacing) {
            score += 25;
        } else {
            issues.push('Poor section spacing');
            suggestions.push('Add proper spacing between sections for better readability');
        }

        // Check for contact information
        const hasEmail = content.includes('@');
        const hasPhone = /\d{3}[-.]?\d{3}[-.]?\d{4}/.test(content);
        
        if (hasEmail && hasPhone) {
            score += 45;
        } else {
            issues.push('Missing contact information');
            suggestions.push('Include professional email and phone number');
        }

        return { score, issues, suggestions };
    };

    const analyzeSections = (content) => {
        const issues = [];
        const suggestions = [];
        let score = 0;

        const foundSections = requiredSections.filter(section => 
            content.toLowerCase().includes(section.toLowerCase())
        );

        const sectionScore = (foundSections.length / requiredSections.length) * 100;
        score = Math.round(sectionScore);

        const missingSections = requiredSections.filter(section => 
            !content.toLowerCase().includes(section.toLowerCase())
        );

        if (missingSections.length > 0) {
            issues.push(`Missing sections: ${missingSections.join(', ')}`);
            suggestions.push('Add all required sections for complete ATS compatibility');
        }

        return { score, issues, suggestions };
    };

    const analyzeLength = (content) => {
        const issues = [];
        const suggestions = [];
        let score = 0;

        const wordCount = content.split(/\s+/).length;
        
        if (wordCount >= 300 && wordCount <= 800) {
            score = 100;
        } else if (wordCount < 300) {
            issues.push('Resume too short');
            suggestions.push('Add more details about your experience and achievements');
            score = Math.max(0, (wordCount / 300) * 100);
        } else {
            issues.push('Resume too long');
            suggestions.push('Condense content to focus on most relevant experiences');
            score = Math.max(0, 100 - ((wordCount - 800) / 10));
        }

        return { score: Math.round(score), issues, suggestions };
    };

    useEffect(() => {
        if (resumeContent && resumeContent.trim().length > 50) {
            analyzeResume();
        }
    }, [resumeContent]);

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-emerald-600';
        if (score >= 75) return 'text-amber-600';
        return 'text-red-600';
    };

    const getScoreGradient = (score) => {
        if (score >= 90) return 'from-emerald-500 to-green-500';
        if (score >= 75) return 'from-amber-500 to-orange-500';
        return 'from-red-500 to-pink-500';
    };

    const getScoreIcon = (score) => {
        if (score >= 90) return <LuCheck className="w-4 h-4" />;
        if (score >= 75) return <LuTriangleAlert className="w-4 h-4" />;
        return <LuX className="w-4 h-4" />;
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <LuTarget className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-800">ATS Compatibility</h3>
                </div>
                <button
                    onClick={analyzeResume}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-50"
                >
                    <LuRefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
                </button>
            </div>

            {/* Overall Score */}
            <div className="text-center mb-6">
                <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" className={`stop-color-${atsScore >= 90 ? 'emerald' : atsScore >= 75 ? 'amber' : 'red'}-500`} />
                                <stop offset="100%" className={`stop-color-${atsScore >= 90 ? 'green' : atsScore >= 75 ? 'orange' : 'pink'}-500`} />
                            </linearGradient>
                        </defs>
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="rgba(148, 163, 184, 0.2)"
                            strokeWidth="8"
                            fill="none"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${atsScore * 2.51} 251`}
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className={`text-3xl font-bold ${getScoreColor(atsScore)}`}>
                                {atsScore}%
                            </div>
                            <div className="text-sm text-slate-600">ATS Score</div>
                        </div>
                    </div>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    atsScore >= 90 ? 'bg-emerald-100 text-emerald-700' :
                    atsScore >= 75 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                }`}>
                    {getScoreIcon(atsScore)}
                    {atsScore >= 90 ? 'Excellent' : atsScore >= 75 ? 'Good' : 'Needs Improvement'}
                </div>
            </div>

            {/* Detailed Analysis */}
            <div className="space-y-4">
                {Object.entries(analysis).map(([category, data]) => (
                    <div key={category} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getScoreGradient(data.score)}`}></div>
                                <span className="font-medium text-slate-800 capitalize">
                                    {category === 'keywords' ? 'Keywords & Skills' : 
                                     category === 'formatting' ? 'Format & Structure' :
                                     category === 'sections' ? 'Required Sections' : 'Content Length'}
                                </span>
                            </div>
                            <span className={`font-semibold ${getScoreColor(data.score)}`}>
                                {data.score}%
                            </span>
                        </div>
                        
                        {data.issues.length > 0 && (
                            <div className="space-y-2">
                                {data.issues.map((issue, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm">
                                        <LuTriangleAlert className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-slate-600">{issue}</span>
                                    </div>
                                ))}
                                {data.suggestions.map((suggestion, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm">
                                        <LuInfo className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-slate-600">{suggestion}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Quick Tips */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                    <LuZap className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Quick ATS Tips</span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use standard section headers (Experience, Education, Skills)</li>
                    <li>• Include 6-8 relevant keywords from the job description</li>
                    <li>• Quantify achievements with specific numbers and percentages</li>
                    <li>• Keep formatting simple and consistent</li>
                </ul>
            </div>
        </div>
    );
};

export default ATSAnalyzer;
