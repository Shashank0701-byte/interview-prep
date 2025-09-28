const { GoogleGenerativeAI } = require('@google/generative-ai');
const LearningPath = require('../models/LearningPath');
const Company = require('../models/Company');
const InterviewSession = require('../models/InterviewSession');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// @desc    Create or update personalized learning path
// @route   POST /api/learning-path/create
// @access  Private
const createLearningPath = async (req, res) => {
    try {
        const { targetRole, experience, companyId, focusAreas, learningStyle, dailyGoal } = req.body;
        const userId = req.user._id;

        // Check if user already has a learning path
        let learningPath = await LearningPath.findOne({ user: userId, status: 'Active' });

        if (learningPath) {
            // Update existing path
            learningPath.targetRole = targetRole;
            learningPath.experience = experience;
            learningPath.company = companyId;
            learningPath.preferences.focusAreas = focusAreas || [];
            learningPath.preferences.learningStyle = learningStyle || 'Mixed';
            learningPath.preferences.dailyGoal = dailyGoal || 30;
        } else {
            // Create new learning path
            learningPath = new LearningPath({
                user: userId,
                targetRole,
                experience,
                company: companyId,
                preferences: {
                    focusAreas: focusAreas || [],
                    learningStyle: learningStyle || 'Mixed',
                    dailyGoal: dailyGoal || 30
                }
            });
        }

        // Generate skills and resources using AI
        const skillsData = await generateSkillsForRole(targetRole, experience, companyId, focusAreas);
        learningPath.skills = skillsData.skills;
        learningPath.milestones = skillsData.milestones;

        // Update analytics
        learningPath.analytics.totalSkills = skillsData.skills.length;
        learningPath.analytics.averageSkillLevel = 0;

        await learningPath.save();

        res.status(201).json({
            success: true,
            data: learningPath
        });

    } catch (error) {
        console.error('Learning Path Creation Error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to create learning path",
            error: error.message
        });
    }
};

