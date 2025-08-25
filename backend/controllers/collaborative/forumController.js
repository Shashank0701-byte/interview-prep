const { Forum, Post } = require('../../models/collaborative/Forum');
const User = require('../../models/User');

// Create a new forum
exports.createForum = async (req, res) => {
    try {
        const { title, description, category, tags } = req.body;
        const userId = req.user.id;

        const newForum = new Forum({
            title,
            description,
            category,
            tags: tags || [],
            creator: userId,
            isActive: true
        });

        await newForum.save();
        res.status(201).json(newForum);
    } catch (error) {
        console.error('Error creating forum:', error);
        res.status(500).json({ message: 'Failed to create forum' });
    }
};

// Get all forums (with filtering options)
exports.getAllForums = async (req, res) => {
    try {
        const { category, tag, search, sort } = req.query;
        const query = {};

        // Apply filters if provided
        if (category) query.category = category;
        if (tag) query.tags = { $in: [tag] };
        if (search) query.title = { $regex: search, $options: 'i' };

        // Default to active forums only
        query.isActive = true;

        // Determine sort order
        let sortOption = { createdAt: -1 }; // Default: newest first
        if (sort === 'popular') sortOption = { viewCount: -1 };
        if (sort === 'active') sortOption = { lastActivity: -1 };

        const forums = await Forum.find(query)
            .populate('creator', 'name email profileImageUrl')
            .sort(sortOption);

        res.status(200).json(forums);
    } catch (error) {
        console.error('Error fetching forums:', error);
        res.status(500).json({ message: 'Failed to fetch forums' });
    }
};

// Get a specific forum by ID with its posts
exports.getForumById = async (req, res) => {
    try {
        const forumId = req.params.id;

        const forum = await Forum.findById(forumId)
            .populate('creator', 'name email profileImageUrl');

        if (!forum) {
            return res.status(404).json({ message: 'Forum not found' });
        }

        // Increment view count
        forum.viewCount += 1;
        await forum.save();

        // Get the posts for this forum
        const posts = await Post.find({ 
                forum: forumId,
                parentPost: { $exists: false } // Only get top-level posts, not comments
            })
            .populate('author', 'name email profileImageUrl')
            .sort({ createdAt: -1 });

        res.status(200).json({
            forum,
            posts
        });
    } catch (error) {
        console.error('Error fetching forum:', error);
        res.status(500).json({ message: 'Failed to fetch forum' });
    }
};

// Create a new post in a forum
exports.createPost = async (req, res) => {
    try {
        const { content, attachments } = req.body;
        const forumId = req.params.id;
        const userId = req.user.id;

        // Check if the forum exists
        const forum = await Forum.findById(forumId);
        if (!forum) {
            return res.status(404).json({ message: 'Forum not found' });
        }

        // Check if the forum is active
        if (!forum.isActive) {
            return res.status(400).json({ message: 'This forum is no longer active' });
        }

        // Create the post
        const newPost = new Post({
            content,
            author: userId,
            forum: forumId,
            attachments: attachments || []
        });

        await newPost.save();

        // Update the forum's lastActivity and add the post to its posts array
        forum.lastActivity = new Date();
        forum.posts.push(newPost._id);
        await forum.save();

        // Populate author details before sending response
        await newPost.populate('author', 'name email profileImageUrl');

        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Failed to create post' });
    }
};

