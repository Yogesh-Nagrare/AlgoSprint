const express = require('express');

const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const userMiddleware = require("../middleware/userMiddleware");
const {createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, solvedProblembyUser, submittedProblem} = require("../controllers/userProblem");
const {getAllSheets, getSheetBySlug, createSheet, updateSheet, deleteSheet, markProblemSolved, unmarkProblemSolved} = require("../controllers/sheetController");

// Problem Routes
// Create (admin only)
problemRouter.post("/create", adminMiddleware, createProblem);
// Update (admin only)
problemRouter.put("/update/:id", adminMiddleware, updateProblem);
// Delete (admin only)
problemRouter.delete("/delete/:id", adminMiddleware, deleteProblem);

// Fetch problems
problemRouter.get("/problemById/:id", userMiddleware, getProblemById);
problemRouter.get("/getAllProblem/", userMiddleware, getAllProblem);
problemRouter.get("/problemSolvedByUser", userMiddleware, solvedProblembyUser);
problemRouter.get("/submittedProblem/:pid", userMiddleware, submittedProblem);

// Sheet Routes
// User routes - fetch sheet data
problemRouter.get("/sheets/all", userMiddleware, getAllSheets);
problemRouter.get("/sheets/getById/:sheetId", userMiddleware, getSheetBySlug);

// User routes - mark problems as solved
problemRouter.post("/sheets/mark-solved", userMiddleware, markProblemSolved);
problemRouter.post("/sheets/unmark-solved", userMiddleware, unmarkProblemSolved);

// Admin routes - sheet management
problemRouter.post("/sheet/create", adminMiddleware, createSheet);
problemRouter.put("/sheet/update/:sheetId", adminMiddleware, updateSheet);
problemRouter.delete("/sheet/delete/:sheetId", adminMiddleware, deleteSheet);

module.exports = problemRouter;