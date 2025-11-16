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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/salary-negotiation')}
                        className="flex items-center gap-2 px-4 py-2 mb-6 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <LuArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Scenarios</span>
                    </button>

                    {/* Hero Result Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl mb-8 border-2 border-slate-200 dark:border-slate-700">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-6">
                                {summary.status === 'accepted' ? (
                                    <LuCheck className="w-10 h-10 text-emerald-600" />
                                ) : summary.status === 'rejected' ? (
                                    <LuX className="w-10 h-10 text-red-600" />
                                ) : (
                                    <LuInfo className="w-10 h-10 text-amber-600" />
                                )}
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
                                {summary.status === 'accepted' ? 'Negotiation Complete!' :
                                 summary.status === 'rejected' ? 'Offer Rejected' :
                                 'Walked Away'}
                            </h1>
                            
                            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
                                {feedback.overall}
                            </p>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600">
                                    <div className="text-slate-600 dark:text-slate-400 text-sm mb-2">Improvement</div>
                                    <div className="text-4xl font-bold flex items-center justify-center gap-2 text-slate-900 dark:text-white">
                                        {parseFloat(feedback.improvement) >= 0 ? (
                                            <LuTrendingUp className="w-8 h-8 text-emerald-600" />
                                        ) : (
                                            <LuTrendingDown className="w-8 h-8 text-red-600" />
                                        )}
                                        {feedback.improvement}
                                    </div>
                                </div>
                                
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600">
                                    <div className="text-slate-600 dark:text-slate-400 text-sm mb-2">Confidence Score</div>
                                    <div className="text-4xl font-bold text-slate-900 dark:text-white">{feedback.confidenceScore}/100</div>
                                </div>
                                
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600">
                                    <div className="text-slate-600 dark:text-slate-400 text-sm mb-2">Negotiation Rounds</div>
                                    <div className="text-4xl font-bold text-slate-900 dark:text-white">{summary.rounds}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compensation Comparison */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <LuActivity className="w-6 h-6 text-indigo-600" />
                            Compensation Breakdown
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Initial Offer</div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400">Total</span>
                                        <span className="text-2xl font-bold text-slate-800 dark:text-white">
                                            {formatCurrency(summary.initialTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Final Offer</div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400">Total</span>
                                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                            {formatCurrency(summary.finalTotal)}
                                        </span>
                                    </div>
                                    <div className={`flex items-center gap-2 text-${improvementColor}-600 font-semibold`}>
                                        <LuTrendingUp className="w-5 h-5" />
                                        +{formatCurrency(summary.finalTotal - summary.initialTotal)} ({feedback.improvement})
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Market Position */}
                    {feedback.marketPosition && (
                        <div className={`bg-gradient-to-br from-${feedback.marketPosition.percentile >= 75 ? 'emerald' : feedback.marketPosition.percentile >= 50 ? 'blue' : 'amber'}-50 to-${feedback.marketPosition.percentile >= 75 ? 'emerald' : feedback.marketPosition.percentile >= 50 ? 'blue' : 'amber'}-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 mb-8 border-2 border-${feedback.marketPosition.percentile >= 75 ? 'emerald' : feedback.marketPosition.percentile >= 50 ? 'blue' : 'amber'}-200 dark:border-slate-600`}>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <LuTarget className="w-6 h-6" />
                                Market Position
                            </h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold text-slate-800 dark:text-white">
                                        {feedback.marketPosition.description}
                                    </div>
                                    <div className="text-slate-600 dark:text-slate-300 mt-2">
                                        Your final offer is at the {feedback.marketPosition.percentile}th percentile for your role and location
                                    </div>
                                </div>
                                <div className={`text-6xl font-bold text-${feedback.marketPosition.percentile >= 75 ? 'emerald' : feedback.marketPosition.percentile >= 50 ? 'blue' : 'amber'}-600`}>
                                    {feedback.marketPosition.percentile}%
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Performance Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Strengths */}
                        {feedback.strengths?.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <LuCheck className="w-5 h-5 text-emerald-600" />
                                    What You Did Well
                                </h3>
                                <div className="space-y-3">
                                    {feedback.strengths.map((strength, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                                            <LuCheck className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-slate-700 dark:text-slate-300">{strength}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Areas for Improvement */}
                        {feedback.areasForImprovement?.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <LuInfo className="w-5 h-5 text-amber-600" />
                                    Areas to Improve
                                </h3>
                                <div className="space-y-3">
                                    {feedback.areasForImprovement.map((area, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                                            <LuInfo className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-slate-700 dark:text-slate-300">{area}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tactics Used */}
                    {feedback.tacticsUsed?.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-8">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <LuSparkles className="w-5 h-5 text-indigo-600" />
                                Negotiation Tactics You Used
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {feedback.tacticsUsed.map((tactic, idx) => (
                                    <span
                                        key={idx}
                                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                                    >
                                        {tactic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {feedback.recommendations?.length > 0 && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 border-2 border-blue-200 dark:border-slate-600 mb-8">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <LuAward className="w-6 h-6 text-indigo-600" />
                                Recommendations for Next Time
                            </h3>
                            <div className="space-y-3">
                                {feedback.recommendations.map((rec, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <p className="text-slate-700 dark:text-slate-300">{rec}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate('/salary-negotiation')}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all"
                        >
                            <LuRotateCcw className="w-5 h-5" />
                            Try Another Scenario
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all border-2 border-slate-200 dark:border-slate-600"
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
