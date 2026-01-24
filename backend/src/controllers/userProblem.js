const {getLanguageById,submitBatch,submitToken} = require("../utils/ProblemUtility");
const { preprocessInput } = require("../utils/InputParser");
const { compareOutputs,convertExpectedOutputForJudge0 } = require("../utils/OutputNormalizer");
const Problem = require("../models/problem");
const User = require("../models/user");
const mongoose = require("mongoose");
const Submission = require("../models/submission");
const solutionVideo = require('../models/solutionVideo');

const createProblem = async (req, res) => {
    const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution } = req.body;

    try {
        for (const { language, completeCode } of referenceSolution) {
            const languageId = getLanguageById(language);

            const submissions = visibleTestCases.map((testcase) => {
                const processedInput = preprocessInput(testcase.input);
                
                console.log(`\n=== ${language} Test Case ===`);
                console.log("Original Input:", testcase.input);
                console.log("Processed Input:", processedInput);
                console.log("Expected Output (original):", testcase.output);
                console.log("Expected Output (formatted):", convertExpectedOutputForJudge0(testcase.output));
                
                return {
                    source_code: completeCode,
                    language_id: languageId,
                    stdin: processedInput,
                    // expected_output: convertExpectedOutputForJudge0(testcase.output),  // ✅ Format here too

                };
            });

            const submitResult = await submitBatch(submissions);
            
            if (!submitResult || submitResult.length === 0) {
                return res.status(500).json({
                    success: false,
                    message: "Judge0 submission failed"
                });
            }
            
            const resultToken = submitResult.map((value) => value.token);
            const testResult = await submitToken(resultToken);
            
            console.log(`${language} Results:`, JSON.stringify(testResult, null, 2));

            for (let i = 0; i < testResult.length; i++) {
                const test = testResult[i];
                const expectedOutput = visibleTestCases[i].output;
                
                // Check for compilation/runtime errors first
                if (test.status_id === 6) {
                    return res.status(400).json({
                        success: false,
                        message: `Compilation Error for ${language}`,
                        details: "Compilation failed",
                        stderr: test.compile_output || test.stderr || "",
                    });
                }
                
                if (test.status_id === 5 || test.status_id === 11 || test.status_id === 12) {
                    return res.status(400).json({
                        success: false,
                        message: `Runtime Error for ${language}`,
                        details: test.status?.description || "Runtime Error",
                        stderr: test.stderr || "",
                    });
                }
                
                // Smart comparison with auto-formatting
                const comparison = compareOutputs(test.stdout, expectedOutput);
                
                console.log(`\n📊 Test ${i + 1} Comparison:`);
                console.log("  Raw Actual:       ", JSON.stringify(test.stdout));
                console.log("  Raw Expected:     ", JSON.stringify(expectedOutput));
                console.log("  Formatted Actual: ", comparison.formattedActual);
                console.log("  Formatted Expected:", comparison.formattedExpected);
                console.log("  Match:            ", comparison.match ? "✅" : "❌");
                
                // Verify output matches
                if (!comparison.match) {
                    return res.status(400).json({
                        success: false,
                        message: `Output mismatch for ${language}`,
                        details: "Wrong Answer",
                        stdout: test.stdout || "",
                        expectedOutput: expectedOutput,
                        formattedActual: comparison.formattedActual,
                        formattedExpected: comparison.formattedExpected
                    });
                }
            }
        }

        const newProblem = await Problem.create({
            title,
            description,
            difficulty,
            tags,
            visibleTestCases,
            hiddenTestCases,
            startCode,
            referenceSolution,
            problemCreator: req.result._id,
        });

        res.status(201).json({
            success: true,
            message: "Problem created successfully",
            problem: newProblem
        });

    } catch (error) {
        console.error("Create Problem Error:", error);

        if (error.response && error.response.status === 429) {
            return res.status(429).json({
                success: false,
                message: "Judge0 rate limit exceeded",
                details: error.response.data.message
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

const updateProblem = async (req, res) => {
    const { id } = req.params;
    const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution } = req.body;

    try {
        if (!id) {
            return res.status(400).json({ success: false, message: "Missing ID field" });
        }

        const existingProblem = await Problem.findById(id);
        if (!existingProblem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }

        for (const { language, completeCode } of referenceSolution) {
            const languageId = getLanguageById(language);

            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: preprocessInput(testcase.input),
                expected_output: convertExpectedOutputForJudge0(testcase.output),  // ✅ Format here too
            }));

            const submitResult = await submitBatch(submissions);

            if (!submitResult || submitResult.length === 0) {
                return res.status(500).json({
                    success: false,
                    message: "Judge0 submission failed"
                });
            }

            const resultToken = submitResult.map((value) => value.token);
            const testResult = await submitToken(resultToken);

            for (let i = 0; i < testResult.length; i++) {
                const test = testResult[i];
                const expectedOutput = visibleTestCases[i].output;
                
                if (test.status_id === 6) {
                    return res.status(400).json({
                        success: false,
                        message: `Compilation Error for ${language}`,
                        details: "Compilation failed",
                        stderr: test.compile_output || test.stderr || "",
                    });
                }
                
                if (test.status_id === 5 || test.status_id === 11 || test.status_id === 12) {
                    return res.status(400).json({
                        success: false,
                        message: `Runtime Error for ${language}`,
                        details: test.status?.description || "Runtime Error",
                        stderr: test.stderr || "",
                    });
                }
                
                const comparison = compareOutputs(test.stdout, expectedOutput);
                
                console.log(`\n📊 Test ${i + 1} Comparison:`);
                console.log("  Raw Actual:       ", JSON.stringify(test.stdout));
                console.log("  Formatted Actual: ", comparison.formattedActual);
                console.log("  Formatted Expected:", comparison.formattedExpected);
                console.log("  Match:            ", comparison.match ? "✅" : "❌");
                
                if (!comparison.match) {
                    return res.status(400).json({
                        success: false,
                        message: `Output mismatch for ${language}`,
                        details: "Wrong Answer",
                        stdout: test.stdout || "",
                        expectedOutput: expectedOutput
                    });
                }
            }
        }

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
                referenceSolution
            },
            { runValidators: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: "Problem updated successfully",
            problem: updatedProblem
        });

    } catch (error) {
        console.error("Update Problem Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

// ... rest of your functions remain the same

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

module.exports = {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getAllProblem,
    solvedProblembyUser,
    submittedProblem
};
// ```

// ---

// ## Key Changes:

// 1. **Removed `expected_output`** from Judge0 submissions - Judge0's comparison was too strict
// 2. **Added manual comparison** using `normalizeOutput()` - now `[1,3,2]` and `[1, 3, 2]` are treated as equal
// 3. **Better error handling** - distinguishes between compilation errors, runtime errors, and wrong answers
// 4. **Detailed logging** - shows exactly what's being compared

// ---

// ## Now Try Updating Your Problem

// After making these changes, check your **backend console** when you update the problem. You'll see output like:
// ```
// 📊 Test 1 Comparison:
//   Raw Actual:    "[1,3,2]"
//   Raw Expected:  "[1,3,2]"
//   Norm Actual:   "[1,3,2]"
//   Norm Expected: "[1,3,2]"
//   Match:         ✅