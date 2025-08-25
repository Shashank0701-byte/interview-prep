const StudyGroup = require('../../models/collaborative/StudyGroup');
const User = require('../../models/User');

// Create a new study group
exports.createStudyGroup = async (req, res) => {
    try {
        const { name, description, topic, isPrivate, maxMembers, tags } = req.body;
        const userId = req.user.id;

        const newStudyGroup = new StudyGroup({
            name,
            description,
            topic,
            creator: userId,
            members: [userId], // Creator is automatically a member
            isPrivate: isPrivate || false,
            maxMembers: maxMembers || 10,
            tags: tags || []
        });

        await newStudyGroup.save();
        res.status(201).json(newStudyGroup);
    } catch (error) {
        console.error('Error creating study group:', error);
        res.status(500).json({ message: 'Failed to create study group' });
    }
};

// Get all study groups (with filtering options)
exports.getAllStudyGroups = async (req, res) => {
    try {
        const { topic, search, tag } = req.query;
        const query = {};

        // Apply filters if provided
        if (topic) query.topic = topic;
        if (tag) query.tags = { $in: [tag] };
        if (search) query.name = { $regex: search, $options: 'i' };

        // Only show public groups or groups where the user is a member
        query.$or = [
            { isPrivate: false },
            { members: req.user.id }
        ];

        const studyGroups = await StudyGroup.find(query)
            .populate('creator', 'name email profileImageUrl')
            .populate('members', 'name email profileImageUrl')
            .sort({ createdAt: -1 });

        res.status(200).json(studyGroups);
    } catch (error) {
        console.error('Error fetching study groups:', error);
        res.status(500).json({ message: 'Failed to fetch study groups' });
    }
};

// Get a specific study group by ID
exports.getStudyGroupById = async (req, res) => {
    try {
        const groupId = req.params.id;

        const studyGroup = await StudyGroup.findById(groupId)
            .populate('creator', 'name email profileImageUrl')
            .populate('members', 'name email profileImageUrl')
            .populate('pendingRequests', 'name email profileImageUrl')
            .populate('invitations.user', 'name email profileImageUrl')
            .populate('invitations.invitedBy', 'name email profileImageUrl')
            .populate('resources.addedBy', 'name email profileImageUrl')
            .populate('messages.sender', 'name email profileImageUrl');

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Check if the user has access to this group
        const userId = req.user.id;
        const isMember = studyGroup.members.some(member => member._id.toString() === userId);
        
        if (studyGroup.isPrivate && !isMember) {
            return res.status(403).json({ message: 'You do not have access to this private study group' });
        }

        res.status(200).json(studyGroup);
    } catch (error) {
        console.error('Error fetching study group:', error);
        res.status(500).json({ message: 'Failed to fetch study group' });
    }
};

// Join a study group
exports.joinStudyGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        const userId = req.user.id;

        const studyGroup = await StudyGroup.findById(groupId);

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Check if the group is private
        if (studyGroup.isPrivate) {
            // Add user to pending requests
            if (!studyGroup.pendingRequests.includes(userId)) {
                studyGroup.pendingRequests.push(userId);
                await studyGroup.save();
                return res.status(200).json({ message: 'Join request sent to group admin' });
            } else {
                return res.status(400).json({ message: 'Join request already pending' });
            }
        }

        // For public groups, add user directly if not already a member
        if (studyGroup.members.includes(userId)) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }

        // Check if the group is full
        if (studyGroup.members.length >= studyGroup.maxMembers) {
            return res.status(400).json({ message: 'This group has reached its maximum capacity' });
        }

        studyGroup.members.push(userId);
        await studyGroup.save();

        res.status(200).json({ message: 'Successfully joined the study group' });
    } catch (error) {
        console.error('Error joining study group:', error);
        res.status(500).json({ message: 'Failed to join study group' });
    }
};

