const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['internal', 'external'], 
        default: 'internal' 
    },
    // For internal problems
    problemId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Problem' 
    },
    // For external problems
    title: String,
    link: String,
    leetcodeLink: String, // Specific link for internal
    gfgLink: String,      // Specific link for internal
    interviewbitLink: String, // Specific link for internal
    difficulty: { 
        type: String, 
        enum: ['Easy', 'Medium', 'Hard'] 
    },
    platform: { 
        type: String, 
        enum: ['leetcode', 'gfg', 'codechef', 'codeforces', 'other'] 
    },
    // NEW FIELD: Store user references here
    solvedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }]
});

const subTopicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    problems: [problemSchema]
});

const topicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtopics: [subTopicSchema]
});

const sheetSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    topics: [topicSchema]
});

module.exports = mongoose.model("Sheet", sheetSchema);