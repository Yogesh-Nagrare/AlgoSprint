import { useEffect, useRef, useState } from "react";
import { useNavigate, NavLink, useParams } from "react-router"; // Use useParams
import { CheckCircle2, XCircle, Loader2, Code, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function VerifyEmail() {
  const navigate = useNavigate();
  const { token } = useParams(); // Extract token from URL params automatically
  const hasRun = useRef(false);

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Get the backend URL from environment variables
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const verifyEmail = async () => {
      try {
        // Use the environment variable here
        const res = await fetch(
          `${BACKEND_URL}/user/verify-email/${token}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Verification failed");
        }

        setSuccess(data.message || "Your identity has been confirmed.");
        setError("");
      } catch (err) {
        setError(err.message || "This verification link is invalid or has expired.");
        setSuccess("");
      } finally {
        // Adding a slight delay for a smoother "processing" feel
        setTimeout(() => setLoading(false), 1500);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setError("No verification token found.");
      setLoading(false);
    }
  }, [token, BACKEND_URL]);

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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-[#0c0c0c]/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[32px] p-8 md:p-12 text-center">
          
          <AnimatePresence mode="wait">
            {loading ? (
              /* LOADING STATE */
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-10 flex flex-col items-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse"></div>
                  <Loader2 className="animate-spin text-orange-500 relative z-10" size={48} strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-black text-white tracking-tighter italic uppercase mt-8">
                  Authenticating <span className="text-orange-500">Token</span>
                </h2>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">
                  Syncing with mainnet...
                </p>
              </motion.div>
            ) : success ? (
              /* SUCCESS STATE */
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-6"
              >
                <div className="flex justify-center mb-8">
                  <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <CheckCircle2 className="text-emerald-500" size={48} />
                  </div>
                </div>
                <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">
                  Access <span className="text-orange-500">Granted.</span>
                </h2>
                <p className="text-gray-400 text-sm font-medium mt-4 leading-relaxed">
                  {success} Your account is now fully activated and ready for the sprint.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="group w-full mt-10 rounded-2xl bg-orange-500 py-4 text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                >
                  Enter Platform <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ) : (
              /* ERROR STATE */
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-6"
              >
                <div className="flex justify-center mb-8">
                  <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                    <XCircle className="text-red-500" size={48} />
                  </div>
                </div>
                <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">
                  Verify <span className="text-red-500">Failed.</span>
                </h2>
                <p className="text-gray-400 text-sm font-medium mt-4 leading-relaxed">
                  {error}
                </p>
                <div className="space-y-3 mt-10">
                   <button
                    onClick={() => navigate("/login")}
                    className="w-full rounded-2xl bg-white/5 border border-white/10 py-4 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                  >
                    Back to Login
                  </button>
                  <NavLink to="/signup" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-orange-500 transition-colors py-2">
                    Request new link
                  </NavLink>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* System Logs Decor */}
        {!loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            className="mt-8 flex flex-col items-center gap-2"
          >
             <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">
                <span>SECURE ENDPOINT</span>
                <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                <span>ENC-v256</span>
             </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default VerifyEmail;