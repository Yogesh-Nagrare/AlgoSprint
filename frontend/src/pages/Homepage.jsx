import { useEffect, useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router'; 
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, RotateCcw, Code, Database, Brain, Hash, Layout, CheckCircle2, Menu, X, TrendingUp, Award, Target, Zap, Clock, Calendar, Filter, Plus } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import SolvedStats from '../components/SolvedStats';
import DailyChallengeCard from '../components/DailyChallengeCard';
import { FileSpreadsheet } from 'lucide-react';

import {ArrowRight, BarChart3, Layers } from 'lucide-react';

// Helper to get Category Icons
const getCategoryIcon = (tag) => {
  const t = tag?.toLowerCase() || '';
  if (t.includes('array') || t.includes('string')) return <Code size={14} className="text-blue-400" />;
  if (t.includes('hash') || t.includes('sorting')) return <Hash size={14} className="text-purple-400" />;
  if (t.includes('dp') || t.includes('greedy')) return <Brain size={14} className="text-pink-400" />;
  if (t.includes('math')) return <Layout size={14} className="text-orange-400" />;
  return <Database size={14} className="text-emerald-400" />;
};

// Helper for Difficulty Badge Styles
const getDifficultyStyles = (difficulty) => {
  const d = difficulty?.toLowerCase();
  if (d === 'easy') return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
  if (d === 'medium') return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
  if (d === 'hard') return 'bg-red-500/10 text-red-500 border border-red-500/20';
  return 'bg-gray-500/10 text-gray-500 border border-gray-500/20';
};

function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetsLoading, setSheetsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [problemsPerPage] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all',
    search: '' 
  });

  // Fetch problems and solved problems
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [probRes, solvedRes] = await Promise.all([
          axiosClient.get('/problem/getAllProblem'),
          user ? axiosClient.get('/problem/problemSolvedByUser') : Promise.resolve({ data: [] })
        ]);
        setProblems(probRes.data);
        setSolvedProblems(solvedRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Fetch all sheets
  useEffect(() => {
    const fetchSheets = async () => {
      setSheetsLoading(true);
      try {
        const response = await axiosClient.get('/problem/sheets/all');
        setSheets(response.data);
      } catch (error) {
        console.error('Error fetching sheets:', error);
      } finally {
        setSheetsLoading(false);
      }
    };
    fetchSheets();
  }, []);

  const filteredProblems = useMemo(() => {
    let filtered = problems.filter(problem => {
      const isSolved = solvedProblems.some(sp => sp._id === problem._id);
      const difficultyMatch = filters.difficulty === 'all' || problem.difficulty.toLowerCase() === filters.difficulty.toLowerCase();
      const tagMatch = filters.tag === 'all' || 
                       (Array.isArray(problem.tags) 
                        ? problem.tags.some(t => t.toLowerCase() === filters.tag.toLowerCase())
                        : problem.tags?.toLowerCase() === filters.tag.toLowerCase());

      const searchMatch = problem.title.toLowerCase().includes(filters.search.toLowerCase());
      let statusMatch = true;
      if (filters.status === 'solved') statusMatch = isSolved;
      if (filters.status === 'unsolved') statusMatch = !isSolved;
      
      return difficultyMatch && tagMatch && statusMatch && searchMatch;
    });

    if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'difficulty') {
      const diffOrder = { easy: 1, medium: 2, hard: 3 };
      filtered.sort((a, b) => diffOrder[a.difficulty.toLowerCase()] - diffOrder[b.difficulty.toLowerCase()]);
    }

    return filtered;
  }, [problems, solvedProblems, filters, sortBy]);

  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentDisplayedProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);
  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070707] via-[#0a0a0a] to-[#050505] text-gray-200 font-sans pb-20 selection:bg-orange-500/30">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* NAVBAR */}
      <nav className="bg-[#0c0c0c]/90 backdrop-blur-2xl border-b border-white/10 px-4 md:px-12 h-16 sticky top-0 z-50 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-10">
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 p-1.5 rounded-xl text-black transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-[0_0_20px_rgba(249,115,22,0.5)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
            </div>
            <span className="text-xl font-black text-white tracking-tighter italic">ALGO<span className="text-orange-500">SPRINT</span></span>
          </NavLink>

          <div className="hidden lg:flex items-center gap-8 ml-4">
            <NavLink to="/" className={({ isActive }) => `text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-white relative group ${isActive ? 'text-orange-500' : 'text-gray-500'}`}>
              Problems
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
            </NavLink>
            <NavLink to="/contests" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-all relative group">
              Contests
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
            </NavLink>
            <NavLink to="/leaderboard" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-all relative group">
              Leaderboard
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
            </NavLink>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:flex px-5 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/30 text-orange-500 text-[10px] font-black uppercase tracking-widest hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-black transition-all duration-300">
            <Zap size={12} className="mr-1" /> Premium
          </button>

          {user ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="group flex items-center gap-3 bg-white/5 border border-white/10 p-1 pr-3 rounded-full hover:bg-white/10 transition-all">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20 flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-purple-500/20 group-hover:border-orange-500/50">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt="profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-black text-orange-500">{user.firstName?.substring(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-xs font-bold text-gray-300 group-hover:text-white">{user.firstName}</span>
              </div>
              <ul tabIndex={0} className="mt-3 p-2 shadow-2xl menu dropdown-content bg-[#111] rounded-2xl w-52 border border-white/10 backdrop-blur-xl">
                {user.role === 'admin' && <li><button onClick={() => navigate('/admin')} className="hover:text-orange-500">Admin Panel</button></li>}
                <li><button onClick={() => navigate('/profile')}>Profile</button></li>
                <li><button onClick={() => dispatch(logoutUser())} className="text-red-400">Logout</button></li>
              </ul>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-orange-500">Sign In</button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-10 relative z-10">
        
        {/* Stats and Top Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                    <div><p className="text-2xl font-black text-white">{solvedProblems.length}</p><p className="text-[9px] font-bold text-emerald-400 uppercase">Solved</p></div>
                </div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <Target size={20} className="text-blue-400" />
                    <div><p className="text-2xl font-black text-white">{problems.length}</p><p className="text-[9px] font-bold text-blue-400 uppercase">Total</p></div>
                </div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <TrendingUp size={20} className="text-purple-400" />
                    <div><p className="text-2xl font-black text-white">{problems.length > 0 ? Math.round((solvedProblems.length / problems.length) * 100) : 0}%</p><p className="text-[9px] font-bold text-purple-400 uppercase">Progress</p></div>
                </div>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <Award size={20} className="text-orange-400" />
                    <div><p className="text-2xl font-black text-white">7</p><p className="text-[9px] font-bold text-orange-400 uppercase">Streak</p></div>
                </div>
            </div>
        </motion.div>

{/* DSA SHEETS SECTION */}
<section className="mb-24 relative">
  {/* Section Header */}
  <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 relative z-10">
    <div className="space-y-2">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-500 text-[9px] font-black uppercase tracking-[0.2em]">
        <Layers size={10} /> Structured Learning
      </div>
      <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase">
        CURATED <span className="text-orange-500">SHEETS</span>
      </h2>
      <p className="text-gray-500 text-sm font-medium max-w-md">
        Battle-tested roadmaps designed by engineers from Google, Meta, and Amazon.
      </p>
    </div>
    
    <div className="flex items-center gap-3">
      {user?.role === 'admin' && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/admin/sheet')}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl hover:bg-orange-500 transition-all text-[10px] font-black uppercase tracking-widest shadow-xl"
        >
          <Plus size={16} strokeWidth={3} /> Create New
        </motion.button>
      )}
    </div>
  </div>

  {sheetsLoading ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-[380px] bg-white/5 animate-pulse rounded-[32px] border border-white/5" />
      ))}
    </div>
  ) : sheets.length === 0 ? (
    <div className="bg-[#0a0a0a] border border-dashed border-white/10 rounded-[40px] py-20 text-center">
       <Database className="mx-auto text-gray-800 mb-4" size={48} />
       <p className="text-gray-500 font-bold">No sheets available in the database yet.</p>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sheets.map((sheet, index) => (
        <motion.div
          key={sheet._id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -8 }}
          className="group relative h-full flex flex-col bg-gradient-to-b from-[#141414] to-[#090909] border border-white/10 rounded-[35px] p-7 transition-all duration-500 hover:border-orange-500/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(249,115,22,0.1)]"
        >
          {/* Top Section: Icon & Info */}
          <div className="flex justify-between items-start mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-4 bg-black border border-white/10 rounded-2xl text-orange-500 group-hover:border-orange-500/50 transition-colors">
    <FileSpreadsheet />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-orange-500/20">
                PRO
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                {sheet.totalProblems || 0} Problems
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="flex-grow">
            <h3 className="text-xl font-black text-white mb-3 tracking-tighter italic uppercase group-hover:text-orange-500 transition-colors">
              {sheet.title}
            </h3>
            <p className="text-[11px] text-gray-500 font-bold leading-relaxed line-clamp-3 mb-6 uppercase tracking-tight opacity-80">
              {sheet.description || "Master the core patterns used by top-tier tech companies to evaluate candidates."}
            </p>
          </div>

          {/* Progress Section */}
          <div className="space-y-4 mt-auto">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-400">
               <span>Completion</span>
               <span className="text-orange-500">32%</span>
            </div>
            <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '32%' }}
                className="h-full bg-gradient-to-r from-orange-600 to-orange-400 relative"
              >
                 <div className="absolute top-0 right-0 h-full w-2 bg-white/20 animate-pulse"></div>
              </motion.div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => navigate(`/sheet/${sheet._id}`)}
                className="flex-[3] py-3.5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-500 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                Start Sprint <ArrowRight size={14} strokeWidth={3} />
              </button>
              <button 
                className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center active:scale-95"
              >
                <BarChart3 size={16} />
              </button>
            </div>
          </div>

          {/* Card Shine Effect */}
          <div className="absolute inset-0 rounded-[35px] bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent pointer-events-none" />
        </motion.div>
      ))}
    </div>
  )}
