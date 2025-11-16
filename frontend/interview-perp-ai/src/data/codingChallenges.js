export const codingChallenges = [
    {
        id: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        category: 'arrays',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        expectedComplexity: 'n',
        starterCode: `function twoSum(nums, target) {
    // Write your solution here
    // Return an array of two indices
    
}`,
        testCases: [
            { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
            { input: [[3, 2, 4], 6], expected: [1, 2] },
            { input: [[3, 3], 6], expected: [0, 1] }
        ],
        hints: [
            'Think about what you need to find for each number',
            'Can you use a hash map to store numbers you\'ve seen?',
            'For each number, check if target - number exists in your hash map'
        ],
        solution: `function twoSum(nums, target) {
    const numMap = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (numMap.has(complement)) {
            return [numMap.get(complement), i];
        }
        
        numMap.set(nums[i], i);
    }
    
    return [];
}`
    },
    {
        id: 'reverse-string',
        title: 'Reverse String',
        difficulty: 'Easy',
        category: 'strings',
        description: 'Write a function that reverses a string. The input string is given as an array of characters s.',
        expectedComplexity: 'n',
        starterCode: `function reverseString(s) {
    // Modify s in-place
    // Do not return anything
    
}`,
        testCases: [
            { input: [['h','e','l','l','o']], expected: ['o','l','l','e','h'] },
            { input: [['H','a','n','n','a','h']], expected: ['h','a','n','n','a','H'] }
        ],
        hints: [
            'You can use two pointers approach',
            'Start from both ends and swap characters',
            'Move pointers towards each other until they meet'
        ],
        solution: `function reverseString(s) {
    let left = 0;
    let right = s.length - 1;
    
    while (left < right) {
        [s[left], s[right]] = [s[right], s[left]];
        left++;
        right--;
    }
}`
    },
    {
        id: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        category: 'stacks',
        description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
        expectedComplexity: 'n',
        starterCode: `function isValid(s) {
    // Return true if string has valid parentheses
    // Return false otherwise
    
}`,
        testCases: [
            { input: ['()'], expected: true },
            { input: ['()[]{}'], expected: true },
            { input: ['(]'], expected: false },
            { input: ['([)]'], expected: false }
        ],
        hints: [
            'Think about using a stack data structure',
            'Push opening brackets onto the stack',
            'When you see a closing bracket, check if it matches the most recent opening bracket'
        ],
        solution: `function isValid(s) {
    const stack = [];
    const pairs = { ')': '(', '}': '{', ']': '[' };
    
    for (let char of s) {
        if (char === '(' || char === '{' || char === '[') {
            stack.push(char);
        } else {
            if (stack.length === 0 || stack.pop() !== pairs[char]) {
                return false;
            }
        }
    }
    
    return stack.length === 0;
}`
    },
    {
        id: 'maximum-subarray',
        title: 'Maximum Subarray',
        difficulty: 'Medium',
        category: 'dynamic-programming',
        description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
        expectedComplexity: 'n',
        starterCode: `function maxSubArray(nums) {
    // Return the maximum sum of contiguous subarray
    
}`,
        testCases: [
            { input: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6 },
            { input: [[1]], expected: 1 },
            { input: [[5,4,-1,7,8]], expected: 23 }
        ],
        hints: [
            'This is a classic dynamic programming problem',
            'Think about Kadane\'s algorithm',
            'At each position, decide whether to extend the previous subarray or start a new one'
        ],
        solution: `function maxSubArray(nums) {
    let maxSoFar = nums[0];
    let maxEndingHere = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    
    return maxSoFar;
}`
    },
    {
        id: 'merge-intervals',
        title: 'Merge Intervals',
        difficulty: 'Medium',
        category: 'arrays',
        description: 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.',
        expectedComplexity: 'n log n',
        starterCode: `function merge(intervals) {
    // Return array of merged intervals
    
}`,
        testCases: [
            { input: [[[1,3],[2,6],[8,10],[15,18]]], expected: [[1,6],[8,10],[15,18]] },
            { input: [[[1,4],[4,5]]], expected: [[1,5]] }
        ],
        hints: [
            'First, sort the intervals by their start time',
            'Then iterate through and merge overlapping intervals',
            'Two intervals overlap if the start of one is <= end of the other'
        ],
        solution: `function merge(intervals) {
    if (intervals.length <= 1) return intervals;
    
    intervals.sort((a, b) => a[0] - b[0]);
    const result = [intervals[0]];
    
    for (let i = 1; i < intervals.length; i++) {
        const current = intervals[i];
        const last = result[result.length - 1];
        
        if (current[0] <= last[1]) {
            last[1] = Math.max(last[1], current[1]);
        } else {
            result.push(current);
        }
    }
    
    return result;
}`
    },
    {
        id: 'binary-tree-traversal',
        title: 'Binary Tree Inorder Traversal',
        difficulty: 'Easy',
        category: 'trees',
        description: 'Given the root of a binary tree, return the inorder traversal of its nodes\' values.',
        expectedComplexity: 'n',
        starterCode: `function inorderTraversal(root) {
    // Return array of node values in inorder
    // TreeNode structure: { val, left, right }
    
}`,
        testCases: [
            { input: [{ val: 1, left: null, right: { val: 2, left: { val: 3, left: null, right: null }, right: null } }], expected: [1, 3, 2] },
            { input: [null], expected: [] },
            { input: [{ val: 1, left: null, right: null }], expected: [1] }
        ],
        hints: [
            'Inorder traversal visits: left subtree, root, right subtree',
            'You can solve this recursively or iteratively',
            'For iterative solution, use a stack to simulate recursion'
        ],
        solution: `function inorderTraversal(root) {
    const result = [];
    
    function inorder(node) {
        if (node === null) return;
        
        inorder(node.left);
        result.push(node.val);
        inorder(node.right);
    }
    
    inorder(root);
    return result;
}`
    },
    {
        id: 'longest-substring',
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        category: 'strings',
        description: 'Given a string s, find the length of the longest substring without repeating characters.',
        expectedComplexity: 'n',
        starterCode: `function lengthOfLongestSubstring(s) {
    // Return length of longest substring without repeating characters
    
}`,
        testCases: [
            { input: ['abcabcbb'], expected: 3 },
            { input: ['bbbbb'], expected: 1 },
            { input: ['pwwkew'], expected: 3 },
            { input: [''], expected: 0 }
        ],
        hints: [
            'Use sliding window technique',
            'Keep track of characters you\'ve seen with their positions',
            'When you find a repeat, move the start of your window'
        ],
        solution: `function lengthOfLongestSubstring(s) {
    const charMap = new Map();
    let left = 0;
    let maxLength = 0;
    
    for (let right = 0; right < s.length; right++) {
        if (charMap.has(s[right])) {
            left = Math.max(left, charMap.get(s[right]) + 1);
        }
        
        charMap.set(s[right], right);
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}`
    },
    {
        id: 'design-lru-cache',
        title: 'LRU Cache',
        difficulty: 'Hard',
        category: 'design',
        description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
        expectedComplexity: '1',
        starterCode: `class LRUCache {
    constructor(capacity) {
        // Initialize your data structure here
        
    }
    
    get(key) {
        // Return the value of the key if it exists, otherwise return -1
        
    }
    
    put(key, value) {
        // Update the value of the key if it exists
        // Otherwise, add the key-value pair to the cache
        // If the cache exceeds capacity, remove the least recently used item
        
    }
}`,
        testCases: [
            { 
                input: [['LRUCache', 'put', 'put', 'get', 'put', 'get', 'put', 'get', 'get', 'get'], [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]], 
                expected: [null, null, null, 1, null, -1, null, -1, 3, 4] 
            }
        ],
        hints: [
            'You need O(1) time complexity for both get and put operations',
            'Consider using a combination of HashMap and Doubly Linked List',
            'HashMap gives O(1) access, Doubly Linked List allows O(1) insertion/deletion'
        ],
        solution: `class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
    }
    
    get(key) {
        if (this.cache.has(key)) {
            const value = this.cache.get(key);
            this.cache.delete(key);
            this.cache.set(key, value);
            return value;
        }
        return -1;
    }
    
    put(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.capacity) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
}`
    }
];

// Helper function to get challenges by difficulty
export const getChallengesByDifficulty = (difficulty) => {
    return codingChallenges.filter(challenge => challenge.difficulty === difficulty);
};

// Helper function to get challenges by category
export const getChallengesByCategory = (category) => {
    return codingChallenges.filter(challenge => challenge.category === category);
};

// Helper function to get random challenge
export const getRandomChallenge = () => {
    return codingChallenges[Math.floor(Math.random() * codingChallenges.length)];
};
