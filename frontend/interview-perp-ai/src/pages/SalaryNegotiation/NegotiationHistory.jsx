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
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
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
            'accepted': { icon: LuCheck, text: 'Accepted' },
            'rejected': { icon: LuX, text: 'Rejected' },
            'walked-away': { icon: LuX, text: 'Walked Away' },
            'in-progress': { icon: LuClock, text: 'In Progress' }
        };
        const badge = badges[status] || badges['in-progress'];
        const Icon = badge.icon;
        
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-[9px] font-mono font-bold uppercase tracking-wider shadow-[1px_1px_0px_0px_var(--color-shadow)]">
                <Icon className="w-3.5 h-3.5" />
                <span>{badge.text}</span>
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
                <div className="flex items-center justify-center min-h-screen bg-cream dark:bg-navy font-body text-charcoal dark:text-cream">
                    <div className="text-center font-mono">
                        <LuActivity className="w-12 h-12 text-charcoal dark:text-cream animate-spin mx-auto mb-4" />
                        <p className="font-bold uppercase tracking-wider text-xs">Syncing logs and trophies history...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-cream dark:bg-navy py-8 px-6 font-body text-charcoal dark:text-cream transition-colors duration-300">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="card-editorial p-6 bg-white dark:bg-navy-light flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/salary-negotiation')}
                                className="w-10 h-10 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy text-charcoal dark:text-cream rounded-sm flex items-center justify-center shadow-[2px_2px_0px_0px_var(--color-shadow)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                            >
                                <LuArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                            </button>
                            <div>
                                <h1 className="text-3xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wider">Negotiation History</h1>
                                <p className="text-[10px] font-mono font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-widest mt-1">
                                    Assess previous salary counter profiles and details.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Analytics metrics */}
                    {analytics && (
                        <>
                            {/* Key Stats Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Simulations', value: analytics.totalNegotiations, sub: `${analytics.completedNegotiations} completed`, icon: LuActivity },
                                    { label: 'Avg CTC Gained', value: `${analytics.avgImprovement}%`, sub: 'Across simulations', icon: LuTrendingUp },
                                    { label: 'Confidence Score', value: `${analytics.avgConfidence}/100`, sub: 'Recruiter rating', icon: LuTarget },
                                    { label: 'Activity Streak', value: `${analytics.streak} Days`, sub: 'Streak multiplier', icon: LuFlame }
                                ].map((card, idx) => {
                                    const IconComp = card.icon;
                                    return (
                                        <div key={idx} className="card-editorial p-6 bg-white dark:bg-navy-light flex flex-col justify-between">
                                            <div className="flex items-center justify-between gap-3 mb-4">
                                                <div>
                                                    <span className="text-[9px] font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest">{card.label}</span>
                                                    <h3 className="text-2xl font-display font-bold text-charcoal dark:text-cream mt-1">{card.value}</h3>
                                                </div>
                                                <div className="w-10 h-10 border-2 border-charcoal/20 bg-cream dark:bg-navy rounded-sm flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]">
                                                    <IconComp className="w-5 h-5 text-charcoal/60 dark:text-cream/60" />
                                                </div>
                                            </div>
                                            <div className="text-[9px] font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest border-t border-dashed border-charcoal/10 dark:border-cream/10 pt-2.5 mt-auto">
                                                {card.sub}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Achievements Cards */}
                            {analytics.achievements?.length > 0 && (
                                <div className="card-editorial p-6 bg-white dark:bg-navy-light">
                                    <h2 className="text-lg font-display font-bold text-charcoal dark:text-cream mb-4 flex items-center gap-2 uppercase tracking-wide border-b border-dashed border-charcoal/10 pb-3">
                                        <LuTrophy className="w-5.5 h-5.5 text-charcoal/60" />
                                        <span>Earned Badges</span>
                                    </h2>
                                    <div className="flex flex-wrap gap-3">
                                        {analytics.achievements.map((achievement, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2.5 px-4 py-2.5 bg-cream dark:bg-navy border-2 border-charcoal/15 dark:border-cream/15 rounded-sm shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]"
                                            >
                                                <span className="text-xl flex-shrink-0">{achievement.icon}</span>
                                                <span className="font-mono font-bold text-[10px] text-charcoal dark:text-cream uppercase tracking-wider">{achievement.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Top Tactics progress charts */}
                            {analytics.topTactics?.length > 0 && (
                                <div className="card-editorial p-6 bg-white dark:bg-navy-light">
                                    <h2 className="text-lg font-display font-bold text-charcoal dark:text-cream mb-4 flex items-center gap-2 uppercase tracking-wide border-b border-dashed border-charcoal/10 pb-3">
                                        <LuStar className="w-5.5 h-5.5 text-charcoal/60" />
                                        <span>Valued Tactics Utilized</span>
                                    </h2>
                                    <div className="space-y-4">
                                        {analytics.topTactics.map((tactic, idx) => (
                                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <span className="text-[10px] font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wide w-48 truncate">
                                                    {tactic.tactic.replace('-', ' ')}
                                                </span>
                                                <div className="flex-1 flex items-center gap-3 w-full">
                                                    <div className="flex-1 h-3 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm p-[1px]">
                                                        <div
                                                            className="h-full bg-charcoal dark:bg-cream"
                                                            style={{ width: `${(tactic.count / analytics.totalNegotiations) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-mono font-bold text-charcoal dark:text-cream w-8 text-right">
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

                    {/* Simulations list */}
                    <div className="card-editorial p-6 bg-white dark:bg-navy-light">
                        <h2 className="text-lg font-display font-bold text-charcoal dark:text-cream mb-6 flex items-center gap-2 uppercase tracking-wide border-b border-dashed border-charcoal/10 pb-3">
                            <LuCalendar className="w-5.5 h-5.5 text-charcoal/60" />
                            <span>Simulation Log Archive</span>
                        </h2>

                        {negotiations.length === 0 ? (
                            <div className="text-center py-12 bg-cream dark:bg-navy rounded-sm border-2 border-dashed border-charcoal/20">
                                <LuActivity className="w-12 h-12 text-charcoal/30 dark:text-cream/30 mx-auto mb-3" />
                                <p className="text-xs font-mono font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-widest mb-4">No archives found</p>
                                <button
                                    onClick={() => navigate('/salary-negotiation')}
                                    className="px-5 py-2.5 bg-charcoal text-white dark:bg-cream dark:text-navy rounded-sm font-mono font-bold uppercase tracking-wider text-[10px] border-2 border-charcoal hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)]"
                                >
                                    Launch first simulation
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
                                            className="p-5 bg-cream dark:bg-navy border-3 border-charcoal/15 dark:border-cream/15 rounded-sm hover:-translate-y-0.5 hover:shadow-[3.5px_3.5px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-shadow)] flex flex-col gap-4"
                                            onClick={() => {
                                                if (negotiation.status === 'in-progress') {
                                                    navigate('/salary-negotiation/simulator', { state: negotiation });
                                                }
                                            }}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="text-base font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wide">
                                                        {negotiation.role}
                                                    </h3>
                                                    <p className="text-[10px] font-mono font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-widest mt-0.5">
                                                        {getScenarioName(negotiation.scenario)} • {negotiation.location}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    {getStatusBadge(negotiation.status)}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-dashed border-charcoal/10 dark:border-cream/10 pt-4">
                                                {[
                                                    { label: 'Initial CTC', value: formatCurrency(initial) },
                                                    { label: 'Final CTC', value: formatCurrency(final) },
                                                    { label: 'Improvement', value: negotiation.status !== 'in-progress' ? `+${improvement.toFixed(1)}%` : '-' },
                                                    { label: 'Archived Date', value: formatDate(negotiation.createdAt) }
                                                ].map((stat, idx) => (
                                                    <div key={idx}>
                                                        <div className="text-[8px] font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest mb-0.5">{stat.label}</div>
                                                        <div className="text-xs font-mono font-bold text-charcoal dark:text-cream">{stat.value}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {negotiation.performance?.confidenceScore && (
                                                <div className="flex items-center gap-2.5 border-t border-dashed border-charcoal/10 dark:border-cream/10 pt-3">
                                                    <span className="text-[9px] font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest">Confidence Index:</span>
                                                    <div className="flex-1 h-2 bg-charcoal/10 dark:bg-cream/10 border border-charcoal/20 rounded-none overflow-hidden max-w-xs p-[1px]">
                                                        <div
                                                            className="h-full bg-charcoal dark:bg-cream"
                                                            style={{ width: `${negotiation.performance.confidenceScore}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-mono font-bold text-charcoal dark:text-cream">
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
