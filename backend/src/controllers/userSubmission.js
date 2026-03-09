// const Problem = require("../models/problem");
// const Submission = require("../models/submission");
// const {getLanguageById,submitBatch,submitToken} = require("../utils/ProblemUtility");
// const { preprocessInput } = require("../utils/InputParser");
// const { compareOutputs } = require('../utils/OutputNormalizer');
// const { wrapCode } = require('../utils/CodeWrapper');
// const redisClient = require('../config/redis'); // <--- ADD THIS IMPORT

// const submitCode = async (req,res)=>{
//     try{
//        const userId = req.result._id;
//        const problemId = req.params.id;
//        let {code,language} = req.body;

//       if(!userId||!code||!problemId||!language)
//         return res.status(400).send("Some field missing");
      
//       if(language==='cpp')
//         language='c++'

//        const problem = await Problem.findById(problemId);
//         if (req.quotaExhausted) {
//     console.log("🚫 Submit quota exhausted");

//     return res.status(429).json({
//         message: "Daily submit limit reached",
//         detail: "You can submit once per day. Upgrade for unlimited access.",
//         isQuotaExceeded: true
//     });
// }

//        // Get function signature for this language
//        const functionSig = problem.functionSignature?.find(
//            sig => sig.language.toLowerCase() === language.toLowerCase()
//        );
       
//        // Wrap the user's code with main() function
//        let wrappedCode = code;
//        if (functionSig) {
//            wrappedCode = wrapCode(
//                code, 
//                language, 
//                functionSig.signature,
//                'auto', // inputFormat (can be enhanced)
//                'auto'  // outputFormat (can be enhanced)
//            );
//        }

//        const submittedResult = await Submission.create({
//           userId,
//           problemId,
//           code,
//           language,
//           status:'pending',
//           testCasesTotal:problem.hiddenTestCases.length
//         })

//     const languageId = getLanguageById(language);

//     const submissions = problem.hiddenTestCases.map((testcase)=>({
//         source_code: wrappedCode,  // Use wrapped code
//         language_id: languageId,
//         stdin: preprocessInput(testcase.input)
//     }));

//     const submitResult = await submitBatch(submissions);
//     const resultToken = submitResult.map((value)=> value.token);
//     const testResult = await submitToken(resultToken);

//     let testCasesPassed = 0;
//     let runtime = 0;
//     let memory = 0;
//     let status = 'accepted';
//     let errorMessage = null;

//     for(let i = 0; i < testResult.length; i++){
//         const test = testResult[i];
        
//         if(test.status_id === 6){
//             status = 'error';
//             errorMessage = test.compile_output || test.stderr;
//             break;
//         } else if(test.status_id === 5 || test.status_id === 11 || test.status_id === 12){
//             status = 'error';
//             errorMessage = test.stderr;
//             break;
//         } else if(test.status_id !== 3) {
//             status = 'error';
//             errorMessage = test.status?.description || 'Unknown error';
//             break;
//         }
        
//         const expectedOutput = problem.hiddenTestCases[i].output;
//         const actualOutput = test.stdout;
        
//         const comparison = compareOutputs(actualOutput, expectedOutput);
        
//         if(comparison.match){
//             testCasesPassed++;
//             runtime = runtime + parseFloat(test.time || 0);
//             memory = Math.max(memory, test.memory || 0);
//         } else {
//             status = 'wrong';
//             errorMessage = `Test case ${i + 1} failed`;
//             break;
//         }
//     }

//     submittedResult.status = status;
//     submittedResult.testCasesPassed = testCasesPassed;
//     submittedResult.errorMessage = errorMessage;
//     submittedResult.runtime = runtime;
//     submittedResult.memory = memory;

//     await submittedResult.save();

//     if(status === 'accepted' && !req.result.problemSolved.includes(problemId)){
//         req.result.problemSolved.push(problemId);
//         await req.result.save();
//     }
      
