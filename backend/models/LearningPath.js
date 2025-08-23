const mongoose = require("mongoose");

const learningPathSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetRole: { type: String, required: true },
    experience: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
    status: { 
        type: String, 
        enum: ['Active', 'Completed', 'Paused'], 
        default: 'Active' 
    },
    skills: [{
        name: { type: String, required: true },
        category: { type: String, required: true }, // e.g., 'Technical', 'Behavioral', 'System Design'
        currentLevel: { type: Number, default: 0 }, // 0-100 mastery level
        targetLevel: { type: Number, default: 100 },
        priority: { type: Number, default: 1 }, // 1-5 priority level
        resources: [{
            type: { type: String, enum: ['Video', 'Article', 'Practice', 'Book'], required: true },
            title: { type: String, required: true },
            url: { type: String, default: null },
            description: { type: String, default: null },
            estimatedTime: { type: Number, default: 0 }, // in minutes
            completed: { type: Boolean, default: false }
        }],
        practiceQuestions: [{
            question: { type: String, required: true },
            difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
            completed: { type: Boolean, default: false },
            score: { type: Number, default: 0 },
            attempts: { type: Number, default: 0 }
        }],
        lastPracticed: { type: Date, default: null },
        progressHistory: [{
            date: { type: Date, default: Date.now },
            level: { type: Number, required: true },
            activity: { type: String, required: true } // e.g., 'Practice', 'Resource', 'Assessment'
        }]
    }],
    milestones: [{
        title: { type: String, required: true },
        description: { type: String, required: true },
        targetDate: { type: Date, required: true },
        completed: { type: Boolean, default: false },
        completedDate: { type: Date, default: null },
        skills: [String] // skill names required for this milestone
    }],
    assessments: [{
        type: { type: String, enum: ['Skill Check', 'Mock Interview', 'Progress Review'], required: true },
        title: { type: String, required: true },
        date: { type: Date, default: Date.now },
        score: { type: Number, default: 0 },
        feedback: { type: String, default: null },
        recommendations: [String]
    }],
    analytics: {
        totalTimeSpent: { type: Number, default: 0 }, // in minutes
        averageSkillLevel: { type: Number, default: 0 },
        skillsCompleted: { type: Number, default: 0 },
        totalSkills: { type: Number, default: 0 },
        lastUpdated: { type: Date, default: Date.now },
        learningStreak: { type: Number, default: 0 }, // consecutive days of learning
        weeklyProgress: [{
            week: { type: String, required: true },
            timeSpent: { type: Number, default: 0 },
            skillsImproved: { type: Number, default: 0 }
        }]
    },
    preferences: {
        learningStyle: { type: String, enum: ['Visual', 'Auditory', 'Kinesthetic', 'Mixed'], default: 'Mixed' },
        dailyGoal: { type: Number, default: 30 }, // minutes per day
        focusAreas: [String], // specific areas to focus on
        difficultyPreference: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' }
    }
}, { timestamps: true });

module.exports = mongoose.model("LearningPath", learningPathSchema);
