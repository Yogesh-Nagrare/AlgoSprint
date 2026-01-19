import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Clock, Users, Calendar, 
  Target, Flame, ChevronRight, Circle, 
  Sparkles, Zap, Search, LayoutGrid, ListFilter
} from 'lucide-react';

const mockContests = [
  {
    id: 1,
    title: 'Weekly Code Sprint',
    status: 'live',
    participants: 1240,
    timeLeft: { hours: 2, minutes: 45, seconds: 30 },
    prize: '$500',
    difficulty: 'Medium',
    problems: 4,
    color: 'from-rose-500/20'
  },
  {
    id: 2,
    title: 'Algorithm Mastery',
    status: 'upcoming',
    participants: 856,
    startsIn: { days: 2, hours: 5 },
    prize: '$1000',
    difficulty: 'Hard',
    problems: 6,
    color: 'from-indigo-500/20'
  },
  {
    id: 3,
    title: 'Beginner Bootcamp',
    status: 'upcoming',
    participants: 2340,
    startsIn: { days: 5, hours: 12 },
    prize: '$250',
    difficulty: 'Easy',
    problems: 3,
    color: 'from-emerald-500/20'
  },
  {
    id: 4,
    title: 'Data Structure Duel',
    status: 'upcoming',
    participants: 520,
    startsIn: { days: 1, hours: 8 },
    prize: '$400',
    difficulty: 'Medium',
    problems: 5,
    color: 'from-amber-500/20'
  }
];

const ContestItem = ({ contest }) => {
  const [timeLeft, setTimeLeft] = useState(contest.timeLeft || { hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (contest.status === 'live' && contest.timeLeft) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          let { hours, minutes, seconds } = prev;
          if (seconds > 0) seconds--;
          else if (minutes > 0) { minutes--; seconds = 59; }
          else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
          return { hours, minutes, seconds };
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [contest.status, contest.timeLeft]);

  const difficultyStyles = {
    easy: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    medium: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    hard: "text-rose-400 border-rose-500/20 bg-rose-500/10"
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 hover:border-zinc-600 rounded-[2rem] p-6 transition-all duration-500"
    >
      <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${contest.color} to-transparent blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />

      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className={`p-3 rounded-2xl bg-zinc-800 border border-zinc-700`}>
              {contest.status === 'live' ? <Zap size={20} className="text-rose-500" /> : <Calendar size={20} className="text-indigo-400" />}
            </div>
            {contest.status === 'live' && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-black text-rose-500 animate-pulse">
                <Circle size={6} fill="currentColor" /> LIVE
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight mb-2 group-hover:text-indigo-300 transition-colors">
            {contest.title}
          </h3>
          
          <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${difficultyStyles[contest.difficulty.toLowerCase()]}`}>
            {contest.difficulty}
          </span>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Prize Pool</p>
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-amber-500" />
                <span className="text-lg font-black text-white">{contest.prize}</span>
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Time Remaining</p>
              <span className="text-sm font-mono font-bold text-zinc-200 block">
                {contest.status === 'live' 
                  ? `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`
                  : `${contest.startsIn.days}d ${contest.startsIn.hours}h`
                }
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs text-zinc-400">
                <Users size={14} /> {contest.participants.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-xs text-zinc-400">
                <Target size={14} /> {contest.problems}
              </div>
            </div>
            <button className="p-2 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:scale-110 transition-transform">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Renamed from ContestDashboard to ContestCard
export const ContestCard = () => {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="min-h-screen w-full bg-[#030303] text-zinc-200 font-sans selection:bg-indigo-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/40">
                <Zap size={18} className="text-white" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter italic">ARENA.IO</h1>
            </div>
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Level Up Your Engineering</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                placeholder="Search contests..." 
                className="bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 pl-12 pr-6 w-80 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            {/* <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <img 
                  key={i} 
                  className="w-10 h-10 rounded-xl border-2 border-[#030303] bg-zinc-800" 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 40}`} 
                  alt="user"
                />
              ))}
            </div> */}
          </div>
        </header>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex p-1.5 bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-800/50 w-full sm:w-auto">
            {['all', 'live', 'upcoming'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-8 py-2.5 text-xs font-black uppercase tracking-widest transition-colors duration-300 z-10 ${
                  activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-zinc-800 border border-zinc-700/50 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-20">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {mockContests
              .filter(c => activeTab === 'all' || c.status === activeTab)
              .map((contest) => (
                <ContestItem key={contest.id} contest={contest} />
              ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Also export as default to be safe
export default ContestCard;