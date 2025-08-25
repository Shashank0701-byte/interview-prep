import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader.jsx';
import { FaArrowLeft, FaThumbsUp, FaRegThumbsUp, FaTag, FaCalendarAlt, FaUser, FaReply } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ForumDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    setLoading(true);
    try {
      const postResponse = await axiosInstance.get(API_PATHS.COLLABORATIVE.FORUMS.GET_ONE(postId));
      setPost(postResponse.data);
      
      const repliesResponse = await axiosInstance.get(API_PATHS.COLLABORATIVE.FORUMS.GET_REPLIES(postId));
      setReplies(repliesResponse.data);
    } catch (error) {
      console.error('Error fetching forum post details:', error);
      toast.error('Failed to load forum post details');
      navigate('/forum');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    setSubmittingReply(true);
    try {
      const response = await axiosInstance.post(
        API_PATHS.COLLABORATIVE.FORUMS.CREATE_REPLY(postId),
        { content: replyContent }
      );
      
      setReplies([...replies, response.data]);
      setReplyContent('');
      toast.success('Reply posted successfully');
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleToggleUpvote = async () => {
    try {
      await axiosInstance.post(API_PATHS.COLLABORATIVE.FORUMS.TOGGLE_UPVOTE(postId));
      
      // Update local state to reflect the upvote change
      setPost(prevPost => {
        const userHasUpvoted = prevPost.upvotes.includes(userId);
        let updatedUpvotes;
        
        if (userHasUpvoted) {
          updatedUpvotes = prevPost.upvotes.filter(id => id !== userId);
        } else {
          updatedUpvotes = [...prevPost.upvotes, userId];
        }
        
        return {
          ...prevPost,
          upvotes: updatedUpvotes
        };
      });
    } catch (error) {
      console.error('Error toggling upvote:', error);
      toast.error('Failed to update upvote');
    }
  };

  const handleToggleReplyUpvote = async (replyId) => {
    try {
      await axiosInstance.post(API_PATHS.COLLABORATIVE.FORUMS.TOGGLE_REPLY_UPVOTE(postId, replyId));
      
      // Update local state to reflect the upvote change
      setReplies(prevReplies => {
        return prevReplies.map(reply => {
          if (reply._id === replyId) {
            const userHasUpvoted = reply.upvotes.includes(userId);
            let updatedUpvotes;
            
            if (userHasUpvoted) {
              updatedUpvotes = reply.upvotes.filter(id => id !== userId);
            } else {
              updatedUpvotes = [...reply.upvotes, userId];
            }
            
            return {
              ...reply,
              upvotes: updatedUpvotes
            };
          }
          return reply;
        });
      });
    } catch (error) {
      console.error('Error toggling reply upvote:', error);
      toast.error('Failed to update reply upvote');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center py-10">
            <SpinnerLoader />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!post) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-10">
            <p className="text-gray-500">Post not found or has been removed.</p>
            <button 
              onClick={() => navigate('/forum')} 
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Back to Forum
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const userHasUpvoted = post.upvotes.includes(userId);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/forum')} 
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <FaArrowLeft className="mr-2" /> Back to Forum
        </button>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {/* Post Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-gray-800">{post.title}</h1>
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded">
                {post.category}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <div className="flex items-center mr-4">
                <FaUser className="mr-1" />
                <span>{post.author?.name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="mr-1" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded flex items-center"
                  >
                    <FaTag className="mr-1" size={10} /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Post Content */}
          <div className="p-6 border-b border-gray-200">
            <div className="prose max-w-none">
              {post.content.split('\n').map((paragraph, index) => (
                paragraph ? <p key={index} className="mb-4">{paragraph}</p> : <br key={index} />
              ))}
            </div>
            
            <div className="mt-6 flex items-center justify-between">
              <button 
                onClick={handleToggleUpvote} 
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${userHasUpvoted ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {userHasUpvoted ? <FaThumbsUp /> : <FaRegThumbsUp />} 
                <span>{post.upvotes.length} Upvotes</span>
              </button>
              
              <div className="text-sm text-gray-500">
                {post.viewCount || 0} views
              </div>
            </div>
          </div>
          
          {/* Replies Section */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">{replies.length} Replies</h2>
            
            {replies.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">No replies yet. Be the first to reply!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {replies.map((reply) => {
                  const replyUserHasUpvoted = reply.upvotes.includes(userId);
                  
                  return (
                    <div key={reply._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="flex items-center mr-4">
                            <FaUser className="mr-1" />
                            <span className="font-medium">{reply.author?.name || 'Anonymous'}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(reply.createdAt)}
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handleToggleReplyUpvote(reply._id)} 
                          className={`flex items-center gap-1 text-sm ${replyUserHasUpvoted ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          {replyUserHasUpvoted ? <FaThumbsUp size={12} /> : <FaRegThumbsUp size={12} />} 
                          <span>{reply.upvotes.length}</span>
                        </button>
                      </div>
                      
                      <div className="mt-2">
                        {reply.content.split('\n').map((paragraph, index) => (
                          paragraph ? <p key={index} className="mb-2">{paragraph}</p> : <br key={index} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Reply Form */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Leave a Reply</h3>
              
              <form onSubmit={handleSubmitReply}>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Write your reply here..."
                  required
                ></textarea>
                
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    disabled={submittingReply}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  >
                    {submittingReply ? (
                      <>
                        <SpinnerLoader size="sm" /> 
                        <span className="ml-2">Posting...</span>
                      </>
                    ) : (
                      <>
                        <FaReply className="mr-2" /> Post Reply
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ForumDetail;