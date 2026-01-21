const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

// Serialize user for session
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// Deserialize user from session
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (err) {
//     done(err, null);
//   }
// });

// ============================================
// GOOGLE STRATEGY FOR REGULAR USERS
// ============================================
passport.use('google-user', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.STUDENT_CALLBACK
},
async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        console.log('🔍 Google User Login Attempt:', email);

        // Check if user already exists
        let user = await User.findOne({ 
          $or: [
            { googleId: profile.id },
            { emailId: email }
          ]
        });

        if (user) {
          console.log('✅ Existing user found');
          
          // If user exists with email but no googleId, link the account
          if (!user.googleId) {
            user.googleId = profile.id;
            user.authProvider = 'google';
            user.isEmailVerified = true;
            user.profilePic = user.profilePic || profile.photos[0]?.value;
            await user.save();
            console.log('🔗 Google account linked to existing user');
          }
          
          return done(null, user);
        }

        // Create new user
        console.log('➕ Creating new user');
        user = new User({
          googleId: profile.id,
          firstName: profile.name.givenName || profile.displayName.split(' ')[0],
          emailId: email,
          authProvider: 'google',
          role: 'user',
          isEmailVerified: true,
          profilePic: profile.photos[0]?.value
        });
        
        await user.save();
        console.log('✅ New user created successfully');
        return done(null, user);

    } catch (err) {
        console.error('❌ Google User Auth Error:', err);
        return done(err, null);
    }
}));

// ============================================
// GOOGLE STRATEGY FOR ADMINS
// ============================================
passport.use('google-admin', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.ADMIN_CALLBACK
},
async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        console.log('🔍 Google Admin Login Attempt:', email);
        
        // Optional: Restrict admin emails to specific domains
        const allowedAdminDomains = process.env.ADMIN_EMAIL_DOMAINS?.split(',') || [];
        if (allowedAdminDomains.length > 0) {
          const domain = email.split('@')[1];
          if (!allowedAdminDomains.includes(domain)) {
            console.log(`❌ Unauthorized domain: ${domain}`);
            return done(null, false, { message: 'Only authorized admin emails allowed' });
          }
        }

        // Check if admin exists
        let admin = await User.findOne({ 
          $or: [
            { googleId: profile.id },
            { emailId: email }
          ]
        });

        if (!admin) {
          console.log(`❌ Admin account not found for: ${email}`);
          return done(null, false, { 
            message: 'Admin account not found. Contact system administrator.' 
          });
        }

        // Verify the user has admin role
        if (admin.role !== 'admin') {
          console.log(`❌ Non-admin user attempted admin login: ${email}`);
          return done(null, false, { message: 'Unauthorized: Admin access required' });
        }

        // Link Google account if not already linked
        if (!admin.googleId) {
          admin.googleId = profile.id;
          admin.authProvider = 'google';
          admin.isEmailVerified = true;
          admin.profilePic = admin.profilePic || profile.photos[0]?.value;
          await admin.save();
          console.log('🔗 Google account linked to admin');
        }
        
        console.log('✅ Admin authenticated successfully');
        return done(null, admin);

    } catch (err) {
        console.error('❌ Google Admin Auth Error:', err);
        return done(err, null);
    }
}));

module.exports = passport;