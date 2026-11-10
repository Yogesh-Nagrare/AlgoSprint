require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');

const main = require('./config/db');
const redisClient = require('./config/redis');

const authRouter = require('./routes/userAuth');
const problemRouter = require('./routes/problemCreator');
const submitRouter = require('./routes/submit');
const aiRouter = require('./routes/aiChatting');
const videoRouter = require('./routes/videoCreator');
const passport = require('./config/passport');
const googleAuthRoutes = require('./routes/googleAuth');

const PORT = process.env.PORT || 3000;

const isProduction = process.env.NODE_ENV === 'production';
const frontendUrl = isProduction
  ? process.env.FRONTEND_URL
  : process.env.CLIENT_URL;

console.log('Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('Frontend URL:', frontendUrl);

app.set('trust proxy', 1);

app.use(cors({
  origin: frontendUrl,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

/* ---------------- HEALTH ---------------- */

app.get('/', (req, res) => {
  res.json({
    message: "Backend API is live!",
    environment: isProduction ? 'production' : 'development',
    timestamp: new Date().toISOString()
  });
});

/* ---------------- ROUTES ---------------- */

app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use('/video', videoRouter);
app.use('/auth', googleAuthRoutes);

/* ---------------- ERROR ---------------- */

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

/* ================================================= */
/* 🔥 MINIMAL RENDER FIX STARTS HERE 🔥 */
/* ================================================= */

let isConnected = false;

const InitializeConnection = async () => {
  if (isConnected) return;
  try {
    await main();
    console.log("✅ DB CONNECTED");
    isConnected = true;
  } catch (err) {
    console.log("❌ DB Error:", err.message);
  }
};

// ✅ SERVER MUST START IMMEDIATELY (Render requirement)
app.listen(PORT, () => {
  console.log(`🚀 Server listening at port: ${PORT}`);

  if (!isProduction) {
    console.log(`🔐 Google User Auth: http://localhost:${PORT}/auth/google/student/callback`);
    console.log(`👑 Google Admin Auth: http://localhost:${PORT}/auth/google/admin/callback`);
  }
});

// ✅ Connect DB & Redis AFTER server starts
InitializeConnection();

module.exports = app;
