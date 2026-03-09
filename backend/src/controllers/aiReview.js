const { GoogleGenAI } = require("@google/genai");
const Problem = require("../models/problem");

// ─── Initialize Gemini ────────────────────────────────────────────────────────
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

// ─── Classify Gemini errors so UI shows the real reason ──────────────────────
const classifyGeminiError = (err) => {
    const msg = (err?.message || "") + (err?.toString() || "");

    if (
        msg.includes("API_KEY_INVALID") ||
        msg.includes("PERMISSION_DENIED") ||
        msg.includes("API key expired") ||
        msg.includes("API key not valid") ||
        msg.includes("401") ||
        msg.includes("403")
    ) {
        return {
            code: "AUTH_ERROR",
            userMessage: "Gemini API key has expired or is invalid.\nGet a new free key at: https://aistudio.google.com/apikey\nThen update GEMINI_KEY in your .env file."
        };
    }

    if (msg.includes("fetch failed") || msg.includes("ENOTFOUND") || msg.includes("ECONNREFUSED")) {
        return {
            code: "NETWORK_ERROR",
            userMessage: "AI service is unreachable from the server.\nThis is a network/firewall issue — not your code.\nTry again in a moment."
        };
    }

    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
        return {
            code: "QUOTA_ERROR",
            userMessage: "Gemini API quota exceeded.\nToo many requests — please wait a minute and try again."
        };
    }

    if (msg.includes("timeout") || msg.includes("ETIMEDOUT")) {
        return {
            code: "TIMEOUT_ERROR",
            userMessage: "AI service timed out.\nThe analysis took too long — please try again."
        };
    }

    if (msg.includes("not found") || msg.includes("404") || msg.includes("models/")) {
        return {
            code: "MODEL_ERROR",
            userMessage: "Gemini model not found.\nChange the model to 'gemini-1.5-flash' in aiReview.js."
        };
    }

    return {
        code: "UNKNOWN_ERROR",
        userMessage: `AI service error: ${err?.message || "Unknown error"}`
    };
};

// ─── Build the terminal-style prompt ─────────────────────────────────────────
const buildPrompt = (code, language, problem) => {
    const testCaseSample = problem?.visibleTestCases?.slice(0, 2)
        .map((tc, i) => `  Test ${i + 1}:\n    stdin:    ${tc.input}\n    expected: ${tc.output}`)
        .join('\n') || "  (no visible test cases)";

    return `You are a competitive programming judge performing static analysis. Simulate running the code and give terminal-style output.

PROBLEM: ${problem?.title || "Unknown"}
LANGUAGE: ${language}
VISIBLE TEST CASES:
${testCaseSample}

USER CODE:
\`\`\`${language}
${code}
\`\`\`

Respond EXACTLY in this terminal format — no markdown, no extra commentary:

$ static-analysis --lang=${language} --mode=judge
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[COMPILE CHECK]
<either "[COMPILE OK]" or "[COMPILE ERROR]" followed by the error with line:col like "2:18: error: expected ';' before 'return'">

[RUNNING test 1/2]
stdin: <input>
expected: <output>
got: <simulated output>
<either "PASS" or "FAIL — <reason>">

[RUNNING test 2/2]
stdin: <input>
expected: <output>
got: <simulated output>
<either "PASS" or "FAIL — <reason>">

[VERDICT]
<"Likely Correct ✓" or "Wrong Answer ✗" or "Compilation Error ✗" or "Runtime Error ✗">

[COMPLEXITY ANALYSIS]
Time: O(?)
Space: O(?)

[NOTE]
<1-2 lines: key observation about the approach or the bug if wrong>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
};

// ─── Build error terminal output ─────────────────────────────────────────────
const buildErrorOutput = (classified, language) => {
    const isAuth    = classified.code === "AUTH_ERROR";
    const isQuota   = classified.code === "QUOTA_ERROR";
    const isNetwork = classified.code === "NETWORK_ERROR";
    const isModel   = classified.code === "MODEL_ERROR";

    let verdict = "AI Service Unavailable ✗";
    if (isAuth)    verdict = "API Key Expired / Invalid ✗";
    if (isQuota)   verdict = "API Quota Exceeded ✗";
    if (isNetwork) verdict = "Network Unreachable ✗";
    if (isModel)   verdict = "Model Not Found ✗";

    let fix = "→ This is a server-side issue, not a problem with your code.";
    if (isAuth)  fix = "→ Fix: Go to https://aistudio.google.com/apikey\n  Generate a new key and update GEMINI_KEY in your .env file.";
    if (isQuota) fix = "→ Fix: Wait 1 minute then try again, or upgrade your Gemini plan.";
    if (isModel) fix = "→ Fix: Change model to 'gemini-1.5-flash' in aiReview.js line ~118.";

    return `$ static-analysis --lang=${language} --mode=judge
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[COMPILE CHECK]
⚠ Static analysis unavailable

[VERDICT]
${verdict}

[NOTE]
${classified.userMessage}

[DEBUG]
Error code: ${classified.code}
${fix}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
};

// ─── Main controller ──────────────────────────────────────────────────────────
const getAICodeReview = async (req, res) => {
    try {
        const userId = req.result?._id;
        const problemId = req.params.id;
        let { code, language } = req.body;

        if (!userId || !code || !problemId || !language) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        if (language === 'cpp') language = 'c++';

        console.log("GEMINI KEY:", process.env.GEMINI_KEY?.slice(0, 10));

        const problem = await Problem.findById(problemId);
        const prompt = buildPrompt(code, language, problem);

        let aiReview;

        try {
            const result = await genAI.models.generateContent({
                model: "gemini-2.5-flash", // stable free-tier model
                contents: prompt,
            });

            aiReview = result.text?.trim()
                || "$ static-analysis\n[NOTE]\nAI returned an empty response. Please try again.";

        } catch (geminiErr) {
            console.error("❌ AI Review Error:", geminiErr);

            const classified = classifyGeminiError(geminiErr);
            aiReview = buildErrorOutput(classified, language);
        }

        return res.status(200).json({ aiReview });

    } catch (err) {
        console.error("AI Review Controller Error:", err);
        return res.status(500).json({
            error: "Failed to process AI review request",
            detail: err.message
        });
    }
};

module.exports = { getAICodeReview };