const redisClient = require("../config/redis");
const User =  require("../models/user")
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submission");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");


// const register = async (req,res)=>{
    
//     try{
//         // validate the data;
//       validate(req.body); 
//       const {firstName, emailId, password}  = req.body;
//       // Check existing user
//       const existingUser = await User.findOne({ emailId });
//       if (existingUser) {
//         return res.status(400).send("Email already registered");
//       }

//       req.body.password = await bcrypt.hash(password, 10);
//       req.body.role = 'user';
    
//      const user =  await User.create(req.body);
//     //  const token =  jwt.sign({_id:user._id , emailId:emailId, role:'user'},process.env.JWT_KEY,{expiresIn: 60*60});
//      const reply = {
//             firstName: user.firstName,
//             emailId: user.emailId,
//             // _id: user._id,
//             // role:user.role,
//         }
//     //  res.cookie('token',token,{maxAge: 60*60*1000});
//      res.status(201).json({
//         user:reply,
//         message: "Registration successful. Please verify your email."
//     });
//     }
//     catch(err){
//         res.status(400).send("Error: "+err);
//     }
// }
const register = async (req, res) => {
  try {
        console.log("REGISTER BODY:", req.body); // 👈 ADD THIS

    validate(req.body);

    const { firstName, emailId, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).send("Email already registered");
    }

    // const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      firstName,
      emailId,
      password,
      role: "user",
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: Date.now() + 1000 * 60 * 60, // 1 hour
    });
    console.log("TOKEN STORED IN DB:", verificationToken);
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    // const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    await sendEmail({
      to: emailId,
      subject: "Verify your email",
      html: `
        <h2>Email Verification</h2>
        <p>Hello ${firstName},</p>
        <p>Click below to verify your email:</p>
        <a href="${verifyUrl}">Verify Email</a>
      `,
      text: `Verify your email: ${verifyUrl}`,
    });

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
    };

    res.status(201).json({
      message: "Registration successful. Please verify your email.",
      user:reply,
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });
    console.log("TOKEN FROM URL:", token);


    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification link",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    return res.status(200).json({
      message: "Email verified successfully. You can now login.",
    });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

//resend verify-email
const resendVerification = async (req, res) => {
  try {
    const { emailId } = req.body;

    if (!emailId) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ emailId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.emailVerificationToken = token;
    user.emailVerificationExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    const verifyUrl = `${process.env.FRONTEND_URL}/user/verify-email/${token}`;
    // const verifyUrl = `${process.env.CLIENT_URL}/user/verify-email/${token}`;

    await sendEmail({
      to: emailId,
      subject: "Verify your email",
      html: `
        <h2>Resended Email Verification</h2>
        <p>Click below to verify your email:</p>
        <a href="${verifyUrl}">Verify Email</a>
      `,
      text: `Verify your email: ${verifyUrl}`,
    });
        // ✅ ONLY ONE RESPONSE
    return res.status(200).json({
      message: "Verification email resent",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const login = async (req,res)=>{

    try{
        const {emailId, password} = req.body;
        console.log("LOGIN EMAIL:", emailId);

        if(!emailId)
            throw new Error("Invalid Credentials");
        if(!password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({emailId});
        console.log("LOGIN EMAIL:", emailId);
        console.log("USER FOUND:", !!user);

        if (!user)
            throw new Error("Invalid Credentials");

            console.log("IS EMAIL VERIFIED:", user.isEmailVerified);

        if (!user.isEmailVerified) {
          return res.status(403).json({
            message: "Please verify your email first",
          });
        }

        const match = await bcrypt.compare(password,user.password);

        if(!match)
            throw new Error("Invalid Credentials");

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
            profilePic: user.profilePic, // <--- YE LINE HONI CHAHIYE
        }
        const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
        res.cookie('token',token,{httpOnly:true,secure:true,maxAge: 60*60*1000,sameSite:'none'});
        //frontend ko bhej rahe hai ye data json ki help se
        res.status(201).json({
            user:reply,
             message:"Login Successful"
        });
    }
    catch(err){
        res.status(401).send("Error: "+err);
    }
}

//forget password


const forgotPassword = async (req, res) => {
  const { emailId } = req.body;

  const user = await User.findOne({ emailId });
if (!user) {
  console.log("❌ No user found for email:", emailId);
  return res.json({
    message: "If the email exists, a reset link has been sent",
  });
}

  // Generate token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token before saving
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
  await user.save();
const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

  // const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
console.log("📧 Sending reset email to:", user.emailId);

await sendEmail({
  to: user.emailId,
  subject: "Reset your password",
  text: `Click to reset password: ${resetUrl}`,
  // html optional
});


  res.json({ message: "Reset link sent to email" });
};

// Reset Password
const resetPassword = async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
   if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
console.log("RAW token from URL:", token);

const hashedToken = crypto
  .createHash("sha256")
  .update(token)
  .digest("hex");

console.log("HASHED token:", hashedToken);
console.log("Current time:", Date.now());
const anyUser = await User.findOne({});
console.log("DB token:", anyUser?.resetPasswordToken);
console.log("DB expiry:", anyUser?.resetPasswordExpires);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  // 🔐 hash new password
user.password = password; // pre-save hook will hash it
  // 🔑 Replace old password
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.json({ message: "Password reset successful" });
};


// logOut feature

const logout = async(req,res)=>{

    try{
        const {token} = req.cookies;
        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`,'Blocked');
        await redisClient.expireAt(`token:${token}`,payload.exp);
    //    Token add kar dung Redis ke blockList
    //    Cookies ko clear kar dena.....

    res.cookie("token",null,{expires: new Date(Date.now())});
    res.send("Logged Out Succesfully");

    }
    catch(err){
       res.status(503).send("Error: "+err);
    }
}


const adminRegister = async(req,res)=>{
    try{
        // validate the data;
    //   if(req.result.role!='admin')
    //     throw new Error("Invalid Credentials");  
      validate(req.body); 
      const {firstName, emailId, password}  = req.body;

      req.body.password = await bcrypt.hash(password, 10);
    //
    
     const user =  await User.create(req.body);
     const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
     res.cookie('token',token,{maxAge: 60*60*1000});
     res.status(201).send("User Registered Successfully");
    }
    catch(err){
        res.status(400).send("Error: "+err);
    }
}


const deleteProfile = async(req,res)=>{
    try {
        const userId = req.result._id;
        //userschema delete
        await User.findByIdAndDelete(userId);
        //submission bhi delete karo
        await Submission.deleteMany({userId});
        res.status(200).send("Profile Deleted Successfully");

    } catch (error) {
        res.status(500).send("Error: "+err);
    }
};

module.exports = {register, login,logout,adminRegister,deleteProfile,verifyEmail,resendVerification,forgotPassword,resetPassword};