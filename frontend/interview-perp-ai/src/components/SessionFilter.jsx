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

    const selectClass = "w-full px-3 py-3 border-3 border-charcoal dark:border-cream/40 rounded-sm focus:outline-none bg-white dark:bg-navy-light text-charcoal dark:text-cream text-sm font-bold uppercase tracking-wider cursor-pointer appearance-none focus:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all";
    const labelClass = "flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-charcoal dark:text-cream mb-3";

    return (
        <div className="relative">
            {/* Enhanced Filter Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto flex-1 min-w-0">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <LuSearch className="h-4 w-4 text-charcoal dark:text-cream/60" strokeWidth={3} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search sessions..."
                            value={filters.searchTerm}
                            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                            className="block w-full pl-11 pr-4 py-3 border-3 border-charcoal dark:border-cream/40 rounded-sm text-sm font-bold placeholder-charcoal/40 dark:placeholder-cream/40 focus:outline-none bg-white dark:bg-navy-light text-charcoal dark:text-cream transition-all duration-200 focus:shadow-[4px_4px_0px_0px_var(--color-shadow)]"
                        />
                    </div>
                    
                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-navy-light border-3 border-charcoal dark:border-cream/40 rounded-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all duration-200 cursor-pointer flex-shrink-0"
                    >
                        <LuFilter className="w-4 h-4 text-charcoal dark:text-cream" strokeWidth={3} />
                        <span className="text-xs font-bold uppercase tracking-widest text-charcoal dark:text-cream">Filters</span>
                        {getActiveFilterCount() > 0 && (
                            <span className="bg-charcoal dark:bg-cream text-white dark:text-navy text-[10px] px-2 py-0.5 rounded-sm font-bold">
                                {getActiveFilterCount()}
                            </span>
                        )}
                    </button>
                </div>
                
                {/* Sort and Clear Options */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    <select
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onChange={(e) => {
                            const [sortBy, sortOrder] = e.target.value.split('-');
                            handleFilterChange('sortBy', sortBy);
                            handleFilterChange('sortOrder', sortOrder);
                        }}
                        className="flex-1 sm:flex-none px-4 py-3 border-3 border-charcoal dark:border-cream/40 rounded-sm focus:outline-none bg-white dark:bg-navy-light text-sm font-bold text-charcoal dark:text-cream transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] appearance-none"
                    >
                        <option value="lastUpdated-desc">Latest Updated</option>
                        <option value="lastUpdated-asc">Oldest Updated</option>
                        <option value="createdAt-desc">Newest Created</option>
                        <option value="createdAt-asc">Oldest Created</option>
                        <option value="proficiencyScore-desc">Proficiency (High)</option>
                        <option value="proficiencyScore-asc">Proficiency (Low)</option>
                        <option value="progressPercentage-desc">Progress (High)</option>
                        <option value="progressPercentage-asc">Progress (Low)</option>
                        <option value="role-asc">A → Z</option>
                        <option value="role-desc">Z → A</option>
                        <option value="questions-desc">Most Questions</option>
                        <option value="questions-asc">Least Questions</option>
                        <option value="averageRating-desc">Highest Rated</option>
                        <option value="averageRating-asc">Lowest Rated</option>
                    </select>

                    {getActiveFilterCount() > 0 && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest text-crimson border-2 border-crimson rounded-sm hover:bg-crimson hover:text-white transition-all duration-200 cursor-pointer flex-shrink-0"
                        >
                            <LuX className="w-4 h-4" strokeWidth={3} />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-charcoal/60 dark:bg-navy/80 backdrop-blur-sm z-[9998]"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white dark:bg-navy border-4 border-charcoal dark:border-cream/40 rounded-sm shadow-[12px_12px_0px_0px_#1A1A1A] dark:shadow-[12px_12px_0px_0px_var(--color-shadow)] z-[9999] mx-4 overflow-hidden">
                    
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-6 border-b-4 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy-light">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-charcoal dark:bg-cream"></div>
                            <h3 className="text-xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wider">Filter Sessions</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 border-2 border-charcoal dark:border-cream/40 hover:bg-charcoal hover:text-cream dark:hover:bg-cream dark:hover:text-navy transition-colors rounded-sm cursor-pointer"
                        >
                            <LuX className="w-5 h-5 text-charcoal dark:text-cream" strokeWidth={3} />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Experience Filter */}
                        <div>
                            <label className={labelClass}>
                                <div className="w-2 h-2 bg-charcoal dark:bg-cream"></div>
                                Experience
                            </label>
                            <select
                                value={filters.experience}
                                onChange={(e) => handleFilterChange('experience', e.target.value)}
                                className={selectClass}
                            >
                                <option value="">All</option>
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
                            <label className={labelClass}>
                                <div className="w-2 h-2 bg-charcoal dark:bg-cream"></div>
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className={selectClass}
                            >
                                <option value="">All</option>
                                <option value="Active">Active</option>
                                <option value="Completed">Completed</option>
                                <option value="Paused">Paused</option>
                            </select>
                        </div>

                        {/* Rating Filter */}
                        <div>
                            <label className={labelClass}>
                                <div className="w-2 h-2 bg-charcoal dark:bg-cream"></div>
                                Min Rating
                            </label>
                            <select
                                value={filters.minRating}
                                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                                className={selectClass}
                            >
                                <option value="">Any</option>
                                <option value="1">★ 1+</option>
                                <option value="2">★★ 2+</option>
                                <option value="3">★★★ 3+</option>
                                <option value="4">★★★★ 4+</option>
                                <option value="5">★★★★★ 5</option>
                            </select>
                        </div>

                        {/* Quick Filters */}
                        <div>
                            <label className={labelClass}>
                                <div className="w-2 h-2 bg-charcoal dark:bg-cream"></div>
                                Quick
                            </label>
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleFilterChange('status', 'Active')}
                                    className="w-full text-left px-3 py-2.5 text-xs font-bold uppercase tracking-widest bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 text-charcoal dark:text-cream rounded-sm hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all cursor-pointer"
                                >
                                    ● Active Sessions
                                </button>
                                <button
                                    onClick={() => handleFilterChange('minRating', '4')}
                                    className="w-full text-left px-3 py-2.5 text-xs font-bold uppercase tracking-widest bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 text-charcoal dark:text-cream rounded-sm hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all cursor-pointer"
                                >
                                    ★ High Rated (4+)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {getActiveFilterCount() > 0 && (
                        <div className="px-6 pb-6 pt-2 border-t-3 border-charcoal/20 dark:border-cream/20">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-widest text-charcoal/60 dark:text-cream/60">
                                    {getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? 's' : ''} active
                                </span>
                                <button
                                    onClick={clearFilters}
                                    className="text-xs font-bold uppercase tracking-widest text-crimson hover:underline transition-colors cursor-pointer"
                                >
                                    Clear all
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
