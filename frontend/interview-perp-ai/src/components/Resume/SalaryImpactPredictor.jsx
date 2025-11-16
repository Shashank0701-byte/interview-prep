import React, { useState, useEffect } from 'react';
import {
    LuDollarSign,
    LuTrendingUp,
    LuTrendingDown,
    LuTarget,
    LuMapPin,
    LuUser,
    LuGraduationCap,
    LuStar,
    LuInfo,
    LuRefreshCw,
    LuCalculator,
    LuArrowUpRight,
    LuArrowDownRight
} from 'react-icons/lu';

const SalaryImpactPredictor = ({ resumeContent, selectedTemplate, location = 'San Francisco, CA' }) => {
    const [salaryData, setSalaryData] = useState({});
    const [isCalculating, setIsCalculating] = useState(false);
    const [selectedRole, setSelectedRole] = useState('Software Engineer');
    const [experienceLevel, setExperienceLevel] = useState('mid');

    // Salary database with market data
    const salaryDatabase = {
        'Software Engineer': {
            junior: { base: 95000, range: [80000, 120000], growth: 15 },
            mid: { base: 130000, range: [110000, 160000], growth: 12 },
            senior: { base: 180000, range: [150000, 220000], growth: 8 }
        },
        'Frontend Developer': {
            junior: { base: 85000, range: [70000, 105000], growth: 18 },
            mid: { base: 120000, range: [100000, 145000], growth: 14 },
            senior: { base: 165000, range: [140000, 200000], growth: 10 }
        },
        'Backend Developer': {
            junior: { base: 90000, range: [75000, 115000], growth: 16 },
            mid: { base: 135000, range: [115000, 165000], growth: 13 },
            senior: { base: 190000, range: [160000, 230000], growth: 9 }
        },
        'Full Stack Developer': {
            junior: { base: 88000, range: [72000, 110000], growth: 17 },
            mid: { base: 125000, range: [105000, 150000], growth: 13 },
            senior: { base: 175000, range: [145000, 210000], growth: 9 }
        }
    };

    // Skill impact multipliers
    const skillMultipliers = {
        'React': 1.08,
        'TypeScript': 1.12,
        'Node.js': 1.06,
        'Python': 1.05,
        'AWS': 1.15,
        'Kubernetes': 1.18,
        'Docker': 1.08,
        'GraphQL': 1.10,
        'Next.js': 1.09,
        'PostgreSQL': 1.04,
        'MongoDB': 1.03,
        'Redis': 1.06,
        'Microservices': 1.14,
        'System Design': 1.16,
        'Machine Learning': 1.20,
        'DevOps': 1.12
    };

    // Location multipliers
    const locationMultipliers = {
        'San Francisco, CA': 1.25,
        'New York, NY': 1.20,
        'Seattle, WA': 1.15,
        'Austin, TX': 1.05,
        'Denver, CO': 1.02,
        'Remote': 0.95,
        'Chicago, IL': 1.08,
        'Boston, MA': 1.12,
        'Los Angeles, CA': 1.10
    };

    const calculateSalaryImpact = () => {
        setIsCalculating(true);
        
        setTimeout(() => {
            const baseSalary = salaryDatabase[selectedRole]?.[experienceLevel] || salaryDatabase['Software Engineer'][experienceLevel];
            let adjustedSalary = baseSalary.base;
            
            // Apply location multiplier
            const locationMultiplier = locationMultipliers[location] || 1.0;
            adjustedSalary *= locationMultiplier;
            
            // Calculate skill bonuses
            const skillBonuses = [];
            let totalSkillMultiplier = 1.0;
            
            Object.entries(skillMultipliers).forEach(([skill, multiplier]) => {
                if (resumeContent.toLowerCase().includes(skill.toLowerCase())) {
                    const bonus = Math.round((multiplier - 1) * baseSalary.base);
                    skillBonuses.push({
                        skill,
                        bonus,
                        multiplier
                    });
                    totalSkillMultiplier *= multiplier;
                }
            });
            
            // Apply skill multipliers
            adjustedSalary *= totalSkillMultiplier;
            
            // Calculate experience bonus based on resume content
            const experienceBonus = calculateExperienceBonus();
            adjustedSalary += experienceBonus;
            
            // Calculate template bonus
            const templateBonus = calculateTemplateBonus();
            adjustedSalary += templateBonus;
            
            // Calculate market trends
            const marketTrend = baseSalary.growth;
            const projectedSalary = adjustedSalary * (1 + marketTrend / 100);
            
            setSalaryData({
                baseSalary: baseSalary.base,
                adjustedSalary: Math.round(adjustedSalary),
                projectedSalary: Math.round(projectedSalary),
                range: [
                    Math.round(baseSalary.range[0] * locationMultiplier * totalSkillMultiplier),
                    Math.round(baseSalary.range[1] * locationMultiplier * totalSkillMultiplier)
                ],
                locationBonus: Math.round((locationMultiplier - 1) * baseSalary.base),
                skillBonuses,
                experienceBonus,
                templateBonus,
                marketTrend,
                totalIncrease: Math.round(adjustedSalary - baseSalary.base),
                percentIncrease: Math.round(((adjustedSalary - baseSalary.base) / baseSalary.base) * 100)
            });
            
            setIsCalculating(false);
        }, 2000);
    };

    const calculateExperienceBonus = () => {
        const content = resumeContent.toLowerCase();
        let bonus = 0;
        
        // Look for leadership indicators
        if (content.includes('led') || content.includes('managed') || content.includes('mentored')) {
            bonus += 8000;
        }
        
        // Look for quantified achievements
        const metrics = content.match(/\d+%|\d+\+|\d+k|\d+m/g);
        if (metrics && metrics.length >= 3) {
            bonus += 5000;
        }
        
        // Look for company size indicators
        if (content.includes('startup') || content.includes('early-stage')) {
            bonus += 3000;
        } else if (content.includes('enterprise') || content.includes('fortune')) {
            bonus += 6000;
        }
        
        return bonus;
    };

    const calculateTemplateBonus = () => {
        const templateBonuses = {
            'faang': 15000,
            'startup': 8000,
            'enterprise': 12000
        };
        
        return templateBonuses[selectedTemplate] || 0;
    };

    useEffect(() => {
        if (resumeContent && resumeContent.trim().length > 100) {
            calculateSalaryImpact();
        }
    }, [resumeContent, selectedRole, experienceLevel, location]);

    const formatSalary = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <LuDollarSign className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Salary Impact Predictor</h3>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                        AI-Powered
                    </span>
                </div>
                <button
                    onClick={calculateSalaryImpact}
                    disabled={isCalculating}
                    className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors disabled:opacity-50"
                >
                    <LuRefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
                    {isCalculating ? 'Calculating...' : 'Recalculate'}
                </button>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Frontend Developer">Frontend Developer</option>
                        <option value="Backend Developer">Backend Developer</option>
                        <option value="Full Stack Developer">Full Stack Developer</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Experience</label>
                    <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                        <option value="junior">Junior (0-2 years)</option>
                        <option value="mid">Mid-level (3-5 years)</option>
                        <option value="senior">Senior (5+ years)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                    <div className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50">
                        <LuMapPin className="w-4 h-4 text-slate-500" />
                        <span>{location}</span>
                    </div>
                </div>
            </div>

            {isCalculating ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Analyzing market data and resume content...</p>
                </div>
            ) : salaryData.adjustedSalary ? (
                <div className="space-y-6">
                    {/* Main Salary Display */}
                    <div className="text-center p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                        <div className="text-3xl font-bold text-emerald-800 mb-2">
                            {formatSalary(salaryData.adjustedSalary)}
                        </div>
                        <div className="text-sm text-emerald-600 mb-2">
                            Predicted Annual Salary
                        </div>
                        <div className="text-xs text-emerald-700">
                            Range: {formatSalary(salaryData.range[0])} - {formatSalary(salaryData.range[1])}
                        </div>
                        {salaryData.totalIncrease > 0 && (
                            <div className="flex items-center justify-center gap-2 mt-3">
                                <LuArrowUpRight className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-medium text-emerald-700">
                                    +{formatSalary(salaryData.totalIncrease)} ({salaryData.percentIncrease}%) above base
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                            <LuCalculator className="w-4 h-4" />
                            Salary Breakdown
                        </h4>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-700">Base Salary ({selectedRole})</span>
                                <span className="font-semibold">{formatSalary(salaryData.baseSalary)}</span>
                            </div>
                            
                            {salaryData.locationBonus > 0 && (
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <LuMapPin className="w-4 h-4 text-blue-600" />
                                        <span className="text-slate-700">Location Bonus ({location})</span>
                                    </div>
                                    <span className="font-semibold text-blue-700">+{formatSalary(salaryData.locationBonus)}</span>
                                </div>
                            )}
                            
                            {salaryData.skillBonuses.length > 0 && (
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <LuStar className="w-4 h-4 text-purple-600" />
                                            <span className="text-slate-700">Skill Bonuses</span>
                                        </div>
                                        <span className="font-semibold text-purple-700">
                                            +{formatSalary(salaryData.skillBonuses.reduce((sum, skill) => sum + skill.bonus, 0))}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        {salaryData.skillBonuses.slice(0, 5).map((skill, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                <span className="text-slate-600">{skill.skill}</span>
                                                <span className="text-purple-600">+{formatSalary(skill.bonus)}</span>
                                            </div>
                                        ))}
                                        {salaryData.skillBonuses.length > 5 && (
                                            <div className="text-xs text-slate-500 mt-2">
                                                +{salaryData.skillBonuses.length - 5} more skills contributing
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {salaryData.experienceBonus > 0 && (
                                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <LuUser className="w-4 h-4 text-amber-600" />
                                        <span className="text-slate-700">Experience Bonus</span>
                                    </div>
                                    <span className="font-semibold text-amber-700">+{formatSalary(salaryData.experienceBonus)}</span>
                                </div>
                            )}
                            
                            {salaryData.templateBonus > 0 && (
                                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <LuTarget className="w-4 h-4 text-indigo-600" />
                                        <span className="text-slate-700">Template Optimization ({selectedTemplate.toUpperCase()})</span>
                                    </div>
                                    <span className="font-semibold text-indigo-700">+{formatSalary(salaryData.templateBonus)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Market Projection */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <LuTrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-blue-800">12-Month Projection</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-blue-700">
                                Expected growth: {salaryData.marketTrend}% annually
                            </span>
                            <span className="font-bold text-blue-800">
                                {formatSalary(salaryData.projectedSalary)}
                            </span>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <LuInfo className="w-4 h-4 text-slate-600" />
                            <span className="font-medium text-slate-800">Recommendations to Increase Salary</span>
                        </div>
                        <ul className="text-sm text-slate-700 space-y-1">
                            <li>• Add more quantified achievements with specific metrics</li>
                            <li>• Include trending technologies like AI/ML or cloud architecture</li>
                            <li>• Highlight leadership experience and team management</li>
                            <li>• Emphasize system design and scalability experience</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-slate-500">
                    <LuDollarSign className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>Add more content to your resume to see salary predictions</p>
                </div>
            )}
        </div>
    );
};

export default SalaryImpactPredictor;
