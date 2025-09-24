import React, { useState, useEffect } from 'react';
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
    LuTrendingUp,
    LuCheck,
    LuSearch,
    LuFilter,
    LuGrid3X3,
    LuList,
    LuInfo,
    LuChevronDown,
    LuRotateCcw
} from 'react-icons/lu';
import { CODE_REVIEW_SCENARIOS } from '../../data/codeReviewScenarios';
import { getAllMultiFilePRs } from '../../data/multiFilePRScenarios';

const ScenarioSelector = () => {
    const navigate = useNavigate();
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [viewMode, setViewMode] = useState('grid');
    const [completedScenarios, setCompletedScenarios] = useState(new Set());
    const [scenarioScores, setScenarioScores] = useState({});

    const difficultyColors = {
        'Beginner': 'from-emerald-400 to-teal-400',
        'Intermediate': 'from-amber-400 to-orange-400', 
        'Advanced': 'from-rose-400 to-pink-400'
    };

    const difficultyColorsAccessible = {
        'Beginner': 'from-emerald-600 to-teal-600',
        'Intermediate': 'from-amber-600 to-orange-600',
        'Advanced': 'from-rose-600 to-pink-600'
    };

    const difficultyIcons = {
        'Beginner': <LuUser className="w-5 h-5" />,
        'Intermediate': <LuTarget className="w-5 h-5" />,
        'Advanced': <LuBrain className="w-5 h-5" />
    };

    // Load completion data from localStorage
    useEffect(() => {
        const savedCompletions = localStorage.getItem('codeReviewCompletions');
        const savedScores = localStorage.getItem('codeReviewScores');
        
        if (savedCompletions) {
            setCompletedScenarios(new Set(JSON.parse(savedCompletions)));
        }
        if (savedScores) {
            setScenarioScores(JSON.parse(savedScores));
        }
    }, []);

    const getAllScenarios = () => {
        const singleFileScenarios = [
            ...CODE_REVIEW_SCENARIOS.beginner,
            ...CODE_REVIEW_SCENARIOS.intermediate,
            ...CODE_REVIEW_SCENARIOS.advanced
        ];
        
        const multiFilePRs = getAllMultiFilePRs().map(pr => ({
            ...pr,
            type: 'multi-file',
            estimatedTime: pr.estimatedTime,
            tags: [...pr.tags, 'multi-file', 'pull-request']
        }));
        
        let allScenarios = [...singleFileScenarios, ...multiFilePRs];
        
        // Apply filters
        if (selectedDifficulty !== 'all') {
            allScenarios = allScenarios.filter(scenario => 
                scenario.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
            );
        }
        
        if (searchTerm) {
            allScenarios = allScenarios.filter(scenario =>
                scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                scenario.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                scenario.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        if (selectedTag) {
            allScenarios = allScenarios.filter(scenario =>
                scenario.tags?.includes(selectedTag)
            );
        }
        
        // Apply sorting
        switch (sortBy) {
            case 'difficulty-easy':
                allScenarios.sort((a, b) => {
                    const order = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
                    return order[a.difficulty] - order[b.difficulty];
                });
                break;
            case 'difficulty-hard':
                allScenarios.sort((a, b) => {
                    const order = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
                    return order[b.difficulty] - order[a.difficulty];
                });
                break;
            case 'time-short':
                allScenarios.sort((a, b) => {
                    const getMinutes = (time) => parseInt(time.split(' ')[0]);
                    return getMinutes(a.estimatedTime) - getMinutes(b.estimatedTime);
                });
                break;
            case 'time-long':
                allScenarios.sort((a, b) => {
                    const getMinutes = (time) => parseInt(time.split(' ')[0]);
                    return getMinutes(b.estimatedTime) - getMinutes(a.estimatedTime);
                });
                break;
            case 'latest':
            default:
                // Keep original order (latest first)
                break;
        }
        
        return allScenarios;
    };

    const getAllTags = () => {
        const allScenarios = [
            ...CODE_REVIEW_SCENARIOS.beginner,
            ...CODE_REVIEW_SCENARIOS.intermediate,
            ...CODE_REVIEW_SCENARIOS.advanced,
            ...getAllMultiFilePRs()
        ];
        
        const tags = new Set();
        allScenarios.forEach(scenario => {
            scenario.tags?.forEach(tag => tags.add(tag));
        });
        
        return Array.from(tags).sort();
    };

    const clearFilters = () => {
        setSelectedDifficulty('all');
        setSearchTerm('');
        setSelectedTag('');
        setSortBy('latest');
    };

    const startScenario = (scenario) => {
        if (scenario.type === 'multi-file') {
            navigate(`/multi-file-pr/${scenario.id}`);
        } else {
            navigate(`/code-review/${scenario.id}`);
        }
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

                            {/* Interactive Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <button
                                    onClick={() => setSelectedDifficulty('beginner')}
                                    className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center transition-all hover:bg-white/20 hover:scale-105 ${
                                        selectedDifficulty === 'beginner' ? 'ring-2 ring-white/50' : ''
                                    }`}
                                >
                                    <div className="text-2xl font-bold mb-1">
                                        {CODE_REVIEW_SCENARIOS.beginner.length}
                                    </div>
                                    <div className="text-sm text-white/80">Beginner</div>
                                </button>
                                <button
                                    onClick={() => setSelectedDifficulty('intermediate')}
                                    className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center transition-all hover:bg-white/20 hover:scale-105 ${
                                        selectedDifficulty === 'intermediate' ? 'ring-2 ring-white/50' : ''
                                    }`}
                                >
                                    <div className="text-2xl font-bold mb-1">
                                        {CODE_REVIEW_SCENARIOS.intermediate.length}
                                    </div>
                                    <div className="text-sm text-white/80">Intermediate</div>
                                </button>
                                <button
                                    onClick={() => setSelectedDifficulty('advanced')}
                                    className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center transition-all hover:bg-white/20 hover:scale-105 ${
                                        selectedDifficulty === 'advanced' ? 'ring-2 ring-white/50' : ''
                                    }`}
                                >
                                    <div className="text-2xl font-bold mb-1">
                                        {CODE_REVIEW_SCENARIOS.advanced.length + getAllMultiFilePRs().length}
                                    </div>
                                    <div className="text-sm text-white/80">Advanced</div>
                                </button>
                                <button
                                    onClick={() => setSelectedDifficulty('all')}
                                    className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center transition-all hover:bg-white/20 hover:scale-105 ${
                                        selectedDifficulty === 'all' ? 'ring-2 ring-white/50' : ''
                                    }`}
                                >
                                    <div className="text-2xl font-bold mb-1">
                                        {getAllScenarios().length}
                                    </div>
                                    <div className="text-sm text-white/80">Total</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 md:px-6 py-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Enhanced Filtering Section */}
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <LuFilter className="w-5 h-5 text-indigo-600" />
                                    <h2 className="text-xl font-semibold text-slate-800">Filters & Search</h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                        className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                                    >
                                        {viewMode === 'grid' ? <LuList className="w-4 h-4" /> : <LuGrid3X3 className="w-4 h-4" />}
                                        {viewMode === 'grid' ? 'List View' : 'Grid View'}
                                    </button>
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                                    >
                                        <LuRotateCcw className="w-4 h-4" />
                                        Clear All
                                    </button>
                                </div>
                            </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search scenarios..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            {/* Difficulty Filter */}
                            <div className="relative">
                                <select
                                    value={selectedDifficulty}
                                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                                >
                                    <option value="all">All Difficulties</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                                <LuChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>

                            {/* Tag Filter */}
                            <div className="relative">
                                <select
                                    value={selectedTag}
                                    onChange={(e) => setSelectedTag(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                                >
                                    <option value="">All Tags</option>
                                    {getAllTags().map(tag => (
                                        <option key={tag} value={tag}>{tag}</option>
                                    ))}
                                </select>
                                <LuChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>

                            {/* Sort Options */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                                >
                                    <option value="latest">Latest First</option>
                                    <option value="difficulty-easy">Easiest First</option>
                                    <option value="difficulty-hard">Hardest First</option>
                                    <option value="time-short">Shortest Time</option>
                                    <option value="time-long">Longest Time</option>
                                </select>
                                <LuChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>

                            {/* Results Count */}
                            <div className="mt-4 text-sm text-slate-600">
                                Showing {getAllScenarios().length} scenarios
                                {searchTerm && ` matching "${searchTerm}"`}
                                {selectedTag && ` tagged with "${selectedTag}"`}
                            </div>
                        </div>

                        {/* Scenarios Grid */}
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
                    {getAllScenarios().map(scenario => {
                        const isCompleted = completedScenarios.has(scenario.id);
                        const score = scenarioScores[scenario.id];
                        
                        return (
                            <div
                                key={scenario.id}
                                className={`bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden hover:shadow-xl transition-all duration-300 group relative ${
                                    isCompleted ? 'opacity-90' : ''
                                }`}
                            >
                                {/* Completion Badge */}
                                {isCompleted && (
                                    <div className="absolute top-4 right-4 z-10">
                                        <div className="flex items-center gap-1 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                            <LuCheck className="w-3 h-3" />
                                            {score ? `${score.overall}%` : 'Completed'}
                                        </div>
                                    </div>
                                )}

                                {/* Header */}
                                <div className={`bg-gradient-to-r ${difficultyColorsAccessible[scenario.difficulty]} p-6 text-white relative`}>
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
                                        {scenario.tags?.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                                                className={`px-2 py-1 text-xs rounded-md transition-colors hover:scale-105 ${
                                                    selectedTag === tag 
                                                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                {tag}
                                                {tag === 'multi-file' && (
                                                    <LuInfo className="w-3 h-3 inline ml-1" title="Advanced scenario simulating a real-world pull request with changes across multiple files" />
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-sm text-slate-600 mb-6">
                                        <div className="flex items-center gap-1">
                                            <LuTarget className="w-4 h-4" />
                                            <span>
                                                {scenario.type === 'multi-file' 
                                                    ? `${scenario.files?.length || 0} files` 
                                                    : `${scenario.codeBlocks?.[0]?.issues?.length || 0} issues`
                                                }
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <LuCode className="w-4 h-4" />
                                            <span>
                                                {scenario.type === 'multi-file' ? 'Multi-File PR' : scenario.language}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Score Display */}
                                    {score && (
                                        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-emerald-700 font-medium">Last Score:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-emerald-800 font-bold">{score.overall}%</span>
                                                    <span className="text-emerald-600">({score.issuesFound}/{score.totalIssues} issues)</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <button
                                        onClick={() => startScenario(scenario)}
                                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r ${difficultyColorsAccessible[scenario.difficulty]} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
                                    >
                                        <LuPlay className="w-4 h-4" />
                                        {isCompleted 
                                            ? (scenario.type === 'multi-file' ? 'Review PR Again' : 'Try Again') 
                                            : (scenario.type === 'multi-file' ? 'Review PR' : 'Start Review')
                                        }
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {getAllScenarios().length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LuCode className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">No scenarios found</h3>
                        <p className="text-slate-600">Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
    </div>
</DashboardLayout>
    );
};

export default ScenarioSelector;
