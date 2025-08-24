const Mentorship = require('../models/Mentorship');
const User = require('../models/User');

// Request a mentorship
exports.requestMentorship = async (req, res) => {
    try {
        const { mentorId, topics, goals } = req.body;
        const menteeId = req.user.id;

        // Validate that the mentor exists
        const mentor = await User.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        // Check if there's already an active mentorship between these users
        const existingMentorship = await Mentorship.findOne({
            mentor: mentorId,
            mentee: menteeId,
            status: { $in: ['pending', 'active'] }
        });

        if (existingMentorship) {
            return res.status(400).json({ 
                message: 'You already have a pending or active mentorship with this mentor' 
            });
        }

        // Create the mentorship request
        const newMentorship = new Mentorship({
            mentor: mentorId,
            mentee: menteeId,
            status: 'pending',
            topics: topics || [],
            goals: goals || []
        });

        await newMentorship.save();
        res.status(201).json(newMentorship);
    } catch (error) {
        console.error('Error requesting mentorship:', error);
        res.status(500).json({ message: 'Failed to request mentorship' });
    }
};

// Accept or reject a mentorship request
exports.respondToMentorshipRequest = async (req, res) => {
    try {
        const { action } = req.body;
        const mentorshipId = req.params.id;
        const userId = req.user.id;

        const mentorship = await Mentorship.findById(mentorshipId);

        if (!mentorship) {
            return res.status(404).json({ message: 'Mentorship request not found' });
        }

        // Check if the user is the mentor
        if (mentorship.mentor.toString() !== userId) {
            return res.status(403).json({ message: 'Only the mentor can respond to this request' });
        }

        // Check if the request is still pending
        if (mentorship.status !== 'pending') {
            return res.status(400).json({ message: 'This request has already been processed' });
        }

        if (action === 'accept') {
            mentorship.status = 'active';
            mentorship.startDate = new Date();
            // Set default end date to 3 months from now
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 3);
            mentorship.endDate = endDate;
        } else if (action === 'reject') {
            mentorship.status = 'rejected';
        } else {
            return res.status(400).json({ message: 'Invalid action. Use "accept" or "reject"' });
        }

        await mentorship.save();
        res.status(200).json({ 
            message: `Mentorship request ${action}ed successfully`,
            mentorship
        });
    } catch (error) {
        console.error('Error responding to mentorship request:', error);
        res.status(500).json({ message: 'Failed to respond to mentorship request' });
    }
};

// Get all mentorships for a user (as either mentor or mentee)
exports.getUserMentorships = async (req, res) => {
    try {
        const userId = req.user.id;
        const { role, status } = req.query;

        const query = {};

        // Filter by role if specified
        if (role === 'mentor') {
            query.mentor = userId;
        } else if (role === 'mentee') {
            query.mentee = userId;
        } else {
            // If no role specified, get all mentorships where user is either mentor or mentee
            query.$or = [{ mentor: userId }, { mentee: userId }];
        }

        // Filter by status if specified
        if (status) {
            query.status = status;
        }

        const mentorships = await Mentorship.find(query)
            .populate('mentor', 'name email profileImageUrl')
            .populate('mentee', 'name email profileImageUrl')
            .sort({ createdAt: -1 });

        res.status(200).json(mentorships);
    } catch (error) {
        console.error('Error fetching user mentorships:', error);
        res.status(500).json({ message: 'Failed to fetch user mentorships' });
    }
};

// Get a specific mentorship by ID
exports.getMentorshipById = async (req, res) => {
    try {
        const mentorshipId = req.params.id;
        const userId = req.user.id;

        const mentorship = await Mentorship.findById(mentorshipId)
            .populate('mentor', 'name email profileImageUrl')
            .populate('mentee', 'name email profileImageUrl');

        if (!mentorship) {
            return res.status(404).json({ message: 'Mentorship not found' });
        }

        // Check if the user is either the mentor or the mentee
        if (
            mentorship.mentor._id.toString() !== userId &&
            mentorship.mentee._id.toString() !== userId
        ) {
            return res.status(403).json({ message: 'You do not have permission to view this mentorship' });
        }

        res.status(200).json(mentorship);
    } catch (error) {
        console.error('Error fetching mentorship:', error);
        res.status(500).json({ message: 'Failed to fetch mentorship' });
    }
};

// Add a note to a mentorship
exports.addMentorshipNote = async (req, res) => {
    try {
        const { content } = req.body;
        const mentorshipId = req.params.id;
        const userId = req.user.id;

        const mentorship = await Mentorship.findById(mentorshipId);

        if (!mentorship) {
            return res.status(404).json({ message: 'Mentorship not found' });
        }

        // Check if the user is either the mentor or the mentee
        if (
            mentorship.mentor.toString() !== userId &&
            mentorship.mentee.toString() !== userId
        ) {
            return res.status(403).json({ message: 'You do not have permission to add notes to this mentorship' });
        }

        // Add the note
        const newNote = {
            content,
            author: userId,
            createdAt: new Date()
        };

        mentorship.notes.push(newNote);
        await mentorship.save();

        res.status(201).json(newNote);
    } catch (error) {
        console.error('Error adding mentorship note:', error);
        res.status(500).json({ message: 'Failed to add mentorship note' });
    }
};

