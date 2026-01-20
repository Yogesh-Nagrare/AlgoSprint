require('dotenv').config();
const express = require('express')
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser')
const cors = require('cors')
const main = require('./config/db')
const authRouter = require('./routes/userAuth')
const redisClient  = require('./config/redis')
const problemRouter = require('./routes/problemCreator')
const submitRouter = require('./routes/submit')
const aiRouter = require('./routes/aiChatting');
const videoRouter = require('./routes/videoCreator')
const passport = require('./config/passport');
const googleAuthRoutes = require('./routes/googleAuth');

const PORT = process.env.PORT || 3000;

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';
const frontendUrl = isProduction 
  ? process.env.FRONTEND_URL 
  : process.env.CLIENT_URL;

console.log('Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('Frontend URL:', frontendUrl);

// CORS configuration - works for both local and production
app.use(cors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie']
}));


app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  proxy: isProduction, // Enable proxy in production (Vercel)
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: "Backend API is live!",
    environment: isProduction ? 'production' : 'development',
    timestamp: new Date().toISOString()
  });
});

// Routes
console.log("Mounting routes...");
app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use('/video', videoRouter);
app.use('/auth', googleAuthRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

let isConnected = false;

// Remove the global InitalizeConnection() call at the bottom
// Instead, use a middleware to ensure DB is connected

const connectDB = async (req, res, next) => {
    try {
        if (!isConnected) {
            await Promise.all([main(), redisClient.connect()]);
            isConnected = true;
            console.log("✅ DB & Redis Connected");
        }
        next();
    } catch (error) {
        console.error("❌ Connection Error:", error);
        res.status(500).json({ message: "Database connection failed" });
    }
};

// Use it as middleware for all routes
app.use(connectDB);

module.exports = app;