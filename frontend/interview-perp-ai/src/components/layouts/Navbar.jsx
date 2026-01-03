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
        <div className="bg-white/95 dark:bg-slate-900/95 border-b border-gray-200/50 dark:border-slate-700/50 backdrop-blur-md sticky top-0 z-30 transition-all duration-300">
            <div className="h-16 py-2.5 px-4 md:px-0">
                <div className="container mx-auto flex items-center justify-between gap-5">
                    <div className="flex items-center gap-8">
                        <Link to="/dashboard" className="group">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white leading-5 transition-colors duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                Interview Prep AI
                            </h2>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                        <NavLink 
                            to="/dashboard" 
                            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200"
                            style={({ isActive }) => isActive ? { 
                                color: '#4f46e5', 
                                backgroundColor: '#f1f5f9',
                                fontWeight: '500' 
                            } : undefined}
                        >
                            Dashboard
                        </NavLink>
                        <NavLink 
                            to="/progress" 
                            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200"
                            style={({ isActive }) => isActive ? { 
                                color: '#4f46e5', 
                                backgroundColor: '#f1f5f9',
                                fontWeight: '500' 
                            } : undefined}
                        >
                            Progress
                        </NavLink>
                        <NavLink 
                            to="/roadmap" 
                            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200"
                            style={({ isActive }) => isActive ? { 
                                color: '#4f46e5', 
                                backgroundColor: '#f1f5f9',
                                fontWeight: '500' 
                            } : undefined}
                        >
                            Roadmap
                        </NavLink>
                        <NavLink 
                            to="/code-review" 
                            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200"
                            style={({ isActive }) => isActive ? { 
                                color: '#4f46e5', 
                                backgroundColor: '#f1f5f9',
                                fontWeight: '500' 
                            } : undefined}
                        >
                            Code Review
                        </NavLink>
                        <NavLink 
                            to="/study-rooms" 
                            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 relative"
                            style={({ isActive }) => isActive ? { 
                                color: '#4f46e5', 
                                backgroundColor: '#f1f5f9',
                                fontWeight: '500' 
                            } : undefined}
                        >
                            Study Rooms
                            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                                NEW
                            </span>
                        </NavLink>
                        <NavLink 
                            to="/ai-interview-coach" 
                            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 relative"
                            style={({ isActive }) => isActive ? { 
                                color: '#4f46e5', 
                                backgroundColor: '#f1f5f9',
                                fontWeight: '500' 
                            } : undefined}
                        >
                            AI Coach
                            <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                                AI
                            </span>
                        </NavLink>
                        </nav>
                    </div>
                    
                    <div className="flex items-center gap-4">
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
                        <NavLink 
                            to="/study-rooms" 
                            className="block text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Study Rooms
                        </NavLink>
                        <NavLink 
                            to="/ai-interview-coach" 
                            className="block text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            AI Interview Coach
                        </NavLink>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Navbar;
