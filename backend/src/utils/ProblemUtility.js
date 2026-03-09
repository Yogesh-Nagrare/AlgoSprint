// const axios = require('axios');


// const getLanguageById = (lang)=>{

//     const language = {
//         "c++":54,
//         "java":62,
//         "javascript":63
//     }


//     return language[lang.toLowerCase()];
// }


// const submitBatch = async (submissions)=>{

// const options = {
//   method: 'POST',
//   url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//   params: {
//     base64_encoded: 'false'
//   },
//   headers: {
//     'x-rapidapi-key': process.env.JUDGE0_KEY,
//     'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
//     'Content-Type': 'application/json'
//   },
//   data: {
//     submissions
//   }
// };

// async function fetchData() {
//     try {
//         const response = await axios.request(options);
//         return response.data;
//     } catch (error) {
// console.error("Judge0 Batch Submit Error:", error.response?.data || error.message);
//         throw new Error(error.response?.data?.message || "Failed to submit to Judge0");    }
// }

//  return await fetchData();

// }


// // const waiting = async(timer)=>{
// //   setTimeout(()=>{
// //     return 1;
// //   },timer);
// // }
// const waiting = (timer) =>
//   new Promise(resolve => setTimeout(resolve, timer));

// // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]

// const submitToken = async(resultToken)=>{

// const options = {
//   method: 'GET',
//   url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//   params: {
//     tokens: resultToken.join(","),
//     base64_encoded: 'false',
//     fields: '*'
//   },
//   headers: {
//     'x-rapidapi-key': process.env.JUDGE0_KEY,
//     'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
//   }
// };

// async function fetchData() {
//     try {
//         const response = await axios.request(options);
//         return response.data;
//     } catch (error) {
//         console.error(error);
//     }
// }


// while (true) {
//         try {
//             const response = await axios.request(options);
//             const result = response.data;

//             if (!result || !result.submissions) {
//                 throw new Error("Invalid response from Judge0");
//             }

//             const isResultObtained = result.submissions.every((r) => r.status_id > 2);

//             if (isResultObtained) {
//                 return result.submissions;
//             }

//             await waiting(1000);
//         } catch (error) {
//             console.error("Judge0 Polling Error:", error.message);
//             throw error;
//         }
//     }
// }


// module.exports = {getLanguageById,submitBatch,submitToken};


const axios = require('axios');

const getLanguageById = (lang) => {
    const language = {
        "c++": 54,
        "java": 62,
        "javascript": 63
    };
    return language[lang.toLowerCase()];
};

// ─── Helper: safely decode base64 (Judge0 returns error output as base64) ─────
const b64decode = (str) => {
    if (!str) return '';
    try {
        return Buffer.from(str, 'base64').toString('utf8').trim();
    } catch {
        return str; // already plain text, return as-is
    }
};

// ─── Helper: normalize a single submission result ─────────────────────────────
// Judge0 returns compile_output, stderr, stdout as base64 when base64_encoded=true
// We use base64_encoded=true for reliability, then decode here
const normalizeResult = (r) => ({
    ...r,
    stdout:         b64decode(r.stdout),
    stderr:         b64decode(r.stderr),
    compile_output: b64decode(r.compile_output),
    message:        b64decode(r.message),
});

// ─── Submit batch ─────────────────────────────────────────────────────────────
const submitBatch = async (submissions) => {
    // Encode source_code and stdin as base64 — required when base64_encoded=true
    const encodedSubmissions = submissions.map((s) => ({
        ...s,
        source_code: Buffer.from(s.source_code).toString('base64'),
        stdin: s.stdin ? Buffer.from(s.stdin).toString('base64') : '',
    }));

    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: { base64_encoded: 'true' },   // ← use true so error output is reliably decoded
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: { submissions: encodedSubmissions }
    };

    try {
        const response = await axios.request(options);

        // RapidAPI Judge0 returns array directly: [{token: "..."}, ...]
        // Some self-hosted instances return: { submissions: [...] }
        // Handle both shapes:
        const data = response.data;
        const tokenList = Array.isArray(data) ? data : (data?.submissions || []);

        if (!tokenList.length) {
            console.error("Judge0 batch submit returned empty token list. Response:", data);
            throw new Error("Judge0 returned no tokens. Check your API key and submission format.");
        }

        console.log(`✓ Submitted ${tokenList.length} submission(s) to Judge0`);
        return tokenList; // [{token: "abc..."}, ...]

    } catch (error) {
        const status = error.response?.status;
        const responseData = error.response?.data;
        const msg = responseData?.message || responseData?.error || error.message;

        console.error("Judge0 Batch Submit Error — status:", status, "| body:", responseData);

        if (status === 429) {
            const err = new Error("Judge0 API daily limit exceeded. Please try again tomorrow.");
            err.code = 'JUDGE0_RATE_LIMIT';
            throw err;
        }

        if (status === 401 || status === 403) {
            throw new Error("Judge0 API key is invalid or unauthorized. Check your JUDGE0_KEY in .env");
        }

        throw new Error(msg || "Failed to submit to Judge0");
    }
};

// ─── Poll for results ─────────────────────────────────────────────────────────
const waiting = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const submitToken = async (resultToken) => {
    // Guard: ensure we have valid tokens
    const validTokens = resultToken.filter(t => typeof t === 'string' && t.length > 0);

    if (validTokens.length === 0) {
        console.error("submitToken called with empty/invalid tokens:", resultToken);
        throw new Error("No valid tokens to poll — submitBatch may have failed silently");
    }

    if (validTokens.length !== resultToken.length) {
        console.warn(`⚠ submitToken: ${resultToken.length - validTokens.length} invalid token(s) filtered out`);
    }

    const options = {
        method: 'GET',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            tokens: validTokens.join(","),
            base64_encoded: 'true',   // ← must match what we submitted with
            fields: '*'
        },
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        }
    };

    let attempts = 0;
    const MAX_ATTEMPTS = 20; // 20s max wait

    while (attempts < MAX_ATTEMPTS) {
        attempts++;
        try {
            const response = await axios.request(options);
            const result = response.data;

            if (!result || !result.submissions) {
                console.error("Judge0 polling unexpected response:", result);
                throw new Error("Invalid response from Judge0 — missing 'submissions' field");
            }

            const isComplete = result.submissions.every((r) => r.status_id > 2);

            if (isComplete) {
                console.log(`✓ Judge0 results ready after ${attempts} poll(s)`);
                // Decode all base64 fields before returning
                return result.submissions.map(normalizeResult);
            }

            await waiting(1000);

        } catch (error) {
            const status = error.response?.status;
            const responseData = error.response?.data;

            console.error(
                "Judge0 Polling Error — attempt:", attempts,
                "| status:", status,
                "| body:", responseData,
                "| message:", error.message
            );

            if (status === 429) {
                const err = new Error("Judge0 API daily limit exceeded. Please try again tomorrow.");
                err.code = 'JUDGE0_RATE_LIMIT';
                throw err;
            }

            if (status === 400) {
                // Log full details to help diagnose
                console.error("Judge0 400 Bad Request — tokens sent:", validTokens.join(","));
                console.error("Judge0 400 response body:", JSON.stringify(responseData));
                throw new Error(
                    `Judge0 rejected the polling request (400). ` +
                    `Tokens: [${validTokens.join(", ")}]. ` +
                    `Response: ${JSON.stringify(responseData)}`
                );
            }

            throw error;
        }
    }

    throw new Error(`Judge0 timed out after ${MAX_ATTEMPTS} seconds — submissions may still be processing`);
};

module.exports = { getLanguageById, submitBatch, submitToken };