// Get a specific post with its comments
exports.getPostWithComments = async (req, res) => {
    try {
        const postId = req.params.postId;

        const post = await Post.findById(postId)
            .populate('author', 'name email profileImageUrl');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Get comments for this post
        const comments = await Post.find({ parentPost: postId })
            .populate('author', 'name email profileImageUrl')
            .sort({ createdAt: 1 });

        res.status(200).json({
            post,
            comments
        });
    } catch (error) {
        console.error('Error fetching post with comments:', error);
        res.status(500).json({ message: 'Failed to fetch post with comments' });
    }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
    try {
        const { content, attachments } = req.body;
        const postId = req.params.postId;
        const userId = req.user.id;

        // Check if the parent post exists
        const parentPost = await Post.findById(postId);
        if (!parentPost) {
            return res.status(404).json({ message: 'Parent post not found' });
        }

        // Create the comment (which is also a Post with a parentPost reference)
        const newComment = new Post({
            content,
            author: userId,
            forum: parentPost.forum, // Same forum as parent post
            parentPost: postId,
            attachments: attachments || []
        });

        await newComment.save();

        // Update the forum's lastActivity
        await Forum.findByIdAndUpdate(parentPost.forum, {
            lastActivity: new Date()
        });

        // Populate author details before sending response
        await newComment.populate('author', 'name email profileImageUrl');

        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Failed to add comment' });
    }
};

// Upvote a post
exports.upvotePost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user.id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user has already upvoted
        if (post.upvotes.includes(userId)) {
            // Remove upvote (toggle)
            post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
        } else {
            // Add upvote
            post.upvotes.push(userId);
        }

        await post.save();
        res.status(200).json({ upvotes: post.upvotes.length });
    } catch (error) {
        console.error('Error upvoting post:', error);
        res.status(500).json({ message: 'Failed to upvote post' });
    }
};

// Update a post (author only)
exports.updatePost = async (req, res) => {
    try {
        const { content, attachments } = req.body;
        const postId = req.params.postId;
        const userId = req.user.id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the user is the author
        if (post.author.toString() !== userId) {
            return res.status(403).json({ message: 'Only the author can update this post' });
        }

        // Update the post
        if (content !== undefined) post.content = content;
        if (attachments !== undefined) post.attachments = attachments;

        await post.save();

        // Populate author details before sending response
        await post.populate('author', 'name email profileImageUrl');

        res.status(200).json(post);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Failed to update post' });
    }
};

// Delete a post (author only)
exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user.id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the user is the author
        if (post.author.toString() !== userId) {
            return res.status(403).json({ message: 'Only the author can delete this post' });
        }

        // If this is a top-level post, also delete all comments
        if (!post.parentPost) {
            await Post.deleteMany({ parentPost: postId });
            
            // Remove the post from the forum's posts array
            await Forum.findByIdAndUpdate(post.forum, {
                $pull: { posts: postId }
            });
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Failed to delete post' });
    }
};

// Update a forum (creator only)
exports.updateForum = async (req, res) => {
    try {
        const { title, description, category, tags, isActive } = req.body;
        const forumId = req.params.id;
        const userId = req.user.id;

        const forum = await Forum.findById(forumId);

        if (!forum) {
            return res.status(404).json({ message: 'Forum not found' });
        }

        // Check if the user is the creator
        if (forum.creator.toString() !== userId) {
            return res.status(403).json({ message: 'Only the creator can update this forum' });
        }

        // Update the forum
        if (title !== undefined) forum.title = title;
        if (description !== undefined) forum.description = description;
        if (category !== undefined) forum.category = category;
        if (tags !== undefined) forum.tags = tags;
        if (isActive !== undefined) forum.isActive = isActive;

        await forum.save();
        res.status(200).json(forum);
    } catch (error) {
        console.error('Error updating forum:', error);
        res.status(500).json({ message: 'Failed to update forum' });
    }
};

// Delete a forum (creator only)
exports.deleteForum = async (req, res) => {
    try {
        const forumId = req.params.id;
        const userId = req.user.id;

        const forum = await Forum.findById(forumId);

        if (!forum) {
            return res.status(404).json({ message: 'Forum not found' });
        }

        // Check if the user is the creator
        if (forum.creator.toString() !== userId) {
            return res.status(403).json({ message: 'Only the creator can delete this forum' });
        }

        // Delete all posts in the forum
        await Post.deleteMany({ forum: forumId });

        // Delete the forum
        await Forum.findByIdAndDelete(forumId);
        res.status(200).json({ message: 'Forum deleted successfully' });
    } catch (error) {
        console.error('Error deleting forum:', error);
        res.status(500).json({ message: 'Failed to delete forum' });
    }
};

