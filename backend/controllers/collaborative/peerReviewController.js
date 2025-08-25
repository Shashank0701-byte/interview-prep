const PeerReview = require('../../models/collaborative/PeerReview');
const User = require('../../models/User');

// Create a new peer review request
exports.createPeerReviewRequest = async (req, res) => {
    try {
        const { questionContent, answerContent } = req.body;
        const requesterId = req.user.id;

        if (!questionContent || !answerContent) {
            return res.status(400).json({ message: 'Question and answer content are required' });
        }

        // Create a new peer review request
        const peerReviewRequest = new PeerReview.PeerReviewRequest({
            requester: requesterId,
            questionContent,
            answerContent,
            status: 'pending'
        });

        await peerReviewRequest.save();

        res.status(201).json({
            message: 'Peer review request created successfully',
            request: peerReviewRequest
        });
    } catch (error) {
        console.error('Error creating peer review request:', error);
        res.status(500).json({ message: 'Failed to create peer review request' });
    }
};

// Get all peer review requests (for admin or matching system)
exports.getAllPeerReviewRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};

        if (status) {
            query.status = status;
        }

        const requests = await PeerReview.PeerReviewRequest.find(query)
            .populate('requester', 'name email profileImageUrl')
            .populate('assignedTo', 'name email profileImageUrl')
            .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching peer review requests:', error);
        res.status(500).json({ message: 'Failed to fetch peer review requests' });
    }
};

// Get peer review requests created by the current user
exports.getUserPeerReviewRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await PeerReview.PeerReviewRequest.find({ requester: userId })
            .populate('assignedTo', 'name email profileImageUrl')
            .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching user peer review requests:', error);
        res.status(500).json({ message: 'Failed to fetch peer review requests' });
    }
};

// Get peer review requests assigned to the current user
exports.getAssignedPeerReviewRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await PeerReview.PeerReviewRequest.find({ assignedTo: userId })
            .populate('requester', 'name email profileImageUrl')
            .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching assigned peer review requests:', error);
        res.status(500).json({ message: 'Failed to fetch assigned peer review requests' });
    }
};

// Assign a peer review request to a reviewer
exports.assignPeerReviewRequest = async (req, res) => {
    try {
        const { requestId, reviewerId } = req.body;

        // In a real application, you might want to check if the current user has permission to assign reviews
        // For simplicity, we'll skip that check here

        const request = await PeerReview.PeerReviewRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Peer review request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: `This request is already ${request.status}` });
        }

        // Check if reviewer exists
        const reviewer = await User.findById(reviewerId);
        if (!reviewer) {
            return res.status(404).json({ message: 'Reviewer not found' });
        }

        // Assign the reviewer
        request.assignedTo = reviewerId;
        request.assignedAt = new Date();
        request.status = 'assigned';
        await request.save();

        res.status(200).json({
            message: 'Peer review request assigned successfully',
            request
        });
    } catch (error) {
        console.error('Error assigning peer review request:', error);
        res.status(500).json({ message: 'Failed to assign peer review request' });
    }
};

// Submit a peer review
exports.submitPeerReview = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { 
            feedbackItems, 
            overallRating, 
            overallComment, 
            suggestedImprovements,
            isAnonymous 
        } = req.body;
        const reviewerId = req.user.id;

        // Find the request
        const request = await PeerReview.PeerReviewRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Peer review request not found' });
        }

        // Check if the user is assigned to this review
        if (request.assignedTo.toString() !== reviewerId) {
            return res.status(403).json({ message: 'You are not assigned to this peer review' });
        }

        // Check if the request is in the correct status
        if (request.status !== 'assigned') {
            return res.status(400).json({ message: `This request is ${request.status} and cannot be reviewed` });
        }

        // Create the peer review
        const peerReview = new PeerReview.PeerReview({
            reviewer: reviewerId,
            reviewee: request.requester,
            request: requestId,
            questionContent: request.questionContent,
            answerContent: request.answerContent,
            feedbackItems: feedbackItems || [],
            overallRating,
            overallComment,
            suggestedImprovements,
            isAnonymous: isAnonymous || false
        });

        await peerReview.save();

        // Update the request status
        request.status = 'completed';
        await request.save();

        res.status(201).json({
            message: 'Peer review submitted successfully',
            review: peerReview
        });
    } catch (error) {
        console.error('Error submitting peer review:', error);
        res.status(500).json({ message: 'Failed to submit peer review' });
    }
};

