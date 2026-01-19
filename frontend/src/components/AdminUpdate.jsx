import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Edit3, 
  ChevronLeft, 
  Code, 
  Hash, 
  Loader2, 
  AlertCircle,
  Filter
} from 'lucide-react';
import AdminPanel from './AdminPanel';
import axiosClient from '../utils/axiosClient';

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (err) {
      setError('System Failure: Unable to sync with the central database.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get(`/problem/problemById/${id}`);
      setSelectedProblem(data);
    } catch (err) {
      setError('Failed to initialize problem editor.');
    } finally {
      setLoading(false);
    }
  };

  // Live filtering logic
  const filteredProblems = useMemo(() => {
    return problems.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(p.tags) ? p.tags.join(' ') : p.tags)?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [problems, searchTerm]);

  if (selectedProblem) {
    return <AdminPanel defaultProblem={selectedProblem} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 pb-20 selection:bg-orange-500/30">
      <div className="max-w-6xl mx-auto px-6 pt-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <button 
              onClick={() => window.history.back()}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-all mb-6"
            >
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Return to Control Center
            </button>
            <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
              Modify <span className="text-orange-500">Challenges.</span>
            </h1>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <input 
              type="text"
              placeholder="Search by title or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-xs focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-600 font-medium"
            />
            <Search className="absolute left-4 top-4 text-gray-600" size={16} />
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl flex items-center gap-4 text-red-500 text-sm font-bold mb-10">
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}

        {/* Problem Inventory List */}
        <div className="bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative">
          <div className="overflow-x-auto">
            <table className="table w-full border-collapse">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.01]">
                  <th className="py-7 px-10 font-black">Problem Definition</th>
                  <th className="py-7 text-center font-black">Difficulty</th>
                  <th className="py-7 text-center font-black">Category</th>
                  <th className="py-7 text-right px-10 font-black">Management</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.04]">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-orange-500" size={32} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Syncing Problem Set...</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredProblems.map((problem, index) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={problem._id} 
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-6 px-10">
                          <div className="flex items-center gap-5">
                            <div className="p-3 bg-white/5 rounded-xl text-gray-500 group-hover:text-orange-500 transition-colors">
                              <Code size={18} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-200 group-hover:translate-x-1 transition-transform">{problem.title}</div>
                              <div className="text-[9px] font-mono text-gray-600 uppercase tracking-tighter mt-1">UUID: {problem._id.slice(-12)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 text-center">
                          <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter border ${getDifficultyStyles(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="py-6 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-gray-500">
                             <Hash size={12} />
                             <span className="text-[10px] font-bold uppercase tracking-widest">{problem.tags || 'General'}</span>
                          </div>
                        </td>
                        <td className="py-6 px-10 text-right">
                          <button
                            onClick={() => handleEdit(problem._id)}
                            className="p-3 bg-white/5 hover:bg-orange-500/20 text-gray-400 hover:text-orange-500 rounded-xl transition-all flex items-center gap-2 ml-auto text-[10px] font-black uppercase tracking-widest"
                          >
                            <Edit3 size={14} />
                            Modify
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
          
          {!loading && filteredProblems.length === 0 && (
            <div className="p-24 text-center">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter size={24} className="text-gray-600" />
               </div>
               <p className="text-gray-500 text-sm font-medium">No results match your current search criteria.</p>
               <button onClick={() => setSearchTerm("")} className="text-orange-500 text-xs mt-2 font-bold hover:underline">Clear search</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getDifficultyStyles = (difficulty) => {
  const d = difficulty?.toLowerCase();
  switch (d) {
    case 'easy': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    case 'hard': return 'text-red-500 bg-red-500/10 border-red-500/20';
    default: return 'text-gray-400 bg-white/5 border-white/10';
  }
};

export default AdminDelete;