</section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <DailyChallengeCard/>
          <SolvedStats problems={problems} solvedProblems={solvedProblems} />
        </div>

        {/* Filters and Problems */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                        <Filter size={16} /><span className="text-xs font-bold">Filters</span>
                    </button>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 outline-none">
                        <option value="default">Default Order</option>
                        <option value="title">Sort by Title</option>
                        <option value="difficulty">Sort by Difficulty</option>
                    </select>
                </div>
                <div className="text-xs text-gray-500 font-bold">Showing {indexOfFirstProblem + 1}-{Math.min(indexOfLastProblem, filteredProblems.length)} of {filteredProblems.length}</div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0f0f0f] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              {loading ? (
                <div className="p-20 flex items-center justify-center"><div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/10">
                        <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] w-20 text-center">Status</th>
                        <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Problem Title</th>
                        <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] text-center hidden md:table-cell">Difficulty</th>
                        <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] text-center hidden lg:table-cell">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {currentDisplayedProblems.map((problem) => {
                          const isSolved = solvedProblems.some(sp => sp._id === problem._id);
                          return (
                            <tr key={problem._id} className="group cursor-pointer hover:bg-white/[0.02] transition-all" onClick={() => navigate(`/problem/${problem._id}`)}>
                              <td className="p-6 text-center">
                                {isSolved ? <CheckCircle2 size={18} className="text-emerald-500 mx-auto" /> : <div className="w-4 h-4 rounded-full border border-white/20 mx-auto"></div>}
                              </td>
                              <td className="p-6">
                                <span className="text-sm font-bold group-hover:text-orange-500 transition-colors">{problem.title}</span>
                              </td>
                              <td className="p-6 text-center hidden md:table-cell">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getDifficultyStyles(problem.difficulty)}`}>{problem.difficulty}</span>
                              </td>
                              <td className="p-6 text-center hidden lg:table-cell">
                                <div className="flex items-center justify-center gap-2 text-gray-400">{getCategoryIcon(problem.tags?.[0])} <span className="text-[10px] font-bold">{problem.tags?.[0] || 'Logic'}</span></div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Pagination */}
              <div className="p-6 border-t border-white/10 flex items-center justify-between bg-white/[0.01]">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-30"><ChevronLeft/></button>
                <div className="text-xs font-bold">Page {currentPage} of {totalPages}</div>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-30"><ChevronRight/></button>
              </div>
            </motion.div>
          </div>

          {/* SIDEBAR FILTERS */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-[#0f0f0f] p-8 rounded-2xl border border-white/10 sticky top-24 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2"><Filter size={14} className="text-orange-500"/> Filters</h3>
                <button onClick={() => setFilters({difficulty:'all', tag:'all', status:'all', search:''})} className="text-gray-500 hover:text-orange-500 transition-all"><RotateCcw size={14}/></button>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                <input type="text" placeholder="Search..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs focus:border-orange-500/50 outline-none" />
              </div>

              <div className="space-y-4">
                <p className="text-[9px] font-black text-gray-500 uppercase">Difficulty</p>
                <div className="flex flex-wrap gap-2">
                  {['all', 'easy', 'medium', 'hard'].map(d => (
                    <button key={d} onClick={() => setFilters({...filters, difficulty: d})} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase border transition-all ${filters.difficulty === d ? 'bg-orange-500 border-orange-500 text-black' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}>{d}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[9px] font-black text-gray-500 uppercase">Status</p>
                <div className="flex flex-col gap-2">
                  {['all', 'solved', 'unsolved'].map(s => (
                    <button key={s} onClick={() => setFilters({...filters, status: s})} className={`text-left px-4 py-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${filters.status === s ? 'bg-white/10 border-orange-500/50 text-orange-500' : 'bg-transparent border-white/5 text-gray-500 hover:bg-white/5'}`}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Homepage;