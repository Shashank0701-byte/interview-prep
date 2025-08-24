import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
import { toast } from 'react-hot-toast';

const StudyGroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [studyGroup, setStudyGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [showInviteFriendModal, setShowInviteFriendModal] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    url: ''
  });
  const [inviteForm, setInviteForm] = useState({
    email: ''
  });
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudyGroupDetails();
  }, [groupId]);

  const fetchStudyGroupDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.STUDY_GROUPS.GET_ONE(groupId));
      setStudyGroup(response.data);
    } catch (error) {
      console.error('Error fetching study group details:', error);
      toast.error('Failed to load study group details');
      navigate('/study-groups');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setResourceForm({
      ...resourceForm,
      [name]: value
    });
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.post(API_PATHS.STUDY_GROUPS.ADD_RESOURCE(groupId), resourceForm);
      toast.success('Resource added successfully!');
      setShowAddResourceModal(false);
      fetchStudyGroupDetails();
      setResourceForm({
        title: '',
        description: '',
        url: ''
      });
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error('Failed to add resource');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this study group?')) {
      try {
        await axiosInstance.post(API_PATHS.STUDY_GROUPS.LEAVE(groupId));
        toast.success('You have left the study group');
        navigate('/study-groups');
      } catch (error) {
        console.error('Error leaving group:', error);
        toast.error('Failed to leave group');
      }
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm('Are you sure you want to delete this study group? This action cannot be undone.')) {
      try {
        await axiosInstance.delete(API_PATHS.STUDY_GROUPS.DELETE(groupId));
        toast.success('Study group deleted successfully');
        navigate('/study-groups');
      } catch (error) {
        console.error('Error deleting group:', error);
        toast.error('Failed to delete group');
      }
    }
  };

  const handleJoinRequest = async (requestId, action) => {
    try {
      await axiosInstance.post(API_PATHS.STUDY_GROUPS.HANDLE_REQUEST(groupId), {
        requestId,
        action
      });
      toast.success(`Request ${action === 'accept' ? 'accepted' : 'rejected'}`);
      fetchStudyGroupDetails();
    } catch (error) {
      console.error('Error handling join request:', error);
      toast.error('Failed to process request');
    }
  };

  const handleInviteInputChange = (e) => {
    const { name, value } = e.target;
    setInviteForm({
      ...inviteForm,
      [name]: value
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const searchUsers = async () => {
    if (searchTerm.trim().length < 2) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${API_PATHS.STUDY_GROUPS.SEARCH_USERS}?query=${searchTerm}`);
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
      setLoading(false);
    }
  };

  const handleInviteUser = async (userId) => {
    try {
      await axiosInstance.post(API_PATHS.STUDY_GROUPS.INVITE_USER(groupId), { userId });
      toast.success('Invitation sent successfully!');
      
      // Remove the invited user from the list
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    }
  };

  const handleSendEmailInvite = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(API_PATHS.STUDY_GROUPS.INVITE_BY_EMAIL(groupId), inviteForm);
      toast.success(`Invitation email sent to ${inviteForm.email}`);
      setInviteForm({ email: '' });
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    }
  };

  const isCreator = studyGroup?.creator?._id === localStorage.getItem('userId');

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {loading && !studyGroup ? (
          <div className="flex justify-center items-center h-64">
            <SpinnerLoader />
          </div>
        ) : studyGroup ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">{studyGroup.name}</h1>
              <div className="flex space-x-2">
                {isCreator ? (
                  <>
                    <button
                      onClick={() => setShowInviteFriendModal(true)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                    >
                      Invite Friends
                    </button>
                    <button
                      onClick={handleDeleteGroup}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                    >
                      Delete Group
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowInviteFriendModal(true)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                    >
                      Invite Friends
                    </button>
                    <button
                      onClick={handleLeaveGroup}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                    >
                      Leave Group
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowAddResourceModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md"
                >
                  Add Resource
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">About</h2>
                <p className="text-gray-700">{studyGroup.description}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Topics</h2>
                <div className="flex flex-wrap gap-2">
                  {studyGroup.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Members ({studyGroup.members.length}/{studyGroup.maxMembers})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studyGroup.members.map((member) => (
                    <div key={member._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                      {member.profileImageUrl ? (
                        <img
                          src={member.profileImageUrl}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      {member._id === studyGroup.creator._id && (
                        <span className="ml-auto text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                          Creator
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {isCreator && studyGroup.joinRequests && studyGroup.joinRequests.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Join Requests</h2>
                  <div className="space-y-3">
                    {studyGroup.joinRequests
                      .filter(request => request.status === 'pending')
                      .map((request) => (
                        <div key={request._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-3">
                            {request.user.profileImageUrl ? (
                              <img
                                src={request.user.profileImageUrl}
                                alt={request.user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold">
                                {request.user.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{request.user.name}</p>
                              <p className="text-sm text-gray-500">{request.user.email}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleJoinRequest(request._id, 'accept')}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleJoinRequest(request._id, 'reject')}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold mb-2">Resources</h2>
                {studyGroup.resources && studyGroup.resources.length > 0 ? (
                  <div className="space-y-4">
                    {studyGroup.resources.map((resource, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-md hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-lg mb-1">{resource.title}</h3>
                        <p className="text-gray-600 mb-2">{resource.description}</p>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-500 hover:text-amber-700 underline"
                        >
                          View Resource
                        </a>
                        <div className="mt-2 text-xs text-gray-500">
                          Added by {studyGroup.members.find(m => m._id === resource.addedBy)?.name || 'Unknown'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No resources have been added yet.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-xl text-gray-600">Study group not found</p>
            <button
              onClick={() => navigate('/study-groups')}
              className="mt-4 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md"
            >
              Back to Study Groups
            </button>
          </div>
        )}

        {/* Add Resource Modal */}
        {showAddResourceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Add Resource</h2>
              <form onSubmit={handleAddResource}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={resourceForm.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={resourceForm.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows="3"
                    required
                  ></textarea>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">URL</label>
                  <input
                    type="url"
                    name="url"
                    value={resourceForm.url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="https://example.com"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddResourceModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Resource'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invite Friend Modal */}
        {showInviteFriendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Invite Friends</h2>
              
              {/* Search for users */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Search for friends</label>
                <div className="flex">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Search by name or email"
                  />
                  <button
                    type="button"
                    onClick={searchUsers}
                    className="px-4 py-2 bg-amber-500 text-white rounded-r-md hover:bg-amber-600"
                  >
                    Search
                  </button>
                </div>
              </div>
              
              {/* Search results */}
              {users.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Search Results</h3>
                  <div className="max-h-40 overflow-y-auto">
                    {users.map(user => (
                      <div key={user._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleInviteUser(user._id)}
                          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                        >
                          Invite
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Invite by email */}
              <form onSubmit={handleSendEmailInvite} className="mb-6">
                <h3 className="font-medium mb-2">Or invite by email</h3>
                <div className="flex mb-2">
                  <input
                    type="email"
                    name="email"
                    value={inviteForm.email}
                    onChange={handleInviteInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="friend@example.com"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-r-md hover:bg-green-600"
                  >
                    Send
                  </button>
                </div>
                <p className="text-sm text-gray-500">An invitation email will be sent to this address</p>
              </form>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowInviteFriendModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudyGroupDetail;