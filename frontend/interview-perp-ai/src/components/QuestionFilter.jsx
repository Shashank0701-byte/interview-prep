import React, { useState } from 'react';
import { LuFilter, LuX, LuSearch, LuStar } from 'react-icons/lu';

const QuestionFilter = ({ onFilterChange, activeFilters = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        difficulty: '',
        interviewType: '',
        probability: '',
        isPinned: '',
        isMastered: '',
        minRating: '',
        searchTerm: '',
        ...activeFilters
    });

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const clearedFilters = {
            difficulty: '',
            interviewType: '',
            probability: '',
            isPinned: '',
            isMastered: '',
            minRating: '',
            searchTerm: ''
        };
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    const getActiveFilterCount = () => {
        return Object.values(filters).filter(value => value !== '').length;
    };

    return (
        <div className="relative mb-6">
            {/* Filter Toggle Button */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                >
                    <LuFilter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filter Cards</span>
                    {getActiveFilterCount() > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            {getActiveFilterCount()}
                        </span>
                    )}
                </button>

                {/* Quick Search */}
                <div className="flex-1 max-w-md relative">
                    <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        placeholder="Search questions..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>

                {getActiveFilterCount() > 0 && (
                    <button
                        onClick={clearFilters}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Filter Panel */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-full max-w-4xl bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Filter Question Cards</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <LuX className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Difficulty Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Difficulty Level
                            </label>
                            <select
                                value={filters.difficulty}
                                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="">All Levels</option>
                                <option value="Easy">🟢 Easy</option>
                                <option value="Medium">🟡 Medium</option>
                                <option value="Hard">🔴 Hard</option>
                            </select>
                        </div>

                        {/* Interview Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Interview Type
                            </label>
                            <select
                                value={filters.interviewType}
                                onChange={(e) => handleFilterChange('interviewType', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="">All Types</option>
                                <option value="Technical">💻 Technical</option>
                                <option value="Behavioral">🤝 Behavioral</option>
                                <option value="System Design">🏗️ System Design</option>
                                <option value="Coding">⌨️ Coding</option>
                                <option value="General">📋 General</option>
                            </select>
                        </div>

                        {/* Probability Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Interview Probability
                            </label>
                            <select
                                value={filters.probability}
                                onChange={(e) => handleFilterChange('probability', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="">All Probabilities</option>
                                <option value="Very High">🔥 Very High</option>
                                <option value="High">📈 High</option>
                                <option value="Medium">📊 Medium</option>
                                <option value="Low">📉 Low</option>
                            </select>
                        </div>

                        {/* Rating Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Rating
                            </label>
                            <select
                                value={filters.minRating}
                                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="">Any Rating</option>
                                <option value="1">⭐ 1+ Stars</option>
                                <option value="2">⭐⭐ 2+ Stars</option>
                                <option value="3">⭐⭐⭐ 3+ Stars</option>
                                <option value="4">⭐⭐⭐⭐ 4+ Stars</option>
                                <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                            </select>
                        </div>
                    </div>

                    {/* Status Filters */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Card Status
                        </label>
                        <div className="flex flex-wrap gap-3">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="pinned"
                                    value=""
                                    checked={filters.isPinned === ''}
                                    onChange={(e) => handleFilterChange('isPinned', e.target.value)}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">All Cards</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="pinned"
                                    value="true"
                                    checked={filters.isPinned === 'true'}
                                    onChange={(e) => handleFilterChange('isPinned', e.target.value)}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">📌 Pinned Only</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="mastered"
                                    value=""
                                    checked={filters.isMastered === ''}
                                    onChange={(e) => handleFilterChange('isMastered', e.target.value)}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">All Progress</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="mastered"
                                    value="true"
                                    checked={filters.isMastered === 'true'}
                                    onChange={(e) => handleFilterChange('isMastered', e.target.value)}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">✅ Mastered</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="mastered"
                                    value="false"
                                    checked={filters.isMastered === 'false'}
                                    onChange={(e) => handleFilterChange('isMastered', e.target.value)}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">📚 Still Learning</span>
                            </label>
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {getActiveFilterCount() > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    {getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? 's' : ''} active
                                </span>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuestionFilter;
