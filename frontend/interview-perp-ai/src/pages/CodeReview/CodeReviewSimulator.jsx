import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
import { getScenarioById } from '../../data/codeReviewScenarios';
import { generateAuthorResponse, getFollowUpPrompts, scoreRebuttalResponse } from '../../data/authorPersonas';
import { 
    LuCode, 
    LuMessageSquare, 
    LuSend, 
    LuStar,
    LuClock,
    LuUser,
    LuCheck,
    LuInfo,
    LuArrowLeft,
    LuFileText,
    LuTarget,
    LuBrain,
    LuRefreshCw
} from 'react-icons/lu';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeReviewSimulator = () => {
    const navigate = useNavigate();
    const { scenarioId } = useParams();
    
    // Auto scroll to top when navigating to this page or changing scenarios
    useScrollToTop(true, [scenarioId]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [currentReview, setCurrentReview] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [selectedLine, setSelectedLine] = useState(null);
    const [reviewScore, setReviewScore] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [hoveredLine, setHoveredLine] = useState(null);
    const [hintsEnabled, setHintsEnabled] = useState(false);
    const [showHints, setShowHints] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [rebuttalResponse, setRebuttalResponse] = useState('');
    const [showRebuttalPhase, setShowRebuttalPhase] = useState(false);
    const [communicationScore, setCommunicationScore] = useState(null);

    // Sample code review data (will be replaced with API call)
    const sampleCodeReview = {
        id: 'cr-001',
        title: 'User Authentication Service',
        description: 'Pull Request: Add JWT authentication with password hashing',
        author: 'AI Teammate',
        language: 'javascript',
        difficulty: 'Medium',
        estimatedTime: '15 minutes',
        codeBlocks: [
            {
                filename: 'auth.js',
                code: `const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Login function with potential issues
const loginUser = async (email, password) => {
    try {
        const user = await User.findOne({ email: email });
        
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        
        // Issue 1: No rate limiting
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
            // Issue 2: No expiration time set
            const token = jwt.sign(
                { userId: user._id, email: user.email },
                'your-secret-key'
            );
            
            // Issue 3: Sensitive data in response
            return {
                success: true,
                token: token,
                user: user // Contains password hash
            };
        } else {
            return { success: false, message: 'Invalid credentials' };
        }
    } catch (error) {
        // Issue 4: Error details exposed
        return { success: false, message: error.message };
    }
};

// Password hashing function
const hashPassword = async (password) => {
    // Issue 5: Low salt rounds
    const saltRounds = 8;
    return await bcrypt.hash(password, saltRounds);
};

module.exports = { loginUser, hashPassword };`,
                issues: [
                    { line: 9, type: 'security', severity: 'high', description: 'No rate limiting for login attempts' },
                    { line: 15, type: 'bug', severity: 'medium', description: 'JWT token should have expiration time' },
                    { line: 21, type: 'security', severity: 'high', description: 'Sensitive user data exposed in response' },
                    { line: 26, type: 'security', severity: 'medium', description: 'Error details should not be exposed' },
                    { line: 33, type: 'security', severity: 'low', description: 'Salt rounds too low, should be 12+' }
                ]
            }
        ]
    };

    useEffect(() => {
        // Load scenario from data
        if (scenarioId) {
            const scenario = getScenarioById(scenarioId);
            if (scenario) {
                setCurrentReview(scenario);
                setIsLoading(false);
            } else {
                // Redirect to scenario selector if scenario not found
                navigate('/code-review');
            }
        } else {
            // Redirect to scenario selector if no scenario specified
            navigate('/code-review');
        }
    }, [scenarioId, navigate]);

    const addComment = (lineNumber) => {
        if (!newComment.trim()) return;
        
        const comment = {
            id: Date.now(),
            line: lineNumber,
            text: newComment,
            timestamp: new Date(),
            type: 'suggestion' // suggestion, bug, security, style
        };
        
        setComments([...comments, comment]);
        setNewComment('');
        setSelectedLine(null);
    };

    const submitReview = async () => {
        if (comments.length === 0) return;
        
        setIsLoading(true);
        
        // Generate AI author responses to user comments
        setTimeout(() => {
            const newConversations = comments.map(comment => {
                // Determine issue type based on comment content and actual issues
                const relatedIssue = currentReview.codeBlocks[0].issues.find(issue => 
                    Math.abs(issue.line - comment.line) <= 2
                );
                
                const issueType = relatedIssue ? relatedIssue.type : 'bug';
                
                const authorResponse = generateAuthorResponse(
                    currentReview.author, 
                    issueType, 
                    comment.text
                );
                
                return {
                    id: `conv-${comment.id}`,
                    commentId: comment.id,
                    userComment: comment,
                    authorResponse: authorResponse,
                    issueType: issueType,
                    userRebuttal: null,
                    isResolved: false
                };
            });
            
            setConversations(newConversations);
            setShowRebuttalPhase(true);
            setIsLoading(false);
        }, 2000);
    };

    const submitRebuttal = (conversationId, rebuttalText) => {
        const conversation = conversations.find(c => c.id === conversationId);
        if (!conversation) return;

        // Score the rebuttal response
        const score = scoreRebuttalResponse(rebuttalText, {
            issueType: conversation.issueType,
            authorPersonality: conversation.authorResponse.personality,
            originalComment: conversation.userComment.text
        });

        // Update conversation with user's rebuttal
        const updatedConversations = conversations.map(conv => 
            conv.id === conversationId 
                ? { 
                    ...conv, 
                    userRebuttal: {
                        text: rebuttalText,
                        timestamp: new Date(),
                        score: score
                    },
                    isResolved: true
                }
                : conv
        );

        setConversations(updatedConversations);
        setActiveConversation(null);
        setRebuttalResponse('');

        // Check if all conversations are resolved
        const allResolved = updatedConversations.every(conv => conv.isResolved);
        if (allResolved) {
            // Calculate final scores including communication
            setTimeout(() => {
                const reviewScore = calculateReviewScore();
                const avgCommunicationScore = updatedConversations.reduce((sum, conv) => 
                    sum + conv.userRebuttal.score.overall, 0
                ) / updatedConversations.length;

                setCommunicationScore({
                    overall: Math.round(avgCommunicationScore),
                    conversations: updatedConversations.length,
                    empathy: Math.round(updatedConversations.reduce((sum, conv) => 
                        sum + conv.userRebuttal.score.empathy, 0) / updatedConversations.length),
                    technical: Math.round(updatedConversations.reduce((sum, conv) => 
                        sum + conv.userRebuttal.score.technical, 0) / updatedConversations.length),
                    leadership: Math.round(updatedConversations.reduce((sum, conv) => 
                        sum + conv.userRebuttal.score.leadership, 0) / updatedConversations.length)
                });

                setReviewScore(reviewScore);
                setIsSubmitted(true);
            }, 1000);
        }
    };

    const calculateReviewScore = () => {
        const totalIssues = currentReview.codeBlocks[0].issues.length;
        const foundIssues = comments.filter(comment => 
            currentReview.codeBlocks[0].issues.some(issue => 
                Math.abs(issue.line - comment.line) <= 2
            )
        ).length;
        
        const accuracy = (foundIssues / totalIssues) * 100;
        const depth = comments.length > 0 ? Math.min(comments.reduce((sum, c) => sum + c.text.length, 0) / comments.length / 50, 10) : 0;
        const constructiveness = comments.filter(c => c.text.includes('suggest') || c.text.includes('recommend')).length / Math.max(comments.length, 1) * 10;
        
        return {
            overall: Math.round((accuracy * 0.5 + depth * 0.3 + constructiveness * 0.2)),
            accuracy: Math.round(accuracy),
            depth: Math.round(depth),
            constructiveness: Math.round(constructiveness),
            issuesFound: foundIssues,
            totalIssues: totalIssues
        };
    };

    const getIssueIcon = (type) => {
        switch (type) {
            case 'security': return <LuTarget className="w-4 h-4 text-red-500" />;
            case 'bug': return <LuInfo className="w-4 h-4 text-orange-500" />;
            case 'performance': return <LuRefreshCw className="w-4 h-4 text-yellow-500" />;
            default: return <LuInfo className="w-4 h-4 text-blue-500" />;
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'low': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getLineHighlight = (lineNumber) => {
        if (!currentReview || !showHints) return 'transparent';
        
        const issue = currentReview.codeBlocks[0].issues.find(issue => 
            Math.abs(issue.line - lineNumber) <= 1
        );
        
        if (!issue) return 'transparent';
        
        switch (issue.severity) {
            case 'high': return 'rgba(239, 68, 68, 0.1)';
            case 'medium': return 'rgba(245, 158, 11, 0.1)';
            case 'low': return 'rgba(234, 179, 8, 0.1)';
            default: return 'transparent';
        }
    };

    const getHintForLine = (lineNumber) => {
        if (!currentReview || !hintsEnabled) return null;
        
        const issue = currentReview.codeBlocks[0].issues.find(issue => 
            Math.abs(issue.line - lineNumber) <= 1
        );
        
        if (!issue) return null;
        
        // Progressive hints based on user progress
        const userCommentOnLine = comments.find(comment => 
            Math.abs(comment.line - lineNumber) <= 1
        );
        
        if (userCommentOnLine) return null; // Don't show hints if user already commented
        
        return {
            type: issue.type,
            severity: issue.severity,
            hint: getProgressiveHint(issue, comments.length)
        };
    };

    const getProgressiveHint = (issue, userProgress) => {
        const hints = {
            validation: [
                "🤔 Look at the input handling...",
                "🔍 Are all inputs being validated?",
                "⚠️ Missing input validation could be dangerous"
            ],
            security: [
                "🔐 Security consideration needed here...",
                "🛡️ This could be a security vulnerability",
                "🚨 Sensitive data or weak security practice detected"
            ],
            performance: [
                "⚡ Performance could be improved...",
                "🐌 This might be inefficient",
                "🚀 Consider optimization opportunities"
            ],
            bug: [
                "🐛 Something looks off here...",
                "❌ This could cause unexpected behavior",
                "💥 Potential runtime error or logic bug"
            ]
        };
        
        const typeHints = hints[issue.type] || hints.bug;
        const hintLevel = Math.min(Math.floor(userProgress / 3), typeHints.length - 1);
        
        return typeHints[hintLevel];
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-screen">
                    <SpinnerLoader />
                    <p className="text-slate-600 mt-4 text-center">
                        {isSubmitted ? 'Analyzing your review...' : 'Loading code review session...'} ✨
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    // Rebuttal Phase UI
    if (showRebuttalPhase && !isSubmitted) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-cream dark:bg-navy font-body p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="card-editorial p-8 mb-6">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-charcoal dark:bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
                                    <LuMessageSquare className="w-10 h-10 text-white dark:text-navy" />
                                </div>
                                <h1 className="text-3xl font-display font-bold text-charcoal dark:text-cream mb-2">Author Responses</h1>
                                <p className="text-charcoal/80 dark:text-cream/80">The code author has responded to your feedback. How do you reply?</p>
                            </div>
                        </div>

                        {/* Conversations */}
                        <div className="space-y-6">
                            {conversations.map(conversation => (
                                <div key={conversation.id} className="card-editorial overflow-hidden">
                                    {/* Original Comment */}
                                    <div className="bg-charcoal/5 dark:bg-cream/5 p-6 border-b-2 border-charcoal/10 dark:border-cream/10">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-charcoal dark:bg-cream rounded-full flex items-center justify-center text-white dark:text-navy font-bold">
                                                You
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-bold text-charcoal dark:text-cream uppercase tracking-wider text-sm">Your Review Comment</span>
                                                    <span className="text-xs bg-charcoal/10 dark:bg-cream/10 text-charcoal dark:text-cream px-2 py-1 rounded font-bold">
                                                        Line {conversation.userComment.line}
                                                    </span>
                                                </div>
                                                <p className="text-charcoal/80 dark:text-cream/80">{conversation.userComment.text}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Author Response */}
                                    <div className="p-6 border-b-2 border-charcoal/10 dark:border-cream/10">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                                                {conversation.authorResponse.avatar}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-bold text-charcoal dark:text-cream">{conversation.authorResponse.author}</span>
                                                    <span className="text-xs bg-charcoal/10 dark:bg-cream/10 text-charcoal dark:text-cream px-2 py-1 rounded-sm font-bold uppercase tracking-wider">
                                                        {conversation.authorResponse.experience} experience
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded ${
                                                        conversation.authorResponse.style === 'defensive' ? 'bg-red-100 text-red-700' :
                                                        conversation.authorResponse.style === 'questioning' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {conversation.authorResponse.style}
                                                    </span>
                                                </div>
                                                <p className="text-charcoal/80 dark:text-cream/80 mb-4">{conversation.authorResponse.response}</p>
                                                
                                                {/* Response Area */}
                                                {!conversation.isResolved && (
                                                    <div className="mt-4">
                                                        {activeConversation === conversation.id ? (
                                                            <div className="space-y-4">
                                                                <textarea
                                                                    value={rebuttalResponse}
                                                                    onChange={(e) => setRebuttalResponse(e.target.value)}
                                                                    placeholder="How do you respond? Consider their perspective while defending your position..."
                                                                    className="w-full p-4 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream rounded-md resize-none outline-none focus:outline-none placeholder-charcoal/50 dark:placeholder-cream/50"
                                                                    rows={4}
                                                                />
                                                                <div className="flex gap-3">
                                                                    <button
                                                                        onClick={() => submitRebuttal(conversation.id, rebuttalResponse)}
                                                                        disabled={!rebuttalResponse.trim()}
                                                                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        <LuSend className="w-4 h-4" />
                                                                        Send Response
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setActiveConversation(null)}
                                                                        className="px-4 py-2 text-charcoal/70 dark:text-cream/70 hover:text-charcoal dark:hover:text-cream font-bold transition-colors"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setActiveConversation(conversation.id)}
                                                                className="flex items-center gap-2 px-4 py-2 bg-charcoal/10 dark:bg-cream/10 text-charcoal dark:text-cream font-bold uppercase tracking-wider text-sm rounded-md transition-colors hover:bg-charcoal/20 dark:hover:bg-cream/20"
                                                            >
                                                                <LuMessageSquare className="w-4 h-4" />
                                                                Respond to {conversation.authorResponse.author}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {/* User's Rebuttal */}
                                                {conversation.userRebuttal && (
                                                    <div className="mt-4 p-4 bg-charcoal/5 dark:bg-cream/5 rounded-md border-2 border-charcoal/10 dark:border-cream/10">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="font-bold text-charcoal dark:text-cream uppercase tracking-wider text-sm">Your Response</span>
                                                            <span className="text-xs bg-charcoal dark:bg-cream text-white dark:text-navy px-2 py-1 rounded-sm font-bold uppercase tracking-wider">
                                                                Communication Score: {conversation.userRebuttal.score.overall}%
                                                            </span>
                                                        </div>
                                                        <p className="text-charcoal/80 dark:text-cream/80">{conversation.userRebuttal.text}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Progress Indicator */}
                        <div className="mt-8 card-editorial p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-display font-bold text-charcoal dark:text-cream">Conversation Progress</h3>
                                    <p className="text-charcoal/80 dark:text-cream/80 text-sm font-bold">
                                        {conversations.filter(c => c.isResolved).length} of {conversations.length} conversations completed
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {conversations.map(conv => (
                                        <div
                                            key={conv.id}
                                            className={`w-3 h-3 rounded-full border-2 border-charcoal/20 dark:border-cream/20 ${
                                                conv.isResolved ? 'bg-charcoal dark:bg-cream' : 'bg-transparent'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (isSubmitted && reviewScore) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-cream dark:bg-navy font-body p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="card-editorial p-8 mb-6">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-charcoal dark:bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
                                    <LuCheck className="w-10 h-10 text-white dark:text-navy" />
                                </div>
                                <h1 className="text-3xl font-display font-bold text-charcoal dark:text-cream mb-2">Review Complete!</h1>
                                <p className="text-charcoal/80 dark:text-cream/80 font-bold">Your code review has been analyzed and scored</p>
                            </div>
                        </div>

                        {/* Score Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                            <div className="card-editorial p-6 text-center">
                                <div className="text-3xl font-display font-bold text-charcoal dark:text-cream mb-2">{reviewScore.overall}%</div>
                                <div className="text-sm font-bold text-charcoal/70 dark:text-cream/70 uppercase tracking-wider">Technical Score</div>
                            </div>
                            <div className="card-editorial p-6 text-center">
                                <div className="text-3xl font-display font-bold text-charcoal dark:text-cream mb-2">{reviewScore.accuracy}%</div>
                                <div className="text-sm font-bold text-charcoal/70 dark:text-cream/70 uppercase tracking-wider">Accuracy</div>
                            </div>
                            <div className="card-editorial p-6 text-center">
                                <div className="text-3xl font-display font-bold text-charcoal dark:text-cream mb-2">{reviewScore.depth}/10</div>
                                <div className="text-sm font-bold text-charcoal/70 dark:text-cream/70 uppercase tracking-wider">Depth</div>
                            </div>
                            <div className="card-editorial p-6 text-center">
                                <div className="text-3xl font-display font-bold text-charcoal dark:text-cream mb-2">{reviewScore.constructiveness}/10</div>
                                <div className="text-sm font-bold text-charcoal/70 dark:text-cream/70 uppercase tracking-wider">Constructiveness</div>
                            </div>
                            {communicationScore && (
                                <div className="card-editorial p-6 text-center">
                                    <div className="text-3xl font-display font-bold text-charcoal dark:text-cream mb-2">{communicationScore.overall}%</div>
                                    <div className="text-sm font-bold text-charcoal/70 dark:text-cream/70 uppercase tracking-wider">Communication</div>
                                </div>
                            )}
                        </div>

                        {/* Communication Breakdown */}
                        {communicationScore && (
                            <div className="card-editorial p-8 mb-6">
                                <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-6">Communication Skills Breakdown</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-charcoal dark:bg-cream rounded-full flex items-center justify-center mx-auto mb-3">
                                            <span className="text-white dark:text-navy font-bold text-lg">{communicationScore.empathy}%</span>
                                        </div>
                                        <h3 className="font-bold text-charcoal dark:text-cream mb-2">Empathy</h3>
                                        <p className="text-sm text-charcoal/70 dark:text-cream/70">Understanding and acknowledging others' perspectives</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-charcoal dark:bg-cream rounded-full flex items-center justify-center mx-auto mb-3">
                                            <span className="text-white dark:text-navy font-bold text-lg">{communicationScore.technical}%</span>
                                        </div>
                                        <h3 className="font-bold text-charcoal dark:text-cream mb-2">Technical Reasoning</h3>
                                        <p className="text-sm text-charcoal/70 dark:text-cream/70">Backing arguments with data and evidence</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-charcoal dark:bg-cream rounded-full flex items-center justify-center mx-auto mb-3">
                                            <span className="text-white dark:text-navy font-bold text-lg">{communicationScore.leadership}%</span>
                                        </div>
                                        <h3 className="font-bold text-charcoal dark:text-cream mb-2">Leadership</h3>
                                        <p className="text-sm text-charcoal/70 dark:text-cream/70">Providing clear direction and recommendations</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Detailed Feedback */}
                        <div className="card-editorial p-8 mb-6">
                            <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-4">Detailed Feedback</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-charcoal/5 dark:bg-cream/5 rounded-md border-2 border-charcoal/10 dark:border-cream/10">
                                    <span className="text-charcoal dark:text-cream font-bold">Issues Found</span>
                                    <span className="font-bold text-charcoal dark:text-cream">{reviewScore.issuesFound} / {reviewScore.totalIssues}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-charcoal/5 dark:bg-cream/5 rounded-md border-2 border-charcoal/10 dark:border-cream/10">
                                    <span className="text-charcoal dark:text-cream font-bold">Comments Added</span>
                                    <span className="font-bold text-charcoal dark:text-cream">{comments.length}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-charcoal/5 dark:bg-cream/5 rounded-md border-2 border-charcoal/10 dark:border-cream/10">
                                    <span className="text-charcoal dark:text-cream font-bold">Review Quality</span>
                                    <span className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider ${
                                        reviewScore.overall >= 80 ? 'bg-charcoal dark:bg-cream text-white dark:text-navy' :
                                        reviewScore.overall >= 60 ? 'bg-charcoal/20 dark:bg-cream/20 text-charcoal dark:text-cream' :
                                        'bg-red-500/20 text-red-700 dark:text-red-400'
                                    }`}>
                                        {reviewScore.overall >= 80 ? 'Excellent' :
                                         reviewScore.overall >= 60 ? 'Good' : 'Needs Improvement'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="btn-primary"
                            >
                                Back to Dashboard
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-white dark:bg-navy-light text-charcoal dark:text-cream font-bold uppercase tracking-wider text-sm rounded-md border-2 border-charcoal dark:border-cream/40 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all"
                            >
                                Try Another Review
                            </button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-cream dark:bg-navy font-body">
                {/* Header */}
                <div className="bg-charcoal dark:bg-navy-light text-cream border-b-2 border-charcoal dark:border-cream/20">
                    <div className="container mx-auto px-4 md:px-6 py-8">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex items-center gap-4 mb-6">
                                <button
                                    onClick={() => navigate('/code-review')}
                                    className="p-2 hover:bg-cream/10 rounded-md transition-colors"
                                >
                                    <LuArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-cream/10 rounded-md flex items-center justify-center">
                                        <LuCode className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-display font-bold text-cream">Code Review Simulator</h1>
                                        <p className="text-cream/80">Review code like a senior engineer</p>
                                    </div>
                                </div>
                            </div>

                            {/* Review Info */}
                            <div className="bg-cream/5 border border-cream/10 rounded-md p-6">
                                <div className="flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex flex-wrap items-center gap-6 text-sm">
                                        <div className="flex items-center gap-2">
                                            <LuFileText className="w-4 h-4" />
                                            <span>{currentReview.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <LuUser className="w-4 h-4" />
                                            <span>by {currentReview.author}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <LuClock className="w-4 h-4" />
                                            <span>{currentReview.estimatedTime}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <LuStar className="w-4 h-4" />
                                            <span>{currentReview.difficulty}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Hint Controls */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setShowHints(!showHints)}
                                            className={`px-3 py-1.5 rounded-sm text-sm font-bold uppercase tracking-wider transition-all border-2 border-transparent ${
                                                showHints 
                                                    ? 'bg-cream text-charcoal' 
                                                    : 'bg-cream/10 text-cream/80 hover:bg-cream/20'
                                            }`}
                                        >
                                            {showHints ? '🔍 Hide Hints' : '💡 Show Hints'}
                                        </button>
                                        <button
                                            onClick={() => setHintsEnabled(!hintsEnabled)}
                                            className={`px-3 py-1.5 rounded-sm text-sm font-bold uppercase tracking-wider transition-all border-2 border-transparent ${
                                                hintsEnabled 
                                                    ? 'bg-cream text-charcoal' 
                                                    : 'bg-cream/10 text-cream/80 hover:bg-cream/20'
                                            }`}
                                        >
                                            {hintsEnabled ? '🤖 AI Hints: ON' : '🤖 AI Hints: OFF'}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-white/90 mt-3">{currentReview.description}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 md:px-6 py-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Code Panel */}
                            <div className="lg:col-span-2">
                                <div className="card-editorial overflow-hidden">
                                    <div className="bg-charcoal/5 dark:bg-cream/5 px-6 py-4 border-b-2 border-charcoal/10 dark:border-cream/10">
                                        <div className="flex items-center gap-3">
                                            <LuCode className="w-5 h-5 text-charcoal dark:text-cream" />
                                            <span className="font-bold text-charcoal dark:text-cream">{currentReview.codeBlocks[0].filename}</span>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="relative">
                                            <SyntaxHighlighter
                                                language={currentReview.language}
                                                style={vscDarkPlus}
                                                showLineNumbers={true}
                                                lineNumberStyle={{ 
                                                    minWidth: '3em',
                                                    paddingRight: '1em',
                                                    textAlign: 'right',
                                                    userSelect: 'none',
                                                    cursor: 'pointer'
                                                }}
                                                wrapLines={true}
                                                lineProps={(lineNumber) => ({
                                                    style: {
                                                        display: 'block',
                                                        cursor: 'pointer',
                                                        backgroundColor: selectedLine === lineNumber 
                                                            ? 'rgba(59, 130, 246, 0.2)' 
                                                            : getLineHighlight(lineNumber),
                                                        borderLeft: getLineHighlight(lineNumber) !== 'transparent' 
                                                            ? '3px solid rgba(239, 68, 68, 0.5)' 
                                                            : 'none',
                                                        paddingLeft: getLineHighlight(lineNumber) !== 'transparent' ? '0.5rem' : '0'
                                                    },
                                                    onClick: () => setSelectedLine(lineNumber),
                                                    onMouseEnter: () => setHoveredLine(lineNumber),
                                                    onMouseLeave: () => setHoveredLine(null)
                                                })}
                                            >
                                                {currentReview.codeBlocks[0].code}
                                            </SyntaxHighlighter>
                                            
                                            {/* Hover Hints */}
                                            {hoveredLine && hintsEnabled && (
                                                (() => {
                                                    const hint = getHintForLine(hoveredLine);
                                                    return hint ? (
                                                        <div 
                                                            className="absolute right-4 bg-charcoal dark:bg-navy text-cream px-3 py-2 rounded-md border-2 border-cream/20 shadow-lg text-sm max-w-xs z-10 font-bold"
                                                            style={{ top: `${hoveredLine * 1.5}em` }}
                                                        >
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {getIssueIcon(hint.type)}
                                                                <span className="font-medium capitalize">{hint.type}</span>
                                                                <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(hint.severity)}`}>
                                                                    {hint.severity}
                                                                </span>
                                                            </div>
                                                            <p>{hint.hint}</p>
                                                        </div>
                                                    ) : null;
                                                })()
                                            )}
                                        </div>
                                        
                                        {/* Comment indicators */}
                                        {comments.map(comment => (
                                            <div
                                                key={comment.id}
                                                className="absolute right-4 w-3 h-3 bg-charcoal dark:bg-cream rounded-full border-2 border-cream shadow-sm"
                                                style={{ top: `${comment.line * 1.5}em` }}
                                                title={`Comment on line ${comment.line}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Add Comment Form */}
                                {selectedLine && (
                                    <div className="mt-6 card-editorial p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <LuMessageSquare className="w-5 h-5 text-charcoal dark:text-cream" />
                                            <span className="font-bold text-charcoal dark:text-cream">Add comment for line {selectedLine}</span>
                                        </div>
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="What issues do you see? Suggest improvements..."
                                            className="w-full p-4 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream rounded-md resize-none outline-none focus:outline-none placeholder-charcoal/50 dark:placeholder-cream/50"
                                            rows={4}
                                        />
                                        <div className="flex gap-3 mt-4">
                                            <button
                                                onClick={() => addComment(selectedLine)}
                                                className="btn-primary"
                                            >
                                                <LuSend className="w-4 h-4" />
                                                Add Comment
                                            </button>
                                            <button
                                                onClick={() => setSelectedLine(null)}
                                                className="px-4 py-2 text-charcoal/70 dark:text-cream/70 hover:text-charcoal dark:hover:text-cream font-bold transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Comments Panel */}
                            <div className="space-y-6">
                                {/* Instructions */}
                                <div className="card-editorial p-6">
                                    <h3 className="font-display font-bold text-charcoal dark:text-cream mb-3">How to Review</h3>
                                    <ul className="space-y-2 text-sm text-charcoal/80 dark:text-cream/80 font-bold">
                                        <li className="flex items-start gap-2">
                                            <LuInfo className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                            <span>Look for bugs and edge cases</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <LuTarget className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                            <span>Identify security vulnerabilities</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <LuRefreshCw className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <span>Suggest performance improvements</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <LuFileText className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                            <span>Check code style and practices</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Comments List */}
                                <div className="card-editorial p-6">
                                    <h3 className="font-display font-bold text-charcoal dark:text-cream mb-4">Your Comments ({comments.length})</h3>
                                    {comments.length === 0 ? (
                                        <p className="text-charcoal/60 dark:text-cream/60 text-center py-8 font-bold">
                                            Click on any line of code to add a comment
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {comments.map(comment => (
                                                <div key={comment.id} className="border-2 border-charcoal/10 dark:border-cream/10 rounded-md p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs bg-charcoal/10 dark:bg-cream/10 text-charcoal dark:text-cream font-bold uppercase tracking-wider px-2 py-1 rounded-sm">
                                                            Line {comment.line}
                                                        </span>
                                                        <span className="text-xs text-charcoal/60 dark:text-cream/60 font-bold">
                                                            {comment.timestamp.toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-charcoal/80 dark:text-cream/80">{comment.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    onClick={submitReview}
                                    disabled={comments.length === 0}
                                    className="w-full py-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-center justify-center"
                                >
                                    Submit Review & Start Discussion
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CodeReviewSimulator;
