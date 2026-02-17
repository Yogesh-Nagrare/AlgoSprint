const { GoogleGenAI } = require("@google/genai");
const Problem = require("../models/problem");

const getAICodeReview = async (req, res) => {
    try {
        const { code, language } = req.body;
        const problemId = req.params.id;

        if (!code || !language || !problemId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Get problem details
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        // Initialize Gemini AI (STRICT SDK USAGE)
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

        // Sanitize code (security + cost control)
        const sanitizedCode = code.replace(/```/g, "").slice(0, 8000);

        const prompt = `
You are a strict competitive programming code review mentor.

The user has exceeded their execution quota.
You MUST perform STATIC ANALYSIS only.

================ STRICT RULES =================
- NEVER say "your code is correct"
- NEVER guarantee it passes all tests
- NEVER simulate real execution
- Use phrases like: "appears to", "might", "seems like"
- End response with:
"⚠️ This is static analysis only. Run code to verify correctness."
================================================

## Problem: ${problem.title}
Difficulty: ${problem.difficulty || "Not specified"}

Description:
${problem.description}

## Visible Test Cases:
${problem.visibleTestCases.map((tc, i) => `
Test Case ${i + 1}:
Input: ${tc.input}
Expected Output: ${tc.output}
${tc.explanation ? `Explanation: ${tc.explanation}` : ""}
`).join("\n")}

## User Code (${language}):
\`\`\`${language}
${sanitizedCode}
\`\`\`

------------------------------------------------

Provide structured response:

1️⃣ Algorithm Used  
2️⃣ Potential Logical Issues  
3️⃣ Edge Cases That Might Fail  
4️⃣ Time & Space Complexity  
5️⃣ Optimization Suggestions  

Keep response concise and practical.
`;

        console.log("🤖 Calling Gemini 2.5 Flash...");

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.2,
                maxOutputTokens: 800
            }
        });

        const aiReview = response.text;

        console.log("✅ AI review completed");

        return res.status(200).json({
            mode: "ai-review",
            aiReview,
            message: "Daily execution limit reached. AI static review provided.",
            upgradePrompt: "Upgrade to Premium for unlimited execution."
        });

    } catch (error) {
        console.error("❌ AI Review Error:", error);

        return res.status(200).json({
            mode: "ai-review",
            aiReview: `**AI Review Temporarily Unavailable**

The analysis could not be completed.

Possible reasons:
- API usage limit reached
- Network issue
- Temporary AI service interruption

Please try again later or wait for quota reset at midnight UTC.

⚠️ This is static analysis only.`,
            message: "AI service issue",
            upgradePrompt: "Upgrade to Premium for unlimited execution."
        });
    }
};

module.exports = { getAICodeReview };