// Leave a study group
exports.leaveStudyGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        const userId = req.user.id;

        const studyGroup = await StudyGroup.findById(groupId);

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Check if user is a member
        if (!studyGroup.members.includes(userId)) {
            return res.status(400).json({ message: 'You are not a member of this group' });
        }

        // Check if user is the creator
        if (studyGroup.creator.toString() === userId) {
            return res.status(400).json({ message: 'As the creator, you cannot leave the group. You must delete it or transfer ownership first.' });
        }

        // Remove user from members
        studyGroup.members = studyGroup.members.filter(id => id.toString() !== userId);
        await studyGroup.save();

        res.status(200).json({ message: 'Successfully left the study group' });
    } catch (error) {
        console.error('Error leaving study group:', error);
        res.status(500).json({ message: 'Failed to leave study group' });
    }
};

// Update a study group
exports.updateStudyGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        const userId = req.user.id;
        const { name, description, topic, isPrivate, maxMembers, tags } = req.body;

        const studyGroup = await StudyGroup.findById(groupId);

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Check if user is the creator
        if (studyGroup.creator.toString() !== userId) {
            return res.status(403).json({ message: 'Only the group creator can update the group' });
        }

        // Update fields
        if (name) studyGroup.name = name;
        if (description) studyGroup.description = description;
        if (topic) studyGroup.topic = topic;
        if (isPrivate !== undefined) studyGroup.isPrivate = isPrivate;
        if (maxMembers) studyGroup.maxMembers = maxMembers;
        if (tags) studyGroup.tags = tags;

        await studyGroup.save();

        res.status(200).json(studyGroup);
    } catch (error) {
        console.error('Error updating study group:', error);
        res.status(500).json({ message: 'Failed to update study group' });
    }
};

// Delete a study group
exports.deleteStudyGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        const userId = req.user.id;

        const studyGroup = await StudyGroup.findById(groupId);

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Check if user is the creator
        if (studyGroup.creator.toString() !== userId) {
            return res.status(403).json({ message: 'Only the group creator can delete the group' });
        }

        await StudyGroup.findByIdAndDelete(groupId);

        res.status(200).json({ message: 'Study group deleted successfully' });
    } catch (error) {
        console.error('Error deleting study group:', error);
        res.status(500).json({ message: 'Failed to delete study group' });
    }
};

// Respond to join requests (accept/reject)
exports.respondToJoinRequest = async (req, res) => {
    try {
        const { action, userId } = req.body;
        const groupId = req.params.id;
        const currentUserId = req.user.id;

        const studyGroup = await StudyGroup.findById(groupId);

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Check if current user is the creator or admin
        if (studyGroup.creator.toString() !== currentUserId) {
            return res.status(403).json({ message: 'Only the group creator can handle join requests' });
        }

        // Check if the user has a pending request
        if (!studyGroup.pendingRequests.includes(userId)) {
            return res.status(400).json({ message: 'No pending request found for this user' });
        }

        // Remove from pending requests
        studyGroup.pendingRequests = studyGroup.pendingRequests.filter(id => id.toString() !== userId);

        if (action === 'accept') {
            // Check if the group is full
            if (studyGroup.members.length >= studyGroup.maxMembers) {
                return res.status(400).json({ message: 'This group has reached its maximum capacity' });
            }

            // Add to members
            studyGroup.members.push(userId);
        }

        await studyGroup.save();

        res.status(200).json({ 
            message: action === 'accept' ? 'User added to the group' : 'Request rejected' 
        });
    } catch (error) {
        console.error('Error handling join request:', error);
        res.status(500).json({ message: 'Failed to handle join request' });
    }
};

// Add a message to a study group
exports.addMessage = async (req, res) => {
    try {
        const { content } = req.body;
        const groupId = req.params.id;
        const userId = req.user.id;

        const studyGroup = await StudyGroup.findById(groupId);

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Check if user is a member
        if (!studyGroup.members.includes(userId)) {
            return res.status(403).json({ message: 'Only members can send messages' });
        }

        const newMessage = {
            content,
            sender: userId,
            sentAt: new Date()
        };

        studyGroup.messages.push(newMessage);
        await studyGroup.save();

        // Populate the sender field before sending response
        const addedMessage = studyGroup.messages[studyGroup.messages.length - 1];
        await StudyGroup.populate(addedMessage, { path: 'sender', select: 'name email profileImageUrl' });

        res.status(201).json(addedMessage);
    } catch (error) {
        console.error('Error adding message:', error);
        res.status(500).json({ message: 'Failed to add message' });
    }
};

