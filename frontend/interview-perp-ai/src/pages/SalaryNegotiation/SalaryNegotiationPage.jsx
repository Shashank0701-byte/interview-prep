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
    LuClock,
    LuActivity,
    LuMessageSquare,
    LuMail
} from 'react-icons/lu';

const SalaryNegotiationPage = () => {
    const navigate = useNavigate();
    useScrollToTop();

    const [selectedScenario, setSelectedScenario] = useState(null);
    const [formData, setFormData] = useState({
        role: 'Software Engineer',
        level: 'mid',
        location: 'Bangalore',
        recruiterPersonality: 'neutral',
        communicationMode: 'chat'
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
        },
        {
            id: 'notice-period-buyout',
            title: 'Notice Period Buyout',
            description: 'Negotiate notice period buyout with new employer. Unique to Indian market.',
            icon: LuClock,
            difficulty: 'Medium',
            avgImprovement: '10-15%',
            features: ['Notice period negotiation', 'Buyout amount discussion', 'Early joining incentive', 'Current employer release']
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
            <div className="min-h-screen bg-cream dark:bg-navy py-8 px-6 font-body text-charcoal dark:text-cream transition-colors duration-300">
                {/* Hero Section */}
                <div className="max-w-7xl mx-auto mb-12">
                    <div className="card-editorial p-6 md:p-8 bg-white dark:bg-navy-light">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-dashed border-charcoal/10 dark:border-cream/10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                    <LuDollarSign className="w-8 h-8 text-charcoal dark:text-cream" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wider">Salary Negotiation Simulator</h1>
                                    <p className="text-charcoal/70 dark:text-cream/70 font-mono font-bold text-xs uppercase tracking-widest mt-1">
                                        Practice negotiating with AI recruiters to maximize compensation CTC.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/salary-negotiation/history')}
                                className="flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-navy text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 rounded-sm font-mono font-bold uppercase tracking-wider text-xs hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-shadow)]"
                            >
                                <LuActivity className="w-4 h-4" />
                                <span>Negotiation Log</span>
                            </button>
                        </div>

                        {/* Stats Dashboard */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            {[
                                { label: 'Avg Improvement', value: '18%', icon: LuTrendingUp },
                                { label: 'Success Rate', value: '87%', icon: LuUsers },
                                { label: 'Avg Gained (CTC)', value: '₹2.4L', icon: LuDollarSign },
                                { label: 'Scenarios Set', value: '6', icon: LuActivity }
                            ].map((stat, idx) => {
                                const IconComp = stat.icon;
                                return (
                                    <div key={idx} className="bg-cream dark:bg-navy rounded-sm p-4 border-2 border-charcoal/15 dark:border-cream/15 shadow-[1px_1px_0px_0px_var(--color-shadow)]">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <IconComp className="w-3.5 h-3.5 text-charcoal/60 dark:text-cream/60" />
                                            <span className="text-[9px] font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest">{stat.label}</span>
                                        </div>
                                        <div className="text-xl font-display font-bold text-charcoal dark:text-cream">{stat.value}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Step 1: Choose Scenario */}
                    <div>
                        <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-6 flex items-center gap-3 uppercase tracking-wider">
                            <span className="flex items-center justify-center w-7 h-7 bg-charcoal dark:bg-cream text-white dark:text-navy rounded-sm text-xs border-2 border-charcoal font-mono font-bold shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]">1</span>
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
                                        className={`relative bg-white dark:bg-navy p-6 cursor-pointer transition-all duration-200 border-3 rounded-sm ${
                                            isSelected
                                                ? 'border-charcoal dark:border-cream bg-cream dark:bg-navy shadow-[4px_4px_0px_0px_var(--color-shadow)] -translate-y-0.5'
                                                : 'border-charcoal/20 dark:border-cream/20 hover:border-charcoal/80 dark:hover:border-cream hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] hover:-translate-y-0.5 shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]'
                                        }`}
                                    >
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-charcoal dark:bg-cream text-white dark:text-navy rounded-sm p-1.5 border-2 border-charcoal shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]">
                                                <LuTarget className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                        
                                        <div className="inline-flex p-3 bg-cream dark:bg-navy-input border-2 border-charcoal/20 dark:border-cream/20 rounded-sm mb-4">
                                            <Icon className="w-5 h-5 text-charcoal dark:text-cream" />
                                        </div>
                                        
                                        <h3 className="text-base font-mono font-bold text-charcoal dark:text-cream mb-2 uppercase tracking-wide">{scenario.title}</h3>
                                        <p className="text-[11px] text-charcoal/70 dark:text-cream/70 mb-4 font-medium leading-relaxed">{scenario.description}</p>
                                        
                                        <div className="flex items-center justify-between mb-4 border-t border-dashed border-charcoal/10 dark:border-cream/10 pt-3">
                                            <span className="px-2 py-0.5 rounded-sm border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-[9px] font-mono font-bold uppercase tracking-wider">
                                                {scenario.difficulty}
                                            </span>
                                            <span className="text-xs font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wide">
                                                Avg Gain: {scenario.avgImprovement}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-1.5">
                                            {scenario.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-[10px] text-charcoal/60 dark:text-cream/60 font-mono font-bold uppercase tracking-wider">
                                                    <div className="w-1.5 h-1.5 bg-charcoal dark:bg-cream rounded-none"></div>
                                                    <span>{feature}</span>
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
                        <div className="animate-fadeIn">
                            <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-6 flex items-center gap-3 uppercase tracking-wider">
                                <span className="flex items-center justify-center w-7 h-7 bg-charcoal dark:bg-cream text-white dark:text-navy rounded-sm text-xs border-2 border-charcoal font-mono font-bold shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]">2</span>
                                Configure Your Profile
                            </h2>
                            
                            <div className="card-editorial p-6 md:p-8 bg-white dark:bg-navy-light">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 mb-6 border-b border-dashed border-charcoal/15 dark:border-cream/10">
                                    {/* Role Selection */}
                                    <div>
                                        <label className="block text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 mb-2 uppercase tracking-wider">
                                            Role Designation
                                        </label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-3 py-2.5 border-2 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy text-charcoal dark:text-cream font-mono font-bold text-xs rounded-sm outline-none cursor-pointer focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
                                        >
                                            {roles.map((role) => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Level Selection */}
                                    <div>
                                        <label className="block text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 mb-2 uppercase tracking-wider">
                                            Experience Level
                                        </label>
                                        <select
                                            value={formData.level}
                                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                            className="w-full px-3 py-2.5 border-2 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy text-charcoal dark:text-cream font-mono font-bold text-xs rounded-sm outline-none cursor-pointer focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
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
                                        <label className="block text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 mb-2 uppercase tracking-wider">
                                            Location Region
                                        </label>
                                        <select
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full px-3 py-2.5 border-2 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy text-charcoal dark:text-cream font-mono font-bold text-xs rounded-sm outline-none cursor-pointer focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
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
                                        <label className="block text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 mb-2 uppercase tracking-wider">
                                            Recruiter Disposition
                                        </label>
                                        <select
                                            value={formData.recruiterPersonality}
                                            onChange={(e) => setFormData({ ...formData, recruiterPersonality: e.target.value })}
                                            className="w-full px-3 py-2.5 border-2 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy text-charcoal dark:text-cream font-mono font-bold text-xs rounded-sm outline-none cursor-pointer focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
                                        >
                                            {personalities.map((p) => (
                                                <option key={p.value} value={p.value}>
                                                    {p.icon} {p.label} - {p.openness} Openness
                                                </option>
                                            ))}
                                        </select>
                                        <p className="mt-2 text-[10px] font-mono font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-wide">
                                            {personalities.find(p => p.value === formData.recruiterPersonality)?.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Communication Mode */}
                                <div className="mb-8">
                                    <label className="block text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 mb-3 uppercase tracking-wider">
                                        Communication Channel
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, communicationMode: 'chat' })}
                                            className={`p-4 border-2 rounded-sm transition-all font-mono font-bold uppercase tracking-wider text-xs hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)] flex flex-col items-center justify-center text-center ${
                                                formData.communicationMode === 'chat'
                                                    ? 'border-charcoal bg-cream text-charcoal dark:bg-navy dark:text-cream dark:border-cream/80'
                                                    : 'border-charcoal/20 bg-white text-charcoal/60 dark:bg-navy-light dark:text-cream/60 dark:border-cream/20'
                                            }`}
                                        >
                                            <LuMessageSquare className="w-5 h-5 mb-1.5" />
                                            <span>Chat dialogue</span>
                                            <span className="text-[9px] font-medium tracking-wide mt-0.5 lowercase opacity-75">real-time chat bubbles</span>
                                        </button>
                                        
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, communicationMode: 'email' })}
                                            className={`p-4 border-2 rounded-sm transition-all font-mono font-bold uppercase tracking-wider text-xs hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)] flex flex-col items-center justify-center text-center ${
                                                formData.communicationMode === 'email'
                                                    ? 'border-charcoal bg-cream text-charcoal dark:bg-navy dark:text-cream dark:border-cream/80'
                                                    : 'border-charcoal/20 bg-white text-charcoal/60 dark:bg-navy-light dark:text-cream/60 dark:border-cream/20'
                                            }`}
                                        >
                                            <LuMail className="w-5 h-5 mb-1.5" />
                                            <span>Email interface</span>
                                            <span className="text-[9px] font-medium tracking-wide mt-0.5 lowercase opacity-75">professional formal emails</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Start Button */}
                                <div className="flex justify-center border-t border-dashed border-charcoal/15 dark:border-cream/10 pt-6">
                                    <button
                                        onClick={handleStartNegotiation}
                                        className="group flex items-center justify-center gap-2 px-8 py-3.5 bg-charcoal text-white dark:bg-cream dark:text-navy border-3 border-charcoal py-3.5 rounded-sm font-mono font-bold uppercase tracking-widest text-xs hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 cursor-pointer shadow-[3px_3px_0px_0px_var(--color-shadow)]"
                                    >
                                        <span>Start Negotiation</span>
                                        <LuArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tips Section */}
                    <div className="bg-cream dark:bg-navy-light border-3 border-charcoal dark:border-cream/40 rounded-sm p-6 md:p-8 shadow-[4px_4px_0px_0px_var(--color-shadow)]">
                        <h3 className="text-lg font-mono font-bold text-charcoal dark:text-cream mb-6 flex items-center gap-2.5 uppercase tracking-wide border-b border-dashed border-charcoal/10 pb-3">
                            <LuSparkles className="w-5 h-5 text-charcoal dark:text-cream" />
                            Negotiation Guidelines (India CTC)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: 'Divert current CTC queries', desc: 'Focus on regional tech benchmarks and your unique capabilities rather than previous salary baselines.' },
                                { title: 'Budget for a buffer', desc: 'Recruiters expect counter offers. Plan targets with a 10-20% standard margin.' },
                                { title: 'Use location indices', desc: 'Leverage multiplier costs for Tier-1 technology hubs like Bangalore or Mumbai.' },
                                { title: 'Inspect CTC breakups', desc: 'Inspect fixed base structures, joining incentives, ESOP grants, and variables.' }
                            ].map((tip, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="w-2.5 h-2.5 bg-charcoal dark:bg-cream rounded-none mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <p className="font-mono font-bold text-xs text-charcoal dark:text-cream uppercase tracking-wide">{tip.title}</p>
                                        <p className="text-[11px] text-charcoal/60 dark:text-cream/60 mt-1 font-medium leading-relaxed">{tip.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SalaryNegotiationPage;