//     const accepted = (status === 'accepted');
//     res.status(201).json({
//         accepted,
//         totalTestCases: submittedResult.testCasesTotal,
//         passedTestCases: testCasesPassed,
//         runtime,
//         memory,
//         status
//     });
//     }
//     catch(err){
//         console.error("Submit Code Error:", err);
//         res.status(500).send("Internal Server Error: " + err.message);
//     }
// }

// const runCode = async (req, res) => {
//     try {
//         const userId = req.result._id;
//         const problemId = req.params.id;
//         let { code, language } = req.body;

//         if (!userId || !code || !problemId || !language)
//             return res.status(400).send("Some field missing");

//         const problem = await Problem.findById(problemId);

//         // ✨✨✨ CHECK IF MIDDLEWARE DETECTED QUOTA EXHAUSTION ✨✨✨
//         if (req.quotaExhausted) {
//             console.log("🚫 Quota exhausted (from middleware) - Returning redirect flag");
//             return res.status(200).json({
//                 quotaExhausted: true,
//                 message: "Daily run limit reached"
//             });
//         }

//         // ✨✨✨ NORMAL EXECUTION CONTINUES ✨✨✨
//         if (language === 'cpp')
//             language = 'c++'

//         const functionSig = problem.functionSignature?.find(
//             sig => sig.language.toLowerCase() === language.toLowerCase()
//         );

//         let wrappedCode = code;
//         if (functionSig) {
//             wrappedCode = wrapCode(
//                 code,
//                 language,
//                 functionSig.signature,
//                 'auto',
//                 'auto'
//             );
//         }

//         const languageId = getLanguageById(language);

//         const submissions = problem.visibleTestCases.map((testcase) => ({
//             source_code: wrappedCode,
//             language_id: languageId,
//             stdin: preprocessInput(testcase.input)
//         }));

//         const submitResult = await submitBatch(submissions);
//         const resultToken = submitResult.map((value) => value.token);
//         const testResult = await submitToken(resultToken);

//         let testCasesPassed = 0;
//         let runtime = 0;
//         let memory = 0;
//         let overallSuccess = true;

//         const processedResults = testResult.map((test, i) => {
//             const testcase = problem.visibleTestCases[i];

//             let testStatus = 'failed';
//             let testError = null;

//             if (test.status_id === 6) {
//                 testStatus = 'compilation_error';
//                 testError = test.compile_output || test.stderr;
//                 overallSuccess = false;
//             } else if (test.status_id === 5 || test.status_id === 11 || test.status_id === 12) {
//                 testStatus = 'runtime_error';
//                 testError = test.stderr;
//                 overallSuccess = false;
//             } else if (test.status_id !== 3) {
//                 testStatus = 'error';
//                 testError = test.status?.description || 'Unknown error';
//                 overallSuccess = false;
//             } else {
//                 const comparison = compareOutputs(test.stdout, testcase.output);

//                 if (comparison.match) {
//                     testStatus = 'passed';
//                     testCasesPassed++;
//                     runtime = runtime + parseFloat(test.time || 0);
//                     memory = Math.max(memory, test.memory || 0);
//                 } else {
//                     testStatus = 'wrong_answer';
//                     testError = 'Output does not match expected';
//                     overallSuccess = false;
//                 }
//             }

//             return {
//                 status_id: test.status_id,
//                 stdin: testcase.input,
//                 stdout: test.stdout || '',
//                 expected_output: testcase.output,
//                 time: test.time,
//                 memory: test.memory,
//                 explanation: testcase.explanation,
//                 error: testError,
//                 testStatus: testStatus
//             };
//         });

//         res.status(200).json({
//             success: overallSuccess,
//             mode: 'execution',
//             testCases: processedResults,
//             testCasesPassed,
//             totalTestCases: problem.visibleTestCases.length,
//             runtime,
//             memory
//         });
//     }
//     catch (err) {
//         console.error("Run Code Error:", err);
//         res.status(500).send("Internal Server Error: " + err.message);
//     }
// };

