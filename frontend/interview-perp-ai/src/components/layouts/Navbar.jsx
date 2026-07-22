import React, { useState } from 'react';
import ProfileInfoCard from "../Cards/ProfileInfoCard";
import { Link, NavLink } from "react-router-dom";
import DarkModeToggle from "../ui/DarkModeToggle";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const navLinkClass = "text-xs font-semibold uppercase tracking-widest px-3 py-2 rounded-sm transition-all duration-200";
    
    return (
        <div className="border-b-4 border-charcoal dark:border-cream/40 sticky top-0 z-50 bg-cream dark:bg-navy transition-all duration-300">
            <div className="h-16 py-2.5 px-4 md:px-0">
                <div className="container mx-auto flex items-center justify-between gap-5">
                    <div className="flex items-center gap-8">
                        <Link to="/dashboard" className="group flex items-center gap-2.5">
                            <div className="w-6 h-6 flex items-center justify-center">
                                <img
                                    src="/favicon.png"
                                    alt="Interview Prep AI"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            <h2 className="text-xl md:text-2xl font-display font-bold leading-5 text-charcoal dark:text-cream transition-colors duration-300">
                                Interview Prep AI
                            </h2>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-2">
                        <NavLink 
                            to="/dashboard" 
                            className={({ isActive }) => `${navLinkClass} ${isActive ? 'font-bold text-charcoal dark:text-cream border-b-4 border-charcoal dark:border-cream !rounded-none' : 'text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream'}`}
                        >
                            Dashboard
                        </NavLink>
                        <NavLink 
                            to="/progress" 
                            className={({ isActive }) => `${navLinkClass} ${isActive ? 'font-bold text-charcoal dark:text-cream border-b-4 border-charcoal dark:border-cream !rounded-none' : 'text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream'}`}
                        >
                            Progress
                        </NavLink>
                        <NavLink 
                            to="/roadmap" 
                            className={({ isActive }) => `${navLinkClass} ${isActive ? 'font-bold text-charcoal dark:text-cream border-b-4 border-charcoal dark:border-cream !rounded-none' : 'text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream'}`}
                        >
                            Roadmap
                        </NavLink>
                        <NavLink 
                            to="/code-review" 
                            className={({ isActive }) => `${navLinkClass} ${isActive ? 'font-bold text-charcoal dark:text-cream border-b-4 border-charcoal dark:border-cream !rounded-none' : 'text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream'}`}
                        >
                            Code Review
                        </NavLink>
                        <NavLink 
                            to="/study-rooms" 
                            className={({ isActive }) => `${navLinkClass} ${isActive ? 'font-bold text-charcoal dark:text-cream border-b-4 border-charcoal dark:border-cream !rounded-none' : 'text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream'}`}
                        >
                            <span className="flex items-center gap-1.5">
                                Study Rooms
                                <span className="bg-crimson text-white text-[8px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider leading-none">
                                    NEW
                                </span>
                            </span>
                        </NavLink>
                        <NavLink 
                            to="/ai-interview-coach" 
                            className={({ isActive }) => `${navLinkClass} ${isActive ? 'font-bold text-charcoal dark:text-cream border-b-4 border-charcoal dark:border-cream !rounded-none' : 'text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream'}`}
                        >
                            <span className="flex items-center gap-1.5">
                                AI Coach
                                <span className="bg-charcoal dark:bg-cream text-white dark:text-navy text-[8px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider leading-none">
                                    AI
                                </span>
                            </span>
                        </NavLink>
                        </nav>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <DarkModeToggle size="small" />
                        <div className="hidden md:block">
                            <ProfileInfoCard />
                        </div>
                        
                        {/* Mobile menu button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden p-2 rounded-sm border-2 border-charcoal dark:border-cream/40 text-charcoal dark:text-cream focus:outline-none transition-colors hover:bg-charcoal/10 dark:hover:bg-cream/10"
                            aria-label="Toggle mobile menu"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t-4 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy transition-colors duration-300">
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
                                className={({ isActive }) => `block text-sm font-semibold uppercase tracking-widest transition-colors py-2 px-3 rounded-sm ${isActive ? 'font-bold text-charcoal dark:text-cream bg-charcoal/10 dark:bg-cream/10 border-l-4 border-charcoal dark:border-cream' : 'text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream hover:bg-charcoal/5 dark:hover:bg-cream/5'}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                        
                        {/* Profile Info inside mobile menu drawer */}
                        <div className="border-t-2 border-charcoal/10 dark:border-cream/10 pt-4 mt-4 px-3">
                            <ProfileInfoCard />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Navbar;
