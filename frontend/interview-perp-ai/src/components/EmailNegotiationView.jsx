import React from 'react';
import { LuMail, LuReply, LuClock, LuPaperclip } from 'react-icons/lu';

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
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
            {/* Email List/Thread View */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {conversationHistory.map((msg, index) => {
                    const isRecruiter = msg.sender === 'recruiter';
                    const metadata = msg.emailMetadata;

                    return (
                        <div
                            key={index}
                            className={`bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 ${
                                isRecruiter
                                    ? 'border-blue-200 dark:border-blue-800'
                                    : 'border-emerald-200 dark:border-emerald-800'
                            } overflow-hidden`}
                        >
                            {/* Email Header */}
                            <div className={`p-4 ${
                                isRecruiter
                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                    : 'bg-emerald-50 dark:bg-emerald-900/20'
                            }`}>
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${
                                            isRecruiter
                                                ? 'bg-blue-100 dark:bg-blue-800'
                                                : 'bg-emerald-100 dark:bg-emerald-800'
                                        }`}>
                                            <LuMail className={`w-5 h-5 ${
                                                isRecruiter
                                                    ? 'text-blue-600 dark:text-blue-400'
                                                    : 'text-emerald-600 dark:text-emerald-400'
                                            }`} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900 dark:text-white">
                                                {metadata?.from || (isRecruiter ? negotiation.recruiterName : 'You')}
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                                To: {metadata?.to || (isRecruiter ? 'You' : negotiation.recruiterEmail)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                        <LuClock className="w-4 h-4" />
                                        {formatDate(msg.timestamp)}
                                    </div>
                                </div>
                                <div className="font-semibold text-slate-900 dark:text-white">
                                    {metadata?.subject || 'Salary Negotiation'}
                                </div>
                            </div>

                            {/* Email Body */}
                            <div className="p-6">
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                                        {msg.message}
                                    </div>
                                </div>

                                {/* Offer Details if present */}
                                {msg.offer && (
                                    <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                                        <div className="font-semibold text-slate-900 dark:text-white mb-3">
                                            💼 Compensation Package
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <div className="text-slate-600 dark:text-slate-400">Base Salary (Fixed)</div>
                                                <div className="font-semibold text-slate-900 dark:text-white">
                                                    ₹{(msg.offer.baseSalary / 100000).toFixed(2)} LPA
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-slate-600 dark:text-slate-400">Variable/ESOPs</div>
                                                <div className="font-semibold text-slate-900 dark:text-white">
                                                    ₹{(msg.offer.equity / 100000).toFixed(2)} LPA
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-slate-600 dark:text-slate-400">Joining Bonus</div>
                                                <div className="font-semibold text-slate-900 dark:text-white">
                                                    ₹{(msg.offer.signingBonus / 100000).toFixed(2)} LPA
                                                </div>
                                            </div>
                                            <div className="col-span-2 md:col-span-3 pt-2 border-t border-slate-200 dark:border-slate-600">
                                                <div className="text-slate-600 dark:text-slate-400">Total CTC</div>
                                                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                                    ₹{((msg.offer.baseSalary + msg.offer.equity + msg.offer.signingBonus) / 100000).toFixed(2)} LPA
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Reply Button (only for recruiter emails) */}
                            {isRecruiter && index === conversationHistory.length - 1 && !showCompose && (
                                <div className="px-6 pb-4">
                                    <button
                                        onClick={() => setShowCompose(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all"
                                    >
                                        <LuReply className="w-4 h-4" />
                                        Reply
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Compose Email */}
            {showCompose && (
                <div className="border-t-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <LuMail className="w-5 h-5 text-indigo-600" />
                                Compose Reply
                            </h3>
                            <button
                                onClick={() => setShowCompose(false)}
                                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            <div>To: {negotiation.recruiterName} &lt;{negotiation.recruiterEmail}&gt;</div>
                            <div>Subject: Re: Offer for {negotiation.role} position at {negotiation.companyName}</div>
                        </div>
                    </div>

                    <textarea
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        placeholder="Write your professional email response here...&#10;&#10;Dear [Recruiter Name],&#10;&#10;Thank you for the offer...&#10;&#10;Best regards,&#10;[Your Name]"
                        className="w-full h-64 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
                    />

                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <LuPaperclip className="w-4 h-4" />
                            <span>Tip: Be professional, clear, and respectful</span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCompose(false)}
                                className="px-6 py-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendEmail}
                                disabled={!emailBody.trim()}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
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
