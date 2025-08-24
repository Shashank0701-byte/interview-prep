import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
import { toast } from 'react-hot-toast';

const Mentorship = () => {
  const navigate = useNavigate();
  const [mentorships, setMentorships] = useState([]);
  const [availableMentors, setAvailableMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({
    mentorId: '',
    topics: '',
    goals: ''
  });

  useEffect(() => {
    fetchMentorships();
    fetchAvailableMentors();
  }, []);

  const fetchMentorships = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.MENTORSHIPS.GET_ALL);
      setMentorships(response.data);
    } catch (error) {
      console.error('Error fetching mentorships:', error);
      toast.error('Failed to load mentorships');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMentors = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.MENTORSHIPS.GET_AVAILABLE_MENTORS);
      setAvailableMentors(response.data);
    } catch (error) {
      console.error('Error fetching available mentors:', error);
      toast.error('Failed to load available mentors');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestData({
      ...requestData,
      [name]: value
    });
  };

  const handleRequestMentorship = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const topicsArray = requestData.topics.split(',').map(topic => topic.trim());
      const payload = {
        ...requestData,
        topics: topicsArray
      };
      
      await axiosInstance.post(API_PATHS.MENTORSHIPS.REQUEST, payload);
      toast.success('Mentorship request sent successfully!');
      setShowRequestModal(false);
      fetchMentorships();
      setRequestData({
        mentorId: '',
        topics: '',
        goals: ''
      });
    } catch (error) {
      console.error('Error requesting mentorship:', error);
      toast.error('Failed to request mentorship');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToRequest = async (mentorshipId, status) => {
    try {
      await axiosInstance.post(API_PATHS.MENTORSHIPS.RESPOND(mentorshipId), { status });
      toast.success(`Request ${status === 'accepted' ? 'accepted' : 'rejected'} successfully!`);
      fetchMentorships();
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error('Failed to respond to request');
    }
  };

  const handleEndMentorship = async (mentorshipId) => {
    try {
      await axiosInstance.post(API_PATHS.MENTORSHIPS.END(mentorshipId));
      toast.success('Mentorship ended successfully!');
      fetchMentorships();
    } catch (error) {
      console.error('Error ending mentorship:', error);
      toast.error('Failed to end mentorship');
    }
  };

  const handleViewMentorship = (mentorshipId) => {
    navigate(`/mentorships/${mentorshipId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilteredMentorships = () => {
    switch (activeTab) {
      case 'active':
        return mentorships.filter(m => m.status === 'active');
      case 'pending':
        return mentorships.filter(m => m.status === 'pending');
      case 'requests':
        return mentorships.filter(m => m.status === 'pending' && m.mentor._id === localStorage.getItem('userId'));
      case 'completed':
        return mentorships.filter(m => m.status === 'completed');
      default:
        return [];
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <SpinnerLoader />
        </div>
      );
    }

    const filteredMentorships = getFilteredMentorships();

    if (filteredMentorships.length === 0) {
      return (
        <p className="text-gray-500 text-center py-8">
          {activeTab === 'active' && 'You have no active mentorships.'}
          {activeTab === 'pending' && 'You have no pending mentorship requests.'}
          {activeTab === 'requests' && 'You have no mentorship requests to respond to.'}
          {activeTab === 'completed' && 'You have no completed mentorships.'}
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6">
        {filteredMentorships.map((mentorship) => (
          <div
            key={mentorship._id}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {mentorship.mentee._id === localStorage.getItem('userId')
                    ? `Mentored by ${mentorship.mentor.name}`
                    : `Mentoring ${mentorship.mentee.name}`}
                </h3>
                <p className="text-sm text-gray-500">
                  {mentorship.status === 'active' && `Started on ${formatDate(mentorship.startDate)}`}
                  {mentorship.status === 'pending' && `Requested on ${formatDate(mentorship.createdAt)}`}
                  {mentorship.status === 'completed' && `Completed on ${formatDate(mentorship.endDate)}`}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${mentorship.status === 'active' ? 'bg-green-100 text-green-800' : mentorship.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                {mentorship.status.charAt(0).toUpperCase() + mentorship.status.slice(1)}
              </span>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Topics:</h4>
              <div className="flex flex-wrap gap-2">
                {mentorship.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {mentorship.goals && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Goals:</h4>
                <p className="text-gray-700">{mentorship.goals}</p>
              </div>
            )}

            <div className="flex justify-between items-center">
              {mentorship.status === 'pending' && mentorship.mentor._id === localStorage.getItem('userId') && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleRespondToRequest(mentorship._id, 'accepted')}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespondToRequest(mentorship._id, 'rejected')}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Decline
                  </button>
                </div>
              )}

              {mentorship.status === 'active' && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleViewMentorship(mentorship._id)}
                    className="text-amber-500 hover:text-amber-700 text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleEndMentorship(mentorship._id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    End Mentorship
                  </button>
                </div>
              )}

              {mentorship.status === 'completed' && (
                <button
                  onClick={() => handleViewMentorship(mentorship._id)}
                  className="text-amber-500 hover:text-amber-700 text-sm font-medium"
                >
                  View Summary
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Mentorship</h1>
          <button
            onClick={() => setShowRequestModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md"
            disabled={availableMentors.length === 0}
          >
            Find a Mentor
          </button>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'active' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pending' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'requests' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Requests
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'completed' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Completed
              </button>
            </nav>
          </div>
        </div>

        {renderTabContent()}

        {/* Request Mentorship Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Request Mentorship</h2>
              {availableMentors.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">No mentors are currently available.</p>
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequestMentorship}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Select Mentor</label>
                    <select
                      name="mentorId"
                      value={requestData.mentorId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    >
                      <option value="">Select a mentor</option>
                      {availableMentors.map((mentor) => (
                        <option key={mentor._id} value={mentor._id}>
                          {mentor.name} - {mentor.expertise.join(', ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Topics (comma separated)</label>
                    <input
                      type="text"
                      name="topics"
                      value={requestData.topics}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="React, JavaScript, System Design"
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Your Goals</label>
                    <textarea
                      name="goals"
                      value={requestData.goals}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      rows="3"
                      placeholder="What do you hope to achieve with this mentorship?"
                      required
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
                      {loading ? 'Submitting...' : 'Request Mentorship'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Mentorship;