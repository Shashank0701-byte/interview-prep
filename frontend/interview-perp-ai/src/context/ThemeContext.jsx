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
    // Force light mode as default - clear any existing theme
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            // Clear localStorage to reset theme
            localStorage.removeItem('theme');
            localStorage.setItem('theme', 'light');
            
            // Force remove dark class
            document.documentElement.classList.remove('dark');
            document.documentElement.className = document.documentElement.className.replace(/\bdark\b/g, '').trim();
            
            console.log('Theme initialized: LIGHT mode forced');
            return false;
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

    // Listen for system theme changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e) => {
                // Only auto-switch if user hasn't manually set a preference
                const savedTheme = localStorage.getItem('theme');
                if (!savedTheme) {
                    setIsDarkMode(e.matches);
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
        setIsDarkMode(theme === 'dark');
    };

    const value = {
        isDarkMode,
        toggleTheme,
        setTheme,
        theme: isDarkMode ? 'dark' : 'light'
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
