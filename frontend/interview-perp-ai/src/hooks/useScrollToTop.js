import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to automatically scroll to top on route changes
 * @param {boolean} smooth - Whether to use smooth scrolling (default: true)
 * @param {Array} dependencies - Additional dependencies to trigger scroll (optional)
 */
export const useScrollToTop = (smooth = true, dependencies = []) => {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }, [location.pathname, smooth, ...dependencies]);
};

/**
 * Function to manually scroll to top
 * @param {boolean} smooth - Whether to use smooth scrolling (default: true)
 */
export const scrollToTop = (smooth = true) => {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: smooth ? 'smooth' : 'auto'
    });
};

export default useScrollToTop;
