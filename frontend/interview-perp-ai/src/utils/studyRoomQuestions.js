// Study Room Question Generator
// Generates 10 coding and code review questions based on room topic using Gemini AI

import { getCachedQuestions } from '../services/geminiQuestionService';

// Generate 10 questions for a given topic using Gemini AI
export async function generateStudyRoomQuestions(topic) {
  try {
    // Clean and normalize the topic
    const cleanTopic = topic.trim().toLowerCase();
    
    console.log(`Generating questions for topic: ${cleanTopic}`);
    
    // Use Gemini API to generate fresh questions
    const questions = await getCachedQuestions(cleanTopic, 10);
    
    console.log(`Generated ${questions.length} questions for ${cleanTopic}`);
    
    return questions;
    
  } catch (error) {
    console.error('Error generating questions:', error);
    
    // Fallback to basic questions if Gemini fails
    return getFallbackQuestions(topic);
  }
}

// Fallback function for when Gemini API fails
function getFallbackQuestions(topic) {
  const topicKey = topic.toLowerCase();
  
  // Create basic fallback questions
  return Array.from({ length: 10 }, (_, i) => ({
    id: `${topicKey}-fallback-${i + 1}`,
    type: i % 2 === 0 ? 'coding' : 'code-review',
    title: `${topic} Challenge ${i + 1}`,
    description: `Practice ${topic} concepts with this interview question.`,
    difficulty: i < 3 ? 'Easy' : i < 7 ? 'Medium' : 'Hard',
    starterCode: `// ${topic} starter code\n// Implement your solution here`,
    solution: `// ${topic} solution\n// Solution implementation`,
    issues: []
  }));
}

// Legacy question bank (kept for reference, not used)
export const STUDY_ROOM_QUESTION_BANK = {
  // JavaScript Questions
  javascript: [
    {
      id: 'js-1',
      type: 'coding',
      title: 'Array Manipulation',
      description: 'Write a function that removes duplicates from an array while preserving the original order.',
      difficulty: 'Easy',
      starterCode: `function removeDuplicates(arr) {
  // Your code here
}

// Test cases
console.log(removeDuplicates([1, 2, 2, 3, 4, 4, 5])); // [1, 2, 3, 4, 5]`,
      solution: `function removeDuplicates(arr) {
  return [...new Set(arr)];
}`
    },
    {
      id: 'js-2',
      type: 'code-review',
      title: 'Async Function Review',
      description: 'Review this async function and identify potential issues.',
      difficulty: 'Medium',
      codeToReview: `async function fetchUserData(userId) {
  const response = fetch('/api/users/' + userId);
  const data = response.json();
  return data.name;
}`,
      issues: [
        { line: 2, type: 'bug', description: 'Missing await keyword before fetch' },
        { line: 3, type: 'bug', description: 'Missing await keyword before response.json()' },
        { line: 4, type: 'error-handling', description: 'No error handling for failed requests' }
      ]
    },
    {
      id: 'js-3',
      type: 'coding',
      title: 'Promise Chain',
      description: 'Convert this callback-based function to use Promises.',
      difficulty: 'Medium',
      starterCode: `function getData(callback) {
  setTimeout(() => {
    callback(null, { id: 1, name: 'John' });
  }, 1000);
}

// Convert to Promise-based function`,
      solution: `function getData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: 1, name: 'John' });
    }, 1000);
  });
}`
    },
    {
      id: 'js-4',
      type: 'code-review',
      title: 'Event Handler Memory Leak',
      description: 'Identify the memory leak in this React component.',
      difficulty: 'Hard',
      codeToReview: `function MyComponent() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
  }, []);
  
  return <div>Count: {count}</div>;
}`,
      issues: [
        { line: 6, type: 'memory-leak', description: 'setInterval is never cleared, causing memory leak' }
      ]
    },
    {
      id: 'js-5',
      type: 'coding',
      title: 'Debounce Function',
      description: 'Implement a debounce function that delays function execution.',
      difficulty: 'Medium',
      starterCode: `function debounce(func, delay) {
  // Your implementation here
}

// Usage example:
const debouncedLog = debounce(() => console.log('Hello'), 300);`,
      solution: `function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}`
    },
    {
      id: 'js-6',
      type: 'coding',
      title: 'Object Deep Clone',
      description: 'Implement a function to deep clone a JavaScript object.',
      difficulty: 'Medium',
      starterCode: `function deepClone(obj) {
  // Your implementation here
}

// Test case
const original = { a: 1, b: { c: 2, d: [3, 4] } };
const cloned = deepClone(original);`,
      solution: `function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
}`
    },
    {
      id: 'js-7',
      type: 'coding',
      title: 'Throttle Function',
      description: 'Implement a throttle function that limits function calls.',
      difficulty: 'Medium',
      starterCode: `function throttle(func, limit) {
  // Your implementation here
}

// Usage example:
const throttledLog = throttle(() => console.log('Throttled!'), 1000);`,
      solution: `function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}`
    },
    {
      id: 'js-8',
      type: 'code-review',
      title: 'Closure Issue',
      description: 'Find the issue with this closure implementation.',
      difficulty: 'Medium',
      codeToReview: `function createCounters() {
  const counters = [];
  for (var i = 0; i < 3; i++) {
    counters.push(function() {
      return i;
    });
  }
  return counters;
}

const counters = createCounters();
console.log(counters[0]()); // Expected: 0, Actual: ?`,
      issues: [
        { line: 3, type: 'bug', description: 'Using var creates function scope, all closures reference same i' },
        { line: 4, type: 'bug', description: 'All functions will return 3 instead of their index' }
      ]
    },
    {
      id: 'js-9',
      type: 'coding',
      title: 'Flatten Array',
      description: 'Implement a function to flatten a nested array.',
      difficulty: 'Easy',
      starterCode: `function flattenArray(arr) {
  // Your implementation here
}

// Test case
console.log(flattenArray([1, [2, 3], [4, [5, 6]]])); // [1, 2, 3, 4, 5, 6]`,
      solution: `function flattenArray(arr) {
  return arr.reduce((flat, item) => {
    return flat.concat(Array.isArray(item) ? flattenArray(item) : item);
  }, []);
}`
    },
    {
      id: 'js-10',
      type: 'coding',
      title: 'Event Emitter',
      description: 'Implement a simple event emitter class.',
      difficulty: 'Hard',
      starterCode: `class EventEmitter {
  constructor() {
    // Your implementation here
  }
  
  on(event, callback) {
    // Your implementation here
  }
  
  emit(event, ...args) {
    // Your implementation here
  }
  
  off(event, callback) {
    // Your implementation here
  }
}`,
      solution: `class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(...args));
    }
  }
  
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}`
    }
  ],

  // React Questions
  react: [
    {
      id: 'react-1',
      type: 'coding',
      title: 'Custom Hook',
      description: 'Create a custom hook for managing local storage state.',
      difficulty: 'Medium',
      starterCode: `function useLocalStorage(key, initialValue) {
  // Your implementation here
}

// Usage: const [name, setName] = useLocalStorage('name', 'John');`,
      solution: `function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });
  
  const setStoredValue = (newValue) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };
  
  return [value, setStoredValue];
}`
    },
    {
      id: 'react-2',
      type: 'code-review',
      title: 'Performance Issue',
      description: 'Find the performance issue in this React component.',
      difficulty: 'Medium',
      codeToReview: `function UserList({ users }) {
  const [filter, setFilter] = useState('');
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  return (
    <div>
      <input value={filter} onChange={e => setFilter(e.target.value)} />
      {filteredUsers.map(user => <div key={user.id}>{user.name}</div>)}
    </div>
  );
}`,
      issues: [
        { line: 4, type: 'performance', description: 'Filter operation runs on every render, should use useMemo' }
      ]
    },
    {
      id: 'react-3',
      type: 'coding',
      title: 'Form Validation',
      description: 'Create a form with validation using React hooks.',
      difficulty: 'Medium',
      starterCode: `function LoginForm() {
  // Implement form with email/password validation
  return (
    <form>
      {/* Your form implementation */}
    </form>
  );
}`,
      solution: `function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  
  const validate = () => {
    const newErrors = {};
    if (!email.includes('@')) newErrors.email = 'Invalid email';
    if (password.length < 6) newErrors.password = 'Password too short';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('Form submitted');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email}</span>}
      <input 
        type="password" 
        value={password} 
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
      />
      {errors.password && <span>{errors.password}</span>}
      <button type="submit">Login</button>
    </form>
  );
}`
    }
  ],

  // Node.js Questions
  nodejs: [
    {
      id: 'node-1',
      type: 'coding',
      title: 'Express Middleware',
      description: 'Create a middleware function for logging HTTP requests.',
      difficulty: 'Easy',
      starterCode: `function requestLogger(req, res, next) {
  // Your middleware implementation
}`,
      solution: `function requestLogger(req, res, next) {
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.url}\`);
  next();
}`
    },
    {
      id: 'node-2',
      type: 'code-review',
      title: 'Security Vulnerability',
      description: 'Identify security issues in this Express route.',
      difficulty: 'Hard',
      codeToReview: `app.get('/user/:id', (req, res) => {
  const query = 'SELECT * FROM users WHERE id = ' + req.params.id;
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results[0]);
  });
});`,
      issues: [
        { line: 2, type: 'security', description: 'SQL injection vulnerability - use parameterized queries' },
        { line: 4, type: 'error-handling', description: 'Throwing errors in production exposes sensitive information' }
      ]
    }
  ],

  // Python Questions
  python: [
    {
      id: 'py-1',
      type: 'coding',
      title: 'List Comprehension',
      description: 'Convert this for loop to a list comprehension.',
      difficulty: 'Easy',
      starterCode: `# Convert this to list comprehension
result = []
for i in range(10):
    if i % 2 == 0:
        result.append(i * 2)`,
      solution: `result = [i * 2 for i in range(10) if i % 2 == 0]`
    },
    {
      id: 'py-2',
      type: 'code-review',
      title: 'Exception Handling',
      description: 'Review this exception handling code.',
      difficulty: 'Medium',
      codeToReview: `def divide_numbers(a, b):
    try:
        result = a / b
        return result
    except:
        return None`,
      issues: [
        { line: 5, type: 'error-handling', description: 'Bare except clause catches all exceptions, should be specific' },
        { line: 6, type: 'error-handling', description: 'Returning None hides the actual error from caller' }
      ]
    }
  ],

  // Data Structures & Algorithms
  dsa: [
    {
      id: 'dsa-1',
      type: 'coding',
      title: 'Two Sum Problem',
      description: 'Given an array of integers and a target sum, return indices of two numbers that add up to the target.',
      difficulty: 'Easy',
      starterCode: `function twoSum(nums, target) {
  // Your code here
  // Return array of indices [i, j] where nums[i] + nums[j] = target
}

// Test case
console.log(twoSum([2, 7, 11, 15], 9)); // Expected: [0, 1]`,
      solution: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`
    },
    {
      id: 'dsa-2',
      type: 'coding',
      title: 'Valid Parentheses',
      description: 'Given a string containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
      difficulty: 'Easy',
      starterCode: `function isValid(s) {
  // Your code here
  // Return true if parentheses are valid, false otherwise
}

// Test cases
console.log(isValid("()")); // true
console.log(isValid("()[]{}")); // true
console.log(isValid("(]")); // false`,
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
      id: 'dsa-3',
      type: 'coding',
      title: 'Merge Two Sorted Lists',
      description: 'Merge two sorted linked lists and return it as a sorted list.',
      difficulty: 'Easy',
      starterCode: `class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function mergeTwoLists(list1, list2) {
  // Your code here
}`,
      solution: `function mergeTwoLists(list1, list2) {
  const dummy = new ListNode(0);
  let current = dummy;
  
  while (list1 && list2) {
    if (list1.val <= list2.val) {
      current.next = list1;
      list1 = list1.next;
    } else {
      current.next = list2;
      list2 = list2.next;
    }
    current = current.next;
  }
  
  current.next = list1 || list2;
  return dummy.next;
}`
    },
    {
      id: 'dsa-4',
      type: 'coding',
      title: 'Maximum Subarray',
      description: 'Find the contiguous subarray with the largest sum and return its sum.',
      difficulty: 'Medium',
      starterCode: `function maxSubArray(nums) {
  // Your code here - implement Kadane's algorithm
}

// Test case
console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4])); // Expected: 6`,
      solution: `function maxSubArray(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  
  return maxSum;
}`
    },
    {
      id: 'dsa-5',
      type: 'coding',
      title: 'Binary Tree Inorder Traversal',
      description: 'Given the root of a binary tree, return the inorder traversal of its nodes values.',
      difficulty: 'Medium',
      starterCode: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function inorderTraversal(root) {
  // Your code here
}`,
      solution: `function inorderTraversal(root) {
  const result = [];
  
  function inorder(node) {
    if (node) {
      inorder(node.left);
      result.push(node.val);
      inorder(node.right);
    }
  }
  
  inorder(root);
  return result;
}`
    },
    {
      id: 'dsa-6',
      type: 'coding',
      title: 'Level Order Traversal',
      description: 'Given the root of a binary tree, return the level order traversal of its nodes values.',
      difficulty: 'Medium',
      starterCode: `function levelOrder(root) {
  // Your code here - use BFS approach
}`,
      solution: `function levelOrder(root) {
  if (!root) return [];
  
  const result = [];
  const queue = [root];
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel = [];
    
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    result.push(currentLevel);
  }
  
  return result;
}`
    },
    {
      id: 'dsa-7',
      type: 'coding',
      title: 'Longest Palindromic Substring',
      description: 'Given a string s, return the longest palindromic substring in s.',
      difficulty: 'Medium',
      starterCode: `function longestPalindrome(s) {
  // Your code here
}

// Test case
console.log(longestPalindrome("babad")); // Expected: "bab" or "aba"`,
      solution: `function longestPalindrome(s) {
  if (!s || s.length < 2) return s;
  
  let start = 0, maxLen = 1;
  
  function expandAroundCenter(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      const currentLen = right - left + 1;
      if (currentLen > maxLen) {
        start = left;
        maxLen = currentLen;
      }
      left--;
      right++;
    }
  }
  
  for (let i = 0; i < s.length; i++) {
    expandAroundCenter(i, i); // odd length
    expandAroundCenter(i, i + 1); // even length
  }
  
  return s.substring(start, start + maxLen);
}`
    },
    {
      id: 'dsa-8',
      type: 'code-review',
      title: 'Binary Search Implementation Review',
      description: 'Review this binary search implementation and identify potential issues.',
      difficulty: 'Medium',
      codeToReview: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length;
  
  while (left < right) {
    let mid = (left + right) / 2;
    if (arr[mid] == target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid;
    } else {
      right = mid;
    }
  }
  return -1;
}`,
      issues: [
        { line: 2, type: 'bug', description: 'right should be arr.length - 1, not arr.length' },
        { line: 5, type: 'bug', description: 'mid should use Math.floor() to avoid floating point' },
        { line: 6, type: 'style', description: 'Use === instead of == for strict equality' },
        { line: 9, type: 'bug', description: 'left should be mid + 1 to avoid infinite loop' }
      ]
    },
    {
      id: 'dsa-9',
      type: 'coding',
      title: 'Climbing Stairs',
      description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?',
      difficulty: 'Easy',
      starterCode: `function climbStairs(n) {
  // Your code here - think dynamic programming
}

// Test cases
console.log(climbStairs(2)); // Expected: 2
console.log(climbStairs(3)); // Expected: 3`,
      solution: `function climbStairs(n) {
  if (n <= 2) return n;
  
  let prev2 = 1, prev1 = 2;
  
  for (let i = 3; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  
  return prev1;
}`
    },
    {
      id: 'dsa-10',
      type: 'coding',
      title: 'Rotate Array',
      description: 'Given an array, rotate the array to the right by k steps, where k is non-negative.',
      difficulty: 'Medium',
      starterCode: `function rotate(nums, k) {
  // Your code here - modify nums in-place
}

// Test case
let arr = [1,2,3,4,5,6,7];
rotate(arr, 3);
console.log(arr); // Expected: [5,6,7,1,2,3,4]`,
      solution: `function rotate(nums, k) {
  k = k % nums.length;
  
  function reverse(start, end) {
    while (start < end) {
      [nums[start], nums[end]] = [nums[end], nums[start]];
      start++;
      end--;
    }
  }
  
  reverse(0, nums.length - 1);
  reverse(0, k - 1);
  reverse(k, nums.length - 1);
}`
    }
  ],
  algorithms: [
    {
      id: 'algo-1',
      type: 'coding',
      title: 'Binary Search',
      description: 'Implement binary search algorithm.',
      difficulty: 'Medium',
      starterCode: `function binarySearch(arr, target) {
  // Your implementation here
}`,
      solution: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1;
}`
    },
    {
      id: 'algo-2',
      type: 'coding',
      title: 'Linked List Reversal',
      description: 'Reverse a singly linked list.',
      difficulty: 'Medium',
      starterCode: `class ListNode {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

function reverseList(head) {
  // Your implementation here
}`,
      solution: `function reverseList(head) {
  let prev = null;
  let current = head;
  
  while (current) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }
  
  return prev;
}`
    }
  ]
};
