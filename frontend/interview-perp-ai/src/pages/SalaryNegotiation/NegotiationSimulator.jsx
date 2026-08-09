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
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
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
            setLoading(false);
            alert('Failed to start negotiation. Please make sure the backend server is running.');
        }
    };

    const handleSendMessage = async () => {
        if (!userMessage.trim() && !showCounterOffer) return;

        setSending(true);
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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

            const [response] = await Promise.all([apiCall, minDelay]);

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
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
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

        if (salary >= market.p90) return { label: 'Top 10%', percentile: 90 };
        if (salary >= market.p75) return { label: 'Top 25%', percentile: 75 };
        if (salary >= market.p50) return { label: 'Above Median', percentile: 50 };
        if (salary >= market.p25) return { label: 'Below Median', percentile: 25 };
        return { label: 'Bottom 25%', percentile: 10 };
    };

    if (loading || !negotiation) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-screen bg-cream dark:bg-navy font-body text-charcoal dark:text-cream">
                    <div className="text-center font-mono">
                        <LuLoader className="w-12 h-12 text-charcoal dark:text-cream animate-spin mx-auto mb-4" />
                        <p className="font-bold uppercase tracking-wider text-xs">Simulating Recruiter Setup...</p>
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
            <div className="min-h-screen bg-cream dark:bg-navy py-6 px-6 font-body text-charcoal dark:text-cream transition-colors duration-300">
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
                                <h1 className="text-2xl font-display font-bold text-charcoal dark:text-cream flex items-center gap-2 uppercase tracking-wider">
                                    <LuMessageSquare className="w-6 h-6 text-charcoal/60 dark:text-cream/60" />
                                    <span>{negotiation.role} Simulator</span>
                                </h1>
                                <p className="text-[10px] font-mono font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-widest mt-1">
                                    {negotiation.scenario} • {negotiation.location} • {negotiation.recruiterPersonality} recruiter
                                </p>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end md:items-start font-mono">
                            <div className="text-[9px] font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest">Active Round</div>
                            <div className="text-2xl font-display font-bold text-charcoal dark:text-cream leading-tight mt-0.5">
                                {Math.floor((negotiation.conversationHistory?.length || 0) / 2)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        {/* Left Sidebar - Current Offer Metrics */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Current Offer Card */}
                            <div className="card-editorial p-6 bg-white dark:bg-navy-light">
                                <h3 className="text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest mb-4 border-b border-dashed border-charcoal/10 pb-2 flex items-center gap-1.5">
                                    <LuDollarSign className="w-4 h-4 text-charcoal/60" />
                                    <span>CTC Offer</span>
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[9px] font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-wider mb-0.5">Base Salary</div>
                                        <div className="text-xl font-display font-bold text-charcoal dark:text-cream">
                                            {formatCurrency(currentOffer?.baseSalary || 0)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-[9px] font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-wider mb-0.5">Equity options</div>
                                            <div className="text-sm font-bold text-charcoal dark:text-cream">
                                                {formatCurrency(currentOffer?.equity || 0)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-wider mb-0.5">Signing Bonus</div>
                                            <div className="text-sm font-bold text-charcoal dark:text-cream">
                                                {formatCurrency(currentOffer?.signingBonus || 0)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t-2 border-dashed border-charcoal/10 dark:border-cream/10">
                                        <div className="text-[9px] font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-wider mb-0.5">Total CTC Package</div>
                                        <div className="text-2xl font-display font-bold text-charcoal dark:text-cream">
                                            {formatCurrency(totalComp)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Market Data indices */}
                            <div className="card-editorial p-6 bg-white dark:bg-navy-light">
                                <h3 className="text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest mb-4 border-b border-dashed border-charcoal/10 pb-2 flex items-center gap-1.5">
                                    <LuActivity className="w-4 h-4 text-charcoal/60" />
                                    <span>Market Benchmarks</span>
                                </h3>

                                {marketPosition && (
                                    <div className="mb-4 p-3 bg-cream dark:bg-navy border-2 border-charcoal/15 dark:border-cream/15 rounded-sm shadow-[1px_1px_0px_0px_var(--color-shadow)]">
                                        <div className="text-[10px] font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wide">
                                            CTC percentile: {marketPosition.label}
                                        </div>
                                        <div className="text-[9px] font-mono text-charcoal/60 dark:text-cream/60 uppercase tracking-widest mt-0.5">
                                            {marketPosition.percentile}th percentile cost index
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2 text-[10px] font-mono font-bold uppercase tracking-wider">
                                    <div className="flex justify-between">
                                        <span className="text-charcoal/50 dark:text-cream/50">90th percentile:</span>
                                        <span className="text-charcoal dark:text-cream">{formatCurrency(negotiation.marketData?.p90)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-charcoal/50 dark:text-cream/50">75th percentile:</span>
                                        <span className="text-charcoal dark:text-cream">{formatCurrency(negotiation.marketData?.p75)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-charcoal/50 dark:text-cream/50">Median (50th):</span>
                                        <span className="text-charcoal dark:text-cream">{formatCurrency(negotiation.marketData?.p50)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-charcoal/50 dark:text-cream/50">25th percentile:</span>
                                        <span className="text-charcoal dark:text-cream">{formatCurrency(negotiation.marketData?.p25)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Analysis card */}
                            {analysis && (
                                <div className="card-editorial p-6 bg-white dark:bg-navy-light">
                                    <h3 className="text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest mb-4 border-b border-dashed border-charcoal/10 pb-2 flex items-center gap-1.5">
                                        <LuSparkles className="w-4 h-4 text-charcoal/60" />
                                        <span>AI Recruiter Analysis</span>
                                    </h3>

                                    {analysis.tacticsDetected?.length > 0 && (
                                        <div className="mb-4">
                                            <div className="text-[10px] font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wide mb-2">✓ Valid Tactics detected</div>
                                            <div className="space-y-1.5">
                                                {analysis.tacticsDetected.map((tactic, idx) => (
                                                    <div key={idx} className="text-[10px] font-mono font-bold text-charcoal/70 dark:text-cream/70 uppercase tracking-wider flex items-start gap-1.5">
                                                        <LuCheck className="w-3.5 h-3.5 text-charcoal dark:text-cream flex-shrink-0" />
                                                        <span>{tactic}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {analysis.suggestions?.length > 0 && (
                                        <div>
                                            <div className="text-[10px] font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wide mb-2">💡 Next Suggestions</div>
                                            <div className="space-y-1.5">
                                                {analysis.suggestions.map((suggestion, idx) => (
                                                    <div key={idx} className="text-[10px] font-mono font-bold text-charcoal/70 dark:text-cream/70 uppercase tracking-wider flex items-start gap-1.5">
                                                        <LuInfo className="w-3.5 h-3.5 text-charcoal dark:text-cream flex-shrink-0" />
                                                        <span>{suggestion}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Main Chat/Email Dialogue simulator */}
                        <div className="lg:col-span-2 space-y-6">
                            {negotiation.communicationMode === 'email' ? (
                                <div className="card-editorial h-[calc(100vh-12rem)] bg-white dark:bg-navy-light overflow-hidden">
                                    <EmailNegotiationView
                                        negotiation={negotiation}
                                        conversationHistory={negotiation.conversationHistory || []}
                                        onSendEmail={handleSendMessage}
                                    />
                                </div>
                            ) : (
                                <div className="card-editorial h-[calc(100vh-12rem)] flex flex-col bg-white dark:bg-navy-light">
                                    {/* Conversation thread log */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {negotiation.conversationHistory?.map((msg, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[80%] rounded-sm p-4 border-2 shadow-[2px_2px_0px_0px_var(--color-shadow)] ${
                                                    msg.sender === 'user'
                                                        ? 'bg-charcoal text-white border-charcoal dark:bg-cream dark:text-navy dark:border-cream/80'
                                                        : 'bg-cream text-charcoal border-charcoal dark:bg-navy-input dark:text-cream dark:border-cream/20'
                                                }`}>
                                                    <div className="text-[9px] font-mono font-bold uppercase tracking-widest mb-1.5 opacity-70">
                                                        {msg.sender === 'user' ? 'You' : 'Recruiter'}
                                                    </div>
                                                    <div className="text-xs font-mono font-bold leading-relaxed whitespace-pre-wrap">
                                                        {msg.message}
                                                    </div>
                                                    {msg.offer && (
                                                        <div className="mt-3 pt-3 border-t border-dashed border-current/25 text-[10px] font-mono font-bold space-y-0.5 uppercase tracking-wider">
                                                            <div>Base: {formatCurrency(msg.offer.baseSalary)}</div>
                                                            {msg.offer.equity > 0 && <div>Equity: {formatCurrency(msg.offer.equity)}</div>}
                                                            {msg.offer.signingBonus > 0 && <div>Signing: {formatCurrency(msg.offer.signingBonus)}</div>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Loading Simulator */}
                                        {sending && (
                                            <div className="flex justify-start animate-pulse">
                                                <div className="max-w-[80%] bg-cream text-charcoal border-2 border-charcoal dark:bg-navy dark:text-cream dark:border-cream/40 rounded-sm p-4 shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                                    <div className="text-[9px] font-mono font-bold uppercase tracking-widest mb-1">Recruiter</div>
                                                    <div className="text-xs font-mono font-bold flex items-center gap-1.5 uppercase tracking-wider">
                                                        <LuLoader className="w-3.5 h-3.5 animate-spin" />
                                                        <span>Evaluating proposal counter...</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Action Counteroffer & message inputs */}
                                    <div className="border-t-4 border-charcoal dark:border-cream/40 p-4 bg-white dark:bg-navy-light">
                                        {showCounterOffer && (
                                            <div className="mb-4 p-4 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]">
                                                <div className="text-[10px] font-mono font-bold text-charcoal dark:text-cream uppercase tracking-widest mb-3">Submit Counter CTC (in Lakhs)</div>
                                                <div className="grid grid-cols-3 gap-3 font-mono">
                                                    <div>
                                                        <label className="text-[8px] font-bold text-charcoal dark:text-cream uppercase tracking-wider mb-1 block">Base LPA</label>
                                                        <input
                                                            type="number"
                                                            placeholder="e.g. 12"
                                                            value={counterOffer.baseSalary}
                                                            onChange={(e) => setCounterOffer({ ...counterOffer, baseSalary: e.target.value })}
                                                            className="w-full px-2.5 py-1.5 border-2 border-charcoal dark:border-cream/40 rounded-sm bg-white dark:bg-navy text-charcoal dark:text-cream font-bold text-xs outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[8px] font-bold text-charcoal dark:text-cream uppercase tracking-wider mb-1 block">Equity LPA</label>
                                                        <input
                                                            type="number"
                                                            placeholder="e.g. 2"
                                                            value={counterOffer.equity}
                                                            onChange={(e) => setCounterOffer({ ...counterOffer, equity: e.target.value })}
                                                            className="w-full px-2.5 py-1.5 border-2 border-charcoal dark:border-cream/40 rounded-sm bg-white dark:bg-navy text-charcoal dark:text-cream font-bold text-xs outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[8px] font-bold text-charcoal dark:text-cream uppercase tracking-wider mb-1 block">Signing LPA</label>
                                                        <input
                                                            type="number"
                                                            placeholder="e.g. 1"
                                                            value={counterOffer.signingBonus}
                                                            onChange={(e) => setCounterOffer({ ...counterOffer, signingBonus: e.target.value })}
                                                            className="w-full px-2.5 py-1.5 border-2 border-charcoal dark:border-cream/40 rounded-sm bg-white dark:bg-navy text-charcoal dark:text-cream font-bold text-xs outline-none"
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
                                                placeholder="Type your message proposal..."
                                                className="flex-1 px-3 py-2 border-2 border-charcoal dark:border-cream/40 rounded-sm bg-white dark:bg-navy-input text-charcoal dark:text-cream font-mono font-bold text-xs resize-none focus:outline-none focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
                                                rows="3"
                                            />
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={handleSendMessage}
                                                    disabled={sending || (!userMessage.trim() && !showCounterOffer)}
                                                    className="px-4 py-2 bg-charcoal text-white dark:bg-cream dark:text-navy rounded-sm border-2 border-charcoal dark:border-cream/40 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer font-mono font-bold uppercase tracking-wider text-[10px] disabled:opacity-40 shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]"
                                                >
                                                    {sending ? <LuLoader className="w-4 h-4 animate-spin mx-auto" /> : <LuSend className="w-4 h-4 mx-auto" />}
                                                </button>
                                                <button
                                                    onClick={() => setShowCounterOffer(!showCounterOffer)}
                                                    className="px-4 py-2 bg-white text-charcoal dark:bg-navy dark:text-cream border-2 border-charcoal dark:border-cream/40 rounded-sm font-mono font-bold uppercase tracking-wider hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-[10px] shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]"
                                                >
                                                    {showCounterOffer ? 'Cancel' : 'Counter'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Accept / Reject actions */}
                                    <div className="flex gap-3 px-4 pb-4 bg-white dark:bg-navy-light">
                                        <button
                                            onClick={handleAcceptOffer}
                                            className="flex-1 px-4 py-2.5 bg-charcoal text-white dark:bg-cream dark:text-navy rounded-sm border-2 border-charcoal dark:border-cream/40 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 font-mono font-bold uppercase tracking-wider text-[10px] cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)]"
                                        >
                                            <LuCheck className="w-3.5 h-3.5" />
                                            <span>Accept CTC Offer</span>
                                        </button>
                                        <button
                                            onClick={handleRejectOffer}
                                            className="flex-1 px-4 py-2.5 bg-white text-charcoal dark:bg-navy dark:text-cream rounded-sm border-2 border-charcoal dark:border-cream/40 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 font-mono font-bold uppercase tracking-wider text-[10px] cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)]"
                                        >
                                            <LuX className="w-3.5 h-3.5" />
                                            <span>Reject & Walk away</span>
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
