const express = require('express')
const authRouter = express.Router();
const {register,login,logout,adminRegister,deleteProfile,verifyEmail,resendVerification,forgotPassword,resetPassword,  checkVerificationStatus} = require('../controllers/userAuthent');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { generateAvatarSignature, updateProfilePic } = require('../controllers/userPic');

console.log("authRouter loaded");

//Register
authRouter.post('/register',register);


// Email Verify
authRouter.get('/verify-email/:token', verifyEmail);

// resendEmail-Verify
authRouter.post('/resend-verification',resendVerification);

//login
authRouter.post('/login',login);

//forgot password
authRouter.post("/forgot-password", forgotPassword)

//Reset Password
authRouter.post('/reset-password/:token',resetPassword);

//logout
authRouter.post('/logout',userMiddleware,logout);

//admin
authRouter.post('/admin/register',adminMiddleware,adminRegister);

//delete profile
authRouter.delete('/deleteProfile',userMiddleware,deleteProfile);
authRouter.get('/check', userMiddleware, (req, res) => {
    const reply ={
        firstName: req.result.firstName,
        emailId: req.result.emailId,
        _id: req.result._id,
        role: req.result.role,
        profilePic: req.result.profilePic, // <--- YE LINE HONI CHAHIYE
    }
    res.status(200).json({
        user: reply,
        message: "Valid User",
    });
  });
//GetProfile
;

authRouter.post('/check-verification-status', checkVerificationStatus);
authRouter.get('/avatar-signature', userMiddleware, generateAvatarSignature);
authRouter.post('/update-avatar', userMiddleware, updateProfilePic);
// authRouter.get('/getProfile',getProfile);

module.exports = authRouter;