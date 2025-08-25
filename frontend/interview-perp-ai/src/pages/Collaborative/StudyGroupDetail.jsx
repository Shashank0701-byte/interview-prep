import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader.jsx';
import CollaborativeNav from '../../components/Collaborative/CollaborativeNav.jsx';
import { FaUsers, FaLink, FaFile, FaVideo, FaPlus, FaPaperPlane, FaUserPlus } from 'react-icons/fa';

const StudyGroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [studyGroup, setStudyGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [newResource, setNewResource] = useState({
    title: '',
    type: 'link',
    url: '',
    description: ''
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const fetchStudyGroup = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(API_PATHS.COLLABORATIVE.STUDY_GROUPS.GET_ONE(groupId));
        setStudyGroup(response.data);
        
        // Check if current user is owner or member
        const userId = localStorage.getItem('userId');
        setIsOwner(response.data.creator._id === userId);
        setIsMember(response.data.members.some(member => member._id === userId));
        
        // Fetch messages if on messages tab
        if (activeTab === 'messages') {
          fetchMessages();
        }
      } catch (error) {
        console.error('Error fetching study group:', error);
        // Handle 404 or other errors
        if (error.response && error.response.status === 404) {
          navigate('/study-groups');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudyGroup();
  }, [groupId, navigate]);

  useEffect(() => {
    if (activeTab === 'messages' && studyGroup) {
      fetchMessages();
    }
  }, [activeTab]);

  const fetchMessages = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.COLLABORATIVE.STUDY_GROUPS.GET_MESSAGES(groupId));
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this study group?')) {
      try {
        await axiosInstance.post(API_PATHS.COLLABORATIVE.STUDY_GROUPS.LEAVE(groupId));
        navigate('/study-groups');
      } catch (error) {
        console.error('Error leaving group:', error);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axiosInstance.post(API_PATHS.COLLABORATIVE.STUDY_GROUPS.ADD_MESSAGE(groupId), {
        content: newMessage
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(API_PATHS.COLLABORATIVE.STUDY_GROUPS.ADD_RESOURCE(groupId), newResource);
      // Reset form
      setNewResource({
        title: '',
        type: 'link',
        url: '',
        description: ''
      });
      // Refresh study group data
      const response = await axiosInstance.get(API_PATHS.COLLABORATIVE.STUDY_GROUPS.GET_ONE(groupId));
      setStudyGroup(response.data);
    } catch (error) {
      console.error('Error adding resource:', error);
    }
  };

  const handleRemoveResource = async (resourceId) => {
    if (window.confirm('Are you sure you want to remove this resource?')) {
      try {
        await axiosInstance.delete(API_PATHS.COLLABORATIVE.STUDY_GROUPS.REMOVE_RESOURCE(groupId, resourceId));
        // Refresh study group data
        const response = await axiosInstance.get(API_PATHS.COLLABORATIVE.STUDY_GROUPS.GET_ONE(groupId));
        setStudyGroup(response.data);
      } catch (error) {
        console.error('Error removing resource:', error);
      }
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      await axiosInstance.post(API_PATHS.COLLABORATIVE.STUDY_GROUPS.INVITE_USER(groupId), {
        email: inviteEmail
      });
      setInviteEmail('');
      alert('Invitation sent successfully!');
    } catch (error) {
      console.error('Error inviting user:', error);
      alert('Failed to send invitation. ' + (error.response?.data?.message || 'Please try again.'));
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <SpinnerLoader />
        </div>
      </DashboardLayout>
    );
  }

  if (!studyGroup) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Study Group Not Found</h2>
            <p className="text-gray-600 mb-4">The study group you're looking for doesn't exist or you don't have permission to view it.</p>
            <button 
              onClick={() => navigate('/study-groups')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
            >
              Back to Study Groups
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/study-groups')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Study Groups
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{studyGroup.name}</h1>
              <p className="text-gray-600 mt-1">{studyGroup.description}</p>
            </div>
            
            {isMember && !isOwner && (
              <button 
                onClick={handleLeaveGroup}
                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md text-sm"
              >
                Leave Group
              </button>
            )}
          </div>
        </div>
        
        <CollaborativeNav activeItem="study-groups" />
        
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex border-b border-gray-200 mb-6">
            <button 
              className={`py-2 px-4 ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`py-2 px-4 ${activeTab === 'members' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('members')}
            >
              Members
            </button>
            <button 
              className={`py-2 px-4 ${activeTab === 'resources' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('resources')}
            >
              Resources
            </button>
            <button 
              className={`py-2 px-4 ${activeTab === 'messages' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('messages')}
            >
              Messages
            </button>
          </div>
          
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Group Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-3">
                      <span className="text-gray-600 block">Topic:</span>
                      <span className="font-medium">{studyGroup.topic}</span>
                    </div>
                    <div className="mb-3">
                      <span className="text-gray-600 block">Created by:</span>
                      <span className="font-medium">{studyGroup.creator.name}</span>
                    </div>
                    <div className="mb-3">
                      <span className="text-gray-600 block">Privacy:</span>
                      <span className="font-medium">{studyGroup.isPrivate ? 'Private' : 'Public'}</span>
                    </div>
                    <div className="mb-3">
                      <span className="text-gray-600 block">Members:</span>
                      <span className="font-medium">{studyGroup.members.length}/{studyGroup.maxMembers}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block">Created on:</span>
                      <span className="font-medium">{new Date(studyGroup.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {studyGroup.tags && studyGroup.tags.length > 0 ? (
                      studyGroup.tags.map((tag, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No tags added</p>
                    )}
                  </div>
                </div>
              </div>
              
              {isOwner && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-3">Group Management</h3>
                  <div className="flex space-x-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
                      Edit Group
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md">
                      Delete Group
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'members' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Members ({studyGroup.members.length}/{studyGroup.maxMembers})</h3>
                
                {isMember && (
                  <div>
                    <button 
                      onClick={() => document.getElementById('inviteModal').classList.remove('hidden')}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm flex items-center"
                    >
                      <FaUserPlus className="mr-1" /> Invite
                    </button>
                    
                    {/* Invite Modal */}
                    <div id="inviteModal" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Invite User</h3>
                        <form onSubmit={handleInviteUser}>
                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                              Email Address
                            </label>
                            <input
                              type="email"
                              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter email address"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div className="flex justify-end space-x-3">
                            <button 
                              type="button"
                              onClick={() => document.getElementById('inviteModal').classList.add('hidden')}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit"
                              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                            >
                              Send Invitation
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studyGroup.members.map(member => (
                  <div key={member._id} className="bg-gray-50 p-4 rounded-lg flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      {member.profileImageUrl ? (
                        <img 
                          src={member.profileImageUrl} 
                          alt={member.name} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 font-semibold">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                    {member._id === studyGroup.creator._id && (
                      <span className="ml-auto bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Owner
                      </span>
                    )}
                  </div>
                ))}
              </div>
              
              {studyGroup.pendingRequests && studyGroup.pendingRequests.length > 0 && isOwner && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-3">Pending Join Requests</h3>
                  <div className="space-y-3">
                    {studyGroup.pendingRequests.map(user => (
                      <div key={user._id} className="bg-yellow-50 p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                            {user.profileImageUrl ? (
                              <img 
                                src={user.profileImageUrl} 
                                alt={user.name} 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-yellow-600 font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-red-100 hover:bg-red-200 text-red-800 py-1 px-3 rounded-md text-sm">
                            Decline
                          </button>
                          <button className="bg-green-100 hover:bg-green-200 text-green-800 py-1 px-3 rounded-md text-sm">
                            Accept
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'resources' && (
            <div>
              {isMember && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Add Resource</h3>
                  <form onSubmit={handleAddResource} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Resource title"
                          value={newResource.title}
                          onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Type
                        </label>
                        <select
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newResource.type}
                          onChange={(e) => setNewResource({...newResource, type: e.target.value})}
                          required
                        >
                          <option value="link">Link</option>
                          <option value="document">Document</option>
                          <option value="video">Video</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        URL
                      </label>
                      <input
                        type="url"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com"
                        value={newResource.url}
                        onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Description (optional)
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Brief description of the resource"
                        rows="3"
                        value={newResource.description}
                        onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                      ></textarea>
                    </div>
                    <div className="flex justify-end">
                      <button 
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
                      >
                        <FaPlus className="mr-2" /> Add Resource
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              <h3 className="text-lg font-semibold mb-3">Resources</h3>
              
              {studyGroup.resources && studyGroup.resources.length > 0 ? (
                <div className="space-y-4">
                  {studyGroup.resources.map(resource => (
                    <div key={resource._id} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="mr-3 mt-1">
                            {resource.type === 'link' && <FaLink className="text-blue-500" />}
                            {resource.type === 'document' && <FaFile className="text-green-500" />}
                            {resource.type === 'video' && <FaVideo className="text-red-500" />}
                            {resource.type === 'other' && <FaFile className="text-gray-500" />}
                          </div>
                          <div>
                            <h4 className="font-medium">
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {resource.title}
                              </a>
                            </h4>
                            {resource.description && (
                              <p className="text-gray-600 text-sm mt-1">{resource.description}</p>
                            )}
                            <div className="flex items-center text-xs text-gray-500 mt-2">
                              <span>Added by {resource.addedBy.name}</span>
                              <span className="mx-2">•</span>
                              <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        {(isOwner || resource.addedBy._id === localStorage.getItem('userId')) && (
                          <button 
                            onClick={() => handleRemoveResource(resource._id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No resources have been added yet.</p>
                  {isMember && (
                    <p className="text-gray-500 mt-2">Be the first to share a helpful resource!</p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'messages' && (
            <div>
              <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4">
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map(message => (
                      <div key={message._id} className="flex">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                          {message.sender.profileImageUrl ? (
                            <img 
                              src={message.sender.profileImageUrl} 
                              alt={message.sender.name} 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-blue-600 font-semibold text-xs">
                              {message.sender.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline">
                            <span className="font-medium text-sm">{message.sender.name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(message.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-800 mt-1">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>
              
              {isMember && (
                <form onSubmit={handleSendMessage} className="flex">
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    required
                  />
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-r-md flex items-center"
                  >
                    <FaPaperPlane className="mr-2" /> Send
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudyGroupDetail;