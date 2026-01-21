const jwt = require('jsonwebtoken');

// ------------------------------------
// Helpers
// ------------------------------------

const getFrontendUrl = () => {
  return process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : process.env.CLIENT_URL;
};

const generateToken = (user) => {
  return jwt.sign(
    { 
      _id: user._id,
      emailId: user.emailId,
      role: user.role
    },
    process.env.JWT_KEY,
    { expiresIn: '7d' }
  );
};

const setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

// ------------------------------------
// Google User Callback
// ------------------------------------

const googleUserCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(
        `${getFrontendUrl()}/login?error=auth_failed`
      );
    }

    const token = generateToken(req.user);
    setTokenCookie(res, token);

    // ✅ Redirect to dashboard / home
    return res.redirect(getFrontendUrl());

  } catch (error) {
    console.error('❌ Google user callback error:', error);
    return res.redirect(
      `${getFrontendUrl()}/login?error=server_error`
    );
  }
};

// ------------------------------------
// Google Admin Callback
// ------------------------------------

const googleAdminCallback = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.redirect(
        `${getFrontendUrl()}/admin/login?error=unauthorized`
      );
    }

    const token = generateToken(req.user);
    setTokenCookie(res, token);

    return res.redirect(
      `${getFrontendUrl()}/admin/dashboard`
    );

  } catch (error) {
    console.error('❌ Google admin callback error:', error);
    return res.redirect(
      `${getFrontendUrl()}/admin/login?error=server_error`
    );
  }
};

// ------------------------------------
// Google Auth Failure
// ------------------------------------

const googleAuthFailure = (req, res) => {
  const isAdmin = req.originalUrl.includes('admin');

  const redirectPath = isAdmin
    ? '/admin/login?error=google_auth_failed'
    : '/login?error=google_auth_failed';

  return res.redirect(`${getFrontendUrl()}${redirectPath}`);
};

module.exports = {
  googleUserCallback,
  googleAdminCallback,
  googleAuthFailure,
};