// Respond to invitation
exports.respondToInvitation = async (req, res) => {
    try {
        const { action } = req.body;
        const groupId = req.params.id;
        const userId = req.user.id;

        const studyGroup = await StudyGroup.findById(groupId);

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Find the invitation for this user
        const invitationIndex = studyGroup.invitations.findIndex(
            inv => (inv.user && inv.user.toString() === userId) || 
                  (inv.email && inv.email === req.user.email)
        );

        if (invitationIndex === -1) {
            return res.status(400).json({ message: 'No invitation found for you in this group' });
        }

        // Remove the invitation
        studyGroup.invitations.splice(invitationIndex, 1);

        if (action === 'accept') {
            // Check if the group is full
            if (studyGroup.members.length >= studyGroup.maxMembers) {
                return res.status(400).json({ message: 'This group has reached its maximum capacity' });
            }

            // Check if already a member
            if (!studyGroup.members.includes(userId)) {
                studyGroup.members.push(userId);
            }
        }

        await studyGroup.save();

        res.status(200).json({ 
            message: action === 'accept' ? 'You have joined the group' : 'Invitation declined' 
        });
    } catch (error) {
        console.error('Error responding to invitation:', error);
        res.status(500).json({ message: 'Failed to process invitation response' });
    }
};

// Remove a resource from a study group
exports.removeResource = async (req, res) => {
    try {
        const groupId = req.params.id;
        const resourceId = req.params.resourceId;
        const userId = req.user.id;

        const studyGroup = await StudyGroup.findById(groupId);

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Find the resource
        const resourceIndex = studyGroup.resources.findIndex(r => r._id.toString() === resourceId);

        if (resourceIndex === -1) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        const resource = studyGroup.resources[resourceIndex];

        // Check if user is the creator of the group or the one who added the resource
        if (studyGroup.creator.toString() !== userId && resource.addedBy.toString() !== userId) {
            return res.status(403).json({ message: 'You do not have permission to remove this resource' });
        }

        // Remove the resource
        studyGroup.resources.splice(resourceIndex, 1);
        await studyGroup.save();

        res.status(200).json({ message: 'Resource removed successfully' });
    } catch (error) {
        console.error('Error removing resource:', error);
        res.status(500).json({ message: 'Failed to remove resource' });
    }
};

