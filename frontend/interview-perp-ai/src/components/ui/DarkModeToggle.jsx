import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { LuSun, LuMoon } from 'react-icons/lu';

const DarkModeToggle = ({ className = "", size = "default" }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleToggle = () => {
        toggleTheme();
    };

    if (!mounted) {
        return null;
    }

    return (
        <button
            onClick={handleToggle}
            className={`
                relative inline-flex items-center justify-center
                w-14 h-7 rounded-sm transition-all duration-300 ease-in-out
                border-2 cursor-pointer
                hover:-translate-y-0.5
                focus:outline-none
                ${className}
            `}
            style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
            }}
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        >
            {/* Sliding Circle */}
            <div
                className={`
                    absolute flex items-center justify-center
                    w-5 h-5 rounded-sm transition-all duration-300 ease-in-out transform
                    ${isDarkMode ? 'translate-x-3' : '-translate-x-3'}
                `}
                style={{
                    backgroundColor: 'var(--color-text)',
                }}
            >
                <div className="transition-all duration-300 transform">
                    {isDarkMode ? (
                        <LuMoon className="w-3 h-3" style={{ color: 'var(--color-bg)' }} />
                    ) : (
                        <LuSun className="w-3 h-3" style={{ color: 'var(--color-bg)' }} />
                    )}
                </div>
            </div>
        </button>
    );
};

export default DarkModeToggle;
