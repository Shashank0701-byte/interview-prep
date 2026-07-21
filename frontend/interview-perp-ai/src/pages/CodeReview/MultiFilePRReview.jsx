import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
import { getMultiFilePRById } from '../../data/multiFilePRScenarios';
import { generateAuthorResponse, scoreRebuttalResponse } from '../../data/authorPersonas';
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
    LuRefreshCw,
    LuFolder,
    LuFolderOpen,
    LuFile,
    LuPlus,
    LuMinus,
    LuGitBranch,
    LuEye
} from 'react-icons/lu';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MultiFilePRReview = () => {
    const navigate = useNavigate();
    const { prId } = useParams();
    
    const [isLoading, setIsLoading] = useState(true);
    const [currentPR, setCurrentPR] = useState(null);
    const [activeFile, setActiveFile] = useState(null);
    const [comments, setComments] = useState([]);
    const [crossFileComments, setCrossFileComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [selectedLine, setSelectedLine] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [reviewScore, setReviewScore] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showFileTree, setShowFileTree] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [showRebuttalPhase, setShowRebuttalPhase] = useState(false);
    const [communicationScore, setCommunicationScore] = useState(null);

    useEffect(() => {
        if (prId) {
            const pr = getMultiFilePRById(prId);
            if (pr) {
                setCurrentPR(pr);
                setActiveFile(pr.files[0]); // Set first file as active
                setIsLoading(false);
            } else {
                navigate('/code-review');
            }
        } else {
            navigate('/code-review');
        }
    }, [prId, navigate]);

    const addComment = (lineNumber, filePath) => {
        if (!newComment.trim()) return;
        
        const comment = {
            id: Date.now(),
            line: lineNumber,
            filePath: filePath,
            text: newComment,
            timestamp: new Date(),
            type: 'suggestion'
        };
        
        setComments([...comments, comment]);
        setNewComment('');
        setSelectedLine(null);
        setSelectedFile(null);
    };

    const addCrossFileComment = (commentText) => {
        if (!commentText.trim()) return;
        
        const comment = {
            id: Date.now(),
            text: commentText,
            timestamp: new Date(),
            type: 'architecture',
            affectedFiles: currentPR.files.map(f => f.path)
        };
        
        setCrossFileComments([...crossFileComments, comment]);
    };

    const submitReview = async () => {
        if (comments.length === 0 && crossFileComments.length === 0) return;
        
        setIsLoading(true);
        
        setTimeout(() => {
            // Generate conversations for both file-specific and cross-file comments
            const allComments = [...comments, ...crossFileComments];
            const newConversations = allComments.map(comment => {
                const issueType = comment.type || 'architecture';
                
                const authorResponse = generateAuthorResponse(
                    currentPR.author, 
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

    const calculateReviewScore = () => {
        // Calculate score based on issues found across all files
        const totalIssues = currentPR.files.reduce((sum, file) => sum + file.issues.length, 0) + 
                           currentPR.crossFileIssues.length;
        
        const foundFileIssues = comments.filter(comment => 
            currentPR.files.some(file => 
                file.issues.some(issue => 
                    file.path === comment.filePath && Math.abs(issue.line - comment.line) <= 2
                )
            )
        ).length;
        
        const foundCrossFileIssues = crossFileComments.filter(comment =>
            currentPR.crossFileIssues.some(issue =>
                comment.text.toLowerCase().includes(issue.type.toLowerCase()) ||
                comment.text.toLowerCase().includes('cross') ||
                comment.text.toLowerCase().includes('between files')
            )
        ).length;
        
        const foundIssues = foundFileIssues + foundCrossFileIssues;
        const accuracy = (foundIssues / totalIssues) * 100;
        
        const allComments = [...comments, ...crossFileComments];
        const depth = allComments.length > 0 ? 
            Math.min(allComments.reduce((sum, c) => sum + c.text.length, 0) / allComments.length / 50, 10) : 0;
        
        const architecturalComments = crossFileComments.length;
        const architecturalScore = Math.min((architecturalComments / currentPR.crossFileIssues.length) * 10, 10);
        
        return {
            overall: Math.round((accuracy * 0.4 + depth * 0.3 + architecturalScore * 0.3)),
            accuracy: Math.round(accuracy),
            depth: Math.round(depth),
            architectural: Math.round(architecturalScore),
            issuesFound: foundIssues,
            totalIssues: totalIssues,
            crossFileIssuesFound: foundCrossFileIssues,
            totalCrossFileIssues: currentPR.crossFileIssues.length
        };
    };

    const getFileIcon = (filePath) => {
        if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
            return '📄';
        } else if (filePath.endsWith('.json')) {
            return '📋';
        } else if (filePath.endsWith('.md')) {
            return '📝';
        }
        return '📄';
    };

    const getFileStatus = (status) => {
        switch (status) {
            case 'new': return { color: 'text-emerald-600', icon: <LuPlus className="w-4 h-4" /> };
            case 'modified': return { color: 'text-orange-600', icon: <LuRefreshCw className="w-4 h-4" /> };
            case 'deleted': return { color: 'text-red-600', icon: <LuMinus className="w-4 h-4" /> };
            default: return { color: 'text-slate-600', icon: <LuFile className="w-4 h-4" /> };
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-screen bg-cream dark:bg-navy font-body">
                    <SpinnerLoader />
                    <p className="text-charcoal/70 dark:text-cream/70 mt-4 text-center font-bold">
                        Loading pull request... 🔄
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    if (!currentPR) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-screen bg-cream dark:bg-navy font-body">
                    <div className="text-center">
                        <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-4">Pull Request Not Found</h2>
                        <button
                            onClick={() => navigate('/code-review')}
                            className="btn-primary"
                        >
                            Back to Code Review
                        </button>
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
                    <div className="container mx-auto px-4 md:px-6 py-6">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex items-center gap-4 mb-4">
                                <button
                                    onClick={() => navigate('/code-review')}
                                    className="p-2 hover:bg-cream/10 rounded-md transition-colors"
                                >
                                    <LuArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-cream/10 rounded-md flex items-center justify-center">
                                        <LuGitBranch className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-display font-bold text-cream">{currentPR.prNumber}: {currentPR.title}</h1>
                                        <p className="text-cream/80 text-sm">Multi-File Pull Request Review</p>
                                    </div>
                                </div>
                            </div>

                            {/* PR Info */}
                            <div className="bg-cream/5 border border-cream/10 rounded-md p-4">
                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <LuUser className="w-4 h-4" />
                                        <span>by {currentPR.author}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <LuClock className="w-4 h-4" />
                                        <span>{currentPR.estimatedTime}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <LuStar className="w-4 h-4" />
                                        <span>{currentPR.difficulty}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <LuFileText className="w-4 h-4" />
                                        <span>{currentPR.files.length} files changed</span>
                                    </div>
                                </div>
                                <p className="text-cream/90 mt-2 text-sm">{currentPR.summary}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 md:px-6 py-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* File Tree Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="card-editorial overflow-hidden sticky top-6">
                                    <div className="bg-charcoal/5 dark:bg-cream/5 px-4 py-3 border-b-3 border-charcoal/15 dark:border-cream/15">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wider text-xs">Files Changed</h3>
                                            <span className="text-xs bg-charcoal/10 dark:bg-cream/10 text-charcoal dark:text-cream px-2 py-1 rounded-sm font-mono font-bold">
                                                {currentPR.files.length}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {currentPR.files.map(file => {
                                            const status = getFileStatus(file.status);
                                            return (
                                                <button
                                                    key={file.path}
                                                    onClick={() => setActiveFile(file)}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-sm text-left transition-all ${
                                                        activeFile?.path === file.path
                                                            ? 'bg-charcoal/10 dark:bg-cream/10 border-3 border-charcoal/30 dark:border-cream/30 shadow-[1px_1px_0px_0px_var(--color-shadow)]'
                                                            : 'hover:bg-charcoal/5 dark:hover:bg-cream/5 border-3 border-transparent'
                                                    }`}
                                                >
                                                    <span className="text-lg">{getFileIcon(file.path)}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs ${status.color}`}>
                                                                {status.icon}
                                                            </span>
                                                            <span className="text-xs font-mono font-bold text-charcoal dark:text-cream truncate uppercase tracking-wider">
                                                                {file.path.split('/').pop()}
                                                            </span>
                                                        </div>
                                                        <div className="text-[10px] font-mono text-charcoal/70 dark:text-cream/70 truncate">
                                                            {file.path}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs font-mono font-bold text-emerald-600">+{file.additions}</span>
                                                            <span className="text-xs font-mono font-bold text-red-600">-{file.deletions}</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Code View */}
                            <div className="lg:col-span-3">
                                {activeFile && (
                                    <div className="card-editorial overflow-hidden">
                                        {/* File Header */}
                                        <div className="bg-charcoal/5 dark:bg-cream/5 px-6 py-4 border-b-3 border-charcoal/15 dark:border-cream/15">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">{getFileIcon(activeFile.path)}</span>
                                                    <span className="font-mono font-bold text-charcoal dark:text-cream text-sm">{activeFile.path}</span>
                                                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider border-2 ${
                                                        activeFile.status === 'new' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                                                        activeFile.status === 'modified' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                                                        'bg-red-100 text-red-700 border-red-300'
                                                    }`}>
                                                        {activeFile.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-mono font-bold">
                                                    <span className="text-emerald-600">+{activeFile.additions}</span>
                                                    <span className="text-red-600">-{activeFile.deletions}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Code Content */}
                                        <div className="relative">
                                            <SyntaxHighlighter
                                                language="javascript"
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
                                                        backgroundColor: selectedLine === lineNumber && selectedFile === activeFile.path
                                                            ? 'rgba(59, 130, 246, 0.2)' 
                                                            : 'transparent'
                                                    },
                                                    onClick: () => {
                                                        setSelectedLine(lineNumber);
                                                        setSelectedFile(activeFile.path);
                                                    }
                                                })}
                                            >
                                                {activeFile.content}
                                            </SyntaxHighlighter>
                                            
                                            {/* Comment indicators */}
                                            {comments
                                                .filter(comment => comment.filePath === activeFile.path)
                                                .map(comment => (
                                                <div
                                                    key={comment.id}
                                                    className="absolute right-4 w-3 h-3 bg-charcoal dark:bg-cream rounded-full border-2 border-cream shadow-sm"
                                                    style={{ top: `${comment.line * 1.5}em` }}
                                                    title={`Comment on line ${comment.line}`}
                                                />
                                            ))}
                                        </div>

                                        {/* Add Comment Form */}
                                        {selectedLine && selectedFile === activeFile.path && (
                                            <div className="p-6 border-t-3 border-charcoal/15 dark:border-cream/15 bg-charcoal/5 dark:bg-cream/5">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <LuMessageSquare className="w-5 h-5 text-charcoal dark:text-cream" />
                                                    <span className="font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wider text-xs">
                                                        Add comment for line {selectedLine} in {activeFile.path}
                                                    </span>
                                                </div>
                                                <textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="What issues do you see in this file? Consider how it relates to other files..."
                                                    className="w-full p-4 border-3 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream rounded-sm resize-none outline-none focus:outline-none placeholder-charcoal/50 dark:placeholder-cream/50 text-xs font-mono font-bold uppercase tracking-wider"
                                                    rows={3}
                                                />
                                                <div className="flex gap-3 mt-4">
                                                    <button
                                                        onClick={() => addComment(selectedLine, activeFile.path)}
                                                        className="btn-primary text-xs font-mono font-bold uppercase tracking-wider"
                                                    >
                                                        <LuSend className="w-4 h-4" />
                                                        Add Comment
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedLine(null);
                                                            setSelectedFile(null);
                                                        }}
                                                        className="px-4 py-2 text-charcoal/70 dark:text-cream/70 hover:text-charcoal dark:hover:text-cream font-mono font-bold text-xs uppercase tracking-wider transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Cross-File Issues Section */}
                                <div className="mt-6 card-editorial p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <LuInfo className="w-5 h-5 text-orange-600" />
                                        <h3 className="font-display font-bold text-charcoal dark:text-cream">Cross-File Analysis</h3>
                                    </div>
                                    <p className="text-charcoal/80 dark:text-cream/80 text-xs font-mono font-bold uppercase tracking-wide mb-4">
                                        Consider how these files work together. Look for architectural issues, data flow problems, 
                                        and inconsistencies between files.
                                    </p>
                                    
                                    <textarea
                                        placeholder="Describe any issues that span multiple files, architectural concerns, or integration problems you've identified..."
                                        className="w-full p-4 border-3 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream rounded-sm resize-none outline-none focus:outline-none placeholder-charcoal/50 dark:placeholder-cream/50 text-xs font-mono font-bold uppercase tracking-wider"
                                        rows={4}
                                        onBlur={(e) => {
                                            if (e.target.value.trim()) {
                                                addCrossFileComment(e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                    
                                    {/* Cross-file comments display */}
                                    {crossFileComments.length > 0 && (
                                        <div className="mt-4 space-y-3">
                                            <h4 className="font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wide text-xs">Your Cross-File Comments:</h4>
                                            {crossFileComments.map(comment => (
                                                <div key={comment.id} className="p-3 bg-white dark:bg-navy-light border-3 border-charcoal dark:border-cream/40 rounded-sm shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                                    <p className="text-charcoal/90 dark:text-cream/90 font-medium text-sm">{comment.text}</p>
                                                    <span className="text-[10px] font-mono text-orange-600 mt-1.5 block font-bold uppercase tracking-wider">
                                                        Architectural Comment • {comment.timestamp.toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="mt-6">
                                    <button
                                        onClick={submitReview}
                                        disabled={comments.length === 0 && crossFileComments.length === 0}
                                        className="w-full py-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-center justify-center font-mono text-sm"
                                    >
                                        Submit Multi-File Review & Start Discussion
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MultiFilePRReview;
