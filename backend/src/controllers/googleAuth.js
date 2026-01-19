const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      _id: user._id, 
      emailId: user.emailId, 
      role: user.role 
    },
    process.env.JWT_KEY,
    { expiresIn: '1h' }
  );
};

// Helper function to prepare user data
const prepareUserData = (user) => {
  return {
    _id: user._id,
    firstName: user.firstName,
    emailId: user.emailId,
    role: user.role,
    profilePic: user.profilePic
  };
};

// ============================================
// GOOGLE USER AUTHENTICATION CALLBACK
// ============================================
const googleUserCallback = (req, res) => {
  try {
    console.log('📱 Processing Google User callback');
    
    if (!req.user) {
      console.log('❌ No user in request');
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }

    // Generate JWT token
    const token = generateToken(req.user);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    // Prepare user data for frontend
    const userData = prepareUserData(req.user);
    const encodedUserData = encodeURIComponent(JSON.stringify(userData));

    // Redirect to frontend
    const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${encodedUserData}&type=user`;
    
    console.log('✅ User authentication successful, redirecting to frontend');
    res.redirect(redirectUrl);

  } catch (err) {
    console.error('❌ Google user callback error:', err);
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
};

// ============================================
// GOOGLE ADMIN AUTHENTICATION CALLBACK
// ============================================
const googleAdminCallback = (req, res) => {
  try {
    console.log('🔐 Processing Google Admin callback');
    
    if (!req.user) {
      console.log('❌ No admin in request');
      return res.redirect(`${process.env.CLIENT_URL}/admin/login?error=auth_failed`);
    }

    // Verify admin role (extra security check)
    if (req.user.role !== 'admin') {
      console.log('❌ User is not an admin');
      return res.redirect(`${process.env.CLIENT_URL}/admin/login?error=unauthorized`);
    }

    // Generate JWT token
    const token = generateToken(req.user);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    // Prepare admin data for frontend
    const adminData = prepareUserData(req.user);
    const encodedAdminData = encodeURIComponent(JSON.stringify(adminData));

    // Redirect to admin frontend
    const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${encodedAdminData}&type=admin`;
    
    console.log('✅ Admin authentication successful, redirecting to frontend');
    res.redirect(redirectUrl);

  } catch (err) {
    console.error('❌ Google admin callback error:', err);
    res.redirect(`${process.env.CLIENT_URL}/admin/login?error=auth_failed`);
  }
};

// ============================================
// HANDLE GOOGLE AUTH FAILURES
// ============================================
const googleAuthFailure = (req, res) => {
  const userType = req.path.includes('admin') ? 'admin' : 'user';
  const redirectPath = userType === 'admin' ? '/admin/login' : '/login';
  
  console.log(`❌ Google ${userType} authentication failed`);
  res.redirect(`${process.env.CLIENT_URL}${redirectPath}?error=auth_failed`);
};

module.exports = {
  googleUserCallback,
  googleAdminCallback,
  googleAuthFailure
};
