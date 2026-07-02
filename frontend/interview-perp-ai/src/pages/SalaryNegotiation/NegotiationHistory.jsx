import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import {
    LuTrendingUp,
    LuTarget,
    LuAward,
    LuCalendar,
    LuClock,
    LuCheck,
    LuX,
    LuArrowLeft,
    LuTrophy,
    LuFlame,
    LuStar,
    LuActivity
} from 'react-icons/lu';

const NegotiationHistory = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [negotiations, setNegotiations] = useState([]);
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
            const response = await axios.get(
                `${baseUrl}/api/salary-negotiation/history`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNegotiations(response.data.negotiations);
            setAnalytics(response.data.analytics);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
        setLoading(false);
    };

    const formatCurrency = (amount) => {
        const lakhs = amount / 100000;
        return `₹${lakhs.toFixed(2)} LPA`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            'accepted': { color: 'emerald', icon: LuCheck, text: 'Accepted' },
            'rejected': { color: 'red', icon: LuX, text: 'Rejected' },
            'walked-away': { color: 'amber', icon: LuX, text: 'Walked Away' },
            'in-progress': { color: 'blue', icon: LuClock, text: 'In Progress' }
        };
        const badge = badges[status] || badges['in-progress'];
        const Icon = badge.icon;
        
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-${badge.color}-100 dark:bg-${badge.color}-900/20 text-${badge.color}-700 dark:text-${badge.color}-400`}>
                <Icon className="w-3 h-3" />
                {badge.text}
            </span>
        );
    };

    const getScenarioName = (scenario) => {
        const names = {
            'product-company': 'Product Company',
            'service-company': 'IT Service Company',
            'mnc-india': 'MNC India Office',
            'indian-startup': 'Indian Startup',
            'multiple-offers': 'Multiple Offers',
            'notice-period-buyout': 'Notice Period Buyout'
        };
        return names[scenario] || scenario;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <LuActivity className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400">Loading your history...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-cream py-8 px-4 font-body">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => navigate('/salary-negotiation')}
                            className="flex items-center gap-2 px-4 py-2 mb-4 text-charcoal hover:bg-white border-2 border-transparent hover:border-charcoal rounded-md transition-all font-bold uppercase tracking-wider text-sm"
                        >
                            <LuArrowLeft className="w-5 h-5" />
                            <span>Back to Scenarios</span>
                        </button>
                        
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-charcoal mb-2 uppercase tracking-wider">
                            Negotiation History
                        </h1>
                        <p className="text-charcoal/80 font-medium">
                            Track your progress and improve your negotiation skills
                        </p>
                    </div>

                    {/* Analytics Dashboard */}
                    {analytics && (
                        <>
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white border-2 border-charcoal/20 rounded-md p-6 shadow-sm hover:border-charcoal transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-3 bg-cream border-2 border-charcoal rounded-md">
                                            <LuActivity className="w-6 h-6 text-charcoal" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-charcoal uppercase tracking-wider">Total Negotiations</div>
                                            <div className="text-2xl font-display font-bold text-charcoal">{analytics.totalNegotiations}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-charcoal/80 font-medium mt-1">
                                        {analytics.completedNegotiations} completed
                                    </div>
                                </div>

                                <div className="bg-white border-2 border-charcoal/20 rounded-md p-6 shadow-sm hover:border-charcoal transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-3 bg-cream border-2 border-charcoal rounded-md">
                                            <LuTrendingUp className="w-6 h-6 text-charcoal" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-charcoal uppercase tracking-wider">Avg Improvement</div>
                                            <div className="text-2xl font-display font-bold text-charcoal">{analytics.avgImprovement}%</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-charcoal/80 font-medium mt-1">
                                        Across all negotiations
                                    </div>
                                </div>

                                <div className="bg-white border-2 border-charcoal/20 rounded-md p-6 shadow-sm hover:border-charcoal transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-3 bg-cream border-2 border-charcoal rounded-md">
                                            <LuTarget className="w-6 h-6 text-charcoal" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-charcoal uppercase tracking-wider">Avg Confidence</div>
                                            <div className="text-2xl font-display font-bold text-charcoal">{analytics.avgConfidence}/100</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-charcoal/80 font-medium mt-1">
                                        Confidence score
                                    </div>
                                </div>

                                <div className="bg-white border-2 border-charcoal/20 rounded-md p-6 shadow-sm hover:border-charcoal transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-3 bg-cream border-2 border-charcoal rounded-md">
                                            <LuFlame className="w-6 h-6 text-charcoal" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-charcoal uppercase tracking-wider">Current Streak</div>
                                            <div className="text-2xl font-display font-bold text-charcoal">{analytics.streak} days</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-charcoal/80 font-medium mt-1">
                                        Keep it going!
                                    </div>
                                </div>
                            </div>

                            {/* Achievements */}
                            {analytics.achievements.length > 0 && (
                                <div className="card-editorial p-6 bg-white mb-8">
                                    <h2 className="text-xl font-display font-bold text-charcoal mb-4 flex items-center gap-2 uppercase tracking-wider">
                                        <LuTrophy className="w-6 h-6 text-charcoal" />
                                        Achievements
                                    </h2>
                                    <div className="flex flex-wrap gap-3">
                                        {analytics.achievements.map((achievement, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 px-4 py-2 bg-cream border-2 border-charcoal rounded-md"
                                            >
                                                <span className="text-2xl">{achievement.icon}</span>
                                                <span className="font-bold text-charcoal uppercase tracking-wider text-sm">{achievement.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Top Tactics */}
                            {analytics.topTactics.length > 0 && (
                                <div className="card-editorial p-6 bg-white mb-8">
                                    <h2 className="text-xl font-display font-bold text-charcoal mb-4 flex items-center gap-2 uppercase tracking-wider">
                                        <LuStar className="w-6 h-6 text-charcoal" />
                                        Your Top Tactics
                                    </h2>
                                    <div className="space-y-3">
                                        {analytics.topTactics.map((tactic, idx) => (
                                            <div key={idx} className="flex items-center justify-between">
                                                <span className="text-charcoal font-bold text-sm uppercase tracking-wider">
                                                    {tactic.tactic.replace('-', ' ')}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-32 h-2 bg-charcoal/10 rounded-none overflow-hidden">
                                                        <div
                                                            className="h-full bg-charcoal"
                                                            style={{ width: `${(tactic.count / analytics.totalNegotiations) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-bold text-charcoal w-8 text-right">
                                                        {tactic.count}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Negotiations List */}
                    <div className="card-editorial p-6 bg-white">
                        <h2 className="text-xl font-display font-bold text-charcoal mb-6 flex items-center gap-2 uppercase tracking-wider">
                            <LuCalendar className="w-6 h-6 text-charcoal" />
                            All Negotiations
                        </h2>

                        {negotiations.length === 0 ? (
                            <div className="text-center py-12">
                                <LuActivity className="w-16 h-16 text-charcoal/20 mx-auto mb-4" />
                                <p className="text-charcoal/80 font-medium mb-4">No negotiations yet</p>
                                <button
                                    onClick={() => navigate('/salary-negotiation')}
                                    className="px-6 py-3 bg-charcoal text-white rounded-md font-bold uppercase tracking-wider hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all cursor-pointer border-2 border-charcoal"
                                >
                                    Start Your First Negotiation
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {negotiations.map((negotiation) => {
                                    const initial = (negotiation.initialOffer?.baseSalary || 0) + (negotiation.initialOffer?.equity || 0) + (negotiation.initialOffer?.signingBonus || 0);
                                    const final = (negotiation.finalOffer?.baseSalary || 0) + (negotiation.finalOffer?.equity || 0) + (negotiation.finalOffer?.signingBonus || 0);
                                    const improvement = negotiation.status !== 'in-progress' && initial > 0 ? ((final - initial) / initial) * 100 : 0;

                                    return (
                                        <div
                                            key={negotiation._id}
                                            className="p-6 bg-cream border-2 border-charcoal/20 rounded-md hover:border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all cursor-pointer"
                                            onClick={() => {
                                                if (negotiation.status === 'in-progress') {
                                                    navigate('/salary-negotiation/simulator', { state: negotiation });
                                                }
                                            }}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-display font-bold text-charcoal mb-1 uppercase tracking-wider">
                                                        {negotiation.role}
                                                    </h3>
                                                    <p className="text-sm text-charcoal/80 font-medium">
                                                        {getScenarioName(negotiation.scenario)} • {negotiation.location}
                                                    </p>
                                                </div>
                                                {getStatusBadge(negotiation.status)}
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                <div>
                                                    <div className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1">Initial Offer</div>
                                                    <div className="text-sm font-bold text-charcoal">
                                                        {formatCurrency(initial)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1">Final Offer</div>
                                                    <div className="text-sm font-bold text-charcoal">
                                                        {formatCurrency(final)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1">Improvement</div>
                                                    <div className={`text-sm font-bold text-charcoal`}>
                                                        {negotiation.status !== 'in-progress' ? `+${improvement.toFixed(1)}%` : '-'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1">Date</div>
                                                    <div className="text-sm font-bold text-charcoal">
                                                        {formatDate(negotiation.createdAt)}
                                                    </div>
                                                </div>
                                            </div>

                                            {negotiation.performance?.confidenceScore && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-charcoal uppercase tracking-wider">Confidence:</span>
                                                    <div className="flex-1 h-2 bg-charcoal/10 rounded-none overflow-hidden max-w-xs">
                                                        <div
                                                            className="h-full bg-charcoal"
                                                            style={{ width: `${negotiation.performance.confidenceScore}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-charcoal">
                                                        {negotiation.performance.confidenceScore}/100
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default NegotiationHistory;
