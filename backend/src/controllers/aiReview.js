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

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

        // Build the full problem context for the AI
        const testCaseExamples = problem.visibleTestCases
            ?.slice(0, 2)
            .map((tc, i) => `  [${i}] stdin:  ${tc.input}\n      stdout: ${tc.output}`)
            .join("\n") || "  (none available)";

        const prompt = `
Problem: "${problem.title}"
Language: ${language}
Difficulty: ${problem.difficulty || "Unknown"}

Visible Test Cases:
${testCaseExamples}

User Code:
\`\`\`${language}
${code.slice(0, 8000)}
\`\`\`
`.trim();

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: `
You are a TERMINAL RUNTIME EMULATOR for a competitive programming judge.
Your job is to simulate what a real judge terminal would print — errors, warnings, and analysis — in raw terminal style.

━━━ OUTPUT FORMAT (strictly follow this, no markdown, no emojis except the ones specified) ━━━

Line 1 (always):
$ executing ${language} solution...

Then ONE of these three blocks depending on what you find:

─────────────────────────────────────────
BLOCK A — Compilation / Syntax Errors (if any)
─────────────────────────────────────────
[COMPILE ERROR]
  File: solution.${language === "javascript" ? "js" : language === "java" ? "java" : "cpp"}
  Line <N>: <exact error message, like a real compiler>
  
  <^ pointer to the exact token if possible>
  
  error: <short description>
  
[BUILD FAILED] 1 error(s), 0 warning(s)

─────────────────────────────────────────
BLOCK B — Runtime / Logic Errors (if code compiles but has bugs)
─────────────────────────────────────────
[COMPILE OK]
[RUNNING TEST CASES]

  Test 0 ... FAIL
  ├─ stdin:    <value from test case>
  ├─ expected: <value from test case>
  ├─ got:      <your prediction of what this code would output>
  └─ error:    <runtime error type if applicable, e.g. "TypeError: Cannot read property of undefined" / "SIGSEGV" / "TLE" / "wrong answer">

  Test 1 ... <PASS or FAIL with same structure>

[STDERR]
  <Traceback / stack trace style output if applicable>
  e.g.:
  RuntimeError: index out of bounds at line 12
    at solve() -> array[right]  (right=7, array.length=7)

[VERDICT] Wrong Answer | Runtime Error | Time Limit Exceeded
  Passed: X / ${problem.visibleTestCases?.length || "N"} visible test cases

─────────────────────────────────────────
BLOCK C — Looks Correct (no obvious errors)
─────────────────────────────────────────
[COMPILE OK]
[RUNNING TEST CASES]

  Test 0 ... PASS
  Test 1 ... PASS

[COMPLEXITY ANALYSIS]
  Time:  O(?) — <one line explanation>
  Space: O(?) — <one line explanation>

[VERDICT] Likely Correct (static analysis only)
  ⚠ Hidden test cases not verified. Edge cases to check:
    - <edge case 1, e.g. "N = 0 (empty input)">
    - <edge case 2, e.g. "all elements equal">
    - <edge case 3, e.g. "N = 10^5 — check TLE">

─────────────────────────────────────────
ALWAYS end with this footer (no exceptions):
─────────────────────────────────────────
[NOTE] Static analysis only — actual execution required to confirm.
       Quota resets at midnight UTC.

━━━ RULES ━━━
- NO markdown headers (no #, **, etc.)
- NO bullet points (use ├─ └─ tree style instead)
- Mimic real compiler/runtime error messages for the language:
    • C++: GCC-style  (e.g. "error: 'x' was not declared in this scope")
    • Java: JVM-style (e.g. "Exception in thread 'main' java.lang.ArrayIndexOutOfBoundsException")
    • JS:   V8-style  (e.g. "TypeError: Cannot read properties of undefined (reading '0')")
- Be precise. If the code looks correct, say so — don't invent fake errors.
- If you detect TLE risk (e.g. O(n²) on n=10^5), report it under [VERDICT].
- Keep total output under 60 lines.
`.trim(),
                temperature: 0.1,
                maxOutputTokens: 1200,
            }
        });

        const aiReview = response.text;

        return res.status(200).json({
            mode: "ai-review",
            aiReview,
            message: "AI Terminal Mode Active as run limits exceeded.",
            upgradePrompt: "Upgrade to Premium for real execution, private test cases, and unlimited runs."
        });

    } catch (error) {
        console.error("❌ AI Review Error:", error);
        return res.status(500).json({ error: "AI Review failed to generate." });
    }
};

module.exports = {
    getAICodeReview,
};