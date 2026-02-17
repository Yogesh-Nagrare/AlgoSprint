const { GoogleGenAI } = require("@google/genai");
const Problem = require("../models/problem");

const getAICodeReview = async (req, res) => {
    try {
        const { code, language } = req.body;
        const problemId = req.params.id;

        if (!code || !language || !problemId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ error: "Problem not found" });

        // Initialize with the new SDK patterns
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

        // Content generation with System Instructions
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze this ${language} solution for "${problem.title}".\n\nCode:\n\`\`\`${language}\n${code.slice(0, 8000)}\n\`\`\``,
            config: {
                // systemInstruction is the best place for "behavioral" rules
                systemInstruction: `You are a world-class Competitive Programming Coach.
The user's execution quota is exhausted; you are performing STATIC ANALYSIS only.

STRICT PROTOCOLS:
1. DO NOT claim the code is "correct" or "will pass."
2. DO NOT simulate execution. Use probabilistic language ("appears to," "could result in").
3. CRITICAL: Evaluate against Time Limits (TL) and Memory Limits (ML).
4. Identify common CP pitfalls: Integer overflow (long long), off-by-one errors, recursion limits, and TLE in nested loops.

STRUCTURE YOUR OUTPUT:
1️⃣ Algorithm: Identify the approach (e.g., Sliding Window, DP, Dijkstra).
2️⃣ Correctness Risks: Flag logical flaws or edge cases (N=1, empty, max constraints).
3️⃣ Complexity: Provide Big O for Time & Space.
4️⃣ Optimization: Suggestions to reduce constant factors or better algorithms.

MANDATORY FOOTER:
"⚠️ This is static analysis only. Run code to verify correctness."`,
                temperature: 0.1, // Lower temperature = more technical/consistent
                maxOutputTokens: 1000,
            }
        });

        // In @google/genai, .text is a property, not a function
        const aiReview = response.text;

        return res.status(200).json({
            mode: "ai-review",
            aiReview,
            message: "Static analysis complete.",
            upgradePrompt: "Upgrade to Premium for real-time execution & private test cases."
        });

    } catch (error) {
        console.error("❌ AI Review Error:", error);
        return res.status(500).json({ error: "AI Review failed to generate." });
    }
};

module.exports = {
    getAICodeReview,
};