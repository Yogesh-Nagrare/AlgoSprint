const cloudinary = require('cloudinary').v2;
const User = require("../models/user");

// Configuration (Use your existing env vars)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 1. Generate Signature for Avatar Upload
const generateAvatarSignature = async (req, res) => {
  try {
    const userId = req.result._id;
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Specific folder for profile pictures
    const publicId = `leetcode-avatars/${userId}_${timestamp}`;
    
    const uploadParams = {
      timestamp: timestamp,
      public_id: publicId,
    //   folder: 'avatars'
    };

    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate upload credentials' });
  }
};

// 2. Save/Update Profile Picture Metadata
const updateProfilePic = async (req, res) => {
  try {
    const { cloudinaryPublicId, secureUrl } = req.body;
    const userId = req.result._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // OPTIONAL: Delete the OLD profile pic from Cloudinary to save space
    if (user.profilePicPublicId) {
      await cloudinary.uploader.destroy(user.profilePicPublicId);
    }

    // Update User record
    user.profilePic = secureUrl;
    user.profilePicPublicId = cloudinaryPublicId;
    await user.save();

    res.status(200).json({
      message: 'Profile picture updated',
      profilePic: user.profilePic
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile picture' });
  }
};

module.exports = { generateAvatarSignature, updateProfilePic };