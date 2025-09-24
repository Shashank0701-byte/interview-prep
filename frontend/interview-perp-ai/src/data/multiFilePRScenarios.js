// Multi-File Pull Request Scenarios for Advanced Code Review Training
export const MULTI_FILE_PR_SCENARIOS = {
    advanced: [
        {
            id: 'pr-advanced-1',
            title: 'User Authentication Refactor',
            description: 'Refactoring authentication system with new validation layer',
            author: 'Senior Developer',
            prNumber: 'PR #1247',
            difficulty: 'Advanced',
            estimatedTime: '25 minutes',
            tags: ['authentication', 'refactoring', 'security', 'architecture'],
            summary: 'This PR refactors the user authentication system to use a new validation service and updates the API routes accordingly.',
            files: [
                {
                    path: 'api/routes/user.js',
                    status: 'modified',
                    additions: 15,
                    deletions: 8,
                    content: `const express = require('express');
const router = express.Router();
const authService = require('../../services/authService');
const { validateUserInput } = require('../../utils/validation');

// Issue 1: Missing error handling for validation service
router.post('/register', async (req, res) => {
    try {
        // Issue 2: No rate limiting on registration endpoint
        const validationResult = validateUserInput(req.body);
        
        // Issue 3: Not checking validation result properly
        if (validationResult) {
            const user = await authService.createUser(req.body);
            res.status(201).json({ success: true, user });
        }
    } catch (error) {
        // Issue 4: Exposing internal error details
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Issue 5: No input validation on login
        const result = await authService.authenticateUser(email, password);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Authentication failed' });
    }
});

module.exports = router;`,
                    issues: [
                        { line: 7, type: 'error-handling', severity: 'high', description: 'Missing try-catch for validation service calls' },
                        { line: 8, type: 'security', severity: 'high', description: 'No rate limiting on registration endpoint' },
                        { line: 12, type: 'validation', severity: 'high', description: 'Validation result not properly checked - should verify validationResult.isValid' },
                        { line: 17, type: 'security', severity: 'medium', description: 'Exposing internal error details to client' },
                        { line: 24, type: 'validation', severity: 'medium', description: 'Login endpoint missing input validation' }
                    ]
                },
                {
                    path: 'services/authService.js',
                    status: 'modified',
                    additions: 12,
                    deletions: 5,
                    content: `const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logSecurityEvent } = require('../utils/logger');

class AuthService {
    async createUser(userData) {
        // Issue 6: No duplicate email check before creation
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        const user = new User({
            email: userData.email,
            password: hashedPassword,
            name: userData.name,
            // Issue 7: Setting default role without validation
            role: userData.role || 'user'
        });
        
        await user.save();
        
        // Issue 8: Returning sensitive data
        return user;
    }
    
    async authenticateUser(email, password) {
        const user = await User.findOne({ email });
        
        if (!user) {
            // Issue 9: No security logging for failed attempts
            return { success: false, message: 'Invalid credentials' };
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return { success: false, message: 'Invalid credentials' };
        }
        
        // Issue 10: JWT token missing expiration and proper claims
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET
        );
        
        logSecurityEvent('user_login', { userId: user._id, email });
        
        return {
            success: true,
            token,
            // Issue 11: Returning full user object with password hash
            user
        };
    }
}

module.exports = new AuthService();`,
                    issues: [
                        { line: 8, type: 'validation', severity: 'high', description: 'Missing duplicate email check before user creation' },
                        { line: 15, type: 'security', severity: 'medium', description: 'Role assignment without validation - could lead to privilege escalation' },
                        { line: 19, type: 'security', severity: 'high', description: 'Returning full user object including password hash' },
                        { line: 25, type: 'security', severity: 'medium', description: 'No security logging for failed login attempts' },
                        { line: 35, type: 'security', severity: 'high', description: 'JWT token missing expiration time and proper claims structure' },
                        { line: 43, type: 'security', severity: 'high', description: 'Returning user object with sensitive data in authentication response' }
                    ]
                },
                {
                    path: 'utils/validation.js',
                    status: 'new',
                    additions: 45,
                    deletions: 0,
                    content: `const validator = require('validator');

// Issue 12: Validation function returns boolean instead of detailed result
function validateUserInput(userData) {
    const errors = [];
    
    // Email validation
    if (!userData.email) {
        errors.push('Email is required');
    } else if (!validator.isEmail(userData.email)) {
        errors.push('Invalid email format');
    }
    
    // Password validation
    if (!userData.password) {
        errors.push('Password is required');
    } else if (userData.password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    // Issue 13: Missing password complexity validation
    
    // Name validation
    if (!userData.name) {
        errors.push('Name is required');
    } else if (userData.name.length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    // Issue 14: No sanitization of name input
    
    // Issue 15: Function returns boolean but route expects object with isValid property
    return errors.length === 0;
}

// Issue 16: Missing validation for role field
function validateLoginInput(loginData) {
    const errors = [];
    
    if (!loginData.email || !validator.isEmail(loginData.email)) {
        errors.push('Valid email is required');
    }
    
    if (!loginData.password) {
        errors.push('Password is required');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

module.exports = {
    validateUserInput,
    validateLoginInput
};`,
                    issues: [
                        { line: 3, type: 'architecture', severity: 'high', description: 'Validation function returns boolean but route expects object with isValid property' },
                        { line: 16, type: 'security', severity: 'medium', description: 'Missing password complexity validation (uppercase, lowercase, numbers, symbols)' },
                        { line: 24, type: 'security', severity: 'low', description: 'Name input not sanitized - could contain malicious content' },
                        { line: 28, type: 'architecture', severity: 'high', description: 'Inconsistent return format between validateUserInput and validateLoginInput' },
                        { line: 30, type: 'validation', severity: 'medium', description: 'Missing validation for role field in user registration' }
                    ]
                }
            ],
            crossFileIssues: [
                {
                    id: 'cross-1',
                    type: 'architecture',
                    severity: 'critical',
                    description: 'Validation function return format mismatch',
                    affectedFiles: ['api/routes/user.js', 'utils/validation.js'],
                    details: 'The route expects validateUserInput to return an object with isValid property, but it returns a boolean. This will cause the registration to always fail.',
                    lines: { 'api/routes/user.js': 12, 'utils/validation.js': 28 }
                },
                {
                    id: 'cross-2',
                    type: 'security',
                    severity: 'high',
                    description: 'Login endpoint bypasses new validation system',
                    affectedFiles: ['api/routes/user.js', 'utils/validation.js'],
                    details: 'The login endpoint in user.js does not use the new validateLoginInput function from validation.js, creating inconsistent security practices.',
                    lines: { 'api/routes/user.js': 24, 'utils/validation.js': 32 }
                },
                {
                    id: 'cross-3',
                    type: 'data-flow',
                    severity: 'high',
                    description: 'Sensitive data exposure chain',
                    affectedFiles: ['services/authService.js', 'api/routes/user.js'],
                    details: 'AuthService returns full user object with password hash, and the route passes this directly to the client without filtering.',
                    lines: { 'services/authService.js': 19, 'api/routes/user.js': 13 }
                }
            ]
        },
        {
            id: 'pr-advanced-2',
            title: 'E-commerce Order Processing System',
            description: 'New order processing pipeline with inventory management',
            author: 'Tech Lead',
            prNumber: 'PR #1891',
            difficulty: 'Advanced',
            estimatedTime: '30 minutes',
            tags: ['microservices', 'transactions', 'inventory', 'payments'],
            summary: 'Implements new order processing system with real-time inventory updates and payment processing integration.',
            files: [
                {
                    path: 'api/controllers/orderController.js',
                    status: 'new',
                    additions: 67,
                    deletions: 0,
                    content: `const OrderService = require('../services/orderService');
const InventoryService = require('../services/inventoryService');
const PaymentService = require('../services/paymentService');

class OrderController {
    async createOrder(req, res) {
        const { customerId, items, paymentMethod } = req.body;
        
        try {
            // Issue 1: No transaction management for multi-service operations
            
            // Check inventory availability
            for (const item of items) {
                const available = await InventoryService.checkAvailability(item.productId, item.quantity);
                if (!available) {
                    return res.status(400).json({ error: \`Product \${item.productId} not available\` });
                }
            }
            
            // Calculate total
            const total = await OrderService.calculateTotal(items);
            
            // Process payment
            const paymentResult = await PaymentService.processPayment({
                customerId,
                amount: total,
                method: paymentMethod
            });
            
            if (!paymentResult.success) {
                return res.status(400).json({ error: 'Payment failed' });
            }
            
            // Reserve inventory
            // Issue 2: Inventory reservation after payment - wrong order
            for (const item of items) {
                await InventoryService.reserveItem(item.productId, item.quantity);
            }
            
            // Create order
            const order = await OrderService.createOrder({
                customerId,
                items,
                total,
                paymentId: paymentResult.paymentId,
                status: 'confirmed'
            });
            
            res.status(201).json({ success: true, order });
            
        } catch (error) {
            // Issue 3: No rollback mechanism for partial failures
            console.error('Order creation failed:', error);
            res.status(500).json({ error: 'Order processing failed' });
        }
    }
}

module.exports = new OrderController();`,
                    issues: [
                        { line: 9, type: 'concurrency', severity: 'critical', description: 'No database transaction for multi-service operations' },
                        { line: 30, type: 'business-logic', severity: 'high', description: 'Inventory reservation should happen before payment processing' },
                        { line: 45, type: 'reliability', severity: 'high', description: 'No rollback mechanism for partial failures in distributed transaction' }
                    ]
                },
                {
                    path: 'services/inventoryService.js',
                    status: 'modified',
                    additions: 25,
                    deletions: 10,
                    content: `const Inventory = require('../models/Inventory');
const redis = require('../config/redis');

class InventoryService {
    async checkAvailability(productId, quantity) {
        // Issue 4: Race condition in availability check
        const inventory = await Inventory.findOne({ productId });
        
        if (!inventory || inventory.available < quantity) {
            return false;
        }
        
        return true;
    }
    
    async reserveItem(productId, quantity) {
        // Issue 5: No atomic operation for inventory reservation
        const inventory = await Inventory.findOne({ productId });
        
        if (!inventory || inventory.available < quantity) {
            throw new Error('Insufficient inventory');
        }
        
        inventory.available -= quantity;
        inventory.reserved += quantity;
        
        await inventory.save();
        
        // Issue 6: Cache invalidation missing
        return { success: true, reservationId: Date.now() };
    }
    
    async releaseReservation(productId, quantity) {
        const inventory = await Inventory.findOne({ productId });
        
        if (inventory) {
            inventory.available += quantity;
            inventory.reserved -= quantity;
            await inventory.save();
        }
    }
}

module.exports = new InventoryService();`,
                    issues: [
                        { line: 6, type: 'concurrency', severity: 'critical', description: 'Race condition between availability check and reservation' },
                        { line: 15, type: 'concurrency', severity: 'high', description: 'Inventory update not atomic - multiple operations can cause overselling' },
                        { line: 25, type: 'caching', severity: 'medium', description: 'Cache invalidation missing after inventory update' }
                    ]
                },
                {
                    path: 'services/paymentService.js',
                    status: 'new',
                    additions: 40,
                    deletions: 0,
                    content: `const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');

class PaymentService {
    async processPayment({ customerId, amount, method }) {
        try {
            // Issue 7: No idempotency key for payment processing
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100, // Convert to cents
                currency: 'usd',
                customer: customerId,
                payment_method: method,
                confirm: true
            });
            
            // Issue 8: Payment record created before confirmation
            const payment = new Payment({
                customerId,
                amount,
                stripePaymentId: paymentIntent.id,
                status: 'completed',
                createdAt: new Date()
            });
            
            await payment.save();
            
            return {
                success: true,
                paymentId: payment._id,
                stripePaymentId: paymentIntent.id
            };
            
        } catch (error) {
            // Issue 9: No distinction between different payment failure types
            console.error('Payment processing failed:', error);
            return { success: false, error: 'Payment failed' };
        }
    }
    
    async refundPayment(paymentId) {
        const payment = await Payment.findById(paymentId);
        
        if (!payment) {
            throw new Error('Payment not found');
        }
        
        // Issue 10: No validation of refund eligibility
        const refund = await stripe.refunds.create({
            payment_intent: payment.stripePaymentId
        });
        
        payment.status = 'refunded';
        await payment.save();
        
        return { success: true, refundId: refund.id };
    }
}

module.exports = new PaymentService();`,
                    issues: [
                        { line: 7, type: 'reliability', severity: 'high', description: 'Missing idempotency key for payment processing - can cause duplicate charges' },
                        { line: 15, type: 'business-logic', severity: 'medium', description: 'Payment record created before Stripe confirmation - should wait for success' },
                        { line: 28, type: 'error-handling', severity: 'medium', description: 'No distinction between different payment failure types for proper handling' },
                        { line: 40, type: 'business-logic', severity: 'medium', description: 'No validation of refund eligibility (time limits, partial refunds, etc.)' }
                    ]
                }
            ],
            crossFileIssues: [
                {
                    id: 'cross-1',
                    type: 'distributed-transaction',
                    severity: 'critical',
                    description: 'No distributed transaction management',
                    affectedFiles: ['api/controllers/orderController.js', 'services/inventoryService.js', 'services/paymentService.js'],
                    details: 'The order creation process involves multiple services but lacks proper transaction management. If any step fails after payment, money is charged but inventory may not be reserved.',
                    lines: { 'api/controllers/orderController.js': 9, 'services/inventoryService.js': 15, 'services/paymentService.js': 7 }
                },
                {
                    id: 'cross-2',
                    type: 'business-logic',
                    severity: 'high',
                    description: 'Incorrect operation sequence',
                    affectedFiles: ['api/controllers/orderController.js', 'services/inventoryService.js'],
                    details: 'Inventory is reserved after payment processing. This can lead to charging customers for items that become unavailable between payment and reservation.',
                    lines: { 'api/controllers/orderController.js': 30, 'services/inventoryService.js': 15 }
                },
                {
                    id: 'cross-3',
                    type: 'error-recovery',
                    severity: 'critical',
                    description: 'No compensation pattern implementation',
                    affectedFiles: ['api/controllers/orderController.js', 'services/paymentService.js'],
                    details: 'When order creation fails after successful payment, there is no automatic refund mechanism implemented.',
                    lines: { 'api/controllers/orderController.js': 45, 'services/paymentService.js': 35 }
                }
            ]
        }
    ]
};

export const getMultiFilePRById = (id) => {
    const allPRs = [
        ...MULTI_FILE_PR_SCENARIOS.advanced
    ];
    return allPRs.find(pr => pr.id === id);
};

export const getAllMultiFilePRs = () => {
    return [
        ...MULTI_FILE_PR_SCENARIOS.advanced
    ];
};
