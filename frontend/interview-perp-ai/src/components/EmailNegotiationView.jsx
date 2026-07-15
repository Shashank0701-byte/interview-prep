import React from 'react';
import { LuMail, LuReply, LuClock } from 'react-icons/lu';

const EmailNegotiationView = ({ negotiation, conversationHistory, onSendEmail }) => {
    const [emailBody, setEmailBody] = React.useState('');
    const [showCompose, setShowCompose] = React.useState(false);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSendEmail = () => {
        if (!emailBody.trim()) return;
        onSendEmail(emailBody);
        setEmailBody('');
        setShowCompose(false);
    };

    return (
        <div className="h-full flex flex-col bg-cream dark:bg-navy">
            {/* Email thread log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {conversationHistory.map((msg, index) => {
                    const isRecruiter = msg.sender === 'recruiter';
                    const metadata = msg.emailMetadata;

                    return (
                        <div
                            key={index}
                            className={`bg-white dark:bg-navy-light border-3 border-charcoal dark:border-cream/40 rounded-sm shadow-[3px_3px_0px_0px_var(--color-shadow)] overflow-hidden`}
                        >
                            {/* Email Header info */}
                            <div className={`p-4 border-b-2 border-charcoal dark:border-cream/20 ${
                                isRecruiter
                                    ? 'bg-cream/50 dark:bg-navy'
                                    : 'bg-cream/10 dark:bg-navy-input'
                             }`}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream rounded-sm flex items-center justify-center shadow-[1px_1px_0px_0px_var(--color-shadow)]">
                                            <LuMail className="w-5 h-5 text-charcoal/60 dark:text-cream/60" />
                                        </div>
                                        <div>
                                            <div className="font-mono font-bold text-xs text-charcoal dark:text-cream">
                                                From: {metadata?.from || (isRecruiter ? negotiation.recruiterName : 'You')}
                                            </div>
                                            <div className="text-[10px] font-mono font-bold text-charcoal/60 dark:text-cream/60">
                                                To: {metadata?.to || (isRecruiter ? 'You' : negotiation.recruiterEmail)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-charcoal/50 dark:text-cream/50">
                                        <LuClock className="w-3.5 h-3.5" />
                                        <span>{formatDate(msg.timestamp)}</span>
                                    </div>
                                </div>
                                <div className="font-mono font-bold text-xs text-charcoal dark:text-cream uppercase tracking-wide mt-2">
                                    Subject: {metadata?.subject || 'Salary Proposal Update'}
                                </div>
                            </div>

                            {/* Email Content Body */}
                            <div className="p-6">
                                <div className="whitespace-pre-wrap font-mono text-xs font-bold text-charcoal dark:text-cream leading-relaxed">
                                    {msg.message}
                                </div>

                                {/* Offer details inside email */}
                                {msg.offer && (
                                    <div className="mt-6 p-4 bg-cream dark:bg-navy border-2 border-charcoal/20 dark:border-cream/15 rounded-sm shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]">
                                        <div className="font-mono font-bold text-xs text-charcoal dark:text-cream uppercase tracking-wide mb-3">
                                            💼 CTC Proposal Breakdown
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono font-bold">
                                            <div>
                                                <div className="text-charcoal/50 dark:text-cream/50 text-[9px] uppercase">Base LPA (Fixed)</div>
                                                <div className="text-charcoal dark:text-cream mt-0.5">
                                                    ₹{(msg.offer.baseSalary / 100000).toFixed(2)} LPA
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-charcoal/50 dark:text-cream/50 text-[9px] uppercase">Variable/ESOP LPA</div>
                                                <div className="text-charcoal dark:text-cream mt-0.5">
                                                    ₹{(msg.offer.equity / 100000).toFixed(2)} LPA
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-charcoal/50 dark:text-cream/50 text-[9px] uppercase">Joining Incentives</div>
                                                <div className="text-charcoal dark:text-cream mt-0.5">
                                                    ₹{(msg.offer.signingBonus / 100000).toFixed(2)} LPA
                                                </div>
                                            </div>
                                            <div className="col-span-1 sm:col-span-3 pt-3 border-t border-dashed border-charcoal/10 dark:border-cream/10 flex justify-between items-center">
                                                <div className="text-charcoal/50 dark:text-cream/50 text-[9px] uppercase">Total CTC Package</div>
                                                <div className="text-sm font-display font-bold text-charcoal dark:text-cream">
                                                    ₹{((msg.offer.baseSalary + msg.offer.equity + msg.offer.signingBonus) / 100000).toFixed(2)} LPA
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Reply Action */}
                            {isRecruiter && index === conversationHistory.length - 1 && !showCompose && (
                                <div className="px-6 pb-4">
                                    <button
                                        onClick={() => setShowCompose(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white dark:bg-cream dark:text-navy border-2 border-charcoal dark:border-cream/40 rounded-sm font-mono font-bold uppercase tracking-wider text-[10px] hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]"
                                    >
                                        <LuReply className="w-3.5 h-3.5" />
                                        <span>Compose Reply</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Compose reply editor panel */}
            {showCompose && (
                <div className="border-t-4 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light p-6">
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-mono font-bold text-xs text-charcoal dark:text-cream uppercase tracking-wider flex items-center gap-2">
                                <LuMail className="w-4.5 h-4.5" />
                                <span>Compose Reply Email</span>
                            </h3>
                            <button
                                onClick={() => setShowCompose(false)}
                                className="text-charcoal/50 hover:text-charcoal dark:text-cream/50 dark:hover:text-cream font-bold cursor-pointer text-xs"
                            >
                                Cancel
                            </button>
                        </div>
                        <div className="text-[10px] font-mono font-bold text-charcoal/60 dark:text-cream/60 space-y-0.5 uppercase tracking-wide">
                            <div>To: {negotiation.recruiterName} &lt;{negotiation.recruiterEmail}&gt;</div>
                            <div>Subject: Re: Offer for {negotiation.role} position at {negotiation.companyName}</div>
                        </div>
                    </div>

                    <textarea
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        placeholder="Write your professional email response here..."
                        className="w-full h-48 px-3.5 py-3 border-2 border-charcoal dark:border-cream/40 rounded-sm bg-cream dark:bg-navy text-charcoal dark:text-cream font-bold text-xs leading-normal resize-none focus:outline-none focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
                    />

                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-[9px] font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest">
                            💡 Tip: Maintain a collaborative yet firm tone
                        </div>
                        <div className="flex gap-2.5">
                            <button
                                onClick={() => setShowCompose(false)}
                                className="px-4 py-2 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy text-charcoal dark:text-cream rounded-sm font-mono font-bold uppercase tracking-wider text-[10px] hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleSendEmail}
                                disabled={!emailBody.trim()}
                                className="px-4 py-2 border-2 border-charcoal dark:border-cream bg-charcoal text-white dark:bg-cream dark:text-navy rounded-sm font-mono font-bold uppercase tracking-widest text-[10px] hover:-translate-y-0.5 hover:shadow-[2.5px_2.5px_0px_0px_var(--color-shadow)] disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)]"
                            >
                                Send Email
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailNegotiationView;
