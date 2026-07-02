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
            case 'Easy': return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
            case 'Medium': return 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200';
            case 'Hard': return 'bg-slate-300 dark:bg-slate-500 text-slate-900 dark:text-slate-100';
            default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
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
            <div className="min-h-screen bg-cream dark:bg-navy py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="bg-charcoal dark:bg-navy-light text-white dark:text-cream rounded-md shadow-[6px_6px_0px_0px_rgba(26,26,26,0.3)] dark:shadow-[6px_6px_0px_0px_var(--color-shadow)] border-2 border-transparent dark:border-cream/40 p-8 mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-white/20 dark:bg-navy-input/50 rounded-sm flex items-center justify-center">
                                <LuCode className="w-6 h-6 text-white dark:text-cream" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-display font-bold">Live Coding Challenges</h1>
                                <p className="text-slate-300 dark:text-cream/80 mt-2">
                                    Practice coding with instant AI feedback on correctness, efficiency, and code style
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                            <div className="bg-white/10 dark:bg-navy-input/50 rounded-lg p-4 backdrop-blur-sm border-2 border-transparent dark:border-cream/20">
                                <div className="flex items-center gap-3">
                                    <LuTarget className="w-8 h-8 text-slate-300 dark:text-cream/80" />
                                    <div>
                                        <div className="text-2xl font-bold">{codingChallenges.length}</div>
                                        <div className="text-slate-300 dark:text-cream/80 text-sm">Total Challenges</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white/10 dark:bg-navy-input/50 rounded-lg p-4 backdrop-blur-sm border-2 border-transparent dark:border-cream/20">
                                <div className="flex items-center gap-3">
                                    <LuBrain className="w-8 h-8 text-slate-300 dark:text-cream/80" />
                                    <div>
                                        <div className="text-2xl font-bold">AI</div>
                                        <div className="text-slate-300 dark:text-cream/80 text-sm">Code Review</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white/10 dark:bg-navy-input/50 rounded-lg p-4 backdrop-blur-sm border-2 border-transparent dark:border-cream/20">
                                <div className="flex items-center gap-3">
                                    <LuZap className="w-8 h-8 text-slate-300 dark:text-cream/80" />
                                    <div>
                                        <div className="text-2xl font-bold">Real-time</div>
                                        <div className="text-slate-300 dark:text-cream/80 text-sm">Feedback</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white/10 dark:bg-navy-input/50 rounded-lg p-4 backdrop-blur-sm border-2 border-transparent dark:border-cream/20">
                                <div className="flex items-center gap-3">
                                    <LuTrendingUp className="w-8 h-8 text-slate-300 dark:text-cream/80" />
                                    <div>
                                        <div className="text-2xl font-bold">Big O</div>
                                        <div className="text-slate-300 dark:text-cream/80 text-sm">Analysis</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="card-editorial p-6 mb-8">
                        <div className="flex items-center gap-2 mb-4 border-b-2 border-charcoal/10 dark:border-cream/10 pb-2">
                            <LuFilter className="w-5 h-5 text-charcoal dark:text-cream" />
                            <h2 className="text-lg font-display font-bold text-charcoal dark:text-cream">Filter Challenges</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/40 dark:text-cream/40 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search challenges..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream font-body rounded-sm focus:outline-none shadow-[2px_2px_0px_0px_#1A1A1A] dark:shadow-[2px_2px_0px_0px_var(--color-shadow)]"
                                />
                            </div>

                            {/* Difficulty Filter */}
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                className="px-4 py-2 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream font-body rounded-sm focus:outline-none shadow-[2px_2px_0px_0px_#1A1A1A] dark:shadow-[2px_2px_0px_0px_var(--color-shadow)]"
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
                                className="px-4 py-2 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream font-body rounded-sm focus:outline-none shadow-[2px_2px_0px_0px_#1A1A1A] dark:shadow-[2px_2px_0px_0px_var(--color-shadow)]"
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
                            <div key={challenge.id} className="card-editorial flex flex-col justify-between">
                                {/* Card Header */}
                                <div className="p-6 pb-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{getCategoryIcon(challenge.category)}</span>
                                            <div>
                                                <h3 className="text-lg font-display font-bold text-charcoal dark:text-cream line-clamp-1">
                                                    {challenge.title}
                                                </h3>
                                                <div className="text-sm font-body text-charcoal/80 dark:text-cream/80 capitalize">
                                                    {challenge.category.replace('-', ' ')}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className={`px-2 py-1 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light rounded-sm text-xs font-bold uppercase tracking-wider text-charcoal dark:text-cream shadow-[2px_2px_0px_0px_#1A1A1A] dark:shadow-[2px_2px_0px_0px_var(--color-shadow)]`}>
                                            {challenge.difficulty}
                                        </div>
                                    </div>

                                    <p className="text-charcoal/80 dark:text-cream/80 font-body text-sm line-clamp-3 mb-4">
                                        {challenge.description}
                                    </p>

                                    {/* Challenge Stats */}
                                    <div className="flex items-center gap-4 text-xs font-bold text-charcoal dark:text-cream uppercase tracking-wider mb-4">
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
                                        className="w-full flex items-center justify-center gap-2 bg-charcoal dark:bg-cream text-white dark:text-navy font-bold uppercase tracking-wider text-sm py-3 px-4 rounded-sm border-2 border-charcoal dark:border-cream hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all duration-200"
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
                        <div className="card-editorial p-12 text-center">
                            <div className="w-16 h-16 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm flex items-center justify-center mx-auto mb-4">
                                <LuSearch className="w-8 h-8 text-charcoal dark:text-cream" />
                            </div>
                            <h3 className="text-lg font-display font-bold text-charcoal dark:text-cream mb-2">No challenges found</h3>
                            <p className="text-charcoal/80 dark:text-cream/80 mb-4 font-medium">
                                Try adjusting your filters or search term to find more challenges.
                            </p>
                            <button
                                onClick={() => {
                                    setSelectedDifficulty('All');
                                    setSelectedCategory('All');
                                    setSearchTerm('');
                                }}
                                className="px-6 py-2 border-2 border-charcoal dark:border-cream bg-charcoal dark:bg-cream text-white dark:text-navy rounded-sm font-bold uppercase tracking-wider hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {/* Feature Highlights */}
                    <div className="mt-12 card-editorial p-8">
                        <h2 className="text-3xl font-display font-bold text-charcoal mb-6 text-center">
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