// @desc    Get user's learning path
// @route   GET /api/learning-path
// @access  Private
const getLearningPath = async (req, res) => {
    try {
        const userId = req.user._id;

        const learningPath = await LearningPath.findOne({ user: userId, status: 'Active' })
            .populate('company', 'name logo industry');

        if (!learningPath) {
            return res.status(404).json({
                success: false,
                message: "No active learning path found. Create one to get started!"
            });
        }

        // Calculate current progress
        const progress = calculateLearningProgress(learningPath);

        res.status(200).json({
            success: true,
            data: {
                learningPath,
                progress
            }
        });

    } catch (error) {
        console.error('Get Learning Path Error:', error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// @desc    Update skill progress
// @route   PUT /api/learning-path/skill/:skillName
// @access  Private
const updateSkillProgress = async (req, res) => {
    try {
        const { skillName } = req.params;
        const { newLevel, activity, timeSpent } = req.body;
        const userId = req.user._id;

        const learningPath = await LearningPath.findOne({ user: userId, status: 'Active' });
        if (!learningPath) {
            return res.status(404).json({
                success: false,
                message: "No active learning path found"
            });
        }

        // Find and update the skill
        const skill = learningPath.skills.find(s => s.name === skillName);
        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found in learning path"
            });
        }

        // Update skill level
        skill.currentLevel = Math.min(100, Math.max(0, newLevel));
        skill.lastPracticed = new Date();
        skill.progressHistory.push({
            date: new Date(),
            level: skill.currentLevel,
            activity: activity || 'Practice'
        });

        // Update analytics
        learningPath.analytics.totalTimeSpent += timeSpent || 0;
        learningPath.analytics.lastUpdated = new Date();
        learningPath.analytics.averageSkillLevel = Math.round(
            learningPath.skills.reduce((sum, s) => sum + s.currentLevel, 0) / learningPath.skills.length
        );

        // Check for completed skills
        const completedSkills = learningPath.skills.filter(s => s.currentLevel >= 100).length;
        learningPath.analytics.skillsCompleted = completedSkills;

        // Update weekly progress
        updateWeeklyProgress(learningPath, timeSpent || 0, newLevel > skill.currentLevel ? 1 : 0);

        await learningPath.save();

        res.status(200).json({
            success: true,
            data: {
                skill,
                overallProgress: learningPath.analytics
            }
        });

    } catch (error) {
        console.error('Update Skill Progress Error:', error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// @desc    Get skill recommendations
// @route   GET /api/learning-path/recommendations
// @access  Private
const getSkillRecommendations = async (req, res) => {
    try {
        const userId = req.user._id;
        const { limit = 5 } = req.query;

        const learningPath = await LearningPath.findOne({ user: userId, status: 'Active' });
        if (!learningPath) {
            return res.status(404).json({
                success: false,
                message: "No active learning path found"
            });
        }

        // Get skills that need attention (low level, high priority)
        const recommendations = learningPath.skills
            .filter(skill => skill.currentLevel < 80)
            .sort((a, b) => {
                // Sort by priority first, then by current level (lower = more urgent)
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                return a.currentLevel - b.currentLevel;
            })
            .slice(0, parseInt(limit))
            .map(skill => ({
                name: skill.name,
                category: skill.category,
                currentLevel: skill.currentLevel,
                targetLevel: skill.targetLevel,
                priority: skill.priority,
                resources: skill.resources.filter(r => !r.completed).slice(0, 3),
                practiceQuestions: skill.practiceQuestions.filter(q => !q.completed).slice(0, 2)
            }));

        res.status(200).json({
            success: true,
            data: recommendations
        });

    } catch (error) {
        console.error('Get Skill Recommendations Error:', error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// @desc    Complete a resource or practice question
// @route   PUT /api/learning-path/complete-item
// @access  Private
const completeLearningItem = async (req, res) => {
    try {
        const { skillName, itemType, itemId, score } = req.body;
        const userId = req.user._id;

        const learningPath = await LearningPath.findOne({ user: userId, status: 'Active' });
        if (!learningPath) {
            return res.status(404).json({
                success: false,
                message: "No active learning path found"
            });
        }

        const skill = learningPath.skills.find(s => s.name === skillName);
        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found"
            });
        }

        if (itemType === 'resource') {
            const resource = skill.resources.find(r => r._id.toString() === itemId);
            if (resource) {
                resource.completed = true;
                // Update skill level based on resource completion
                skill.currentLevel = Math.min(100, skill.currentLevel + 10);
            }
        } else if (itemType === 'practice') {
            const practice = skill.practiceQuestions.find(p => p._id.toString() === itemId);
            if (practice) {
                practice.completed = true;
                practice.score = score || 0;
                practice.attempts += 1;
                // Update skill level based on practice performance
                const improvement = Math.round((score || 0) / 10);
                skill.currentLevel = Math.min(100, skill.currentLevel + improvement);
            }
        }

        // Update progress history
        skill.progressHistory.push({
            date: new Date(),
            level: skill.currentLevel,
            activity: itemType === 'resource' ? 'Resource' : 'Practice'
        });

        // Update analytics
        learningPath.analytics.averageSkillLevel = Math.round(
            learningPath.skills.reduce((sum, s) => sum + s.currentLevel, 0) / learningPath.skills.length
        );

        await learningPath.save();

        res.status(200).json({
            success: true,
            data: {
                skill,
                message: `${itemType} completed successfully!`
            }
        });

    } catch (error) {
        console.error('Complete Learning Item Error:', error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// Helper Functions
const generateSkillsForRole = async (role, experience, companyId, focusAreas) => {
    try {
        let companyContext = '';
        if (companyId) {
            const company = await Company.findById(companyId);
            if (company) {
                companyContext = `for ${company.name} interviews`;
            }
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
            generationConfig: {
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
            },
        });

        const prompt = `Create a comprehensive learning path for a ${role} with ${experience} years of experience ${companyContext}.

        Focus areas: ${focusAreas?.join(', ') || 'General'}

        Return JSON with:
        {
            "skills": [
                {
                    "name": "Skill name",
                    "category": "Technical/Behavioral/System Design",
                    "currentLevel": 0,
                    "targetLevel": 100,
                    "priority": 1-5,
                    "resources": [
                        {
                            "type": "Video/Article/Practice/Book",
                            "title": "Resource title",
                            "description": "Description",
                            "estimatedTime": 30
                        }
                    ],
                    "practiceQuestions": [
                        {
                            "question": "Practice question?",
                            "difficulty": "Easy/Medium/Hard"
                        }
                    ]
                }
            ],
            "milestones": [
                {
                    "title": "Milestone title",
                    "description": "Description",
                    "targetDate": "2024-12-31",
                    "skills": ["Skill1", "Skill2"]
                }
            ]
        }

        Include 8-12 skills covering technical, behavioral, and system design areas.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text());

    } catch (error) {
        console.error('Skills Generation Error:', error);
        // Fallback skills
        return {
            skills: [
                {
                    name: "Technical Problem Solving",
                    category: "Technical",
                    currentLevel: 0,
                    targetLevel: 100,
                    priority: 5,
                    resources: [
                        {
                            type: "Practice",
                            title: "Algorithm Practice",
                            description: "Practice coding problems",
                            estimatedTime: 45
                        }
                    ],
                    practiceQuestions: [
                        {
                            question: "Solve a binary search problem",
                            difficulty: "Medium"
                        }
                    ]
                }
            ],
            milestones: [
                {
                    title: "Technical Foundation",
                    description: "Master basic technical skills",
                    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                    skills: ["Technical Problem Solving"]
                }
            ]
        };
    }
};

const calculateLearningProgress = (learningPath) => {
    const totalSkills = learningPath.skills.length;
    const completedSkills = learningPath.skills.filter(s => s.currentLevel >= 100).length;
    const averageLevel = Math.round(
        learningPath.skills.reduce((sum, s) => sum + s.currentLevel, 0) / totalSkills
    );

    return {
        totalSkills,
        completedSkills,
        averageLevel,
        completionPercentage: Math.round((completedSkills / totalSkills) * 100),
        estimatedTimeToComplete: Math.round(
            learningPath.skills
                .filter(s => s.currentLevel < 100)
                .reduce((sum, s) => sum + s.resources.reduce((rSum, r) => rSum + r.estimatedTime, 0), 0)
        )
    };
};

const updateWeeklyProgress = (learningPath, timeSpent, skillsImproved) => {
    const currentWeek = getWeekNumber(new Date());
    const existingWeek = learningPath.analytics.weeklyProgress.find(w => w.week === currentWeek);
    
    if (existingWeek) {
        existingWeek.timeSpent += timeSpent;
        existingWeek.skillsImproved += skillsImproved;
    } else {
        learningPath.analytics.weeklyProgress.push({
            week: currentWeek,
            timeSpent,
            skillsImproved
        });
    }

    // Keep only last 12 weeks
    if (learningPath.analytics.weeklyProgress.length > 12) {
        learningPath.analytics.weeklyProgress = learningPath.analytics.weeklyProgress.slice(-12);
    }
};

const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

module.exports = {
    createLearningPath,
    getLearningPath,
    updateSkillProgress,
    getSkillRecommendations,
    completeLearningItem
};
