const Session = require('../models/Session');
const Question = require('../models/Question');

// Role-specific learning path templates
const ROLE_ROADMAPS = {
    'Software Engineer': {
        phases: [
            {
                name: 'Foundation',
                description: 'Build core programming fundamentals',
                topics: ['Data Structures', 'Algorithms', 'Programming Concepts'],
                estimatedDays: 14,
                color: 'blue'
            },
            {
                name: 'Problem Solving',
                description: 'Master coding interview patterns',
                topics: ['Array Problems', 'String Manipulation', 'Linked Lists', 'Trees'],
                estimatedDays: 21,
                color: 'purple'
            },
            {
                name: 'System Design',
                description: 'Learn to design scalable systems',
                topics: ['System Architecture', 'Database Design', 'Scalability'],
                estimatedDays: 14,
                color: 'emerald'
            },
            {
                name: 'Behavioral',
                description: 'Prepare for soft skill questions',
                topics: ['Leadership', 'Teamwork', 'Problem Resolution'],
                estimatedDays: 7,
                color: 'amber'
            }
        ]
    },
    'Frontend Developer': {
        phases: [
            {
                name: 'Core Technologies',
                description: 'Master HTML, CSS, and JavaScript',
                topics: ['HTML/CSS', 'JavaScript', 'DOM Manipulation'],
                estimatedDays: 10,
                color: 'cyan'
            },
            {
                name: 'Framework Mastery',
                description: 'Deep dive into modern frameworks',
                topics: ['React', 'Vue', 'Angular', 'State Management'],
                estimatedDays: 18,
                color: 'blue'
            },
            {
                name: 'Performance & Tools',
                description: 'Optimize and build efficiently',
                topics: ['Performance', 'Build Tools', 'Testing'],
                estimatedDays: 12,
                color: 'green'
            },
            {
                name: 'Behavioral',
                description: 'Showcase your collaboration skills',
                topics: ['Design Collaboration', 'User Experience', 'Team Communication'],
                estimatedDays: 7,
                color: 'purple'
            }
        ]
    },
    'Backend Developer': {
        phases: [
            {
                name: 'Server Fundamentals',
                description: 'Master server-side programming',
                topics: ['APIs', 'Databases', 'Server Architecture'],
                estimatedDays: 12,
                color: 'indigo'
            },
            {
                name: 'Data & Security',
                description: 'Handle data securely and efficiently',
                topics: ['Database Optimization', 'Security', 'Authentication'],
                estimatedDays: 15,
                color: 'red'
            },
            {
                name: 'Scalability',
                description: 'Build systems that scale',
                topics: ['Microservices', 'Caching', 'Load Balancing'],
                estimatedDays: 18,
                color: 'emerald'
            },
            {
                name: 'Behavioral',
                description: 'Demonstrate technical leadership',
                topics: ['Technical Decision Making', 'Code Review', 'Mentoring'],
                estimatedDays: 7,
                color: 'orange'
            }
        ]
    },
    'Full Stack Developer': {
        phases: [
            {
                name: 'Frontend Basics',
                description: 'Build engaging user interfaces',
                topics: ['React/Vue', 'CSS Frameworks', 'State Management'],
                estimatedDays: 14,
                color: 'cyan'
            },
            {
                name: 'Backend Integration',
                description: 'Connect frontend with robust backends',
                topics: ['APIs', 'Databases', 'Authentication'],
                estimatedDays: 16,
                color: 'purple'
            },
            {
                name: 'System Architecture',
                description: 'Design complete applications',
                topics: ['Full Stack Architecture', 'Deployment', 'DevOps'],
                estimatedDays: 20,
                color: 'emerald'
            },
            {
                name: 'Behavioral',
                description: 'Show versatility and adaptability',
                topics: ['Cross-functional Collaboration', 'Learning Agility', 'Problem Solving'],
                estimatedDays: 7,
                color: 'amber'
            }
        ]
    },
    'DevOps Engineer': {
        phases: [
            {
                name: 'Infrastructure',
                description: 'Master cloud and infrastructure',
                topics: ['Cloud Platforms', 'Infrastructure as Code', 'Networking'],
                estimatedDays: 16,
                color: 'blue'
            },
            {
                name: 'CI/CD & Automation',
                description: 'Automate deployment pipelines',
                topics: ['CI/CD', 'Automation', 'Scripting'],
                estimatedDays: 14,
                color: 'green'
            },
            {
                name: 'Monitoring & Security',
                description: 'Ensure system reliability and security',
                topics: ['Monitoring', 'Security', 'Incident Response'],
                estimatedDays: 12,
                color: 'red'
            },
            {
                name: 'Behavioral',
                description: 'Demonstrate operational excellence',
                topics: ['Reliability', 'Collaboration', 'Continuous Improvement'],
                estimatedDays: 7,
                color: 'purple'
            }
        ]
    }
};

