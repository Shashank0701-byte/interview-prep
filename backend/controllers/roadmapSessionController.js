const RoadmapSession = require("../models/RoadmapSession");
const Question = require("../models/Question");

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

        // Generate curated, phase-specific questions
        const questionDocs = await generatePhaseSpecificQuestions(
            session._id, 
            roadmapRole, 
            phaseId, 
            phaseName, 
            experience
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

// Generate curated, phase-specific questions based on role and phase
const generatePhaseSpecificQuestions = async (sessionId, roadmapRole, phaseId, phaseName, experience) => {
    const questionSets = getPhaseQuestionSets(roadmapRole, phaseName);
    const questions = [];
    
    // Generate a balanced mix of difficulties: 40% Easy, 40% Medium, 20% Hard
    const totalQuestions = 10; // Fixed number for curated experience
    const easyCount = Math.ceil(totalQuestions * 0.4);
    const mediumCount = Math.ceil(totalQuestions * 0.4);
    const hardCount = totalQuestions - easyCount - mediumCount;
    
    // Create questions with balanced difficulty distribution
    for (let i = 0; i < totalQuestions; i++) {
        let difficulty;
        if (i < easyCount) difficulty = 'Easy';
        else if (i < easyCount + mediumCount) difficulty = 'Medium';
        else difficulty = 'Hard';
        
        const questionData = questionSets[i % questionSets.length];
        
        const question = await Question.create({
            session: sessionId,
            question: questionData.question,
            answer: questionData.answer,
            difficulty: difficulty,
            category: questionData.category,
            tags: questionData.tags || [phaseName, roadmapRole]
        });
        
        questions.push(question);
    }
    
    return questions;
};

// Get phase-specific question sets for each role and phase combination
const getPhaseQuestionSets = (roadmapRole, phaseName) => {
    const questionDatabase = {
        'Software Engineer': {
            'Foundation': [
                {
                    question: "What are the fundamental data structures every software engineer should know, and when would you use each one?",
                    answer: "The fundamental data structures include: Arrays (for sequential data with index access), Linked Lists (for dynamic size and insertion/deletion), Stacks (LIFO operations like function calls), Queues (FIFO operations like task scheduling), Hash Tables (for fast key-value lookups), Trees (for hierarchical data and searching), and Graphs (for network relationships). Each serves specific use cases based on access patterns and performance requirements.",
                    category: "Data Structures",
                    tags: ["Foundation", "Data Structures", "Software Engineering"]
                },
                {
                    question: "Explain the difference between procedural, object-oriented, and functional programming paradigms.",
                    answer: "Procedural programming organizes code into functions that operate on data. Object-oriented programming encapsulates data and behavior into objects with inheritance and polymorphism. Functional programming treats computation as evaluation of mathematical functions, emphasizing immutability and avoiding side effects. Each paradigm offers different approaches to problem-solving and code organization.",
                    category: "Programming Paradigms",
                    tags: ["Foundation", "Programming Paradigms", "Software Engineering"]
                },
                {
                    question: "What is Big O notation and why is it important for algorithm analysis?",
                    answer: "Big O notation describes the upper bound of algorithm complexity in terms of time and space as input size grows. It helps compare algorithm efficiency and predict performance at scale. Common complexities include O(1) constant, O(log n) logarithmic, O(n) linear, O(n²) quadratic. It's crucial for making informed decisions about algorithm selection and optimization.",
                    category: "Algorithm Analysis",
                    tags: ["Foundation", "Algorithms", "Complexity Analysis"]
                }
            ],
            'Problem Solving': [
                {
                    question: "How would you approach solving a complex algorithmic problem you've never seen before?",
                    answer: "1) Understand the problem thoroughly with examples. 2) Identify patterns and similar problems. 3) Break down into smaller subproblems. 4) Choose appropriate data structures and algorithms. 5) Implement a brute force solution first. 6) Optimize iteratively. 7) Test with edge cases. 8) Analyze time/space complexity. This systematic approach ensures thorough problem-solving.",
                    category: "Problem Solving Strategy",
                    tags: ["Problem Solving", "Algorithms", "Strategy"]
                },
                {
                    question: "Implement a function to find the longest palindromic substring in a given string.",
                    answer: "Use the expand-around-centers approach: For each character (and between characters for even-length palindromes), expand outward while characters match. Track the longest palindrome found. Time complexity: O(n²), Space: O(1). Alternative: Manacher's algorithm for O(n) time complexity.",
                    category: "String Algorithms",
                    tags: ["Problem Solving", "Strings", "Algorithms"]
                },
                {
                    question: "Design an algorithm to detect if a linked list has a cycle and find the starting point of the cycle.",
                    answer: "Use Floyd's Cycle Detection (tortoise and hare): 1) Use two pointers, slow (moves 1 step) and fast (moves 2 steps). 2) If they meet, a cycle exists. 3) To find cycle start, reset one pointer to head and move both one step at a time until they meet again. The meeting point is the cycle start. Time: O(n), Space: O(1).",
                    category: "Linked Lists",
                    tags: ["Problem Solving", "Linked Lists", "Cycle Detection"]
                }
            ],
            'System Design': [
                {
                    question: "Design a URL shortening service like bit.ly. What are the key components and considerations?",
                    answer: "Key components: 1) URL encoding service (base62 encoding), 2) Database for URL mappings, 3) Cache layer (Redis), 4) Load balancers, 5) Analytics service. Considerations: Scalability (handle millions of URLs), Custom aliases, Expiration, Rate limiting, Analytics tracking, Database sharding, CDN for global access. Architecture should support high read/write ratios.",
                    category: "System Architecture",
                    tags: ["System Design", "Scalability", "Web Services"]
                },
                {
                    question: "How would you design a chat application that supports millions of users?",
                    answer: "Architecture: 1) WebSocket servers for real-time communication, 2) Message queue (Kafka) for reliable delivery, 3) Database sharding for user data and messages, 4) Cache layer for active conversations, 5) CDN for media files, 6) Load balancers, 7) Notification service. Key considerations: Message ordering, Delivery guarantees, Online presence, Group chats, Media handling, End-to-end encryption.",
                    category: "Distributed Systems",
                    tags: ["System Design", "Real-time Systems", "Scalability"]
                },
                {
                    question: "Explain the trade-offs between SQL and NoSQL databases in system design.",
                    answer: "SQL databases offer ACID properties, strong consistency, complex queries, and mature ecosystem. Best for: Financial systems, complex relationships, transactions. NoSQL offers horizontal scalability, flexible schema, high performance for simple queries. Best for: Big data, rapid development, distributed systems. Trade-offs: Consistency vs Availability (CAP theorem), Query complexity vs Scalability, Schema flexibility vs Data integrity.",
                    category: "Database Design",
                    tags: ["System Design", "Databases", "Trade-offs"]
                }
            ],
            'Behavioral': [
                {
                    question: "Tell me about a time when you had to debug a complex production issue under pressure.",
                    answer: "Structure using STAR method: Situation (production outage affecting users), Task (identify and fix the issue quickly), Action (systematic debugging approach, log analysis, team collaboration, communication with stakeholders), Result (issue resolved, post-mortem conducted, preventive measures implemented). Emphasize problem-solving skills, communication, and learning from the experience.",
                    category: "Problem Solving",
                    tags: ["Behavioral", "Debugging", "Production Issues"]
                },
                {
                    question: "Describe a situation where you had to learn a new technology quickly for a project.",
                    answer: "Use STAR format: Situation (new project requiring unfamiliar technology), Task (become proficient quickly), Action (structured learning plan, documentation study, hands-on practice, seeking mentorship, building small projects), Result (successful project delivery, became team expert). Highlight learning agility, resourcefulness, and knowledge sharing with the team.",
                    category: "Learning Agility",
                    tags: ["Behavioral", "Learning", "Adaptability"]
                },
                {
                    question: "How do you handle conflicting priorities and tight deadlines in software development?",
                    answer: "Approach: 1) Assess and prioritize based on business impact, 2) Communicate with stakeholders about trade-offs, 3) Break down tasks and identify dependencies, 4) Negotiate scope or timeline when necessary, 5) Focus on MVP and iterative delivery, 6) Maintain code quality standards. Emphasize communication, prioritization skills, and stakeholder management.",
                    category: "Project Management",
                    tags: ["Behavioral", "Prioritization", "Time Management"]
                }
            ]
        },
        'Frontend Developer': {
            'Core Technologies': [
                {
                    question: "Explain the difference between var, let, and const in JavaScript and when to use each.",
                    answer: "var: Function-scoped, hoisted, can be redeclared and updated. let: Block-scoped, hoisted but not initialized, can be updated but not redeclared. const: Block-scoped, hoisted but not initialized, cannot be updated or redeclared (but objects/arrays can be mutated). Use const by default, let when reassignment is needed, avoid var in modern JavaScript.",
                    category: "JavaScript Fundamentals",
                    tags: ["Core Technologies", "JavaScript", "Variables"]
                },
                {
                    question: "What is the CSS Box Model and how does it affect element sizing?",
                    answer: "The CSS Box Model consists of: Content (actual content), Padding (space inside element), Border (element boundary), Margin (space outside element). Total element size = content + padding + border (in standard box model). box-sizing: border-box includes padding and border in the element's total width/height, making layout calculations easier.",
                    category: "CSS Fundamentals",
                    tags: ["Core Technologies", "CSS", "Layout"]
                },
                {
                    question: "How does the DOM work and what are efficient ways to manipulate it?",
                    answer: "DOM (Document Object Model) is a tree-like representation of HTML. Browser parses HTML into DOM nodes. Efficient manipulation: 1) Minimize DOM queries (cache references), 2) Batch DOM updates, 3) Use DocumentFragment for multiple insertions, 4) Avoid layout thrashing, 5) Use event delegation, 6) Consider virtual DOM libraries for complex apps.",
                    category: "DOM Manipulation",
                    tags: ["Core Technologies", "DOM", "Performance"]
                }
            ],
            'Framework Mastery': [
                {
                    question: "Explain React's Virtual DOM and how it improves performance.",
                    answer: "Virtual DOM is a JavaScript representation of the actual DOM. React creates a virtual tree, compares it with the previous version (diffing), and updates only the changed parts (reconciliation). Benefits: Batched updates, Minimal DOM manipulation, Predictable performance, Cross-browser compatibility. The diffing algorithm optimizes updates by identifying the minimum changes needed.",
                    category: "React",
                    tags: ["Framework Mastery", "React", "Performance"]
                },
                {
                    question: "What are React Hooks and how do they change component development?",
                    answer: "Hooks are functions that let you use state and lifecycle features in functional components. Key hooks: useState (state management), useEffect (side effects), useContext (context consumption), useMemo/useCallback (performance optimization). Benefits: Reusable stateful logic, Simpler component hierarchy, Better testing, Gradual adoption. They eliminate the need for class components in most cases.",
                    category: "React Hooks",
                    tags: ["Framework Mastery", "React", "Hooks"]
                },
                {
                    question: "How do you manage state in large React applications?",
                    answer: "State management strategies: 1) Local state (useState) for component-specific data, 2) Context API for theme/auth, 3) Redux/Zustand for global state, 4) React Query for server state, 5) URL state for navigation. Choose based on: State complexity, Sharing requirements, Performance needs, Team preferences. Avoid prop drilling and over-centralization.",
                    category: "State Management",
                    tags: ["Framework Mastery", "React", "State Management"]
                }
            ],
            'Performance & Tools': [
                {
                    question: "What are the key metrics for measuring web performance and how do you optimize them?",
                    answer: "Core Web Vitals: LCP (Largest Contentful Paint) - loading performance, FID (First Input Delay) - interactivity, CLS (Cumulative Layout Shift) - visual stability. Optimization strategies: Code splitting, Lazy loading, Image optimization, CDN usage, Caching strategies, Bundle analysis, Critical CSS, Service workers. Use tools like Lighthouse, WebPageTest, and browser DevTools.",
                    category: "Web Performance",
                    tags: ["Performance & Tools", "Optimization", "Metrics"]
                },
                {
                    question: "Explain the modern JavaScript build process and tools like Webpack, Vite, or Parcel.",
                    answer: "Build tools transform modern JavaScript into browser-compatible code. Process: 1) Transpilation (Babel), 2) Bundling (combining modules), 3) Minification, 4) Asset optimization. Webpack: Highly configurable, plugin ecosystem. Vite: Fast dev server, ESM-based. Parcel: Zero-config, automatic optimization. Modern tools focus on development speed and optimized production builds.",
                    category: "Build Tools",
                    tags: ["Performance & Tools", "Build Process", "Tooling"]
                },
                {
                    question: "How do you implement responsive design and ensure cross-browser compatibility?",
                    answer: "Responsive design: 1) Mobile-first approach, 2) Flexible grid systems (CSS Grid, Flexbox), 3) Responsive images (srcset, picture element), 4) Media queries for breakpoints, 5) Relative units (rem, em, %). Cross-browser: Feature detection, Progressive enhancement, Polyfills, CSS prefixes, Testing across browsers/devices. Tools: BrowserStack, Can I Use, Autoprefixer.",
                    category: "Responsive Design",
                    tags: ["Performance & Tools", "Responsive Design", "Compatibility"]
                }
            ],
            'Behavioral': [
                {
                    question: "Describe a challenging UI/UX problem you solved and your approach.",
                    answer: "Use STAR method: Situation (complex user interface requirement), Task (create intuitive and performant solution), Action (user research, prototyping, iterative design, performance optimization, user testing), Result (improved user satisfaction, better metrics). Emphasize user-centered thinking, collaboration with designers, and technical problem-solving.",
                    category: "UI/UX Problem Solving",
                    tags: ["Behavioral", "UI/UX", "Problem Solving"]
                },
                {
                    question: "How do you stay updated with the rapidly changing frontend ecosystem?",
                    answer: "Learning strategies: 1) Follow industry leaders and blogs, 2) Participate in developer communities, 3) Attend conferences and webinars, 4) Experiment with new technologies in side projects, 5) Contribute to open source, 6) Regular code reviews and knowledge sharing. Balance: Stay informed but avoid chasing every trend. Focus on fundamentals and evaluate new tools based on project needs.",
                    category: "Continuous Learning",
                    tags: ["Behavioral", "Learning", "Industry Trends"]
                },
                {
                    question: "Tell me about a time you had to optimize a slow-performing web application.",
                    answer: "STAR approach: Situation (performance issues affecting user experience), Task (identify bottlenecks and improve performance), Action (performance auditing, code profiling, optimization techniques, monitoring implementation), Result (measurable performance improvements, better user satisfaction). Highlight analytical skills, systematic approach, and impact measurement.",
                    category: "Performance Optimization",
                    tags: ["Behavioral", "Performance", "Optimization"]
                }
            ]
        }
        // Add more roles as needed...
    };
    
    return questionDatabase[roadmapRole]?.[phaseName] || questionDatabase['Software Engineer']['Foundation'];
};

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

module.exports = {
    createRoadmapSession,
    getPhaseRoadmapSessions,
    getMyRoadmapSessions,
    getRoadmapSessionById,
    deleteRoadmapSession,
    updateRoadmapSessionRating,
    updateRoadmapSessionProgress,
};
