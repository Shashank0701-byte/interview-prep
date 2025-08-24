const PeerReview = require('../models/PeerReview');
const Session = require('../models/Session');
const User = require('../models/User');
const Question = require('../models/Question');

// Create a new peer review
exports.createPeerReview = async (req, res) => {
    try {
        const {
            intervieweeId,
            sessionId,
            questionId,
            feedback,
            rating,
            strengths,
            improvements,
            isAnonymous
        } = req.body;
        const reviewerId = req.user.id;

        // Validate that the session and question exist
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Validate that the interviewee exists
        const interviewee = await User.findById(intervieweeId);
        if (!interviewee) {
            return res.status(404).json({ message: 'Interviewee not found' });
        }

        // Create the peer review
        const newPeerReview = new PeerReview({
            reviewer: reviewerId,
            interviewee: intervieweeId,
            session: sessionId,
            question: questionId,
            feedback,
            rating,
            strengths: strengths || [],
            improvements: improvements || [],
            isAnonymous: isAnonymous !== undefined ? isAnonymous : false,
            status: 'submitted'
        });

        await newPeerReview.save();
        res.status(201).json(newPeerReview);
    } catch (error) {
        console.error('Error creating peer review:', error);
        res.status(500).json({ message: 'Failed to create peer review' });
    }
};

// Get all peer reviews for a specific user (as interviewee)
exports.getUserPeerReviews = async (req, res) => {
    try {
        const userId = req.user.id;

        const peerReviews = await PeerReview.find({ interviewee: userId })
            .populate({
                path: 'reviewer',
                select: 'name email profileImageUrl',
                // Don't populate reviewer details if the review is anonymous
                match: { isAnonymous: false }
            })
            .populate('session', 'role experience topicsToFocus')
            .populate('question', 'question answer')
            .sort({ createdAt: -1 });

        // For anonymous reviews, remove reviewer details
        const formattedReviews = peerReviews.map(review => {
            const reviewObj = review.toObject();
            if (reviewObj.isAnonymous) {
                reviewObj.reviewer = { name: 'Anonymous Reviewer' };
            }
            return reviewObj;
        });

        res.status(200).json(formattedReviews);
    } catch (error) {
        console.error('Error fetching user peer reviews:', error);
        res.status(500).json({ message: 'Failed to fetch user peer reviews' });
    }
};

// Get all peer reviews given by a user (as reviewer)
exports.getReviewsGivenByUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const peerReviews = await PeerReview.find({ reviewer: userId })
            .populate('interviewee', 'name email profileImageUrl')
            .populate('session', 'role experience topicsToFocus')
            .populate('question', 'question answer')
            .sort({ createdAt: -1 });

        res.status(200).json(peerReviews);
    } catch (error) {
        console.error('Error fetching reviews given by user:', error);
        res.status(500).json({ message: 'Failed to fetch reviews given by user' });
    }
};

// Get a specific peer review by ID
exports.getPeerReviewById = async (req, res) => {
    try {
        const peerReview = await PeerReview.findById(req.params.id)
            .populate('reviewer', 'name email profileImageUrl')
            .populate('interviewee', 'name email profileImageUrl')
            .populate('session', 'role experience topicsToFocus')
            .populate('question', 'question answer');

        if (!peerReview) {
            return res.status(404).json({ message: 'Peer review not found' });
        }

        // Check if the user is either the reviewer or the interviewee
        const userId = req.user.id;
        if (
            peerReview.reviewer._id.toString() !== userId &&
            peerReview.interviewee._id.toString() !== userId
        ) {
            return res.status(403).json({ message: 'You do not have permission to view this review' });
        }

        // If the review is anonymous and the requester is the interviewee, hide reviewer details
        const reviewObj = peerReview.toObject();
        if (reviewObj.isAnonymous && reviewObj.interviewee._id.toString() === userId) {
            reviewObj.reviewer = { name: 'Anonymous Reviewer' };
        }

        res.status(200).json(reviewObj);
    } catch (error) {
        console.error('Error fetching peer review:', error);
        res.status(500).json({ message: 'Failed to fetch peer review' });
    }
};

