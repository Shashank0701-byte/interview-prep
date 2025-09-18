import { useState, useMemo } from 'react';

export const useQuestionFilter = (questions = []) => {
    const [filters, setFilters] = useState({
        difficulty: '',
        interviewType: '',
        probability: '',
        isPinned: '',
        isMastered: '',
        minRating: '',
        searchTerm: ''
    });

    const filteredQuestions = useMemo(() => {
        if (!questions || questions.length === 0) return [];

        return questions.filter(question => {
            // Search term filter
            if (filters.searchTerm) {
                const searchLower = filters.searchTerm.toLowerCase();
                const questionText = question.question?.toLowerCase() || '';
                const answerText = question.answer?.toLowerCase() || '';
                if (!questionText.includes(searchLower) && !answerText.includes(searchLower)) {
                    return false;
                }
            }

            // Difficulty filter
            if (filters.difficulty && question.difficulty !== filters.difficulty) {
                return false;
            }

            // Interview type filter
            if (filters.interviewType && question.justification?.interviewType !== filters.interviewType) {
                return false;
            }

            // Probability filter
            if (filters.probability && question.justification?.probability !== filters.probability) {
                return false;
            }

            // Pinned filter
            if (filters.isPinned !== '') {
                const isPinned = filters.isPinned === 'true';
                if (question.isPinned !== isPinned) {
                    return false;
                }
            }

            // Mastered filter
            if (filters.isMastered !== '') {
                const isMastered = filters.isMastered === 'true';
                if (question.isMastered !== isMastered) {
                    return false;
                }
            }

            // Rating filter
            if (filters.minRating) {
                const minRating = parseFloat(filters.minRating);
                const userRating = question.userRating || { difficulty: 3, usefulness: 3, clarity: 3 };
                const avgRating = (userRating.difficulty + userRating.usefulness + userRating.clarity) / 3;
                if (avgRating < minRating) {
                    return false;
                }
            }

            return true;
        });
    }, [questions, filters]);

    const updateFilters = (newFilters) => {
        setFilters(newFilters);
    };

    const clearFilters = () => {
        setFilters({
            difficulty: '',
            interviewType: '',
            probability: '',
            isPinned: '',
            isMastered: '',
            minRating: '',
            searchTerm: ''
        });
    };

    const getFilterStats = () => {
        const total = questions.length;
        const filtered = filteredQuestions.length;
        const activeFilters = Object.values(filters).filter(value => value !== '').length;
        
        return {
            total,
            filtered,
            activeFilters,
            isFiltered: activeFilters > 0
        };
    };

    return {
        filters,
        filteredQuestions,
        updateFilters,
        clearFilters,
        getFilterStats
    };
};

export default useQuestionFilter;