// Get messages for a study group
exports.getMessages = async (req, res) => {
    try {
        const groupId = req.params.id;
        const userId = req.user.id;

        const studyGroup = await StudyGroup.findById(groupId);

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Check if user is a member
        if (!studyGroup.members.includes(userId)) {
            return res.status(403).json({ message: 'Only members can view messages' });
        }

        // Populate sender information
        await StudyGroup.populate(studyGroup, { path: 'messages.sender', select: 'name email profileImageUrl' });

        res.status(200).json(studyGroup.messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
};

// Invite a user to a study group
exports.inviteUser = async (req, res) => {
    try {
        const { email } = req.body;
        const groupId = req.params.id;
        const userId = req.user.id;

        const studyGroup = await StudyGroup.findById(groupId);

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Check if user is a member
        if (!studyGroup.members.includes(userId)) {
            return res.status(403).json({ message: 'Only members can invite others' });
        }

        // Check if the group is full
        if (studyGroup.members.length >= studyGroup.maxMembers) {
            return res.status(400).json({ message: 'This group has reached its maximum capacity' });
        }

        // Check if user is already invited
        const existingInvitation = studyGroup.invitations.find(inv => inv.email === email);
        if (existingInvitation) {
            return res.status(400).json({ message: 'User has already been invited' });
        }

        // Check if user is already a member
        const invitedUser = await User.findOne({ email });
        if (invitedUser && studyGroup.members.includes(invitedUser._id)) {
            return res.status(400).json({ message: 'User is already a member of this group' });
        }

        // Create invitation
        const invitation = {
            email,
            user: invitedUser ? invitedUser._id : null,
            invitedBy: userId,
            invitedAt: new Date()
        };

        studyGroup.invitations.push(invitation);
        await studyGroup.save();

        res.status(200).json({ message: 'Invitation sent successfully' });
    } catch (error) {
        console.error('Error inviting user:', error);
        res.status(500).json({ message: 'Failed to send invitation' });
    }
};

// Get study groups created by the current user
exports.getUserCreatedGroups = async (req, res) => {
    try {
        const userId = req.user.id;

        const studyGroups = await StudyGroup.find({ creator: userId })
            .populate('creator', 'name email profileImageUrl')
            .populate('members', 'name email profileImageUrl')
            .sort({ createdAt: -1 });

        res.status(200).json(studyGroups);
    } catch (error) {
        console.error('Error fetching user created groups:', error);
        res.status(500).json({ message: 'Failed to fetch user created groups' });
    }
};

// Get study groups joined by the current user
exports.getUserJoinedGroups = async (req, res) => {
    try {
        const userId = req.user.id;

        const studyGroups = await StudyGroup.find({ 
            members: userId,
            creator: { $ne: userId } // Exclude groups created by the user
        })
            .populate('creator', 'name email profileImageUrl')
            .populate('members', 'name email profileImageUrl')
            .sort({ createdAt: -1 });

        res.status(200).json(studyGroups);
    } catch (error) {
        console.error('Error fetching user joined groups:', error);
        res.status(500).json({ message: 'Failed to fetch user joined groups' });
    }
};

// Get study group invitations for the current user
exports.getUserInvitations = async (req, res) => {
    try {
        const userId = req.user.id;
        const userEmail = req.user.email;

        const studyGroups = await StudyGroup.find({
            'invitations': {
                $elemMatch: {
                    $or: [
                        { user: userId },
                        { email: userEmail }
                    ]
                }
            }
        })
            .populate('creator', 'name email profileImageUrl')
            .populate('invitations.invitedBy', 'name email profileImageUrl')
            .sort({ 'invitations.invitedAt': -1 });

        // Format the response to include only relevant invitation data
        const invitations = studyGroups.map(group => {
            const invitation = group.invitations.find(inv => 
                (inv.user && inv.user.toString() === userId) || 
                (inv.email === userEmail)
            );
            
            return {
                groupId: group._id,
                groupName: group.name,
                groupDescription: group.description,
                creator: group.creator,
                memberCount: group.members.length,
                invitedBy: invitation.invitedBy,
                invitedAt: invitation.invitedAt
            };
        });

        res.status(200).json(invitations);
    } catch (error) {
        console.error('Error fetching user invitations:', error);
        res.status(500).json({ message: 'Failed to fetch user invitations' });
    }
};

// Request to join a private study group
exports.requestToJoin = async (req, res) => {
    try {
        const groupId = req.params.id;
        const userId = req.user.id;

        const studyGroup = await StudyGroup.findById(groupId);

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Check if the group is private
        if (!studyGroup.isPrivate) {
            return res.status(400).json({ message: 'This is a public group, you can join directly' });
        }

        // Check if already a member
        if (studyGroup.members.includes(userId)) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }

        // Check if already requested
        if (studyGroup.pendingRequests.includes(userId)) {
            return res.status(400).json({ message: 'You have already requested to join this group' });
        }

        // Add to pending requests
        studyGroup.pendingRequests.push(userId);
        await studyGroup.save();

        res.status(200).json({ message: 'Join request sent successfully' });
    } catch (error) {
        console.error('Error requesting to join group:', error);
        res.status(500).json({ message: 'Failed to send join request' });
    }
};

// Add a resource to a study group
exports.addResource = async (req, res) => {
    try {
        const { title, type, url, description } = req.body;
        const groupId = req.params.id;
        const userId = req.user.id;

        const studyGroup = await StudyGroup.findById(groupId);

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Check if user is a member
        if (!studyGroup.members.includes(userId)) {
            return res.status(403).json({ message: 'Only members can add resources' });
        }

        const newResource = {
            title,
            type,
            url,
            description,
            addedBy: userId
        };

        studyGroup.resources.push(newResource);
        await studyGroup.save();

        // Populate the addedBy field before sending response
        const addedResource = studyGroup.resources[studyGroup.resources.length - 1];
        await StudyGroup.populate(addedResource, { path: 'addedBy', select: 'name email profileImageUrl' });

        res.status(201).json(addedResource);
    } catch (error) {
        console.error('Error adding resource:', error);
        res.status(500).json({ message: 'Failed to add resource' });
    }
};

// Delete a study group (creator only)
exports.deleteStudyGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        const userId = req.user.id;

        const studyGroup = await StudyGroup.findById(groupId);

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Check if user is the creator
        if (studyGroup.creator.toString() !== userId) {
            return res.status(403).json({ message: 'Only the creator can delete this group' });
        }

        await StudyGroup.findByIdAndDelete(groupId);
        res.status(200).json({ message: 'Study group deleted successfully' });
    } catch (error) {
        console.error('Error deleting study group:', error);
        res.status(500).json({ message: 'Failed to delete study group' });
    }
};

