import React, { useState } from 'react';
import ProfileInfoCard from "../Cards/ProfileInfoCard";
import { Link, NavLink } from "react-router-dom";
import DarkModeToggle from "../ui/DarkModeToggle";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const navLinkClass = "text-xs font-semibold uppercase tracking-[0.1em] px-3 py-2 rounded-md transition-all duration-200";
    
    return (
        <div className="border-b-2 sticky top-0 z-50 transition-all duration-300" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
            <div className="h-16 py-2.5 px-4 md:px-0">
                <div className="container mx-auto flex items-center justify-between gap-5">
                    <div className="flex items-center gap-8">
                        <Link to="/dashboard" className="group">
                            <h2 className="text-xl md:text-2xl font-display font-normal leading-5 transition-colors duration-300" style={{ color: 'var(--color-text)' }}>
                                Interview Prep AI
                            </h2>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                        <NavLink 
                            to="/dashboard" 
                            className={({ isActive }) => `${navLinkClass} ${isActive ? 'font-bold' : ''}`}
                            style={({ isActive }) => ({
                                color: isActive ? 'var(--color-text)' : 'var(--color-text-secondary)',
                                borderBottom: isActive ? '2px solid var(--color-text)' : 'none',
                                borderRadius: isActive ? '0' : undefined,
                            })}
                        >
                            Dashboard
                        </NavLink>
                        <NavLink 
                            to="/progress" 
                            className={({ isActive }) => `${navLinkClass} ${isActive ? 'font-bold' : ''}`}
                            style={({ isActive }) => ({
                                color: isActive ? 'var(--color-text)' : 'var(--color-text-secondary)',
                                borderBottom: isActive ? '2px solid var(--color-text)' : 'none',
                                borderRadius: isActive ? '0' : undefined,
                            })}
                        >
                            Progress
                        </NavLink>
                        <NavLink 
                            to="/roadmap" 
                            className={({ isActive }) => `${navLinkClass} ${isActive ? 'font-bold' : ''}`}
                            style={({ isActive }) => ({
                                color: isActive ? 'var(--color-text)' : 'var(--color-text-secondary)',
                                borderBottom: isActive ? '2px solid var(--color-text)' : 'none',
                                borderRadius: isActive ? '0' : undefined,
                            })}
                        >
                            Roadmap
                        </NavLink>
                        <NavLink 
                            to="/code-review" 
                            className={({ isActive }) => `${navLinkClass} ${isActive ? 'font-bold' : ''}`}
                            style={({ isActive }) => ({
                                color: isActive ? 'var(--color-text)' : 'var(--color-text-secondary)',
                                borderBottom: isActive ? '2px solid var(--color-text)' : 'none',
                                borderRadius: isActive ? '0' : undefined,
                            })}
                        >
                            Code Review
                        </NavLink>
                        <NavLink 
                            to="/study-rooms" 
                            className={({ isActive }) => `${navLinkClass} relative ${isActive ? 'font-bold' : ''}`}
                            style={({ isActive }) => ({
                                color: isActive ? 'var(--color-text)' : 'var(--color-text-secondary)',
                                borderBottom: isActive ? '2px solid var(--color-text)' : 'none',
                                borderRadius: isActive ? '0' : undefined,
                            })}
                        >
                            Study Rooms
                            <span className="absolute -top-1 -right-1 bg-crimson text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                                NEW
                            </span>
                        </NavLink>
                        <NavLink 
                            to="/ai-interview-coach" 
                            className={({ isActive }) => `${navLinkClass} relative ${isActive ? 'font-bold' : ''}`}
                            style={({ isActive }) => ({
                                color: isActive ? 'var(--color-text)' : 'var(--color-text-secondary)',
                                borderBottom: isActive ? '2px solid var(--color-text)' : 'none',
                                borderRadius: isActive ? '0' : undefined,
                            })}
                        >
                            AI Coach
                            <span className="absolute -top-1 -right-1 bg-charcoal dark:bg-cream text-white dark:text-navy text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">
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
                            className="md:hidden p-2 rounded-md focus:outline-none transition-colors"
                            style={{ color: 'var(--color-text)' }}
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
                <div className="md:hidden border-t-2 transition-colors duration-300" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
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
                                className="block text-sm font-semibold uppercase tracking-wider transition-colors py-2 px-2 rounded-md"
                                style={({ isActive }) => ({
                                    color: isActive ? 'var(--color-text)' : 'var(--color-text-secondary)',
                                    fontWeight: isActive ? '700' : undefined,
                                })}
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
