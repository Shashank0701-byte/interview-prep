const mongoose = require("mongoose");
const Company = require("../models/Company");
const CompanyQuestion = require("../models/CompanyQuestion");

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
const getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find({})
            .select('name logo industry size location culture.interviewStyle culture.difficulty')
            .sort({ name: 1 });
        
        res.status(200).json({
            success: true,
            data: companies
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// @desc    Get company by ID with detailed info
// @route   GET /api/companies/:id
// @access  Public
const getCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        
        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: company
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// @desc    Get questions by company
// @route   GET /api/companies/:id/questions
// @access  Public
const getCompanyQuestions = async (req, res) => {
    try {
        const { role, experience, category, difficulty } = req.query;
        const companyId = req.params.id;
        
        let query = { company: companyId };
        
        if (role) query.role = role;
        if (experience) query.experience = experience;
        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;
        
        const questions = await CompanyQuestion.find(query)
            .sort({ verifiedAt: -1, upvotes: -1, createdAt: -1 })
            .limit(50);
        
        res.status(200).json({
            success: true,
            data: questions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// @desc    Add community question for a company
// @route   POST /api/companies/:id/questions
// @access  Private
const addCompanyQuestion = async (req, res) => {
    try {
        const { question, answer, category, difficulty, role, experience, tags } = req.body;
        const companyId = req.params.id;
        const userId = req.user._id;
        
        // Verify company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }
        
        const newQuestion = await CompanyQuestion.create({
            company: companyId,
            question,
            answer,
            category,
            difficulty,
            role,
            experience,
            tags: tags || [],
            source: 'Community'
        });
        
        // Update company question count
        company.communityQuestions += 1;
        await company.save();
        
        res.status(201).json({
            success: true,
            data: newQuestion
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// @desc    Search companies
// @route   GET /api/companies/search
// @access  Public
const searchCompanies = async (req, res) => {
    try {
        const { q, industry, size, location } = req.query;
        
        let query = {};
        
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { industry: { $regex: q, $options: 'i' } }
            ];
        }
        
        if (industry) query.industry = industry;
        if (size) query.size = size;
        if (location) query.location = location;
        
        const companies = await Company.find(query)
            .select('name logo industry size location culture.interviewStyle culture.difficulty')
            .sort({ name: 1 });
        
        res.status(200).json({
            success: true,
            data: companies
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// @desc    Get company statistics
// @route   GET /api/companies/:id/stats
// @access  Public
const getCompanyStats = async (req, res) => {
    try {
        const companyId = req.params.id;
        
        const stats = await CompanyQuestion.aggregate([
            { $match: { company: mongoose.Types.ObjectId(companyId) } },
            {
                $group: {
                    _id: null,
                    totalQuestions: { $sum: 1 },
                    verifiedQuestions: { $sum: { $cond: [{ $eq: ['$source', 'Verified'] }, 1, 0] } },
                    communityQuestions: { $sum: { $cond: [{ $eq: ['$source', 'Community'] }, 1, 0] } },
                    aiQuestions: { $sum: { $cond: [{ $eq: ['$source', 'AI Generated'] }, 1, 0] } },
                    avgDifficulty: { $avg: { $cond: [{ $eq: ['$difficulty', 'Easy'] }, 1, { $cond: [{ $eq: ['$difficulty', 'Medium'] }, 2, 3] }] } }
                }
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: stats[0] || {
                totalQuestions: 0,
                verifiedQuestions: 0,
                communityQuestions: 0,
                aiQuestions: 0,
                avgDifficulty: 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

module.exports = {
    getAllCompanies,
    getCompanyById,
    getCompanyQuestions,
    addCompanyQuestion,
    searchCompanies,
    getCompanyStats
};
