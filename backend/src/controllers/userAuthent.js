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
    validate(req.body);

    const { firstName, emailId, password } = req.body;

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      firstName,
      emailId,
      password,
      role: "user",
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: Date.now() + 1000 * 60 * 60,
    });

    console.log("✅ User created:", user._id);

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
    };

    // Send response IMMEDIATELY, don't wait for email
    res.status(201).json({
      message: "Registration successful. Please check your email for verification.",
      user: reply,
    });

    // Send email AFTER response (fire and forget)
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    // const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    sendEmail({
      to: emailId,
      subject: "Verify your email",
      html: `
       <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">AlgoSprint</h1>
                      <p style="margin: 10px 0 0 0; color: #fff; font-size: 14px;">Verify Your Email Address</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px;">Hello ${firstName}! 👋</h2>
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        Thank you for signing up for AlgoSprint! We're excited to have you on board.
                      </p>
                      <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        To complete your registration and start solving algorithms, please verify your email address by clicking the button below:
                      </p>
                      
                      <!-- Button -->
                      <table role="presentation" style="margin: 0 auto;">
                        <tr>
                          <td style="border-radius: 8px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);">
                            <a href="${verifyUrl}" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                        If the button doesn't work, copy and paste this link into your browser:
                      </p>
                      <p style="margin: 10px 0 0 0; color: #f97316; font-size: 14px; word-break: break-all;">
                        ${verifyUrl}
                      </p>
                      
                      <p style="margin: 30px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                        This verification link will expire in 1 hour.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px; text-align: center;">
                        This email was sent from AlgoSprint because you created an account.
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                        If you didn't create this account, please ignore this email.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `Hello ${firstName}!\n\nThank you for signing up for AlgoSprint. Please verify your email by clicking this link:\n\n${verifyUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't create this account, please ignore this email.\n\nBest regards,\nThe AlgoSprint Team`,
    }).catch(emailError => {
      console.error("⚠️ Email sending failed:", emailError.message);
      // Optionally: Store failed email attempts in DB for retry later
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    return res.status(400).json({ 
      message: err.message || "Registration failed" 
    });
  }
};
const  verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

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

    const verifyUrl = `${process.env.CLIENT_URL}/user/verify-email/${token}`;
    // const verifyUrl = `${process.env.FRONTEND_URL}/user/verify-email/${token}`;

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
  try {
    const { emailId } = req.body;

    console.log("📧 Forgot password request for:", emailId);

    if (!emailId) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ emailId });

    if (!user) {
      console.log("❌ No user found for email:", emailId);
      // Don't reveal if user exists or not (security)
      return res.json({
        message: "If the email exists, a reset link has been sent",
      });
    }

    // ✅ Generate PLAIN token (no hashing)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // ✅ Save PLAIN token (consistent with email verification)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    console.log("✅ Reset token saved for user:", user._id);

    // ✅ Use FRONTEND_URL for production
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    // const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    console.log("📧 Sending reset email to:", user.emailId);
    console.log("🔗 Reset URL:", resetUrl);

    // Send email asynchronously
    sendEmail({
      to: user.emailId,
      subject: "Reset your AlgoSprint password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  
                  <tr>
                    <td style="padding: 40px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">AlgoSprint</h1>
                      <p style="margin: 10px 0 0 0; color: #fff; font-size: 14px;">Password Reset Request</p>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px;">Hi ${user.firstName},</h2>
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password for your AlgoSprint account.
                      </p>
                      <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        Click the button below to choose a new password:
                      </p>
                      
                      <table role="presentation" style="margin: 0 auto;">
                        <tr>
                          <td style="border-radius: 8px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);">
                            <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                        If the button doesn't work, copy and paste this link into your browser:
                      </p>
                      <p style="margin: 10px 0 0 0; color: #f97316; font-size: 14px; word-break: break-all;">
                        ${resetUrl}
                      </p>
                      
                      <p style="margin: 30px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                        This link will expire in 15 minutes.
                      </p>
                      <p style="margin: 10px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                        If you didn't request this, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                        — The AlgoSprint Team
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `Hi ${user.firstName},\n\nWe received a request to reset your password.\n\nClick this link to reset your password:\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request this, you can safely ignore this email.\n\n— The AlgoSprint Team`,
    }).catch((emailError) => {
      console.error("⚠️ Email sending failed:", emailError.message);
    });

    return res.json({
      message: "If the email exists, a reset link has been sent",
    });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    return res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};

// ✅ FIXED RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    console.log("🔐 Reset password attempt");

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    // ✅ Find user with PLAIN token (no hashing)
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log("❌ Invalid or expired token");
      return res.status(400).json({
        message: "Invalid or expired reset link",
      });
    }

    console.log("Valid token found for user:", user._id);

    // Update password (pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    console.log("✅ Password reset successful for user:", user._id);

    return res.json({
      message: "Password reset successful. You can now login.",
    });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    return res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
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