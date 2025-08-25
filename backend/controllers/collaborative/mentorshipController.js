const Mentorship = require('../../models/collaborative/Mentorship');
const User = require('../../models/User');

// Request a mentorship
exports.requestMentorship = async (req, res) => {
    try {
        const { mentorId, focusAreas, requestMessage } = req.body;
        const menteeId = req.user.id;

        // Check if mentor exists
        const mentor = await User.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        // Check if a mentorship already exists between these users
        const existingMentorship = await Mentorship.findOne({
            mentor: mentorId,
            mentee: menteeId,
            status: { $in: ['pending', 'active'] }
        });

        if (existingMentorship) {
            return res.status(400).json({ 
                message: `A mentorship between you and this mentor is already ${existingMentorship.status}` 
            });
        }

        // Create new mentorship request
        const newMentorship = new Mentorship({
            mentor: mentorId,
            mentee: menteeId,
            focusAreas: focusAreas || [],
            requestMessage,
            status: 'pending'
        });

        await newMentorship.save();
        res.status(201).json(newMentorship);
    } catch (error) {
        console.error('Error requesting mentorship:', error);
        res.status(500).json({ message: 'Failed to request mentorship' });
    }
};

// Respond to a mentorship request (accept or reject)
exports.respondToMentorshipRequest = async (req, res) => {
    try {
        const { response, responseMessage } = req.body;
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

        // Check if the mentorship is still pending
        if (mentorship.status !== 'pending') {
            return res.status(400).json({ message: `This request has already been ${mentorship.status}` });
        }

        // Update the mentorship
        mentorship.status = response === 'accept' ? 'active' : 'rejected';
        mentorship.responseMessage = responseMessage;
        
        if (response === 'accept') {
            mentorship.startDate = new Date();
        }

        await mentorship.save();

        res.status(200).json({
            message: response === 'accept' ? 'Mentorship accepted' : 'Mentorship rejected',
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

        const mentorships = await Mentorship.find({
            $or: [
                { mentor: userId },
                { mentee: userId }
            ]
        })
        .populate('mentor', 'name email profileImageUrl')
        .populate('mentee', 'name email profileImageUrl')
        .sort({ updatedAt: -1 });

        res.status(200).json(mentorships);
    } catch (error) {
        console.error('Error fetching user mentorships:', error);
        res.status(500).json({ message: 'Failed to fetch mentorships' });
    }
};

// Get a specific mentorship by ID
exports.getMentorshipById = async (req, res) => {
    try {
        const mentorshipId = req.params.id;
        const userId = req.user.id;

        const mentorship = await Mentorship.findById(mentorshipId)
            .populate('mentor', 'name email profileImageUrl')
            .populate('mentee', 'name email profileImageUrl')
            .populate('notes.author', 'name email profileImageUrl');

        if (!mentorship) {
            return res.status(404).json({ message: 'Mentorship not found' });
        }

        // Check if the user is part of this mentorship
        if (mentorship.mentor.toString() !== userId && mentorship.mentee.toString() !== userId) {
            return res.status(403).json({ message: 'You do not have access to this mentorship' });
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
        const { content, isPrivate } = req.body;
        const mentorshipId = req.params.id;
        const userId = req.user.id;

        const mentorship = await Mentorship.findById(mentorshipId);

        if (!mentorship) {
            return res.status(404).json({ message: 'Mentorship not found' });
        }

        // Check if the user is part of this mentorship
        if (mentorship.mentor.toString() !== userId && mentorship.mentee.toString() !== userId) {
            return res.status(403).json({ message: 'You do not have access to this mentorship' });
        }

        // Add the note
        const newNote = {
            content,
            author: userId,
            isPrivate: isPrivate || false
        };

        mentorship.notes.push(newNote);
        await mentorship.save();

        // Populate the author field before sending response
        await Mentorship.populate(mentorship, { 
            path: 'notes.author', 
            select: 'name email profileImageUrl',
            match: { _id: userId }
        });

        const addedNote = mentorship.notes[mentorship.notes.length - 1];

        res.status(201).json(addedNote);
    } catch (error) {
        console.error('Error adding mentorship note:', error);
        res.status(500).json({ message: 'Failed to add note' });
    }
};

// Schedule a meeting for a mentorship
exports.scheduleMeeting = async (req, res) => {
    try {
        const { scheduledDate, duration, topic, meetingLink } = req.body;
        const mentorshipId = req.params.id;
        const userId = req.user.id;

        const mentorship = await Mentorship.findById(mentorshipId);

        if (!mentorship) {
            return res.status(404).json({ message: 'Mentorship not found' });
        }

        // Check if the user is part of this mentorship
        if (mentorship.mentor.toString() !== userId && mentorship.mentee.toString() !== userId) {
            return res.status(403).json({ message: 'You do not have access to this mentorship' });
        }

        // Check if the mentorship is active
        if (mentorship.status !== 'active') {
            return res.status(400).json({ message: 'Cannot schedule meetings for inactive mentorships' });
        }

        // Add the meeting
        const newMeeting = {
            scheduledDate,
            duration,
            topic,
            meetingLink,
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
        const { meetingId, status, notes } = req.body;
        const mentorshipId = req.params.id;
        const userId = req.user.id;

        const mentorship = await Mentorship.findById(mentorshipId);

        if (!mentorship) {
            return res.status(404).json({ message: 'Mentorship not found' });
        }

        // Check if the user is part of this mentorship
        if (mentorship.mentor.toString() !== userId && mentorship.mentee.toString() !== userId) {
            return res.status(403).json({ message: 'You do not have access to this mentorship' });
        }

        // Find the meeting
        const meetingIndex = mentorship.meetings.findIndex(m => m._id.toString() === meetingId);
        
        if (meetingIndex === -1) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        // Update the meeting
        mentorship.meetings[meetingIndex].status = status;
        if (notes) {
            mentorship.meetings[meetingIndex].notes = notes;
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
        const { progress, goals } = req.body;
        const mentorshipId = req.params.id;
        const userId = req.user.id;

        const mentorship = await Mentorship.findById(mentorshipId);

        if (!mentorship) {
            return res.status(404).json({ message: 'Mentorship not found' });
        }

        // Check if the user is part of this mentorship
        if (mentorship.mentor.toString() !== userId && mentorship.mentee.toString() !== userId) {
            return res.status(403).json({ message: 'You do not have access to this mentorship' });
        }

        // Update progress
        if (progress !== undefined) {
            mentorship.progress = Math.min(Math.max(progress, 0), 100); // Ensure between 0-100
        }

        // Update goals if provided
        if (goals) {
            mentorship.goals = goals;
        }

        await mentorship.save();

        res.status(200).json({
            progress: mentorship.progress,
            goals: mentorship.goals
        });
    } catch (error) {
        console.error('Error updating mentorship progress:', error);
        res.status(500).json({ message: 'Failed to update progress' });
    }
};

// End a mentorship (can be done by either mentor or mentee)
exports.endMentorship = async (req, res) => {
    try {
        const mentorshipId = req.params.id;
        const userId = req.user.id;

        const mentorship = await Mentorship.findById(mentorshipId);

        if (!mentorship) {
            return res.status(404).json({ message: 'Mentorship not found' });
        }

        // Check if the user is part of this mentorship
        if (mentorship.mentor.toString() !== userId && mentorship.mentee.toString() !== userId) {
            return res.status(403).json({ message: 'You do not have access to this mentorship' });
        }

        // Check if the mentorship is active
        if (mentorship.status !== 'active') {
            return res.status(400).json({ message: `This mentorship is already ${mentorship.status}` });
        }

        // End the mentorship
        mentorship.status = 'completed';
        mentorship.endDate = new Date();

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
        // In a real application, you would have a way to identify users who are mentors
        // For this example, we'll just return all users except the current user
        const userId = req.user.id;

        const mentors = await User.find({ 
            _id: { $ne: userId },
            // You might have additional criteria here, like:
            // isMentor: true,
            // availableForMentoring: true,
        })
        .select('name email profileImageUrl bio skills');

        res.status(200).json(mentors);
    } catch (error) {
        console.error('Error fetching available mentors:', error);
        res.status(500).json({ message: 'Failed to fetch available mentors' });
    }
};