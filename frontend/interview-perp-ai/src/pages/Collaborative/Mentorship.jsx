import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader.jsx';
import CollaborativeNav from '../../components/Collaborative/CollaborativeNav.jsx';
import { FaPlus, FaCheck, FaTimes, FaCalendarAlt, FaComment, FaUserFriends, FaChalkboardTeacher } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Mentorship = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('myMentorships');
  const [mentorships, setMentorships] = useState([]);
  const [availableMentors, setAvailableMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestData, setRequestData] = useState({
    mentorId: '',
    focusAreas: [],
    requestMessage: ''
  });
  const [focusAreaInput, setFocusAreaInput] = useState('');

  useEffect(() => {
    fetchMentorships();
    if (activeTab === 'findMentor') {
      fetchAvailableMentors();
    }
  }, [activeTab]);

  const fetchMentorships = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.COLLABORATIVE.MENTORSHIPS.GET_ALL);
      setMentorships(response.data);
    } catch (error) {
      console.error('Error fetching mentorships:', error);
      toast.error('Failed to load mentorships: ' + (error.response?.data?.message || error.message || 'Unknown error'));
      // Set empty array to prevent undefined errors
      setMentorships([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMentors = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.COLLABORATIVE.MENTORSHIPS.GET_AVAILABLE_MENTORS);
      setAvailableMentors(response.data);
    } catch (error) {
      console.error('Error fetching available mentors:', error);
      toast.error('Failed to load available mentors: ' + (error.response?.data?.message || error.message || 'Unknown error'));
      // Set empty array to prevent undefined errors
      setAvailableMentors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMentorship = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(API_PATHS.COLLABORATIVE.MENTORSHIPS.REQUEST, requestData);
      toast.success('Mentorship request sent successfully');
      setRequestModalOpen(false);
      setRequestData({
        mentorId: '',
        focusAreas: [],
        requestMessage: ''
      });
      setActiveTab('myMentorships');
      fetchMentorships();
    } catch (error) {
      console.error('Error requesting mentorship:', error);
      toast.error(error.response?.data?.message || 'Failed to send mentorship request');
    }
  };

  const handleRespondToRequest = async (mentorshipId, response) => {
    try {
      await axiosInstance.post(
        API_PATHS.COLLABORATIVE.MENTORSHIPS.RESPOND(mentorshipId),
        { response, responseMessage: response === 'accept' ? 'I accept your mentorship request' : 'Sorry, I cannot mentor you at this time' }
      );
      toast.success(`Mentorship request ${response === 'accept' ? 'accepted' : 'rejected'}`);
      fetchMentorships();
    } catch (error) {
      console.error('Error responding to mentorship request:', error);
      toast.error('Failed to respond to mentorship request');
    }
  };

  const handleEndMentorship = async (mentorshipId) => {
    if (window.confirm('Are you sure you want to end this mentorship?')) {
      try {
        await axiosInstance.post(API_PATHS.COLLABORATIVE.MENTORSHIPS.END(mentorshipId));
        toast.success('Mentorship ended successfully');
        fetchMentorships();
      } catch (error) {
        console.error('Error ending mentorship:', error);
        toast.error('Failed to end mentorship');
      }
    }
  };

  const handleViewMentorship = (mentorshipId) => {
    navigate(`/mentorship/${mentorshipId}`);
  };

  const handleAddFocusArea = () => {
    if (focusAreaInput.trim()) {
      setRequestData({
        ...requestData,
        focusAreas: [...requestData.focusAreas, focusAreaInput.trim()]
      });
      setFocusAreaInput('');
    }
  };

  const handleRemoveFocusArea = (index) => {
    const updatedFocusAreas = [...requestData.focusAreas];
    updatedFocusAreas.splice(index, 1);
    setRequestData({
      ...requestData,
      focusAreas: updatedFocusAreas
    });
  };

  const openRequestModal = (mentor) => {
    setSelectedMentor(mentor);
    setRequestData({
      ...requestData,
      mentorId: mentor._id
    });
    setRequestModalOpen(true);
  };

  const renderMentorshipsList = () => {
    if (mentorships.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500">You don't have any mentorships yet.</p>
          <button 
            onClick={() => setActiveTab('findMentor')} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Find a Mentor
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentorships.map((mentorship) => {
          const isMentor = mentorship.mentor._id === localStorage.getItem('userId');
          const otherPerson = isMentor ? mentorship.mentee : mentorship.mentor;
          
          return (
            <div key={mentorship._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {isMentor ? 'Mentoring' : 'Mentored by'}: {otherPerson.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(mentorship.status)}`}>
                    {mentorship.status.charAt(0).toUpperCase() + mentorship.status.slice(1)}
                  </span>
                </div>
                
                {mentorship.focusAreas && mentorship.focusAreas.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Focus Areas:</p>
                    <div className="flex flex-wrap gap-2">
                      {mentorship.focusAreas.map((area, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <FaCalendarAlt className="mr-2" />
                  <span>Started: {mentorship.startDate ? new Date(mentorship.startDate).toLocaleDateString() : 'Not started yet'}</span>
                </div>
                
                {mentorship.progress > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Progress:</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${mentorship.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-right mt-1">{mentorship.progress}%</p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {mentorship.status === 'pending' && isMentor && (
                    <>
                      <button 
                        onClick={() => handleRespondToRequest(mentorship._id, 'accept')} 
                        className="flex items-center bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        <FaCheck className="mr-1" /> Accept
                      </button>
                      <button 
                        onClick={() => handleRespondToRequest(mentorship._id, 'reject')} 
                        className="flex items-center bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        <FaTimes className="mr-1" /> Reject
                      </button>
                    </>
                  )}
                  
                  {mentorship.status === 'active' && (
                    <>
                      <button 
                        onClick={() => handleViewMentorship(mentorship._id)} 
                        className="flex items-center bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        <FaComment className="mr-1" /> View Details
                      </button>
                      <button 
                        onClick={() => handleEndMentorship(mentorship._id)} 
                        className="flex items-center bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                      >
                        <FaTimes className="mr-1" /> End Mentorship
                      </button>
                    </>
                  )}
                  
                  {mentorship.status === 'completed' && (
                    <button 
                      onClick={() => handleViewMentorship(mentorship._id)} 
                      className="flex items-center bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      <FaComment className="mr-1" /> View Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAvailableMentors = () => {
    if (availableMentors.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500">No mentors available at the moment.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableMentors.map((mentor) => (
          <div key={mentor._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                {mentor.profileImageUrl ? (
                  <img 
                    src={mentor.profileImageUrl} 
                    alt={mentor.name} 
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-4">
                    <span className="text-gray-600 text-lg">{mentor.name.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{mentor.name}</h3>
                  <p className="text-sm text-gray-500">{mentor.email}</p>
                </div>
              </div>
              
              {mentor.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{mentor.bio}</p>
              )}
              
              {mentor.skills && mentor.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => openRequestModal(mentor)} 
                className="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <FaUserFriends className="mr-2" /> Request Mentorship
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mentorship</h1>
        
        <CollaborativeNav activeTab="mentorship" />
        
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'myMentorships' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('myMentorships')}
            >
              My Mentorships
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'findMentor' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('findMentor')}
            >
              Find a Mentor
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <SpinnerLoader />
            </div>
          ) : (
            <div>
              {activeTab === 'myMentorships' && renderMentorshipsList()}
              {activeTab === 'findMentor' && renderAvailableMentors()}
            </div>
          )}
        </div>
      </div>
      
      {/* Mentorship Request Modal */}
      {requestModalOpen && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Request Mentorship from {selectedMentor.name}</h2>
            
            <form onSubmit={handleRequestMentorship}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Focus Areas</label>
                <div className="flex">
                  <input
                    type="text"
                    value={focusAreaInput}
                    onChange={(e) => setFocusAreaInput(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., JavaScript, React, Career Advice"
                  />
                  <button
                    type="button"
                    onClick={handleAddFocusArea}
                    className="bg-blue-600 text-white px-3 py-2 rounded-r hover:bg-blue-700 transition-colors"
                  >
                    <FaPlus />
                  </button>
                </div>
                
                {requestData.focusAreas.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {requestData.focusAreas.map((area, index) => (
                      <span 
                        key={index} 
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center"
                      >
                        {area}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveFocusArea(index)} 
                          className="ml-1 text-blue-800 hover:text-blue-900"
                        >
                          <FaTimes size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={requestData.requestMessage}
                  onChange={(e) => setRequestData({...requestData, requestMessage: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Explain why you'd like this person to mentor you and what you hope to achieve"
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Mentorship;