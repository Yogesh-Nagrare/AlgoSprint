import { motion } from 'framer-motion';
import { Mail, Code, ChevronLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { NavLink } from 'react-router';

const VerifyNotice = () => {
  return (
    <div className="min-h-screen bg-[#070707] text-gray-200 font-sans selection:bg-orange-500/30 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background Decor (Matching Landing Page) */}
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

          {/* Icon Section */}
          <div className="flex justify-center mb-10">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-orange-500/30 blur-3xl rounded-full"></div>
              <div className="bg-black border border-orange-500/20 p-6 rounded-[24px] relative z-10">
                <Mail className="text-orange-500" size={48} strokeWidth={1.5} />
              </div>
            </motion.div>
          </div>

          {/* Text Content */}
          <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase mb-4">
            Verify Your <span className="text-orange-500">Identity.</span>
          </h2>
          
          <p className="text-gray-400 text-sm font-medium leading-relaxed mb-10">
            We've dispatched a secure verification link to your inbox. 
            Click the link to activate your <span className="text-white font-bold">AlgoSprint</span> account and begin your journey.
          </p>

          {/* Actions */}
          <div className="space-y-4">
            <button 
              onClick={() => window.open('https://mail.google.com', '_blank')}
              className="group w-full flex items-center justify-center gap-3 rounded-2xl bg-white text-black py-4 font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-500 transition-all"
            >
              Open Mail Inbox <ExternalLink size={16} />
            </button>

            <NavLink 
              to="/login"
              className="group w-full flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 py-4 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
            >
              Go to Login <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </NavLink>
          </div>

          {/* Bottom Help */}
          <div className="mt-10 pt-8 border-t border-white/5">
             <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
               Didn't receive the email?
             </p>
             <button className="mt-2 text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] hover:text-orange-400 transition-colors">
               Resend Verification Link
             </button>
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