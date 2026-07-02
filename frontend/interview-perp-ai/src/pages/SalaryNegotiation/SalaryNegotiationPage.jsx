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
            <div className="min-h-screen bg-cream dark:bg-navy py-8 px-4 font-body">
                {/* Hero Section */}
                <div className="max-w-7xl mx-auto mb-12">
                    <div className="card-editorial p-8 md:p-12 bg-white dark:bg-navy-light">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-md">
                                    <LuDollarSign className="w-8 h-8 text-charcoal dark:text-cream" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wider">Salary Negotiation Simulator</h1>
                                    <p className="text-charcoal/80 dark:text-cream/80 font-medium text-lg mt-2">
                                        Practice negotiating with AI recruiters and maximize your compensation
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/salary-negotiation/history')}
                                className="hidden md:flex items-center gap-2 px-6 py-3 bg-white dark:bg-navy text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 rounded-md font-bold uppercase tracking-wider hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] cursor-pointer transition-all duration-200"
                            >
                                <LuActivity className="w-5 h-5" />
                                View History
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-cream dark:bg-navy rounded-md p-4 border-2 border-charcoal/10 dark:border-cream/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <LuTrendingUp className="w-4 h-4 text-charcoal dark:text-cream" />
                                    <span className="text-xs font-bold text-charcoal dark:text-cream uppercase tracking-wider">Avg Improvement</span>
                                </div>
                                <div className="text-2xl font-display font-bold text-charcoal dark:text-cream">18%</div>
                            </div>
                            <div className="bg-cream dark:bg-navy rounded-md p-4 border-2 border-charcoal/10 dark:border-cream/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <LuUsers className="w-4 h-4 text-charcoal dark:text-cream" />
                                    <span className="text-xs font-bold text-charcoal dark:text-cream uppercase tracking-wider">Success Rate</span>
                                </div>
                                <div className="text-2xl font-display font-bold text-charcoal dark:text-cream">87%</div>
                            </div>
                            <div className="bg-cream dark:bg-navy rounded-md p-4 border-2 border-charcoal/10 dark:border-cream/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <LuDollarSign className="w-4 h-4 text-charcoal dark:text-cream" />
                                    <span className="text-xs font-bold text-charcoal dark:text-cream uppercase tracking-wider">Avg Gained</span>
                                </div>
                                <div className="text-2xl font-display font-bold text-charcoal dark:text-cream">₹2.4L</div>
                            </div>
                            <div className="bg-cream dark:bg-navy rounded-md p-4 border-2 border-charcoal/10 dark:border-cream/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <LuActivity className="w-4 h-4 text-charcoal dark:text-cream" />
                                    <span className="text-xs font-bold text-charcoal dark:text-cream uppercase tracking-wider">Scenarios</span>
                                </div>
                                <div className="text-2xl font-display font-bold text-charcoal dark:text-cream">6</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto">
                    {/* Step 1: Choose Scenario */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-6 flex items-center gap-3 uppercase tracking-wider">
                            <span className="flex items-center justify-center w-8 h-8 bg-charcoal dark:bg-cream text-white dark:text-navy rounded-md text-sm border-2 border-charcoal dark:border-cream/40 font-bold">1</span>
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
                                        className={`relative bg-white dark:bg-navy p-6 cursor-pointer transition-all duration-200 border-2 rounded-md ${
                                            isSelected
                                                ? 'border-charcoal dark:border-cream shadow-[4px_4px_0px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_0px_var(--color-shadow)] -translate-y-1'
                                                : 'border-charcoal/20 dark:border-cream/20 hover:border-charcoal dark:hover:border-cream/40 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] hover:-translate-y-1'
                                        }`}
                                    >
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-charcoal dark:bg-cream text-white dark:text-navy rounded-md p-1.5 border-2 border-charcoal dark:border-cream/40">
                                                <LuTarget className="w-4 h-4" />
                                            </div>
                                        )}
                                        
                                        <div className="inline-flex p-3 bg-cream dark:bg-navy-input border-2 border-charcoal/20 dark:border-cream/20 rounded-md mb-4">
                                            <Icon className="w-6 h-6 text-charcoal dark:text-cream" />
                                        </div>
                                        
                                        <h3 className="text-lg font-display font-bold text-charcoal dark:text-cream mb-2 uppercase tracking-wider">{scenario.title}</h3>
                                        <p className="text-charcoal/80 dark:text-cream/80 text-sm mb-4 font-medium">{scenario.description}</p>
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`px-2.5 py-1 rounded-sm border-2 font-bold uppercase tracking-wider text-xs ${
                                                scenario.difficulty === 'Easy' ? 'bg-cream dark:bg-navy-input text-charcoal dark:text-cream border-charcoal/20 dark:border-cream/20' :
                                                scenario.difficulty === 'Medium' ? 'bg-cream dark:bg-navy-input text-charcoal dark:text-cream border-charcoal/50 dark:border-cream/50' :
                                                scenario.difficulty === 'Hard' ? 'bg-charcoal dark:bg-cream text-white dark:text-navy border-charcoal dark:border-cream/40' :
                                                'bg-white dark:bg-navy text-charcoal dark:text-cream border-charcoal dark:border-cream/40'
                                            }`}>
                                                {scenario.difficulty}
                                            </span>
                                            <span className="text-sm font-bold text-charcoal dark:text-cream">
                                                {scenario.avgImprovement}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {scenario.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm text-charcoal/80 dark:text-cream/80 font-bold">
                                                    <div className="w-1.5 h-1.5 bg-charcoal dark:bg-cream rounded-none"></div>
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
                            <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-6 flex items-center gap-3 uppercase tracking-wider">
                                <span className="flex items-center justify-center w-8 h-8 bg-charcoal dark:bg-cream text-white dark:text-navy rounded-md text-sm border-2 border-charcoal dark:border-cream/40 font-bold">2</span>
                                Configure Your Profile
                            </h2>
                            
                            <div className="card-editorial p-8 bg-white dark:bg-navy-light">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Role Selection */}
                                    <div>
                                        <label className="block text-sm font-bold text-charcoal dark:text-cream mb-3 uppercase tracking-wider">
                                            <LuBriefcase className="inline w-4 h-4 mr-2" />
                                            Role
                                        </label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-charcoal dark:border-cream/40 rounded-md focus:outline-none transition-all bg-cream dark:bg-navy-input text-charcoal dark:text-cream font-bold"
                                        >
                                            {roles.map((role) => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Level Selection */}
                                    <div>
                                        <label className="block text-sm font-bold text-charcoal dark:text-cream mb-3 uppercase tracking-wider">
                                            <LuTrendingUp className="inline w-4 h-4 mr-2" />
                                            Experience Level
                                        </label>
                                        <select
                                            value={formData.level}
                                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-charcoal dark:border-cream/40 rounded-md focus:outline-none transition-all bg-cream dark:bg-navy-input text-charcoal dark:text-cream font-bold"
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
                                        <label className="block text-sm font-bold text-charcoal dark:text-cream mb-3 uppercase tracking-wider">
                                            <LuMapPin className="inline w-4 h-4 mr-2" />
                                            Location
                                        </label>
                                        <select
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-charcoal dark:border-cream/40 rounded-md focus:outline-none transition-all bg-cream dark:bg-navy-input text-charcoal dark:text-cream font-bold"
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
                                        <label className="block text-sm font-bold text-charcoal dark:text-cream mb-3 uppercase tracking-wider">
                                            <LuUsers className="inline w-4 h-4 mr-2" />
                                            Recruiter Personality
                                        </label>
                                        <select
                                            value={formData.recruiterPersonality}
                                            onChange={(e) => setFormData({ ...formData, recruiterPersonality: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-charcoal dark:border-cream/40 rounded-md focus:outline-none transition-all bg-cream dark:bg-navy-input text-charcoal dark:text-cream font-bold"
                                        >
                                            {personalities.map((p) => (
                                                <option key={p.value} value={p.value}>
                                                    {p.icon} {p.label} - {p.openness} Openness
                                                </option>
                                            ))}
                                        </select>
                                        <p className="mt-2 text-sm text-charcoal/80 dark:text-cream/80 font-bold">
                                            {personalities.find(p => p.value === formData.recruiterPersonality)?.description}
                                        </p>
                                    </div>

                                    {/* Communication Mode */}
                                    <div>
                                        <label className="block text-sm font-bold text-charcoal dark:text-cream mb-3 uppercase tracking-wider">
                                            <LuMessageSquare className="inline w-4 h-4 mr-2" />
                                            Communication Mode
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, communicationMode: 'chat' })}
                                                className={`p-4 rounded-md border-2 transition-all font-bold uppercase tracking-wider ${
                                                    formData.communicationMode === 'chat'
                                                        ? 'border-charcoal dark:border-cream bg-charcoal dark:bg-cream text-white dark:text-navy shadow-[4px_4px_0px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_0px_var(--color-shadow)] -translate-y-1'
                                                        : 'border-charcoal/20 dark:border-cream/20 hover:border-charcoal dark:hover:border-cream/40 bg-white dark:bg-navy text-charcoal dark:text-cream hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)]'
                                                }`}
                                            >
                                                <LuMessageSquare className={`w-6 h-6 mx-auto mb-2 ${
                                                    formData.communicationMode === 'chat' ? 'text-white dark:text-navy' : 'text-charcoal dark:text-cream'
                                                }`} />
                                                <div className="text-sm font-bold mt-2">Chat Mode</div>
                                                <div className="text-xs mt-1 opacity-80">Real-time messaging</div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, communicationMode: 'email' })}
                                                className={`p-4 rounded-md border-2 transition-all font-bold uppercase tracking-wider ${
                                                    formData.communicationMode === 'email'
                                                        ? 'border-charcoal dark:border-cream bg-charcoal dark:bg-cream text-white dark:text-navy shadow-[4px_4px_0px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_0px_var(--color-shadow)] -translate-y-1'
                                                        : 'border-charcoal/20 dark:border-cream/20 hover:border-charcoal dark:hover:border-cream/40 bg-white dark:bg-navy text-charcoal dark:text-cream hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)]'
                                                }`}
                                            >
                                                <LuMail className={`w-6 h-6 mx-auto mb-2 ${
                                                    formData.communicationMode === 'email' ? 'text-white dark:text-navy' : 'text-charcoal dark:text-cream'
                                                }`} />
                                                <div className="text-sm font-bold mt-2">Email Mode</div>
                                                <div className="text-xs mt-1 opacity-80">Professional emails</div>
                                            </button>
                                        </div>
                                        <p className="mt-2 text-sm text-charcoal/80 dark:text-cream/80 font-bold">
                                            {formData.communicationMode === 'chat' 
                                                ? '💬 Practice quick, conversational negotiation skills'
                                                : '📧 Learn professional email negotiation etiquette'}
                                        </p>
                                    </div>
                                </div>

                                {/* Start Button */}
                                <div className="mt-8 flex justify-center">
                                    <button
                                        onClick={handleStartNegotiation}
                                        className="group flex items-center gap-3 px-8 py-4 bg-charcoal dark:bg-cream text-white dark:text-navy rounded-md font-bold text-lg uppercase tracking-wider border-2 border-charcoal dark:border-cream hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all duration-200 cursor-pointer"
                                    >
                                        Start Negotiation
                                        <LuArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tips Section */}
                    <div className="bg-cream dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 rounded-md p-8 shadow-[4px_4px_0px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_0px_var(--color-shadow)]">
                        <h3 className="text-xl font-display font-bold text-charcoal dark:text-cream mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <LuSparkles className="w-6 h-6 text-charcoal dark:text-cream" />
                            Pro Tips for Salary Negotiation in India
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-charcoal dark:bg-cream rounded-none mt-2 flex-shrink-0"></div>
                                <div>
                                    <p className="font-bold text-charcoal dark:text-cream uppercase tracking-wider text-sm">Never reveal your current CTC</p>
                                    <p className="text-sm text-charcoal/80 dark:text-cream/80 font-medium">Focus on market value and your skills, not current package</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-charcoal dark:bg-cream rounded-none mt-2 flex-shrink-0"></div>
                                <div>
                                    <p className="font-bold text-charcoal dark:text-cream uppercase tracking-wider text-sm">Always negotiate the first offer</p>
                                    <p className="text-sm text-charcoal/80 dark:text-cream/80 font-medium">Indian companies expect 10-20% negotiation buffer</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-charcoal dark:bg-cream rounded-none mt-2 flex-shrink-0"></div>
                                <div>
                                    <p className="font-bold text-charcoal dark:text-cream uppercase tracking-wider text-sm">Research company salary bands</p>
                                    <p className="text-sm text-charcoal/80 dark:text-cream/80 font-medium">Use platforms like AmbitionBox, Glassdoor for Indian salaries</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-charcoal dark:bg-cream rounded-none mt-2 flex-shrink-0"></div>
                                <div>
                                    <p className="font-bold text-charcoal dark:text-cream uppercase tracking-wider text-sm">Consider total CTC breakdown</p>
                                    <p className="text-sm text-charcoal/80 dark:text-cream/80 font-medium">Check fixed vs variable, ESOPs, joining bonus, and benefits</p>
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
