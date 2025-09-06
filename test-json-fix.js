/**
 * Test script to verify that JSON parsing fixes are working
 */

import { extractJSON } from './src/lib/jsonExtractor.js';

console.log('Testing JSON extraction fixes...\n');

// Test 1: Response with descriptive text before JSON
const response1 = `Here is the JSON response with company data:

{
  "name": "TechCorp",
  "industry": "Technology",
  "size": "large",
  "techStack": ["React", "Node.js", "MongoDB"],
  "difficulty": "medium",
  "focusAreas": ["Problem Solving", "System Design"],
  "preparationTips": ["Practice coding", "Study system design"]
}`;

// Test 2: Response with markdown code blocks
const response2 = `Here are the interview questions:

\`\`\`json
[
  {
    "id": "q1",
    "question": "What is React?",
    "expectedAnswer": "React is a JavaScript library...",
    "difficulty": "easy"
  }
]
\`\`\``;

// Test 3: Response with mixed content
const response3 = `The system generated the following DSA problems for your interview:

Here are 3 challenging problems:

[
  {
    "id": "dsa1",
    "title": "Two Sum Problem",
    "difficulty": "medium",
    "description": "Find two numbers that add up to target"
  },
  {
    "id": "dsa2", 
    "title": "Valid Parentheses",
    "difficulty": "easy",
    "description": "Check if string has valid parentheses"
  }
]

These problems are suitable for your level.`;

try {
  console.log('=== Test 1: Company data extraction ===');
  const result1 = extractJSON(response1);
  console.log('✅ SUCCESS:', JSON.stringify(result1, null, 2));
  
  console.log('\n=== Test 2: Interview questions extraction ===');
  const result2 = extractJSON(response2);
  console.log('✅ SUCCESS:', JSON.stringify(result2, null, 2));
  
  console.log('\n=== Test 3: DSA problems extraction ===');
  const result3 = extractJSON(response3);
  console.log('✅ SUCCESS:', JSON.stringify(result3, null, 2));
  
  console.log('\n🎉 All JSON extraction tests passed! The fixes are working correctly.');
  
} catch (error) {
  console.error('❌ ERROR:', error.message);
  process.exit(1);
}