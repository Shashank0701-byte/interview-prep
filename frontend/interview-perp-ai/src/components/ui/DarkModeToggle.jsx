import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { LuSun, LuMoon } from 'react-icons/lu';

const DarkModeToggle = ({ className = "", size = "default" }) => {
    const { isDarkMode, toggleTheme } = useTheme();

    const sizeClasses = {
        small: "w-12 h-6",
        default: "w-14 h-7",
        large: "w-16 h-8"
    };

    const iconSizeClasses = {
        small: "w-3 h-3",
        default: "w-4 h-4", 
        large: "w-5 h-5"
    };

    const handleToggle = () => {
        toggleTheme();
    };

    return (
        <button
            onClick={handleToggle}
            className={`
                relative inline-flex items-center justify-center
                ${sizeClasses[size]}
                rounded-full transition-all duration-300 ease-in-out
                ${isDarkMode 
                    ? 'bg-gradient-to-r from-slate-700 to-slate-800 shadow-inner' 
                    : 'bg-gradient-to-r from-blue-100 to-indigo-100 shadow-sm'
                }
                hover:shadow-lg transform hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isDarkMode 
                    ? 'focus:ring-slate-500 focus:ring-offset-slate-900' 
                    : 'focus:ring-blue-500 focus:ring-offset-white'
                }
                border-2 transition-colors duration-300
                ${isDarkMode 
                    ? 'border-slate-600 hover:border-slate-500' 
                    : 'border-blue-200 hover:border-blue-300'
                }
                ${className}
            `}
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        >
            {/* Background Track */}
            <div className={`
                absolute inset-1 rounded-full transition-all duration-300
                ${isDarkMode 
                    ? 'bg-gradient-to-r from-slate-800 to-slate-900' 
                    : 'bg-gradient-to-r from-white to-blue-50'
                }
            `} />
            
            {/* Sliding Circle */}
            <div className={`
                relative z-10 flex items-center justify-center
                ${size === 'small' ? 'w-5 h-5' : size === 'large' ? 'w-7 h-7' : 'w-6 h-6'}
                rounded-full transition-all duration-300 ease-in-out transform
                ${isDarkMode 
                    ? 'translate-x-3 bg-gradient-to-br from-slate-300 to-slate-100 shadow-lg' 
                    : '-translate-x-3 bg-gradient-to-br from-yellow-300 to-orange-300 shadow-md'
                }
                ${isDarkMode ? 'rotate-180' : 'rotate-0'}
            `}>
                {/* Icon */}
                <div className={`
                    transition-all duration-300 transform
                    ${isDarkMode 
                        ? 'text-slate-700 scale-100' 
                        : 'text-orange-600 scale-100'
                    }
                `}>
                    {isDarkMode ? (
                        <LuMoon className={`${iconSizeClasses[size]} drop-shadow-sm`} />
                    ) : (
                        <LuSun className={`${iconSizeClasses[size]} drop-shadow-sm`} />
                    )}
                </div>
            </div>

            {/* Glow Effect */}
            <div className={`
                absolute inset-0 rounded-full transition-opacity duration-300
                ${isDarkMode 
                    ? 'bg-slate-400/20 opacity-0 hover:opacity-100' 
                    : 'bg-yellow-300/30 opacity-0 hover:opacity-100'
                }
                blur-sm
            `} />
        </button>
    );
};

export default DarkModeToggle;
