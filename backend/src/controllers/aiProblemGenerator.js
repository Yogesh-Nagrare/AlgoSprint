const { GoogleGenAI } = require("@google/genai");

/**
 * Enhanced AI-Based Problem Generator
 * Supports TWO modes:
 * 1. ORIGINAL mode: Generate completely new problems
 * 2. LEETCODE mode: Recreate existing problems from LeetCode/other platforms
 */
const generateProblem = async (req, res) => {
    try {
        const { topic, difficulty, focus, problemName, mode } = req.body;

        // Determine mode based on input
        const generationMode = mode || (problemName ? 'leetcode' : 'original');

        // Validation
        if (generationMode === 'original') {
            if (!topic || !difficulty) {
                return res.status(400).json({
                    success: false,
                    message: "Topic and difficulty are required for original mode"
                });
            }
        } else if (generationMode === 'leetcode') {
            if (!problemName) {
                return res.status(400).json({
                    success: false,
                    message: "Problem name is required for leetcode mode"
                });
            }
        }

        const validDifficulties = ['easy', 'medium', 'hard'];
        if (difficulty && !validDifficulties.includes(difficulty.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: "Difficulty must be 'easy', 'medium', or 'hard'"
            });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

        // ========================================
        // SYSTEM PROMPT (shared for both modes)
        // ========================================
        const systemPrompt = `
You are an expert competitive programming problem creator. 

OUTPUT FORMAT (STRICT JSON):
{
  "title": "Problem title",
  "difficulty": "easy|medium|hard",
  "description": "Clear problem statement with story/context. Explain what needs to be solved.",
  "inputFormat": "Detailed input format description",
  "outputFormat": "Detailed output format description",
  "constraints": ["1 <= n <= 10^5", "1 <= arr[i] <= 10^9"],
  "tags": ["array", "two-pointers", "etc"],
  "visibleTestCases": [
    {
      "input": "[1,2,3,4,5]",
      "output": "2",
      "explanation": "Detailed explanation for this test case"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "[1,2,3]",
      "output": "expected output"
    }
  ],
  "functionSignature": [
    {
      "language": "cpp",
      "signature": "int functionName(vector<int>& nums, int target)"
    },
    {
      "language": "java",
      "signature": "public int functionName(int[] nums, int target)"
    },
    {
      "language": "javascript",
      "signature": "function functionName(nums, target)"
    }
  ],
  "startCode": [
    {
      "language": "cpp",
      "code": "class Solution {\\npublic:\\n    int functionName(vector<int>& nums, int target) {\\n        \\n    }\\n};"
    },
    {
      "language": "java",
      "code": "class Solution {\\n    public int functionName(int[] nums, int target) {\\n        \\n    }\\n}"
    },
    {
      "language": "javascript",
      "code": "function functionName(nums, target) {\\n    \\n}"
    }
  ],
  "referenceSolution": [
    {
      "language": "cpp",
      "completeCode": "class Solution {\\npublic:\\n    int functionName(vector<int>& nums, int target) {\\n        // working solution\\n    }\\n};"
    },
    {
      "language": "java",
      "completeCode": "class Solution {\\n    public int functionName(int[] nums, int target) {\\n        // working solution\\n    }\\n}"
    },
    {
      "language": "javascript",
      "completeCode": "function functionName(nums, target) {\\n    // working solution\\n}"
    }
  ],
  "solution": {
    "explanation": "Detailed solution explanation with approach",
    "optimizedApproach": "Step-by-step optimal approach explanation",
    "timeComplexity": "O(n) or O(n log n) etc",
    "spaceComplexity": "O(1) or O(n) etc"
  }
}

CRITICAL INPUT FORMAT RULES:
1. For array inputs, ALWAYS use bracket format: "[1,2,3,4,5]"
2. For multiple parameters, use assignment format: "nums = [1,2,3], target = 5"
3. For single arrays, just use brackets: "[1,2,3]"
4. For simple values: "5" or "hello"
5. NEVER use comma-separated without brackets (NOT "1,2,3")
6. All code must use \\n for newlines (not actual newlines)
7. Code must be compilable and runnable
8. Test cases must match the function signature
9. Generate at least 2 visible test cases and 5 hidden test cases
10. Hidden test cases should cover edge cases
11. Return ONLY valid JSON (no markdown, no backticks, no explanations)

EXAMPLE INPUT FORMATS:
- Single array: "[1,2,3,4,5]"
- Array with target: "nums = [1,2,3], target = 5"
- Two arrays: "nums1 = [1,2], nums2 = [3,4]"
- Array with string: "words = [\"hello\",\"world\"], k = 2"
- Simple number: "5"
- Simple string: "hello"

REFERENCE SOLUTION REQUIREMENTS:
1. Must be COMPLETE and WORKING implementations
2. Must ACTUALLY solve the problem (not just return 0 or empty)
3. Must handle all edge cases mentioned in constraints
4. Must be optimal or near-optimal solutions
5. Code should be clean and well-structured
`;

        let userPrompt;

        // ========================================
        // MODE 1: ORIGINAL PROBLEM GENERATION
        // ========================================
        if (generationMode === 'original') {
            userPrompt = `
Generate a COMPLETELY ORIGINAL coding problem with the following requirements:

Topic: ${topic}
Difficulty: ${difficulty}
${focus ? `Additional Focus: ${focus}` : ''}

CRITICAL RULES FOR ORIGINAL MODE:
1. DO NOT copy or reference existing problems from LeetCode, Codeforces, or any platform
2. Create problems from scratch based on real-world scenarios
3. Use creative storytelling to make the problem interesting
4. Ensure the problem is solvable with the given difficulty
5. Generate complete test cases with proper input/output format (use brackets for arrays!)
6. Provide COMPLETE WORKING solutions in C++, Java, and JavaScript

DIFFICULTY GUIDELINES:
- Easy: Simple logic, 1-2 loops, basic data structures (arrays, strings)
- Medium: Multiple approaches possible, requires algorithm knowledge (two pointers, sliding window, etc.)
- Hard: Complex algorithms, optimization required (DP, graphs, advanced techniques)

INPUT FORMAT EXAMPLES:
- For array parameter: "[1,2,3,4,5]"
- For array + number: "nums = [1,2,3], k = 5"
- For two arrays: "nums1 = [1,2], nums2 = [3,4]"

Requirements:
1. Create a unique problem NOT found on any coding platform
2. Use a creative real-world scenario or story
3. Ensure the problem is solvable with the given difficulty
4. Generate complete test cases with BRACKET FORMAT for arrays
5. Provide COMPLETE WORKING solutions (not empty implementations!)
6. All code should use \\n for newlines (not actual newlines)
7. Return ONLY valid JSON (no markdown, no backticks, no explanations)

Remember: Be creative! Think of unique scenarios that make the problem interesting and practical.
`;
        } 
        // ========================================
        // MODE 2: LEETCODE PROBLEM RECREATION
        // ========================================
        else if (generationMode === 'leetcode') {
            userPrompt = `
Search your knowledge base and recreate the following LeetCode problem:

Problem Identifier: "${problemName}"
${difficulty ? `Expected Difficulty: ${difficulty}` : ''}
${topic ? `Expected Topic: ${topic}` : ''}
${focus ? `Additional Notes: ${focus}` : ''}

INSTRUCTIONS FOR LEETCODE MODE:
1. The problemName can be:
   - Problem number (e.g., "1", "two-sum", "problem 1")
   - Problem title (e.g., "Two Sum", "Valid Parentheses")
   - Partial match (search for closest match in your knowledge)

2. YOU SHOULD reference the original problem from LeetCode
3. Recreate the EXACT problem statement, constraints, and examples
4. Use the SAME function signatures as the original problem
5. Provide the OPTIMAL solution approach
6. Use BRACKET FORMAT for array inputs: "[1,2,3]" not "1,2,3"
7. Match the original difficulty level

INPUT FORMAT REQUIREMENTS:
- Single array: "[1,2,3,4,5]"
- Array + value: "nums = [1,2,3], target = 5"
- Two arrays: "nums1 = [1,2], nums2 = [3,4]"

Your task:
1. Search your knowledge for this LeetCode problem by number OR name
2. Recreate it with complete accuracy
3. Provide the exact problem description
4. Include the standard function signatures for C++, Java, JavaScript
5. Provide COMPLETE OPTIMAL solutions in all three languages
6. Include proper test cases with BRACKET FORMAT
7. All code should use \\n for newlines (not actual newlines)
8. Return ONLY valid JSON (no markdown, no backticks, no explanations)

If you cannot find this exact problem, create a similar problem based on the identifier and return it.

EXAMPLE LEETCODE PROBLEMS TO REFERENCE:
- "1" or "Two Sum": Classic two sum problem
- "20" or "Valid Parentheses": Bracket matching problem
- "121" or "Best Time to Buy and Sell Stock": Stock price problem
- "206" or "Reverse Linked List": Linked list reversal
`;
        }

        console.log('🤖 Generating AI problem...');
        console.log('Mode:', generationMode.toUpperCase());
        if (generationMode === 'original') {
            console.log('Topic:', topic);
            console.log('Difficulty:', difficulty);
            console.log('Focus:', focus || 'None');
        } else {
            console.log('Problem Name:', problemName);
            console.log('Difficulty:', difficulty || 'Auto-detect');
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            config: {
                systemInstruction: systemPrompt,
                temperature: generationMode === 'original' ? 0.9 : 0.3, // Lower temp for LeetCode accuracy
                topK: 40,
                topP: 0.95,
            }
        });

        let generatedText = response.text.trim();
        
        // Clean up the response - remove markdown code blocks if present
        generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        console.log('✅ AI Response received');
        console.log('Raw response length:', generatedText.length);

        // Parse JSON
        let problemData;
        try {
            problemData = JSON.parse(generatedText);
        } catch (parseError) {
            console.error('❌ JSON Parse Error:', parseError);
            console.error('Response text:', generatedText.substring(0, 500));
            return res.status(500).json({
                success: false,
                message: "Failed to parse AI response as JSON",
                details: parseError.message,
                rawResponse: generatedText.substring(0, 500)
            });
        }

        // Validate required fields
        const requiredFields = [
            'title', 'difficulty', 'description', 'inputFormat', 
            'outputFormat', 'constraints', 'tags', 'visibleTestCases',
            'hiddenTestCases', 'startCode', 'referenceSolution', 
            'functionSignature', 'solution'
        ];

        const missingFields = requiredFields.filter(field => !problemData[field]);
        
        if (missingFields.length > 0) {
            return res.status(500).json({
                success: false,
                message: "AI response missing required fields",
                missingFields,
                generatedData: problemData
            });
        }

        console.log('✅ Problem generated successfully');
        console.log('Title:', problemData.title);
        console.log('Difficulty:', problemData.difficulty);
        console.log('Visible test cases:', problemData.visibleTestCases.length);
        console.log('Hidden test cases:', problemData.hiddenTestCases.length);

        // Add metadata about generation mode
        problemData.generationMode = generationMode;
        if (generationMode === 'leetcode') {
            problemData.originalProblemName = problemName;
        }

        // Return the generated problem
        res.status(200).json({
            success: true,
            message: `Problem generated successfully (${generationMode} mode)`,
            mode: generationMode,
            problem: problemData
        });

    } catch (error) {
        console.error('❌ Generate Problem Error:', error);
        console.error('Error stack:', error.stack);

        if (error.message && error.message.includes('API key')) {
            return res.status(500).json({
                success: false,
                message: "Gemini API key is missing or invalid",
                details: "Please set GEMINI_KEY in your .env file"
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

module.exports = { generateProblem };