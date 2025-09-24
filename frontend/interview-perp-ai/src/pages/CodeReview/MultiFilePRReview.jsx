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
                <div className="flex flex-col items-center justify-center h-screen">
                    <SpinnerLoader />
                    <p className="text-slate-600 mt-4 text-center">
                        Loading pull request... 🔄
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    if (!currentPR) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Pull Request Not Found</h2>
                        <button
                            onClick={() => navigate('/code-review')}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <div className="container mx-auto px-4 md:px-6 py-6">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex items-center gap-4 mb-4">
                                <button
                                    onClick={() => navigate('/code-review')}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <LuArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                        <LuGitBranch className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold">{currentPR.prNumber}: {currentPR.title}</h1>
                                        <p className="text-white/80 text-sm">Multi-File Pull Request Review</p>
                                    </div>
                                </div>
                            </div>

                            {/* PR Info */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
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
                                <p className="text-white/90 mt-2 text-sm">{currentPR.summary}</p>
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
                                <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden sticky top-6">
                                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-slate-800">Files Changed</h3>
                                            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">
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
                                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                                                        activeFile?.path === file.path
                                                            ? 'bg-indigo-50 border border-indigo-200'
                                                            : 'hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <span className="text-lg">{getFileIcon(file.path)}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs ${status.color}`}>
                                                                {status.icon}
                                                            </span>
                                                            <span className="text-sm font-medium text-slate-800 truncate">
                                                                {file.path.split('/').pop()}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-slate-500 truncate">
                                                            {file.path}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs text-emerald-600">+{file.additions}</span>
                                                            <span className="text-xs text-red-600">-{file.deletions}</span>
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
                                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
                                        {/* File Header */}
                                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">{getFileIcon(activeFile.path)}</span>
                                                    <span className="font-semibold text-slate-800">{activeFile.path}</span>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        activeFile.status === 'new' ? 'bg-emerald-100 text-emerald-700' :
                                                        activeFile.status === 'modified' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {activeFile.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
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
                                                    className="absolute right-4 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"
                                                    style={{ top: `${comment.line * 1.5}em` }}
                                                    title={`Comment on line ${comment.line}`}
                                                />
                                            ))}
                                        </div>

                                        {/* Add Comment Form */}
                                        {selectedLine && selectedFile === activeFile.path && (
                                            <div className="p-6 border-t border-slate-200 bg-slate-50">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <LuMessageSquare className="w-5 h-5 text-indigo-600" />
                                                    <span className="font-semibold text-slate-800">
                                                        Add comment for line {selectedLine} in {activeFile.path}
                                                    </span>
                                                </div>
                                                <textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="What issues do you see in this file? Consider how it relates to other files..."
                                                    className="w-full p-4 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    rows={3}
                                                />
                                                <div className="flex gap-3 mt-4">
                                                    <button
                                                        onClick={() => addComment(selectedLine, activeFile.path)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                                    >
                                                        <LuSend className="w-4 h-4" />
                                                        Add Comment
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedLine(null);
                                                            setSelectedFile(null);
                                                        }}
                                                        className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Cross-File Issues Section */}
                                <div className="mt-6 bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <LuInfo className="w-5 h-5 text-orange-600" />
                                        <h3 className="font-semibold text-slate-800">Cross-File Analysis</h3>
                                    </div>
                                    <p className="text-slate-600 text-sm mb-4">
                                        Consider how these files work together. Look for architectural issues, data flow problems, 
                                        and inconsistencies between files.
                                    </p>
                                    
                                    <textarea
                                        placeholder="Describe any issues that span multiple files, architectural concerns, or integration problems you've identified..."
                                        className="w-full p-4 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                                            <h4 className="font-medium text-slate-800">Your Cross-File Comments:</h4>
                                            {crossFileComments.map(comment => (
                                                <div key={comment.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                                    <p className="text-slate-700">{comment.text}</p>
                                                    <span className="text-xs text-orange-600 mt-1 block">
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
                                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
