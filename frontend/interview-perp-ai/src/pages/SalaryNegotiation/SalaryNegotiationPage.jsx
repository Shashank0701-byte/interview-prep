import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import {
    LuDollarSign,
    LuTrendingUp,
    LuTarget,
    LuBriefcase,
    LuMapPin,
    LuUsers,
    LuArrowRight,
    LuSparkles,
    LuShield,
    LuAward,
    LuActivity
} from 'react-icons/lu';

const SalaryNegotiationPage = () => {
    const navigate = useNavigate();
    useScrollToTop();

    const [selectedScenario, setSelectedScenario] = useState(null);
    const [formData, setFormData] = useState({
        role: 'Software Engineer',
        level: 'mid',
        location: 'Bangalore',
        recruiterPersonality: 'neutral'
    });

    const scenarios = [
        {
            id: 'product-company',
            title: 'Product-Based Company',
            description: 'Negotiate with Indian product companies like Flipkart, Swiggy. Competitive packages with ESOPs.',
            icon: LuSparkles,
            difficulty: 'Medium',
            avgImprovement: '15-20%',
            features: ['Competitive base salary', 'ESOPs/Stock options', 'Performance bonus', 'Health benefits']
        },
        {
            id: 'indian-startup',
            title: 'Indian Startup',
            description: 'Negotiate with funded startups. Lower base, higher equity, and growth potential.',
            icon: LuTrendingUp,
            difficulty: 'Hard',
            avgImprovement: '20-30%',
            features: ['Equity-heavy package', 'Growth potential', 'Flexible work culture', 'Early team member']
        },
        {
            id: 'service-company',
            title: 'IT Service Company',
            description: 'Negotiate with service companies like TCS, Infosys, Wipro. Structured compensation.',
            icon: LuBriefcase,
            difficulty: 'Easy',
            avgImprovement: '10-15%',
            features: ['Structured salary bands', 'Variable pay', 'Job stability', 'Onsite opportunities']
        },
        {
            id: 'mnc-india',
            title: 'MNC (India Office)',
            description: 'Negotiate with MNC India offices. Global standards with India-specific benefits.',
            icon: LuShield,
            difficulty: 'Medium',
            avgImprovement: '12-18%',
            features: ['Global salary standards', 'Comprehensive insurance', 'Learning budget', 'Work-life balance']
        },
        {
            id: 'multiple-offers',
            title: 'Multiple Competing Offers',
            description: 'Leverage multiple offers from Indian companies. Advanced negotiation tactics.',
            icon: LuAward,
            difficulty: 'Expert',
            avgImprovement: '25-40%',
            features: ['Leverage multiple offers', 'Bidding war', 'Maximum compensation', 'Strategic negotiation']
        }
    ];

    const roles = [
        'Software Engineer',
        'Frontend Developer',
        'Backend Developer',
        'Full Stack Developer',
        'DevOps Engineer',
        'Data Scientist',
        'Product Manager',
        'Engineering Manager'
    ];

    const levels = [
        { value: 'entry', label: 'Entry Level (0-2 years)', salary: '₹3-8 LPA' },
        { value: 'mid', label: 'Mid Level (3-5 years)', salary: '₹8-20 LPA' },
        { value: 'senior', label: 'Senior (5-8 years)', salary: '₹20-45 LPA' },
        { value: 'staff', label: 'Staff (8-12 years)', salary: '₹45-80 LPA' },
        { value: 'principal', label: 'Principal (12+ years)', salary: '₹80L-1.5Cr' }
    ];

    const locations = [
        { value: 'Bangalore', multiplier: '1.20x', cost: 'High' },
        { value: 'Hyderabad', multiplier: '1.10x', cost: 'Medium-High' },
        { value: 'Pune', multiplier: '1.05x', cost: 'Medium' },
        { value: 'NCR (Delhi/Gurgaon/Noida)', multiplier: '1.15x', cost: 'High' },
        { value: 'Mumbai', multiplier: '1.25x', cost: 'Very High' },
        { value: 'Chennai', multiplier: '1.00x', cost: 'Medium' },
        { value: 'Remote', multiplier: '0.85x', cost: 'Variable' }
    ];

    const personalities = [
        {
            value: 'friendly',
            label: 'Friendly Recruiter',
            description: 'Warm and collaborative. More open to negotiation.',
            icon: '😊',
            openness: 'High'
        },
        {
            value: 'neutral',
            label: 'Professional Recruiter',
            description: 'Balanced and business-focused. Standard negotiation.',
            icon: '🤝',
            openness: 'Medium'
        },
        {
            value: 'aggressive',
            label: 'Firm Recruiter',
            description: 'Direct and assertive. Challenging negotiation.',
            icon: '💼',
            openness: 'Low'
        },
        {
            value: 'experienced',
            label: 'Veteran Recruiter',
            description: 'Strategic and insightful. Tests your skills.',
            icon: '🎯',
            openness: 'Medium-High'
        }
    ];

    const handleStartNegotiation = () => {
        if (!selectedScenario) return;
        
        navigate('/salary-negotiation/simulator', {
            state: {
                scenario: selectedScenario,
                ...formData
            }
        });
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
                {/* Hero Section */}
                <div className="max-w-7xl mx-auto mb-12">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 md:p-12 shadow-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <LuDollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Salary Negotiation Simulator</h1>
                                <p className="text-slate-600 dark:text-slate-400 text-lg mt-2">
                                    Practice negotiating with AI recruiters and maximize your compensation
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                                <div className="flex items-center gap-2 mb-2">
                                    <LuTrendingUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Avg Improvement</span>
                                </div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">18%</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                                <div className="flex items-center gap-2 mb-2">
                                    <LuUsers className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Success Rate</span>
                                </div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">87%</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                                <div className="flex items-center gap-2 mb-2">
                                    <LuDollarSign className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Avg Gained</span>
                                </div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">₹2.4L</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                                <div className="flex items-center gap-2 mb-2">
                                    <LuActivity className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Scenarios</span>
                                </div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">5</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto">
                    {/* Step 1: Choose Scenario */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded-full text-sm">1</span>
                            Choose Your Scenario
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {scenarios.map((scenario) => {
                                const Icon = scenario.icon;
                                const isSelected = selectedScenario === scenario.id;
                                
                                return (
                                    <div
                                        key={scenario.id}
                                        onClick={() => setSelectedScenario(scenario.id)}
                                        className={`relative bg-white dark:bg-slate-800 rounded-xl p-6 cursor-pointer transition-all duration-200 border-2 ${
                                            isSelected
                                                ? 'border-blue-500 shadow-lg'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:shadow-md'
                                        }`}
                                    >
                                        {isSelected && (
                                            <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1.5">
                                                <LuTarget className="w-4 h-4" />
                                            </div>
                                        )}
                                        
                                        <div className="inline-flex p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                                            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{scenario.title}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{scenario.description}</p>
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                                                scenario.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                                scenario.difficulty === 'Medium' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                                                scenario.difficulty === 'Hard' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                                                'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                            }`}>
                                                {scenario.difficulty}
                                            </span>
                                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                {scenario.avgImprovement}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {scenario.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step 2: Configure Details */}
                    {selectedScenario && (
                        <div className="mb-12 animate-fadeIn">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded-full text-sm">2</span>
                                Configure Your Profile
                            </h2>
                            
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Role Selection */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                            <LuBriefcase className="inline w-4 h-4 mr-2" />
                                            Role
                                        </label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        >
                                            {roles.map((role) => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Level Selection */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                            <LuTrendingUp className="inline w-4 h-4 mr-2" />
                                            Experience Level
                                        </label>
                                        <select
                                            value={formData.level}
                                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        >
                                            {levels.map((level) => (
                                                <option key={level.value} value={level.value}>
                                                    {level.label} - {level.salary}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Location Selection */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                            <LuMapPin className="inline w-4 h-4 mr-2" />
                                            Location
                                        </label>
                                        <select
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        >
                                            {locations.map((loc) => (
                                                <option key={loc.value} value={loc.value}>
                                                    {loc.value} - {loc.multiplier} (CoL: {loc.cost})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Recruiter Personality */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                            <LuUsers className="inline w-4 h-4 mr-2" />
                                            Recruiter Personality
                                        </label>
                                        <select
                                            value={formData.recruiterPersonality}
                                            onChange={(e) => setFormData({ ...formData, recruiterPersonality: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        >
                                            {personalities.map((p) => (
                                                <option key={p.value} value={p.value}>
                                                    {p.icon} {p.label} - {p.openness} Openness
                                                </option>
                                            ))}
                                        </select>
                                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                            {personalities.find(p => p.value === formData.recruiterPersonality)?.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Start Button */}
                                <div className="mt-8 flex justify-center">
                                    <button
                                        onClick={handleStartNegotiation}
                                        className="group flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-200"
                                    >
                                        Start Negotiation
                                        <LuArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tips Section */}
                    <div className="bg-blue-50 dark:bg-slate-800 rounded-xl p-8 border border-blue-200 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <LuSparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            Pro Tips for Salary Negotiation in India
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">Never reveal your current CTC</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Focus on market value and your skills, not current package</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">Always negotiate the first offer</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Indian companies expect 10-20% negotiation buffer</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">Research company salary bands</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Use platforms like AmbitionBox, Glassdoor for Indian salaries</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">Consider total CTC breakdown</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Check fixed vs variable, ESOPs, joining bonus, and benefits</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SalaryNegotiationPage;