// // controllers/userSubmission.js (add this new function)
// const checkQuota = async (req, res) => {
//     try {
//         const userId = req.result?._id;
//         if (!userId) return res.status(401).send("Unauthorized");

//         const today = new Date().toISOString().split('T')[0];
        
//         // Check run count
//         const runKey = `ratelimit:run:${userId}:${today}`;
//         const runCount = await redisClient.get(runKey);
//         const runsLeft = Math.max(0, 1 - (parseInt(runCount) || 0));
        
//         // Check submit count
//         const submitKey = `ratelimit:submit:${userId}:${today}`;
//         const submitCount = await redisClient.get(submitKey);
//         const submitsLeft = Math.max(0, 1 - (parseInt(submitCount) || 0));

//         res.json({
//             runsLeft,
//             submitsLeft,
//             resetAt: new Date(new Date().setUTCHours(24, 0, 0, 0)).toISOString()
//         });
//     } catch (error) {
//         console.error('Check quota error:', error);
//         res.status(500).json({ error: 'Failed to check quota' });
//     }
// };

// module.exports = {submitCode,runCode,checkQuota};

const Problem = require("../models/problem");
const Submission = require("../models/submission");
const { getLanguageById, submitBatch, submitToken } = require("../utils/ProblemUtility");
const { preprocessInput } = require("../utils/InputParser");
const { compareOutputs } = require('../utils/OutputNormalizer');
const { wrapCode } = require('../utils/CodeWrapper');
const redisClient = require('../config/redis');

// ─── Helper: extract human-readable error from a Judge0 result ────────────────
const extractErrorMessage = (test) => {
    // Guard: if test is null/undefined, return generic message
    if (!test) return "Unknown error: no result received from judge";

    switch (test.status_id) {
        case 3: return null; // Accepted — no error

        case 4: return "Wrong Answer";

        case 5: return "Time Limit Exceeded";

        case 6: {
            // Compilation Error — gcc/javac stderr is in compile_output
            // Fall back chain: compile_output → stderr → generic message
            const raw = test.compile_output || test.stderr || "Compilation failed (no details returned by judge)";
            // Strip the /tmp/solution.cpp: prefix Judge0 injects
            const cleaned = raw.replace(/\/tmp\/[^\s:]+:/g, '').trim();
            return `Compilation Error:\n${cleaned}`;
        }

        case 7:  return "Runtime Error: Segmentation Fault\nLikely cause: array out-of-bounds or null pointer dereference";
        case 8:  return "Runtime Error: Floating Point Exception\nLikely cause: division by zero";
        case 9:  return "Runtime Error: Process killed\nLikely cause: infinite loop or excessive memory usage";
        case 10: return "Runtime Error: Process exited abnormally";
        case 11: {
            const detail = test.stderr || "No stderr details available";
            return `Runtime Error:\n${detail}`;
        }
        case 12: return "Memory Limit Exceeded";
        case 13: return "Internal Judge Error (not your code — try again)";
        case 14: return "Exec Format Error — wrong language selected?";

        default: {
            const desc = test.status?.description || `Unknown status (id: ${test.status_id})`;
            const detail = test.stderr || test.compile_output || '';
            return detail ? `${desc}:\n${detail}` : desc;
        }
    }
};

// ─── Safe Judge0 caller — NEVER throws, always returns {ok, testResult/message} ──
const safeCallJudge0 = async (submissions) => {
    try {
        const batchResult = await submitBatch(submissions);

        if (!Array.isArray(batchResult)) {
            return { ok: false, rateLimit: false, message: "Unexpected response from Judge0 (batch submit)" };
        }

        const tokens = batchResult.map((v) => v.token);
        const testResult = await submitToken(tokens);

        if (!Array.isArray(testResult)) {
            return { ok: false, rateLimit: false, message: "Unexpected response from Judge0 (polling)" };
        }

        return { ok: true, testResult };
    } catch (err) {
        if (err.code === 'JUDGE0_RATE_LIMIT') {
            return { ok: false, rateLimit: true, message: err.message };
        }
        // Network error, bad API key, timeout, etc.
        return { ok: false, rateLimit: false, message: err.message || "Judge0 unavailable" };
    }
};

// ─── Submit Code ──────────────────────────────────────────────────────────────
const submitCode = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;
        let { code, language } = req.body;

        if (!userId || !code || !problemId || !language)
            return res.status(400).send("Some field missing");

        if (language === 'cpp') language = 'c++';

        const problem = await Problem.findById(problemId);

        if (req.quotaExhausted) {
            return res.status(429).json({
                message: "Daily submit limit reached",
                detail: "You can submit once per day. Upgrade for unlimited access.",
                isQuotaExceeded: true
            });
        }

        const functionSig = problem.functionSignature?.find(
            sig => sig.language.toLowerCase() === language.toLowerCase()
        );

        let wrappedCode = code;
        if (functionSig) {
            wrappedCode = wrapCode(code, language, functionSig.signature, 'auto', 'auto');
        }

        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: 'pending',
            testCasesTotal: problem.hiddenTestCases.length
        });

        const languageId = getLanguageById(language);

        const submissions = problem.hiddenTestCases.map((testcase) => ({
            source_code: wrappedCode,
            language_id: languageId,
            stdin: preprocessInput(testcase.input)
        }));

        // ── Call Judge0 safely — no more 500s from Judge0 failures ──
        const judge0 = await safeCallJudge0(submissions);

        if (!judge0.ok) {
            submittedResult.status = 'error';
            submittedResult.errorMessage = judge0.message;
            await submittedResult.save();

            return res.status(judge0.rateLimit ? 503 : 502).json({
                accepted: false,
                status: 'error',
                errorMessage: judge0.message,
                isJudgeUnavailable: true
            });
        }

        const testResult = judge0.testResult;

        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = 'accepted';
        let errorMessage = null;

        for (let i = 0; i < testResult.length; i++) {
            const test = testResult[i];

            if (test.status_id !== 3) {
                const isWrongAnswer = test.status_id === 4;
                status = isWrongAnswer ? 'wrong' : 'error';
                errorMessage = isWrongAnswer
                    ? `Test case ${i + 1} failed: Wrong Answer`
                    : extractErrorMessage(test);
                break;
            }

            const comparison = compareOutputs(test.stdout, problem.hiddenTestCases[i].output);

            if (comparison.match) {
                testCasesPassed++;
                runtime += parseFloat(test.time || 0);
                memory = Math.max(memory, test.memory || 0);
            } else {
                status = 'wrong';
                errorMessage = `Test case ${i + 1} failed: Wrong Answer`;
                break;
            }
        }

        submittedResult.status = status;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.errorMessage = errorMessage;
        submittedResult.runtime = runtime;
        submittedResult.memory = memory;
        await submittedResult.save();

        if (status === 'accepted' && !req.result.problemSolved.includes(problemId)) {
            req.result.problemSolved.push(problemId);
            await req.result.save();
        }

        return res.status(201).json({
            accepted: status === 'accepted',
            totalTestCases: submittedResult.testCasesTotal,
            passedTestCases: testCasesPassed,
            runtime,
            memory,
            status,
            errorMessage // ← always sent so frontend Judge0Console can display it
        });

    } catch (err) {
        // Only DB errors reach here now — Judge0 errors are handled above
        console.error("Submit Code Error:", err);
        res.status(500).send("Internal Server Error: " + err.message);
    }
};

