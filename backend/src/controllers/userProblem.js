const {getLanguageById,submitBatch,submitToken} = require("../utils/ProblemUtility");
const { preprocessInput } = require("../utils/InputParser");
const { compareOutputs,convertExpectedOutputForJudge0 } = require("../utils/OutputNormalizer");
const Problem = require("../models/problem");
const User = require("../models/user");
const mongoose = require("mongoose");
const Submission = require("../models/submission");
const solutionVideo = require('../models/solutionVideo');
const { wrapCode } = require("../utils/CodeWrapper");

// ... (Keep all your existing functions: createProblem, updateProblem, deleteProblem, etc.)

const createProblem = async (req, res) => {
    const { 
        title, 
        description, 
        difficulty, 
        tags, 
        visibleTestCases, 
        hiddenTestCases, 
        startCode, 
        referenceSolution,
        functionSignature
    } = req.body;

    try {
        console.log('\n🔍 ===== PROBLEM CREATION DEBUG =====');
        console.log('Title:', title);
        console.log('Difficulty:', difficulty);
        console.log('Visible Test Cases:', visibleTestCases?.length);
        console.log('Hidden Test Cases:', hiddenTestCases?.length);
        console.log('Reference Solutions:', referenceSolution?.length);
        console.log('Function Signatures:', functionSignature?.length);

        // Validate each reference solution
        for (const { language, completeCode } of referenceSolution) {
            const languageId = getLanguageById(language);

            const functionSig = functionSignature?.find(
                sig => sig.language.toLowerCase() === language.toLowerCase()
            );
            
            if (!functionSig) {
                return res.status(400).json({
                    success: false,
                    message: `Function signature missing for ${language}`
                });
            }

            console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`🧪 TESTING ${language.toUpperCase()} REFERENCE SOLUTION`);
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            
            console.log('\n📝 Original Code:');
            console.log(completeCode);
            
            console.log('\n🔧 Function Signature:');
            console.log(functionSig.signature);

            let wrappedCode;
            try {
                wrappedCode = wrapCode(
                    completeCode,
                    language,
                    functionSig.signature,
                    'auto',
                    'auto'
                );
                console.log('\n✅ Wrapped Code (first 500 chars):');
                console.log(wrappedCode.substring(0, 500) + '...');
            } catch (wrapError) {
                console.error('\n❌ CODE WRAPPING ERROR:', wrapError);
                return res.status(400).json({
                    success: false,
                    message: `Failed to wrap code for ${language}`,
                    details: wrapError.message,
                    stack: wrapError.stack
                });
            }

            console.log('\n📊 Testing Against Visible Test Cases:');
            
            const submissions = visibleTestCases.map((testcase, index) => {
                const processedInput = preprocessInput(testcase.input);
                
                console.log(`\n  Test Case ${index + 1}:`);
                console.log(`    Raw Input:       "${testcase.input}"`);
                console.log(`    Processed Input: "${processedInput}"`);
                console.log(`    Expected Output: "${testcase.output}"`);
                
                return {
                    source_code: wrappedCode,
                    language_id: languageId,
                    stdin: processedInput,
                };
            });

            console.log('\n⏳ Submitting to Judge0...');
            const submitResult = await submitBatch(submissions);
            
            if (!submitResult || submitResult.length === 0) {
                console.error('❌ Judge0 submission failed - no result returned');
                return res.status(500).json({
                    success: false,
                    message: "Judge0 submission failed"
                });
            }
            
            const resultToken = submitResult.map((value) => value.token);
            console.log(`✅ Submission tokens:`, resultToken);
            
            console.log('⏳ Waiting for results...');
            const testResult = await submitToken(resultToken);
            
            console.log(`\n📊 ${language} EXECUTION RESULTS:`);

            for (let i = 0; i < testResult.length; i++) {
                const test = testResult[i];
                const expectedOutput = visibleTestCases[i].output;
                
                console.log(`\n  ━━━ Test Case ${i + 1} ━━━`);
                console.log(`  Status ID:        ${test.status_id}`);
                console.log(`  Status:           ${test.status?.description || 'N/A'}`);
                console.log(`  Stdout:           "${test.stdout || ''}"`);
                console.log(`  Stderr:           "${test.stderr || ''}"`);
                console.log(`  Expected Output:  "${expectedOutput}"`);
                console.log(`  Execution Time:   ${test.time || 'N/A'}s`);
                console.log(`  Memory:           ${test.memory || 'N/A'} KB`);
                
                // Compilation Error
                if (test.status_id === 6) {
                    console.error(`\n  ❌ COMPILATION ERROR`);
                    console.error(`  Details:`, test.compile_output || test.stderr);
                    return res.status(400).json({
                        success: false,
                        message: `Compilation Error for ${language}`,
                        details: test.compile_output || test.stderr || "Compilation failed",
                        stderr: test.compile_output || test.stderr || "",
                        wrappedCode: wrappedCode,
                        testCaseIndex: i + 1,
                        input: visibleTestCases[i].input
                    });
                }
                
                // Runtime Error
                if (test.status_id === 5 || test.status_id === 11 || test.status_id === 12) {
                    console.error(`\n  ❌ RUNTIME ERROR`);
                    console.error(`  Details:`, test.stderr || test.status?.description);
                    return res.status(400).json({
                        success: false,
                        message: `Runtime Error for ${language}`,
                        details: test.status?.description || "Runtime Error",
                        stderr: test.stderr || "",
                        wrappedCode: wrappedCode,
                        testCaseIndex: i + 1,
                        input: visibleTestCases[i].input
                    });
                }
                
                // Compare outputs
                const comparison = compareOutputs(test.stdout, expectedOutput);
                
                console.log(`  ━━━ Output Comparison ━━━`);
                console.log(`  Raw Stdout:          "${test.stdout}"`);
                console.log(`  Raw Expected:        "${expectedOutput}"`);
                console.log(`  Formatted Stdout:    "${comparison.formattedActual}"`);
                console.log(`  Formatted Expected:  "${comparison.formattedExpected}"`);
                console.log(`  Normalized Stdout:   "${comparison.normalizedActual}"`);
                console.log(`  Normalized Expected: "${comparison.normalizedExpected}"`);
                console.log(`  Match:               ${comparison.match ? "✅ PASS" : "❌ FAIL"}`);
                
                if (!comparison.match) {
                    console.error(`\n  ❌ OUTPUT MISMATCH`);
                    return res.status(400).json({
                        success: false,
                        message: `Output mismatch for ${language}`,
                        details: "Wrong Answer",
                        testCaseIndex: i + 1,
                        input: visibleTestCases[i].input,
                        stdout: test.stdout || "",
                        expectedOutput: expectedOutput,
                        formattedActual: comparison.formattedActual,
                        formattedExpected: comparison.formattedExpected,
                        normalizedActual: comparison.normalizedActual,
                        normalizedExpected: comparison.normalizedExpected,
                        wrappedCode: wrappedCode
                    });
                }
                
                console.log(`  ✅ Test Case ${i + 1} PASSED`);
            }
            
            console.log(`\n✅ All test cases passed for ${language}!`);
        }

        console.log('\n🎉 All reference solutions validated successfully!');
        console.log('💾 Creating problem in database...');

        const newProblem = await Problem.create({
            title,
            description,
            difficulty,
            tags,
            visibleTestCases,
            hiddenTestCases,
            startCode,
            referenceSolution,
            functionSignature,
            problemCreator: req.result._id,
        });

        console.log('✅ Problem created with ID:', newProblem._id);

        res.status(201).json({
            success: true,
            message: "Problem created successfully",
            problem: newProblem
        });

    } catch (error) {
        console.error('\n❌ CREATE PROBLEM ERROR:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }

        if (error.response && error.response.status === 429) {
            return res.status(429).json({
                success: false,
                message: "Judge0 rate limit exceeded",
                details: error.response.data.message
            });
        }

        if (error.response && error.response.status === 400) {
            return res.status(500).json({
                success: false,
                message: "Judge0 rejected the code",
                details: error.response.data?.message || error.message,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
            details: error.response?.data?.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}


const updateProblem = async (req, res) => {
    const { id } = req.params;
    const { 
        title, 
        description, 
        difficulty, 
        tags, 
        visibleTestCases, 
        hiddenTestCases, 
        startCode, 
        referenceSolution,
        functionSignature  // ⚠️ MISSING in your code!
    } = req.body;

    try {
        console.log('\n🔄 ===== PROBLEM UPDATE DEBUG =====');
        console.log('Problem ID:', id);
        console.log('Title:', title);
        console.log('Difficulty:', difficulty);
        console.log('Visible Test Cases:', visibleTestCases?.length);
        console.log('Hidden Test Cases:', hiddenTestCases?.length);
        console.log('Reference Solutions:', referenceSolution?.length);
        console.log('Function Signatures:', functionSignature?.length);

        if (!id) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing ID field" 
            });
        }

        const existingProblem = await Problem.findById(id);
        if (!existingProblem) {
            return res.status(404).json({ 
                success: false, 
                message: "Problem not found" 
            });
        }

        // ⚠️ CRITICAL: Validate each reference solution (same as createProblem)
        for (const { language, completeCode } of referenceSolution) {
            const languageId = getLanguageById(language);

            // ⚠️ MISSING: Function signature lookup!
            const functionSig = functionSignature?.find(
                sig => sig.language.toLowerCase() === language.toLowerCase()
            );
            
            if (!functionSig) {
                return res.status(400).json({
                    success: false,
                    message: `Function signature missing for ${language}`
                });
            }

            console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`🧪 TESTING ${language.toUpperCase()} REFERENCE SOLUTION`);
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            
            console.log('\n📝 Original Code:');
            console.log(completeCode);
            
            console.log('\n🔧 Function Signature:');
            console.log(functionSig.signature);

            // ⚠️ MISSING: Code wrapping!
            let wrappedCode;
            try {
                wrappedCode = wrapCode(
                    completeCode,
                    language,
                    functionSig.signature,
                    'auto',
                    'auto'
                );
                console.log('\n✅ Wrapped Code (first 500 chars):');
                console.log(wrappedCode.substring(0, 500) + '...');
            } catch (wrapError) {
                console.error('\n❌ CODE WRAPPING ERROR:', wrapError);
                return res.status(400).json({
                    success: false,
                    message: `Failed to wrap code for ${language}`,
                    details: wrapError.message,
                    stack: wrapError.stack
                });
            }

            console.log('\n📊 Testing Against Visible Test Cases:');
            
            const submissions = visibleTestCases.map((testcase, index) => {
                const processedInput = preprocessInput(testcase.input);
                
                console.log(`\n  Test Case ${index + 1}:`);
                console.log(`    Raw Input:       "${testcase.input}"`);
                console.log(`    Processed Input: "${processedInput}"`);
                console.log(`    Expected Output: "${testcase.output}"`);
                
                return {
                    source_code: wrappedCode,  // ⚠️ Use wrapped code!
                    language_id: languageId,
                    stdin: processedInput,
                };
            });

            console.log('\n⏳ Submitting to Judge0...');
            const submitResult = await submitBatch(submissions);

            if (!submitResult || submitResult.length === 0) {
                console.error('❌ Judge0 submission failed - no result returned');
                return res.status(500).json({
                    success: false,
                    message: "Judge0 submission failed"
                });
            }

            const resultToken = submitResult.map((value) => value.token);
            console.log(`✅ Submission tokens:`, resultToken);
            
            console.log('⏳ Waiting for results...');
            const testResult = await submitToken(resultToken);
            
            console.log(`\n📊 ${language} EXECUTION RESULTS:`);

            for (let i = 0; i < testResult.length; i++) {
                const test = testResult[i];
                const expectedOutput = visibleTestCases[i].output;
                
                console.log(`\n  ━━━ Test Case ${i + 1} ━━━`);
                console.log(`  Status ID:        ${test.status_id}`);
                console.log(`  Status:           ${test.status?.description || 'N/A'}`);
                console.log(`  Stdout:           "${test.stdout || ''}"`);
                console.log(`  Stderr:           "${test.stderr || ''}"`);
                console.log(`  Expected Output:  "${expectedOutput}"`);
                console.log(`  Execution Time:   ${test.time || 'N/A'}s`);
                console.log(`  Memory:           ${test.memory || 'N/A'} KB`);
                
                // Compilation Error
                if (test.status_id === 6) {
                    console.error(`\n  ❌ COMPILATION ERROR`);
                    console.error(`  Details:`, test.compile_output || test.stderr);
                    return res.status(400).json({
                        success: false,
                        message: `Compilation Error for ${language}`,
                        details: test.compile_output || test.stderr || "Compilation failed",
                        stderr: test.compile_output || test.stderr || "",
                        wrappedCode: wrappedCode,
                        testCaseIndex: i + 1,
                        input: visibleTestCases[i].input
                    });
                }
                
                // Runtime Error
                if (test.status_id === 5 || test.status_id === 11 || test.status_id === 12) {
                    console.error(`\n  ❌ RUNTIME ERROR`);
                    console.error(`  Details:`, test.stderr || test.status?.description);
                    return res.status(400).json({
                        success: false,
                        message: `Runtime Error for ${language}`,
                        details: test.status?.description || "Runtime Error",
                        stderr: test.stderr || "",
                        wrappedCode: wrappedCode,
                        testCaseIndex: i + 1,
                        input: visibleTestCases[i].input
                    });
                }
                
                // Compare outputs
                const comparison = compareOutputs(test.stdout, expectedOutput);
                
                console.log(`  ━━━ Output Comparison ━━━`);
                console.log(`  Raw Stdout:          "${test.stdout}"`);
                console.log(`  Raw Expected:        "${expectedOutput}"`);
                console.log(`  Formatted Stdout:    "${comparison.formattedActual}"`);
                console.log(`  Formatted Expected:  "${comparison.formattedExpected}"`);
                console.log(`  Normalized Stdout:   "${comparison.normalizedActual}"`);
                console.log(`  Normalized Expected: "${comparison.normalizedExpected}"`);
                console.log(`  Match:               ${comparison.match ? "✅ PASS" : "❌ FAIL"}`);
                
                if (!comparison.match) {
                    console.error(`\n  ❌ OUTPUT MISMATCH`);
                    return res.status(400).json({
                        success: false,
                        message: `Output mismatch for ${language}`,
                        details: "Wrong Answer",
                        testCaseIndex: i + 1,
                        input: visibleTestCases[i].input,
                        stdout: test.stdout || "",
                        expectedOutput: expectedOutput,
                        formattedActual: comparison.formattedActual,
                        formattedExpected: comparison.formattedExpected,
                        normalizedActual: comparison.normalizedActual,
                        normalizedExpected: comparison.normalizedExpected,
                        wrappedCode: wrappedCode
                    });
                }
                
                console.log(`  ✅ Test Case ${i + 1} PASSED`);
            }
            
            console.log(`\n✅ All test cases passed for ${language}!`);
        }

        console.log('\n🎉 All reference solutions validated successfully!');
        console.log('💾 Updating problem in database...');

        // ⚠️ IMPORTANT: Include functionSignature in update!
        const updatedProblem = await Problem.findByIdAndUpdate(
            id,
            {
                title,
                description,
                difficulty,
                tags,
                visibleTestCases,
                hiddenTestCases,
                startCode,
                referenceSolution,
                functionSignature  // ⚠️ MISSING in your code!
            },
            { runValidators: true, new: true }
        );

        console.log('✅ Problem updated with ID:', updatedProblem._id);

        res.status(200).json({
            success: true,
            message: "Problem updated successfully",
            problem: updatedProblem
        });

    } catch (error) {
        console.error('\n❌ UPDATE PROBLEM ERROR:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }

        if (error.response && error.response.status === 429) {
            return res.status(429).json({
                success: false,
                message: "Judge0 rate limit exceeded",
                details: error.response.data.message
            });
        }

        if (error.response && error.response.status === 400) {
            return res.status(500).json({
                success: false,
                message: "Judge0 rejected the code",
                details: error.response.data?.message || error.message,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
            details: error.response?.data?.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const deleteProblem = async(req,res) => {
    const {id} = req.params;
    try {
        if(!id){
            return res.status(400).send("Missing ID field");
        }
        const deletedProblem = await Problem.findByIdAndDelete(id);
        if(!deletedProblem){
            return res.status(404).send("Problem is missing");
        }
        res.status(200).send("Problem Deleted Successfully");
    } catch (err) {
        res.status(500).send("Error:"+err);
    }
}

const getProblemById = async(req,res)=>{
    const {id} = req.params;
    try {
        if(!id){
            return res.status(400).send("Missing ID field");
        }
        const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution hiddenTestCases');

        if(!getProblem){
            return res.status(404).send("Problem is missing");
        }
        
        const videos = await solutionVideo.findOne({problemId:id});

        if(videos){
            const responseData = {
                ...getProblem.toObject(),
                secureUrl:videos.secureUrl,
                thumbnailUrl:videos.thumbnailUrl,
                duration:videos.duration
            }
            return res.status(200).send(responseData);
        }
        
        return res.status(200).send(getProblem);
    } catch (error) {
        res.status(500).send("Error:"+error);
    }
}

const getAllProblem = async(req,res)=>{
    try {
        const getProblem = await Problem.find({}).select('_id title difficulty tags');
        if(getProblem.length==0){
            return res.status(404).send("Problem is missing");
        }
        res.status(200).send(getProblem);
    } catch (error) {
        res.status(500).send("Error:"+error);
    }
}

const solvedProblembyUser = async(req,res)=>{
    try {
        const userId = req.result._id;
        const user = await User.findById(userId).populate({
            path: 'problemSolved',
            select: '_id title difficulty tags'
        });
        res.status(200).send(user.problemSolved);
    } catch (error) {
        res.status(500).send("Error:"+error);
    }
};

const submittedProblem = async (req, res) => {
    try {
        const user = req.result;
        const pid = req.params.pid;

        if (!user || !user._id) {
            return res.status(401).send("Unauthorized");
        }

        if (!pid) {
            return res.status(400).send("Problem ID missing");
        }

        const userId = new mongoose.Types.ObjectId(user._id);
        const problemId = new mongoose.Types.ObjectId(pid);

        const ans = await Submission.find({ userId, problemId });

        if (ans.length === 0) {
            return res.status(200).json([]);
        }
        res.status(200).json(ans);
    } catch (error) {
        console.error("SUBMITTED PROBLEM ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

// ========================================
// 🔥 NEW FUNCTION: Get Problem Status
// ========================================
const getProblemStatus = async (req, res) => {
    try {
        const userId = req.result._id;
        const { problemId } = req.params;

        if (!problemId) {
            return res.status(400).json({ 
                success: false, 
                message: "Problem ID is required" 
            });
        }

        const user = req.result;
        
        // Initialize arrays if they don't exist (backward compatibility)
        const problemSolved = user.problemSolved || [];
        const problemsAttempted = user.problemsAttempted || [];
        
        let status = 'untouched';
        
        // Check if problem is solved
        const isSolved = problemSolved.some(id => id.toString() === problemId);
        
        if (isSolved) {
            status = 'solved';
        } else {
            // Check if problem is attempted
            const isAttempted = problemsAttempted.some(id => id.toString() === problemId);
            if (isAttempted) {
                status = 'attempted';
            }
        }

        console.log(`📊 Problem Status for user ${userId}: ${status}`);

        res.status(200).json({ 
            success: true,
            status 
        });
        
    } catch (error) {
        console.error('Error fetching problem status:', error);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error",
            error: error.message 
        });
    }
};

module.exports = {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getAllProblem,
    solvedProblembyUser,
    submittedProblem,
    getProblemStatus
};