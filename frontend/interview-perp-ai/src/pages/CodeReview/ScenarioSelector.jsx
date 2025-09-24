import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { 
    LuCode, 
    LuClock, 
    LuStar,
    LuArrowLeft,
    LuTarget,
    LuBrain,
    LuUser,
    LuPlay,
    LuTrendingUp
} from 'react-icons/lu';
import { CODE_REVIEW_SCENARIOS } from '../../data/codeReviewScenarios';

const ScenarioSelector = () => {
    const navigate = useNavigate();
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');

    const difficultyColors = {
        'Beginner': 'from-emerald-500 to-teal-500',
        'Intermediate': 'from-orange-500 to-amber-500',
        'Advanced': 'from-red-500 to-pink-500'
    };

    const difficultyIcons = {
        'Beginner': <LuUser className="w-5 h-5" />,
        'Intermediate': <LuTarget className="w-5 h-5" />,
        'Advanced': <LuBrain className="w-5 h-5" />
    };

    const getAllScenarios = () => {
        const allScenarios = [
            ...CODE_REVIEW_SCENARIOS.beginner,
            ...CODE_REVIEW_SCENARIOS.intermediate,
            ...CODE_REVIEW_SCENARIOS.advanced
        ];
        
        if (selectedDifficulty === 'all') {
            return allScenarios;
        }
        
        return allScenarios.filter(scenario => 
            scenario.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
        );
    };

    const startScenario = (scenarioId) => {
        navigate(`/code-review/${scenarioId}`);
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <div className="container mx-auto px-4 md:px-6 py-8">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex items-center gap-4 mb-6">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <LuArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <LuCode className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold">Code Review Scenarios</h1>
                                        <p className="text-white/80">Choose your challenge level</p>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                                    <div className="text-2xl font-bold mb-1">{CODE_REVIEW_SCENARIOS.beginner.length}</div>
                                    <div className="text-sm text-white/80">Beginner</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                                    <div className="text-2xl font-bold mb-1">{CODE_REVIEW_SCENARIOS.intermediate.length}</div>
                                    <div className="text-sm text-white/80">Intermediate</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                                    <div className="text-2xl font-bold mb-1">{CODE_REVIEW_SCENARIOS.advanced.length}</div>
                                    <div className="text-sm text-white/80">Advanced</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                                    <div className="text-2xl font-bold mb-1">{getAllScenarios().length}</div>
                                    <div className="text-sm text-white/80">Total Scenarios</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 md:px-6 py-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Difficulty Filter */}
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 mb-8">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Filter by Difficulty</h2>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setSelectedDifficulty('all')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                        selectedDifficulty === 'all'
                                            ? 'bg-indigo-600 text-white shadow-lg'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    All Levels
                                </button>
                                {['Beginner', 'Intermediate', 'Advanced'].map(difficulty => (
                                    <button
                                        key={difficulty}
                                        onClick={() => setSelectedDifficulty(difficulty)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                            selectedDifficulty === difficulty
                                                ? 'bg-indigo-600 text-white shadow-lg'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {difficultyIcons[difficulty]}
                                        {difficulty}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scenarios Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {getAllScenarios().map(scenario => (
                                <div
                                    key={scenario.id}
                                    className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                                >
                                    {/* Header */}
                                    <div className={`bg-gradient-to-r ${difficultyColors[scenario.difficulty]} p-6 text-white`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {difficultyIcons[scenario.difficulty]}
                                                <span className="text-sm font-medium">{scenario.difficulty}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm">
                                                <LuClock className="w-4 h-4" />
                                                {scenario.estimatedTime}
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{scenario.title}</h3>
                                        <p className="text-white/90 text-sm">{scenario.description}</p>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                                            <LuUser className="w-4 h-4" />
                                            <span>by {scenario.author}</span>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {scenario.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center justify-between text-sm text-slate-600 mb-6">
                                            <div className="flex items-center gap-1">
                                                <LuTarget className="w-4 h-4" />
                                                <span>{scenario.codeBlocks[0].issues.length} issues</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <LuCode className="w-4 h-4" />
                                                <span>{scenario.language}</span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => startScenario(scenario.id)}
                                            className={`w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r ${difficultyColors[scenario.difficulty]} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
                                        >
                                            <LuPlay className="w-4 h-4" />
                                            Start Review
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {getAllScenarios().length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <LuCode className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">No scenarios found</h3>
                                <p className="text-slate-600">Try selecting a different difficulty level.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ScenarioSelector;
