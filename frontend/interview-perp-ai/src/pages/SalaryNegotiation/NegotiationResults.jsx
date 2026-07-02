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
        // Convert to Lakhs and format as INR
        const lakhs = amount / 100000;
        return `₹${lakhs.toFixed(2)} LPA`;
    };

    const getImprovementColor = (improvement) => {
        const num = parseFloat(improvement);
        if (num >= 20) return 'emerald';
        if (num >= 10) return 'blue';
        if (num >= 5) return 'amber';
        return 'slate';
    };

    const getConfidenceColor = (score) => {
        if (score >= 80) return 'emerald';
        if (score >= 60) return 'blue';
        if (score >= 40) return 'amber';
        return 'red';
    };

    const improvementColor = getImprovementColor(feedback.improvement);
    const confidenceColor = getConfidenceColor(feedback.confidenceScore);

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-cream py-8 px-4 font-body">
                <div className="max-w-5xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/salary-negotiation')}
                        className="flex items-center gap-2 px-4 py-2 mb-6 text-charcoal hover:bg-white border-2 border-transparent hover:border-charcoal rounded-md transition-all font-bold uppercase tracking-wider text-sm cursor-pointer"
                    >
                        <LuArrowLeft className="w-5 h-5" />
                        <span>Back to Scenarios</span>
                    </button>

                    {/* Hero Result Card */}
                    <div className="card-editorial p-8 md:p-12 mb-8 bg-white">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-cream border-2 border-charcoal rounded-md mb-6">
                                {summary.status === 'accepted' ? (
                                    <LuCheck className="w-10 h-10 text-charcoal" />
                                ) : summary.status === 'rejected' ? (
                                    <LuX className="w-10 h-10 text-charcoal" />
                                ) : (
                                    <LuInfo className="w-10 h-10 text-charcoal" />
                                )}
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-charcoal uppercase tracking-wider">
                                {summary.status === 'accepted' ? 'Negotiation Complete!' :
                                 summary.status === 'rejected' ? 'Offer Rejected' :
                                 'Walked Away'}
                            </h1>
                            
                            <p className="text-xl text-charcoal/80 font-medium mb-8">
                                {feedback.overall}
                            </p>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                <div className="bg-cream border-2 border-charcoal/10 rounded-md p-6">
                                    <div className="text-charcoal/80 font-bold uppercase tracking-wider text-sm mb-2">Improvement</div>
                                    <div className="text-4xl font-display font-bold flex items-center justify-center gap-2 text-charcoal">
                                        {parseFloat(feedback.improvement) >= 0 ? (
                                            <LuTrendingUp className="w-8 h-8 text-charcoal" />
                                        ) : (
                                            <LuTrendingDown className="w-8 h-8 text-charcoal" />
                                        )}
                                        {feedback.improvement}
                                    </div>
                                </div>
                                
                                <div className="bg-cream border-2 border-charcoal/10 rounded-md p-6">
                                    <div className="text-charcoal/80 font-bold uppercase tracking-wider text-sm mb-2">Confidence Score</div>
                                    <div className="text-4xl font-display font-bold text-charcoal">{feedback.confidenceScore}/100</div>
                                </div>
                                
                                <div className="bg-cream border-2 border-charcoal/10 rounded-md p-6">
                                    <div className="text-charcoal/80 font-bold uppercase tracking-wider text-sm mb-2">Negotiation Rounds</div>
                                    <div className="text-4xl font-display font-bold text-charcoal">{summary.rounds}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compensation Comparison */}
                    <div className="card-editorial p-8 mb-8 bg-white">
                        <h2 className="text-2xl font-display font-bold text-charcoal mb-6 flex items-center gap-2 uppercase tracking-wider">
                            <LuActivity className="w-6 h-6 text-charcoal" />
                            Compensation Breakdown
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <div className="text-sm font-bold text-charcoal uppercase tracking-wider mb-3">Initial Offer</div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-charcoal/80 font-medium">Total</span>
                                        <span className="text-2xl font-display font-bold text-charcoal">
                                            {formatCurrency(summary.initialTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <div className="text-sm font-bold text-charcoal uppercase tracking-wider mb-3">Final Offer</div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-charcoal/80 font-medium">Total</span>
                                        <span className="text-2xl font-display font-bold text-charcoal">
                                            {formatCurrency(summary.finalTotal)}
                                        </span>
                                    </div>
                                    <div className={`flex items-center gap-2 text-charcoal font-bold mt-2`}>
                                        <LuTrendingUp className="w-5 h-5" />
                                        +{formatCurrency(summary.finalTotal - summary.initialTotal)} ({feedback.improvement})
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Market Position */}
                    {feedback.marketPosition && (
                        <div className={`bg-cream border-2 border-charcoal/10 rounded-md p-8 mb-8`}>
                            <h3 className="text-xl font-display font-bold text-charcoal mb-4 flex items-center gap-2 uppercase tracking-wider">
                                <LuTarget className="w-6 h-6 text-charcoal" />
                                Market Position
                            </h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-display font-bold text-charcoal">
                                        {feedback.marketPosition.description}
                                    </div>
                                    <div className="text-charcoal/80 font-medium mt-2">
                                        Your final offer is at the {feedback.marketPosition.percentile}th percentile for your role and location
                                    </div>
                                </div>
                                <div className={`text-6xl font-display font-bold text-charcoal`}>
                                    {feedback.marketPosition.percentile}%
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Performance Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Strengths */}
                        {feedback.strengths?.length > 0 && (
                            <div className="card-editorial p-6 bg-white">
                                <h3 className="text-lg font-display font-bold text-charcoal mb-4 flex items-center gap-2 uppercase tracking-wider">
                                    <LuCheck className="w-5 h-5 text-charcoal" />
                                    What You Did Well
                                </h3>
                                <div className="space-y-3">
                                    {feedback.strengths.map((strength, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 bg-cream border-2 border-charcoal/10 rounded-md">
                                            <LuCheck className="w-5 h-5 text-charcoal mt-0.5 flex-shrink-0" />
                                            <span className="text-charcoal/80 font-medium">{strength}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Areas for Improvement */}
                        {feedback.areasForImprovement?.length > 0 && (
                            <div className="card-editorial p-6 bg-white">
                                <h3 className="text-lg font-display font-bold text-charcoal mb-4 flex items-center gap-2 uppercase tracking-wider">
                                    <LuInfo className="w-5 h-5 text-charcoal" />
                                    Areas to Improve
                                </h3>
                                <div className="space-y-3">
                                    {feedback.areasForImprovement.map((area, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 bg-cream border-2 border-charcoal/10 rounded-md">
                                            <LuInfo className="w-5 h-5 text-charcoal mt-0.5 flex-shrink-0" />
                                            <span className="text-charcoal/80 font-medium">{area}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tactics Used */}
                    {feedback.tacticsUsed?.length > 0 && (
                        <div className="card-editorial p-6 mb-8 bg-white">
                            <h3 className="text-lg font-display font-bold text-charcoal mb-4 flex items-center gap-2 uppercase tracking-wider">
                                <LuSparkles className="w-5 h-5 text-charcoal" />
                                Negotiation Tactics You Used
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {feedback.tacticsUsed.map((tactic, idx) => (
                                    <span
                                        key={idx}
                                        className="px-4 py-2 bg-cream border-2 border-charcoal rounded-md text-sm font-bold uppercase tracking-wider text-charcoal"
                                    >
                                        {tactic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {feedback.recommendations?.length > 0 && (
                        <div className="bg-cream border-2 border-charcoal/10 rounded-md p-8 mb-8">
                            <h3 className="text-xl font-display font-bold text-charcoal mb-4 flex items-center gap-2 uppercase tracking-wider">
                                <LuAward className="w-6 h-6 text-charcoal" />
                                Recommendations for Next Time
                            </h3>
                            <div className="space-y-3">
                                {feedback.recommendations.map((rec, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-charcoal rounded-none mt-2 flex-shrink-0"></div>
                                        <p className="text-charcoal/80 font-medium">{rec}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate('/salary-negotiation')}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-charcoal text-white rounded-md font-bold text-lg border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all uppercase tracking-wider cursor-pointer"
                        >
                            <LuRotateCcw className="w-5 h-5" />
                            Try Another Scenario
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white text-charcoal rounded-md font-bold text-lg border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all uppercase tracking-wider cursor-pointer"
                        >
                            Back to Dashboard
                            <LuArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default NegotiationResults;