// Update a peer review (reviewer only)
exports.updatePeerReview = async (req, res) => {
    try {
        const { feedback, rating, strengths, improvements, isAnonymous } = req.body;
        const reviewId = req.params.id;
        const userId = req.user.id;

        const peerReview = await PeerReview.findById(reviewId);

        if (!peerReview) {
            return res.status(404).json({ message: 'Peer review not found' });
        }

        // Check if the user is the reviewer
        if (peerReview.reviewer.toString() !== userId) {
            return res.status(403).json({ message: 'Only the reviewer can update this review' });
        }

        // Update the review
        if (feedback !== undefined) peerReview.feedback = feedback;
        if (rating !== undefined) peerReview.rating = rating;
        if (strengths !== undefined) peerReview.strengths = strengths;
        if (improvements !== undefined) peerReview.improvements = improvements;
        if (isAnonymous !== undefined) peerReview.isAnonymous = isAnonymous;

        await peerReview.save();
        res.status(200).json(peerReview);
    } catch (error) {
        console.error('Error updating peer review:', error);
        res.status(500).json({ message: 'Failed to update peer review' });
    }
};

// Delete a peer review (reviewer only)
exports.deletePeerReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.id;

        const peerReview = await PeerReview.findById(reviewId);

        if (!peerReview) {
            return res.status(404).json({ message: 'Peer review not found' });
        }

        // Check if the user is the reviewer
        if (peerReview.reviewer.toString() !== userId) {
            return res.status(403).json({ message: 'Only the reviewer can delete this review' });
        }

        await PeerReview.findByIdAndDelete(reviewId);
        res.status(200).json({ message: 'Peer review deleted successfully' });
    } catch (error) {
        console.error('Error deleting peer review:', error);
        res.status(500).json({ message: 'Failed to delete peer review' });
    }
};

// Request a peer review for a specific question
exports.requestPeerReview = async (req, res) => {
    try {
        const { questionId, message } = req.body;
        const userId = req.user.id;

        // Validate that the question exists and belongs to the user
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Get the session to verify ownership
        const session = await Session.findById(question.session);
        if (!session || session.user.toString() !== userId) {
            return res.status(403).json({ 
                message: 'You do not have permission to request a review for this question' 
            });
        }

        // Create a peer review request (status: 'requested')
        const peerReviewRequest = new PeerReview({
            interviewee: userId,
            session: session._id,
            question: questionId,
            status: 'requested',
            requestMessage: message || 'Please review my interview answer'
        });

        await peerReviewRequest.save();
        res.status(201).json({
            message: 'Peer review request created successfully',
            request: peerReviewRequest
        });
    } catch (error) {
        console.error('Error requesting peer review:', error);
        res.status(500).json({ message: 'Failed to request peer review' });
    }
};

// Get all open peer review requests (that need reviewers)
exports.getOpenPeerReviewRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all peer review requests that don't have a reviewer assigned
        // and don't belong to the current user
        const openRequests = await PeerReview.find({
            reviewer: { $exists: false },
            interviewee: { $ne: userId },
            status: 'requested'
        })
            .populate('interviewee', 'name email profileImageUrl')
            .populate('session', 'role experience topicsToFocus')
            .populate('question', 'question')
            .sort({ createdAt: -1 });

        res.status(200).json(openRequests);
    } catch (error) {
        console.error('Error fetching open peer review requests:', error);
        res.status(500).json({ message: 'Failed to fetch open peer review requests' });
    }
};

// Accept a peer review request
exports.acceptPeerReviewRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const userId = req.user.id;

        const peerReviewRequest = await PeerReview.findById(requestId);

        if (!peerReviewRequest) {
            return res.status(404).json({ message: 'Peer review request not found' });
        }

        // Check if the request is still open
        if (peerReviewRequest.status !== 'requested') {
            return res.status(400).json({ message: 'This request has already been accepted or completed' });
        }

        // Check if the user is not the interviewee
        if (peerReviewRequest.interviewee.toString() === userId) {
            return res.status(400).json({ message: 'You cannot review your own interview answer' });
        }

        // Assign the reviewer and update status
        peerReviewRequest.reviewer = userId;
        peerReviewRequest.status = 'in_progress';
        await peerReviewRequest.save();

        res.status(200).json({
            message: 'Peer review request accepted successfully',
            request: peerReviewRequest
        });
    } catch (error) {
        console.error('Error accepting peer review request:', error);
        res.status(500).json({ message: 'Failed to accept peer review request' });
    }
};