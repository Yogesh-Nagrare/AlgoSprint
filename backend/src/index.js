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
// Import passport configuration
const passport = require('./config/passport');
const PORT = process.env.PORT || 3000;
// Import routes
const googleAuthRoutes = require('./routes/googleAuth');

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())
// Session middleware (required for passport) - ADD THIS BEFORE PASSPORT
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: "none",     // REQUIRED for cross-domain cookies
  }
}));

// Initialize Passport - ADD THIS
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send("Backend API is live!");
});

console.log("Auth router is mounting...");
app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);
app.use('/video',videoRouter);
app.use('/auth', googleAuthRoutes);

let isConnected = false;

const InitalizeConnection = async () => {
  if (isConnected) return;

  try {
    await Promise.all([main(), redisClient.connect()]);
    console.log("DB CONNECTED");
    isConnected = true;
  } catch (err) {
    console.log("Error Occurred: " + err);
  }
};


InitalizeConnection();
module.exports = app;
