import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
import { toast } from 'react-hot-toast';

const Forum = () => {
  const navigate = useNavigate();
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    tags: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'general',
    'algorithms',
    'system-design',
    'frontend',
    'backend',
    'database',
    'behavioral',
    'career'
  ];

  useEffect(() => {
    fetchForums();
  }, []);

  const fetchForums = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.FORUMS.GET_ALL);
      setForums(response.data);
    } catch (error) {
      console.error('Error fetching forums:', error);
      toast.error('Failed to load forums');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCreateForum = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const tagsArray = formData.tags.split(',').map(tag => tag.trim());
      const payload = {
        ...formData,
        tags: tagsArray
      };
      
      const response = await axiosInstance.post(API_PATHS.FORUMS.CREATE, payload);
      toast.success('Forum created successfully!');
      setShowCreateModal(false);
      fetchForums();
      setFormData({
        title: '',
        description: '',
        category: 'general',
        tags: ''
      });
      
      // Navigate to the newly created forum
      navigate(`/forums/${response.data._id}`);
    } catch (error) {
      console.error('Error creating forum:', error);
      toast.error('Failed to create forum');
    } finally {
      setLoading(false);
    }
  };

  const handleViewForum = (forumId) => {
    navigate(`/forums/${forumId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilteredForums = () => {
    return forums.filter(forum => {
      const matchesSearch = searchQuery === '' || 
        forum.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        forum.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        forum.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || forum.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Discussion Forums</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md"
          >
            Create New Forum
          </button>
        </div>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search forums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <svg
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <div className="flex-shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <SpinnerLoader />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {getFilteredForums().length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No forums found. {searchQuery || selectedCategory !== 'all' ? 'Try adjusting your filters.' : 'Create one to get started!'}
              </p>
            ) : (
              getFilteredForums().map((forum) => (
                <div
                  key={forum._id}
                  className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleViewForum(forum._id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{forum.title}</h3>
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                      {forum.category.charAt(0).toUpperCase() + forum.category.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{forum.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {forum.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div>
                      <span>{forum.posts.length} posts</span>
                      <span className="mx-2">•</span>
                      <span>{forum.viewCount} views</span>
                    </div>
                    <div className="flex items-center">
                      <span>Created by {forum.creator.name}</span>
                      <span className="mx-2">•</span>
                      <span>Last active {formatDate(forum.lastActivity || forum.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Forum Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Create New Forum</h2>
              <form onSubmit={handleCreateForum}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows="3"
                    required
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="react, javascript, interview"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Forum'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Forum;