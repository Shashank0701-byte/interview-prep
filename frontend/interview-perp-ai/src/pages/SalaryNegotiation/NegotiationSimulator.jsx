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

            // Create a minimum delay to simulate "reviewing" time (2.5 seconds)
            const minDelay = new Promise(resolve => setTimeout(resolve, 2500));

            const apiCall = axios.post(
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

            // Wait for both the API and the delay
            const [response] = await Promise.all([apiCall, minDelay]);

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
                <div className="flex items-center justify-center min-h-screen bg-cream font-body">
                    <div className="text-center">
                        <LuLoader className="w-12 h-12 text-charcoal animate-spin mx-auto mb-4" />
                        <p className="text-charcoal/80 font-bold uppercase tracking-wider">Starting your negotiation...</p>
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
            <div className="min-h-screen bg-cream py-6 px-4 font-body">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="card-editorial p-6 mb-6 bg-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate('/salary-negotiation')}
                                    className="flex items-center gap-2 px-4 py-2 text-charcoal hover:bg-cream border-2 border-transparent hover:border-charcoal rounded-md transition-all font-bold uppercase tracking-wider text-sm"
                                >
                                    <LuArrowLeft className="w-5 h-5" />
                                    <span>Back</span>
                                </button>
                                <div>
                                    <h1 className="text-2xl font-display font-bold text-charcoal flex items-center gap-2 uppercase tracking-wider">
                                        <LuMessageSquare className="w-6 h-6 text-charcoal" />
                                        {negotiation.role} Negotiation
                                    </h1>
                                    <p className="text-charcoal/80 font-medium mt-1">
                                        {negotiation.scenario} • {negotiation.location} • {negotiation.recruiterPersonality} recruiter
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-charcoal uppercase tracking-wider">Round</div>
                                <div className="text-3xl font-display font-bold text-charcoal">
                                    {Math.floor((negotiation.conversationHistory?.length || 0) / 2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Sidebar - Current Offer */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Current Offer Card */}
                            <div className="card-editorial p-6 bg-white">
                                <h3 className="text-lg font-display font-bold text-charcoal mb-4 flex items-center gap-2 uppercase tracking-wider">
                                    <LuDollarSign className="w-5 h-5 text-charcoal" />
                                    Current Offer
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <div className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1">Base Salary</div>
                                        <div className="text-2xl font-display font-bold text-charcoal">
                                            {formatCurrency(currentOffer?.baseSalary || 0)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1">Equity</div>
                                            <div className="text-lg font-bold text-charcoal">
                                                {formatCurrency(currentOffer?.equity || 0)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1">Signing Bonus</div>
                                            <div className="text-lg font-bold text-charcoal">
                                                {formatCurrency(currentOffer?.signingBonus || 0)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t-2 border-charcoal/10">
                                        <div className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1">Total Compensation</div>
                                        <div className="text-3xl font-display font-bold text-charcoal">
                                            {formatCurrency(totalComp)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Market Data Card */}
                            <div className="bg-cream rounded-md p-6 border-2 border-charcoal/10">
                                <h3 className="text-lg font-display font-bold text-charcoal mb-4 flex items-center gap-2 uppercase tracking-wider">
                                    <LuActivity className="w-5 h-5 text-charcoal" />
                                    Market Data
                                </h3>

                                {marketPosition && (
                                    <div className={`mb-4 p-3 bg-white border-2 border-charcoal/10 rounded-md`}>
                                        <div className={`text-sm font-bold text-charcoal uppercase tracking-wider`}>
                                            Your Position: {marketPosition.label}
                                        </div>
                                        <div className={`text-xs font-medium text-charcoal/80 mt-1`}>
                                            {marketPosition.percentile}th percentile
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-charcoal/80 font-bold uppercase tracking-wider text-xs">90th percentile:</span>
                                        <span className="font-bold text-charcoal text-sm">{formatCurrency(negotiation.marketData?.p90)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-charcoal/80 font-bold uppercase tracking-wider text-xs">75th percentile:</span>
                                        <span className="font-bold text-charcoal text-sm">{formatCurrency(negotiation.marketData?.p75)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-charcoal/80 font-bold uppercase tracking-wider text-xs">Median (50th):</span>
                                        <span className="font-bold text-charcoal text-sm">{formatCurrency(negotiation.marketData?.p50)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-charcoal/80 font-bold uppercase tracking-wider text-xs">25th percentile:</span>
                                        <span className="font-bold text-charcoal text-sm">{formatCurrency(negotiation.marketData?.p25)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Analysis Card */}
                            {analysis && (
                                <div className="card-editorial p-6 bg-white">
                                    <h3 className="text-lg font-display font-bold text-charcoal mb-4 flex items-center gap-2 uppercase tracking-wider">
                                        <LuSparkles className="w-5 h-5 text-charcoal" />
                                        AI Analysis
                                    </h3>

                                    {analysis.tacticsDetected?.length > 0 && (
                                        <div className="mb-4">
                                            <div className="text-sm font-bold text-charcoal uppercase tracking-wider mb-2">✓ Good Tactics</div>
                                            <div className="space-y-1">
                                                {analysis.tacticsDetected.map((tactic, idx) => (
                                                    <div key={idx} className="text-sm text-charcoal/80 font-medium flex items-start gap-2">
                                                        <LuCheck className="w-4 h-4 text-charcoal mt-0.5 flex-shrink-0" />
                                                        {tactic}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {analysis.suggestions?.length > 0 && (
                                        <div>
                                            <div className="text-sm font-bold text-charcoal uppercase tracking-wider mb-2">💡 Suggestions</div>
                                            <div className="space-y-1">
                                                {analysis.suggestions.map((suggestion, idx) => (
                                                    <div key={idx} className="text-sm text-charcoal/80 font-medium flex items-start gap-2">
                                                        <LuInfo className="w-4 h-4 text-charcoal mt-0.5 flex-shrink-0" />
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
                                <div className="card-editorial h-[calc(100vh-12rem)] bg-white">
                                    <EmailNegotiationView
                                        negotiation={negotiation}
                                        conversationHistory={negotiation.conversationHistory || []}
                                        onSendEmail={handleSendMessage}
                                    />
                                </div>
                            ) : (
                                <div className="card-editorial h-[calc(100vh-12rem)] flex flex-col bg-white">
                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                        {negotiation.conversationHistory?.map((msg, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[80%] ${msg.sender === 'user'
                                                    ? 'bg-charcoal text-white'
                                                    : 'bg-cream text-charcoal'
                                                    } rounded-md p-4 border-2 border-charcoal`}>
                                                    <div className="text-sm font-bold uppercase tracking-wider mb-2">
                                                        {msg.sender === 'user' ? 'You' : 'Recruiter'}
                                                    </div>
                                                    <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                                        {msg.message}
                                                    </div>
                                                    {msg.offer && (
                                                        <div className="mt-3 pt-3 border-t-2 border-current/20 text-sm space-y-1 font-bold">
                                                            <div>Base: {formatCurrency(msg.offer.baseSalary)}</div>
                                                            {msg.offer.equity > 0 && <div>Equity: {formatCurrency(msg.offer.equity)}</div>}
                                                            {msg.offer.signingBonus > 0 && <div>Signing: {formatCurrency(msg.offer.signingBonus)}</div>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Recruiter Typing/Reviewing Indicator */}
                                        {sending && (
                                            <div className="flex justify-start animate-pulse">
                                                <div className="max-w-[80%] bg-cream text-charcoal rounded-md p-4 border-2 border-charcoal shadow-[4px_4px_0px_0px_#1A1A1A]">
                                                    <div className="text-sm font-bold uppercase tracking-wider mb-2">Recruiter</div>
                                                    <div className="text-sm font-medium italic flex items-center gap-2">
                                                        <LuLoader className="w-4 h-4 animate-spin" />
                                                        Reviewing your request with the team...
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input Area */}
                                    <div className="border-t-2 border-charcoal/10 p-6">
                                        {showCounterOffer && (
                                            <div className="mb-4 p-4 bg-cream border-2 border-charcoal/10 rounded-md">
                                                <div className="text-sm font-bold text-charcoal uppercase tracking-wider mb-3">Counter Offer (in Lakhs)</div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1 block">Base (LPA)</label>
                                                        <input
                                                            type="number"
                                                            placeholder="e.g. 12"
                                                            value={counterOffer.baseSalary}
                                                            onChange={(e) => setCounterOffer({ ...counterOffer, baseSalary: e.target.value })}
                                                            className="w-full px-3 py-2 border-2 border-charcoal rounded-md bg-white text-charcoal font-bold text-sm focus:outline-none placeholder-charcoal/50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1 block">Equity (LPA)</label>
                                                        <input
                                                            type="number"
                                                            placeholder="e.g. 2"
                                                            value={counterOffer.equity}
                                                            onChange={(e) => setCounterOffer({ ...counterOffer, equity: e.target.value })}
                                                            className="w-full px-3 py-2 border-2 border-charcoal rounded-md bg-white text-charcoal font-bold text-sm focus:outline-none placeholder-charcoal/50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1 block">Signing (LPA)</label>
                                                        <input
                                                            type="number"
                                                            placeholder="e.g. 1"
                                                            value={counterOffer.signingBonus}
                                                            onChange={(e) => setCounterOffer({ ...counterOffer, signingBonus: e.target.value })}
                                                            className="w-full px-3 py-2 border-2 border-charcoal rounded-md bg-white text-charcoal font-bold text-sm focus:outline-none placeholder-charcoal/50"
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
                                                className="flex-1 px-4 py-3 border-2 border-charcoal rounded-md bg-white text-charcoal font-bold placeholder-charcoal/50 resize-none focus:outline-none"
                                                rows="3"
                                            />
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={handleSendMessage}
                                                    disabled={sending || (!userMessage.trim() && !showCounterOffer)}
                                                    className="px-6 py-3 bg-charcoal text-white rounded-md border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all cursor-pointer font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {sending ? <LuLoader className="w-5 h-5 animate-spin mx-auto" /> : <LuSend className="w-5 h-5 mx-auto" />}
                                                </button>
                                                <button
                                                    onClick={() => setShowCounterOffer(!showCounterOffer)}
                                                    className="px-6 py-3 bg-white text-charcoal border-2 border-charcoal rounded-md font-bold uppercase tracking-wider hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all cursor-pointer text-sm"
                                                >
                                                    {showCounterOffer ? 'Cancel' : 'Counter'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-3 p-6 pt-0">
                                        <button
                                            onClick={handleAcceptOffer}
                                            className="flex-1 px-4 py-3 bg-charcoal text-white rounded-md border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-sm cursor-pointer"
                                        >
                                            <LuCheck className="w-4 h-4" />
                                            Accept Offer
                                        </button>
                                        <button
                                            onClick={handleRejectOffer}
                                            className="flex-1 px-4 py-3 bg-white text-charcoal rounded-md border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-sm cursor-pointer"
                                        >
                                            <LuX className="w-4 h-4" />
                                            Reject & Walk Away
                                        </button>
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
