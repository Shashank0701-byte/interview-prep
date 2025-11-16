const RoadmapSession = require("../models/RoadmapSession");
const Question = require("../models/Question");
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Log API key status on startup (without exposing the key)
if (!process.env.GOOGLE_AI_API_KEY) {
    console.error('❌ GOOGLE_AI_API_KEY is not set in environment variables!');
} else {
    console.log('✅ Gemini API key is configured (length:', process.env.GOOGLE_AI_API_KEY.length, 'characters)');
}

// Create a new roadmap session with curated, phase-specific questions
const createRoadmapSession = async (req, res) => {
    try {
        const { 
            role, 
            experience, 
            topicsToFocus, 
            description, 
            phaseId,
            phaseName,
            phaseColor,
            roadmapRole
        } = req.body;
        const userId = req.user._id;

        // Create the roadmap session
        const session = await RoadmapSession.create({
            user: userId,
            role,
            experience,
            topicsToFocus,
            description,
            phaseId,
            phaseName,
            phaseColor: phaseColor || 'blue',
            roadmapRole,
            sessionType: 'roadmap'
        });

        // Generate curated, phase-specific questions using Gemini AI
        const questionDocs = await generatePhaseSpecificQuestions(
            session._id, 
            roadmapRole, 
            phaseId, 
            phaseName, 
            experience,
            topicsToFocus
        );

        // Update session with questions
        session.questions = questionDocs.map(q => q._id);
        await session.save();

        // Populate questions and return
        const populatedSession = await RoadmapSession.findById(session._id).populate('questions');
        
        res.status(201).json({ 
            success: true, 
            message: "Roadmap session created successfully", 
            session: populatedSession 
        });
    } catch (error) {
        console.error("Error creating roadmap session:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to create roadmap session" 
        });
    }
};

// Get roadmap sessions for a specific phase (returns pre-defined templates + user's started sessions)
const getPhaseRoadmapSessions = async (req, res) => {
    try {
        const { role, phaseId } = req.params;
        const userId = req.user._id;

        console.log(`Fetching phase sessions for role: ${role}, phaseId: ${phaseId}`);

        // Get user's existing roadmap sessions for this phase
        const userSessions = await RoadmapSession.find({ 
            user: userId, 
            roadmapRole: role, 
            phaseId: phaseId 
        })
        .populate('questions')
        .sort({ createdAt: -1 });

        // Get pre-defined session templates for this phase
        const sessionTemplates = getPhaseSessionTemplates(role, phaseId);
        console.log(`Found ${sessionTemplates.length} templates for ${role} - ${phaseId}`);
        
        // Mark templates as started if user has created them
        const templatesWithStatus = sessionTemplates.map(template => {
            const existingSession = userSessions.find(session => 
                session.role === template.role && 
                session.topicsToFocus === template.topicsToFocus.join(', ')
            );
            
            return {
                ...template,
                isStarted: !!existingSession,
                sessionId: existingSession?._id,
                completionPercentage: existingSession?.completionPercentage || 0,
                questions: existingSession?.questions || []
            };
        });

        res.status(200).json({ 
            success: true, 
            sessions: templatesWithStatus 
        });
    } catch (error) {
        console.error("Error fetching phase roadmap sessions:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch roadmap sessions" 
        });
    }
};

