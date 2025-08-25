import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader.jsx';
import CollaborativeNav from '../../components/Collaborative/CollaborativeNav.jsx';
import { FaPlus, FaSearch, FaTag, FaComment, FaThumbsUp, FaEye, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Forum = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchPopularTags();
  }, [activeCategory, activeTag]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let endpoint = API_PATHS.COLLABORATIVE.FORUMS.GET_ALL;
      
      // Add query parameters instead of using non-existent endpoints
      const params = {};
      if (activeCategory !== 'all') {
        params.category = activeCategory;
      }
      if (activeTag) {
        params.tag = activeTag;
      }
      
      const response = await axiosInstance.get(endpoint, { params });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching forum posts:', error);
      toast.error('Failed to load forum posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.COLLABORATIVE.FORUMS.GET_CATEGORIES);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching forum categories:', error);
      toast.error('Failed to load categories: ' + (error.response?.data?.message || error.message || 'Unknown error'));
      // Set default categories to prevent undefined errors
      setCategories([]);
    }
  };

  const fetchPopularTags = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.COLLABORATIVE.FORUMS.GET_POPULAR_TAGS);
      setPopularTags(response.data);
    } catch (error) {
      console.error('Error fetching popular tags:', error);
      toast.error('Failed to load tags: ' + (error.response?.data?.message || error.message || 'Unknown error'));
      // Set empty array to prevent undefined errors
      setPopularTags([]);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(API_PATHS.COLLABORATIVE.FORUMS.CREATE, newPost);
      toast.success('Forum post created successfully');
      setCreateModalOpen(false);
      setNewPost({
        title: '',
        content: '',
        category: '',
        tags: []
      });
      fetchPosts();
    } catch (error) {
      console.error('Error creating forum post:', error);
      toast.error(error.response?.data?.message || 'Failed to create forum post');
    }
  };

  const handleViewPost = (postId) => {
    navigate(`/forum/${postId}`);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newPost.tags.includes(tagInput.trim())) {
      setNewPost({
        ...newPost,
        tags: [...newPost.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (index) => {
    const updatedTags = [...newPost.tags];
    updatedTags.splice(index, 1);
    setNewPost({
      ...newPost,
      tags: updatedTags
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLoading(true);
      axiosInstance.get(API_PATHS.COLLABORATIVE.FORUMS.SEARCH(searchQuery))
        .then(response => {
          setPosts(response.data);
          setActiveCategory('all');
          setActiveTag('');
        })
        .catch(error => {
          console.error('Error searching forum posts:', error);
          toast.error('Failed to search forum posts');
        })
        .finally(() => setLoading(false));
    }
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setActiveTag('');
    setSearchQuery('');
  };

  const handleTagClick = (tag) => {
    setActiveTag(tag);
    setActiveCategory('all');
    setSearchQuery('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderPosts = () => {
    if (posts.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500">No forum posts found.</p>
          <button 
            onClick={() => setCreateModalOpen(true)} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Create a Post
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {posts.map((post) => (
          <div 
            key={post._id} 
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleViewPost(post._id)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-800">{post.title}</h3>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {post.category}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">{post.content}</p>
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTagClick(tag);
                      }}
                    >
                      <FaTag className="mr-1" size={10} /> {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    <FaUser className="mr-1" />
                    <span>{post.author?.name || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-1" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <FaComment className="mr-1" />
                    <span>{post.replyCount || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <FaThumbsUp className="mr-1" />
                    <span>{post.upvotes?.length || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <FaEye className="mr-1" />
                    <span>{post.viewCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Discussion Forum</h1>
        
        <CollaborativeNav activeTab="forum" />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <button 
                onClick={() => setCreateModalOpen(true)} 
                className="w-full bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center hover:bg-blue-700 transition-colors mb-6"
              >
                <FaPlus className="mr-2" /> Create Post
              </button>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">Categories</h3>
                <ul className="space-y-2">
                  <li>
                    <button 
                      onClick={() => handleCategoryClick('all')} 
                      className={`w-full text-left px-3 py-2 rounded ${activeCategory === 'all' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                    >
                      All Categories
                    </button>
                  </li>
                  {categories.map((category) => (
                    <li key={category}>
                      <button 
                        onClick={() => handleCategoryClick(category)} 
                        className={`w-full text-left px-3 py-2 rounded ${activeCategory === category ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              {popularTags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <button 
                        key={tag.name} 
                        onClick={() => handleTagClick(tag.name)} 
                        className={`flex items-center text-xs px-2 py-1 rounded ${activeTag === tag.name ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        <FaTag className="mr-1" size={10} /> {tag.name} ({tag.count})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <form onSubmit={handleSearch} className="flex mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search forum posts..."
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition-colors"
                >
                  <FaSearch />
                </button>
              </form>
              
              {loading ? (
                <div className="flex justify-center py-10">
                  <SpinnerLoader />
                </div>
              ) : (
                renderPosts()
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Create Post Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Create New Forum Post</h2>
            
            <form onSubmit={handleCreatePost}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a descriptive title"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add tags (press + to add)"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-blue-600 text-white px-3 py-2 rounded-r hover:bg-blue-700 transition-colors"
                  >
                    <FaPlus />
                  </button>
                </div>
                
                {newPost.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {newPost.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center"
                      >
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveTag(index)} 
                          className="ml-1 text-blue-800 hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="8"
                  placeholder="Write your post content here..."
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Create Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Forum;