// ─── Run Code ─────────────────────────────────────────────────────────────────
const runCode = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;
        let { code, language } = req.body;

        if (!userId || !code || !problemId || !language)
            return res.status(400).send("Some field missing");

        const problem = await Problem.findById(problemId);

        if (req.quotaExhausted) {
            return res.status(200).json({
                quotaExhausted: true,
                message: "Daily run limit reached"
            });
        }

        if (language === 'cpp') language = 'c++';

        const functionSig = problem.functionSignature?.find(
            sig => sig.language.toLowerCase() === language.toLowerCase()
        );

        let wrappedCode = code;
        if (functionSig) {
            wrappedCode = wrapCode(code, language, functionSig.signature, 'auto', 'auto');
        }

        const languageId = getLanguageById(language);

        const submissions = problem.visibleTestCases.map((testcase) => ({
            source_code: wrappedCode,
            language_id: languageId,
            stdin: preprocessInput(testcase.input)
        }));

        // ── Call Judge0 safely — no more 500s from Judge0 failures ──
        const judge0 = await safeCallJudge0(submissions);

        if (!judge0.ok) {
            return res.status(200).json({
                success: false,
                isJudgeUnavailable: true,
                errorMessage: judge0.message,
                testCases: []
            });
        }

        const testResult = judge0.testResult;

        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let overallSuccess = true;

        const processedResults = testResult.map((test, i) => {
            const testcase = problem.visibleTestCases[i];

            let testStatus = 'failed';
            let testError = null;

            if (test.status_id === 3) {
                const comparison = compareOutputs(test.stdout, testcase.output);
                if (comparison.match) {
                    testStatus = 'passed';
                    testCasesPassed++;
                    runtime += parseFloat(test.time || 0);
                    memory = Math.max(memory, test.memory || 0);
                } else {
                    testStatus = 'wrong_answer';
                    testError = 'Output does not match expected';
                    overallSuccess = false;
                }
            } else {
                overallSuccess = false;
                testError = extractErrorMessage(test); // ← real gcc/javac/node error

                if (test.status_id === 6)       testStatus = 'compilation_error';
                else if (test.status_id === 5)  testStatus = 'time_limit_exceeded';
                else if (test.status_id === 12) testStatus = 'memory_limit_exceeded';
                else                            testStatus = 'runtime_error';
            }

            return {
                status_id: test.status_id,
                stdin: testcase.input,
                stdout: test.stdout || '',
                expected_output: testcase.output,
                time: test.time,
                memory: test.memory,
                explanation: testcase.explanation,
                error: testError,  // e.g. "Compilation Error:\n2:18: error: expected ';'"
                testStatus
            };
        });

        return res.status(200).json({
            success: overallSuccess,
            mode: 'execution',
            testCases: processedResults,
            testCasesPassed,
            totalTestCases: problem.visibleTestCases.length,
            runtime,
            memory
        });

    } catch (err) {
        // Only DB errors reach here now
        console.error("Run Code Error:", err);
        res.status(500).send("Internal Server Error: " + err.message);
    }
};

// ─── Check Quota ──────────────────────────────────────────────────────────────
const checkQuota = async (req, res) => {
    try {
        const userId = req.result?._id;
        if (!userId) return res.status(401).send("Unauthorized");

        const today = new Date().toISOString().split('T')[0];

        const runKey = `ratelimit:run:${userId}:${today}`;
        const runCount = await redisClient.get(runKey);
        const runsLeft = Math.max(0, 1 - (parseInt(runCount) || 0));

        const submitKey = `ratelimit:submit:${userId}:${today}`;
        const submitCount = await redisClient.get(submitKey);
        const submitsLeft = Math.max(0, 1 - (parseInt(submitCount) || 0));

        res.json({
            runsLeft,
            submitsLeft,
            resetAt: new Date(new Date().setUTCHours(24, 0, 0, 0)).toISOString()
        });
    } catch (error) {
        console.error('Check quota error:', error);
        res.status(500).json({ error: 'Failed to check quota' });
    }
};

module.exports = { submitCode, runCode, checkQuota };