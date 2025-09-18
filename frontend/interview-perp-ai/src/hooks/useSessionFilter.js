import { useState, useMemo } from 'react';

export const useSessionFilter = (sessions = []) => {
    const [filters, setFilters] = useState({
        experience: '',
        status: '',
        minRating: '',
        searchTerm: '',
        sortBy: 'lastUpdated',
        sortOrder: 'desc'
    });

    const filteredAndSortedSessions = useMemo(() => {
        if (!sessions || sessions.length === 0) return [];

        let filtered = sessions.filter(session => {
            // Search term filter
            if (filters.searchTerm) {
                const searchLower = filters.searchTerm.toLowerCase();
                const roleText = session.role?.toLowerCase() || '';
                const topicsText = session.topicsToFocus?.toLowerCase() || '';
                const descriptionText = session.description?.toLowerCase() || '';
                
                if (!roleText.includes(searchLower) && 
                    !topicsText.includes(searchLower) && 
                    !descriptionText.includes(searchLower)) {
                    return false;
                }
            }

            // Experience filter
            if (filters.experience) {
                const sessionExp = session.experience?.toString();
                if (filters.experience === '5' && parseInt(sessionExp) < 5) {
                    return false;
                } else if (filters.experience !== '5' && sessionExp !== filters.experience) {
                    return false;
                }
            }

            // Status filter
            if (filters.status && session.status !== filters.status) {
                return false;
            }

            // Rating filter
            if (filters.minRating) {
                const minRating = parseFloat(filters.minRating);
                const userRating = session.userRating || { overall: 3, difficulty: 3, usefulness: 3 };
                const avgRating = (userRating.overall + userRating.difficulty + userRating.usefulness) / 3;
                if (avgRating < minRating) {
                    return false;
                }
            }

            return true;
        });

        // Sort the filtered results
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (filters.sortBy) {
                case 'role':
                    aValue = a.role?.toLowerCase() || '';
                    bValue = b.role?.toLowerCase() || '';
                    break;
                case 'questions':
                    aValue = a.questions?.length || 0;
                    bValue = b.questions?.length || 0;
                    break;
                case 'createdAt':
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
                    break;
                case 'lastUpdated':
                default:
                    aValue = new Date(a.updatedAt);
                    bValue = new Date(b.updatedAt);
                    break;
            }

            if (filters.sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [sessions, filters]);

    const updateFilters = (newFilters) => {
        setFilters(newFilters);
    };

    const clearFilters = () => {
        setFilters({
            experience: '',
            status: '',
            minRating: '',
            searchTerm: '',
            sortBy: 'lastUpdated',
            sortOrder: 'desc'
        });
    };

    const getFilterStats = () => {
        const total = sessions.length;
        const filtered = filteredAndSortedSessions.length;
        const activeFilters = Object.entries(filters)
            .filter(([key, value]) => key !== 'sortBy' && key !== 'sortOrder' && value !== '')
            .length;
        
        return {
            total,
            filtered,
            activeFilters,
            isFiltered: activeFilters > 0
        };
    };

    return {
        filters,
        filteredSessions: filteredAndSortedSessions,
        updateFilters,
        clearFilters,
        getFilterStats
    };
};

export default useSessionFilter;
