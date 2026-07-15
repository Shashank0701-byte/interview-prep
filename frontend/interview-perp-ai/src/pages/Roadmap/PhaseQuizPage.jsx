import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader.jsx';
import { 
    LuAward, 
    LuCheck, 
    LuX, 
    LuClock, 
    LuTrendingUp, 
    LuStar,
    LuChevronRight,
    LuRefreshCw,
    LuArrowLeft,
    LuTarget,
    LuBrain
} from 'react-icons/lu';

const PhaseQuizPage = () => {
    const { role, phaseId } = useParams();
    const navigate = useNavigate();
    const [currentPhase, setCurrentPhase] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [userAnswers, setUserAnswers] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [quizResult, setQuizResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [quizStarted, setQuizStarted] = useState(false);

    useEffect(() => {
        fetchPhaseAndQuiz();
    }, [role, phaseId]);

    useEffect(() => {
        let timer;
        if (quizStarted && timeLeft > 0 && !showResult) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (timeLeft === 0 && !showResult) {
            handleQuizSubmit();
        }
        return () => clearTimeout(timer);
    }, [timeLeft, quizStarted, showResult]);

    const fetchPhaseAndQuiz = async () => {
        try {
            // Fetch roadmap to get phase details
            const roadmapResponse = await axiosInstance.get(API_PATHS.ROADMAP.GENERATE(role));
            const phase = roadmapResponse.data.phases.find(p => p.id === phaseId);
            setCurrentPhase(phase);

            // Generate quiz questions from phase sessions
            if (phase && phase.sessions.length > 0) {
                const quizQuestions = generateQuizFromPhase(phase);
                setQuizQuestions(quizQuestions);
            }
        } catch (error) {
            console.error("Failed to fetch phase and quiz", error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateQuizFromPhase = (phase) => {
        // Generate sample quiz questions based on phase topics
        const topicQuestions = {
            'Data Structures': [
                {
                    question: "What is the time complexity of searching in a balanced binary search tree?",
                    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
                    correct: 1,
                    explanation: "In a balanced BST, the height is log n, so search operations take O(log n) time."
                },
                {
                    question: "Which data structure uses LIFO (Last In, First Out) principle?",
                    options: ["Queue", "Stack", "Array", "Linked List"],
                    correct: 1,
                    explanation: "Stack follows LIFO principle where the last element added is the first one to be removed."
                }
            ],
            'Algorithms': [
                {
                    question: "What is the best-case time complexity of Quick Sort?",
                    options: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"],
                    correct: 1,
                    explanation: "Quick Sort has O(n log n) time complexity in the best and average cases."
                },
                {
                    question: "Which algorithm technique is used in Dynamic Programming?",
                    options: ["Divide and Conquer", "Memoization", "Greedy", "Backtracking"],
                    correct: 1,
                    explanation: "Dynamic Programming uses memoization to store and reuse previously computed results."
                }
            ],
            'System Design': [
                {
                    question: "What is horizontal scaling?",
                    options: ["Adding more power to existing machines", "Adding more machines to the pool", "Optimizing database queries", "Caching frequently accessed data"],
                    correct: 1,
                    explanation: "Horizontal scaling means adding more servers to handle increased load."
                }
            ],
            'APIs': [
                {
                    question: "What does REST stand for?",
                    options: ["Representational State Transfer", "Remote State Transfer", "Relational State Transfer", "Resource State Transfer"],
                    correct: 0,
                    explanation: "REST stands for Representational State Transfer, an architectural style for web services."
                }
            ]
        };

        // Select questions based on phase topics
        let selectedQuestions = [];
        phase.topics.forEach(topic => {
            if (topicQuestions[topic]) {
                selectedQuestions.push(...topicQuestions[topic]);
            }
        });

        // If no specific questions found, use general questions
        if (selectedQuestions.length === 0) {
            selectedQuestions = [
                {
                    question: `What is the most important skill for a ${role}?`,
                    options: ["Technical Knowledge", "Problem Solving", "Communication", "All of the above"],
                    correct: 3,
                    explanation: "All skills are important for a well-rounded professional."
                },
                {
                    question: "How do you handle learning new technologies?",
                    options: ["Avoid them", "Learn basics only", "Deep dive and practice", "Wait for others to learn first"],
                    correct: 2,
                    explanation: "Deep diving and practicing is the best way to master new technologies."
                }
            ];
        }

        // Shuffle and limit to 5 questions
        return selectedQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);
    };

    const handleStartQuiz = () => {
        setQuizStarted(true);
        setTimeLeft(300); // Reset timer
    };

    const handleAnswerSelect = (answerIndex) => {
        setSelectedAnswer(answerIndex);
    };

    const handleNextQuestion = () => {
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = selectedAnswer;
        setUserAnswers(newAnswers);
        setSelectedAnswer('');

        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            handleQuizSubmit(newAnswers);
        }
    };

    const handleQuizSubmit = (answers = userAnswers) => {
        const finalAnswers = [...answers];
        if (selectedAnswer !== '' && !showResult) {
            finalAnswers[currentQuestionIndex] = selectedAnswer;
        }

        // Calculate score
        let correctAnswers = 0;
        quizQuestions.forEach((question, index) => {
            if (finalAnswers[index] === question.correct) {
                correctAnswers++;
            }
        });

        const score = Math.round((correctAnswers / quizQuestions.length) * 100);
        const passed = score >= 70;

        setQuizResult({
            score,
            correctAnswers,
            totalQuestions: quizQuestions.length,
            passed,
            answers: finalAnswers
        });
        setShowResult(true);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-screen bg-cream dark:bg-navy font-body">
                    <SpinnerLoader />
                    <p className="text-charcoal dark:text-cream mt-4 text-center font-bold font-mono text-xs uppercase tracking-widest">
                        Preparing phase quiz... ✨
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    if (!currentPhase || quizQuestions.length === 0) {
        return (
            <DashboardLayout>
                <div className="text-center py-20 bg-white dark:bg-navy-light border-4 border-charcoal dark:border-cream/40 rounded-sm shadow-[8px_8px_0px_0px_var(--color-shadow)] max-w-xl mx-auto my-12 font-body">
                    <div className="w-16 h-16 bg-charcoal dark:bg-cream rounded-sm flex items-center justify-center mx-auto mb-6 shadow-[3px_3px_0px_0px_var(--color-shadow)]">
                        <LuAward className="w-8 h-8 text-white dark:text-navy" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide">Quiz Not Available</h2>
                    <p className="text-charcoal/65 dark:text-cream/65 mb-6">
                        The quiz for this phase is not available yet.
                    </p>
                    <button
                        onClick={() => navigate(`/phase/${encodeURIComponent(role)}/${phaseId}`)}
                        className="px-5 py-2.5 bg-charcoal text-white dark:bg-cream dark:text-navy font-bold uppercase tracking-widest text-xs rounded-sm border-3 border-charcoal dark:border-cream/40 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                    >
                        Back to Phase
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-cream dark:bg-navy font-body transition-colors duration-300">
                {!quizStarted ? (
                    // Quiz Introduction
                    <div className="container mx-auto px-4 py-12 max-w-2xl">
                        <div className="card-editorial p-8 text-center bg-white dark:bg-navy-light">
                            <div className="w-16 h-16 bg-charcoal dark:bg-cream border-3 border-charcoal dark:border-cream/40 rounded-sm flex items-center justify-center mx-auto mb-6 shadow-[3px_3px_0px_0px_var(--color-shadow)]">
                                <LuAward className="w-8 h-8 text-white dark:text-navy" strokeWidth={2.5} />
                            </div>
                            
                            <h1 className="text-3xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wider mb-2">
                                Phase {currentPhase.order} Quiz
                            </h1>
                            <h2 className="text-sm text-charcoal/60 dark:text-cream/60 mb-6 uppercase tracking-wider font-mono font-bold">
                                {currentPhase.name}
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 font-mono">
                                <div className="bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm p-4 shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                    <LuTarget className="w-5 h-5 text-charcoal/60 dark:text-cream/60 mx-auto mb-2" strokeWidth={2.5} />
                                    <div className="font-bold text-charcoal dark:text-cream text-lg">{quizQuestions.length}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-charcoal/50 dark:text-cream/50">Questions</div>
                                </div>
                                <div className="bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm p-4 shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                    <LuClock className="w-5 h-5 text-charcoal/60 dark:text-cream/60 mx-auto mb-2" strokeWidth={2.5} />
                                    <div className="font-bold text-charcoal dark:text-cream text-lg">5</div>
                                    <div className="text-[10px] uppercase tracking-wider text-charcoal/50 dark:text-cream/50">Minutes</div>
                                </div>
                                <div className="bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm p-4 shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                    <LuStar className="w-5 h-5 text-charcoal/60 dark:text-cream/60 mx-auto mb-2" strokeWidth={2.5} />
                                    <div className="font-bold text-charcoal dark:text-cream text-lg">70%</div>
                                    <div className="text-[10px] uppercase tracking-wider text-charcoal/50 dark:text-cream/50">To Pass</div>
                                </div>
                            </div>
                            
                            <div className="bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm p-6 mb-8 text-left">
                                <h3 className="font-display font-bold text-charcoal dark:text-cream mb-3 uppercase tracking-wider text-sm">Quiz Instructions</h3>
                                <ul className="text-xs text-charcoal/70 dark:text-cream/70 space-y-2 font-mono font-bold">
                                    <li>• You have exactly 5 minutes (300s) to complete the quiz</li>
                                    <li>• Each question has only one correct choice</li>
                                    <li>• You need 70% (4 out of 5 correct) to pass and unlock next milestones</li>
                                    <li>• Retakes are permitted at any time</li>
                                </ul>
                            </div>
                            
                            <button
                                onClick={handleStartQuiz}
                                className="px-6 py-3 bg-charcoal text-white dark:bg-cream dark:text-navy border-3 border-charcoal dark:border-cream/40 font-mono font-bold uppercase tracking-wider text-xs rounded-sm hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 cursor-pointer"
                            >
                                Start Quiz
                            </button>
                        </div>
                    </div>
                ) : showResult ? (
                    // Quiz Results
                    <div className="container mx-auto px-4 py-12 max-w-2xl">
                        <div className="card-editorial p-8 text-center bg-white dark:bg-navy-light">
                            <div className={`w-16 h-16 ${quizResult.passed ? 'bg-green-500' : 'bg-crimson'} border-3 border-charcoal dark:border-cream/40 rounded-sm flex items-center justify-center mx-auto mb-6 shadow-[3px_3px_0px_0px_var(--color-shadow)]`}>
                                {quizResult.passed ? <LuCheck className="w-8 h-8 text-white" strokeWidth={3} /> : <LuX className="w-8 h-8 text-white" strokeWidth={3} />}
                            </div>
                            
                            <h1 className="text-3xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wider mb-2">
                                {quizResult.passed ? 'Passed! 🎉' : 'Keep Learning! 📚'}
                            </h1>
                            
                            <div className="text-6xl font-mono font-bold mb-4 text-charcoal dark:text-cream">
                                {quizResult.score}%
                            </div>
                            
                            <p className="text-sm font-bold text-charcoal/70 dark:text-cream/70 mb-8 font-mono">
                                SCORE: {quizResult.correctAnswers} / {quizResult.totalQuestions} CORRECT
                            </p>
                            
                            {quizResult.passed ? (
                                <div className="bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm p-6 mb-8 text-left">
                                    <h3 className="font-display font-bold text-charcoal dark:text-cream mb-2 uppercase tracking-wider text-xs">Phase Complete!</h3>
                                    <p className="text-xs text-charcoal/70 dark:text-cream/70 font-bold leading-normal font-mono">
                                        Congratulations on mastering this phase. Ready to continue your roadmap?
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm p-6 mb-8 text-left">
                                    <h3 className="font-display font-bold text-charcoal dark:text-cream mb-2 uppercase tracking-wider text-xs">Almost There!</h3>
                                    <p className="text-xs text-charcoal/70 dark:text-cream/70 font-bold leading-normal font-mono">
                                        Review the topics and try again. You need 70% or more to pass.
                                    </p>
                                </div>
                            )}
                            
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => navigate(`/phase/${encodeURIComponent(role)}/${phaseId}`)}
                                    className="px-4 py-2.5 bg-white dark:bg-navy-light text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 font-mono font-bold uppercase tracking-wider text-[10px] rounded-sm hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)]"
                                >
                                    Back to Phase
                                </button>
                                
                                {!quizResult.passed && (
                                    <button
                                        onClick={() => {
                                            setShowResult(false);
                                            setQuizStarted(false);
                                            setCurrentQuestionIndex(0);
                                            setUserAnswers([]);
                                            setSelectedAnswer('');
                                            setTimeLeft(300);
                                        }}
                                        className="px-4 py-2.5 bg-charcoal text-white dark:bg-cream dark:text-navy border-2 border-charcoal dark:border-cream/40 font-mono font-bold uppercase tracking-wider text-[10px] rounded-sm hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 cursor-pointer"
                                    >
                                        <LuRefreshCw className="w-3.5 h-3.5 inline mr-1.5" strokeWidth={3} />
                                        Retake Quiz
                                    </button>
                                )}
                                
                                {quizResult.passed && (
                                    <button
                                        onClick={() => navigate(`/roadmap?role=${encodeURIComponent(role)}`)}
                                        className="px-4 py-2.5 bg-charcoal text-white dark:bg-cream dark:text-navy border-2 border-charcoal dark:border-cream/40 font-mono font-bold uppercase tracking-wider text-[10px] rounded-sm hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 cursor-pointer"
                                    >
                                        Continue Roadmap
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Quiz Questions
                    <div className="container mx-auto px-4 py-8 max-w-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate(`/phase/${encodeURIComponent(role)}/${phaseId}`)}
                                    className="w-9 h-9 border-2 border-charcoal dark:border-cream/40 rounded-sm flex items-center justify-center hover:-translate-y-0.5 transition-all bg-white dark:bg-navy-light text-charcoal dark:text-cream cursor-pointer"
                                >
                                    <LuArrowLeft className="w-4 h-4" strokeWidth={3} />
                                </button>
                                <div>
                                    <h1 className="text-xl font-display font-bold uppercase tracking-wider text-charcoal dark:text-cream">Phase Quiz</h1>
                                    <p className="text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 mt-0.5">Question {currentQuestionIndex + 1} of {quizQuestions.length}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light shadow-[2px_2px_0px_0px_var(--color-shadow)] ${timeLeft <= 60 ? 'text-red-500 font-bold border-red-500' : 'text-charcoal dark:text-cream'}`}>
                                    <LuClock className="w-3.5 h-3.5" strokeWidth={3} />
                                    <span className="font-mono text-xs font-bold">{formatTime(timeLeft)}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm h-3 mb-8">
                            <div 
                                className="bg-charcoal dark:bg-cream h-full rounded-sm transition-all duration-300"
                                style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                            ></div>
                        </div>
                        
                        {/* Question Card */}
                        <div className="card-editorial p-6 sm:p-8 mb-8 bg-white dark:bg-navy-light">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-9 h-9 border-2 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy rounded-sm flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                    <LuBrain className="w-5 h-5 text-charcoal dark:text-cream" strokeWidth={2.5} />
                                </div>
                                <h2 className="text-lg font-display font-bold text-charcoal dark:text-cream leading-relaxed">
                                    {quizQuestions[currentQuestionIndex]?.question}
                                </h2>
                            </div>
                            
                            <div className="space-y-3">
                                {quizQuestions[currentQuestionIndex]?.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswerSelect(index)}
                                        className={`w-full text-left p-4 rounded-sm border-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center justify-between ${
                                            selectedAnswer === index
                                                ? 'border-charcoal dark:border-cream/80 bg-charcoal dark:bg-cream text-white dark:text-navy shadow-[3px_3px_0px_0px_var(--color-shadow)]'
                                                : 'border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream shadow-[2px_2px_0px_0px_var(--color-shadow)]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center ${
                                                selectedAnswer === index
                                                    ? 'border-white dark:border-navy bg-charcoal dark:bg-cream'
                                                    : 'border-charcoal dark:border-cream/40'
                                            }`}>
                                                {selectedAnswer === index && <LuCheck className="w-3 h-3 text-white dark:text-navy" strokeWidth={3} />}
                                            </div>
                                            <span className="font-bold text-sm leading-tight">{option}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Navigation */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleNextQuestion}
                                disabled={selectedAnswer === ''}
                                className={`flex items-center gap-2 px-5 py-2.5 font-mono font-bold uppercase tracking-widest text-[10px] rounded-sm border-3 border-charcoal dark:border-cream/40 transition-all duration-200 shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none ${
                                    selectedAnswer !== ''
                                        ? 'bg-charcoal text-white dark:bg-cream dark:text-navy hover:-translate-y-0.5 cursor-pointer'
                                        : 'bg-white dark:bg-navy-light text-charcoal/40 dark:text-cream/40 cursor-not-allowed shadow-none border-charcoal/20 dark:border-cream/10'
                                }`}
                            >
                                <span>{currentQuestionIndex === quizQuestions.length - 1 ? 'Submit Quiz' : 'Next Question'}</span>
                                <LuChevronRight className="w-4 h-4" strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default PhaseQuizPage;
