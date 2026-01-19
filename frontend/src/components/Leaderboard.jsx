import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Target, Flame, ChevronUp, ChevronDown, 
  Minus, ArrowRight, Crown, Search,
  Users, Globe, Filter, Download
} from 'lucide-react';

const mockLeaderboard = [
  { rank: 1, name: "Alex Rivera", score: 2840, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", solved: 450, streak: 12, change: 'up', country: 'US', status: 'Online' },
  { rank: 2, name: "Sarah Chen", score: 2720, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", solved: 412, streak: 8, change: 'down', country: 'CN', status: 'In Match' },
  { rank: 3, name: "Marcus Koh", score: 2680, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus", solved: 398, streak: 15, change: 'none', country: 'SG', status: 'Online' },
  { rank: 4, name: "Elena Belova", score: 2450, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena", solved: 320, streak: 5, change: 'up', country: 'RU', status: 'Offline' },
  { rank: 5, name: "Jordan Smith", score: 2310, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan", solved: 290, streak: 3, change: 'down', country: 'UK', status: 'Online' },
  { rank: 6, name: "Yuki Tanaka", score: 2280, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki", solved: 275, streak: 10, change: 'up', country: 'JP', status: 'Online' },
  { rank: 7, name: "Amara Okoro", score: 2150, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amara", solved: 260, streak: 2, change: 'none', country: 'NG', status: 'Offline' },
];

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[2rem] flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-2xl bg-zinc-800/50 ${color}`}>
        <Icon size={20} />
      </div>
      <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
        <ChevronUp size={14} /> {trend}
      </span>
    </div>
    <div>
      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.15em]">{label}</p>
      <h3 className="text-2xl font-black text-white mt-1">{value}</h3>
    </div>
  </div>
);

// Named export to match your App.jsx import
export const LeaderboardCard = () => {
  const [filter, setFilter] = useState('global');

  return (
    <div className="min-h-screen w-full bg-[#030303] text-zinc-200 font-sans p-6 lg:p-10 selection:bg-indigo-500/30">
      <div className="max-w-[1400px] mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Trophy className="text-white" size={20} />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter italic">RANKINGS</h1>
            </div>
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Season 4 • Global Circuit</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                placeholder="Find competitor..." 
                className="bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 pl-12 pr-6 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
              />
            </div>
            <button className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-colors text-zinc-400">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Top Tier Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Users} label="Total Players" value="124,592" trend="12%" color="text-indigo-400" />
          <StatCard icon={Target} label="Avg. Accuracy" value="84.2%" trend="5%" color="text-emerald-400" />
          <StatCard icon={Flame} label="Active Streaks" value="1,204" trend="8%" color="text-orange-400" />
          <StatCard icon={Globe} label="Countries" value="142" trend="2%" color="text-sky-400" />
        </div>

        {/* Podium Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end px-8 py-12 bg-zinc-900/20 rounded-[3rem] border border-zinc-800/50 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-indigo-500/10 blur-[120px] rounded-full" />
          
          {/* 2nd Place */}
          {/* <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative z-10 flex flex-col items-center">
            <div className="relative mb-6">
              <img src={mockLeaderboard[1].avatar} className="w-24 h-24 rounded-3xl border-2 border-zinc-700 p-1 bg-zinc-900 shadow-2xl" alt="" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full text-[10px] font-black">#2</div>
            </div>
            <h4 className="text-xl font-bold text-white">{mockLeaderboard[1].name}</h4>
            <p className="text-zinc-500 text-sm font-black uppercase tracking-widest">{mockLeaderboard[1].score} PTS</p>
            <div className="w-full h-24 bg-gradient-to-t from-zinc-800/40 to-transparent mt-6 rounded-t-3xl border-t border-zinc-800" />
          </motion.div> */}

          {/* 1st Place */}
          {/* <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex flex-col items-center order-first lg:order-none">
            <Crown size={40} className="text-amber-400 mb-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-amber-400/20 blur-[60px] rounded-full" />
              <img src={mockLeaderboard[0].avatar} className="relative w-36 h-36 rounded-[2.5rem] border-4 border-amber-400 p-1.5 bg-zinc-900 shadow-2xl" alt="" />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-amber-400 text-black px-4 py-1.5 rounded-full text-[10px] font-black shadow-xl uppercase tracking-tighter">Champion</div>
            </div>
            <h4 className="text-2xl font-black text-white tracking-tight">{mockLeaderboard[0].name}</h4>
            <p className="text-amber-400 text-lg font-black tracking-[0.2em]">{mockLeaderboard[0].score} PTS</p>
            <div className="w-full h-40 bg-gradient-to-t from-amber-400/10 to-transparent mt-6 rounded-t-[3rem] border-t-2 border-amber-400/30" />
          </motion.div> */}

          {/* 3rd Place */}
          {/* <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative z-10 flex flex-col items-center">
            <div className="relative mb-6">
              <img src={mockLeaderboard[2].avatar} className="w-24 h-24 rounded-3xl border-2 border-orange-900/50 p-1 bg-zinc-900 shadow-2xl" alt="" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full text-[10px] font-black">#3</div>
            </div>
            <h4 className="text-xl font-bold text-white">{mockLeaderboard[2].name}</h4>
            <p className="text-zinc-500 text-sm font-black uppercase tracking-widest">{mockLeaderboard[2].score} PTS</p>
            <div className="w-full h-16 bg-gradient-to-t from-orange-900/20 to-transparent mt-6 rounded-t-3xl border-t border-zinc-800" />
          </motion.div> */}
        </div>

        {/* Data Table */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="flex gap-1 bg-black/40 p-1 rounded-2xl border border-zinc-800">
                {['global', 'friends', 'country'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        filter === tab ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                <Download size={14} /> Export Data
            </button>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 border-b border-zinc-800/50">
                <th className="px-8 py-6">Rank</th>
                <th className="px-8 py-6">Competitor</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Problems</th>
                <th className="px-8 py-6">Streak</th>
                <th className="px-8 py-6 text-right">Rating</th>
                <th className="px-8 py-6 text-center">Trend</th>
              </tr>
            </thead>
            <tbody>
              {mockLeaderboard.map((user) => (
                <tr key={user.rank} className="group hover:bg-zinc-800/30 transition-colors border-b border-zinc-800/50 last:border-0 cursor-pointer">
                  <td className="px-8 py-5 font-mono font-bold text-zinc-600 group-hover:text-zinc-400">
                    {user.rank.toString().padStart(2, '0')}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={user.avatar} className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/50" alt="" />
                      <div>
                        <p className="text-sm font-bold text-white leading-none">{user.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-tighter">{user.country} • Regional</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                      user.status === 'Online' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' :
                      user.status === 'In Match' ? 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' :
                      'text-zinc-500 border-zinc-700 bg-zinc-800/5'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-zinc-400 group-hover:text-zinc-200">{user.solved}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-1.5 text-orange-500/80 font-black text-xs uppercase tracking-tighter">
                      <Flame size={14} /> {user.streak} Days
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-white tabular-nums tracking-tight">
                    {user.score.toLocaleString()}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center">
                      {user.change === 'up' ? <ChevronUp size={18} className="text-emerald-500" /> :
                       user.change === 'down' ? <ChevronDown size={18} className="text-rose-500" /> :
                       <Minus size={18} className="text-zinc-700" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Personalized Sticky User Bar */}
        <div className="sticky bottom-8 left-0 right-0 max-w-4xl mx-auto z-50 px-4">
          <div className="bg-indigo-600 rounded-[2.5rem] p-4 flex items-center gap-6 shadow-2xl shadow-indigo-600/40 border border-white/20 backdrop-blur-xl">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center font-black text-white">42</div>
              {/* <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=you" className="w-12 h-12 rounded-2xl border-2 border-white/30" alt="" /> */}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-black text-white uppercase tracking-tight">Your Ranking</h4>
                  <span className="bg-black/20 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase border border-white/10">Level 12</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-100/80 text-[10px] font-bold mt-1">
                   120 pts to Rank #40
                  <div className="w-24 h-1.5 bg-black/20 rounded-full ml-1 overflow-hidden">
                    <div className="w-3/4 h-full bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-end px-6 border-r border-white/20">
              <span className="text-[9px] text-indigo-200 font-black uppercase tracking-widest leading-none mb-1">Total Score</span>
              <span className="text-2xl font-black text-white leading-none tabular-nums">1,840</span>
            </div>
            <button className="bg-white text-indigo-600 p-4 rounded-2xl hover:scale-105 transition-transform shadow-lg group">
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// Default export to prevent import errors
export default LeaderboardCard;