// Get all roadmap sessions for a user
const getMyRoadmapSessions = async (req, res) => {
    try {
        const sessions = await RoadmapSession.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate("questions");
        
        res.status(200).json({ success: true, sessions });
    } catch (error) {
        console.error("Error fetching roadmap sessions:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get roadmap session by ID
const getRoadmapSessionById = async (req, res) => {
    try {
        const session = await RoadmapSession.findById(req.params.id)
            .populate({
                path: "questions",
                options: { sort: { isPinned: -1, createdAt: 1 } },
            })
            .exec();

        if (!session) {
            return res.status(404).json({ success: false, message: "Roadmap session not found" });
        }

        // Verify the session belongs to the user
        if (session.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }

        res.status(200).json({ success: true, session });
    } catch (error) {
        console.error("Error fetching roadmap session:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Delete roadmap session
const deleteRoadmapSession = async (req, res) => {
    try {
        const session = await RoadmapSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ message: "Roadmap session not found" });
        }
        if (session.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to delete this session" });
        }

        await Question.deleteMany({ session: session._id });
        await session.deleteOne();

        res.status(200).json({ success: true, message: "Roadmap session deleted" });
    } catch (error) {
        console.error("Error deleting roadmap session:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Update roadmap session rating
const updateRoadmapSessionRating = async (req, res) => {
    try {
        const { id } = req.params;
        const { overall, difficulty, usefulness } = req.body;
        const userId = req.user._id;

        // Validate rating values
        const ratings = { overall, difficulty, usefulness };
        for (const [key, value] of Object.entries(ratings)) {
            if (value !== undefined && (value < 1 || value > 5)) {
                return res.status(400).json({ message: `${key} rating must be between 1 and 5` });
            }
        }

        const session = await RoadmapSession.findById(id);
        if (!session) {
            return res.status(404).json({ message: "Roadmap session not found" });
        }

        // Verify the session belongs to the user
        if (session.user.toString() !== userId.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Update ratings
        if (overall !== undefined) session.userRating.overall = overall;
        if (difficulty !== undefined) session.userRating.difficulty = difficulty;
        if (usefulness !== undefined) session.userRating.usefulness = usefulness;

        await session.save();
        res.status(200).json({ message: "Rating updated successfully", session });

    } catch (error) {
        console.error("Error updating roadmap session rating:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Update roadmap session progress
const updateRoadmapSessionProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const session = await RoadmapSession.findById(id).populate('questions');
        if (!session) {
            return res.status(404).json({ message: "Roadmap session not found" });
        }

        if (session.user.toString() !== userId.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Calculate progress based on mastered questions
        const totalQuestions = session.questions.length;
        const masteredQuestions = session.questions.filter(q => q.isMastered).length;
        const completionPercentage = totalQuestions > 0 ? Math.round((masteredQuestions / totalQuestions) * 100) : 0;

        session.masteredQuestions = masteredQuestions;
        session.completionPercentage = completionPercentage;

        // Auto-update status based on progress
        if (completionPercentage === 100) {
            session.status = 'Completed';
        } else if (completionPercentage > 0) {
            session.status = 'Active';
        }

        await session.save();
        res.status(200).json({ message: "Progress updated successfully", session });

    } catch (error) {
        console.error("Error updating roadmap session progress:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Generate curated, phase-specific questions based on role and phase using Gemini AI
const generatePhaseSpecificQuestions = async (sessionId, roadmapRole, phaseId, phaseName, experience, topicsToFocus) => {
    const questions = [];
    
    try {
        // Generate a balanced mix of difficulties: 40% Easy, 40% Medium, 20% Hard
        // Reduced to 5 questions for faster generation
        const totalQuestions = 5;
        const easyCount = 2;
        const mediumCount = 2;
        const hardCount = 1;
        
        // Determine if this is a coding-focused phase
        const codingPhases = ['Foundation', 'Problem Solving', 'Core Technologies', 'Framework Mastery'];
        const isCodingPhase = codingPhases.includes(phaseName);
        
        // Generate questions for each difficulty level
        const difficulties = [
            ...Array(easyCount).fill('Easy'),
            ...Array(mediumCount).fill('Medium'),
            ...Array(hardCount).fill('Hard')
        ];
        
        console.log(`🤖 Starting Gemini question generation for ${phaseName} phase...`);
        
        for (let i = 0; i < difficulties.length; i++) {
            const difficulty = difficulties[i];
            const isCodingQuestion = isCodingPhase && (i % 3 === 0); // Every 3rd question is coding
            
            console.log(`Generating question ${i + 1}/${difficulties.length} - ${difficulty} ${isCodingQuestion ? '(Coding)' : '(Conceptual)'}`);
            
            const questionData = await generateQuestionWithGemini(
                roadmapRole,
                phaseName,
                difficulty,
                topicsToFocus,
                experience,
                isCodingQuestion,
                i + 1
            );
            
            if (questionData) {
                const question = await Question.create({
                    session: sessionId,
                    question: questionData.question,
                    answer: questionData.answer,
                    difficulty: difficulty,
                    category: questionData.category,
                    tags: questionData.tags || [phaseName, roadmapRole],
                    interviewType: questionData.interviewType || 'Technical'
                });
                
                questions.push(question);
                console.log(`✓ Question ${i + 1} created successfully`);
            } else {
                console.error(`✗ Failed to generate question ${i + 1}`);
            }
        }
        
        console.log(`✅ Generated ${questions.length}/${totalQuestions} questions successfully`);
        
        if (questions.length === 0) {
            console.error('❌ No questions were generated! Check Gemini API key and quota.');
        }
        
        return questions;
    } catch (error) {
        console.error('Error generating questions with Gemini:', error);
        // Fallback to basic questions if Gemini fails
        return generateFallbackQuestions(sessionId, roadmapRole, phaseName, experience, topicsToFocus);
    }
};

// Generate a single question using Gemini AI with retry logic
const generateQuestionWithGemini = async (role, phase, difficulty, topics, experience, isCoding, questionNumber, retries = 2) => {
    const topicsString = Array.isArray(topics) ? topics.join(', ') : topics;
    
    // Try multiple model configurations (same as questionController.js)
    const modelConfigs = [
        { name: "gemini-2.0-flash-exp", config: {} },
        { name: "gemini-1.5-flash-latest", config: {} },
        { name: "gemini-1.5-flash", config: {} },
        { name: "gemini-1.5-pro-latest", config: {} },
    ];
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        for (const { name, config } of modelConfigs) {
            try {
                const model = genAI.getGenerativeModel({
                    model: name,
                    generationConfig: config,
                });
            
            const prompt = isCoding ? 
                `Generate a unique ${difficulty} level coding interview question for a ${role} position, focusing on the ${phase} phase.
                
                Topics to cover: ${topicsString}
                Experience level: ${experience} years
                Question number: ${questionNumber}
                
                Requirements:
                1. Create a UNIQUE coding problem (not a common LeetCode problem)
                2. Include a clear problem statement
                3. Provide example input/output
                4. Include edge cases to consider
                5. Provide a detailed solution with code implementation
                6. Explain time and space complexity
                7. Make it practical and interview-relevant
                
                Format your response STRICTLY as valid JSON (no markdown, no code blocks):
                {
                    "question": "Problem statement with examples",
                    "answer": "Detailed solution with code, complexity analysis, and explanation",
                    "category": "Specific category like 'Arrays', 'Dynamic Programming', etc.",
                    "tags": ["tag1", "tag2", "tag3"],
                    "interviewType": "Coding"
                }` 
                : 
                `Generate a unique ${difficulty} level interview question for a ${role} position, focusing on the ${phase} phase.
                
                Topics to cover: ${topicsString}
                Experience level: ${experience} years
                Question number: ${questionNumber}
                
                Requirements:
                1. Create a UNIQUE question (not commonly asked)
                2. Make it relevant to real-world scenarios
                3. Ensure it tests deep understanding, not just memorization
                4. Provide a comprehensive answer with examples
                5. Include practical insights and best practices
                
                Format your response STRICTLY as valid JSON (no markdown, no code blocks):
                {
                    "question": "Your unique interview question",
                    "answer": "Comprehensive answer with examples and explanations",
                    "category": "Specific category",
                    "tags": ["tag1", "tag2", "tag3"],
                    "interviewType": "Technical"
                }`;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();
            
            // Clean up the response - remove markdown code blocks if present
            text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
            
            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const questionData = JSON.parse(jsonMatch[0]);
                
                // Validate required fields
                if (questionData.question && questionData.answer && questionData.category) {
                    console.log(`✓ Successfully generated ${difficulty} question ${questionNumber} with model ${name} (attempt ${attempt})`);
                    return questionData;
                }
            }
            
            // If this model didn't work, try the next one
            console.warn(`Model ${name} didn't return valid data, trying next model...`);
            
        } catch (error) {
            // If this model failed, try the next one
            console.log(`Model ${name} failed: ${error.message}, trying next model...`);
            continue; // Try next model
        }
        }
        
        // If all models failed for this attempt, wait before retrying
        if (attempt < retries) {
            console.log(`All models failed for attempt ${attempt}, waiting ${1000 * attempt}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
    
    console.error('All retry attempts and models failed for question generation');
    return null;
};

// Fallback function to generate basic questions if Gemini fails
const generateFallbackQuestions = async (sessionId, roadmapRole, phaseName, experience, topicsToFocus) => {
    const questions = [];
    
    console.warn('Gemini API failed, generating basic fallback questions');
    
    const totalQuestions = 5;
    const difficulties = ['Easy', 'Easy', 'Medium', 'Medium', 'Hard'];
    const topicsArray = Array.isArray(topicsToFocus) ? topicsToFocus : topicsToFocus.split(',').map(t => t.trim());
    
    for (let i = 0; i < totalQuestions; i++) {
        const difficulty = difficulties[i];
        const topic = topicsArray[i % topicsArray.length];
        
        const question = await Question.create({
            session: sessionId,
            question: `${difficulty} level question about ${topic} for ${roadmapRole} - ${phaseName} phase`,
            answer: `This is a placeholder answer. Please regenerate questions with a valid Gemini API key for detailed content.`,
            difficulty: difficulty,
            category: topic,
            tags: [phaseName, roadmapRole, topic],
            interviewType: 'Technical'
        });
        
        questions.push(question);
    }
    
    return questions;
};

// This function has been removed - all questions are now generated dynamically by Gemini AI

// Get pre-defined session templates for a specific role and phase
const getPhaseSessionTemplates = (role, phaseId) => {
    console.log(`Looking for templates for role: "${role}", phaseId: "${phaseId}"`);
    const sessionTemplates = {
        'Software Engineer': {
            'phase-1': [ // Foundation
                {
                    _id: `template-${role}-${phaseId}-1`,
                    role: 'Big O Notation Fundamentals',
                    experience: '1',
                    topicsToFocus: ['Big O Notation', 'Time Complexity', 'Space Complexity'],
                    description: 'Master the fundamentals of algorithm analysis and complexity',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 10 }
                },
                {
                    _id: `template-${role}-${phaseId}-2`,
                    role: 'Arrays & Strings Basics',
                    experience: '1',
                    topicsToFocus: ['Arrays', 'Strings', 'Two Pointers'],
                    description: 'Essential array and string manipulation techniques',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 10 }
                },
                {
                    _id: `template-${role}-${phaseId}-3`,
                    role: 'Linked Lists Introduction',
                    experience: '1',
                    topicsToFocus: ['Linked Lists', 'Pointers', 'Node Manipulation'],
                    description: 'Understanding linked data structures and pointer manipulation',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 10 }
                },
                {
                    _id: `template-${role}-${phaseId}-4`,
                    role: 'Stacks & Queues Fundamentals',
                    experience: '1',
                    topicsToFocus: ['Stacks', 'Queues', 'LIFO', '+1 more'],
                    description: 'Master stack and queue data structures',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 8 }
                }
            ],
            'phase-2': [ // Problem Solving
                {
                    _id: `template-${role}-${phaseId}-1`,
                    role: 'Basic Sorting Algorithms',
                    experience: '2',
                    topicsToFocus: ['Bubble Sort', 'Selection Sort', 'Insertion Sort'],
                    description: 'Introduction to fundamental sorting techniques',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 6 }
                },
                {
                    _id: `template-${role}-${phaseId}-2`,
                    role: 'Binary Search Mastery',
                    experience: '2',
                    topicsToFocus: ['Binary Search', 'Search Algorithms', 'Divide & Conquer'],
                    description: 'Master binary search and its variations',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 8 }
                },
                {
                    _id: `template-${role}-${phaseId}-3`,
                    role: 'Tree Traversal Techniques',
                    experience: '3',
                    topicsToFocus: ['Binary Trees', 'Tree Traversal', 'Recursion'],
                    description: 'Understanding tree structures and traversal methods',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 10 }
                },
                {
                    _id: `template-${role}-${phaseId}-4`,
                    role: 'Dynamic Programming Basics',
                    experience: '3',
                    topicsToFocus: ['Dynamic Programming', 'Memoization', 'Optimization'],
                    description: 'Introduction to dynamic programming concepts',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 12 }
                }
            ],
            'phase-3': [ // System Design
                {
                    _id: `template-${role}-${phaseId}-1`,
                    role: 'System Design Fundamentals',
                    experience: '4',
                    topicsToFocus: ['Scalability', 'Load Balancing', 'Caching'],
                    description: 'Core system design principles and concepts',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 8 }
                },
                {
                    _id: `template-${role}-${phaseId}-2`,
                    role: 'Database Design Patterns',
                    experience: '4',
                    topicsToFocus: ['SQL vs NoSQL', 'Database Sharding', 'ACID Properties'],
                    description: 'Database architecture and design decisions',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 10 }
                },
                {
                    _id: `template-${role}-${phaseId}-3`,
                    role: 'Distributed Systems Concepts',
                    experience: '5',
                    topicsToFocus: ['Microservices', 'Message Queues', 'Consistency'],
                    description: 'Understanding distributed system architecture',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 12 }
                }
            ],
            'phase-4': [ // Behavioral
                {
                    _id: `template-${role}-${phaseId}-1`,
                    role: 'Leadership & Communication',
                    experience: '3',
                    topicsToFocus: ['Leadership', 'Team Collaboration', 'Communication'],
                    description: 'Behavioral questions on leadership and teamwork',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 8 }
                },
                {
                    _id: `template-${role}-${phaseId}-2`,
                    role: 'Problem Solving Stories',
                    experience: '3',
                    topicsToFocus: ['Problem Solving', 'Critical Thinking', 'Innovation'],
                    description: 'Behavioral questions on problem-solving experiences',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 6 }
                },
                {
                    _id: `template-${role}-${phaseId}-3`,
                    role: 'Career Growth & Learning',
                    experience: '2',
                    topicsToFocus: ['Learning Agility', 'Career Development', 'Adaptability'],
                    description: 'Questions about professional growth and learning',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 7 }
                }
            ]
        },
        'Frontend Developer': {
            'phase-1': [ // Core Technologies
                {
                    _id: `template-${role}-${phaseId}-1`,
                    role: 'JavaScript Fundamentals',
                    experience: '1',
                    topicsToFocus: ['JavaScript', 'ES6+', 'DOM Manipulation'],
                    description: 'Core JavaScript concepts and modern features',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 10 }
                },
                {
                    _id: `template-${role}-${phaseId}-2`,
                    role: 'CSS Layout & Styling',
                    experience: '1',
                    topicsToFocus: ['CSS', 'Flexbox', 'Grid', 'Responsive Design'],
                    description: 'Modern CSS layout techniques and responsive design',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 8 }
                },
                {
                    _id: `template-${role}-${phaseId}-3`,
                    role: 'HTML5 & Accessibility',
                    experience: '1',
                    topicsToFocus: ['HTML5', 'Semantic HTML', 'Accessibility', 'SEO'],
                    description: 'Modern HTML practices and web accessibility',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 6 }
                }
            ],
            'phase-2': [ // Framework Mastery
                {
                    _id: `template-${role}-${phaseId}-1`,
                    role: 'React Fundamentals',
                    experience: '2',
                    topicsToFocus: ['React', 'Components', 'JSX', 'Props & State'],
                    description: 'Core React concepts and component development',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 12 }
                },
                {
                    _id: `template-${role}-${phaseId}-2`,
                    role: 'React Hooks & Context',
                    experience: '3',
                    topicsToFocus: ['React Hooks', 'Context API', 'State Management'],
                    description: 'Advanced React patterns and state management',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 10 }
                },
                {
                    _id: `template-${role}-${phaseId}-3`,
                    role: 'Component Architecture',
                    experience: '3',
                    topicsToFocus: ['Component Design', 'Reusability', 'Props Patterns'],
                    description: 'Building scalable and maintainable components',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 8 }
                }
            ]
        },
        'Backend Developer': {
            'phase-1': [ // Server Fundamentals
                {
                    _id: `template-${role}-${phaseId}-1`,
                    role: 'Server Architecture Basics',
                    experience: '1',
                    topicsToFocus: ['HTTP/HTTPS', 'REST APIs', 'Server Architecture'],
                    description: 'Understanding web server fundamentals and API design',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 10 }
                },
                {
                    _id: `template-${role}-${phaseId}-2`,
                    role: 'Database Fundamentals',
                    experience: '2',
                    topicsToFocus: ['SQL', 'Database Design', 'CRUD Operations'],
                    description: 'Master database concepts and SQL operations',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 12 }
                },
                {
                    _id: `template-${role}-${phaseId}-3`,
                    role: 'Authentication & Security',
                    experience: '2',
                    topicsToFocus: ['JWT', 'OAuth', 'Password Hashing', 'Security'],
                    description: 'Implement secure authentication and authorization',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 8 }
                },
                {
                    _id: `template-${role}-${phaseId}-4`,
                    role: 'API Development',
                    experience: '3',
                    topicsToFocus: ['RESTful APIs', 'GraphQL', 'API Documentation'],
                    description: 'Build robust and scalable APIs',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 10 }
                }
            ],
            'phase-2': [ // Data & Security
                {
                    _id: `template-${role}-${phaseId}-1`,
                    role: 'Database Optimization',
                    experience: '3',
                    topicsToFocus: ['Indexing', 'Query Optimization', 'Performance Tuning'],
                    description: 'Optimize database queries and improve performance',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 10 }
                },
                {
                    _id: `template-${role}-${phaseId}-2`,
                    role: 'Security Best Practices',
                    experience: '3',
                    topicsToFocus: ['SQL Injection', 'XSS', 'CSRF', 'Security Headers'],
                    description: 'Implement security measures to protect your applications',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 8 }
                },
                {
                    _id: `template-${role}-${phaseId}-3`,
                    role: 'Authentication Patterns',
                    experience: '4',
                    topicsToFocus: ['OAuth 2.0', 'JWT', 'Session Management', 'SSO'],
                    description: 'Advanced authentication and authorization patterns',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 12 }
                }
            ],
            'phase-3': [ // Scalability
                {
                    _id: `template-${role}-${phaseId}-1`,
                    role: 'Caching Strategies',
                    experience: '4',
                    topicsToFocus: ['Redis', 'Memcached', 'CDN', 'Cache Invalidation'],
                    description: 'Implement effective caching for better performance',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 10 }
                },
                {
                    _id: `template-${role}-${phaseId}-2`,
                    role: 'Microservices Architecture',
                    experience: '5',
                    topicsToFocus: ['Service Design', 'API Gateway', 'Service Discovery'],
                    description: 'Design and build scalable microservices',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 12 }
                },
                {
                    _id: `template-${role}-${phaseId}-3`,
                    role: 'Load Balancing & Scaling',
                    experience: '5',
                    topicsToFocus: ['Horizontal Scaling', 'Load Balancers', 'Auto-scaling'],
                    description: 'Scale applications to handle high traffic',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 8 }
                }
            ],
            'phase-4': [ // Behavioral
                {
                    _id: `template-${role}-${phaseId}-1`,
                    role: 'Technical Leadership',
                    experience: '4',
                    topicsToFocus: ['Code Reviews', 'Mentoring', 'Technical Decisions'],
                    description: 'Lead technical discussions and mentor junior developers',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 8 }
                },
                {
                    _id: `template-${role}-${phaseId}-2`,
                    role: 'System Design Discussions',
                    experience: '5',
                    topicsToFocus: ['Architecture Decisions', 'Trade-offs', 'Scalability'],
                    description: 'Discuss and defend system design choices',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 10 }
                }
            ]
        },
        'Full Stack Developer': {
            'phase-1': [ // Frontend Basics
                {
                    _id: `template-${role}-${phaseId}-1`,
                    role: 'HTML/CSS Fundamentals',
                    experience: '1',
                    topicsToFocus: ['HTML5', 'CSS3', 'Responsive Design'],
                    description: 'Master the building blocks of web development',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 8 }
                },
                {
                    _id: `template-${role}-${phaseId}-2`,
                    role: 'JavaScript Essentials',
                    experience: '2',
                    topicsToFocus: ['ES6+', 'DOM Manipulation', 'Event Handling'],
                    description: 'Core JavaScript concepts for web development',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 12 }
                },
                {
                    _id: `template-${role}-${phaseId}-3`,
                    role: 'Frontend Framework Basics',
                    experience: '2',
                    topicsToFocus: ['React', 'Component Architecture', 'State Management'],
                    description: 'Introduction to modern frontend frameworks',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 10 }
                },
                {
                    _id: `template-${role}-${phaseId}-4`,
                    role: 'Backend Integration',
                    experience: '3',
                    topicsToFocus: ['APIs', 'HTTP Requests', 'Data Fetching'],
                    description: 'Connect frontend with backend services',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 8 }
                }
            ]
        },
        'DevOps Engineer': {
            'phase-1': [ // Infrastructure
                {
                    _id: `template-${role}-${phaseId}-1`,
                    role: 'Linux System Administration',
                    experience: '2',
                    topicsToFocus: ['Linux Commands', 'File Systems', 'Process Management'],
                    description: 'Master Linux fundamentals for DevOps',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 10 }
                },
                {
                    _id: `template-${role}-${phaseId}-2`,
                    role: 'Containerization Basics',
                    experience: '2',
                    topicsToFocus: ['Docker', 'Containers', 'Images'],
                    description: 'Understanding containerization with Docker',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 8 }
                },
                {
                    _id: `template-${role}-${phaseId}-3`,
                    role: 'Version Control & Git',
                    experience: '1',
                    topicsToFocus: ['Git', 'Version Control', 'Branching Strategies'],
                    description: 'Master Git for collaborative development',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 8 }
                },
                {
                    _id: `template-${role}-${phaseId}-4`,
                    role: 'Cloud Fundamentals',
                    experience: '3',
                    topicsToFocus: ['AWS', 'Cloud Services', 'Infrastructure as Code'],
                    description: 'Introduction to cloud platforms and services',
                    isTemplate: true,
                    completionPercentage: 0,
                    questions: { length: 12 }
                }
            ]
        }
    };
    
    const result = sessionTemplates[role]?.[phaseId] || [];
    console.log(`Returning ${result.length} templates for ${role} - ${phaseId}`);
    console.log('Available roles:', Object.keys(sessionTemplates));
    if (sessionTemplates[role]) {
        console.log(`Available phases for ${role}:`, Object.keys(sessionTemplates[role]));
    }
    return result;
};

// Helper function to generate roadmap-specific questions
const generateRoadmapQuestion = (roadmapRole, experience, topics, index, phaseName) => {
    const currentTopic = topics[index % topics.length] || 'programming concepts';
    const alternativeTopic = topics[(index + 1) % topics.length] || 'software development';
    
    const phaseQuestionTemplates = {
        'Foundation': [
            `Explain the fundamentals of ${currentTopic} and how they apply in ${roadmapRole} roles.`,
            `What are the core principles of ${alternativeTopic} that every ${roadmapRole} should know?`,
            `How would you explain ${currentTopic} to someone new to ${roadmapRole}?`,
            `What are the best practices for implementing ${alternativeTopic} in ${roadmapRole} projects?`,
            `Compare different approaches to ${currentTopic} and their trade-offs.`,
            `How does ${alternativeTopic} impact the overall architecture in ${roadmapRole} work?`
        ],
        'Problem Solving': [
            `Solve this ${currentTopic} problem and explain your approach step by step.`,
            `How would you optimize a solution involving ${alternativeTopic}?`,
            `What's your strategy for debugging ${currentTopic} issues in ${roadmapRole} work?`,
            `Implement an efficient algorithm for ${alternativeTopic} processing.`,
            `How would you handle edge cases in ${currentTopic} implementations?`,
            `Design a data structure optimized for ${alternativeTopic} operations.`
        ],
        'System Design': [
            `Design a scalable system for ${currentTopic} considering ${roadmapRole} best practices.`,
            `How would you architect ${alternativeTopic} for high availability?`,
            `Explain the trade-offs in ${currentTopic} decisions for ${roadmapRole}.`,
            `Design a microservices architecture for ${alternativeTopic} management.`,
            `How would you ensure data consistency in ${currentTopic} systems?`,
            `Plan the infrastructure for ${alternativeTopic} at enterprise scale.`
        ],
        'Behavioral': [
            `Describe a challenging ${currentTopic} project you worked on as a ${roadmapRole}.`,
            `How do you handle ${alternativeTopic} conflicts in your role as a ${roadmapRole}?`,
            `Tell me about a time you had to learn ${currentTopic} quickly for your ${roadmapRole} work.`,
            `How do you prioritize ${alternativeTopic} tasks when working as a ${roadmapRole}?`,
            `Describe your approach to mentoring others in ${currentTopic} concepts.`,
            `How do you stay updated with ${alternativeTopic} trends in the ${roadmapRole} field?`
        ]
    };
    
    const templates = phaseQuestionTemplates[phaseName] || phaseQuestionTemplates['Foundation'];
    return templates[index % templates.length];
};

// Helper function to generate roadmap-specific answers
const generateRoadmapAnswer = (roadmapRole, experience, topics, index, phaseName) => {
    return `This is a comprehensive answer for the ${phaseName} phase, focusing on ${topics[index % topics.length] || 'the topic'} for a ${roadmapRole} with ${experience} years of experience. The answer includes phase-specific insights, practical examples, and career-relevant guidance tailored to the roadmap learning journey.`;
};

// Helper function to determine difficulty level
const getDifficultyLevel = (experience) => {
    const exp = parseInt(experience);
    if (exp <= 2) return 'Easy';
    if (exp <= 4) return 'Medium';
    return 'Hard';
};

// Regenerate questions for an existing session using Gemini AI
const regenerateSessionQuestions = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const session = await RoadmapSession.findById(id);
        if (!session) {
            return res.status(404).json({ message: "Roadmap session not found" });
        }

        if (session.user.toString() !== userId.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Delete old questions
        await Question.deleteMany({ session: session._id });

        // Generate new questions with Gemini AI
        const questionDocs = await generatePhaseSpecificQuestions(
            session._id,
            session.roadmapRole,
            session.phaseId,
            session.phaseName,
            session.experience,
            session.topicsToFocus
        );

        // Update session with new questions
        session.questions = questionDocs.map(q => q._id);
        session.masteredQuestions = 0;
        session.completionPercentage = 0;
        await session.save();

        // Populate and return
        const populatedSession = await RoadmapSession.findById(session._id).populate('questions');

        res.status(200).json({
            success: true,
            message: "Questions regenerated successfully with Gemini AI",
            session: populatedSession
        });
    } catch (error) {
        console.error("Error regenerating questions:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    createRoadmapSession,
    getPhaseRoadmapSessions,
    getMyRoadmapSessions,
    getRoadmapSessionById,
    deleteRoadmapSession,
    updateRoadmapSessionRating,
    updateRoadmapSessionProgress,
    regenerateSessionQuestions,
};
