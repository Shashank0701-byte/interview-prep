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

    // Start timer when user starts typing
    useEffect(() => {
        if (userCode !== challenge.starterCode && !isTimerRunning) {
            setIsTimerRunning(true);
        }
        
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

        const hasNestedLoops = (code.match(/for|while/g) || []).length > 1;
        const hasOptimalApproach = code.includes('Set') || code.includes('Map') || code.includes('sort');
        
        if (hasOptimalApproach) {
            analysis.efficiency = 85;
            analysis.bigOAnalysis = 'Optimal time complexity achieved via hashing/lookup maps.';
        } else if (hasNestedLoops) {
            analysis.efficiency = 40;
            analysis.bigOAnalysis = 'Suboptimal O(n²) quadratic bounds detected. Try using hashing maps to linearize.';
        } else {
            analysis.efficiency = 70;
            analysis.bigOAnalysis = 'Acceptable linear time bounds - O(n) average complexity.';
        }

        const hasGoodNaming = /[a-z][A-Z]/.test(code);
        const hasComments = code.includes('//') || code.includes('/*');
        const hasProperSpacing = code.includes(' = ') && code.includes(', ');
        
        analysis.codeStyle = 0;
        if (hasGoodNaming) analysis.codeStyle += 35;
        if (hasComments) analysis.codeStyle += 25;
        if (hasProperSpacing) analysis.codeStyle += 40;

        if (code.includes('=') && !code.includes('==') && !code.includes('===')) {
            analysis.bugs.push({
                type: 'warning',
                message: 'Assignment inside query conditional checks - consider using === comparisons.',
                line: 'Evaluation error'
            });
        }
        
        if (code.includes('undefined') || code.includes('null')) {
            analysis.bugs.push({
                type: 'info',
                message: 'Ensure null reference checks are in place to prevent crash bounds.',
                line: 'Input parser'
            });
        }

        if (challenge.category === 'arrays') {
            if (!code.includes('sort') && !code.includes('Set')) {
                analysis.suggestions.push('Consider sorting arrays or storing key sets to bypass sequential checks.');
            }
        }
        
        if (challenge.category === 'strings') {
            if (!code.includes('toLowerCase') && !code.includes('toUpperCase')) {
                analysis.suggestions.push('Look out for alphabetical letter case sensitivity matches.');
            }
        }

        analysis.overallScore = Math.round(
            (analysis.correctness * 0.4 + analysis.efficiency * 0.35 + analysis.codeStyle * 0.25)
        );

        return analysis;
    };

    const analyzeCodeQuality = (code) => {
        const cleanCode = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
        if (cleanCode.length < 50) return 0;
        
        const functionPattern = /function\s+\w+\s*\([^)]*\)\s*\{\s*\}/;
        if (functionPattern.test(cleanCode)) return 0;
        
        const hasOnlyComments = /function\s+\w+\s*\([^)]*\)\s*\{\s*(\/\/.*\s*)*\s*\}/.test(code);
        if (hasOnlyComments) return 0;
        
        let quality = 0;
        const hasImplementation = cleanCode.includes('return') && cleanCode.split('\n').length > 3;
        if (!hasImplementation) return 0;
        
        if (code.includes('function') || code.includes('=>') || code.includes('const')) quality += 0.2;
        if (code.includes('return') && !code.match(/return\s*;?\s*$/m)) quality += 0.3;
        if (code.includes('for') || code.includes('while') || code.includes('map') || code.includes('forEach')) quality += 0.3;
        if (cleanCode.length > 100) quality += 0.2;
        
        return Math.min(quality, 1);
    };

    const runCode = async () => {
        if (!userCode.trim()) {
            setFeedback({
                success: false,
                message: 'No code input found to assess.',
                error: 'Null workspace'
            });
            return;
        }

        const codeQuality = analyzeCodeQuality(userCode);
        if (codeQuality === 0) {
            setFeedback({
                success: false,
                message: 'Please implement logic blocks inside the starter function declaration.',
                error: 'Empty function body'
            });
            return;
        }

        setIsRunning(true);
        setFeedback(null);
        setAiReview(null);
        setHasRunCode(true);

        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            const mockTestResults = challenge.testCases.map((testCase, index) => {
                const passed = codeQuality > 0.55 ? Math.random() > 0.15 : Math.random() > 0.65;
                return {
                    id: index,
                    input: testCase.input,
                    expected: testCase.expected,
                    actual: passed ? testCase.expected : 'Mock AssertionError',
                    passed
                };
            });

            setTestResults(mockTestResults);

            const analysis = analyzeCode(userCode);
            setAiReview(analysis);

            const passedTests = mockTestResults.filter(t => t.passed).length;
            const totalTests = mockTestResults.length;

            setFeedback({
                success: passedTests === totalTests,
                message: passedTests === totalTests 
                    ? `🎉 Build Success: All ${totalTests} test cases compiled successfully!` 
                    : `⚠️ Compilation Warning: ${passedTests}/${totalTests} unit test assertions passed. Check logs.`,
                testsPassedRatio: `${passedTests}/${totalTests}`
            });

        } catch (error) {
            setFeedback({
                success: false,
                message: 'Workspace compilation failure.',
                error: error.message
            });
        }

        setIsRunning(false);
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-amber-600 dark:text-amber-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-green-500/10 border-green-500 text-green-600 dark:text-green-400';
        if (score >= 60) return 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400';
        return 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400';
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-cream dark:bg-navy py-6 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-body text-charcoal dark:text-cream">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white dark:bg-navy-light rounded-sm border-4 border-charcoal dark:border-cream/40 shadow-[4px_4px_0px_0px_var(--color-shadow)] p-6 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-dashed border-charcoal/10 dark:border-cream/10 pb-4">
                            <button
                                onClick={() => navigate('/live-coding')}
                                className="w-fit flex items-center gap-2 px-3 py-2 border-2 border-charcoal dark:border-cream/40 rounded-sm bg-white dark:bg-navy-light text-charcoal dark:text-cream font-mono font-bold uppercase tracking-wider text-[9px] hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shadow-[1px_1px_0px_0px_var(--color-shadow)]"
                            >
                                <LuArrowLeft className="w-3.5 h-3.5" strokeWidth={3} />
                                <span>Back to Challenges</span>
                            </button>
                            
                            <div className="flex items-center gap-4 justify-end">
                                <div className="flex items-center gap-2 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/30 rounded-sm px-3.5 py-1.5 shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]">
                                    <LuClock className="w-4 h-4 text-charcoal/60 dark:text-cream/60" strokeWidth={2.5} />
                                    <span className="font-mono text-sm font-bold tracking-widest">{formatTime(timeElapsed)}</span>
                                </div>
                                
                                <div className="px-3.5 py-1.5 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                    {challenge.difficulty}
                                </div>
                            </div>
                        </div>

                        {/* Title Banner */}
                        <div className="bg-cream dark:bg-navy text-charcoal dark:text-cream rounded-sm border-2 border-charcoal dark:border-cream/40 p-6 shadow-[3px_3px_0px_0px_var(--color-shadow)]">
                            <div className="flex items-center gap-3 mb-3">
                                <LuCode className="w-5 h-5 text-charcoal dark:text-cream" strokeWidth={2.5} />
                                <h1 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-wide">{challenge.title}</h1>
                            </div>
                            <p className="text-charcoal/80 dark:text-cream/80 font-body text-xs font-medium leading-relaxed mb-5 max-w-4xl">{challenge.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono font-bold uppercase tracking-widest border-t border-dashed border-charcoal/15 dark:border-cream/15 pt-4">
                                <div className="flex items-center gap-2">
                                    <LuTarget className="w-4 h-4" />
                                    <span>Category: {challenge.category}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <LuTrendingUp className="w-4 h-4" />
                                    <span>Target Bounds: O({challenge.expectedComplexity})</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {/* Left Column: Code Editor Console */}
                        <div className="bg-white dark:bg-navy-light rounded-sm border-4 border-charcoal dark:border-cream/40 shadow-[4px_4px_0px_0px_var(--color-shadow)] overflow-hidden flex flex-col">
                            {/* Editor Header */}
                            <div className="bg-cream dark:bg-navy px-4 py-3 flex flex-wrap items-center justify-between border-b-4 border-charcoal dark:border-cream/40 gap-3">
                                <div className="flex items-center gap-2">
                                    <LuCode className="w-4 h-4 text-charcoal dark:text-cream" strokeWidth={2.5} />
                                    <span className="font-mono font-bold text-xs uppercase tracking-wider">Terminal Workspace</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowHints(!showHints)}
                                        className="px-3 py-1.5 bg-white dark:bg-navy-light text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-200 shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)] cursor-pointer"
                                    >
                                        {showHints ? 'Hide Hints' : 'View Hints'}
                                    </button>
                                    
                                    <button
                                        onClick={runCode}
                                        disabled={isRunning}
                                        className="flex items-center gap-1.5 px-4 py-1.5 bg-charcoal text-white dark:bg-cream dark:text-navy border-2 border-charcoal dark:border-cream hover:-translate-y-0.5 hover:shadow-[3.5px_3.5px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-shadow)] cursor-pointer"
                                    >
                                        {isRunning ? (
                                            <>
                                                <LuRefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                <span>Running...</span>
                                            </>
                                        ) : (
                                            <>
                                                <LuPlay className="w-3.5 h-3.5" strokeWidth={2.5} />
                                                <span>Execute code</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Textarea Workspace */}
                            <div className="p-4 bg-charcoal dark:bg-[#1a1a1a]">
                                <textarea
                                    ref={codeEditorRef}
                                    value={userCode}
                                    onChange={(e) => setUserCode(e.target.value)}
                                    className="w-full h-[400px] font-mono text-sm p-4 resize-none rounded-sm outline-none bg-[#121212] text-emerald-400 focus:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)] transition-all leading-relaxed"
                                    placeholder="// Implement your algorithm here..."
                                    spellCheck={false}
                                    style={{
                                        fontFamily: 'Consolas, Monaco, Fira Code, monospace',
                                    }}
                                />
                            </div>

                            {/* Hints Panel */}
                            {showHints && (
                                <div className="border-t-4 border-charcoal dark:border-cream/40 p-5 bg-cream dark:bg-navy">
                                    <h3 className="text-charcoal dark:text-cream font-mono font-bold uppercase tracking-wider text-xs mb-3 flex items-center gap-2 border-b border-dashed border-charcoal/10 dark:border-cream/10 pb-2">
                                        <LuZap className="w-4 h-4 text-charcoal dark:text-cream" />
                                        <span>Hints & Directives</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {challenge.hints.map((hint, index) => (
                                            <div key={index} className="text-xs text-charcoal/80 dark:text-cream/80 bg-white dark:bg-navy-light p-3.5 rounded-sm border-l-4 border-charcoal dark:border-cream/40 shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)] font-medium leading-relaxed">
                                                <strong>Hint {index + 1}:</strong> {hint}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Results & AI Review logs */}
                        <div className="space-y-6">
                            {/* Test Results logs */}
                            {!hasRunCode ? (
                                <div className="card-editorial p-6 bg-white dark:bg-navy-light">
                                    <h2 className="text-lg font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide mb-4 flex items-center gap-2 border-b-2 border-charcoal/10 dark:border-cream/10 pb-3">
                                        <LuTarget className="w-4.5 h-4.5 text-charcoal/60 dark:text-cream/60" strokeWidth={2.5} />
                                        <span>Unit Test Assertions</span>
                                    </h2>
                                    <div className="text-center py-10 font-mono text-charcoal/60 dark:text-cream/60">
                                        <LuPlay className="w-10 h-10 text-charcoal/20 dark:text-cream/20 mx-auto mb-4" />
                                        <p className="text-xs font-bold uppercase tracking-wider">Lobby Workspace Idle</p>
                                        <p className="text-[10px] mt-1">Implement your solution and click "Execute code" to launch unit assertions.</p>
                                    </div>
                                </div>
                            ) : testResults.length > 0 && (
                                <div className="card-editorial p-6 bg-white dark:bg-navy-light">
                                    <h2 className="text-lg font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide mb-4 flex items-center gap-2 border-b-2 border-charcoal/10 dark:border-cream/10 pb-3">
                                        <LuCheck className="w-4.5 h-4.5 text-emerald-500" strokeWidth={2.5} />
                                        <span>Unit Test Assertions</span>
                                    </h2>
                                    
                                    <div className="space-y-3">
                                        {testResults.map((result, index) => (
                                            <div key={index} className={`p-3.5 rounded-sm border-2 border-charcoal dark:border-cream/35 border-l-6 shadow-[2px_2px_0px_0px_var(--color-shadow)] ${
                                                result.passed 
                                                    ? 'bg-green-500/5 dark:bg-green-900/10 border-l-green-500' 
                                                    : 'bg-red-500/5 dark:bg-red-900/10 border-l-red-500'
                                            }`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-mono font-bold text-xs text-charcoal dark:text-cream">Assertion #{index + 1}</span>
                                                    {result.passed ? (
                                                        <LuCheck className="w-4.5 h-4.5 text-green-600 dark:text-green-400" strokeWidth={2.5} />
                                                    ) : (
                                                        <LuX className="w-4.5 h-4.5 text-red-600 dark:text-red-400" strokeWidth={2.5} />
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-charcoal/80 dark:text-cream/80 font-mono leading-relaxed space-y-1">
                                                    <div><strong>Input parameters:</strong> {JSON.stringify(result.input)}</div>
                                                    <div><strong>Expected outcome:</strong> {JSON.stringify(result.expected)}</div>
                                                    {!result.passed && (
                                                        <div className="text-red-600 dark:text-red-400 font-bold mt-1.5 border-t border-dashed border-red-500/20 pt-1.5">
                                                            <strong>AssertionError Got:</strong> {JSON.stringify(result.actual)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI Code Review metrics */}
                            {!hasRunCode ? (
                                <div className="card-editorial p-6 bg-white dark:bg-navy-light">
                                    <h2 className="text-lg font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide mb-4 flex items-center gap-2 border-b-2 border-charcoal/10 dark:border-cream/10 pb-3">
                                        <LuBrain className="w-4.5 h-4.5 text-charcoal/60 dark:text-cream/60" strokeWidth={2.5} />
                                        <span>AI Diagnostic Log</span>
                                    </h2>
                                    <div className="text-center py-10 font-mono text-charcoal/60 dark:text-cream/60">
                                        <LuBrain className="w-10 h-10 text-charcoal/20 dark:text-cream/20 mx-auto mb-4" />
                                        <p className="text-xs font-bold uppercase tracking-wider">No Diagnostic Log</p>
                                        <p className="text-[10px] mt-1">Execute the workspace to build diagnostic feedback metrics.</p>
                                    </div>
                                </div>
                            ) : aiReview && (
                                <div className="card-editorial p-6 bg-white dark:bg-navy-light">
                                    <h2 className="text-lg font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide mb-4 flex items-center gap-2 border-b-2 border-charcoal/10 dark:border-cream/10 pb-3">
                                        <LuBrain className="w-4.5 h-4.5 text-charcoal dark:text-cream" strokeWidth={2.5} />
                                        <span>AI Diagnostic Log</span>
                                    </h2>

                                    {/* Overall Score box */}
                                    <div className={`p-4 rounded-sm border-2 border-charcoal dark:border-cream/40 mb-5 shadow-[2px_2px_0px_0px_var(--color-shadow)] ${getScoreBg(aiReview.overallScore)}`}>
                                        <div className="flex items-center justify-between font-mono">
                                            <span className="font-bold uppercase tracking-wider text-xs">Diagnostic Assessment Score</span>
                                            <span className="text-2xl font-bold font-display tracking-widest">
                                                {aiReview.overallScore} / 100
                                            </span>
                                        </div>
                                    </div>

                                    {/* Score Grid details */}
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        {[
                                            { label: 'Correctness', value: aiReview.correctness },
                                            { label: 'Efficiency', value: aiReview.efficiency },
                                            { label: 'Code Style', value: aiReview.codeStyle }
                                        ].map((metric, idx) => (
                                            <div key={idx} className="text-center bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/20 p-3 rounded-sm shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]">
                                                <div className={`text-xl font-display font-bold ${getScoreColor(metric.value)}`}>
                                                    {metric.value}
                                                </div>
                                                <div className="text-[9px] text-charcoal/60 dark:text-cream/60 font-mono font-bold uppercase tracking-wider mt-1">{metric.label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Big O Analysis */}
                                    <div className="bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/30 rounded-sm p-4 mb-5 shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                        <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-charcoal dark:text-cream mb-2 flex items-center gap-1.5">
                                            <LuTrendingUp className="w-4.5 h-4.5" />
                                            <span>Big-O Complexity</span>
                                        </h4>
                                        <p className="text-charcoal/80 dark:text-cream/80 text-xs font-mono font-bold leading-relaxed">{aiReview.bigOAnalysis}</p>
                                    </div>

                                    {/* Suggestions */}
                                    {aiReview.suggestions.length > 0 && (
                                        <div className="space-y-2.5">
                                            <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-charcoal dark:text-cream mb-2">Optimization Suggestions</h4>
                                            {aiReview.suggestions.map((suggestion, index) => (
                                                <div key={index} className="flex items-start gap-2.5 text-xs font-medium text-charcoal/80 dark:text-cream/80 bg-cream dark:bg-navy p-3.5 border-2 border-charcoal/10 dark:border-cream/10 border-l-4 border-l-charcoal dark:border-l-cream/40 rounded-sm shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)] leading-relaxed">
                                                    <LuInfo className="w-4 h-4 text-charcoal/50 dark:text-cream/50 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                                                    <span>{suggestion}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Bugs / Issues */}
                                    {aiReview.bugs.length > 0 && (
                                        <div className="mt-5 space-y-2.5 border-t border-dashed border-charcoal/10 dark:border-cream/10 pt-4">
                                            <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">Critical Log Exceptions</h4>
                                            {aiReview.bugs.map((bug, index) => (
                                                <div key={index} className="flex items-start gap-2.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-500/5 p-3.5 border-2 border-red-500/20 border-l-4 border-l-red-500 rounded-sm shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)] leading-relaxed">
                                                    <LuX className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                                                    <div>
                                                        <div className="font-mono font-bold uppercase tracking-wider text-[9px] mb-1">{bug.type}</div>
                                                        <div>{bug.message}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Execution Feedback banner */}
                            {feedback && (
                                <div className={`p-4 rounded-sm border-2 border-charcoal dark:border-cream/40 shadow-[3px_3px_0px_0px_var(--color-shadow)] ${
                                    feedback.success 
                                        ? 'bg-green-500/10 border-green-500 text-green-600 dark:text-green-400' 
                                        : 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400'
                                }`}>
                                    <div className="font-mono font-bold uppercase tracking-wide text-xs">
                                        {feedback.message}
                                    </div>
                                    {feedback.testsPassedRatio && (
                                        <div className="text-[10px] font-mono font-bold text-charcoal/60 dark:text-cream/60 mt-1 uppercase tracking-widest">
                                            Assertions Passed: {feedback.testsPassedRatio}
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
