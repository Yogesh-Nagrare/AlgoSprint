const mongoose = require('mongoose');
const {Schema} = mongoose;
const bcrypt = require('bcrypt')
const userSchema = new Schema({
    firstName:{
        type: String,
        required: true,
        minLength:3,
        maxLength:20
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:20,
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim: true,
        lowercase:true,
        immutable: true,
    },
    googleId: {
  type: String,
  sparse: true,
  unique: true
},
authProvider: {
  type: String,
  enum: ['local', 'google'],
  default: 'local'
},
    age:{
        type:Number,
        min:6,
        max:80,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default: 'user'
    },
    emailVerificationToken: {
        type: String,
    },
    emailVerificationExpires: {
        type: Date,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    // models/user.js
    profilePic: {
        type: String,
        default: ""
    },
    profilePicPublicId: {
        type: String,
        default: ""
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    problemSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'problem'
        }],
        unique:true
    },
    password:{
        type:String,
        required: function() {
        // Password is ONLY required if the authProvider is 'local'
        // or if there is no googleId
        return this.authProvider === 'local';
        }
    },
    // Inside your User Schema
// sheetSolvedProblems: [
//     { type: mongoose.Schema.Types.ObjectId }
// ]
},{
    timestamps:true
});


//findOneAndDelete method hit ki to ye code run hoga 
userSchema.post('findOneAndDelete', async function(userInfo) {
    if(userInfo){
        await mongoose.model('Submission').deleteMany({userId: userInfo._id});
    }
});

userSchema.pre('save', async function(next) {
  if (this.authProvider === 'google') {
    return next(); // Skip password hashing for Google users
  }
  
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});


const User = mongoose.model("user",userSchema);

module.exports = User;
