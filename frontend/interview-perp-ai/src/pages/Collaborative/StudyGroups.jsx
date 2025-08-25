import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader.jsx';
import CollaborativeNav from '../../components/Collaborative/CollaborativeNav.jsx';
import { FaUsers, FaPlus, FaSearch, FaFilter, FaTags } from 'react-icons/fa';

const StudyGroups = () => {
  const navigate = useNavigate();
  const [studyGroups, setStudyGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterTag, setFilterTag] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch different data based on active tab
        if (activeTab === 'discover') {
          const response = await axiosInstance.get(API_PATHS.COLLABORATIVE.STUDY_GROUPS.GET_ALL);
          setStudyGroups(response.data);
        } else if (activeTab === 'my-groups') {
          const [createdRes, joinedRes] = await Promise.all([
            axiosInstance.get(API_PATHS.COLLABORATIVE.STUDY_GROUPS.USER_CREATED),
            axiosInstance.get(API_PATHS.COLLABORATIVE.STUDY_GROUPS.USER_JOINED)
          ]);
          setUserGroups([...createdRes.data, ...joinedRes.data]);
        } else if (activeTab === 'invitations') {
          const response = await axiosInstance.get(API_PATHS.COLLABORATIVE.STUDY_GROUPS.USER_INVITATIONS);
          setInvitations(response.data);
        }
      } catch (error) {
        console.error('Error fetching study groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleCreateGroup = () => {
    // Navigate to create group page or open modal
    // For now, let's just log
    console.log('Create new study group');
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await axiosInstance.post(API_PATHS.COLLABORATIVE.STUDY_GROUPS.JOIN(groupId));
      // Refresh the list
      const response = await axiosInstance.get(API_PATHS.COLLABORATIVE.STUDY_GROUPS.GET_ALL);
      setStudyGroups(response.data);
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleRequestJoin = async (groupId) => {
    try {
      await axiosInstance.post(API_PATHS.COLLABORATIVE.STUDY_GROUPS.REQUEST_JOIN(groupId));
      // Show success message or update UI
    } catch (error) {
      console.error('Error requesting to join:', error);
    }
  };

  const handleRespondInvitation = async (invitationId, response) => {
    try {
      await axiosInstance.post(
        API_PATHS.COLLABORATIVE.STUDY_GROUPS.RESPOND_INVITATION(invitationId),
        { response }
      );
      // Refresh invitations
      const invitationsRes = await axiosInstance.get(API_PATHS.COLLABORATIVE.STUDY_GROUPS.USER_INVITATIONS);
      setInvitations(invitationsRes.data);
    } catch (error) {
      console.error('Error responding to invitation:', error);
    }
  };

  const handleViewGroup = (groupId) => {
    navigate(`/study-groups/${groupId}`);
  };

  const renderDiscoverGroups = () => {
    const filteredGroups = studyGroups.filter(group => {
      const matchesSearch = searchTerm === '' || 
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTopic = filterTopic === '' || group.topic === filterTopic;
      
      const matchesTag = filterTag === '' || 
        (group.tags && group.tags.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase())));
      
      return matchesSearch && matchesTopic && matchesTag;
    });

    if (filteredGroups.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500">No study groups found matching your criteria.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map(group => (
          <div key={group._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
            <p className="text-gray-600 mb-4">{group.description}</p>
            
            <div className="flex items-center mb-3">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {group.topic}
              </span>
              <span className="ml-auto text-sm text-gray-500">
                {group.members.length}/{group.maxMembers} members
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {group.tags && group.tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <button 
                onClick={() => handleViewGroup(group._id)}
                className="text-blue-600 hover:text-blue-800"
              >
                View Details
              </button>
              
              {group.isPrivate ? (
                <button 
                  onClick={() => handleRequestJoin(group._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm"
                >
                  Request to Join
                </button>
              ) : (
                <button 
                  onClick={() => handleJoinGroup(group._id)}
                  className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md text-sm"
                >
                  Join Group
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMyGroups = () => {
    if (userGroups.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500">You haven't joined any study groups yet.</p>
          <button 
            onClick={() => setActiveTab('discover')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            Discover Groups
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userGroups.map(group => (
          <div key={group._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold">{group.name}</h3>
              {group.creator._id === localStorage.getItem('userId') && (
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Owner
                </span>
              )}
            </div>
            
            <p className="text-gray-600 mb-4">{group.description}</p>
            
            <div className="flex items-center mb-3">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {group.topic}
              </span>
              <span className="ml-auto text-sm text-gray-500">
                {group.members.length}/{group.maxMembers} members
              </span>
            </div>
            
            <button 
              onClick={() => handleViewGroup(group._id)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
            >
              View Group
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderInvitations = () => {
    if (invitations.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500">You don't have any pending invitations.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {invitations.map(invitation => (
          <div key={invitation._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-1">{invitation.group.name}</h3>
            <p className="text-sm text-gray-500 mb-3">
              Invited by {invitation.invitedBy.name} on {new Date(invitation.invitedAt).toLocaleDateString()}
            </p>
            <p className="text-gray-600 mb-4">{invitation.group.description}</p>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => handleRespondInvitation(invitation._id, 'declined')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded-md text-sm"
              >
                Decline
              </button>
              <button 
                onClick={() => handleRespondInvitation(invitation._id, 'accepted')}
                className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md text-sm"
              >
                Accept
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Study Groups</h1>
          <button 
            onClick={handleCreateGroup}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" /> Create Group
          </button>
        </div>
        
        <CollaborativeNav activeItem="study-groups" />
        
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex border-b border-gray-200">
            <button 
              className={`py-2 px-4 ${activeTab === 'discover' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('discover')}
            >
              Discover
            </button>
            <button 
              className={`py-2 px-4 ${activeTab === 'my-groups' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('my-groups')}
            >
              My Groups
            </button>
            <button 
              className={`py-2 px-4 ${activeTab === 'invitations' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('invitations')}
            >
              Invitations
            </button>
          </div>
          
          {activeTab === 'discover' && (
            <div className="mt-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="pl-10 w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search study groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="md:w-1/4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaFilter className="text-gray-400" />
                    </div>
                    <select
                      className="pl-10 w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filterTopic}
                      onChange={(e) => setFilterTopic(e.target.value)}
                    >
                      <option value="">All Topics</option>
                      <option value="Programming">Programming</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Design">Design</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="md:w-1/4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaTags className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="pl-10 w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Filter by tag..."
                      value={filterTag}
                      onChange={(e) => setFilterTag(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center py-10">
              <SpinnerLoader />
            </div>
          ) : (
            <div className="mt-6">
              {activeTab === 'discover' && renderDiscoverGroups()}
              {activeTab === 'my-groups' && renderMyGroups()}
              {activeTab === 'invitations' && renderInvitations()}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudyGroups;