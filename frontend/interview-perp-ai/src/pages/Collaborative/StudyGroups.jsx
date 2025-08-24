import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
import { toast } from 'react-hot-toast';

const StudyGroups = () => {
  const navigate = useNavigate();
  const [studyGroups, setStudyGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topics: '',
    isPublic: true,
    maxMembers: 10
  });

  useEffect(() => {
    fetchStudyGroups();
    fetchUserGroups();
  }, []);

  const fetchStudyGroups = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.STUDY_GROUPS.GET_ALL);
      setStudyGroups(response.data);
    } catch (error) {
      console.error('Error fetching study groups:', error);
      toast.error('Failed to load study groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.STUDY_GROUPS.GET_USER_GROUPS);
      setUserGroups(response.data);
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const topicsArray = formData.topics.split(',').map(topic => topic.trim());
      const payload = {
        ...formData,
        topics: topicsArray
      };
      
      await axiosInstance.post(API_PATHS.STUDY_GROUPS.CREATE, payload);
      toast.success('Study group created successfully!');
      setShowCreateModal(false);
      fetchStudyGroups();
      fetchUserGroups();
      setFormData({
        name: '',
        description: '',
        topics: '',
        isPublic: true,
        maxMembers: 10
      });
    } catch (error) {
      console.error('Error creating study group:', error);
      toast.error('Failed to create study group');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await axiosInstance.post(API_PATHS.STUDY_GROUPS.JOIN(groupId));
      toast.success('Join request sent successfully!');
      fetchStudyGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join group');
    }
  };

  const handleViewGroup = (groupId) => {
    navigate(`/study-groups/${groupId}`);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Study Groups</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md"
          >
            Create New Group
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <SpinnerLoader />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* My Groups Section */}
            {userGroups.length > 0 && (
              <div className="col-span-full mb-8">
                <h2 className="text-xl font-semibold mb-4">My Groups</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userGroups.map((group) => (
                    <div
                      key={group._id}
                      className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                    >
                      <h3 className="text-lg font-semibold mb-2">{group.name}</h3>
                      <p className="text-gray-600 mb-4">{group.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {group.topics.map((topic, index) => (
                          <span
                            key={index}
                            className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {group.members.length}/{group.maxMembers} members
                        </span>
                        <button
                          onClick={() => handleViewGroup(group._id)}
                          className="text-amber-500 hover:text-amber-700"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Groups */}
            <div className="col-span-full">
              <h2 className="text-xl font-semibold mb-4">Available Groups</h2>
              {studyGroups.length === 0 ? (
                <p className="text-gray-500">No study groups available. Create one to get started!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studyGroups
                    .filter(group => !userGroups.some(ug => ug._id === group._id))
                    .map((group) => (
                      <div
                        key={group._id}
                        className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold">{group.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${group.isPublic ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {group.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{group.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {group.topics.map((topic, index) => (
                            <span
                              key={index}
                              className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            {group.members.length}/{group.maxMembers} members
                          </span>
                          <button
                            onClick={() => handleJoinGroup(group._id)}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-md text-sm"
                            disabled={group.members.length >= group.maxMembers}
                          >
                            {group.members.length >= group.maxMembers ? 'Full' : 'Join'}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Create New Study Group</h2>
              <form onSubmit={handleCreateGroup}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Group Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
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
                  <label className="block text-gray-700 mb-2">Topics (comma separated)</label>
                  <input
                    type="text"
                    name="topics"
                    value={formData.topics}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="React, JavaScript, Algorithms"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Maximum Members</label>
                  <input
                    type="number"
                    name="maxMembers"
                    value={formData.maxMembers}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    min="2"
                    max="50"
                    required
                  />
                </div>
                <div className="mb-6 flex items-center">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label>Public Group (anyone can join)</label>
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
                    {loading ? 'Creating...' : 'Create Group'}
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

export default StudyGroups;