// Schedule a meeting for a mentorship
exports.scheduleMeeting = async (req, res) => {
    try {
        const { title, date, duration, location, description } = req.body;
        const mentorshipId = req.params.id;
        const userId = req.user.id;

        const mentorship = await Mentorship.findById(mentorshipId);

        if (!mentorship) {
            return res.status(404).json({ message: 'Mentorship not found' });
        }

        // Check if the user is either the mentor or the mentee
        if (
            mentorship.mentor.toString() !== userId &&
            mentorship.mentee.toString() !== userId
        ) {
            return res.status(403).json({ 
                message: 'You do not have permission to schedule meetings for this mentorship' 
            });
        }

        // Add the meeting
        const newMeeting = {
            title,
            date,
            duration,
            location,
            description,
            scheduledBy: userId,
            status: 'scheduled'
        };

        mentorship.meetings.push(newMeeting);
        await mentorship.save();

        res.status(201).json(newMeeting);
    } catch (error) {
        console.error('Error scheduling meeting:', error);
        res.status(500).json({ message: 'Failed to schedule meeting' });
    }
};

// Update meeting status (confirm, cancel, complete)
exports.updateMeetingStatus = async (req, res) => {
    try {
        const { meetingId, status } = req.body;
        const mentorshipId = req.params.id;
        const userId = req.user.id;

        const mentorship = await Mentorship.findById(mentorshipId);

        if (!mentorship) {
            return res.status(404).json({ message: 'Mentorship not found' });
        }

        // Check if the user is either the mentor or the mentee
        if (
            mentorship.mentor.toString() !== userId &&
            mentorship.mentee.toString() !== userId
        ) {
            return res.status(403).json({ 
                message: 'You do not have permission to update meetings for this mentorship' 
            });
        }

        // Find the meeting
        const meetingIndex = mentorship.meetings.findIndex(
            meeting => meeting._id.toString() === meetingId
        );

        if (meetingIndex === -1) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        // Update the meeting status
        if (['confirmed', 'cancelled', 'completed'].includes(status)) {
            mentorship.meetings[meetingIndex].status = status;
            if (status === 'completed') {
                mentorship.meetings[meetingIndex].completedAt = new Date();
            }
        } else {
            return res.status(400).json({ 
                message: 'Invalid status. Use "confirmed", "cancelled", or "completed"' 
            });
        }

        await mentorship.save();
        res.status(200).json(mentorship.meetings[meetingIndex]);
    } catch (error) {
        console.error('Error updating meeting status:', error);
        res.status(500).json({ message: 'Failed to update meeting status' });
    }
};

// Update mentorship progress
exports.updateProgress = async (req, res) => {
    try {
        const { progressUpdate } = req.body;
        const mentorshipId = req.params.id;
        const userId = req.user.id;

        const mentorship = await Mentorship.findById(mentorshipId);

        if (!mentorship) {
            return res.status(404).json({ message: 'Mentorship not found' });
        }

        // Check if the user is either the mentor or the mentee
        if (
            mentorship.mentor.toString() !== userId &&
            mentorship.mentee.toString() !== userId
        ) {
            return res.status(403).json({ 
                message: 'You do not have permission to update progress for this mentorship' 
            });
        }

        // Add the progress update
        const newProgress = {
            update: progressUpdate,
            updatedBy: userId,
            date: new Date()
        };

        mentorship.progress.push(newProgress);
        await mentorship.save();

        res.status(201).json(newProgress);
    } catch (error) {
        console.error('Error updating mentorship progress:', error);
        res.status(500).json({ message: 'Failed to update mentorship progress' });
    }
};

// End a mentorship (can be done by either mentor or mentee)
exports.endMentorship = async (req, res) => {
    try {
        const { feedback } = req.body;
        const mentorshipId = req.params.id;
        const userId = req.user.id;

        const mentorship = await Mentorship.findById(mentorshipId);

        if (!mentorship) {
            return res.status(404).json({ message: 'Mentorship not found' });
        }

        // Check if the user is either the mentor or the mentee
        if (
            mentorship.mentor.toString() !== userId &&
            mentorship.mentee.toString() !== userId
        ) {
            return res.status(403).json({ message: 'You do not have permission to end this mentorship' });
        }

        // Check if the mentorship is active
        if (mentorship.status !== 'active') {
            return res.status(400).json({ message: 'This mentorship is not currently active' });
        }

        // End the mentorship
        mentorship.status = 'completed';
        mentorship.endDate = new Date();
        
        // Add feedback if provided
        if (feedback) {
            mentorship.endFeedback = {
                content: feedback,
                providedBy: userId,
                date: new Date()
            };
        }

        await mentorship.save();
        res.status(200).json({ message: 'Mentorship ended successfully', mentorship });
    } catch (error) {
        console.error('Error ending mentorship:', error);
        res.status(500).json({ message: 'Failed to end mentorship' });
    }
};

// Get available mentors
exports.getAvailableMentors = async (req, res) => {
    try {
        // In a real application, you would have a way to identify users who are available as mentors
        // For now, we'll just return all users except the current user
        const userId = req.user.id;
        const { topic } = req.query;

        // This is a placeholder implementation
        // In a real app, you would have a field in the User model to indicate mentor status
        // and possibly a separate MentorProfile model with additional details
        const mentors = await User.find({ _id: { $ne: userId } })
            .select('name email profileImageUrl')
            .limit(20);

        res.status(200).json(mentors);
    } catch (error) {
        console.error('Error fetching available mentors:', error);
        res.status(500).json({ message: 'Failed to fetch available mentors' });
    }
};