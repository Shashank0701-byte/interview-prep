import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const CollaborativeNav = () => {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { name: 'Study Groups', path: '/study-groups', icon: 'users' },
    { name: 'Peer Reviews', path: '/peer-reviews', icon: 'clipboard-check' },
    { name: 'Mentorships', path: '/mentorships', icon: 'user-graduate' },
    { name: 'Forums', path: '/forums', icon: 'comments' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Collaborative Learning</h2>
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${path === item.path ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <i className={`fas fa-${item.icon} mr-2`}></i>
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CollaborativeNav;