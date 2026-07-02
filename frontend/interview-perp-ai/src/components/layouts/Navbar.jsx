import React, { useState } from 'react';
import ProfileInfoCard from "../Cards/ProfileInfoCard";
import { Link, NavLink } from "react-router-dom";
import DarkModeToggle from "../ui/DarkModeToggle";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const navLinkClass = "text-xs font-semibold uppercase tracking-[0.1em] text-[#1A1A1A]/60 hover:text-[#1A1A1A] px-3 py-2 rounded-md hover:bg-[#1A1A1A]/5 transition-all duration-200";
    const activeStyle = {
        color: '#1A1A1A',
        fontWeight: '700',
        borderBottom: '2px solid #1A1A1A',
        borderRadius: '0',
    };

    return (
        <div className="bg-[#F5F0E8] border-b-2 border-[#1A1A1A] sticky top-0 z-50 transition-all duration-300 dark:bg-slate-900 dark:border-slate-700">
            <div className="h-16 py-2.5 px-4 md:px-0">
                <div className="container mx-auto flex items-center justify-between gap-5">
                    <div className="flex items-center gap-8">
                        <Link to="/dashboard" className="group">
                            <h2 className="text-xl md:text-2xl font-display font-normal text-[#1A1A1A] dark:text-white leading-5 transition-colors duration-300">
                                Interview Prep AI
                            </h2>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                        <NavLink 
                            to="/dashboard" 
                            className={navLinkClass}
                            style={({ isActive }) => isActive ? activeStyle : undefined}
                        >
                            Dashboard
                        </NavLink>
                        <NavLink 
                            to="/progress" 
                            className={navLinkClass}
                            style={({ isActive }) => isActive ? activeStyle : undefined}
                        >
                            Progress
                        </NavLink>
                        <NavLink 
                            to="/roadmap" 
                            className={navLinkClass}
                            style={({ isActive }) => isActive ? activeStyle : undefined}
                        >
                            Roadmap
                        </NavLink>
                        <NavLink 
                            to="/code-review" 
                            className={navLinkClass}
                            style={({ isActive }) => isActive ? activeStyle : undefined}
                        >
                            Code Review
                        </NavLink>
                        <NavLink 
                            to="/study-rooms" 
                            className={`${navLinkClass} relative`}
                            style={({ isActive }) => isActive ? activeStyle : undefined}
                        >
                            Study Rooms
                            <span className="absolute -top-1 -right-1 bg-[#DC2626] text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                                NEW
                            </span>
                        </NavLink>
                        <NavLink 
                            to="/ai-interview-coach" 
                            className={`${navLinkClass} relative`}
                            style={({ isActive }) => isActive ? activeStyle : undefined}
                        >
                            AI Coach
                            <span className="absolute -top-1 -right-1 bg-[#1A1A1A] text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">
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
                            className="md:hidden p-2 rounded-md text-[#1A1A1A] dark:text-gray-300 hover:bg-[#1A1A1A]/5 dark:hover:bg-slate-800 focus:outline-none transition-colors"
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
                <div className="md:hidden bg-cream dark:bg-slate-900 border-t-2 border-charcoal dark:border-slate-700 transition-colors duration-300">
                    <div className="px-4 py-3 space-y-1">
                        {[
                            { to: '/dashboard', label: 'Dashboard' },
                            { to: '/progress', label: 'Progress' },
                            { to: '/roadmap', label: 'Roadmap' },
                            { to: '/code-review', label: 'Code Review' },
                            { to: '/resume-builder', label: 'Resume Builder' },
                            { to: '/live-coding', label: 'Live Coding' },
                            { to: '/study-rooms', label: 'Study Rooms' },
                            { to: '/ai-interview-coach', label: 'AI Coach' },
                        ].map(link => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className="block text-sm font-semibold uppercase tracking-wider text-charcoal/60 dark:text-slate-300 hover:text-charcoal dark:hover:text-white transition-colors py-2 px-2 rounded-md hover:bg-charcoal/5"
                                style={({ isActive }) => isActive ? { color: '#1A1A1A', fontWeight: '700' } : undefined}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Navbar;
