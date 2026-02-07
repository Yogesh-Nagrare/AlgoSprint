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
    
    // ===== SOLVED PROBLEMS =====
    problemSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'problem'
        }],
        default: [] // Changed from unique:true (arrays can't be unique)
    },
    
    // ===== NEW: ATTEMPTED PROBLEMS (Failed Submissions) =====
    problemsAttempted:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'problem'
        }],
        default: []
    },
    
    password:{
        type:String,
        required: function() {
            return this.authProvider === 'local';
        }
    },
},{
    timestamps:true
});

userSchema.post('findOneAndDelete', async function(userInfo) {
    if(userInfo){
        await mongoose.model('Submission').deleteMany({userId: userInfo._id});
    }
});

userSchema.pre('save', async function(next) {
    if (this.authProvider === 'google') {
        return next();
    }
    
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = mongoose.model("user",userSchema);

module.exports = User;