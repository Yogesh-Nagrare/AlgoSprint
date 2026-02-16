const express = require('express');
const userMiddleware = require('../middleware/userMiddleware');
const submitRouter = express.Router();
const rateLimiter = require('../middleware/rateLimiter');
const {submitCode,runCode,checkQuota} = require('../controllers/userSubmission');
// 1 run allowed per day
const runLimit = rateLimiter({
    prefix: 'run',
    limit: 1
});

// 1 submission allowed per day
const submitLimit = rateLimiter({
    prefix: 'submit',
    limit: 1
});
 submitRouter.post("/submit/:id", userMiddleware,submitLimit, submitCode);
 submitRouter.post("/run/:id", userMiddleware,runLimit, runCode);
 submitRouter.get("/quota/:id", userMiddleware, checkQuota); // New endpoint

 module.exports = submitRouter;