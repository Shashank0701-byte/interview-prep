const StudyGroup = require('../models/StudyGroup');
const User = require('../models/User');

// Create a new study group
exports.createStudyGroup = async (req, res) => {
    try {
        const { name, description, topics, isPublic, maxMembers } = req.body;
        const userId = req.user.id;

        const newStudyGroup = new StudyGroup({
            name,
            description,
            creator: userId,
            members: [userId], // Creator is automatically a member
            topics: topics || [],
            isPublic: isPublic !== undefined ? isPublic : true,
            maxMembers: maxMembers || 10
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
        const { topic, isPublic, search } = req.query;
        const query = {};

        // Apply filters if provided
        if (topic) query.topics = { $in: [topic] };
        if (isPublic !== undefined) query.isPublic = isPublic === 'true';
        if (search) query.name = { $regex: search, $options: 'i' };

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
        const studyGroup = await StudyGroup.findById(req.params.id)
            .populate('creator', 'name email profileImageUrl')
            .populate('members', 'name email profileImageUrl')
            .populate('joinRequests.user', 'name email profileImageUrl');

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
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
        const studyGroup = await StudyGroup.findById(req.params.id);
        const userId = req.user.id;

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Check if user is already a member
        if (studyGroup.members.includes(userId)) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }

        // Check if group is full
        if (studyGroup.members.length >= studyGroup.maxMembers) {
            return res.status(400).json({ message: 'This group has reached its maximum capacity' });
        }

        // If group is public, add user directly
        if (studyGroup.isPublic) {
            studyGroup.members.push(userId);
            await studyGroup.save();
            return res.status(200).json({ message: 'Successfully joined the study group' });
        } else {
            // If group is private, create a join request
            // Check if there's already a pending request
            const existingRequest = studyGroup.joinRequests.find(
                request => request.user.toString() === userId && request.status === 'pending'
            );

            if (existingRequest) {
                return res.status(400).json({ message: 'You already have a pending request to join this group' });
            }

            studyGroup.joinRequests.push({
                user: userId,
                status: 'pending',
                requestDate: new Date()
            });

            await studyGroup.save();
            return res.status(200).json({ message: 'Join request sent successfully' });
        }
    } catch (error) {
        console.error('Error joining study group:', error);
        res.status(500).json({ message: 'Failed to join study group' });
    }
};

// Handle join requests (accept/reject)
exports.handleJoinRequest = async (req, res) => {
    try {
        const { requestId, action } = req.body;
        const groupId = req.params.id;
        const userId = req.user.id;

        const studyGroup = await StudyGroup.findById(groupId);

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Check if user is the creator of the group
        if (studyGroup.creator.toString() !== userId) {
            return res.status(403).json({ message: 'Only the group creator can handle join requests' });
        }

        // Find the request
        const requestIndex = studyGroup.joinRequests.findIndex(
            request => request._id.toString() === requestId
        );

        if (requestIndex === -1) {
            return res.status(404).json({ message: 'Join request not found' });
        }

        const request = studyGroup.joinRequests[requestIndex];

        if (action === 'accept') {
            // Add user to members
            studyGroup.members.push(request.user);
            request.status = 'accepted';
        } else if (action === 'reject') {
            request.status = 'rejected';
        } else {
            return res.status(400).json({ message: 'Invalid action. Use "accept" or "reject"' });
        }

        await studyGroup.save();
        res.status(200).json({ message: `Join request ${action}ed successfully` });
    } catch (error) {
        console.error('Error handling join request:', error);
        res.status(500).json({ message: 'Failed to handle join request' });
    }
};

// Leave a study group
exports.leaveStudyGroup = async (req, res) => {
    try {
        const studyGroup = await StudyGroup.findById(req.params.id);
        const userId = req.user.id;

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Check if user is a member
        if (!studyGroup.members.includes(userId)) {
            return res.status(400).json({ message: 'You are not a member of this group' });
        }

        // Check if user is the creator
        if (studyGroup.creator.toString() === userId) {
            return res.status(400).json({ message: 'As the creator, you cannot leave the group. You can delete it instead.' });
        }

        // Remove user from members
        studyGroup.members = studyGroup.members.filter(member => member.toString() !== userId);
        await studyGroup.save();

        res.status(200).json({ message: 'Successfully left the study group' });
    } catch (error) {
        console.error('Error leaving study group:', error);
        res.status(500).json({ message: 'Failed to leave study group' });
    }
};

// Add a resource to a study group
exports.addResource = async (req, res) => {
    try {
        const { title, description, url } = req.body;
        const groupId = req.params.id;
        const userId = req.user.id;

        const studyGroup = await StudyGroup.findById(groupId);

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Check if user is a member
        if (!studyGroup.members.includes(userId)) {
            return res.status(403).json({ message: 'Only members can add resources to the group' });
        }

        const newResource = {
            title,
            description,
            url,
            addedBy: userId,
            addedAt: new Date()
        };

        studyGroup.resources.push(newResource);
        await studyGroup.save();

        res.status(201).json(newResource);
    } catch (error) {
        console.error('Error adding resource:', error);
        res.status(500).json({ message: 'Failed to add resource' });
    }
};

// Delete a study group (creator only)
exports.deleteStudyGroup = async (req, res) => {
    try {
        const studyGroup = await StudyGroup.findById(req.params.id);
        const userId = req.user.id;

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Check if user is the creator
        if (studyGroup.creator.toString() !== userId) {
            return res.status(403).json({ message: 'Only the creator can delete the group' });
        }

        await StudyGroup.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Study group deleted successfully' });
    } catch (error) {
        console.error('Error deleting study group:', error);
        res.status(500).json({ message: 'Failed to delete study group' });
    }
};

// Get study groups for a specific user
exports.getUserStudyGroups = async (req, res) => {
    try {
        const userId = req.user.id;

        const studyGroups = await StudyGroup.find({ members: userId })
            .populate('creator', 'name email profileImageUrl')
            .populate('members', 'name email profileImageUrl')
            .sort({ createdAt: -1 });

        res.status(200).json(studyGroups);
    } catch (error) {
        console.error('Error fetching user study groups:', error);
        res.status(500).json({ message: 'Failed to fetch user study groups' });
    }
};

// Invite a user to a study group
exports.inviteToStudyGroup = async (req, res) => {
    try {
        const { userId } = req.body;
        const groupId = req.params.id;
        const inviterId = req.user.id;

        // Validate input
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const studyGroup = await StudyGroup.findById(groupId);

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Check if inviter is a member of the group
        if (!studyGroup.members.includes(inviterId)) {
            return res.status(403).json({ message: 'Only members can invite others to the group' });
        }

        // Check if user is already a member
        if (studyGroup.members.includes(userId)) {
            return res.status(400).json({ message: 'User is already a member of this group' });
        }

        // Check if group is full
        if (studyGroup.members.length >= studyGroup.maxMembers) {
            return res.status(400).json({ message: 'This group has reached its maximum capacity' });
        }

        // Check if there's already a pending invitation
        const existingInvitation = studyGroup.invitations.find(
            invitation => invitation.user.toString() === userId && invitation.status === 'pending'
        );

        if (existingInvitation) {
            return res.status(400).json({ message: 'User already has a pending invitation to this group' });
        }

        // Add invitation
        studyGroup.invitations.push({
            user: userId,
            invitedBy: inviterId,
            status: 'pending',
            invitationDate: new Date()
        });

        await studyGroup.save();
        res.status(200).json({ message: 'Invitation sent successfully' });
    } catch (error) {
        console.error('Error inviting to study group:', error);
        res.status(500).json({ message: 'Failed to send invitation' });
    }
};

// Invite a user to a study group by email
exports.inviteByEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const groupId = req.params.id;
        const inviterId = req.user.id;

        // Validate input
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const studyGroup = await StudyGroup.findById(groupId);

        if (!studyGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }

        // Check if inviter is a member of the group
        if (!studyGroup.members.includes(inviterId)) {
            return res.status(403).json({ message: 'Only members can invite others to the group' });
        }

        // Find user by email
        const user = await User.findOne({ email });

        // If user exists, send them an invitation
        if (user) {
            // Check if user is already a member
            if (studyGroup.members.includes(user._id)) {
                return res.status(400).json({ message: 'User is already a member of this group' });
            }

            // Check if group is full
            if (studyGroup.members.length >= studyGroup.maxMembers) {
                return res.status(400).json({ message: 'This group has reached its maximum capacity' });
            }

            // Check if there's already a pending invitation
            const existingInvitation = studyGroup.invitations.find(
                invitation => invitation.user.toString() === user._id.toString() && invitation.status === 'pending'
            );

            if (existingInvitation) {
                return res.status(400).json({ message: 'User already has a pending invitation to this group' });
            }

            // Add invitation
            studyGroup.invitations.push({
                user: user._id,
                invitedBy: inviterId,
                status: 'pending',
                invitationDate: new Date()
            });

            await studyGroup.save();
            return res.status(200).json({ message: 'Invitation sent successfully' });
        }

        // If user doesn't exist, send them an email invitation (in a real app)
        // For now, just return a success message
        res.status(200).json({ message: 'Invitation email sent successfully' });
    } catch (error) {
        console.error('Error inviting by email:', error);
        res.status(500).json({ message: 'Failed to send invitation' });
    }
};

// Search for users to invite
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.user.id;

        if (!query || query.length < 2) {
            return res.status(400).json({ message: 'Search query must be at least 2 characters' });
        }

        // Search for users by name or email, excluding the current user
        const users = await User.find({
            $and: [
                { _id: { $ne: userId } },
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } }
                    ]
                }
            ]
        }).select('name email profileImageUrl');

        res.status(200).json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'Failed to search users' });
    }
};