const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    session: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
    question: String,
    answer: String,
    note: String,
    isPinned: { type: Boolean, default: false },
    userNote: {type: String, default: ""},
    isMastered: { type: Boolean, default: false },
    reviewInterval: { type: Number, default: 1 },  // ✅ ADD THIS (in days)
    dueDate: { type: Date, default: Date.now }, // ✅ ADD THIS
  }, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);