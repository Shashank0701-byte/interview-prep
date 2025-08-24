const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    parentPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // For comments
    attachments: [{
        type: { type: String, enum: ["image", "document", "link"] },
        url: { type: String },
        name: { type: String }
    }]
}, { timestamps: true });

const forumSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ["company", "topic", "general"], required: true },
    tags: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    isActive: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now }
}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);
const Forum = mongoose.model("Forum", forumSchema);

module.exports = { Forum, Post };