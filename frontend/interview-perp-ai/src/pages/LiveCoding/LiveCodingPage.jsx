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
import { codingChallenges } from '../../data/codingChallenges';

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

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-500/10 border-green-500 text-green-600 dark:text-green-400';
            case 'Medium': return 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400';
            case 'Hard': return 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400';
            default: return 'bg-charcoal/10 border-charcoal text-charcoal dark:text-cream';
        }
    };

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
            <div className="min-h-screen bg-cream dark:bg-navy py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="bg-white dark:bg-navy-light text-charcoal dark:text-cream rounded-sm shadow-[4px_4px_0px_0px_var(--color-shadow)] border-4 border-charcoal dark:border-cream/40 p-8 mb-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 border-3 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy rounded-sm flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                    <LuCode className="w-6 h-6 text-charcoal dark:text-cream" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-wider">Live Coding Challenges</h1>
                                    <p className="text-charcoal/70 dark:text-cream/80 text-sm mt-1.5 font-body leading-relaxed max-w-2xl">
                                        Practice algorithmic problems with instantaneous AI assessment on code correctness, efficiency metrics, and structural styling.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Dashboard Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-dashed border-charcoal/10 dark:border-cream/10">
                            {[
                                { icon: LuTarget, value: codingChallenges.length, label: 'Available Challenges' },
                                { icon: LuBrain, value: 'AI Engine', label: 'Automated Review' },
                                { icon: LuZap, value: 'Real-time', label: 'Evaluation Metrics' },
                                { icon: LuTrendingUp, value: 'Big O', label: 'Complexity Analysis' }
                            ].map((stat, idx) => {
                                const IconComp = stat.icon;
                                return (
                                    <div key={idx} className="bg-cream dark:bg-navy rounded-sm p-4 border-2 border-charcoal dark:border-cream/25 shadow-[2px_2px_0px_0px_var(--color-shadow)] flex items-center gap-3.5">
                                        <IconComp className="w-8 h-8 text-charcoal/60 dark:text-cream/60 flex-shrink-0" strokeWidth={2} />
                                        <div>
                                            <div className="text-lg font-mono font-bold text-charcoal dark:text-cream">{stat.value}</div>
                                            <div className="text-charcoal/50 dark:text-cream/50 font-mono font-bold uppercase tracking-wider text-[9px] mt-0.5">{stat.label}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Filters bar */}
                    <div className="card-editorial p-6 mb-8 bg-white dark:bg-navy-light">
                        <div className="flex items-center gap-2 mb-4 border-b border-dashed border-charcoal/15 dark:border-cream/10 pb-3 bg-cream dark:bg-navy p-3 rounded-sm">
                            <LuFilter className="w-4 h-4 text-charcoal dark:text-cream" strokeWidth={2.5} />
                            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-charcoal dark:text-cream">Filter Challenges Workspace</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/40 dark:text-cream/40 w-4 h-4" strokeWidth={2.5} />
                                <input
                                    type="text"
                                    placeholder="Search challenge titles..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border-2 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy text-charcoal dark:text-cream font-bold text-xs rounded-sm outline-none focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
                                />
                            </div>

                            {/* Difficulty select */}
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                className="px-4 py-2 border-2 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy text-charcoal dark:text-cream font-mono font-bold text-xs rounded-sm outline-none cursor-pointer focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
                            >
                                {difficulties.map(difficulty => (
                                    <option key={difficulty} value={difficulty}>
                                        {difficulty === 'All' ? 'All Difficulties' : `${difficulty} Difficulty`}
                                    </option>
                                ))}
                            </select>

                            {/* Category select */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 border-2 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy text-charcoal dark:text-cream font-mono font-bold text-xs rounded-sm outline-none cursor-pointer focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
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
                            <div key={challenge.id} className="card-editorial bg-white dark:bg-navy-light flex flex-col justify-between">
                                {/* Card Header */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-2xl flex-shrink-0">{getCategoryIcon(challenge.category)}</span>
                                            <div className="min-w-0">
                                                <h3 className="text-lg font-display font-bold text-charcoal dark:text-cream truncate">
                                                    {challenge.title}
                                                </h3>
                                                <div className="text-[10px] font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-wider capitalize mt-0.5">
                                                    {challenge.category.replace('-', ' ')}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className={`px-2 py-0.5 border-2 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)] ${getDifficultyColor(challenge.difficulty)}`}>
                                            {challenge.difficulty}
                                        </div>
                                    </div>

                                    <p className="text-charcoal/70 dark:text-cream/70 font-body text-xs font-medium line-clamp-3 leading-relaxed mb-5">
                                        {challenge.description}
                                    </p>

                                    {/* Challenge Stats */}
                                    <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-widest border-t border-dashed border-charcoal/10 dark:border-cream/10 pt-4">
                                        <div className="flex items-center gap-1">
                                            <LuClock className="w-3.5 h-3.5" />
                                            <span>Time: O({challenge.expectedComplexity})</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <LuTarget className="w-3.5 h-3.5" />
                                            <span>{challenge.testCases.length} Test cases</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="px-6 pb-6">
                                    <button
                                        onClick={() => startChallenge(challenge.id)}
                                        className="w-full flex items-center justify-center gap-2 bg-charcoal text-white dark:bg-cream dark:text-navy font-mono font-bold uppercase tracking-widest text-[10px] py-2.5 px-4 rounded-sm border-3 border-charcoal dark:border-cream hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-shadow)] cursor-pointer"
                                    >
                                        <LuPlay className="w-4 h-4" strokeWidth={3} />
                                        <span>Start Challenge</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredChallenges.length === 0 && (
                        <div className="card-editorial p-12 text-center bg-white dark:bg-navy-light max-w-xl mx-auto my-12 flex flex-col items-center">
                            <div className="w-14 h-14 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm flex items-center justify-center mb-5 shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                <LuSearch className="w-6 h-6 text-charcoal dark:text-cream" />
                            </div>
                            <h3 className="text-xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide mb-2">No challenges found</h3>
                            <p className="text-charcoal/60 dark:text-cream/60 mb-6 text-sm font-medium leading-relaxed">
                                No coding challenges match your search filters. Try clearing inputs or resetting tags.
                            </p>
                            <button
                                onClick={() => {
                                    setSelectedDifficulty('All');
                                    setSelectedCategory('All');
                                    setSearchTerm('');
                                }}
                                className="px-5 py-2.5 bg-charcoal text-white dark:bg-cream dark:text-navy border-3 border-charcoal dark:border-cream py-2 rounded-sm font-mono font-bold uppercase tracking-widest text-[10px] hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-shadow)] cursor-pointer"
                            >
                                Reset Search Parameters
                            </button>
                        </div>
                    )}

                    {/* Highlights Cards */}
                    <div className="mt-16 card-editorial p-8 bg-white dark:bg-navy-light">
                        <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wider text-center mb-10">
                            Challenge Framework Guidelines
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { icon: LuBrain, title: 'AI Code Analysis', desc: 'Acquire structural evaluation feedback assessing runtime efficiency, edge-case logic, and naming styling conventions.' },
                                { icon: LuZap, title: 'Real-time Evaluation', desc: 'Instantly view validation outputs and automated unit test indicators as you iterate code blocks.' },
                                { icon: LuTrendingUp, title: 'Complexity Feedback', desc: 'Understand algorithmic optimization metrics with dedicated Big-O time and space reviews.' }
                            ].map((highlight, idx) => {
                                const IconComp = highlight.icon;
                                return (
                                    <div key={idx} className="text-center flex flex-col items-center">
                                        <div className="w-12 h-12 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/30 rounded-sm flex items-center justify-center mb-4 shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                            <IconComp className="w-5 h-5 text-charcoal dark:text-cream" strokeWidth={2.5} />
                                        </div>
                                        <h3 className="text-sm font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wider mb-2">{highlight.title}</h3>
                                        <p className="text-charcoal/60 dark:text-cream/60 font-body text-xs font-medium leading-relaxed max-w-xs">
                                            {highlight.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LiveCodingPage;
