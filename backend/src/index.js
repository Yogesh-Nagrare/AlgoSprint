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
const PORT = process.env.PORT || 3000;
const googleAuthRoutes = require('./routes/googleAuth');

// CORS MUST BE FIRST - Before any other middleware
const allowedOrigins = [
  'https://algo-sprint-iota.vercel.app',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// Session middleware
app.use(session({
  name: "algo_sprint_session",
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: "Backend API is live!",
    cors: "enabled",
    timestamp: new Date().toISOString()
  });
});

console.log("Auth router is mounting...");
app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use('/video', videoRouter);
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