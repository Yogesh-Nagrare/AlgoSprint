import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, ChevronLeft, ChevronRight, Search, RotateCcw, 
  CheckCircle2, Circle, Layers, Check, ChevronDown, 
  Zap, Shuffle, BarChart3
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';

// --- CONSTANTS ---
const ITEMS_PER_PAGE = 10;
const TAGS = [
  "Array", "Linked List", "Graph", "Sliding Window", "Greedy Algorithm", 
  "Binary Search", "Tree", "Backtracking", "Sorting", "Recursion", 
  "Hash Table", "Stack", "Queue", "Heap", "Bit Manipulation", "Math", 
  "Two Pointers", "Graph Traversal", "Trie", "Union Find", "Segment Tree", 
  "Matrix", "String", "Binary Tree", "Depth-First Search", "Breadth-First Search"
];

// --- HELPER COMPONENTS ---

// 1. Difficulty Badge
const DifficultyBadge = ({ difficulty }) => {
    const styles = {
        easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]',
        medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]',
        hard: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.1)]'
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[difficulty?.toLowerCase()] || styles.easy}`}>
            {difficulty}
        </span>
    );
};

// 2. Custom Dropdown
const CustomDropdown = ({ options, value, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
      const handleClickOutside = (event) => { if (ref.current && !ref.current.contains(event.target)) setIsOpen(false); };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (
      <div className="relative" ref={ref}>
        <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between bg-[#111] hover:bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-gray-300 transition-all focus:border-violet-500/50">
            <span className="truncate">{value === 'all' ? `Select ${label}` : value}</span>
            <ChevronDown size={14} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute z-50 w-full mt-2 bg-[#151515] border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto no-scrollbar">
                    <div className="p-1">
                        <button onClick={() => { onChange('all'); setIsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between ${value === 'all' ? 'bg-violet-500/20 text-violet-400' : 'text-gray-400 hover:bg-white/5'}`}>
                            All {label}s {value === 'all' && <Check size={12} />}
                        </button>
                        {options.map((opt) => (
                            <button key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${value === opt ? 'bg-violet-500 text-white font-bold' : 'text-gray-300 hover:bg-white/5'}`}>
                                {opt} {value === opt && <Check size={12} />}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    );
};

// --- MAIN COMPONENT ---
const Problems = () => {
  const navigate = useNavigate();
  
  // Data State
  const [allProblems, setAllProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('default');
  
  // Filter State
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all',
    search: ''
  });

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
        try {
            setLoading(true);
            const [problemsRes, solvedRes] = await Promise.all([
                axiosClient.get('/problem/getAllProblem'),
                axiosClient.get('/problem/problemSolvedByUser')
            ]);
            setAllProblems(problemsRes.data);
            setSolvedProblems(solvedRes.data);
        } catch (error) {
            console.error("Error fetching problems:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  // Filter Logic
  const filteredProblems = useMemo(() => {
    let result = [...allProblems];

    if (filters.search) {
      result = result.filter(p => p.title.toLowerCase().includes(filters.search.toLowerCase()));
    }

    if (filters.difficulty !== 'all') {
      result = result.filter(p => p.difficulty?.toLowerCase() === filters.difficulty);
    }

    if (filters.tag !== 'all') {
      result = result.filter(p => 
        Array.isArray(p.tags) 
          ? p.tags.some(t => t.toLowerCase() === filters.tag.toLowerCase())
          : p.tags?.toLowerCase().includes(filters.tag.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      const solvedIds = new Set(solvedProblems.map(s => s._id));
      if (filters.status === 'solved') {
        result = result.filter(p => solvedIds.has(p._id));
      } else {
        result = result.filter(p => !solvedIds.has(p._id));
      }
    }

    if (sortBy === 'difficulty') {
      const diffOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
      result.sort((a, b) => (diffOrder[a.difficulty?.toLowerCase()] || 0) - (diffOrder[b.difficulty?.toLowerCase()] || 0));
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [allProblems, filters, sortBy, solvedProblems]);

  // Pagination
  const indexOfLastProblem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstProblem = indexOfLastProblem - ITEMS_PER_PAGE;
  const currentDisplayedProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);
  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE);

  const resetFilters = () => {
    setFilters({ difficulty: 'all', tag: 'all', status: 'all', search: '' });
    setSortBy("default");
    setCurrentPage(1);
  };

  const handleRandomPick = () => {
      const solvedIds = new Set(solvedProblems.map(s => s._id));
      const unsolved = allProblems.filter(p => !solvedIds.has(p._id));
      
      if (unsolved.length > 0) {
          const random = unsolved[Math.floor(Math.random() * unsolved.length)];
          navigate(`/problem/${random._id}`);
      } else {
          alert("You've solved all available problems!");
      }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-violet-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-20 left-1/4 w-[600px] h-[600px] bg-violet-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute top-40 -right-20 w-[500px] h-[500px] bg-amber-600/5 blur-[100px] rounded-full"></div>
      </div>

      <main className="relative max-w-7xl mx-auto px-6 py-10">
        
        {/* HEADER */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
            <div className="md:col-span-8 flex flex-col justify-center">
                <h1 className="text-5xl font-black text-white tracking-tight mb-4 leading-tight">
                    Problem <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Library</span>
                </h1>
                <p className="text-gray-500 text-sm font-medium max-w-md leading-relaxed mb-6">
                    Browse our extensive collection of algorithmic challenges designed to prepare you for technical interviews.
                </p>
                <div className="flex gap-3">
                    <button onClick={handleRandomPick} className="flex items-center gap-2 bg-white text-black px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        <Shuffle size={14} /> Pick Random
                    </button>
                </div>
            </div>
            
            {/* Quick Stats Card */}
            <div className="md:col-span-4">
                <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart3 size={80} /></div>
                    <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Total Solved</h3>
                    <div className="text-4xl font-black text-white mb-4">
                        {solvedProblems.length} <span className="text-lg text-gray-600">/ {allProblems.length}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                        <div 
                            className="bg-violet-500 h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${allProblems.length > 0 ? (solvedProblems.length / allProblems.length) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT CONTENT: Problems Table */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            
            {/* Toolbar */}
            <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 sticky top-4 z-30 shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Layers size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">Sort:</span>
                    </div>
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)} 
                        className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer hover:text-violet-400 transition-colors"
                    >
                        <option value="default" className="bg-[#111]">Recommended</option>
                        <option value="title" className="bg-[#111]">Title (A-Z)</option>
                        <option value="difficulty" className="bg-[#111]">Difficulty</option>
                    </select>
                </div>
                
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                        {filteredProblems.length} Problems
                    </span>
                    <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden p-2 bg-white/5 rounded-lg border border-white/10">
                        <Filter size={14} />
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <motion.div 
                layout
                className="bg-[#0a0a0a] rounded-[1.5rem] border border-white/5 overflow-hidden shadow-2xl min-h-[500px]"
            >
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                    <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
                </div>
              ) : filteredProblems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <Search size={32} className="text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No problems found</h3>
                    <p className="text-gray-500 text-xs mb-6">Adjust your filters to see more results.</p>
                    <button onClick={resetFilters} className="text-violet-400 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
                        Reset Filters
                    </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/5 text-gray-500">
                        <th className="p-5 text-[9px] font-black uppercase tracking-[0.2em] w-16 text-center">Stat</th>
                        <th className="p-5 text-[9px] font-black uppercase tracking-[0.2em]">Title</th>
                        <th className="p-5 text-[9px] font-black uppercase tracking-[0.2em] w-32 text-center hidden md:table-cell">Diff</th>
                        <th className="p-5 text-[9px] font-black uppercase tracking-[0.2em] w-48 text-center hidden lg:table-cell">Tags</th>
                        <th className="p-5 w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                        <AnimatePresence>
                        {currentDisplayedProblems.map((problem, idx) => {
                          const isSolved = solvedProblems.some(sp => sp._id === problem._id);
                          
                          return (
                            <motion.tr 
                                key={problem._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                onClick={() => navigate(`/problem/${problem._id}`)}
                                className="group hover:bg-white/[0.03] transition-colors cursor-pointer relative"
                            >
                              <td className="p-5 text-center">
                                {isSolved ? (
                                    <CheckCircle2 size={16} className="text-emerald-500 mx-auto drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                ) : (
                                    <Circle size={16} className="text-gray-700 mx-auto group-hover:text-gray-500 transition-colors" />
                                )}
                              </td>
                              <td className="p-5">
                                <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
                                    {problem.title}
                                </span>
                                <div className="md:hidden mt-2"><DifficultyBadge difficulty={problem.difficulty} /></div>
                              </td>
                              <td className="p-5 text-center hidden md:table-cell">
                                <DifficultyBadge difficulty={problem.difficulty} />
                              </td>
                              <td className="p-5 hidden lg:table-cell">
                                <div className="flex flex-wrap justify-center gap-1.5">
                                    {problem.tags && (Array.isArray(problem.tags) ? problem.tags : [problem.tags]).slice(0, 2).map((tag) => (
                                        <span key={tag} className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[9px] text-gray-400 group-hover:border-white/10 transition-colors">
                                            {tag}
                                        </span>
                                    ))}
                                    {/* Handle tag overflow */}
                                    {problem.tags && (Array.isArray(problem.tags) ? problem.tags.length : 1) > 2 && <span className="text-[9px] text-gray-600">...</span>}
                                </div>
                              </td>
                              <td className="p-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight size={16} className="text-violet-500" />
                              </td>
                            </motion.tr>
                          );
                        })}
                        </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination */}
              {filteredProblems.length > 0 && (
                  <div className="p-4 border-t border-white/5 flex items-center justify-between bg-[#0a0a0a]">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors">
                        <ChevronLeft size={16}/>
                    </button>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Page <span className="text-white">{currentPage}</span> of {totalPages}
                    </span>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors">
                        <ChevronRight size={16}/>
                    </button>
                  </div>
              )}
            </motion.div>
          </div>

          {/* RIGHT SIDEBAR: Filters */}
          <div className={`lg:col-span-1 order-1 lg:order-2 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-[#0a0a0a] p-6 rounded-[2rem] border border-white/5 sticky top-24 space-y-8 shadow-2xl backdrop-blur-sm">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                    <Filter size={12} className="text-violet-500"/> Filters
                </h3>
                <button onClick={resetFilters} className="text-[10px] text-gray-600 hover:text-violet-500 font-bold uppercase transition-colors flex items-center gap-1">
                    <RotateCcw size={10} /> Reset
                </button>
              </div>

              {/* Search */}
              <div className="space-y-3">
                <label className="text-[9px] font-black text-gray-500 uppercase ml-1">Search Problems</label>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-violet-500 transition-colors" size={14}/>
                    <input 
                        type="text" 
                        placeholder="Keyword..." 
                        value={filters.search} 
                        onChange={(e) => { setFilters({...filters, search: e.target.value}); setCurrentPage(1); }} 
                        className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-gray-300 focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)] outline-none transition-all" 
                    />
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-3">
                <p className="text-[9px] font-black text-gray-500 uppercase ml-1">Difficulty</p>
                <div className="flex flex-wrap gap-2">
                  {['all', 'easy', 'medium', 'hard'].map(d => (
                    <button 
                        key={d} 
                        onClick={() => { setFilters({...filters, difficulty: d}); setCurrentPage(1); }} 
                        className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${
                            filters.difficulty === d 
                            ? 'bg-violet-500 text-white border-violet-500 shadow-lg shadow-violet-500/20' 
                            : 'bg-[#111] border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
                        }`}
                    >
                        {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-3">
                <p className="text-[9px] font-black text-gray-500 uppercase ml-1">Status</p>
                <div className="flex flex-col gap-2">
                  {['all', 'solved', 'unsolved'].map(s => (
                    <button 
                        key={s} 
                        onClick={() => { setFilters({...filters, status: s}); setCurrentPage(1); }} 
                        className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold uppercase border transition-all flex justify-between items-center ${
                            filters.status === s 
                            ? 'bg-white/5 border-violet-500/50 text-white' 
                            : 'bg-transparent border-white/5 text-gray-500 hover:bg-white/5'
                        }`}
                    >
                        {s}
                        {filters.status === s && <Check size={12} className="text-violet-500"/>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag Dropdown */}
              <div className="space-y-3">
                 <p className="text-[9px] font-black text-gray-500 uppercase ml-1">Topic</p>
                 <CustomDropdown 
                    options={TAGS} 
                    value={filters.tag} 
                    label="Topic"
                    onChange={(val) => { setFilters({...filters, tag: val}); setCurrentPage(1); }}
                />
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Problems;