// Get user's posts
exports.getUserPosts = async (req, res) => {
    try {
        const userId = req.user.id;

        const posts = await Post.find({ author: userId })
            .populate('forum', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ message: 'Failed to fetch user posts' });
    }
};

// Create a reply to a post
exports.createReply = async (req, res) => {
    try {
        const { content, attachments } = req.body;
        const { forumId, postId } = req.params;
        const userId = req.user.id;

        // Check if the parent post exists
        const parentPost = await Post.findById(postId);
        if (!parentPost) {
            return res.status(404).json({ message: 'Parent post not found' });
        }

        // Check if the forum exists
        const forum = await Forum.findById(forumId);
        if (!forum) {
            return res.status(404).json({ message: 'Forum not found' });
        }

        // Create the reply
        const newReply = new Post({
            content,
            author: userId,
            forum: forumId,
            parentPost: postId,
            attachments: attachments || []
        });

        await newReply.save();

        // Update the forum's lastActivity
        forum.lastActivity = new Date();
        await forum.save();

        // Populate author details before sending response
        await newReply.populate('author', 'name email profileImageUrl');

        res.status(201).json(newReply);
    } catch (error) {
        console.error('Error creating reply:', error);
        res.status(500).json({ message: 'Failed to create reply' });
    }
};

// Toggle upvote on a post
exports.toggleUpvote = async (req, res) => {
    try {
        const { forumId, postId } = req.params;
        const userId = req.user.id;

        // Check if the post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user has already upvoted
        const upvoteIndex = post.upvotes.findIndex(id => id.toString() === userId);
        
        if (upvoteIndex !== -1) {
            // Remove upvote
            post.upvotes.splice(upvoteIndex, 1);
        } else {
            // Add upvote
            post.upvotes.push(userId);
        }

        await post.save();
        res.status(200).json({ 
            upvoted: upvoteIndex === -1,
            upvoteCount: post.upvotes.length 
        });
    } catch (error) {
        console.error('Error toggling upvote:', error);
        res.status(500).json({ message: 'Failed to toggle upvote' });
    }
};

// Get forum categories
exports.getForumCategories = async (req, res) => {
    try {
        // Get distinct categories from all forums
        const categories = await Forum.distinct('category');
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching forum categories:', error);
        res.status(500).json({ message: 'Failed to fetch forum categories' });
    }
};

// Get popular tags
exports.getPopularTags = async (req, res) => {
    try {
        // Aggregate to find most used tags
        const popularTags = await Forum.aggregate([
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        
        res.status(200).json(popularTags.map(tag => ({
            name: tag._id,
            count: tag.count
        })));
    } catch (error) {
        console.error('Error fetching popular tags:', error);
        res.status(500).json({ message: 'Failed to fetch popular tags' });
    }
};

// Get user's forum activity
exports.getUserForumActivity = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user's posts and comments
        const posts = await Post.find({ author: userId })
            .populate('forum', 'title')
            .sort({ createdAt: -1 });

        // Get forums created by user
        const forumsCreated = await Forum.find({ creator: userId })
            .sort({ createdAt: -1 });

        // Get forums where user has participated (posted or commented)
        const participatedForumIds = [...new Set(posts.map(post => post.forum._id.toString()))];
        const participatedForums = await Forum.find({ 
            _id: { $in: participatedForumIds },
            creator: { $ne: userId } // Exclude forums created by the user
        });

        res.status(200).json({
            posts,
            forumsCreated,
            participatedForums
        });
    } catch (error) {
        console.error('Error fetching user forum activity:', error);
        res.status(500).json({ message: 'Failed to fetch user forum activity' });
    }
};