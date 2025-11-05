import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Initialize theme from localStorage or default to light
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            // Check if user has a saved preference
            const savedTheme = localStorage.getItem('theme');
            
            if (savedTheme) {
                // Use saved preference
                const isDark = savedTheme === 'dark';
                console.log('Theme initialized from localStorage:', savedTheme);
                
                // Apply the saved theme to DOM immediately
                if (isDark) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                
                return isDark;
            } else {
                // No saved preference, default to light mode
                localStorage.setItem('theme', 'light');
                document.documentElement.classList.remove('dark');
                console.log('Theme initialized: Default LIGHT mode');
                return false;
            }
        }
        return false;
    });

    // Update localStorage and document class when theme changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            
            // Add/remove dark class from document root
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [isDarkMode]);

    // Additional effect to ensure sync on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const currentClass = document.documentElement.classList.contains('dark');
            if (currentClass !== isDarkMode) {
                if (isDarkMode) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        }
    }, []);

    // Listen for system theme changes (only if no user preference exists)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e) => {
                // Only auto-switch if user hasn't manually set a preference
                const savedTheme = localStorage.getItem('theme');
                if (!savedTheme || savedTheme === 'system') {
                    setIsDarkMode(e.matches);
                    console.log('System theme changed to:', e.matches ? 'dark' : 'light');
                }
            };

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            
            // Immediately update DOM
            if (typeof window !== 'undefined') {
                if (newMode) {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                    console.log('Theme toggled to: DARK');
                } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.className = document.documentElement.className.replace(/\bdark\b/g, '').trim();
                    localStorage.setItem('theme', 'light');
                    console.log('Theme toggled to: LIGHT');
                }
            }
            
            return newMode;
        });
    };

    const setTheme = (theme) => {
        const isDark = theme === 'dark';
        setIsDarkMode(isDark);
        
        // Update localStorage and DOM immediately
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', theme);
            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            console.log('Theme set to:', theme);
        }
    };

    const resetTheme = () => {
        // Reset to system preference or light mode
        if (typeof window !== 'undefined') {
            localStorage.removeItem('theme');
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(systemPrefersDark);
            
            if (systemPrefersDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            console.log('Theme reset to system preference:', systemPrefersDark ? 'dark' : 'light');
        }
    };

    const value = {
        isDarkMode,
        toggleTheme,
        setTheme,
        resetTheme,
        theme: isDarkMode ? 'dark' : 'light'
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
