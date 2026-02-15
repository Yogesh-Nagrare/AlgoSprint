import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Code, ChevronLeft, Clock, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';
import { useState, useEffect, useRef } from 'react';

const VerifyNotice = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(30); // Timer state
  
  const pollIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const checkCountRef = useRef(0);

  const userEmail = localStorage.getItem('pendingVerificationEmail');

  const checkVerificationStatus = async () => {
    if (checkCountRef.current >= 60) {
      stopIntervals();
      return;
    }

    try {
      setIsChecking(true);
      checkCountRef.current++;

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/check-verification-status`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailId: userEmail }),
        }
      );

      const data = await response.json();

      if (data.isVerified) {
        setIsVerified(true);
        stopIntervals();
        localStorage.removeItem('pendingVerificationEmail');
        setTimeout(() => {
          navigate('/login', { state: { message: 'Account verified! You can now login.' } });
        }, 2000);
      }
    } catch (error) {
      console.error('Verification check failed:', error);
    } finally {
      setTimeout(() => setIsChecking(false), 1000);
      setCountdown(30); // Reset timer after check
    }
  };

  const stopIntervals = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  useEffect(() => {
    if (!userEmail) {
      navigate('/signup');
      return;
    }

    // Initial check
    checkVerificationStatus();

    // Secondary Interval for the visual countdown UI (every 1s)
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Primary Interval for the API call (every 30s)
    pollIntervalRef.current = setInterval(checkVerificationStatus, 30000);

    return () => stopIntervals();
  }, [userEmail, navigate]);

  // SVG Circle Constants
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (countdown / 30) * circumference;

  if (isVerified) {
    return (
      <div className="min-h-screen bg-[#070707] text-gray-200 font-sans flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="bg-emerald-500/20 p-6 rounded-full border border-emerald-500/30 inline-block mb-4 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="text-emerald-500" size={64} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Verified!</h2>
          <p className="text-gray-400">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-gray-200 font-sans selection:bg-orange-500/30 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center px-6 py-6 md:px-12">
        <NavLink to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-1.5 rounded-xl text-black">
            <Code size={20} strokeWidth={3} />
          </div>
          <span className="text-xl font-black text-white tracking-tighter italic">ALGO<span className="text-orange-500">SPRINT</span></span>
        </NavLink>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-[#0c0c0c]/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[48px] p-8 md:p-10 text-center relative overflow-hidden">
          
          {/* BIG ATTRACTED TIMER BLOCK */}
          <div className="relative flex flex-col items-center mb-10">
            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Outer Glow Ring */}
              <div className="absolute inset-0 bg-orange-500/5 blur-3xl rounded-full"></div>
              
              {/* SVG Timer */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-white/5"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1, ease: "linear" }}
                  className="text-orange-500"
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={countdown}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    className="text-4xl font-black text-white italic"
                  >
                    {isChecking ? <RefreshCw className="animate-spin text-orange-500" size={32} /> : countdown}
                  </motion.span>
                </AnimatePresence>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mt-1">
                    {isChecking ? "Checking" : "Seconds"}
                </span>
              </div>
            </div>

            {/* Status Pulse */}
            <div className="mt-4 flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Sync Active</span>
            </div>
          </div>

          <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase mb-4">
            Verification <span className="text-orange-500">Pending.</span>
          </h2>
          
          <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
            Our team is manually reviewing your application. This usually takes <span className="text-white">1-24 hours</span>. We’ll auto-redirect you when ready.
          </p>

          {/* Mini Progress Steps */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-black/40 border border-white/5 p-4 rounded-3xl text-left">
                <div className="bg-emerald-500/20 w-fit p-1.5 rounded-lg mb-2">
                   <CheckCircle2 size={14} className="text-emerald-500" />
                </div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sign up</p>
                <p className="text-xs text-white font-bold">Completed</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-3xl text-left">
                <div className="bg-orange-500/20 w-fit p-1.5 rounded-lg mb-2">
                   <Clock size={14} className="text-orange-500" />
                </div>
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Identity</p>
                <p className="text-xs text-white font-bold">In Review</p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <NavLink 
              to="/login"
              className="flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 py-4 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
            >
              Login
            </NavLink>
            <NavLink 
              to="/"
              className="flex items-center justify-center rounded-2xl bg-orange-500 py-4 text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
            >
              Home
            </NavLink>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
             <p className="text-[9px] font-medium text-gray-600 leading-relaxed">
               Need urgent access? Email us at <br/>
               <span className="text-orange-500/70 font-bold">support@algosprint.com</span>
             </p>
          </div>
        </div>

        <div className="mt-8 text-center">
            <NavLink to="/signup" className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors flex items-center justify-center gap-1">
               <ChevronLeft size={14} /> Back to signup
            </NavLink>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyNotice;