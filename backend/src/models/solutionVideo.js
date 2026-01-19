const mongoose = require('mongoose');
const {Schema} = mongoose;


// Video ke paas kya kya hona chahiye?
// - kis problem ka solution hai
// - kis user ne upload kiya
// - video ka URL
// - duration

const videoSchema = new Schema({
    // kis problem ka solution hai
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'problem',
        required: true
    },
    // kis user ne upload kiya
    userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
   },
   cloudinaryPublicId: {
    type: String,
    required: true,
    unique: true
  },
  // Video ka actual playable URL
  secureUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  duration: {
    type: Number,
    required: true
  },
},{
    timestamps:true
});



const SolutionVideo = mongoose.model("solutionVideo",videoSchema);

module.exports = SolutionVideo;