// Get user's study groups
exports.getUserStudyGroups = async (req, res) => {
    try {
        const userId = req.user.id;

        const studyGroups = await StudyGroup.find({ members: userId })
            .populate('creator', 'name email profileImageUrl')
            .sort({ createdAt: -1 });

        res.status(200).json(studyGroups);
    } catch (error) {
        console.error('Error fetching user study groups:', error);
        res.status(500).json({ message: 'Failed to fetch user study groups' });
    }
};

// Invite a user to a study group
exports.inviteUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const groupId = req.params.id;
        const currentUserId = req.user.id;

        const studyGroup = await StudyGroup.findById(groupId);
        const invitedUser = await User.findById(userId);

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        if (!invitedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if current user is a member
        if (!studyGroup.members.includes(currentUserId)) {
            return res.status(403).json({ message: 'Only members can invite others' });
        }

        // Check if user is already a member
        if (studyGroup.members.includes(userId)) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        // Check if invitation already exists
        const existingInvitation = studyGroup.invitations.find(
            inv => inv.user && inv.user.toString() === userId
        );

        if (existingInvitation) {
            return res.status(400).json({ message: 'Invitation already sent to this user' });
        }

        // Add invitation
        studyGroup.invitations.push({
            user: userId,
            invitedBy: currentUserId,
            invitedAt: new Date()
        });

        await studyGroup.save();
        res.status(200).json({ message: 'Invitation sent successfully' });
    } catch (error) {
        console.error('Error inviting user:', error);
        res.status(500).json({ message: 'Failed to invite user' });
    }
};

// Invite a user by email
exports.inviteByEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const groupId = req.params.id;
        const currentUserId = req.user.id;

        const studyGroup = await StudyGroup.findById(groupId);

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Check if current user is a member
        if (!studyGroup.members.includes(currentUserId)) {
            return res.status(403).json({ message: 'Only members can invite others' });
        }

        // Check if invitation already exists
        const existingInvitation = studyGroup.invitations.find(inv => inv.email === email);

        if (existingInvitation) {
            return res.status(400).json({ message: 'Invitation already sent to this email' });
        }

        // Add invitation
        studyGroup.invitations.push({
            email,
            invitedBy: currentUserId,
            invitedAt: new Date()
        });

        await studyGroup.save();

        // TODO: Send email invitation (would be implemented with an email service)

        res.status(200).json({ message: 'Invitation sent successfully' });
    } catch (error) {
        console.error('Error inviting by email:', error);
        res.status(500).json({ message: 'Failed to send invitation' });
    }
};

// Search users for inviting to study group
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query || query.length < 2) {
            return res.status(400).json({ message: 'Search query must be at least 2 characters' });
        }

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ],
            _id: { $ne: req.user.id } // Exclude current user
        }).select('name email profileImageUrl');

        res.status(200).json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'Failed to search users' });
    }
};