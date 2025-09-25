import React, { useState, useEffect } from 'react';
import {
    LuBrain,
    LuLightbulb,
    LuTrendingUp,
    LuTarget,
    LuZap,
    LuCheck,
    LuPlus,
    LuRefreshCw,
    LuSparkles,
    LuTriangleAlert,
    LuInfo,
    LuDollarSign
} from 'react-icons/lu';

const AIContentSuggestions = ({ resumeContent, selectedTemplate, onSuggestionApply }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [appliedSuggestions, setAppliedSuggestions] = useState(new Set());

    // Industry-specific suggestions based on template
    const templateSuggestions = {
        faang: {
            keywords: ['scalability', 'distributed systems', 'microservices', 'system design', 'algorithms', 'data structures'],
            phrases: ['Led cross-functional team', 'Optimized system performance', 'Designed scalable architecture'],
            metrics: ['Reduced latency by X%', 'Improved throughput by X%', 'Scaled to X million users']
        },
        startup: {
            keywords: ['agile', 'full-stack', 'MVP', 'rapid prototyping', 'growth hacking', 'lean methodology'],
            phrases: ['Built from ground up', 'Wore multiple hats', 'Rapid iteration and deployment'],
            metrics: ['Delivered MVP in X weeks', 'Increased user acquisition by X%', 'Reduced time-to-market by X%']
        },
        enterprise: {
            keywords: ['enterprise architecture', 'compliance', 'governance', 'process improvement', 'stakeholder management'],
            phrases: ['Collaborated with stakeholders', 'Ensured regulatory compliance', 'Streamlined business processes'],
            metrics: ['Managed budget of $X', 'Led team of X people', 'Improved efficiency by X%']
        }
    };

    // Trending skills database
    const trendingSkills = {
        'React': { trend: 23, salary: 15000, reason: 'High demand for modern frontend frameworks' },
        'TypeScript': { trend: 31, salary: 18000, reason: 'Type safety becoming industry standard' },
        'Kubernetes': { trend: 28, salary: 25000, reason: 'Container orchestration essential for cloud' },
        'GraphQL': { trend: 19, salary: 12000, reason: 'API efficiency gaining popularity' },
        'Next.js': { trend: 35, salary: 16000, reason: 'Full-stack React framework trending' },
        'AWS': { trend: 22, salary: 20000, reason: 'Cloud infrastructure skills in high demand' },
        'Docker': { trend: 18, salary: 14000, reason: 'Containerization becoming standard practice' },
        'Python': { trend: 15, salary: 13000, reason: 'Versatile language for AI/ML and backend' }
    };

    const generateSuggestions = () => {
        setIsGenerating(true);
        
        setTimeout(() => {
            const newSuggestions = [];
            const template = templateSuggestions[selectedTemplate] || templateSuggestions.faang;
            
            // Content improvement suggestions
            if (!resumeContent.includes('%') && !resumeContent.includes('increased')) {
                newSuggestions.push({
                    id: 'metrics-1',
                    type: 'metrics',
                    priority: 'high',
                    title: 'Add Quantified Achievements',
                    description: 'Your resume lacks specific metrics. Quantified achievements are 40% more likely to get recruiter attention.',
                    suggestion: 'Replace "Improved system performance" with "Improved system performance by 35%, reducing response time from 2s to 1.3s"',
                    impact: 'High ATS score boost',
                    salaryImpact: 8000
                });
            }

            // Template-specific keyword suggestions
            const missingKeywords = template.keywords.filter(keyword => 
                !resumeContent.toLowerCase().includes(keyword.toLowerCase())
            );
            
            if (missingKeywords.length > 0) {
                newSuggestions.push({
                    id: 'keywords-1',
                    type: 'keywords',
                    priority: 'high',
                    title: `Add ${selectedTemplate.toUpperCase()} Keywords`,
                    description: `Missing key terms that ${selectedTemplate} companies look for`,
                    suggestion: `Consider adding: ${missingKeywords.slice(0, 3).join(', ')}`,
                    impact: 'Better ATS matching',
                    keywords: missingKeywords.slice(0, 3)
                });
            }

            // Trending skills suggestions
            const missingTrendingSkills = Object.keys(trendingSkills).filter(skill =>
                !resumeContent.toLowerCase().includes(skill.toLowerCase())
            ).slice(0, 2);

            missingTrendingSkills.forEach(skill => {
                const skillData = trendingSkills[skill];
                newSuggestions.push({
                    id: `trending-${skill}`,
                    type: 'trending',
                    priority: 'medium',
                    title: `Add Trending Skill: ${skill}`,
                    description: `${skill} is trending ${skillData.trend}% higher this month`,
                    suggestion: skillData.reason,
                    impact: `Potential +$${skillData.salary.toLocaleString()} salary boost`,
                    salaryImpact: skillData.salary,
                    trend: skillData.trend
                });
            });

            // Action verb improvements
            const weakVerbs = ['worked on', 'helped with', 'was responsible for', 'did'];
            const foundWeakVerbs = weakVerbs.filter(verb => 
                resumeContent.toLowerCase().includes(verb.toLowerCase())
            );

            if (foundWeakVerbs.length > 0) {
                newSuggestions.push({
                    id: 'action-verbs',
                    type: 'language',
                    priority: 'medium',
                    title: 'Strengthen Action Verbs',
                    description: 'Weak language reduces impact. Use powerful action verbs.',
                    suggestion: 'Replace "worked on" with "developed", "helped with" with "collaborated on"',
                    impact: 'More compelling narrative',
                    examples: ['Developed', 'Implemented', 'Architected', 'Optimized', 'Led']
                });
            }

            // Section-specific suggestions
            if (!resumeContent.toLowerCase().includes('professional summary')) {
                newSuggestions.push({
                    id: 'summary-section',
                    type: 'structure',
                    priority: 'high',
                    title: 'Add Professional Summary',
                    description: 'Resumes with summaries get 30% more interviews',
                    suggestion: 'Add a 2-3 line professional summary highlighting your key strengths',
                    impact: 'Better first impression',
                    template: `Results-driven ${selectedTemplate === 'faang' ? 'Software Engineer' : selectedTemplate === 'startup' ? 'Full-Stack Developer' : 'Technical Professional'} with X+ years of experience...`
                });
            }

            setSuggestions(newSuggestions);
            setIsGenerating(false);
        }, 1500);
    };

    const applySuggestion = (suggestionId) => {
        setAppliedSuggestions(prev => new Set([...prev, suggestionId]));
        const suggestion = suggestions.find(s => s.id === suggestionId);
        if (onSuggestionApply) {
            onSuggestionApply(suggestion);
        }
    };

    useEffect(() => {
        if (resumeContent && resumeContent.trim().length > 50) {
            generateSuggestions();
        }
    }, [resumeContent, selectedTemplate]);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'border-red-200 bg-red-50';
            case 'medium': return 'border-amber-200 bg-amber-50';
            case 'low': return 'border-blue-200 bg-blue-50';
            default: return 'border-slate-200 bg-slate-50';
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high': return <LuTriangleAlert className="w-4 h-4 text-red-600" />;
            case 'medium': return <LuInfo className="w-4 h-4 text-amber-600" />;
            case 'low': return <LuLightbulb className="w-4 h-4 text-blue-600" />;
            default: return <LuInfo className="w-4 h-4 text-slate-600" />;
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'metrics': return <LuTarget className="w-4 h-4" />;
            case 'keywords': return <LuZap className="w-4 h-4" />;
            case 'trending': return <LuTrendingUp className="w-4 h-4" />;
            case 'language': return <LuSparkles className="w-4 h-4" />;
            case 'structure': return <LuBrain className="w-4 h-4" />;
            default: return <LuLightbulb className="w-4 h-4" />;
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <LuBrain className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-slate-800">AI Content Suggestions</h3>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                        Live
                    </span>
                </div>
                <button
                    onClick={generateSuggestions}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors disabled:opacity-50"
                >
                    <LuRefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? 'Generating...' : 'Refresh'}
                </button>
            </div>

            {isGenerating ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {suggestions.length === 0 ? (
                        <div className="text-center py-8">
                            <LuCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                            <p className="text-slate-600">Your resume looks great! No immediate suggestions.</p>
                        </div>
                    ) : (
                        suggestions.map(suggestion => (
                            <div
                                key={suggestion.id}
                                className={`border rounded-lg p-4 transition-all ${
                                    appliedSuggestions.has(suggestion.id)
                                        ? 'border-emerald-200 bg-emerald-50 opacity-75'
                                        : getPriorityColor(suggestion.priority)
                                }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {getPriorityIcon(suggestion.priority)}
                                        <h4 className="font-semibold text-slate-800">{suggestion.title}</h4>
                                        <div className="flex items-center gap-1 text-slate-500">
                                            {getTypeIcon(suggestion.type)}
                                        </div>
                                    </div>
                                    {!appliedSuggestions.has(suggestion.id) && (
                                        <button
                                            onClick={() => applySuggestion(suggestion.id)}
                                            className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded text-sm hover:bg-slate-50 transition-colors"
                                        >
                                            <LuPlus className="w-3 h-3" />
                                            Apply
                                        </button>
                                    )}
                                    {appliedSuggestions.has(suggestion.id) && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-sm">
                                            <LuCheck className="w-3 h-3" />
                                            Applied
                                        </div>
                                    )}
                                </div>

                                <p className="text-slate-600 text-sm mb-2">{suggestion.description}</p>
                                <p className="text-slate-700 text-sm mb-3 font-medium">{suggestion.suggestion}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-xs">
                                        <span className="text-slate-500">Impact: {suggestion.impact}</span>
                                        {suggestion.salaryImpact && (
                                            <div className="flex items-center gap-1 text-emerald-600">
                                                <LuDollarSign className="w-3 h-3" />
                                                <span>+${suggestion.salaryImpact.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {suggestion.trend && (
                                            <div className="flex items-center gap-1 text-blue-600">
                                                <LuTrendingUp className="w-3 h-3" />
                                                <span>+{suggestion.trend}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {suggestion.keywords && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {suggestion.keywords.map(keyword => (
                                            <span
                                                key={keyword}
                                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {suggestion.examples && (
                                    <div className="mt-3">
                                        <p className="text-xs text-slate-500 mb-1">Suggested alternatives:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestion.examples.map(example => (
                                                <span
                                                    key={example}
                                                    className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md"
                                                >
                                                    {example}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {suggestion.template && (
                                    <div className="mt-3 p-2 bg-slate-100 rounded text-sm text-slate-700 italic">
                                        Template: {suggestion.template}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* AI Insights */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                    <LuSparkles className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-800">AI Insights</span>
                </div>
                <p className="text-sm text-purple-700">
                    Based on current market trends and {selectedTemplate.toUpperCase()} hiring patterns, 
                    focusing on quantified achievements and trending technologies will maximize your interview potential.
                </p>
            </div>
        </div>
    );
};

export default AIContentSuggestions;
