import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
import { toast } from 'react-hot-toast';

const PeerReview = () => {
  const navigate = useNavigate();
  const [receivedReviews, setReceivedReviews] = useState([]);
  const [givenReviews, setGivenReviews] = useState([]);
  const [openRequests, setOpenRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({
    sessionId: '',
    questionId: '',
    note: ''
  });
  const [sessions, setSessions] = useState([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchData();
    fetchSessions();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [receivedRes, givenRes, requestsRes] = await Promise.all([
        axiosInstance.get(API_PATHS.PEER_REVIEWS.GET_RECEIVED),
        axiosInstance.get(API_PATHS.PEER_REVIEWS.GET_GIVEN),
        axiosInstance.get(API_PATHS.PEER_REVIEWS.GET_OPEN_REQUESTS)
      ]);

      setReceivedReviews(receivedRes.data);
      setGivenReviews(givenRes.data);
      setOpenRequests(requestsRes.data);
    } catch (error) {
      console.error('Error fetching peer reviews:', error);
      toast.error('Failed to load peer reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SESSIONS.GET_MY_SESSIONS);
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    }
  };

  const fetchQuestions = async (sessionId) => {
    try {
      const response = await axiosInstance.get(API_PATHS.SESSIONS.GET_ONE(sessionId));
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestData({
      ...requestData,
      [name]: value
    });

    // If session changed, fetch questions for that session
    if (name === 'sessionId' && value) {
      fetchQuestions(value);
    }
  };

  const handleRequestReview = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.post(API_PATHS.PEER_REVIEWS.REQUEST, requestData);
      toast.success('Peer review request sent successfully!');
      setShowRequestModal(false);
      fetchData();
      setRequestData({
        sessionId: '',
        questionId: '',
        note: ''
      });
    } catch (error) {
      console.error('Error requesting peer review:', error);
      toast.error('Failed to request peer review');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axiosInstance.post(API_PATHS.PEER_REVIEWS.ACCEPT_REQUEST(requestId));
      toast.success('Request accepted!');
      fetchData();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleViewReview = (reviewId) => {
    navigate(`/peer-reviews/${reviewId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <SpinnerLoader />
        </div>
      );
    }

    switch (activeTab) {
      case 'received':
        return (
          <div>
            {receivedReviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">You haven't received any peer reviews yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {receivedReviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{review.question?.question || 'Question not available'}</h3>
                        <p className="text-sm text-gray-500">Reviewed by: {review.isAnonymous ? 'Anonymous' : review.reviewer?.name}</p>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-medium mr-2">Rating:</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Feedback:</h4>
                      <p className="text-gray-700">{review.feedback}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Strengths:</h4>
                        <p className="text-gray-700">{review.strengths}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Areas for Improvement:</h4>
                        <p className="text-gray-700">{review.improvements}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewReview(review._id)}
                      className="text-amber-500 hover:text-amber-700 text-sm font-medium"
                    >
                      View Full Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'given':
        return (
          <div>
            {givenReviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">You haven't given any peer reviews yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {givenReviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{review.question?.question || 'Question not available'}</h3>
                        <p className="text-sm text-gray-500">Reviewed for: {review.interviewee?.name}</p>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-medium mr-2">Your Rating:</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewReview(review._id)}
                      className="text-amber-500 hover:text-amber-700 text-sm font-medium"
                    >
                      View Full Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'requests':
        return (
          <div>
            {openRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">There are no open peer review requests.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {openRequests.map((request) => (
                  <div
                    key={request._id}
                    className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{request.question?.question || 'Question not available'}</h3>
                        <p className="text-sm text-gray-500">Requested by: {request.interviewee?.name}</p>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(request.createdAt)}</span>
                    </div>
                    {request.note && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Note from requester:</h4>
                        <p className="text-gray-700">{request.note}</p>
                      </div>
                    )}
                    <button
                      onClick={() => handleAcceptRequest(request._id)}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Accept Request
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Peer Reviews</h1>
          <button
            onClick={() => setShowRequestModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md"
          >
            Request Review
          </button>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('received')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'received' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Reviews Received
              </button>
              <button
                onClick={() => setActiveTab('given')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'given' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Reviews Given
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'requests' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Open Requests
                {openRequests.length > 0 && (
                  <span className="ml-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                    {openRequests.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {renderTabContent()}

        {/* Request Review Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Request Peer Review</h2>
              <form onSubmit={handleRequestReview}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Select Session</label>
                  <select
                    name="sessionId"
                    value={requestData.sessionId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    <option value="">Select a session</option>
                    {sessions.map((session) => (
                      <option key={session._id} value={session._id}>
                        {session.role} - {session.experience} ({new Date(session.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Select Question</label>
                  <select
                    name="questionId"
                    value={requestData.questionId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                    disabled={!requestData.sessionId}
                  >
                    <option value="">Select a question</option>
                    {questions.map((question) => (
                      <option key={question._id} value={question._id}>
                        {question.question}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Note (optional)</label>
                  <textarea
                    name="note"
                    value={requestData.note}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows="3"
                    placeholder="Add any specific areas you'd like feedback on"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Request Review'}
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

export default PeerReview;