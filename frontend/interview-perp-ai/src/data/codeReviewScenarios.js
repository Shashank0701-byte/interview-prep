// Code Review Scenarios Database
export const CODE_REVIEW_SCENARIOS = {
    beginner: [
        {
            id: 'beginner-1',
            title: 'User Registration API',
            description: 'Basic user registration with validation issues',
            author: 'Junior Developer',
            language: 'javascript',
            difficulty: 'Beginner',
            estimatedTime: '10 minutes',
            tags: ['validation', 'security', 'error-handling'],
            codeBlocks: [
                {
                    filename: 'userController.js',
                    code: `const bcrypt = require('bcrypt');
const User = require('../models/User');

// User registration endpoint
const registerUser = async (req, res) => {
    const { email, password, name } = req.body;
    
    // Issue 1: No input validation
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }
    
    // Issue 2: Weak password requirements
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password too short' });
    }
    
    // Issue 3: Low salt rounds
    const hashedPassword = await bcrypt.hash(password, 8);
    
    const newUser = new User({
        email: email,
        password: hashedPassword,
        name: name
    });
    
    try {
        await newUser.save();
        // Issue 4: Returning sensitive data
        res.status(201).json({ 
            message: 'User created successfully',
            user: newUser
        });
    } catch (error) {
        // Issue 5: Exposing internal errors
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser };`,
                    issues: [
                        { line: 6, type: 'validation', severity: 'high', description: 'Missing input validation for email, password, and name' },
                        { line: 13, type: 'security', severity: 'medium', description: 'Password requirements too weak (should be 8+ chars with complexity)' },
                        { line: 17, type: 'security', severity: 'medium', description: 'Salt rounds too low, should be 12+' },
                        { line: 26, type: 'security', severity: 'high', description: 'Returning sensitive user data including password hash' },
                        { line: 30, type: 'security', severity: 'medium', description: 'Exposing internal error details to client' }
                    ]
                }
            ]
        },
        {
            id: 'beginner-2',
            title: 'Todo List Component',
            description: 'React component with state management issues',
            author: 'Frontend Intern',
            language: 'javascript',
            difficulty: 'Beginner',
            estimatedTime: '8 minutes',
            tags: ['react', 'state', 'performance'],
            codeBlocks: [
                {
                    filename: 'TodoList.jsx',
                    code: `import React, { useState } from 'react';

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [inputValue, setInputValue] = useState('');
    
    // Issue 1: Missing key prop and inefficient rendering
    const addTodo = () => {
        if (inputValue) {
            setTodos([...todos, { 
                id: Math.random(), // Issue 2: Unreliable ID generation
                text: inputValue,
                completed: false 
            }]);
            setInputValue('');
        }
    };
    
    // Issue 3: Mutating state directly
    const toggleTodo = (id) => {
        const todo = todos.find(t => t.id === id);
        todo.completed = !todo.completed;
        setTodos([...todos]);
    };
    
    // Issue 4: No error handling for empty todos
    const deleteTodo = (id) => {
        setTodos(todos.filter(t => t.id !== id));
    };
    
    return (
        <div>
            <input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                // Issue 5: Missing accessibility attributes
            />
            <button onClick={addTodo}>Add Todo</button>
            
            <ul>
                {todos.map(todo => (
                    // Issue 6: Missing key prop
                    <li>
                        <span 
                            style={{ 
                                textDecoration: todo.completed ? 'line-through' : 'none' 
                            }}
                            onClick={() => toggleTodo(todo.id)}
                        >
                            {todo.text}
                        </span>
                        <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TodoList;`,
                    issues: [
                        { line: 9, type: 'bug', severity: 'medium', description: 'Math.random() can create duplicate IDs, use uuid or timestamp' },
                        { line: 19, type: 'bug', severity: 'high', description: 'Directly mutating state object instead of creating new object' },
                        { line: 32, type: 'accessibility', severity: 'medium', description: 'Missing aria-label, placeholder, and other accessibility attributes' },
                        { line: 37, type: 'bug', severity: 'high', description: 'Missing key prop in map function will cause React warnings and performance issues' },
                        { line: 25, type: 'validation', severity: 'low', description: 'No validation for empty todo deletion' }
                    ]
                }
            ]
        }
    ],
    intermediate: [
        {
            id: 'intermediate-1',
            title: 'E-commerce Cart Service',
            description: 'Shopping cart with concurrency and performance issues',
            author: 'Mid-level Developer',
            language: 'javascript',
            difficulty: 'Intermediate',
            estimatedTime: '15 minutes',
            tags: ['concurrency', 'performance', 'business-logic'],
            codeBlocks: [
                {
                    filename: 'cartService.js',
                    code: `const Cart = require('../models/Cart');
const Product = require('../models/Product');

class CartService {
    // Issue 1: No transaction handling for concurrent operations
    async addToCart(userId, productId, quantity) {
        const cart = await Cart.findOne({ userId });
        const product = await Product.findById(productId);
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        // Issue 2: Race condition - stock check and update not atomic
        if (product.stock < quantity) {
            throw new Error('Insufficient stock');
        }
        
        // Issue 3: N+1 query problem
        const existingItem = cart.items.find(item => 
            item.productId.toString() === productId
        );
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ productId, quantity, price: product.price });
        }
        
        // Issue 4: Stock update without proper locking
        product.stock -= quantity;
        await product.save();
        
        await cart.save();
        return cart;
    }
    
    // Issue 5: Inefficient calculation method
    async calculateTotal(cartId) {
        const cart = await Cart.findById(cartId).populate('items.productId');
        let total = 0;
        
        // Issue 6: Synchronous loop with potential async operations
        cart.items.forEach(item => {
            total += item.quantity * item.productId.price;
        });
        
        // Issue 7: No discount or tax calculation
        return total;
    }
    
    // Issue 8: Memory leak potential with large datasets
    async getCartHistory(userId) {
        const allCarts = await Cart.find({ userId }).populate('items.productId');
        return allCarts; // Returns potentially massive dataset
    }
}

module.exports = CartService;`,
                    issues: [
                        { line: 6, type: 'concurrency', severity: 'high', description: 'No database transaction for cart operations, can lead to data inconsistency' },
                        { line: 13, type: 'concurrency', severity: 'high', description: 'Race condition between stock check and update - multiple users can oversell' },
                        { line: 18, type: 'performance', severity: 'medium', description: 'N+1 query problem - should use aggregation or better query structure' },
                        { line: 28, type: 'concurrency', severity: 'high', description: 'Stock update without proper locking mechanism' },
                        { line: 36, type: 'performance', severity: 'medium', description: 'Inefficient total calculation, should be done in database' },
                        { line: 40, type: 'bug', severity: 'low', description: 'forEach with async operations - should use for...of or Promise.all' },
                        { line: 49, type: 'performance', severity: 'high', description: 'Potential memory leak - no pagination for large cart history' }
                    ]
                }
            ]
        }
    ],
    advanced: [
        {
            id: 'advanced-1',
            title: 'Microservice Communication',
            description: 'Distributed system with resilience and monitoring issues',
            author: 'Senior Developer',
            language: 'javascript',
            difficulty: 'Advanced',
            estimatedTime: '20 minutes',
            tags: ['microservices', 'resilience', 'monitoring'],
            codeBlocks: [
                {
                    filename: 'orderService.js',
                    code: `const axios = require('axios');
const EventEmitter = require('events');

class OrderService extends EventEmitter {
    constructor() {
        super();
        this.paymentServiceUrl = process.env.PAYMENT_SERVICE_URL;
        this.inventoryServiceUrl = process.env.INVENTORY_SERVICE_URL;
    }
    
    // Issue 1: No circuit breaker pattern
    async processOrder(orderData) {
        try {
            // Issue 2: No timeout configuration
            const inventoryResponse = await axios.post(
                \`\${this.inventoryServiceUrl}/reserve\`,
                { items: orderData.items }
            );
            
            if (!inventoryResponse.data.success) {
                throw new Error('Inventory reservation failed');
            }
            
            // Issue 3: No compensation pattern for failures
            const paymentResponse = await axios.post(
                \`\${this.paymentServiceUrl}/charge\`,
                { 
                    amount: orderData.total,
                    customerId: orderData.customerId 
                }
            );
            
            if (!paymentResponse.data.success) {
                // Issue 4: No rollback of inventory reservation
                throw new Error('Payment failed');
            }
            
            // Issue 5: No distributed tracing
            this.emit('orderProcessed', orderData);
            
            return { success: true, orderId: orderData.id };
            
        } catch (error) {
            // Issue 6: Poor error handling and logging
            console.log('Order processing failed:', error.message);
            throw error;
        }
    }
    
    // Issue 7: No retry mechanism with exponential backoff
    async notifyShipping(orderData) {
        const response = await axios.post(
            'http://shipping-service/notify',
            orderData
        );
        return response.data;
    }
    
    // Issue 8: No health check implementation
    async getServiceHealth() {
        return { status: 'ok' };
    }
}

module.exports = OrderService;`,
                    issues: [
                        { line: 12, type: 'resilience', severity: 'high', description: 'Missing circuit breaker pattern for external service calls' },
                        { line: 15, type: 'resilience', severity: 'high', description: 'No timeout configuration - can cause hanging requests' },
                        { line: 23, type: 'architecture', severity: 'high', description: 'Missing saga pattern or compensation for distributed transaction' },
                        { line: 32, type: 'consistency', severity: 'high', description: 'No rollback mechanism for inventory reservation on payment failure' },
                        { line: 36, type: 'observability', severity: 'medium', description: 'Missing distributed tracing and correlation IDs' },
                        { line: 42, type: 'observability', severity: 'medium', description: 'Poor error logging - should include context and structured logging' },
                        { line: 48, type: 'resilience', severity: 'medium', description: 'No retry mechanism with exponential backoff for transient failures' },
                        { line: 55, type: 'monitoring', severity: 'low', description: 'Health check too simplistic - should check dependencies' }
                    ]
                }
            ]
        }
    ]
};

export const getScenariosByDifficulty = (difficulty) => {
    return CODE_REVIEW_SCENARIOS[difficulty] || [];
};

export const getScenarioById = (id) => {
    const allScenarios = [
        ...CODE_REVIEW_SCENARIOS.beginner,
        ...CODE_REVIEW_SCENARIOS.intermediate,
        ...CODE_REVIEW_SCENARIOS.advanced
    ];
    return allScenarios.find(scenario => scenario.id === id);
};

export const getAllScenarios = () => {
    return [
        ...CODE_REVIEW_SCENARIOS.beginner,
        ...CODE_REVIEW_SCENARIOS.intermediate,
        ...CODE_REVIEW_SCENARIOS.advanced
    ];
};
