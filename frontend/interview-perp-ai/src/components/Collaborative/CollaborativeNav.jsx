import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUsers, FaComments, FaUserGraduate, FaClipboardCheck } from 'react-icons/fa';

const CollaborativeNav = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Collaborative Learning</h2>
      <div className="flex flex-wrap gap-2">
        <Link
          to="/study-groups"
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${path === '/study-groups' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <span className="mr-2"><FaUsers /></span>
          <span>Study Groups</span>
        </Link>
        <Link
          to="/peer-reviews"
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${path === '/peer-reviews' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <span className="mr-2"><FaClipboardCheck /></span>
          <span>Peer Reviews</span>
        </Link>
        <Link
          to="/mentorships"
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${path === '/mentorships' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <span className="mr-2"><FaUserGraduate /></span>
          <span>Mentorships</span>
        </Link>
        <Link
          to="/forums"
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${path === '/forums' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <span className="mr-2"><FaComments /></span>
          <span>Forums</span>
        </Link>
      </div>
    </div>
  );
};

export default CollaborativeNav;