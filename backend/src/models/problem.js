const mongoose = require('mongoose');
const {Schema} = mongoose;

const problemSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    difficulty:{
        type:String,
        enum:['easy','medium','hard'],
        required:true,
    },
tags: {
    type: String,
    enum: ['array','linkedList','graph','Sliding Window','Greedy Algorithm','Binary Search','Tree','Backtracking','Sorting','Recursion','Hash Table','Stack','Queue','Heap','Bit Manipulation','Math','Two Pointers','Graph Traversal','Trie','Union Find','Segment Tree','Matrix','String','Binary Tree','Depth-First Search','Breadth-First Search'
    ],
    required: true
},
    visibleTestCases:[
        {
            input:{
                type:String,
                required:true,
            },
            output:{
                type:String,
                required:true,
            },
            explanation:{
                type:String,
                required:true
            }
        }
    ],
    hiddenTestCases:[
        {
            input:{
                type:String,
                required:true,
            },
            output:{
                type:String,
                required:true,
            }
        }
    ],
    
    // NEW: Store function signature for each language
    functionSignature: [
        {
            language: {
                type: String,
                required: true,
            },
            signature: {
                type: String,
                required: true,
                // Example: "void rotate(vector<int>& nums, int k)"
            }
        }
    ],
    
    startCode: [
        {
            language:{
                type:String,
                required:true,
            },
            initialCode:{
                type:String,
                required:true
                // Now stores LeetCode-style class template
            }
        }
    ],
    referenceSolution:[
        {       
            language:{
                type:String,
                required:true,      
            },
            completeCode:{
                type:String,
                required:true
                // Now stores LeetCode-style class solution
            }
        }
    ],
    problemCreator:{
        type: Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    leetcodeLink: { type: String, default: null },
    gfgLink: { type: String, default: null },
    interviewbitLink: { type: String, default: null }
})

const Problem = mongoose.model('problem',problemSchema);

module.exports = Problem;