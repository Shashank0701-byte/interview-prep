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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => navigate('/salary-negotiation')}
                            className="flex items-center gap-2 px-4 py-2 mb-4 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <LuArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Back to Scenarios</span>
                        </button>
                        
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                            Negotiation History
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Track your progress and improve your negotiation skills
                        </p>
                    </div>

                    {/* Analytics Dashboard */}
                    {analytics && (
                        <>
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                                            <LuActivity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">Total Negotiations</div>
                                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.totalNegotiations}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-500">
                                        {analytics.completedNegotiations} completed
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                                            <LuTrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">Avg Improvement</div>
                                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.avgImprovement}%</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-500">
                                        Across all negotiations
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                            <LuTarget className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">Avg Confidence</div>
                                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.avgConfidence}/100</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-500">
                                        Confidence score
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                                            <LuFlame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">Current Streak</div>
                                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.streak} days</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-500">
                                        Keep it going!
                                    </div>
                                </div>
                            </div>

                            {/* Achievements */}
                            {analytics.achievements.length > 0 && (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 mb-8">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <LuTrophy className="w-6 h-6 text-amber-600" />
                                        Achievements
                                    </h2>
                                    <div className="flex flex-wrap gap-3">
                                        {analytics.achievements.map((achievement, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-xl"
                                            >
                                                <span className="text-2xl">{achievement.icon}</span>
                                                <span className="font-semibold text-slate-900 dark:text-white">{achievement.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Top Tactics */}
                            {analytics.topTactics.length > 0 && (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 mb-8">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <LuStar className="w-6 h-6 text-indigo-600" />
                                        Your Top Tactics
                                    </h2>
                                    <div className="space-y-3">
                                        {analytics.topTactics.map((tactic, idx) => (
                                            <div key={idx} className="flex items-center justify-between">
                                                <span className="text-slate-700 dark:text-slate-300 capitalize">
                                                    {tactic.tactic.replace('-', ' ')}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                                                            style={{ width: `${(tactic.count / analytics.totalNegotiations) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-white w-8 text-right">
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
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <LuCalendar className="w-6 h-6 text-indigo-600" />
                            All Negotiations
                        </h2>

                        {negotiations.length === 0 ? (
                            <div className="text-center py-12">
                                <LuActivity className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-600 dark:text-slate-400 mb-4">No negotiations yet</p>
                                <button
                                    onClick={() => navigate('/salary-negotiation')}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
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
                                            className="p-6 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer"
                                            onClick={() => {
                                                if (negotiation.status === 'in-progress') {
                                                    navigate('/salary-negotiation/simulator', { state: negotiation });
                                                }
                                            }}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                                        {negotiation.role}
                                                    </h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {getScenarioName(negotiation.scenario)} • {negotiation.location}
                                                    </p>
                                                </div>
                                                {getStatusBadge(negotiation.status)}
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                <div>
                                                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Initial Offer</div>
                                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        {formatCurrency(initial)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Final Offer</div>
                                                    <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                                        {formatCurrency(final)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Improvement</div>
                                                    <div className={`text-sm font-semibold ${improvement >= 10 ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400'}`}>
                                                        {negotiation.status !== 'in-progress' ? `+${improvement.toFixed(1)}%` : '-'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Date</div>
                                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        {formatDate(negotiation.createdAt)}
                                                    </div>
                                                </div>
                                            </div>

                                            {negotiation.performance?.confidenceScore && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-600 dark:text-slate-400">Confidence:</span>
                                                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden max-w-xs">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
                                                            style={{ width: `${negotiation.performance.confidenceScore}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
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
