const Problem = require("../models/problem");
const Submission = require("../models/submission");
const {getLanguageById,submitBatch,submitToken} = require("../utils/ProblemUtility");
const { preprocessInput } = require("../utils/InputParser");
const {  compareOutputs,convertExpectedOutputForJudge0} = require('../utils/OutputNormalizer');
const submitCode = async (req,res)=>{
    try{
       const userId = req.result._id;
       const problemId = req.params.id;
       let {code,language} = req.body;

      if(!userId||!code||!problemId||!language)
        return res.status(400).send("Some field missing");
      
      if(language==='cpp')
        language='c++'

       const problem =  await Problem.findById(problemId);

       const submittedResult = await Submission.create({
          userId,
          problemId,
          code,
          language,
          status:'pending',
          testCasesTotal:problem.hiddenTestCases.length
        })

    const languageId = getLanguageById(language);

    // ✅ Remove expected_output - just run the code
    const submissions = problem.hiddenTestCases.map((testcase)=>({
        source_code:code,
        language_id: languageId,
        stdin: preprocessInput(testcase.input)
        // No expected_output!
    }));

    const submitResult = await submitBatch(submissions);
    const resultToken = submitResult.map((value)=> value.token);
    const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'accepted';
    let errorMessage = null;

    for(let i = 0; i < testResult.length; i++){
        const test = testResult[i];
        
        // Check for compilation/runtime errors
        if(test.status_id === 6){
            status = 'error';
            errorMessage = test.compile_output || test.stderr;
            break;
        } else if(test.status_id === 5 || test.status_id === 11 || test.status_id === 12){
            status = 'error';
            errorMessage = test.stderr;
            break;
        } else if(test.status_id !== 3) {
            // Some other error
            status = 'error';
            errorMessage = test.status?.description || 'Unknown error';
            break;
        }
        
        // ✅ Do manual comparison
        const expectedOutput = problem.hiddenTestCases[i].output;
        const actualOutput = test.stdout;
        
        const comparison = compareOutputs(actualOutput, expectedOutput);
        
        if(comparison.match){
            testCasesPassed++;
            runtime = runtime + parseFloat(test.time || 0);
            memory = Math.max(memory, test.memory || 0);
        } else {
            status = 'wrong';
            errorMessage = `Test case ${i + 1} failed`;
            break;
        }
    }

    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;

    await submittedResult.save();

    if(status === 'accepted' && !req.result.problemSolved.includes(problemId)){
        req.result.problemSolved.push(problemId);
        await req.result.save();
    }
      
    const accepted = (status === 'accepted');
    res.status(201).json({
        accepted,
        totalTestCases: submittedResult.testCasesTotal,
        passedTestCases: testCasesPassed,
        runtime,
        memory,
        status
    });
    }
    catch(err){
        console.error("Submit Code Error:", err);
        res.status(500).send("Internal Server Error: " + err.message);
    }
}
const runCode = async (req,res)=>{
    try{
       const userId = req.result._id;
       const problemId = req.params.id;
       let {code,language} = req.body;

      if(!userId||!code||!problemId||!language)
        return res.status(400).send("Some field missing");

      const problem = await Problem.findById(problemId);
      
      if(language==='cpp')
        language='c++'

      const languageId = getLanguageById(language);

      // ✅ No expected_output
      const submissions = problem.visibleTestCases.map((testcase)=>({
          source_code:code,
          language_id: languageId,
          stdin: preprocessInput(testcase.input)
      }));

      const submitResult = await submitBatch(submissions);
      const resultToken = submitResult.map((value)=> value.token);
      const testResult = await submitToken(resultToken);
      
      let testCasesPassed = 0;
      let runtime = 0;
      let memory = 0;
      let overallSuccess = true;

      const processedResults = testResult.map((test, i) => {
          const testcase = problem.visibleTestCases[i];
          
          let testStatus = 'failed';
          let testError = null;
          
          if(test.status_id === 6){
              testStatus = 'compilation_error';
              testError = test.compile_output || test.stderr;
              overallSuccess = false;
          } else if(test.status_id === 5 || test.status_id === 11 || test.status_id === 12){
              testStatus = 'runtime_error';
              testError = test.stderr;
              overallSuccess = false;
          } else if(test.status_id !== 3) {
              testStatus = 'error';
              testError = test.status?.description || 'Unknown error';
              overallSuccess = false;
          } else {
              // ✅ Manual comparison
              const comparison = compareOutputs(test.stdout, testcase.output);
              
              if(comparison.match){
                  testStatus = 'passed';
                  testCasesPassed++;
                  runtime = runtime + parseFloat(test.time || 0);
                  memory = Math.max(memory, test.memory || 0);
              } else {
                  testStatus = 'wrong_answer';
                  testError = 'Output does not match expected';
                  overallSuccess = false;
              }
          }
          
          return {
              status_id: test.status_id,
              stdin: testcase.input,
              stdout: test.stdout || '',
              expected_output: testcase.output,
              time: test.time,
              memory: test.memory,
              explanation: testcase.explanation,
              error: testError,
              testStatus: testStatus  // Add this for frontend
          };
      });

      res.status(201).json({
          success: overallSuccess,
          testCases: processedResults,
          testCasesPassed,
          totalTestCases: problem.visibleTestCases.length,
          runtime,
          memory
      });  
    }
    catch(err){
        console.error("Run Code Error:", err);
        res.status(500).send("Internal Server Error: " + err.message);
    }
};
module.exports = {submitCode,runCode};



//     language_id: 54,
//     stdin: '2 3',
//     expected_output: '5',
//     stdout: '5',
//     status_id: 3,
//     created_at: '2025-05-12T16:47:37.239Z',
//     finished_at: '2025-05-12T16:47:37.695Z',
//     time: '0.002',
//     memory: 904,
//     stderr: null,
//     token: '611405fa-4f31-44a6-99c8-6f407bc14e73',



// this all logic
// when run it is running but when submit then why give error like wrong answer for
// input:5  1 2 3 4 5
// output:2
// code:
// #include <iostream>
// using namespace std;
// int main() {
// int n;
// cin >> n;
// int countt = 0;
// for(int i = 0; i < n; i++){
// int x;
// cin >> x;
// if(x % 2 == 0) countt++;
// }
// cout << countt;
// return 0;
// }
// but working for new question
// input:nums = [4,2,5,7]
// output:[4,5,2,7]
// code:
// #include <bits/stdc++.h>
// using namespace std;
// int main(){
// int n;
// cin >> n;
// code
// Code
// vector<int> nums(n);
// for(int i = 0; i < n; i++)
//     cin >> nums[i];

// vector<int> result(n);
// int evenIdx = 0;
// int oddIdx = 1;

// for(int x : nums){
//     if(x % 2 == 0){
//         result[evenIdx] = x;
//         evenIdx += 2;
//     } else {
//         result[oddIdx] = x;
//         oddIdx += 2;
//     }
// }

// for(int i = 0; i < n; i++){
//     if(i > 0) cout << " ";
//     cout << result[i];
// }

// return 0;

// submit code logic use judge0 which is correct without judge0 validation code should not submit also run should work like but run using helper function and both of them should accept 2 instead [2] if given output is 2 as some question asked for example like return the length of arrray where only length will be return like 2
//  so it should work for both means if question say to return 2 or [2]