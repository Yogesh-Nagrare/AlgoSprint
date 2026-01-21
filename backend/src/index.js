require('dotenv').config();
const express = require('express')
const app = express();
const cookieParser = require('cookie-parser') // Keep this
const cors = require('cors')
const main = require('./config/db')
const authRouter = require('./routes/userAuth')
const redisClient  = require('./config/redis')
const problemRouter = require('./routes/problemCreator')
const submitRouter = require('./routes/submit')
const aiRouter = require('./routes/aiChatting');
const videoRouter = require('./routes/videoCreator')
const passport = require('./config/passport'); // Updated import
const googleAuthRoutes = require('./routes/googleAuth');

const PORT = process.env.PORT || 3000;

const isProduction = process.env.NODE_ENV === 'production';
const frontendUrl = isProduction 
  ? process.env.FRONTEND_URL 
  : process.env.CLIENT_URL;

console.log('Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('Frontend URL:', frontendUrl);

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

app.set('trust proxy', 1);

// ❌ REMOVE ALL SESSION MIDDLEWARE
// ❌ REMOVE app.use(passport.session());

// Initialize Passport (JWT-only)
app.use(passport.initialize()); // Keep this, remove passport.session()

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: "Backend API is live!",
    environment: isProduction ? 'production' : 'development',
    timestamp: new Date().toISOString()
  });
});

// Routes
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

const InitalizeConnection = async () => {
  if (isConnected) return;

  try {
    await Promise.all([main(), redisClient.connect()]);
    console.log("✅ DB CONNECTED");
    isConnected = true;

    if (!isProduction) {
      app.listen(PORT, () => {
        console.log(`🚀 Server listening at port: ${PORT}`);
        console.log(`🔐 Google User Auth: http://localhost:${PORT}/auth/google/student/callback`);
        console.log(`👑 Google Admin Auth: http://localhost:${PORT}/auth/google/admin/callback`);
      });
    }
  } catch (err) {
    console.log("❌ Error Occurred: " + err);
  }
}

InitalizeConnection();

module.exports = app;