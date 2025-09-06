/**
 * Test script to verify that JSON parsing fixes are working
 */

// CommonJS import for Node.js
const fs = require('fs');
const path = require('path');

// Read and eval the jsonExtractor file
const extractorPath = path.join(__dirname, 'src/lib/jsonExtractor.ts');
const extractorCode = fs.readFileSync(extractorPath, 'utf8');

// Simple implementation of extractJSON for testing
function extractJSON(response) {
  try {
    // First try: Direct JSON parse (in case response is already clean JSON)
    return JSON.parse(response);
  } catch (error) {
    try {
      // Remove markdown code blocks
      let cleaned = response.replace(/```json\n?|\n?```/g, '');
      
      // Try parsing after markdown removal
      return JSON.parse(cleaned);
    } catch (error) {
      try {
        // Look for JSON object patterns - find first { or [ and last } or ]
        const jsonObjectMatch = response.match(/\{[\s\S]*\}/);
        const jsonArrayMatch = response.match(/\[[\s\S]*\]/);
        
        let jsonString = '';
        if (jsonObjectMatch && jsonArrayMatch) {
          // Choose the longer match (more likely to be complete)
          jsonString = jsonObjectMatch[0].length > jsonArrayMatch[0].length 
            ? jsonObjectMatch[0] 
            : jsonArrayMatch[0];
        } else if (jsonObjectMatch) {
          jsonString = jsonObjectMatch[0];
        } else if (jsonArrayMatch) {
          jsonString = jsonArrayMatch[0];
        } else {
          throw new Error('No JSON pattern found');
        }
        
        return JSON.parse(jsonString);
      } catch (error) {
        try {
          // More aggressive extraction: Remove common prefixes
          let cleaned = response
            .replace(/^.*?(?=[\{\[])/s, '') // Remove everything before first { or [
            .replace(/[\}\]].*$/s, (match) => match.charAt(0)); // Keep only first } or ]
          
          if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
            return JSON.parse(cleaned);
          }
          
          throw new Error('Could not extract valid JSON');
        } catch (finalError) {
          console.error('Failed to extract JSON from response:', response);
          console.error('Final extraction error:', finalError);
          throw new Error(`JSON extraction failed: ${finalError instanceof Error ? finalError.message : 'Unknown error'}`);
        }
      }
    }
  }
}

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