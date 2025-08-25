import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader.jsx';
import CollaborativeNav from '../../components/Collaborative/CollaborativeNav.jsx';
import { FaPlus, FaCheck, FaHourglassHalf, FaTimes, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const PeerReview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('myRequests');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [receivedReviews, setReceivedReviews] = useState([]);
  const [submittedReviews, setSubmittedReviews] = useState([]);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    questionContent: '',
    answerContent: '',
    additionalContext: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user stats
        const statsResponse = await axiosInstance.get(API_PATHS.COLLABORATIVE.PEER_REVIEWS.GET_USER_STATS);
        setStats(statsResponse.data);

        // Fetch data based on active tab
        switch (activeTab) {
          case 'myRequests':
            const requestsResponse = await axiosInstance.get(API_PATHS.COLLABORATIVE.PEER_REVIEWS.GET_USER_REQUESTS);
            setMyRequests(requestsResponse.data);
            break;
          case 'assignedRequests':
            const assignedResponse = await axiosInstance.get(API_PATHS.COLLABORATIVE.PEER_REVIEWS.GET_ASSIGNED_REQUESTS);
            setAssignedRequests(assignedResponse.data);
            break;
          case 'receivedReviews':
            const receivedResponse = await axiosInstance.get(API_PATHS.COLLABORATIVE.PEER_REVIEWS.GET_RECEIVED_REVIEWS);
            setReceivedReviews(receivedResponse.data);
            break;
          case 'submittedReviews':
            const submittedResponse = await axiosInstance.get(API_PATHS.COLLABORATIVE.PEER_REVIEWS.GET_SUBMITTED_REVIEWS);
            setSubmittedReviews(submittedResponse.data);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Error fetching peer review data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(API_PATHS.COLLABORATIVE.PEER_REVIEWS.CREATE_REQUEST, newRequest);
      setNewRequest({
        questionContent: '',
        answerContent: '',
        additionalContext: ''
      });
      setShowNewRequestForm(false);
      
      // Refresh my requests
      const requestsResponse = await axiosInstance.get(API_PATHS.COLLABORATIVE.PEER_REVIEWS.GET_USER_REQUESTS);
      setMyRequests(requestsResponse.data);
      
      // Update stats
      const statsResponse = await axiosInstance.get(API_PATHS.COLLABORATIVE.PEER_REVIEWS.GET_USER_STATS);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error creating peer review request:', error);
      alert('Failed to create peer review request. Please try again.');
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to cancel this peer review request?')) {
      try {
        await axiosInstance.post(API_PATHS.COLLABORATIVE.PEER_REVIEWS.CANCEL_REQUEST(requestId));
        
        // Refresh my requests
        const requestsResponse = await axiosInstance.get(API_PATHS.COLLABORATIVE.PEER_REVIEWS.GET_USER_REQUESTS);
        setMyRequests(requestsResponse.data);
        
        // Update stats
        const statsResponse = await axiosInstance.get(API_PATHS.COLLABORATIVE.PEER_REVIEWS.GET_USER_STATS);
        setStats(statsResponse.data);
      } catch (error) {
        console.error('Error cancelling peer review request:', error);
        alert('Failed to cancel peer review request. Please try again.');
      }
    }
  };

  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-500" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-500" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-500" />);
      }
    }
    
    return <div className="flex">{stars}</div>;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Open</span>;
      case 'assigned':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Assigned</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Completed</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">{status}</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Peer Reviews</h1>
        
        <CollaborativeNav activeItem="peer-reviews" />
        
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-gray-500 text-sm">Requests Made</h3>
              <p className="text-2xl font-bold">{stats.requestsMade}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-gray-500 text-sm">Reviews Received</h3>
              <p className="text-2xl font-bold">{stats.reviewsReceived}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-gray-500 text-sm">Reviews Submitted</h3>
              <p className="text-2xl font-bold">{stats.reviewsSubmitted}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-gray-500 text-sm">Average Rating</h3>
              <div className="flex items-center">
                <p className="text-2xl font-bold mr-2">{stats.averageRating.toFixed(1)}</p>
                {renderStarRating(stats.averageRating)}
              </div>
            </div>
          </div>
        )}
        
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <button 
              className={`py-3 px-4 ${activeTab === 'myRequests' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('myRequests')}
            >
              My Requests
            </button>
            <button 
              className={`py-3 px-4 ${activeTab === 'assignedRequests' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('assignedRequests')}
            >
              Assigned to Me
            </button>
            <button 
              className={`py-3 px-4 ${activeTab === 'receivedReviews' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('receivedReviews')}
            >
              Received Reviews
            </button>
            <button 
              className={`py-3 px-4 ${activeTab === 'submittedReviews' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('submittedReviews')}
            >
              Submitted Reviews
            </button>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <SpinnerLoader />
              </div>
            ) : (
              <>
                {activeTab === 'myRequests' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">My Peer Review Requests</h2>
                      <button 
                        onClick={() => setShowNewRequestForm(!showNewRequestForm)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
                      >
                        <FaPlus className="mr-2" /> New Request
                      </button>
                    </div>
                    
                    {showNewRequestForm && (
                      <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h3 className="text-lg font-semibold mb-3">Create New Peer Review Request</h3>
                        <form onSubmit={handleCreateRequest}>
                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                              Question Content
                            </label>
                            <textarea
                              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="3"
                              placeholder="Enter the interview question or problem statement"
                              value={newRequest.questionContent}
                              onChange={(e) => setNewRequest({...newRequest, questionContent: e.target.value})}
                              required
                            ></textarea>
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                              Your Answer
                            </label>
                            <textarea
                              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="5"
                              placeholder="Enter your solution or answer that you want reviewed"
                              value={newRequest.answerContent}
                              onChange={(e) => setNewRequest({...newRequest, answerContent: e.target.value})}
                              required
                            ></textarea>
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                              Additional Context (Optional)
                            </label>
                            <textarea
                              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="2"
                              placeholder="Any additional information that might help the reviewer"
                              value={newRequest.additionalContext}
                              onChange={(e) => setNewRequest({...newRequest, additionalContext: e.target.value})}
                            ></textarea>
                          </div>
                          <div className="flex justify-end space-x-3">
                            <button 
                              type="button"
                              onClick={() => setShowNewRequestForm(false)}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit"
                              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                            >
                              Submit Request
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                    
                    {myRequests.length > 0 ? (
                      <div className="space-y-4">
                        {myRequests.map(request => (
                          <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-lg mb-1">
                                  {request.questionContent.length > 50 
                                    ? `${request.questionContent.substring(0, 50)}...` 
                                    : request.questionContent}
                                </h3>
                                <div className="flex items-center space-x-3 text-sm text-gray-500">
                                  <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                                  <span>{getStatusBadge(request.status)}</span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                {request.status === 'open' && (
                                  <button 
                                    onClick={() => handleCancelRequest(request._id)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                  >
                                    Cancel
                                  </button>
                                )}
                                <button 
                                  onClick={() => navigate(`/peer-review/${request._id}`)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm"
                                >
                                  View
                                </button>
                              </div>
                            </div>
                            
                            {request.assignedTo && (
                              <div className="mt-3 text-sm">
                                <span className="text-gray-600">Assigned to: </span>
                                <span className="font-medium">{request.assignedTo.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">You haven't created any peer review requests yet.</p>
                        <button 
                          onClick={() => setShowNewRequestForm(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                        >
                          Create Your First Request
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'assignedRequests' && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Requests Assigned to Me</h2>
                    
                    {assignedRequests.length > 0 ? (
                      <div className="space-y-4">
                        {assignedRequests.map(request => (
                          <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-lg mb-1">
                                  {request.questionContent.length > 50 
                                    ? `${request.questionContent.substring(0, 50)}...` 
                                    : request.questionContent}
                                </h3>
                                <div className="flex items-center space-x-3 text-sm text-gray-500">
                                  <span>From: {request.requester.name}</span>
                                  <span>Assigned: {new Date(request.assignedAt).toLocaleDateString()}</span>
                                  <span>{getStatusBadge(request.status)}</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => navigate(`/peer-review/${request._id}/review`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm"
                              >
                                {request.status === 'completed' ? 'View' : 'Review'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">You don't have any assigned peer review requests.</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'receivedReviews' && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Reviews You've Received</h2>
                    
                    {receivedReviews.length > 0 ? (
                      <div className="space-y-4">
                        {receivedReviews.map(review => (
                          <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-lg mb-1">
                                  {review.questionContent.length > 50 
                                    ? `${review.questionContent.substring(0, 50)}...` 
                                    : review.questionContent}
                                </h3>
                                <div className="flex items-center space-x-3 text-sm text-gray-500">
                                  <span>From: {review.reviewer.name || 'Anonymous Reviewer'}</span>
                                  <span>Received: {new Date(review.createdAt).toLocaleDateString()}</span>
                                  <div className="flex items-center">
                                    <span className="mr-1">Rating:</span>
                                    {renderStarRating(review.overallRating)}
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => navigate(`/peer-review/${review._id}/feedback`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm"
                              >
                                View Feedback
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">You haven't received any peer reviews yet.</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'submittedReviews' && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Reviews You've Submitted</h2>
                    
                    {submittedReviews.length > 0 ? (
                      <div className="space-y-4">
                        {submittedReviews.map(review => (
                          <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-lg mb-1">
                                  {review.questionContent.length > 50 
                                    ? `${review.questionContent.substring(0, 50)}...` 
                                    : review.questionContent}
                                </h3>
                                <div className="flex items-center space-x-3 text-sm text-gray-500">
                                  <span>For: {review.reviewee.name}</span>
                                  <span>Submitted: {new Date(review.createdAt).toLocaleDateString()}</span>
                                  <div className="flex items-center">
                                    <span className="mr-1">Rating:</span>
                                    {renderStarRating(review.overallRating)}
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => navigate(`/peer-review/${review._id}`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">You haven't submitted any peer reviews yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PeerReview;