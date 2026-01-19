import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, BarChart3, Activity } from 'lucide-react';

const SolvedStats = ({ problems = [], solvedProblems = [] }) => {
  const stats = useMemo(() => {
    const getCount = (arr, diff) => arr.filter(p => p.difficulty?.toLowerCase() === diff).length;
    const totalCount = problems.length;
    const solvedCount = solvedProblems.length;
    const percentage = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

    const calc = (diff) => {
      const s = getCount(solvedProblems, diff);
      const t = getCount(problems, diff);
      return { 
        solved: s, 
        total: t, 
        percent: t > 0 ? Math.round((s / t) * 100) : 0 
      };
    };

    return {
      total: totalCount,
      solved: solvedCount,
      percent: percentage,
      easy: calc('easy'),
      medium: calc('medium'),
      hard: calc('hard')
    };
  }, [problems, solvedProblems]);

  return (
    <div className="bg-[#0D0D0D] border border-white/5 rounded-[2rem] p-6 md:p-8 w-full max-w-[800px] mx-auto shadow-2xl overflow-hidden">
      
      {/* 1. HEADER - Smaller margins */}
      <div className="flex items-center gap-2.5 mb-6 px-1">
        <div className="p-1.5 bg-blue-500/10 rounded-lg">
          <Activity size={16} className="text-blue-500" />
        </div>
        <h2 className="text-gray-400 text-[11px] font-black uppercase tracking-[0.25em]">
          Analytics Dashboard
        </h2>
      </div>

      {/* 2. GRID STRUCTURE - Reduced gap */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-8">
        
        {/* Left Column - Reduced padding and circle size */}
        <div className="md:col-span-5 bg-[#141414] rounded-[1.5rem] border border-white/5 p-6 flex flex-col items-center justify-center relative min-h-[260px]">
          <div className="absolute inset-0 bg-blue-600/5 blur-[60px] pointer-events-none" />
          
          <div className="relative mb-4">
            <CircularProgress 
              size={130} // Reduced from 165
              strokeWidth={12} 
              percentage={stats.percent} 
              color="#3b82f6" 
              glowColor="rgba(59, 130, 246, 0.4)" 
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-white text-2xl font-black">{stats.percent}%</span>
              <span className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mt-0.5">Progress</span>
            </div>
          </div>

          <div className="text-center z-10">
            <div className="flex items-baseline justify-center gap-1 leading-none">
              <span className="text-4xl font-black text-white tracking-tighter">{stats.solved}</span>
              <span className="text-lg text-gray-700 font-bold tracking-tighter">/ {stats.total}</span>
            </div>
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mt-2">Solved Overall</p>
          </div>
        </div>

        {/* Right Column - Sleeker rows */}
        <div className="md:col-span-7 flex flex-col gap-3 justify-center">
          <DifficultyRow label="Easy" stats={stats.easy} color="#10b981" icon={<Flame size={14} />} />
          <DifficultyRow label="Medium" stats={stats.medium} color="#f59e0b" icon={<BarChart3 size={14} />} />
          <DifficultyRow label="Hard" stats={stats.hard} color="#ef4444" icon={<Trophy size={14} />} />
        </div>
      </div>
    </div>
  );
};

const DifficultyRow = ({ label, stats, color, icon }) => (
  <motion.div 
    whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.02)" }}
    className="bg-[#141414] border border-white/5 rounded-2xl p-3.5 px-5 flex items-center justify-between group transition-all"
  >
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-xl bg-black/40 border border-white/5 transition-colors ${stats.solved > 0 ? '' : 'text-gray-700'}`} style={{ color: stats.solved > 0 ? color : '' }}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className="text-xl font-black text-white">{stats.solved}</span>
          <span className="text-[10px] text-gray-700 font-bold tracking-tighter">/ {stats.total}</span>
        </div>
      </div>
    </div>
    
    <CircularProgress size={44} strokeWidth={5} percentage={stats.percent} color={color} isSmall />
  </motion.div>
);

const CircularProgress = ({ size, strokeWidth, percentage, color, glowColor, isSmall }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safePercent = Math.max(percentage, percentage > 0 ? 3 : 0);
  const offset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.03)" strokeWidth={strokeWidth} fill="transparent" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "circOut" }}
          strokeLinecap="round" fill="transparent"
          style={{ filter: glowColor ? `drop-shadow(0 0 8px ${glowColor})` : 'none' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`${isSmall ? 'text-[9px]' : 'hidden'} font-black text-white tracking-tighter`}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};

export default SolvedStats;