// @desc    Generate role-specific roadmap
// @route   GET /api/roadmap/:role
// @access  Private
const generateRoadmap = async (req, res) => {
    try {
        const { role } = req.params;
        const decodedRole = decodeURIComponent(role); // Decode URL-encoded role name
        const userId = req.user._id;
        
        console.log('Generating roadmap for role:', decodedRole);
        console.log('Available roles:', Object.keys(ROLE_ROADMAPS));

        // Get user's existing sessions for this role
        console.log('Fetching sessions for user:', userId, 'and role:', decodedRole);
        const userSessions = await Session.find({ 
            user: userId,
            role: { $regex: new RegExp(decodedRole, 'i') }
        }).populate('questions');
        
        console.log('Found sessions:', userSessions.length);

        // Get the roadmap template for this role
        const roadmapTemplate = ROLE_ROADMAPS[decodedRole] || ROLE_ROADMAPS['Software Engineer'];
        
        if (!roadmapTemplate) {
            return res.status(400).json({ message: `Roadmap template not found for role: ${decodedRole}` });
        }

        // Calculate progress for each phase - First pass: calculate completion percentages
        const phasesWithProgress = roadmapTemplate.phases.map((phase, index) => {
            // Find sessions that match this phase's topics
            const relevantSessions = userSessions.filter(session => {
                // Handle cases where topicsToFocus might be null/undefined
                if (!session.topicsToFocus || !Array.isArray(session.topicsToFocus)) {
                    return false;
                }
                
                return phase.topics.some(topic => 
                    session.topicsToFocus.some(sessionTopic => 
                        sessionTopic && typeof sessionTopic === 'string' &&
                        (sessionTopic.toLowerCase().includes(topic.toLowerCase()) ||
                        topic.toLowerCase().includes(sessionTopic.toLowerCase()))
                    )
                );
            });

            // Calculate completion percentage
            const totalQuestions = relevantSessions.reduce((sum, session) => sum + session.questions.length, 0);
            const masteredQuestions = relevantSessions.reduce((sum, session) => sum + session.masteredQuestions, 0);
            const completionPercentage = totalQuestions > 0 ? Math.round((masteredQuestions / totalQuestions) * 100) : 0;

            return {
                ...phase,
                id: `phase-${index + 1}`,
                order: index + 1,
                completionPercentage,
                sessionsCount: relevantSessions.length,
                totalQuestions,
                masteredQuestions,
                sessions: relevantSessions.map(session => ({
                    id: session._id,
                    role: session.role || 'Unknown',
                    experience: session.experience || 0,
                    completionPercentage: session.completionPercentage || 0,
                    status: session.status || 'Active',
                    questionsCount: session.questions ? session.questions.length : 0,
                    masteredQuestions: session.masteredQuestions || 0,
                    createdAt: session.createdAt
                }))
            };
        });

        // Second pass: determine status based on previous phase completion
        const roadmapWithProgress = phasesWithProgress.map((phase, index) => {
            let status = 'locked';
            if (index === 0) {
                status = 'available';
            } else if (phasesWithProgress[index - 1]?.completionPercentage >= 70) {
                status = 'available';
            }
            
            if (phase.completionPercentage >= 100) {
                status = 'completed';
            } else if (phase.completionPercentage > 0 && status === 'available') {
                status = 'in_progress';
            }

            return {
                ...phase,
                status
            };
        });

        // Calculate overall roadmap progress
        const overallProgress = Math.round(
            roadmapWithProgress.reduce((sum, phase) => sum + phase.completionPercentage, 0) / roadmapWithProgress.length
        );

        // Estimate completion time
        const remainingDays = roadmapWithProgress.reduce((sum, phase) => {
            if (phase.completionPercentage < 100) {
                const remainingPercentage = (100 - phase.completionPercentage) / 100;
                return sum + (phase.estimatedDays * remainingPercentage);
            }
            return sum;
        }, 0);

        const roadmap = {
            role: decodedRole,
            overallProgress,
            estimatedCompletionDays: Math.ceil(remainingDays),
            phases: roadmapWithProgress,
            totalPhases: roadmapWithProgress.length,
            completedPhases: roadmapWithProgress.filter(p => p.status === 'completed').length,
            generatedAt: new Date()
        };

        res.status(200).json(roadmap);

    } catch (error) {
        console.error("Error generating roadmap:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message,
            role: req.params.role 
        });
    }
};

// @desc    Get available roles for roadmaps
// @route   GET /api/roadmap/roles
// @access  Private
const getAvailableRoles = async (req, res) => {
    try {
        const roles = Object.keys(ROLE_ROADMAPS).map(role => ({
            name: role,
            phases: ROLE_ROADMAPS[role].phases.length,
            estimatedDays: ROLE_ROADMAPS[role].phases.reduce((sum, phase) => sum + phase.estimatedDays, 0)
        }));

        res.status(200).json(roles);
    } catch (error) {
        console.error("Error fetching available roles:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get user's roadmap progress summary
// @route   GET /api/roadmap/progress
// @access  Private
const getRoadmapProgress = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get user's sessions grouped by role
        const userSessions = await Session.find({ user: userId }).populate('questions');
        
        const roleProgress = {};
        
        userSessions.forEach(session => {
            if (!roleProgress[session.role]) {
                roleProgress[session.role] = {
                    role: session.role,
                    sessionsCount: 0,
                    totalQuestions: 0,
                    masteredQuestions: 0,
                    completionPercentage: 0
                };
            }
            
            roleProgress[session.role].sessionsCount++;
            roleProgress[session.role].totalQuestions += session.questions.length;
            roleProgress[session.role].masteredQuestions += session.masteredQuestions;
        });

        // Calculate completion percentages
        Object.keys(roleProgress).forEach(role => {
            const progress = roleProgress[role];
            progress.completionPercentage = progress.totalQuestions > 0 
                ? Math.round((progress.masteredQuestions / progress.totalQuestions) * 100)
                : 0;
        });

        res.status(200).json(Object.values(roleProgress));

    } catch (error) {
        console.error("Error fetching roadmap progress:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    generateRoadmap,
    getAvailableRoles,
    getRoadmapProgress
};
