import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { 
    LuCode, 
    LuPlay, 
    LuBrain, 
    LuZap, 
    LuTrendingUp,
    LuClock,
    LuTarget,
    LuFilter,
    LuSearch
} from 'react-icons/lu';
import { codingChallenges, getChallengesByDifficulty, getChallengesByCategory } from '../../data/codingChallenges';

const LiveCodingPage = () => {
    const navigate = useNavigate();
    
    // State for filtering
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Get unique categories and difficulties
    const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
    const categories = ['All', ...new Set(codingChallenges.map(c => c.category))];

    // Filter challenges
    const filteredChallenges = codingChallenges.filter(challenge => {
        const matchesDifficulty = selectedDifficulty === 'All' || challenge.difficulty === selectedDifficulty;
        const matchesCategory = selectedCategory === 'All' || challenge.category === selectedCategory;
        const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesDifficulty && matchesCategory && matchesSearch;
    });

    // Get difficulty color
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-100 text-green-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Hard': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Get category icon
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'arrays': return '📊';
            case 'strings': return '📝';
            case 'trees': return '🌳';
            case 'stacks': return '📚';
            case 'dynamic-programming': return '🧮';
            case 'design': return '🏗️';
            default: return '💻';
        }
    };

    const startChallenge = (challengeId) => {
        navigate(`/live-coding/${challengeId}`);
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg p-8 mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <LuCode className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Live Coding Challenges</h1>
                                <p className="text-indigo-100 mt-2">
                                    Practice coding with instant AI feedback on correctness, efficiency, and code style
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <LuTarget className="w-8 h-8 text-indigo-200" />
                                    <div>
                                        <div className="text-2xl font-bold">{codingChallenges.length}</div>
                                        <div className="text-indigo-200 text-sm">Total Challenges</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <LuBrain className="w-8 h-8 text-purple-200" />
                                    <div>
                                        <div className="text-2xl font-bold">AI</div>
                                        <div className="text-purple-200 text-sm">Code Review</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <LuZap className="w-8 h-8 text-yellow-200" />
                                    <div>
                                        <div className="text-2xl font-bold">Real-time</div>
                                        <div className="text-yellow-200 text-sm">Feedback</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <LuTrendingUp className="w-8 h-8 text-green-200" />
                                    <div>
                                        <div className="text-2xl font-bold">Big O</div>
                                        <div className="text-green-200 text-sm">Analysis</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <LuFilter className="w-5 h-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-800">Filter Challenges</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search challenges..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* Difficulty Filter */}
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {difficulties.map(difficulty => (
                                    <option key={difficulty} value={difficulty}>
                                        {difficulty === 'All' ? 'All Difficulties' : difficulty}
                                    </option>
                                ))}
                            </select>

                            {/* Category Filter */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category === 'All' ? 'All Categories' : category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Challenge Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredChallenges.map((challenge) => (
                            <div key={challenge.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                {/* Card Header */}
                                <div className="p-6 pb-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{getCategoryIcon(challenge.category)}</span>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
                                                    {challenge.title}
                                                </h3>
                                                <div className="text-sm text-gray-500 capitalize">
                                                    {challenge.category.replace('-', ' ')}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                                            {challenge.difficulty}
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                        {challenge.description}
                                    </p>

                                    {/* Challenge Stats */}
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                        <div className="flex items-center gap-1">
                                            <LuClock className="w-3 h-3" />
                                            <span>O({challenge.expectedComplexity})</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <LuTarget className="w-3 h-3" />
                                            <span>{challenge.testCases.length} tests</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="px-6 pb-6">
                                    <button
                                        onClick={() => startChallenge(challenge.id)}
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                                    >
                                        <LuPlay className="w-4 h-4" />
                                        Start Challenge
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredChallenges.length === 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LuSearch className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">No challenges found</h3>
                            <p className="text-gray-600 mb-4">
                                Try adjusting your filters or search term to find more challenges.
                            </p>
                            <button
                                onClick={() => {
                                    setSelectedDifficulty('All');
                                    setSelectedCategory('All');
                                    setSearchTerm('');
                                }}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {/* Feature Highlights */}
                    <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                            Why Live Coding Challenges?
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <LuBrain className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Code Review</h3>
                                <p className="text-gray-600 text-sm">
                                    Get instant feedback on correctness, efficiency, and code style from our advanced AI system.
                                </p>
                            </div>
                            
                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <LuZap className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Real-time Feedback</h3>
                                <p className="text-gray-600 text-sm">
                                    See your code analyzed in real-time with detailed Big O complexity analysis and suggestions.
                                </p>
                            </div>
                            
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <LuTrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Skill Progression</h3>
                                <p className="text-gray-600 text-sm">
                                    Progress from easy to hard challenges with personalized hints and detailed explanations.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LiveCodingPage;
