import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import EmailNegotiationView from '../../components/EmailNegotiationView';
import {
    LuDollarSign,
    LuSend,
    LuTrendingUp,
    LuTrendingDown,
    LuCheck,
    LuX,
    LuInfo,
    LuSparkles,
    LuActivity,
    LuTarget,
    LuMessageSquare,
    LuLoader,
    LuArrowLeft
} from 'react-icons/lu';

const NegotiationSimulator = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    
    const [negotiation, setNegotiation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [userMessage, setUserMessage] = useState('');
    const [showCounterOffer, setShowCounterOffer] = useState(false);
    const [counterOffer, setCounterOffer] = useState({
        baseSalary: '',
        equity: '',
        signingBonus: ''
    });
    const [analysis, setAnalysis] = useState(null);

    const config = location.state;

    useEffect(() => {
        if (!config) {
            navigate('/salary-negotiation');
            return;
        }
        startNegotiation();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [negotiation?.conversationHistory]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const startNegotiation = async () => {
        try {
            const token = localStorage.getItem('token');
            // Use relative URL if VITE_API_URL is not set, otherwise use the full URL
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
            const apiUrl = `${baseUrl}/api/salary-negotiation/start`;
            
            console.log('Starting negotiation with config:', config);
            console.log('API URL:', apiUrl);
            
            const response = await axios.post(
                apiUrl,
                config,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log('Negotiation started:', response.data);
            setNegotiation(response.data.negotiation);
            setLoading(false);
        } catch (error) {
            console.error('Error starting negotiation:', error);
            console.error('Error details:', error.response?.data);
            setLoading(false);
            alert('Failed to start negotiation. Please make sure the backend server is running.');
        }
    };

    const handleSendMessage = async () => {
        if (!userMessage.trim() && !showCounterOffer) return;
        
        setSending(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
            const response = await axios.post(
                `${baseUrl}/api/salary-negotiation/${negotiation.id}/message`,
                {
                    message: userMessage,
                    counterOffer: showCounterOffer ? {
                        baseSalary: counterOffer.baseSalary ? parseInt(counterOffer.baseSalary) * 100000 : undefined,
                        equity: counterOffer.equity ? parseInt(counterOffer.equity) * 100000 : undefined,
                        signingBonus: counterOffer.signingBonus ? parseInt(counterOffer.signingBonus) * 100000 : undefined
                    } : undefined
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Update conversation history
            setNegotiation(prev => ({
                ...prev,
                conversationHistory: [
                    ...prev.conversationHistory,
                    {
                        sender: 'user',
                        message: userMessage,
                        offer: showCounterOffer ? {
                            baseSalary: counterOffer.baseSalary ? parseInt(counterOffer.baseSalary) * 100000 : 0,
                            equity: counterOffer.equity ? parseInt(counterOffer.equity) * 100000 : 0,
                            signingBonus: counterOffer.signingBonus ? parseInt(counterOffer.signingBonus) * 100000 : 0
                        } : undefined
                    },
                    {
                        sender: 'recruiter',
                        message: response.data.recruiterMessage,
                        offer: response.data.newOffer
                    }
                ]
            }));
            
            setAnalysis(response.data.analysis);
            setUserMessage('');
            setCounterOffer({ baseSalary: '', equity: '', signingBonus: '' });
            setShowCounterOffer(false);
        } catch (error) {
            console.error('Error sending message:', error);
        }
        setSending(false);
    };

    const handleAcceptOffer = async () => {
        const lastOffer = negotiation.conversationHistory[negotiation.conversationHistory.length - 1].offer;
        await finalizeNegotiation('accept', lastOffer);
    };

    const handleRejectOffer = async () => {
        await finalizeNegotiation('reject', null);
    };

    const finalizeNegotiation = async (action, finalOffer) => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
            const response = await axios.post(
                `${baseUrl}/api/salary-negotiation/${negotiation.id}/finalize`,
                { action, finalOffer },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            navigate('/salary-negotiation/results', {
                state: {
                    summary: response.data.summary,
                    feedback: response.data.feedback
                }
            });
        } catch (error) {
            console.error('Error finalizing negotiation:', error);
        }
    };

    const formatCurrency = (amount) => {
        // Convert to Lakhs and format as INR
        const lakhs = amount / 100000;
        return `₹${lakhs.toFixed(2)} LPA`;
    };

    const getCurrentOffer = () => {
        const messages = negotiation?.conversationHistory || [];
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].sender === 'recruiter' && messages[i].offer) {
                return messages[i].offer;
            }
        }
        return negotiation?.initialOffer;
    };

    const calculateTotalComp = (offer) => {
        if (!offer) return 0;
        return (offer.baseSalary || 0) + (offer.equity || 0) + (offer.signingBonus || 0);
    };

    const getMarketPosition = (salary) => {
        const market = negotiation?.marketData;
        if (!market) return null;
        
        if (salary >= market.p90) return { label: 'Top 10%', color: 'emerald', percentile: 90 };
        if (salary >= market.p75) return { label: 'Top 25%', color: 'blue', percentile: 75 };
        if (salary >= market.p50) return { label: 'Above Median', color: 'indigo', percentile: 50 };
        if (salary >= market.p25) return { label: 'Below Median', color: 'amber', percentile: 25 };
        return { label: 'Bottom 25%', color: 'red', percentile: 10 };
    };

    if (loading || !negotiation) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <LuLoader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                        <p className="text-slate-600">Starting your negotiation...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const currentOffer = getCurrentOffer();
    const totalComp = calculateTotalComp(currentOffer);
    const marketPosition = getMarketPosition(currentOffer?.baseSalary);

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-6 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate('/salary-negotiation')}
                                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                >
                                    <LuArrowLeft className="w-5 h-5" />
                                    <span className="font-medium">Back</span>
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <LuMessageSquare className="w-6 h-6 text-indigo-600" />
                                        {negotiation.role} Negotiation
                                    </h1>
                                    <p className="text-slate-600 dark:text-slate-300 mt-1">
                                        {negotiation.scenario} • {negotiation.location} • {negotiation.recruiterPersonality} recruiter
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-slate-600 dark:text-slate-400">Round</div>
                                <div className="text-3xl font-bold text-indigo-600">
                                    {Math.floor((negotiation.conversationHistory?.length || 0) / 2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Sidebar - Current Offer */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Current Offer Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <LuDollarSign className="w-5 h-5 text-indigo-600" />
                                    Current Offer
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Base Salary</div>
                                        <div className="text-2xl font-bold text-slate-800 dark:text-white">
                                            {formatCurrency(currentOffer?.baseSalary || 0)}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Equity</div>
                                            <div className="text-lg font-semibold text-slate-800 dark:text-white">
                                                {formatCurrency(currentOffer?.equity || 0)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Signing Bonus</div>
                                            <div className="text-lg font-semibold text-slate-800 dark:text-white">
                                                {formatCurrency(currentOffer?.signingBonus || 0)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Compensation</div>
                                        <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                            {formatCurrency(totalComp)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Market Data Card */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border-2 border-blue-200 dark:border-slate-600">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <LuActivity className="w-5 h-5 text-indigo-600" />
                                    Market Data
                                </h3>
                                
                                {marketPosition && (
                                    <div className={`mb-4 p-3 bg-${marketPosition.color}-100 rounded-xl`}>
                                        <div className={`text-sm font-semibold text-${marketPosition.color}-800`}>
                                            Your Position: {marketPosition.label}
                                        </div>
                                        <div className={`text-xs text-${marketPosition.color}-600 mt-1`}>
                                            {marketPosition.percentile}th percentile
                                        </div>
                                    </div>
                                )}
                                
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-300">90th percentile:</span>
                                        <span className="font-semibold dark:text-white">{formatCurrency(negotiation.marketData?.p90)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-300">75th percentile:</span>
                                        <span className="font-semibold dark:text-white">{formatCurrency(negotiation.marketData?.p75)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-300">Median (50th):</span>
                                        <span className="font-semibold dark:text-white">{formatCurrency(negotiation.marketData?.p50)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-300">25th percentile:</span>
                                        <span className="font-semibold dark:text-white">{formatCurrency(negotiation.marketData?.p25)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Analysis Card */}
                            {analysis && (
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                        <LuSparkles className="w-5 h-5 text-indigo-600" />
                                        AI Analysis
                                    </h3>
                                    
                                    {analysis.tacticsDetected?.length > 0 && (
                                        <div className="mb-4">
                                            <div className="text-sm font-semibold text-emerald-700 mb-2">✓ Good Tactics</div>
                                            <div className="space-y-1">
                                                {analysis.tacticsDetected.map((tactic, idx) => (
                                                    <div key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                                        <LuCheck className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                        {tactic}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {analysis.suggestions?.length > 0 && (
                                        <div>
                                            <div className="text-sm font-semibold text-amber-700 mb-2">💡 Suggestions</div>
                                            <div className="space-y-1">
                                                {analysis.suggestions.map((suggestion, idx) => (
                                                    <div key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                                        <LuInfo className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                                        {suggestion}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Main Chat/Email Area */}
                        <div className="lg:col-span-2">
                            {negotiation.communicationMode === 'email' ? (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg h-[calc(100vh-12rem)]">
                                    <EmailNegotiationView
                                        negotiation={negotiation}
                                        conversationHistory={negotiation.conversationHistory || []}
                                        onSendEmail={handleSendMessage}
                                    />
                                </div>
                            ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg h-[calc(100vh-12rem)] flex flex-col">
                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {negotiation.conversationHistory?.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[80%] ${
                                                msg.sender === 'user'
                                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white'
                                            } rounded-2xl p-4 shadow-md`}>
                                                <div className="text-sm font-semibold mb-2">
                                                    {msg.sender === 'user' ? 'You' : 'Recruiter'}
                                                </div>
                                                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                                    {msg.message}
                                                </div>
                                                {msg.offer && (
                                                    <div className="mt-3 pt-3 border-t border-white/20 text-sm space-y-1">
                                                        <div>Base: {formatCurrency(msg.offer.baseSalary)}</div>
                                                        {msg.offer.equity > 0 && <div>Equity: {formatCurrency(msg.offer.equity)}</div>}
                                                        {msg.offer.signingBonus > 0 && <div>Signing: {formatCurrency(msg.offer.signingBonus)}</div>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="border-t border-slate-200 dark:border-slate-700 p-6">
                                    {showCounterOffer && (
                                        <div className="mb-4 p-4 bg-indigo-50 dark:bg-slate-700 rounded-xl">
                                            <div className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-3">Counter Offer (in Lakhs)</div>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Base (LPA)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="e.g. 12"
                                                        value={counterOffer.baseSalary}
                                                        onChange={(e) => setCounterOffer({ ...counterOffer, baseSalary: e.target.value })}
                                                        className="w-full px-3 py-2 border border-indigo-200 dark:border-slate-600 dark:bg-slate-600 dark:text-white rounded-lg text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Equity (LPA)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="e.g. 2"
                                                        value={counterOffer.equity}
                                                        onChange={(e) => setCounterOffer({ ...counterOffer, equity: e.target.value })}
                                                        className="w-full px-3 py-2 border border-indigo-200 dark:border-slate-600 dark:bg-slate-600 dark:text-white rounded-lg text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Signing (LPA)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="e.g. 1"
                                                        value={counterOffer.signingBonus}
                                                        onChange={(e) => setCounterOffer({ ...counterOffer, signingBonus: e.target.value })}
                                                        className="w-full px-3 py-2 border border-indigo-200 dark:border-slate-600 dark:bg-slate-600 dark:text-white rounded-lg text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex gap-3">
                                        <textarea
                                            value={userMessage}
                                            onChange={(e) => setUserMessage(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            placeholder="Type your response... (Shift+Enter for new line)"
                                            className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all"
                                            rows="3"
                                        />
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={sending || (!userMessage.trim() && !showCounterOffer)}
                                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                {sending ? <LuLoader className="w-5 h-5 animate-spin" /> : <LuSend className="w-5 h-5" />}
                                            </button>
                                            <button
                                                onClick={() => setShowCounterOffer(!showCounterOffer)}
                                                className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all text-sm"
                                            >
                                                {showCounterOffer ? 'Cancel' : 'Counter'}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-3 mt-3">
                                        <button
                                            onClick={handleAcceptOffer}
                                            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <LuCheck className="w-4 h-4" />
                                            Accept Offer
                                        </button>
                                        <button
                                            onClick={handleRejectOffer}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <LuX className="w-4 h-4" />
                                            Reject & Walk Away
                                        </button>
                                    </div>
                                </div>
                            </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default NegotiationSimulator;
