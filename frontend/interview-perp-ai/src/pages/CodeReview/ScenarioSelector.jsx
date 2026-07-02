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
        'Beginner': 'from-slate-500 to-slate-600',
        'Intermediate': 'from-slate-600 to-slate-700', 
        'Advanced': 'from-slate-700 to-slate-800'
    };

    const difficultyColorsAccessible = {
        'Beginner': 'from-slate-600 to-slate-700',
        'Intermediate': 'from-slate-700 to-slate-800',
        'Advanced': 'from-slate-800 to-slate-900'
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
            <div className="min-h-screen bg-cream dark:bg-navy pb-12">
                {/* Header */}
                <div className="text-charcoal dark:text-cream">
                    <div className="container mx-auto px-4 md:px-6 py-8">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex items-center gap-4 mb-6">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="p-2 hover:bg-charcoal/5 dark:hover:bg-cream/5 rounded-md transition-colors"
                                >
                                    <LuArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-charcoal dark:bg-cream text-white dark:text-navy rounded-md flex items-center justify-center">
                                        <LuCode className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-display font-bold">Code Review Scenarios</h1>
                                        <p className="text-charcoal/80 dark:text-cream/80 font-body">Choose your challenge level</p>
                                    </div>
                                </div>
                            </div>

                            {/* Interactive Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                                <button
                                    onClick={() => setSelectedDifficulty('beginner')}
                                    className={`p-4 text-center cursor-pointer border-2 border-charcoal dark:border-cream/40 transition-all duration-200 rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] ${
                                        selectedDifficulty === 'beginner' ? 'bg-charcoal dark:bg-cream text-white dark:text-navy shadow-[4px_4px_0px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_0px_var(--color-shadow)] -translate-y-1' : 'bg-transparent text-charcoal dark:text-cream'
                                    }`}
                                >
                                    <div className="text-2xl font-bold mb-1">
                                        {CODE_REVIEW_SCENARIOS.beginner.length}
                                    </div>
                                    <div className="text-sm uppercase tracking-wider font-bold text-inherit">Beginner</div>
                                </button>
                                <button
                                    onClick={() => setSelectedDifficulty('intermediate')}
                                    className={`p-4 text-center cursor-pointer border-2 border-charcoal dark:border-cream/40 transition-all duration-200 rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] ${
                                        selectedDifficulty === 'intermediate' ? 'bg-charcoal dark:bg-cream text-white dark:text-navy shadow-[4px_4px_0px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_0px_var(--color-shadow)] -translate-y-1' : 'bg-transparent text-charcoal dark:text-cream'
                                    }`}
                                >
                                    <div className="text-2xl font-bold mb-1">
                                        {CODE_REVIEW_SCENARIOS.intermediate.length}
                                    </div>
                                    <div className="text-sm uppercase tracking-wider font-bold text-inherit">Intermediate</div>
                                </button>
                                <button
                                    onClick={() => setSelectedDifficulty('advanced')}
                                    className={`p-4 text-center cursor-pointer border-2 border-charcoal dark:border-cream/40 transition-all duration-200 rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] ${
                                        selectedDifficulty === 'advanced' ? 'bg-charcoal dark:bg-cream text-white dark:text-navy shadow-[4px_4px_0px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_0px_var(--color-shadow)] -translate-y-1' : 'bg-transparent text-charcoal dark:text-cream'
                                    }`}
                                >
                                    <div className="text-2xl font-bold mb-1">
                                        {CODE_REVIEW_SCENARIOS.advanced.length + getAllMultiFilePRs().length}
                                    </div>
                                    <div className="text-sm uppercase tracking-wider font-bold text-inherit">Advanced</div>
                                </button>
                                <button
                                    onClick={() => setSelectedDifficulty('all')}
                                    className={`p-4 text-center cursor-pointer border-2 border-charcoal dark:border-cream/40 transition-all duration-200 rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] ${
                                        selectedDifficulty === 'all' ? 'bg-charcoal dark:bg-cream text-white dark:text-navy shadow-[4px_4px_0px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_0px_var(--color-shadow)] -translate-y-1' : 'bg-transparent text-charcoal dark:text-cream'
                                    }`}
                                >
                                    <div className="text-2xl font-bold mb-1">
                                        {getAllScenarios().length}
                                    </div>
                                    <div className="text-sm uppercase tracking-wider font-bold text-inherit">Total</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 md:px-6 py-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Enhanced Filtering Section */}
                        <div className="mb-8 border-b-2 border-charcoal/10 dark:border-cream/10 pb-6 pt-2">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                                <div className="flex items-center gap-3">
                                    <LuFilter className="w-5 h-5 text-charcoal dark:text-cream" />
                                    <h2 className="text-2xl font-display font-semibold text-charcoal dark:text-cream">Filters & Search</h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                        className="flex items-center gap-2 px-3 py-2 text-charcoal/70 dark:text-cream/70 hover:text-charcoal dark:hover:text-cream transition-colors"
                                    >
                                        {viewMode === 'grid' ? <LuList className="w-4 h-4" /> : <LuGrid3X3 className="w-4 h-4" />}
                                        {viewMode === 'grid' ? 'List View' : 'Grid View'}
                                    </button>
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-2 px-3 py-2 text-charcoal/70 dark:text-cream/70 hover:text-charcoal dark:hover:text-cream transition-colors"
                                    >
                                        <LuRotateCcw className="w-4 h-4" />
                                        Clear All
                                    </button>
                                </div>
                            </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-charcoal/50 dark:text-cream/50" />
                                <input
                                    type="text"
                                    placeholder="Search scenarios..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream rounded-md outline-none focus:outline-none transition-colors font-bold placeholder-charcoal/50 dark:placeholder-cream/50"
                                />
                            </div>

                            {/* Difficulty Filter */}
                            <div className="relative">
                                <select
                                    value={selectedDifficulty}
                                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream rounded-md outline-none focus:outline-none font-bold transition-all duration-200 appearance-none cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)]"
                                >
                                    <option value="all">All Difficulties</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                                <LuChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-charcoal dark:text-cream pointer-events-none" />
                            </div>

                            {/* Tag Filter */}
                            <div className="relative">
                                <select
                                    value={selectedTag}
                                    onChange={(e) => setSelectedTag(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream rounded-md outline-none focus:outline-none font-bold transition-all duration-200 appearance-none cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)]"
                                >
                                    <option value="">All Tags</option>
                                    {getAllTags().map(tag => (
                                        <option key={tag} value={tag}>{tag}</option>
                                    ))}
                                </select>
                                <LuChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-charcoal dark:text-cream pointer-events-none" />
                            </div>

                            {/* Sort Options */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream rounded-md outline-none focus:outline-none font-bold transition-all duration-200 appearance-none cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)]"
                                >
                                    <option value="latest">Latest First</option>
                                    <option value="difficulty-easy">Easiest First</option>
                                    <option value="difficulty-hard">Hardest First</option>
                                    <option value="time-short">Shortest Time</option>
                                    <option value="time-long">Longest Time</option>
                                </select>
                                <LuChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-charcoal dark:text-cream pointer-events-none" />
                            </div>

                            {/* Results Count */}
                            <div className="mt-4 text-sm text-charcoal/70 dark:text-cream/70">
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
                                className={`card-editorial relative flex flex-col ${
                                    isCompleted ? 'opacity-90' : ''
                                }`}
                            >
                                {/* Completion Badge */}
                                {isCompleted && (
                                    <div className="absolute top-4 right-4 z-10">
                                        <div className="flex items-center gap-1 bg-charcoal dark:bg-cream text-white dark:text-navy px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider">
                                            <LuCheck className="w-3 h-3" />
                                            {score ? `${score.overall}%` : 'Completed'}
                                        </div>
                                    </div>
                                )}

                                {/* Header */}
                                <div className="bg-charcoal dark:bg-navy-input border-b-2 border-charcoal dark:border-cream/40 p-6 text-white dark:text-cream relative flex-shrink-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
                                            {difficultyIcons[scenario.difficulty]}
                                            <span>{scenario.difficulty}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm font-bold tracking-wider">
                                            <LuClock className="w-4 h-4" />
                                            {scenario.estimatedTime}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-display mb-2">{scenario.title}</h3>
                                    <p className="text-white/80 dark:text-cream/80 text-sm font-body">{scenario.description}</p>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-grow flex flex-col">
                                    <div className="flex items-center gap-2 text-sm text-charcoal dark:text-cream font-bold uppercase tracking-wider mb-4">
                                        <LuUser className="w-4 h-4" />
                                        <span>by {scenario.author}</span>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {scenario.tags?.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                                                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 rounded-md transition-all ${
                                                    selectedTag === tag 
                                                        ? 'bg-charcoal dark:bg-cream text-white dark:text-navy border-charcoal dark:border-cream/40' 
                                                        : 'bg-transparent text-charcoal dark:text-cream border-charcoal/20 dark:border-cream/20 hover:border-charcoal/50 dark:hover:border-cream/50'
                                                }`}
                                            >
                                                {tag}
                                                {tag === 'multi-file' && (
                                                    <LuInfo className="w-3 h-3 inline ml-1" title="Advanced scenario simulating a real-world pull request with changes across multiple files" />
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex-grow"></div>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-sm text-charcoal dark:text-cream font-bold uppercase tracking-wider mb-6 pt-4 border-t-2 border-charcoal/10 dark:border-cream/10">
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
                                        <div className="mb-4 p-3 bg-white dark:bg-navy-light border-2 border-charcoal/20 dark:border-cream/20 rounded-md">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-charcoal dark:text-cream font-bold uppercase tracking-wider text-xs">Last Score:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-charcoal dark:text-cream font-bold">{score.overall}%</span>
                                                    <span className="text-charcoal/60 dark:text-cream/60 font-bold text-xs">({score.issuesFound}/{score.totalIssues} issues)</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <button
                                        onClick={() => startScenario(scenario)}
                                        className="btn-primary"
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
                        <div className="w-16 h-16 bg-charcoal/5 dark:bg-cream/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LuCode className="w-8 h-8 text-charcoal/40 dark:text-cream/40" />
                        </div>
                        <h3 className="text-lg font-semibold text-charcoal dark:text-cream mb-2">No scenarios found</h3>
                        <p className="text-charcoal/70 dark:text-cream/70">Try adjusting your filters or search terms.</p>
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
