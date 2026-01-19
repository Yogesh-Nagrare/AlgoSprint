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

// Import routes
const googleAuthRoutes = require('./routes/googleAuth');

app.use(cors({
    origin: 'http://localhost:5173',
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
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport - ADD THIS
app.use(passport.initialize());
app.use(passport.session());
console.log("Auth router is mounting...");
app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);
app.use('/video',videoRouter);
app.use('/auth', googleAuthRoutes);

const InitalizeConnection = async()=>{
    try {
        await Promise.all([main(),redisClient.connect()]);
        console.log("DB CONNECTED");

        app.listen(process.env.PORT, ()=>{
        console.log("Server listening at port number: "+ process.env.PORT);
        console.log(`🔐 Google User Auth: http://localhost:${process.env.PORT}/auth/google/student/callback`);
        console.log(`👑 Google Admin Auth: http://localhost:${process.env.PORT}/auth/google/admin/callback`);
    })
    } catch (err) {
        console.log("Error Occurred: "+err);
    }
}

InitalizeConnection();