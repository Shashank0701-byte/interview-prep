import React, { useState } from 'react';
import { LuFilter, LuX, LuSearch, LuStar } from 'react-icons/lu';

const SessionFilter = ({ onFilterChange, activeFilters = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        experience: '',
        status: '',
        minRating: '',
        searchTerm: '',
        sortBy: 'lastUpdated',
        sortOrder: 'desc',
        ...activeFilters
    });

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const clearedFilters = {
            experience: '',
            status: '',
            minRating: '',
            searchTerm: '',
            sortBy: 'lastUpdated',
            sortOrder: 'desc'
        };
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    const getActiveFilterCount = () => {
        const { sortBy, sortOrder, ...filterableFields } = filters;
        return Object.values(filterableFields).filter(value => value !== '').length;
    };

    return (
        <div className="relative">
            {/* Enhanced Filter Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LuSearch className="h-4 w-4 text-[#1A1A1A]" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search sessions by role or topics..."
                            value={filters.searchTerm}
                            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                            className="block w-full pl-10 pr-4 py-3 border-2 border-[#1A1A1A] rounded-md text-sm placeholder-[#1A1A1A]/50 focus:outline-none bg-white text-[#1A1A1A] transition-all duration-200 font-bold"
                        />
                    </div>
                    
                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-[#1A1A1A] rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all duration-200 cursor-pointer"
                    >
                        <LuFilter className="w-4 h-4 text-[#1A1A1A]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Filters</span>
                        {getActiveFilterCount() > 0 && (
                            <span className="bg-[#1A1A1A] text-white text-[10px] px-2 py-0.5 rounded-sm font-bold">
                                {getActiveFilterCount()}
                            </span>
                        )}
                    </button>
                </div>
                
                {/* Sort and Clear Options */}
                <div className="flex items-center gap-3">
                    <select
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onChange={(e) => {
                            const [sortBy, sortOrder] = e.target.value.split('-');
                            handleFilterChange('sortBy', sortBy);
                            handleFilterChange('sortOrder', sortOrder);
                        }}
                        className="px-4 py-3 border-2 border-[#1A1A1A] rounded-md focus:outline-none bg-white text-sm font-bold text-[#1A1A1A] transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A]"
                    >
                        <option value="lastUpdated-desc">📅 Latest Updated</option>
                        <option value="lastUpdated-asc">📅 Oldest Updated</option>
                        <option value="createdAt-desc">🆕 Newest Created</option>
                        <option value="createdAt-asc">🗓️ Oldest Created</option>
                        <option value="proficiencyScore-desc">🎯 Proficiency Score (High to Low)</option>
                        <option value="proficiencyScore-asc">🎯 Proficiency Score (Low to High)</option>
                        <option value="progressPercentage-desc">📊 Progress % (High to Low)</option>
                        <option value="progressPercentage-asc">📊 Progress % (Low to High)</option>
                        <option value="role-asc">🔤 Alphabetical (A-Z)</option>
                        <option value="role-desc">🔤 Alphabetical (Z-A)</option>
                        <option value="questions-desc">📝 Most Questions</option>
                        <option value="questions-asc">📝 Least Questions</option>
                        <option value="averageRating-desc">⭐ Highest Rated</option>
                        <option value="averageRating-asc">⭐ Lowest Rated</option>
                    </select>

                    {getActiveFilterCount() > 0 && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider text-crimson hover:bg-crimson/10 rounded-md transition-all duration-200"
                        >
                            <LuX className="w-4 h-4" />
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] p-6 mx-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Filter Interview Sessions</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <LuX className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Experience Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Experience Level
                            </label>
                            <select
                                value={filters.experience}
                                onChange={(e) => handleFilterChange('experience', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="">All Experience</option>
                                <option value="0">Fresh Graduate</option>
                                <option value="1">1 Year</option>
                                <option value="2">2 Years</option>
                                <option value="3">3 Years</option>
                                <option value="4">4 Years</option>
                                <option value="5">5+ Years</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Session Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="">All Status</option>
                                <option value="Active">🟢 Active</option>
                                <option value="Completed">✅ Completed</option>
                                <option value="Paused">⏸️ Paused</option>
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

                        {/* Quick Filters */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quick Filters
                            </label>
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleFilterChange('status', 'Active')}
                                    className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                                >
                                    🟢 Active Sessions
                                </button>
                                <button
                                    onClick={() => handleFilterChange('minRating', '4')}
                                    className="w-full text-left px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                                >
                                    ⭐ High Rated (4+)
                                </button>
                            </div>
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
                </>
            )}
        </div>
    );
};

export default SessionFilter;
