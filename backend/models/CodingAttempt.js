const mongoose = require("mongoose");

const codingAttemptSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        taskId: { type: String, required: true },
        files: [
            {
                path: { type: String, required: true },
                code: { type: String, required: true },
            },
        ],
        lastResult: { type: mongoose.Schema.Types.Mixed, default: null },
        coachCalls: { type: Number, default: 0 },
        credits: { type: Number, default: 2000 },
        approaches: [
            {
                text: { type: String, required: true },
                spent: { type: Number, required: true },
                at: { type: Date, default: Date.now },
            },
        ],
        messages: [
            {
                role: { type: String, enum: ["user", "assistant"], required: true },
                content: { type: String, required: true },
                code: { type: String, default: "" },
                language: { type: String, default: "" },
                at: { type: Date, default: Date.now },
            },
        ],
        hints: [
            {
                level: { type: String, required: true },
                at: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

codingAttemptSchema.index({ user: 1, taskId: 1 }, { unique: true });

module.exports = mongoose.model("CodingAttempt", codingAttemptSchema);