// Get a specific peer review by ID
exports.getPeerReviewById = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.id;

        const review = await PeerReview.PeerReview.findById(reviewId)
            .populate('reviewer', 'name email profileImageUrl')
            .populate('reviewee', 'name email profileImageUrl')
            .populate('request');

        if (!review) {
            return res.status(404).json({ message: 'Peer review not found' });
        }

        // Check if the user is part of this review (as reviewer or reviewee)
        const isReviewer = review.reviewer._id.toString() === userId;
        const isReviewee = review.reviewee._id.toString() === userId;

        if (!isReviewer && !isReviewee) {
            return res.status(403).json({ message: 'You do not have access to this peer review' });
        }

        // If the review is anonymous and the user is the reviewee, hide the reviewer information
        if (review.isAnonymous && isReviewee) {
            review.reviewer = { name: 'Anonymous Reviewer' };
        }

        res.status(200).json(review);
    } catch (error) {
        console.error('Error fetching peer review:', error);
        res.status(500).json({ message: 'Failed to fetch peer review' });
    }
};

// Get all peer reviews for the current user (as reviewee)
exports.getUserReceivedPeerReviews = async (req, res) => {
    try {
        const userId = req.user.id;

        const reviews = await PeerReview.PeerReview.find({ reviewee: userId })
            .populate({
                path: 'reviewer',
                select: 'name email profileImageUrl',
                // Handle anonymous reviews
                transform: (doc, id) => {
                    return doc;
                }
            })
            .populate('request')
            .sort({ createdAt: -1 });

        // Handle anonymous reviews
        const processedReviews = reviews.map(review => {
            if (review.isAnonymous) {
                return {
                    ...review.toObject(),
                    reviewer: { name: 'Anonymous Reviewer' }
                };
            }
            return review;
        });

        res.status(200).json(processedReviews);
    } catch (error) {
        console.error('Error fetching received peer reviews:', error);
        res.status(500).json({ message: 'Failed to fetch received peer reviews' });
    }
};

// Get all peer reviews submitted by the current user (as reviewer)
exports.getUserSubmittedPeerReviews = async (req, res) => {
    try {
        const userId = req.user.id;

        const reviews = await PeerReview.PeerReview.find({ reviewer: userId })
            .populate('reviewee', 'name email profileImageUrl')
            .populate('request')
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching submitted peer reviews:', error);
        res.status(500).json({ message: 'Failed to fetch submitted peer reviews' });
    }
};

// Cancel a peer review request (only if it's still pending or assigned)
exports.cancelPeerReviewRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const userId = req.user.id;

        const request = await PeerReview.PeerReviewRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Peer review request not found' });
        }

        // Check if the user is the requester
        if (request.requester.toString() !== userId) {
            return res.status(403).json({ message: 'You can only cancel your own peer review requests' });
        }

        // Check if the request can be canceled
        if (request.status === 'completed' || request.status === 'cancelled') {
            return res.status(400).json({ message: `This request is already ${request.status} and cannot be cancelled` });
        }

        // Cancel the request
        request.status = 'cancelled';
        await request.save();

        res.status(200).json({
            message: 'Peer review request cancelled successfully',
            request
        });
    } catch (error) {
        console.error('Error cancelling peer review request:', error);
        res.status(500).json({ message: 'Failed to cancel peer review request' });
    }
};

// Get peer review statistics for the current user
exports.getUserPeerReviewStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Count requests made by the user
        const requestsMade = await PeerReview.PeerReviewRequest.countDocuments({ requester: userId });
        
        // Count reviews received by the user
        const reviewsReceived = await PeerReview.PeerReview.countDocuments({ reviewee: userId });
        
        // Count reviews submitted by the user
        const reviewsSubmitted = await PeerReview.PeerReview.countDocuments({ reviewer: userId });
        
        // Get average rating received (if any)
        const ratings = await PeerReview.PeerReview.find({ reviewee: userId }).select('overallRating');
        let averageRating = 0;
        if (ratings.length > 0) {
            const sum = ratings.reduce((total, review) => total + review.overallRating, 0);
            averageRating = sum / ratings.length;
        }

        res.status(200).json({
            requestsMade,
            reviewsReceived,
            reviewsSubmitted,
            averageRating
        });
    } catch (error) {
        console.error('Error fetching peer review statistics:', error);
        res.status(500).json({ message: 'Failed to fetch peer review statistics' });
    }
};