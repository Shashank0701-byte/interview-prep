import React from 'react';
import ProfileInfoCard from "../Cards/ProfileInfoCard";
import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
    // Style for the active NavLink
    const activeLinkStyle = {
        color: '#4f46e5', // A nice indigo color for the active link
        fontWeight: '500',
    };

    return (
        <div className="h-16 bg-white border-b border-gray-200/80 backdrop-blur-[2px] py-2.5 px-4 md:px-0 sticky top-0 z-30">
            <div className="container mx-auto flex items-center justify-between gap-5">
                <div className="flex items-center gap-8">
                    <Link to="/dashboard">
                        <h2 className="text-lg md:text-xl font-medium text-black leading-5">
                            Interview Prep AI
                        </h2>
                    </Link>

                    {/* --- NEW NAVIGATION LINKS --- */}
                    <nav className="hidden md:flex items-center gap-6">
                        <NavLink 
                            to="/dashboard" 
                            className="text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                        >
                            Dashboard
                        </NavLink>
                        <NavLink 
                            to="/progress" 
                            className="text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                        >
                            My Progress
                        </NavLink>
                        <NavLink 
                            to="/roadmap" 
                            className="text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                        >
                            Learning Roadmap
                        </NavLink>
                        <NavLink 
                            to="/code-review" 
                            className="text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                        >
                            Code Review
                        </NavLink>
                        <NavLink 
                            to="/resume-builder" 
                            className="text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                        >
                            Resume Builder
                        </NavLink>
                        <NavLink 
                            to="/live-coding" 
                            className="text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                        >
                            Live Coding
                        </NavLink>
                        
                    </nav>
                </div>
                
                <ProfileInfoCard />
            </div>
        </div>
    )
}

export default Navbar;
