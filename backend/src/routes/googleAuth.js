// ============================================
// STEP 5: CREATE GOOGLE AUTH ROUTES
// File: routes/googleAuth.js
// ============================================

const express = require('express');
const router = express.Router();
const passport = require('passport');
const googleAuthController = require('../controllers/googleAuthJWT');

// ============================================
// USER GOOGLE AUTHENTICATION ROUTES
// ============================================

// @route   GET /auth/google/user
// @desc    Initiate Google OAuth for users
// @access  Public
router.get('/google/user',
  passport.authenticate('google-user', { 
    scope: ['profile', 'email'],
    session: false
  })
);

// @route   GET /auth/google/user/callback
// @desc    Google OAuth callback for users
// @access  Public
router.get('/google/student/callback',
  passport.authenticate('google-user', { 
    failureRedirect: '/auth/google/user/failure',
    session: false
  }),
  googleAuthController.googleUserCallback
);

// @route   GET /auth/google/user/failure
// @desc    Handle Google OAuth failure for users
// @access  Public
router.get('/google/user/failure',
  googleAuthController.googleAuthFailure
);

// ============================================
// ADMIN GOOGLE AUTHENTICATION ROUTES
// ============================================

// @route   GET /auth/google/admin
// @desc    Initiate Google OAuth for admins
// @access  Public
router.get('/google/admin',
  passport.authenticate('google-admin', { 
    scope: ['profile', 'email'],
    session: false
  })
);

// @route   GET /auth/google/admin/callback
// @desc    Google OAuth callback for admins
// @access  Public
router.get('/google/admin/callback',
  passport.authenticate('google-admin', { 
    failureRedirect: '/auth/google/admin/failure',
    session: false
  }),
  googleAuthController.googleAdminCallback
);

// @route   GET /auth/google/admin/failure
// @desc    Handle Google OAuth failure for admins
// @access  Public
router.get('/google/admin/failure',
  googleAuthController.googleAuthFailure
);

module.exports = router;
