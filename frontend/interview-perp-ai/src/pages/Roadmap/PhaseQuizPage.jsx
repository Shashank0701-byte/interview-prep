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

    const getPhaseColor = (color) => {
        const colors = {
            blue: 'from-blue-500 to-cyan-500',
            purple: 'from-purple-500 to-indigo-500',
            emerald: 'from-emerald-500 to-green-500',
            amber: 'from-amber-500 to-orange-500',
            cyan: 'from-cyan-500 to-blue-500',
            green: 'from-green-500 to-emerald-500',
            red: 'from-red-500 to-pink-500',
            indigo: 'from-indigo-500 to-purple-500',
            orange: 'from-orange-500 to-red-500'
        };
        return colors[color] || 'from-gray-500 to-gray-600';
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-screen bg-cream dark:bg-navy font-body">
                    <SpinnerLoader />
                    <p className="text-charcoal dark:text-cream mt-4 text-center font-bold">
                        Preparing your phase quiz... ✨
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    if (!currentPhase || quizQuestions.length === 0) {
        return (
            <DashboardLayout>
                <div className="text-center py-20 bg-cream dark:bg-navy min-h-screen font-body">
                    <div className="w-20 h-20 bg-charcoal rounded-full flex items-center justify-center mx-auto mb-6">
                        <LuAward className="w-10 h-10 text-white dark:text-navy" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-4">Quiz Not Available</h2>
                    <p className="text-charcoal/80 dark:text-cream/80 mb-6">
                        The quiz for this phase is not available yet.
                    </p>
                    <button
                        onClick={() => navigate(`/phase/${encodeURIComponent(role)}/${phaseId}`)}
                        className="px-6 py-3 bg-charcoal dark:bg-cream text-white dark:text-navy font-bold uppercase tracking-wider text-sm rounded-md border-2 border-charcoal dark:border-cream/40 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all cursor-pointer"
                    >
                        Back to Phase
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-cream dark:bg-navy font-body">
                {!quizStarted ? (
                    // Quiz Introduction
                    <div className="container mx-auto px-4 py-12 max-w-4xl">
                        <div className="card-editorial p-8 text-center">
                            <div className={`w-20 h-20 bg-charcoal dark:bg-cream rounded-md flex items-center justify-center mx-auto mb-6`}>
                                <LuAward className="w-10 h-10 text-white dark:text-navy" />
                            </div>
                            
                            <h1 className="text-3xl font-display font-bold text-charcoal dark:text-cream mb-4">
                                Phase {currentPhase.order} Quiz
                            </h1>
                            <h2 className="text-xl text-charcoal/80 dark:text-cream/80 mb-6 font-bold">
                                {currentPhase.name}
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-cream dark:bg-navy border-2 border-charcoal/20 dark:border-cream/20 rounded-md p-4">
                                    <LuTarget className="w-6 h-6 text-charcoal dark:text-cream mx-auto mb-2" />
                                    <div className="font-bold text-charcoal dark:text-cream">{quizQuestions.length}</div>
                                    <div className="text-sm text-charcoal/80 dark:text-cream/80 font-bold">Questions</div>
                                </div>
                                <div className="bg-cream dark:bg-navy border-2 border-charcoal/20 dark:border-cream/20 rounded-md p-4">
                                    <LuClock className="w-6 h-6 text-charcoal dark:text-cream mx-auto mb-2" />
                                    <div className="font-bold text-charcoal dark:text-cream">5</div>
                                    <div className="text-sm text-charcoal/80 dark:text-cream/80 font-bold">Minutes</div>
                                </div>
                                <div className="bg-cream dark:bg-navy border-2 border-charcoal/20 dark:border-cream/20 rounded-md p-4">
                                    <LuStar className="w-6 h-6 text-charcoal dark:text-cream mx-auto mb-2" />
                                    <div className="font-bold text-charcoal dark:text-cream">70%</div>
                                    <div className="text-sm text-charcoal/80 dark:text-cream/80 font-bold">To Pass</div>
                                </div>
                            </div>
                            
                            <div className="bg-cream dark:bg-navy border-2 border-charcoal/20 dark:border-cream/20 rounded-md p-6 mb-8">
                                <h3 className="font-display font-bold text-charcoal dark:text-cream mb-3">Quiz Instructions</h3>
                                <ul className="text-left text-charcoal/80 dark:text-cream/80 space-y-2 font-bold">
                                    <li>• You have 5 minutes to complete the quiz</li>
                                    <li>• Each question has only one correct answer</li>
                                    <li>• You need 70% or higher to pass</li>
                                    <li>• You can retake the quiz if needed</li>
                                </ul>
                            </div>
                            
                            <button
                                onClick={handleStartQuiz}
                                className={`px-8 py-4 bg-charcoal dark:bg-cream text-white dark:text-navy border-2 border-charcoal dark:border-cream/40 font-bold uppercase tracking-wider text-sm rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all duration-300 cursor-pointer`}
                            >
                                Start Quiz
                            </button>
                        </div>
                    </div>
                ) : showResult ? (
                    // Quiz Results
                    <div className="container mx-auto px-4 py-12 max-w-4xl">
                        <div className="card-editorial p-8 text-center">
                            <div className={`w-20 h-20 bg-charcoal dark:bg-cream rounded-md flex items-center justify-center mx-auto mb-6`}>
                                {quizResult.passed ? <LuCheck className="w-10 h-10 text-white dark:text-navy" /> : <LuX className="w-10 h-10 text-white dark:text-navy" />}
                            </div>
                            
                            <h1 className="text-3xl font-display font-bold text-charcoal dark:text-cream mb-4">
                                {quizResult.passed ? 'Congratulations! 🎉' : 'Keep Learning! 📚'}
                            </h1>
                            
                            <div className="text-6xl font-display font-bold mb-4 text-charcoal dark:text-cream">
                                {quizResult.score}%
                            </div>
                            
                            <p className="text-xl text-charcoal/80 dark:text-cream/80 mb-8 font-bold">
                                You got {quizResult.correctAnswers} out of {quizResult.totalQuestions} questions correct
                            </p>
                            
                            {quizResult.passed ? (
                                <div className="bg-cream dark:bg-navy border-2 border-charcoal/20 dark:border-cream/20 rounded-md p-6 mb-8">
                                    <h3 className="font-display font-bold text-charcoal dark:text-cream mb-2">Phase Complete!</h3>
                                    <p className="text-charcoal/80 dark:text-cream/80 font-bold">
                                        You've successfully mastered this phase. Ready for the next challenge?
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-cream dark:bg-navy border-2 border-charcoal/20 dark:border-cream/20 rounded-md p-6 mb-8">
                                    <h3 className="font-display font-bold text-charcoal dark:text-cream mb-2">Almost There!</h3>
                                    <p className="text-charcoal/80 dark:text-cream/80 font-bold">
                                        Review the topics and try again. You need 70% to pass.
                                    </p>
                                </div>
                            )}
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => navigate(`/phase/${encodeURIComponent(role)}/${phaseId}`)}
                                    className="px-6 py-3 bg-white dark:bg-navy-light text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 font-bold uppercase tracking-wider text-sm rounded-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                    style={{ transition: 'transform 0.3s, box-shadow 0.3s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-shadow)'}
                                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
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
                                        className="px-6 py-3 bg-charcoal dark:bg-cream text-white dark:text-navy border-2 border-charcoal dark:border-cream/40 font-bold uppercase tracking-wider text-sm rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all duration-300 cursor-pointer"
                                    >
                                        <LuRefreshCw className="w-4 h-4 inline mr-2" />
                                        Retake Quiz
                                    </button>
                                )}
                                
                                {quizResult.passed && (
                                    <button
                                        onClick={() => navigate(`/roadmap?role=${encodeURIComponent(role)}`)}
                                        className={`px-6 py-3 bg-charcoal dark:bg-cream text-white dark:text-navy border-2 border-charcoal dark:border-cream/40 font-bold uppercase tracking-wider text-sm rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all duration-300 cursor-pointer`}
                                    >
                                        Continue Roadmap
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Quiz Questions
                    <div className="container mx-auto px-4 py-8 max-w-4xl">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate(`/phase/${encodeURIComponent(role)}/${phaseId}`)}
                                    className="p-2 hover:-translate-y-1 transition-all rounded-md cursor-pointer"
                                >
                                    <LuArrowLeft className="w-5 h-5 text-charcoal dark:text-cream" />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-display font-bold text-charcoal dark:text-cream">Phase Quiz</h1>
                                    <p className="text-charcoal/80 dark:text-cream/80 font-bold">Question {currentQuestionIndex + 1} of {quizQuestions.length}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-md border-2 border-charcoal dark:border-cream/40 ${timeLeft <= 60 ? 'bg-white dark:bg-navy-light text-red-600' : 'bg-white dark:bg-navy-light text-charcoal dark:text-cream'}`} style={{ boxShadow: '4px 4px 0px 0px var(--color-shadow)' }}>
                                    <LuClock className="w-4 h-4" />
                                    <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-cream dark:bg-navy border-2 border-charcoal/20 dark:border-cream/20 rounded-full h-2 mb-8">
                            <div 
                                className={`bg-charcoal dark:bg-cream h-2 transition-all duration-300`}
                                style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                            ></div>
                        </div>
                        
                        {/* Question Card */}
                        <div className="card-editorial p-8 mb-8">
                            <div className="flex items-start gap-4 mb-6">
                                <div className={`w-10 h-10 bg-charcoal dark:bg-cream rounded-md flex items-center justify-center flex-shrink-0`}>
                                    <LuBrain className="w-5 h-5 text-white dark:text-navy" />
                                </div>
                                <h2 className="text-xl font-display font-bold text-charcoal dark:text-cream leading-relaxed">
                                    {quizQuestions[currentQuestionIndex]?.question}
                                </h2>
                            </div>
                            
                            <div className="space-y-3">
                                {quizQuestions[currentQuestionIndex]?.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswerSelect(index)}
                                        className={`w-full text-left p-4 rounded-md border-2 transition-all duration-200 hover:-translate-y-1 cursor-pointer ${
                                            selectedAnswer === index
                                                ? `border-charcoal dark:border-cream/40 bg-charcoal dark:bg-cream text-white dark:text-navy`
                                                : 'border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream'
                                        }`}
                                        style={{ boxShadow: selectedAnswer === index ? '4px 4px 0px 0px var(--color-shadow)' : 'none' }}
                                        onMouseEnter={(e) => { if (selectedAnswer !== index) e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-shadow)'; }}
                                        onMouseLeave={(e) => { if (selectedAnswer !== index) e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                selectedAnswer === index
                                                    ? 'border-white dark:border-navy bg-charcoal dark:bg-cream'
                                                    : 'border-charcoal dark:border-cream/40'
                                            }`}>
                                                {selectedAnswer === index && <LuCheck className="w-4 h-4 text-white dark:text-navy" />}
                                            </div>
                                            <span className="font-bold">{option}</span>
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
                                className={`flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-wider text-sm rounded-md border-2 border-charcoal dark:border-cream/40 transition-all duration-300 ${
                                    selectedAnswer !== ''
                                        ? `bg-charcoal dark:bg-cream text-white dark:text-navy hover:-translate-y-1 cursor-pointer`
                                        : 'bg-white dark:bg-navy-light text-charcoal/50 dark:text-cream/50 cursor-not-allowed'
                                }`}
                                onMouseEnter={(e) => { if (selectedAnswer !== '') e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-shadow)'; }}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                            >
                                <span>{currentQuestionIndex === quizQuestions.length - 1 ? 'Submit Quiz' : 'Next Question'}</span>
                                <LuChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default PhaseQuizPage;
