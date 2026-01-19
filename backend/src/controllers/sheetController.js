const Sheet = require("../models/sheet");
const User = require("../models/user");
const Problem = require("../models/problem");

// Get all sheets (for homepage display)
const getAllSheets = async (req, res) => {
    try {
        const sheets = await Sheet.find()
            .select('_id title slug description topics')
            .lean();
        
        const sheetsWithCounts = sheets.map(sheet => {
            let totalProblems = 0;
            if (sheet.topics) {
                sheet.topics.forEach(topic => {
                    if (topic.subtopics) {
                        topic.subtopics.forEach(sub => {
                            totalProblems += sub.problems?.length || 0;
                        });
                    }
                });
            }
            return {
                _id: sheet._id,
                title: sheet.title,
                slug: sheet.slug,
                description: sheet.description,
                totalProblems
            };
        });
        
        res.status(200).json(sheetsWithCounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a specific sheet by ID with User Progress and Merged Links
const getSheetBySlug = async (req, res) => {
    try {
        const { sheetId } = req.params;
        const userId = req.result._id;

        const sheet = await Sheet.findById(sheetId);
        if (!sheet) return res.status(404).json({ message: "Sheet not found" });

        let totalSheetProblems = 0;
        let solvedSheetProblems = 0;

        const topics = await Promise.all(sheet.topics.map(async (topic) => {
            let topicTotal = 0;
            let topicSolved = 0;

            const subtopics = await Promise.all(topic.subtopics.map(async (sub) => {
                let subTotal = 0;
                let subSolved = 0;

                const transformedProblems = await Promise.all(sub.problems.map(async (prob) => {
                    subTotal++;
                    topicTotal++;
                    totalSheetProblems++;

                    const isSolved = (prob.solvedBy || []).some(id => id.toString() === userId.toString());
                    
                    if (isSolved) {
                        subSolved++;
                        topicSolved++;
                        solvedSheetProblems++;
                    }

                    if (prob.type === 'internal') {
                        const problemData = await Problem.findById(prob.problemId).select('_id title difficulty leetcodeLink gfgLink interviewbitLink').lean();
                        if (!problemData) return null;

                        return {
                            type: 'internal',
                            _id: prob._id,
                            globalProblemId: problemData._id,
                            title: problemData.title,
                            difficulty: prob.difficulty || problemData.difficulty, // Priority: Sheet override > Global
                            isSolved,
                            externalLinks: { 
                                // Priority: Sheet-level specific links > Fallback to global Problem DB links
                                leetcode: prob.leetcodeLink || problemData.leetcodeLink, 
                                gfg: prob.gfgLink || problemData.gfgLink, 
                                interviewbit: prob.interviewbitLink || problemData.interviewbitLink 
                            }
                        };
                    } else {
                        return {
                            type: 'external',
                            _id: prob._id,
                            title: prob.title,
                            link: prob.link,
                            difficulty: prob.difficulty,
                            platform: prob.platform,
                            isSolved
                        };
                    }
                }));

                return {
                    _id: sub._id,
                    title: sub.title,
                    problems: transformedProblems.filter(p => p !== null),
                    totalCount: subTotal,
                    solvedCount: subSolved
                };
            }));

            return { _id: topic._id, title: topic.title, subtopics, totalCount: topicTotal, solvedCount: topicSolved };
        }));

        res.status(200).json({
            _id: sheet._id, 
            title: sheet.title, 
            slug: sheet.slug, 
            description: sheet.description, 
            totalProblems: totalSheetProblems, 
            solvedCount: solvedSheetProblems, 
            topics 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const markProblemSolved = async (req, res) => {
    try {
        const { problemId } = req.body; 
        const userId = req.result._id;

        const result = await Sheet.findOneAndUpdate(
            { "topics.subtopics.problems._id": problemId },
            { $addToSet: { "topics.$[].subtopics.$[].problems.$[prob].solvedBy": userId } },
            { arrayFilters: [{ "prob._id": problemId }], new: true }
        );

        if (!result) return res.status(404).json({ message: "Problem not found in sheet" });
        res.status(200).json({ message: 'Problem marked as solved in sheet', problemId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const unmarkProblemSolved = async (req, res) => {
    try {
        const { problemId } = req.body;
        const userId = req.result._id;

        await Sheet.findOneAndUpdate(
            { "topics.subtopics.problems._id": problemId },
            { $pull: { "topics.$[].subtopics.$[].problems.$[prob].solvedBy": userId } },
            { arrayFilters: [{ "prob._id": problemId }], new: true }
        );

        res.status(200).json({ message: 'Problem unmarked in sheet', problemId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Create Sheet
const createSheet = async (req, res) => {
    try {
        const transformedData = {
            ...req.body,
            topics: req.body.topics.map(topic => ({
                ...topic,
                subtopics: topic.subtopics.map(sub => ({
                    ...sub,
                    problems: sub.problems.map(prob => ({
                        type: prob.type || 'internal',
                        problemId: prob.type === 'internal' ? (prob.problemId || prob) : undefined,
                        title: prob.title,
                        link: prob.link,
                        leetcodeLink: prob.leetcodeLink,
                        gfgLink: prob.gfgLink,
                        interviewbitLink: prob.interviewbitLink,
                        difficulty: prob.difficulty,
                        platform: prob.platform
                    }))
                }))
            }))
        };

        const newSheet = await Sheet.create(transformedData);
        res.status(201).json(newSheet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Update Sheet
const updateSheet = async (req, res) => {
    try {
        const { sheetId } = req.params;
        const sheet = await Sheet.findById(sheetId);
        if (!sheet) return res.status(404).json({ message: "Sheet not found" });

        const transformedData = {
            ...req.body,
            topics: req.body.topics.map(topic => ({
                ...topic,
                subtopics: topic.subtopics.map(sub => ({
                    ...sub,
                    problems: sub.problems.map(prob => ({
                        type: prob.type,
                        problemId: prob.type === 'internal' ? prob.problemId : undefined,
                        title: prob.title,
                        link: prob.link,
                        leetcodeLink: prob.leetcodeLink,
                        gfgLink: prob.gfgLink,
                        interviewbitLink: prob.interviewbitLink,
                        difficulty: prob.difficulty,
                        platform: prob.platform,
                        solvedBy: prob.solvedBy || [] // Preserve user progress during admin updates
                    }))
                }))
            }))
        };

        const updatedSheet = await Sheet.findByIdAndUpdate(
            sheetId,
            transformedData,
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: 'Sheet updated successfully', sheet: updatedSheet });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteSheet = async (req, res) => {
    try {
        const { sheetId } = req.params;
        const sheet = await Sheet.findByIdAndDelete(sheetId);
        if (!sheet) return res.status(404).json({ message: "Sheet not found" });
        res.status(200).json({ message: 'Sheet deleted successfully', sheetId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    getAllSheets, 
    getSheetBySlug, 
    createSheet,
    updateSheet,
    deleteSheet,
    markProblemSolved,
    unmarkProblemSolved
};