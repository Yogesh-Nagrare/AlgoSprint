const express = require('express');
const userMiddleware = require('../middleware/userMiddleware');
const submitRouter = express.Router();
const rateLimiter = require('../middleware/rateLimiter');
const { submitCode, runCode, checkQuota } = require('../controllers/userSubmission');
const { getAICodeReview } = require('../controllers/aiReview'); // ✨ ADD THIS

// Rate limiters
const runLimit = rateLimiter({
    prefix: 'run',
    limit: 1
});

const submitLimit = rateLimiter({
    prefix: 'submit',
    limit: 1
});

// Main routes
submitRouter.post("/submit/:id", userMiddleware, submitLimit, submitCode);
submitRouter.post("/run/:id", userMiddleware, runLimit, runCode);
submitRouter.get("/quota/:id", userMiddleware, checkQuota);

// ✨ AI REVIEW ROUTE (NEW)
submitRouter.post("/ai-review/:id", userMiddleware, getAICodeReview);

module.exports = submitRouter;