import React, { useState } from 'react';
import ProfileInfoCard from "../Cards/ProfileInfoCard";
import { Link, NavLink } from "react-router-dom";
import DarkModeToggle from "../ui/DarkModeToggle";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Style for the active NavLink
    const activeLinkStyle = {
        color: '#4f46e5', // A nice indigo color for the active link
        fontWeight: '500',
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="bg-white dark:bg-slate-900 border-b border-gray-200/80 dark:border-slate-700/80 backdrop-blur-[2px] sticky top-0 z-30 transition-colors duration-300">
            <div className="h-16 py-2.5 px-4 md:px-0">
                <div className="container mx-auto flex items-center justify-between gap-5">
                    <div className="flex items-center gap-8">
                        <Link to="/dashboard">
                            <h2 className="text-lg md:text-xl font-medium text-black dark:text-white leading-5 transition-colors duration-300">
                                Interview Prep AI
                            </h2>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-6">
                        <NavLink 
                            to="/dashboard" 
                            className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                        >
                            Dashboard
                        </NavLink>
                        <NavLink 
                            to="/progress" 
                            className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                        >
                            My Progress
                        </NavLink>
                        <NavLink 
                            to="/roadmap" 
                            className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                        >
                            Learning Roadmap
                        </NavLink>
                        <NavLink 
                            to="/code-review" 
                            className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                        >
                            Code Review
                        </NavLink>
                        <NavLink 
                            to="/resume-builder" 
                            className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                        >
                            Resume Builder
                        </NavLink>
                        <NavLink 
                            to="/live-coding" 
                            className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                        >
                            Live Coding
                        </NavLink>
                        </nav>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {/* Temporary test to verify dark mode is working */}
                        <div className="px-2 py-1 text-xs rounded bg-white dark:bg-slate-800 text-black dark:text-white border border-gray-300 dark:border-slate-600">
                            {typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'DARK' : 'LIGHT'}
                        </div>
                        <DarkModeToggle size="small" />
                        <ProfileInfoCard />
                        
                        {/* Mobile menu button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                            aria-label="Toggle mobile menu"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 transition-colors duration-300">
                    <div className="px-4 py-3 space-y-3">
                        <NavLink 
                            to="/dashboard" 
                            className="block text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Dashboard
                        </NavLink>
                        <NavLink 
                            to="/progress" 
                            className="block text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            My Progress
                        </NavLink>
                        <NavLink 
                            to="/roadmap" 
                            className="block text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Learning Roadmap
                        </NavLink>
                        <NavLink 
                            to="/code-review" 
                            className="block text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Code Review
                        </NavLink>
                        <NavLink 
                            to="/resume-builder" 
                            className="block text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Resume Builder
                        </NavLink>
                        <NavLink 
                            to="/live-coding" 
                            className="block text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Live Coding
                        </NavLink>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Navbar;
