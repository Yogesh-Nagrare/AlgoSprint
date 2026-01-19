import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trophy, Users, Tag, Star, TrendingUp, Zap, CheckCircle, AlertCircle, Share2 } from 'lucide-react';

const DailyChallengeCard = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 22, seconds: 1 });
  const [isHovered, setIsHovered] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Animate progress bar on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      setProgressPercentage(67);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  const formatTime = (num) => String(num).padStart(2, '0');

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="lg:col-span-2 group relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#141414] to-[#0d0d0d] p-8 rounded-3xl border border-white/10 hover:border-orange-500/30 flex flex-col justify-between min-h-[320px] shadow-2xl hover:shadow-orange-500/10 transition-all duration-500"
      >
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-orange-500/30 rounded-full"
              animate={{
                x: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                y: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 5 + i,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>

        {/* TOP SECTION: Status & Timer */}
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em]">
                Daily Challenge
              </span>
              <motion.div
                animate={{ rotate: isHovered ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
              </motion.div>
            </div>
            
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight transition-colors duration-300">
              Binary Tree Maximum<br />Path Sum
            </h1>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <motion.span 
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-red-500/10"
              >
                Hard
              </motion.span>
              <motion.span 
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-[10px] font-medium flex items-center gap-1.5 hover:bg-white/10 transition-all"
              >
                <Tag size={10} /> Binary Tree
              </motion.span>
              <motion.span 
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-medium flex items-center gap-1.5"
              >
                <Trophy size={10} className="animate-pulse" /> +50 XP
              </motion.span>
              <motion.span 
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-500 text-[10px] font-medium flex items-center gap-1.5"
              >
                <TrendingUp size={10} /> Trending
              </motion.span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Your Progress</span>
                <span className="text-[9px] font-bold text-orange-500">{progressPercentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center min-w-[100px] shadow-2xl hover:border-orange-500/30 transition-all group/timer">
            <div className="text-gray-500 text-[9px] uppercase font-bold mb-2 flex items-center justify-center gap-1">
              <Clock size={10} className="animate-pulse" /> Ends In
            </div>
            <div className="text-white font-mono font-black text-lg flex justify-center gap-1">
              <div className="bg-orange-500/10 px-2 py-1 rounded-lg">
                {formatTime(timeLeft.hours)}
              </div>
              <span className="text-orange-500">:</span>
              <div className="bg-orange-500/10 px-2 py-1 rounded-lg">
                {formatTime(timeLeft.minutes)}
              </div>
              <span className="text-orange-500">:</span>
              <div className="bg-orange-500/10 px-2 py-1 rounded-lg">
                {formatTime(timeLeft.seconds)}
              </div>
            </div>
            <div className="text-[8px] text-gray-600 mt-1 uppercase font-bold">Hours : Min : Sec</div>
          </div>
        </div>

        {/* MIDDLE SECTION: Community & Description */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 my-6">
          <div className="flex-1">
            <p className="text-gray-400 max-w-sm text-sm leading-relaxed italic">
              "Consistency is the bridge between goals and accomplishment." 
            </p>
            <motion.span 
              animate={{ 
                scale: isHovered ? [1, 1.05, 1] : 1,
              }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 mt-2 text-orange-500 font-bold text-sm"
            >
              <Zap size={16} className="fill-orange-500" />
              12-day streak maintained! 🔥
            </motion.span>
          </div>

          {/* Social Proof: Avatars */}
          <div className="flex items-center gap-4 bg-black/30 backdrop-blur-sm border border-white/5 rounded-2xl p-4 hover:bg-black/40 transition-all">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <motion.img
                  key={i}
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                  className="w-9 h-9 rounded-full border-2 border-[#1a1a1a] shadow-lg cursor-pointer"
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`}
                  alt="user"
                />
              ))}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 border-2 border-[#1a1a1a] flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                +1k
              </div>
            </div>
            <div className="text-[11px] text-gray-500 leading-tight">
              <span className="text-white font-black block text-base">1,240</span>
              <span className="text-gray-500">Solved today</span>
            </div>
          </div>
        </div>
        
        {/* BOTTOM SECTION: Actions */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 min-w-[200px] group/btn bg-gradient-to-r from-white to-gray-100 text-black border-none px-8 rounded-xl font-black transition-all flex items-center justify-center gap-2 h-12 shadow-xl"
          >
            Solve Now
            <motion.svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              transition={{ type: "spring", stiffness: 300 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </motion.svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`px-4 h-12 rounded-xl border flex items-center justify-center transition-all ${
              isBookmarked 
                ? 'bg-orange-500/20 border-orange-500/50 text-orange-500' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <Star size={18} className={isBookmarked ? 'fill-orange-500' : ''} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowShareModal(true)}
            className="px-4 h-12 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20 flex items-center justify-center transition-all"
          >
            <Share2 size={18} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 h-12 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20 flex items-center justify-center gap-2 transition-all"
          >
            <AlertCircle size={18} />
            <span className="text-xs font-bold hidden sm:inline">Hints</span>
          </motion.button>
        </div>

        {/* Difficulty Indicator */}
        <div className="absolute top-4 left-4 w-1 h-16 bg-gradient-to-b from-red-500 to-transparent rounded-full opacity-50"></div>

        {/* VISUAL DECORATIONS */}
        {/* Background Glow Effect */}
        <motion.div 
          animate={{ 
            scale: isHovered ? 1.2 : 1,
            opacity: isHovered ? 0.3 : 0.1
          }}
          transition={{ duration: 0.5 }}
          className="absolute top-0 right-0 w-64 h-64 bg-orange-500 blur-[120px] -z-0"
        />
        
        <motion.div 
          animate={{ 
            scale: isHovered ? 1.1 : 1,
            opacity: isHovered ? 0.2 : 0.05
          }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 blur-[120px] -z-0"
        />
        
        {/* Large Subtle Icon */}
        <motion.div 
          animate={{ 
            rotate: isHovered ? -6 : -12,
            scale: isHovered ? 1.1 : 1
          }}
          transition={{ duration: 0.7 }}
          className="absolute right-[-5%] bottom-[-5%] text-white/[0.03]"
        >
          <Trophy size={280} strokeWidth={1} />
        </motion.div>

        {/* Corner Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-transparent rounded-bl-full"></div>
      </motion.div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-black text-white mb-4">Share Challenge</h3>
              <div className="space-y-3">
                {['Twitter', 'Facebook', 'LinkedIn', 'Copy Link'].map((platform) => (
                  <button
                    key={platform}
                    className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left text-sm font-bold text-gray-300 transition-all"
                  >
                    Share on {platform}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full mt-4 px-4 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-black font-black transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DailyChallengeCard;