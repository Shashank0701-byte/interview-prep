import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import ATSAnalyzer from '../../components/Resume/ATSAnalyzer';
import AIContentSuggestions from '../../components/Resume/AIContentSuggestions';
import EyeTrackingHeatmap from '../../components/Resume/EyeTrackingHeatmap';
import ResumeEditor from '../../components/Resume/ResumeEditor';
import SalaryImpactPredictor from '../../components/Resume/SalaryImpactPredictor';
import {
    LuFileText,
    LuBrain,
    LuTarget,
    LuTrendingUp,
    LuEye,
    LuDollarSign,
    LuZap,
    LuCheck,
    LuTriangleAlert,
    LuInfo,
    LuDownload,
    LuShare2,
    LuSave,
    LuRefreshCw,
    LuSparkles,
    LuCalculator,
    LuUsers,
    LuClock,
    LuArrowRight,
    LuStar,
    LuTrophy,
    LuShield,
    LuRocket
} from 'react-icons/lu';

const SmartResumeBuilder = () => {
    const navigate = useNavigate();
    const [atsScore, setAtsScore] = useState(87);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('faang');
    const [showEyeTracking, setShowEyeTracking] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [resumeContent, setResumeContent] = useState(`John Doe
Senior Software Engineer
john.doe@email.com • (555) 123-4567 • LinkedIn • GitHub

Professional Summary
Results-driven Senior Software Engineer with 5+ years of experience building scalable web applications. Expertise in React, Node.js, and cloud architecture. Led teams of 8+ developers and increased system performance by 40%.

Technical Skills
Frontend: React, TypeScript, Next.js, Tailwind CSS
Backend: Node.js, Python, PostgreSQL, MongoDB
Cloud: AWS, Docker, Kubernetes
Tools: Git, Jenkins, Jira

Experience

Senior Software Engineer | TechCorp Inc. | 2021 - Present
• Led development of microservices architecture serving 1M+ users
• Improved application performance by 40% through code optimization
• Mentored 3 junior developers and conducted technical interviews
• Implemented CI/CD pipeline reducing deployment time by 60%

Software Engineer | StartupXYZ | 2019 - 2021
• Developed full-stack web application using React and Node.js
• Collaborated with design team to implement responsive UI components
• Integrated third-party APIs and payment processing systems
• Participated in agile development process and code reviews

Education
Bachelor of Science in Computer Science
University of Technology | 2015 - 2019
GPA: 3.8/4.0`);
    const [marketTrends, setMarketTrends] = useState({
        react: { trend: 23, salary: 15000 },
        typescript: { trend: 18, salary: 12000 },
        kubernetes: { trend: 31, salary: 20000 }
    });

    // Simulate real-time ATS scoring
    useEffect(() => {
        const interval = setInterval(() => {
            if (isAnalyzing) {
                setAtsScore(prev => {
                    const newScore = prev + (Math.random() - 0.5) * 4;
                    return Math.max(65, Math.min(98, Math.round(newScore)));
                });
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [isAnalyzing]);

    const templates = {
        faang: {
            name: 'FAANG Optimized',
            description: 'Designed for Google, Meta, Amazon, Apple, Netflix',
            color: 'from-blue-500 to-indigo-600',
            icon: <LuRocket className="w-5 h-5" />,
            features: ['Algorithm focus', 'System design emphasis', 'Leadership principles']
        },
        startup: {
            name: 'Startup Ready',
            description: 'Perfect for fast-growing tech companies',
            color: 'from-emerald-500 to-teal-600',
            icon: <LuZap className="w-5 h-5" />,
            features: ['Full-stack skills', 'Agility focus', 'Growth mindset']
        },
        enterprise: {
            name: 'Enterprise Professional',
            description: 'Ideal for large corporations and consulting',
            color: 'from-purple-500 to-pink-600',
            icon: <LuShield className="w-5 h-5" />,
            features: ['Process expertise', 'Compliance knowledge', 'Team leadership']
        }
    };

    const getATSScoreColor = (score) => {
        if (score >= 90) return 'text-emerald-600';
        if (score >= 75) return 'text-amber-600';
        return 'text-red-600';
    };

    const getATSScoreGradient = (score) => {
        if (score >= 90) return 'from-emerald-500 to-green-500';
        if (score >= 75) return 'from-amber-500 to-orange-500';
        return 'from-red-500 to-pink-500';
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
                {/* Hero Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <div className="container mx-auto px-4 md:px-6 py-12">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-8">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                        <LuFileText className="w-8 h-8" />
                                    </div>
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                        <LuBrain className="w-8 h-8" />
                                    </div>
                                </div>
                                <h1 className="text-4xl font-bold mb-4">Smart Resume Builder</h1>
                                <p className="text-xl text-white/90 mb-6">
                                    AI-powered resume that guarantees ATS passage and recruiter attention
                                </p>
                                <div className="flex items-center justify-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <LuTarget className="w-4 h-4" />
                                        <span>Real-time ATS Scoring</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <LuEye className="w-4 h-4" />
                                        <span>Eye-Tracking Simulation</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <LuTrendingUp className="w-4 h-4" />
                                        <span>Market Intelligence</span>
                                    </div>
                                </div>
                            </div>

                            {/* Live ATS Score Dashboard */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {/* ATS Score */}
                                    <div className="text-center">
                                        <div className="relative w-24 h-24 mx-auto mb-3">
                                            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="40"
                                                    stroke="rgba(255,255,255,0.2)"
                                                    strokeWidth="8"
                                                    fill="none"
                                                />
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="40"
                                                    stroke="white"
                                                    strokeWidth="8"
                                                    fill="none"
                                                    strokeDasharray={`${atsScore * 2.51} 251`}
                                                    className="transition-all duration-1000 ease-out"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-2xl font-bold">{atsScore}%</span>
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium">ATS Compatibility</div>
                                        <div className="text-xs text-white/80">Live Analysis</div>
                                    </div>

                                    {/* Recruiter Score */}
                                    <div className="text-center">
                                        <div className="w-24 h-24 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                                            <LuEye className="w-8 h-8" />
                                        </div>
                                        <div className="text-2xl font-bold mb-1">94%</div>
                                        <div className="text-sm font-medium">Recruiter Appeal</div>
                                        <div className="text-xs text-white/80">Eye-Tracking Optimized</div>
                                    </div>

                                    {/* Market Fit */}
                                    <div className="text-center">
                                        <div className="w-24 h-24 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                                            <LuTrendingUp className="w-8 h-8" />
                                        </div>
                                        <div className="text-2xl font-bold mb-1">91%</div>
                                        <div className="text-sm font-medium">Market Alignment</div>
                                        <div className="text-xs text-white/80">Trending Skills</div>
                                    </div>

                                    {/* Salary Impact */}
                                    <div className="text-center">
                                        <div className="w-24 h-24 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                                            <LuDollarSign className="w-8 h-8" />
                                        </div>
                                        <div className="text-2xl font-bold mb-1">+$47K</div>
                                        <div className="text-sm font-medium">Salary Potential</div>
                                        <div className="text-xs text-white/80">vs. Average</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 md:px-6 py-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Sidebar - Controls */}
                            <div className="space-y-6">
                                {/* Template Selection */}
                                <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <LuSparkles className="w-5 h-5 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-slate-800">Industry Templates</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {Object.entries(templates).map(([key, template]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedTemplate(key)}
                                                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                                                    selectedTemplate === key
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center text-white`}>
                                                        {template.icon}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-800">{template.name}</div>
                                                        <div className="text-xs text-slate-600">{template.description}</div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {template.features.map((feature, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                                                            {feature}
                                                        </span>
                                                    ))}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* AI Content Suggestions */}
                                <AIContentSuggestions 
                                    resumeContent={resumeContent}
                                    selectedTemplate={selectedTemplate}
                                    onSuggestionApply={(suggestion) => {
                                        console.log('Applied suggestion:', suggestion);
                                        // Here you would update the resume content based on the suggestion
                                    }}
                                />

                                {/* ATS Analyzer */}
                                <ATSAnalyzer 
                                    resumeContent={resumeContent}
                                    onScoreUpdate={(score) => setAtsScore(score)}
                                />

                                {/* Salary Impact Predictor */}
                                <SalaryImpactPredictor 
                                    resumeContent={resumeContent}
                                    selectedTemplate={selectedTemplate}
                                    location="San Francisco, CA"
                                />
                            </div>

                            {/* Center - Resume Editor */}
                            <div className="lg:col-span-2 relative">
                                {/* Eye Tracking Heatmap Overlay */}
                                <EyeTrackingHeatmap 
                                    isActive={showEyeTracking}
                                    resumeContent={resumeContent}
                                />
                                
                                {/* Interactive Resume Editor */}
                                <ResumeEditor
                                    initialContent={resumeContent}
                                    selectedTemplate={selectedTemplate}
                                    onContentChange={(newContent) => {
                                        setResumeContent(newContent);
                                    }}
                                />
                                
                                {/* Floating Action Buttons */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
                                    <button
                                        onClick={() => setShowEyeTracking(!showEyeTracking)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all shadow-lg ${
                                            showEyeTracking 
                                                ? 'bg-purple-600 text-white' 
                                                : 'bg-white text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <LuEye className="w-4 h-4" />
                                        {showEyeTracking ? 'Hide' : 'Show'} Eye Tracking
                                    </button>
                                    <button className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all shadow-lg">
                                        <LuDownload className="w-4 h-4" />
                                        Export PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SmartResumeBuilder;
