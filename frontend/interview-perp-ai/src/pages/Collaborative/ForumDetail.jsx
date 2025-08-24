import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
import { toast } from 'react-hot-toast';

const ForumDetail = () => {
  const { forumId } = useParams();
  const navigate = useNavigate();
  const [forum, setForum] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [postFormData, setPostFormData] = useState({
    title: '',
    content: ''
  });
  const [commentFormData, setCommentFormData] = useState({});
  const [showCommentForm, setShowCommentForm] = useState({});

  useEffect(() => {
    if (forumId) {
      fetchForumDetails();
    }
  }, [forumId]);

  const fetchForumDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${API_PATHS.FORUMS.GET_BY_ID}/${forumId}`);
      setForum(response.data);
      
      const postsResponse = await axiosInstance.get(`${API_PATHS.FORUMS.GET_POSTS}/${forumId}`);
      setPosts(postsResponse.data);
    } catch (error) {
      console.error('Error fetching forum details:', error);
      toast.error('Failed to load forum details');
      navigate('/forums');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostFormData({
      ...postFormData,
      [name]: value
    });
  };

  const handleCommentInputChange = (e, postId) => {
    const { value } = e.target;
    setCommentFormData({
      ...commentFormData,
      [postId]: value
    });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...postFormData,
        forumId
      };
      
      await axiosInstance.post(API_PATHS.FORUMS.CREATE_POST, payload);
      toast.success('Post created successfully!');
      setShowCreatePostModal(false);
      setPostFormData({
        title: '',
        content: ''
      });
      fetchForumDetails();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (postId) => {
    try {
      if (!commentFormData[postId] || commentFormData[postId].trim() === '') {
        toast.error('Comment cannot be empty');
        return;
      }

      const payload = {
        content: commentFormData[postId],
        postId
      };
      
      await axiosInstance.post(`${API_PATHS.FORUMS.ADD_COMMENT}/${postId}`, payload);
      toast.success('Comment added successfully!');
      setCommentFormData({
        ...commentFormData,
        [postId]: ''
      });
      setShowCommentForm({
        ...showCommentForm,
        [postId]: false
      });
      fetchForumDetails();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleUpvotePost = async (postId) => {
    try {
      await axiosInstance.post(`${API_PATHS.FORUMS.UPVOTE_POST}/${postId}`);
      fetchForumDetails();
    } catch (error) {
      console.error('Error upvoting post:', error);
      toast.error('Failed to upvote post');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleCommentForm = (postId) => {
    setShowCommentForm({
      ...showCommentForm,
      [postId]: !showCommentForm[postId]
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {loading && !forum ? (
          <div className="flex justify-center items-center h-64">
            <SpinnerLoader />
          </div>
        ) : forum ? (
          <>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <button
                    onClick={() => navigate('/forums')}
                    className="text-amber-600 hover:text-amber-700 mb-2 flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      ></path>
                    </svg>
                    Back to Forums
                  </button>
                  <h1 className="text-2xl font-bold">{forum.title}</h1>
                </div>
                <button
                  onClick={() => setShowCreatePostModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md"
                >
                  Create New Post
                </button>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-600">{forum.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {forum.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                    {forum.category.charAt(0).toUpperCase() + forum.category.slice(1)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  <span>Created by {forum.creator.name}</span>
                  <span className="mx-2">•</span>
                  <span>Created on {formatDate(forum.createdAt)}</span>
                  <span className="mx-2">•</span>
                  <span>{forum.viewCount} views</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Posts</h2>
              {posts.length === 0 ? (
                <p className="text-gray-500 text-center py-8 bg-white rounded-lg shadow-md border border-gray-200">
                  No posts yet. Be the first to create a post!
                </p>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <div key={post._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold">{post.title}</h3>
                          <div className="flex items-center">
                            <button
                              onClick={() => handleUpvotePost(post._id)}
                              className="flex items-center text-gray-500 hover:text-amber-600"
                            >
                              <svg
                                className="w-5 h-5 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 15l7-7 7 7"
                                ></path>
                              </svg>
                              <span>{post.upvotes.length}</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-4 whitespace-pre-line">{post.content}</p>
                        <div className="text-sm text-gray-500">
                          <span>Posted by {post.author.name}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium">Comments ({post.comments.length})</h4>
                          <button
                            onClick={() => toggleCommentForm(post._id)}
                            className="text-amber-600 hover:text-amber-700 text-sm"
                          >
                            {showCommentForm[post._id] ? 'Cancel' : 'Add Comment'}
                          </button>
                        </div>

                        {showCommentForm[post._id] && (
                          <div className="mb-4">
                            <textarea
                              value={commentFormData[post._id] || ''}
                              onChange={(e) => handleCommentInputChange(e, post._id)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                              rows="3"
                              placeholder="Write your comment here..."
                            ></textarea>
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={() => handleAddComment(post._id)}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-md text-sm"
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        )}

                        {post.comments.length > 0 ? (
                          <div className="space-y-3">
                            {post.comments.map((comment) => (
                              <div key={comment._id} className="border-l-2 border-amber-200 pl-3 py-1">
                                <p className="text-gray-700 text-sm">{comment.content}</p>
                                <div className="text-xs text-gray-500 mt-1">
                                  <span>{comment.author.name}</span>
                                  <span className="mx-1">•</span>
                                  <span>{formatDate(comment.createdAt)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No comments yet.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Create Post Modal */}
            {showCreatePostModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full">
                  <h2 className="text-xl font-semibold mb-4">Create New Post</h2>
                  <form onSubmit={handleCreatePost}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={postFormData.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-gray-700 mb-2">Content</label>
                      <textarea
                        name="content"
                        value={postFormData.content}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        rows="6"
                        required
                      ></textarea>
                    </div>
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => setShowCreatePostModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                        disabled={loading}
                      >
                        {loading ? 'Creating...' : 'Create Post'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Forum not found or has been removed.</p>
            <button
              onClick={() => navigate('/forums')}
              className="mt-4 text-amber-600 hover:text-amber-700"
            >
              Return to Forums
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ForumDetail;