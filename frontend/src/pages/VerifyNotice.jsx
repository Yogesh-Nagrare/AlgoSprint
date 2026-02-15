import { motion } from 'framer-motion';
import { Mail, Code, ChevronLeft, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';
import { useState, useEffect, useRef } from 'react';

const VerifyNotice = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const pollIntervalRef = useRef(null);
  const checkCountRef = useRef(0);

  // Get user email from localStorage (set during registration)
  const userEmail = localStorage.getItem('pendingVerificationEmail');

  useEffect(() => {
    if (!userEmail) {
      // No email stored, redirect to signup
      navigate('/signup');
      return;
    }

    // Start polling for verification status
    const checkVerificationStatus = async () => {
      if (checkCountRef.current >= 60) {
        // Stop after 60 checks (30 minutes with 30s interval)
        clearInterval(pollIntervalRef.current);
        setIsChecking(false);
        return;
      }

      try {
        setIsChecking(true);
        checkCountRef.current++;

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/user/check-verification-status`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ emailId: userEmail }),
          }
        );

        const data = await response.json();

        if (data.isVerified) {
          setIsVerified(true);
          clearInterval(pollIntervalRef.current);
          localStorage.removeItem('pendingVerificationEmail');
          
          // Show success message briefly then redirect
          setTimeout(() => {
            navigate('/login', { 
              state: { message: 'Account verified! You can now login.' } 
            });
          }, 2000);
        }
      } catch (error) {
        console.error('Verification check failed:', error);
      } finally {
        setIsChecking(false);
      }
    };

    // Initial check
    checkVerificationStatus();

    // Then check every 30 seconds
    pollIntervalRef.current = setInterval(checkVerificationStatus, 30000);

    // Cleanup on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [userEmail, navigate]);

  if (isVerified) {
    return (
      <div className="min-h-screen bg-[#070707] text-gray-200 font-sans flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="bg-emerald-500/20 p-6 rounded-full border border-emerald-500/30 inline-block mb-4">
            <CheckCircle2 className="text-emerald-500" size={64} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Verified!</h2>
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

      {/* Header / Logo */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center px-6 py-6 md:px-12">
        <NavLink to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-1.5 rounded-xl text-black">
            <Code size={20} strokeWidth={3} />
          </div>
          <span className="text-xl font-black text-white tracking-tighter italic">ALGO<span className="text-orange-500">SPRINT</span></span>
        </NavLink>
      </header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-[#0c0c0c]/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[40px] p-8 md:p-12 text-center relative overflow-hidden">
          
          {/* Decorative Top Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50"></div>

          {/* Checking Status Indicator */}
          {isChecking && (
            <div className="absolute top-4 right-4">
              <Loader2 className="animate-spin text-orange-500" size={20} />
            </div>
          )}

          {/* Icon Section */}
          <div className="flex justify-center mb-10">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-orange-500/30 blur-3xl rounded-full"></div>
              <div className="bg-black border border-orange-500/20 p-6 rounded-[24px] relative z-10">
                <Clock className="text-orange-500" size={48} strokeWidth={1.5} />
              </div>
            </motion.div>
          </div>

          {/* Text Content */}
          <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase mb-4">
            Registration <span className="text-orange-500">Received.</span>
          </h2>
          
          <p className="text-gray-400 text-sm font-medium leading-relaxed mb-6">
            Your account has been created successfully! We're currently in <span className="text-orange-500 font-bold">beta mode</span> and manually verifying each account to ensure quality.
          </p>

          {/* Timeline */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30 mt-1">
                  <CheckCircle2 className="text-emerald-500" size={16} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-white font-bold text-xs uppercase tracking-wider">Account Created</p>
                  <p className="text-gray-500 text-[10px] mt-1">Your registration is complete</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-orange-500/20 p-2 rounded-lg border border-orange-500/30 mt-1 animate-pulse">
                  <Clock className="text-orange-500" size={16} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-white font-bold text-xs uppercase tracking-wider">Pending Verification</p>
                  <p className="text-gray-500 text-[10px] mt-1">Usually takes 1-24 hours</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 opacity-40">
                <div className="bg-white/5 p-2 rounded-lg border border-white/10 mt-1">
                  <Mail className="text-gray-600" size={16} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-gray-600 font-bold text-xs uppercase tracking-wider">Auto-Redirect</p>
                  <p className="text-gray-700 text-[10px] mt-1">You'll be redirected automatically</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-gray-500 text-xs mb-8 leading-relaxed">
            Once verified, this page will automatically redirect you to login. 
            No need to refresh! 🚀
          </p>

          {/* Actions */}
          <div className="space-y-4">
            <NavLink 
              to="/login"
              className="group w-full flex items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-600 transition-all"
            >
              Go to Login
            </NavLink>

            <NavLink 
              to="/"
              className="group w-full flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 py-4 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
            >
              Back to Home
            </NavLink>
          </div>

          {/* Bottom Help */}
          <div className="mt-10 pt-8 border-t border-white/5">
             <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
               Questions about verification?
             </p>
             <p className="mt-2 text-[10px] font-medium text-gray-500">
               Contact us at <span className="text-orange-500">support@algosprint.com</span>
             </p>
          </div>
        </div>

        {/* Footer Back Link */}
        <div className="mt-8 text-center">
            <NavLink to="/signup" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-1">
               <ChevronLeft size={14} /> Back to signup
            </NavLink>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyNotice;