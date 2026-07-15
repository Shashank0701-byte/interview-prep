import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import {
    LuTrendingUp,
    LuTrendingDown,
    LuTarget,
    LuAward,
    LuCheck,
    LuX,
    LuInfo,
    LuSparkles,
    LuArrowRight,
    LuRotateCcw,
    LuActivity,
    LuArrowLeft
} from 'react-icons/lu';

const NegotiationResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const { summary, feedback } = location.state || {};

    if (!summary || !feedback) {
        navigate('/salary-negotiation');
        return null;
    }

    const formatCurrency = (amount) => {
        const lakhs = amount / 100000;
        return `₹${lakhs.toFixed(2)} LPA`;
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-cream dark:bg-navy py-8 px-6 font-body text-charcoal dark:text-cream transition-colors duration-300">
                <div className="max-w-5xl mx-auto">
                    {/* Back button */}
                    <button
                        onClick={() => navigate('/salary-negotiation')}
                        className="flex items-center gap-2 px-4 py-2 mb-6 text-charcoal dark:text-cream hover:bg-white dark:hover:bg-navy-light border-2 border-transparent hover:border-charcoal dark:hover:border-cream/40 rounded-sm transition-all font-mono font-bold uppercase tracking-wider text-xs cursor-pointer"
                    >
                        <LuArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                        <span>Scenarios Lobby</span>
                    </button>

                    {/* Result Hero Header Card */}
                    <div className="card-editorial p-8 md:p-10 mb-8 bg-white dark:bg-navy-light flex flex-col items-center text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm mb-6 shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                            {summary.status === 'accepted' ? (
                                <LuCheck className="w-8 h-8 text-charcoal dark:text-cream" strokeWidth={2.5} />
                            ) : summary.status === 'rejected' ? (
                                <LuX className="w-8 h-8 text-charcoal dark:text-cream" strokeWidth={2.5} />
                            ) : (
                                <LuInfo className="w-8 h-8 text-charcoal dark:text-cream" strokeWidth={2.5} />
                            )}
                        </div>
                        
                        <h1 className="text-4xl font-display font-bold mb-4 text-charcoal dark:text-cream uppercase tracking-wider">
                            {summary.status === 'accepted' ? 'Negotiation Complete!' :
                             summary.status === 'rejected' ? 'Offer Declined' :
                             'Walked Away'}
                        </h1>
                        
                        <p className="text-sm font-mono font-bold text-charcoal/70 dark:text-cream/70 uppercase tracking-widest max-w-2xl leading-relaxed mb-8">
                            {feedback.overall}
                        </p>

                        {/* Stats Dashboard Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                            {[
                                { 
                                    label: ' CTC Improvement', 
                                    value: feedback.improvement,
                                    icon: parseFloat(feedback.improvement) >= 0 ? LuTrendingUp : LuTrendingDown 
                                },
                                { label: 'Confidence Score', value: `${feedback.confidenceScore}/100`, icon: LuTarget },
                                { label: 'Negotiation Rounds', value: summary.rounds, icon: LuActivity }
                            ].map((stat, idx) => {
                                const IconComp = stat.icon;
                                return (
                                    <div key={idx} className="bg-cream dark:bg-navy border-2 border-charcoal/15 dark:border-cream/15 rounded-sm p-5 shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)] flex flex-col items-center">
                                        <div className="w-8 h-8 border border-charcoal/20 bg-white dark:bg-navy-light rounded-sm flex items-center justify-center mb-2 shadow-[1px_1px_0px_0px_var(--color-shadow)]">
                                            <IconComp className="w-4.5 h-4.5 text-charcoal/60 dark:text-cream/60" />
                                        </div>
                                        <div className="text-[9px] font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest mb-1">{stat.label}</div>
                                        <div className="text-2xl font-display font-bold text-charcoal dark:text-cream leading-tight">{stat.value}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="card-editorial p-6 md:p-8 mb-8 bg-white dark:bg-navy-light">
                        <h2 className="text-xl font-display font-bold text-charcoal dark:text-cream mb-6 flex items-center gap-2 uppercase tracking-wide border-b border-dashed border-charcoal/10 pb-3">
                            <LuActivity className="w-5.5 h-5.5 text-charcoal/60" />
                            <span>Compensation Comparison</span>
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <div className="text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest mb-3">Initial CTC Offer</div>
                                <div className="space-y-3 p-4 bg-cream dark:bg-navy border border-charcoal/10 rounded-sm">
                                    <div className="flex justify-between items-center font-mono font-bold">
                                        <span className="text-[10px] text-charcoal/50 uppercase">Initial CTC</span>
                                        <span className="text-lg text-charcoal dark:text-cream">
                                            {formatCurrency(summary.initialTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <div className="text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest mb-3">Final CTC Offer</div>
                                <div className="space-y-3 p-4 bg-cream dark:bg-navy border border-charcoal/10 rounded-sm">
                                    <div className="flex justify-between items-center font-mono font-bold">
                                        <span className="text-[10px] text-charcoal/50 uppercase">Final CTC</span>
                                        <span className="text-lg text-charcoal dark:text-cream">
                                            {formatCurrency(summary.finalTotal)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wide border-t border-dashed border-charcoal/10 pt-2 mt-2">
                                        <LuTrendingUp className="w-4 h-4 text-emerald-500" />
                                        <span>Gained: +{formatCurrency(summary.finalTotal - summary.initialTotal)} ({feedback.improvement})</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Market Position Index */}
                    {feedback.marketPosition && (
                        <div className="card-editorial p-6 md:p-8 bg-white dark:bg-navy-light mb-8">
                            <h3 className="text-lg font-mono font-bold text-charcoal dark:text-cream mb-4 flex items-center gap-2.5 uppercase tracking-wide border-b border-dashed border-charcoal/10 pb-3">
                                <LuTarget className="w-5.5 h-5.5 text-charcoal/60" />
                                <span>Market Percentile Ranking</span>
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="font-mono font-bold">
                                    <div className="text-xl text-charcoal dark:text-cream uppercase tracking-wide">
                                        {feedback.marketPosition.description}
                                    </div>
                                    <div className="text-[11px] text-charcoal/60 dark:text-cream/60 mt-1 uppercase tracking-widest">
                                        CTC proposal ranks at {feedback.marketPosition.percentile}th percentile region.
                                    </div>
                                </div>
                                <div className="text-5xl font-display font-bold text-charcoal dark:text-cream flex-shrink-0">
                                    {feedback.marketPosition.percentile}%
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Performance details lists */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Strengths */}
                        {feedback.strengths?.length > 0 && (
                            <div className="card-editorial p-6 bg-white dark:bg-navy-light">
                                <h3 className="text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest mb-4 border-b border-dashed border-charcoal/10 pb-2 flex items-center gap-1.5">
                                    <LuCheck className="w-4.5 h-4.5 text-charcoal/60" />
                                    <span>What Went Well</span>
                                </h3>
                                <div className="space-y-3">
                                    {feedback.strengths.map((strength, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5 p-3.5 bg-cream dark:bg-navy border border-charcoal/10 rounded-sm">
                                            <LuCheck className="w-4 h-4 text-charcoal dark:text-cream mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                                            <span className="text-xs font-bold text-charcoal/80 dark:text-cream/80 font-body leading-relaxed">{strength}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Improvements */}
                        {feedback.areasForImprovement?.length > 0 && (
                            <div className="card-editorial p-6 bg-white dark:bg-navy-light">
                                <h3 className="text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest mb-4 border-b border-dashed border-charcoal/10 pb-2 flex items-center gap-1.5">
                                    <LuInfo className="w-4.5 h-4.5 text-charcoal/60" />
                                    <span>Areas to Improve</span>
                                </h3>
                                <div className="space-y-3">
                                    {feedback.areasForImprovement.map((area, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5 p-3.5 bg-cream dark:bg-navy border border-charcoal/10 rounded-sm">
                                            <LuInfo className="w-4 h-4 text-charcoal dark:text-cream mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                                            <span className="text-xs font-bold text-charcoal/80 dark:text-cream/80 font-body leading-relaxed">{area}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tactics used taglists */}
                    {feedback.tacticsUsed?.length > 0 && (
                        <div className="card-editorial p-6 mb-8 bg-white dark:bg-navy-light">
                            <h3 className="text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest mb-4 border-b border-dashed border-charcoal/10 pb-2 flex items-center gap-1.5">
                                <LuSparkles className="w-4.5 h-4.5 text-charcoal/60" />
                                <span>Detected Tactics</span>
                            </h3>
                            <div className="flex flex-wrap gap-2.5">
                                {feedback.tacticsUsed.map((tactic, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1.5 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal dark:text-cream shadow-[1px_1px_0px_0px_var(--color-shadow)]"
                                    >
                                        {tactic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Core Tips/Advice */}
                    {feedback.recommendations?.length > 0 && (
                        <div className="card-editorial p-6 md:p-8 bg-white dark:bg-navy-light mb-8 border-l-6 border-l-charcoal dark:border-l-cream">
                            <h3 className="text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest mb-4 border-b border-dashed border-charcoal/10 pb-2 flex items-center gap-1.5">
                                <LuAward className="w-5 h-5 text-charcoal/60" />
                                <span>Core Recommendations</span>
                            </h3>
                            <div className="space-y-3 font-body text-xs font-bold text-charcoal/80 dark:text-cream/80 leading-relaxed">
                                {feedback.recommendations.map((rec, idx) => (
                                    <div key={idx} className="flex items-start gap-2.5">
                                        <div className="w-2 h-2 bg-charcoal dark:bg-cream rounded-none mt-1.5 flex-shrink-0"></div>
                                        <p>{rec}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 border-t border-dashed border-charcoal/15 dark:border-cream/10 pt-6">
                        <button
                            onClick={() => navigate('/salary-negotiation')}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-charcoal text-white dark:bg-cream dark:text-navy rounded-sm font-mono font-bold uppercase tracking-widest text-xs border-3 border-charcoal dark:border-cream hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 cursor-pointer shadow-[3px_3px_0px_0px_var(--color-shadow)]"
                        >
                            <LuRotateCcw className="w-4 h-4" />
                            <span>Try Scenario Lobby</span>
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-charcoal dark:bg-navy dark:text-cream rounded-sm font-mono font-bold uppercase tracking-widest text-xs border-3 border-charcoal dark:border-cream/40 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 cursor-pointer shadow-[3px_3px_0px_0px_var(--color-shadow)]"
                        >
                            <span>Back to dashboard</span>
                            <LuArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default NegotiationResults;
