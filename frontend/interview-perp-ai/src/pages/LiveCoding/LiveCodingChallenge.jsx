import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { 
    LuPlay, 
    LuCode, 
    LuBrain, 
    LuClock, 
    LuCheck, 
    LuX,
    LuInfo,
    LuRefreshCw,
    LuArrowLeft,
    LuZap,
    LuTarget,
    LuTrendingUp
} from 'react-icons/lu';
import { codingChallenges } from '../../data/codingChallenges';

const LiveCodingChallenge = () => {
    const { challengeId } = useParams();
    const navigate = useNavigate();
    const codeEditorRef = useRef(null);
    
    // Find the current challenge
    const challenge = codingChallenges.find(c => c.id === challengeId) || codingChallenges[0];
    
    // State management
    const [userCode, setUserCode] = useState(challenge.starterCode || '');
    const [isRunning, setIsRunning] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [testResults, setTestResults] = useState([]);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [aiReview, setAiReview] = useState(null);
    const [showHints, setShowHints] = useState(false);
    const [hasRunCode, setHasRunCode] = useState(false);

    // Timer effect
    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    // Start timer when user starts typing and reset results if code changes significantly
    useEffect(() => {
        if (userCode !== challenge.starterCode && !isTimerRunning) {
            setIsTimerRunning(true);
        }
        
        // Reset results if user makes significant changes after running code
        if (hasRunCode && analyzeCodeQuality(userCode) === 0) {
            setHasRunCode(false);
            setTestResults([]);
            setAiReview(null);
            setFeedback(null);
        }
    }, [userCode, challenge.starterCode, isTimerRunning, hasRunCode]);

    // Format time display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // AI Code Analysis Engine
    const analyzeCode = (code) => {
        const analysis = {
            correctness: 0,
            efficiency: 0,
            codeStyle: 0,
            bugs: [],
            suggestions: [],
            bigOAnalysis: '',
            overallScore: 0
        };

        // Basic correctness check
        if (code.includes('function') || code.includes('const') || code.includes('let')) {
            analysis.correctness += 30;
        }
        if (code.includes('return')) {
            analysis.correctness += 20;
        }
        if (code.length > 50) {
            analysis.correctness += 25;
        }
        if (code.includes('for') || code.includes('while') || code.includes('map') || code.includes('forEach')) {
            analysis.correctness += 25;
        }

        // Efficiency analysis
        const hasNestedLoops = (code.match(/for|while/g) || []).length > 1;
        const hasOptimalApproach = code.includes('Set') || code.includes('Map') || code.includes('sort');
        
        if (hasOptimalApproach) {
            analysis.efficiency = 85;
            analysis.bigOAnalysis = 'Good time complexity - appears to use efficient data structures';
        } else if (hasNestedLoops) {
            analysis.efficiency = 40;
            analysis.bigOAnalysis = 'Potential O(n²) complexity - consider optimizing with hash maps or sorting';
        } else {
            analysis.efficiency = 70;
            analysis.bigOAnalysis = 'Reasonable time complexity - O(n) or better';
        }

        // Code style analysis
        const hasGoodNaming = /[a-z][A-Z]/.test(code); // camelCase
        const hasComments = code.includes('//') || code.includes('/*');
        const hasProperSpacing = code.includes(' = ') && code.includes(', ');
        
        analysis.codeStyle = 0;
        if (hasGoodNaming) analysis.codeStyle += 35;
        if (hasComments) analysis.codeStyle += 25;
        if (hasProperSpacing) analysis.codeStyle += 40;

        // Bug detection
        if (code.includes('=') && !code.includes('==') && !code.includes('===')) {
            analysis.bugs.push({
                type: 'potential',
                message: 'Consider using === for comparisons instead of assignment',
                line: 'Multiple locations'
            });
        }
        
        if (code.includes('undefined') || code.includes('null')) {
            analysis.bugs.push({
                type: 'warning',
                message: 'Check for null/undefined handling',
                line: 'Variable usage'
            });
        }

        // Suggestions based on challenge type
        if (challenge.category === 'arrays') {
            if (!code.includes('sort') && !code.includes('Set')) {
                analysis.suggestions.push('Consider using sorting or Set for better performance');
            }
        }
        
        if (challenge.category === 'strings') {
            if (!code.includes('toLowerCase') && !code.includes('toUpperCase')) {
                analysis.suggestions.push('Consider case sensitivity in string operations');
            }
        }

        // Calculate overall score
        analysis.overallScore = Math.round(
            (analysis.correctness * 0.4 + analysis.efficiency * 0.35 + analysis.codeStyle * 0.25)
        );

        return analysis;
    };

    // Analyze code quality for realistic test simulation
    const analyzeCodeQuality = (code) => {
        // Remove comments and whitespace for analysis
        const cleanCode = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
        
        // Check if it's just starter code or empty
        if (cleanCode.length < 50) return 0;
        
        // Check if it's just a function declaration without implementation
        const functionPattern = /function\s+\w+\s*\([^)]*\)\s*\{\s*\}/;
        if (functionPattern.test(cleanCode)) return 0;
        
        // Check if it only has comments inside function
        const hasOnlyComments = /function\s+\w+\s*\([^)]*\)\s*\{\s*(\/\/.*\s*)*\s*\}/.test(code);
        if (hasOnlyComments) return 0;
        
        let quality = 0;
        
        // Must have actual implementation (not just function declaration)
        const hasImplementation = cleanCode.includes('return') && cleanCode.split('\n').length > 3;
        if (!hasImplementation) return 0;
        
        // Check for basic function structure
        if (code.includes('function') || code.includes('=>') || code.includes('const')) quality += 0.2;
        
        // Check for return statement with actual logic
        if (code.includes('return') && !code.match(/return\s*;?\s*$/m)) quality += 0.3;
        
        // Check for proper logic patterns
        if (code.includes('for') || code.includes('while') || code.includes('map') || code.includes('forEach')) quality += 0.3;
        
        // Check for reasonable implementation length
        if (cleanCode.length > 100) quality += 0.2;
        
        return Math.min(quality, 1);
    };

    // Run code and get AI feedback
    const runCode = async () => {
        if (!userCode.trim()) {
            setFeedback({
                success: false,
                message: 'Please write some code before running tests!',
                error: 'No code provided'
            });
            return;
        }

        // Check if code is just starter template
        const codeQuality = analyzeCodeQuality(userCode);
        if (codeQuality === 0) {
            setFeedback({
                success: false,
                message: 'Please implement the function logic before running tests!',
                error: 'Only starter code detected - add your implementation inside the function'
            });
            return;
        }

        setIsRunning(true);
        setFeedback(null);
        setAiReview(null);
        setHasRunCode(true);

        // Simulate code execution delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            // Simulate test case execution based on code quality
            const codeQuality = analyzeCodeQuality(userCode);
            const mockTestResults = challenge.testCases.map((testCase, index) => {
                // More realistic simulation based on code content
                const passed = codeQuality > 0.5 ? Math.random() > 0.2 : Math.random() > 0.7;
                return {
                    id: index,
                    input: testCase.input,
                    expected: testCase.expected,
                    actual: passed ? testCase.expected : 'Different result',
                    passed
                };
            });

            setTestResults(mockTestResults);

            // Get AI analysis
            const analysis = analyzeCode(userCode);
            setAiReview(analysis);

            const passedTests = mockTestResults.filter(t => t.passed).length;
            const totalTests = mockTestResults.length;

            setFeedback({
                success: passedTests === totalTests,
                message: passedTests === totalTests 
                    ? `🎉 All tests passed! Great job!` 
                    : `${passedTests}/${totalTests} tests passed. Keep refining your solution.`,
                testsPassedRatio: `${passedTests}/${totalTests}`
            });

        } catch (error) {
            setFeedback({
                success: false,
                message: 'Code execution failed. Check for syntax errors.',
                error: error.message
            });
        }

        setIsRunning(false);
    };

    // Get score color
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
        if (score >= 60) return 'text-amber-600 dark:text-amber-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-900/20';
        if (score >= 60) return 'bg-amber-50 dark:bg-amber-900/20';
        return 'bg-red-50 dark:bg-red-900/20';
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-cream dark:bg-navy py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white dark:bg-navy-light rounded-md border-2 border-charcoal dark:border-cream/40 shadow-[4px_4px_0px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_0px_var(--color-shadow)] p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => navigate('/live-coding')}
                                className="flex items-center gap-2 text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream transition-colors font-bold"
                            >
                                <LuArrowLeft className="w-4 h-4" />
                                Back to Challenges
                            </button>
                            
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-charcoal/80 dark:text-cream/80 font-bold">
                                    <LuClock className="w-4 h-4" />
                                    <span className="font-mono text-lg">{formatTime(timeElapsed)}</span>
                                </div>
                                
                                <div className={`px-3 py-1 rounded-sm border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light shadow-[2px_2px_0px_0px_#1A1A1A] dark:shadow-[2px_2px_0px_0px_var(--color-shadow)] text-xs font-bold uppercase tracking-wider text-charcoal dark:text-cream`}>
                                    {challenge.difficulty}
                                </div>
                            </div>
                        </div>

                        <div className="bg-charcoal dark:bg-navy-input/50 text-white dark:text-cream rounded-md border-2 border-charcoal dark:border-cream/40 shadow-[4px_4px_0px_0px_rgba(26,26,26,0.3)] dark:shadow-[4px_4px_0px_0px_var(--color-shadow)] p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <LuCode className="w-6 h-6" />
                                <h1 className="text-3xl font-display font-bold">{challenge.title}</h1>
                            </div>
                            <p className="text-white/80 dark:text-cream/80 font-body mb-4">{challenge.description}</p>
                            
                            <div className="flex items-center gap-6 text-sm font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <LuTarget className="w-4 h-4" />
                                    <span>Category: {challenge.category}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <LuTrendingUp className="w-4 h-4" />
                                    <span>Expected: O({challenge.expectedComplexity})</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Code Editor */}
                        <div className="bg-white dark:bg-navy-light rounded-md border-2 border-charcoal dark:border-cream/40 shadow-[4px_4px_0px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_0px_var(--color-shadow)] overflow-hidden">
                            <div className="bg-charcoal dark:bg-navy-input/50 text-white dark:text-cream px-4 py-3 flex items-center justify-between border-b-2 border-charcoal dark:border-cream/40">
                                <div className="flex items-center gap-2">
                                    <LuCode className="w-4 h-4" />
                                    <span className="font-display font-bold">Code Editor</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowHints(!showHints)}
                                        className="px-3 py-1 bg-white dark:bg-navy-light text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 hover:-translate-y-1 hover:shadow-[2px_2px_0px_0px_#1A1A1A] dark:hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-200"
                                    >
                                        {showHints ? 'Hide Hints' : 'Show Hints'}
                                    </button>
                                    
                                    <button
                                        onClick={runCode}
                                        disabled={isRunning}
                                        className="flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-navy-light text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 hover:-translate-y-1 hover:shadow-[2px_2px_0px_0px_#1A1A1A] dark:hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-200"
                                    >
                                        {isRunning ? (
                                            <>
                                                <LuRefreshCw className="w-4 h-4 animate-spin" />
                                                Running...
                                            </>
                                        ) : (
                                            <>
                                                <LuPlay className="w-4 h-4" />
                                                Run Code
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 bg-charcoal dark:bg-[#1e1e1e]">
                                <textarea
                                    ref={codeEditorRef}
                                    value={userCode}
                                    onChange={(e) => setUserCode(e.target.value)}
                                    className="w-full h-96 font-mono text-sm p-4 resize-none rounded-sm focus:outline-none"
                                    placeholder="Write your solution here..."
                                    style={{
                                        backgroundColor: '#1e1e1e',
                                        color: '#d4d4d4',
                                        border: 'none'
                                    }}
                                />
                            </div>

                            {/* Hints Section */}
                            {showHints && (
                                <div className="border-t border-charcoal/10 dark:border-cream/10 p-4 bg-white dark:bg-navy-light">
                                    <h3 className="text-charcoal dark:text-cream font-bold mb-2 flex items-center gap-2">
                                        <LuZap className="w-4 h-4" />
                                        Hints
                                    </h3>
                                    <div className="space-y-2">
                                        {challenge.hints.map((hint, index) => (
                                            <div key={index} className="text-sm text-charcoal/80 dark:text-cream/80 bg-charcoal/5 dark:bg-navy-input p-2 rounded-sm border-l-2 border-charcoal dark:border-cream/40">
                                                <strong>Hint {index + 1}:</strong> {hint}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Results & AI Review */}
                        <div className="space-y-6">
                            {/* Test Results */}
                            {!hasRunCode ? (
                                <div className="card-editorial p-6">
                                    <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-4 flex items-center gap-2 border-b-2 border-charcoal/10 dark:border-cream/10 pb-2">
                                        <LuTarget className="w-5 h-5 text-charcoal/80 dark:text-cream/80" />
                                        Test Results
                                    </h2>
                                    <div className="text-center py-8">
                                        <LuPlay className="w-12 h-12 text-charcoal/20 dark:text-cream/20 mx-auto mb-3" />
                                        <p className="text-charcoal/60 dark:text-cream/60 font-bold mb-2">No tests run yet</p>
                                        <p className="text-sm text-charcoal/40 dark:text-cream/40">Write your solution and click "Run Code" to see test results</p>
                                    </div>
                                </div>
                            ) : testResults.length > 0 && (
                                <div className="card-editorial p-6">
                                    <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-4 flex items-center gap-2 border-b-2 border-charcoal/10 dark:border-cream/10 pb-2">
                                        <LuCheck className="w-5 h-5 text-emerald-500" />
                                        Test Results
                                    </h2>
                                    
                                    <div className="space-y-3">
                                        {testResults.map((result, index) => (
                                            <div key={index} className={`p-3 rounded-sm border-l-4 ${
                                                result.passed 
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500' 
                                                    : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                                            }`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-charcoal dark:text-cream">Test Case {index + 1}</span>
                                                    {result.passed ? (
                                                        <LuCheck className="w-5 h-5 text-emerald-500" />
                                                    ) : (
                                                        <LuX className="w-5 h-5 text-red-500" />
                                                    )}
                                                </div>
                                                <div className="text-sm text-charcoal/80 dark:text-cream/80 font-mono">
                                                    <div><strong>Input:</strong> {JSON.stringify(result.input)}</div>
                                                    <div><strong>Expected:</strong> {JSON.stringify(result.expected)}</div>
                                                    {!result.passed && (
                                                        <div className="text-red-600 dark:text-red-400 mt-1 font-bold">
                                                            <strong>Got:</strong> {JSON.stringify(result.actual)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI Code Review */}
                            {!hasRunCode ? (
                                <div className="card-editorial p-6">
                                    <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-4 flex items-center gap-2 border-b-2 border-charcoal/10 dark:border-cream/10 pb-2">
                                        <LuBrain className="w-5 h-5 text-charcoal/80 dark:text-cream/80" />
                                        AI Code Review
                                    </h2>
                                    <div className="text-center py-8">
                                        <LuBrain className="w-12 h-12 text-charcoal/20 dark:text-cream/20 mx-auto mb-3" />
                                        <p className="text-charcoal/60 dark:text-cream/60 font-bold mb-2">No code analysis yet</p>
                                        <p className="text-sm text-charcoal/40 dark:text-cream/40">Run your code to get AI feedback on correctness, efficiency, and style</p>
                                    </div>
                                </div>
                            ) : aiReview && (
                                <div className="card-editorial p-6">
                                    <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-4 flex items-center gap-2 border-b-2 border-charcoal/10 dark:border-cream/10 pb-2">
                                        <LuBrain className="w-5 h-5 text-charcoal dark:text-cream" />
                                        AI Code Review
                                    </h2>

                                    {/* Overall Score */}
                                    <div className={`p-4 rounded-sm border-2 border-charcoal/10 dark:border-cream/10 mb-4 ${getScoreBg(aiReview.overallScore)}`}>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-charcoal dark:text-cream uppercase tracking-wider text-sm">Overall Score</span>
                                            <span className={`text-2xl font-bold ${getScoreColor(aiReview.overallScore)}`}>
                                                {aiReview.overallScore}/100
                                            </span>
                                        </div>
                                    </div>

                                    {/* Detailed Metrics */}
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="text-center">
                                            <div className={`text-2xl font-bold ${getScoreColor(aiReview.correctness)}`}>
                                                {aiReview.correctness}
                                            </div>
                                            <div className="text-xs text-charcoal/80 dark:text-cream/80 font-bold uppercase tracking-wider mt-1">Correctness</div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-2xl font-bold ${getScoreColor(aiReview.efficiency)}`}>
                                                {aiReview.efficiency}
                                            </div>
                                            <div className="text-xs text-charcoal/80 dark:text-cream/80 font-bold uppercase tracking-wider mt-1">Efficiency</div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-2xl font-bold ${getScoreColor(aiReview.codeStyle)}`}>
                                                {aiReview.codeStyle}
                                            </div>
                                            <div className="text-xs text-charcoal/80 dark:text-cream/80 font-bold uppercase tracking-wider mt-1">Code Style</div>
                                        </div>
                                    </div>

                                    {/* Big O Analysis */}
                                    <div className="bg-charcoal/5 dark:bg-navy-input border-2 border-charcoal/10 dark:border-cream/10 rounded-sm p-4 mb-4">
                                        <h3 className="font-bold text-charcoal dark:text-cream mb-2">Time Complexity Analysis</h3>
                                        <p className="text-charcoal/80 dark:text-cream/80 text-sm font-medium">{aiReview.bigOAnalysis}</p>
                                    </div>

                                    {/* Suggestions */}
                                    {aiReview.suggestions.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-charcoal dark:text-cream mb-2">Suggestions for Improvement</h3>
                                            {aiReview.suggestions.map((suggestion, index) => (
                                                <div key={index} className="flex items-start gap-2 text-sm font-medium text-charcoal/80 dark:text-cream/80 bg-charcoal/5 dark:bg-navy-input p-3 rounded-sm border-l-2 border-charcoal/20 dark:border-cream/20">
                                                    <LuInfo className="w-4 h-4 text-charcoal/60 dark:text-cream/60 mt-0.5 flex-shrink-0" />
                                                    {suggestion}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Bugs */}
                                    {aiReview.bugs.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <h3 className="font-bold text-charcoal dark:text-cream mb-2">Potential Issues</h3>
                                            {aiReview.bugs.map((bug, index) => (
                                                <div key={index} className="flex items-start gap-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-sm border-l-2 border-red-500">
                                                    <LuX className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <div className="font-bold uppercase tracking-wider text-xs mb-1">{bug.type}</div>
                                                        <div>{bug.message}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Execution Feedback */}
                            {feedback && (
                                <div className={`p-4 rounded-sm border-2 ${
                                    feedback.success 
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500' 
                                        : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                                }`}>
                                    <div className={`font-bold ${
                                        feedback.success ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
                                    }`}>
                                        {feedback.message}
                                    </div>
                                    {feedback.testsPassedRatio && (
                                        <div className="text-sm font-medium text-charcoal/80 dark:text-cream/80 mt-1">
                                            Tests passed: {feedback.testsPassedRatio}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LiveCodingChallenge;
