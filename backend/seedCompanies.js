const mongoose = require('mongoose');
require('dotenv').config();

const Company = require('./models/Company');

const sampleCompanies = [
    {
        name: "Google",
        logo: "https://logo.clearbit.com/google.com",
        industry: "Technology",
        size: "Enterprise",
        location: "Mountain View, CA",
        culture: {
            values: ["Innovation", "User Focus", "Transparency", "Excellence"],
            interviewStyle: "Technical",
            difficulty: "Hard"
        },
        techStack: ["Python", "Java", "Go", "C++", "JavaScript", "React", "Angular"],
        interviewProcess: {
            rounds: 5,
            duration: "2-3 weeks",
            focus: ["Algorithms", "System Design", "Behavioral", "Coding"]
        },
        questionCategories: [
            { category: "Algorithms", weight: 1.5 },
            { category: "System Design", weight: 1.3 },
            { category: "Behavioral", weight: 1.0 },
            { category: "Coding", weight: 1.4 }
        ]
    },
    {
        name: "Meta (Facebook)",
        logo: "https://logo.clearbit.com/meta.com",
        industry: "Technology",
        size: "Enterprise",
        location: "Menlo Park, CA",
        culture: {
            values: ["Move Fast", "Be Bold", "Focus on Impact", "Build Social Value"],
            interviewStyle: "Technical",
            difficulty: "Hard"
        },
        techStack: ["React", "PHP", "Python", "Java", "Hack", "GraphQL"],
        interviewProcess: {
            rounds: 4,
            duration: "2-4 weeks",
            focus: ["Coding", "System Design", "Behavioral", "Product Sense"]
        },
        questionCategories: [
            { category: "Coding", weight: 1.5 },
            { category: "System Design", weight: 1.2 },
            { category: "Behavioral", weight: 1.0 },
            { category: "Product Sense", weight: 1.1 }
        ]
    },
    {
        name: "Amazon",
        logo: "https://logo.clearbit.com/amazon.com",
        industry: "E-commerce & Technology",
        size: "Enterprise",
        location: "Seattle, WA",
        culture: {
            values: ["Customer Obsession", "Ownership", "Invent and Simplify", "Learn and Be Curious"],
            interviewStyle: "Behavioral",
            difficulty: "Hard"
        },
        techStack: ["Java", "Python", "AWS", "React", "Node.js", "DynamoDB"],
        interviewProcess: {
            rounds: 5,
            duration: "3-4 weeks",
            focus: ["Leadership Principles", "Coding", "System Design", "Behavioral"]
        },
        questionCategories: [
            { category: "Leadership Principles", weight: 1.8 },
            { category: "Coding", weight: 1.3 },
            { category: "System Design", weight: 1.2 },
            { category: "Behavioral", weight: 1.4 }
        ]
    },
    {
        name: "Microsoft",
        logo: "https://logo.clearbit.com/microsoft.com",
        industry: "Technology",
        size: "Enterprise",
        location: "Redmond, WA",
        culture: {
            values: ["Growth Mindset", "Customer Focus", "Diversity and Inclusion", "One Microsoft"],
            interviewStyle: "Technical",
            difficulty: "Medium"
        },
        techStack: ["C#", ".NET", "Azure", "TypeScript", "React", "SQL Server"],
        interviewProcess: {
            rounds: 4,
            duration: "2-3 weeks",
            focus: ["Coding", "System Design", "Behavioral", "Problem Solving"]
        },
        questionCategories: [
            { category: "Coding", weight: 1.4 },
            { category: "System Design", weight: 1.2 },
            { category: "Behavioral", weight: 1.0 },
            { category: "Problem Solving", weight: 1.1 }
        ]
    },
    {
        name: "Apple",
        logo: "https://logo.clearbit.com/apple.com",
        industry: "Technology",
        size: "Enterprise",
        location: "Cupertino, CA",
        culture: {
            values: ["Innovation", "Simplicity", "Quality", "Privacy"],
            interviewStyle: "Technical",
            difficulty: "Hard"
        },
        techStack: ["Swift", "Objective-C", "iOS", "macOS", "Xcode", "Core Data"],
        interviewProcess: {
            rounds: 6,
            duration: "4-6 weeks",
            focus: ["iOS Development", "System Design", "Behavioral", "Coding"]
        },
        questionCategories: [
            { category: "iOS Development", weight: 1.6 },
            { category: "System Design", weight: 1.3 },
            { category: "Behavioral", weight: 1.0 },
            { category: "Coding", weight: 1.4 }
        ]
    },
    {
        name: "Netflix",
        logo: "https://logo.clearbit.com/netflix.com",
        industry: "Entertainment & Technology",
        size: "Enterprise",
        location: "Los Gatos, CA",
        culture: {
            values: ["Freedom and Responsibility", "Context not Control", "Highly Aligned Loosely Coupled"],
            interviewStyle: "Technical",
            difficulty: "Extreme"
        },
        techStack: ["Java", "Python", "React", "Node.js", "AWS", "Microservices"],
        interviewProcess: {
            rounds: 3,
            duration: "1-2 weeks",
            focus: ["System Design", "Coding", "Culture Fit"]
        },
        questionCategories: [
            { category: "System Design", weight: 1.8 },
            { category: "Coding", weight: 1.5 },
            { category: "Culture Fit", weight: 1.2 }
        ]
    },
    {
        name: "Uber",
        logo: "https://logo.clearbit.com/uber.com",
        industry: "Transportation & Technology",
        size: "Enterprise",
        location: "San Francisco, CA",
        culture: {
            values: ["Make Magic", "Be an Owner", "Go Get It", "Let Builders Build"],
            interviewStyle: "Technical",
            difficulty: "Hard"
        },
        techStack: ["Python", "Go", "React", "Node.js", "PostgreSQL", "Redis"],
        interviewProcess: {
            rounds: 4,
            duration: "2-3 weeks",
            focus: ["Coding", "System Design", "Behavioral", "Product Sense"]
        },
        questionCategories: [
            { category: "Coding", weight: 1.4 },
            { category: "System Design", weight: 1.3 },
            { category: "Behavioral", weight: 1.0 },
            { category: "Product Sense", weight: 1.1 }
        ]
    },
    {
        name: "Airbnb",
        logo: "https://logo.clearbit.com/airbnb.com",
        industry: "Hospitality & Technology",
        size: "Enterprise",
        location: "San Francisco, CA",
        culture: {
            values: ["Champion the Mission", "Be a Host", "Embrace the Adventure", "Be a Cereal Entrepreneur"],
            interviewStyle: "Behavioral",
            difficulty: "Medium"
        },
        techStack: ["React", "Node.js", "Python", "PostgreSQL", "Redis", "AWS"],
        interviewProcess: {
            rounds: 4,
            duration: "2-3 weeks",
            focus: ["Coding", "System Design", "Behavioral", "Product Sense"]
        },
        questionCategories: [
            { category: "Coding", weight: 1.3 },
            { category: "System Design", weight: 1.2 },
            { category: "Behavioral", weight: 1.4 },
            { category: "Product Sense", weight: 1.3 }
        ]
    }
];

const seedCompanies = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing companies
        await Company.deleteMany({});
        console.log('Cleared existing companies');

        // Insert sample companies
        const result = await Company.insertMany(sampleCompanies);
        console.log(`Successfully seeded ${result.length} companies`);

        // Display seeded companies
        result.forEach(company => {
            console.log(`✅ ${company.name} - ${company.industry} (${company.culture.difficulty})`);
        });

        mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding companies:', error);
        process.exit(1);
    }
};

// Run the seeder
seedCompanies();
