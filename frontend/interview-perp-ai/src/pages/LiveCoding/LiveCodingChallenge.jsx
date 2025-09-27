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
    }, [userCode, challenge.starterCode, isTimerRunning]);

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

    // Run code and get AI feedback
    const runCode = async () => {
        setIsRunning(true);
        setFeedback(null);
        setAiReview(null);

        // Simulate code execution delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            // Simulate test case execution
            const mockTestResults = challenge.testCases.map((testCase, index) => {
                // Simple simulation - in real implementation, this would execute the code
                const passed = Math.random() > 0.3; // 70% pass rate for demo
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
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-green-100';
        if (score >= 60) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => navigate('/live-coding')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <LuArrowLeft className="w-4 h-4" />
                                Back to Challenges
                            </button>
                            
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <LuClock className="w-4 h-4" />
                                    <span className="font-mono text-lg">{formatTime(timeElapsed)}</span>
                                </div>
                                
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                    challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {challenge.difficulty}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <LuCode className="w-6 h-6" />
                                <h1 className="text-2xl font-bold">{challenge.title}</h1>
                            </div>
                            <p className="text-indigo-100 mb-4">{challenge.description}</p>
                            
                            <div className="flex items-center gap-6 text-sm">
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
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <LuCode className="w-4 h-4" />
                                    <span className="font-medium">Code Editor</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowHints(!showHints)}
                                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                                    >
                                        {showHints ? 'Hide Hints' : 'Show Hints'}
                                    </button>
                                    
                                    <button
                                        onClick={runCode}
                                        disabled={isRunning}
                                        className="flex items-center gap-2 px-4 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm font-medium transition-colors"
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

                            <div className="p-4">
                                <textarea
                                    ref={codeEditorRef}
                                    value={userCode}
                                    onChange={(e) => setUserCode(e.target.value)}
                                    className="w-full h-96 font-mono text-sm border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
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
                                <div className="border-t border-gray-200 p-4 bg-blue-50">
                                    <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                                        <LuZap className="w-4 h-4" />
                                        Hints
                                    </h3>
                                    <div className="space-y-2">
                                        {challenge.hints.map((hint, index) => (
                                            <div key={index} className="text-sm text-blue-700 bg-blue-100 rounded p-2">
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
                            {testResults.length > 0 && (
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <LuCheck className="w-5 h-5 text-green-500" />
                                        Test Results
                                    </h2>
                                    
                                    <div className="space-y-3">
                                        {testResults.map((result, index) => (
                                            <div key={index} className={`p-3 rounded-lg border-l-4 ${
                                                result.passed 
                                                    ? 'bg-green-50 border-green-500' 
                                                    : 'bg-red-50 border-red-500'
                                            }`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium">Test Case {index + 1}</span>
                                                    {result.passed ? (
                                                        <LuCheck className="w-5 h-5 text-green-500" />
                                                    ) : (
                                                        <LuX className="w-5 h-5 text-red-500" />
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <div><strong>Input:</strong> {JSON.stringify(result.input)}</div>
                                                    <div><strong>Expected:</strong> {JSON.stringify(result.expected)}</div>
                                                    {!result.passed && (
                                                        <div className="text-red-600">
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
                            {aiReview && (
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <LuBrain className="w-5 h-5 text-purple-500" />
                                        AI Code Review
                                    </h2>

                                    {/* Overall Score */}
                                    <div className={`p-4 rounded-lg mb-4 ${getScoreBg(aiReview.overallScore)}`}>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Overall Score</span>
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
                                            <div className="text-sm text-gray-600">Correctness</div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-2xl font-bold ${getScoreColor(aiReview.efficiency)}`}>
                                                {aiReview.efficiency}
                                            </div>
                                            <div className="text-sm text-gray-600">Efficiency</div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-2xl font-bold ${getScoreColor(aiReview.codeStyle)}`}>
                                                {aiReview.codeStyle}
                                            </div>
                                            <div className="text-sm text-gray-600">Code Style</div>
                                        </div>
                                    </div>

                                    {/* Big O Analysis */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                        <h3 className="font-medium text-blue-800 mb-2">Time Complexity Analysis</h3>
                                        <p className="text-blue-700 text-sm">{aiReview.bigOAnalysis}</p>
                                    </div>

                                    {/* Suggestions */}
                                    {aiReview.suggestions.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="font-medium text-gray-800">Suggestions for Improvement</h3>
                                            {aiReview.suggestions.map((suggestion, index) => (
                                                <div key={index} className="flex items-start gap-2 text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                                                    <LuInfo className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                    {suggestion}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Bugs */}
                                    {aiReview.bugs.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <h3 className="font-medium text-gray-800">Potential Issues</h3>
                                            {aiReview.bugs.map((bug, index) => (
                                                <div key={index} className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
                                                    <LuX className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <div className="font-medium">{bug.type}</div>
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
                                <div className={`p-4 rounded-lg ${
                                    feedback.success 
                                        ? 'bg-green-50 border border-green-200' 
                                        : 'bg-red-50 border border-red-200'
                                }`}>
                                    <div className={`font-medium ${
                                        feedback.success ? 'text-green-800' : 'text-red-800'
                                    }`}>
                                        {feedback.message}
                                    </div>
                                    {feedback.testsPassedRatio && (
                                        <div className="text-sm text-gray-600 mt-1">
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
