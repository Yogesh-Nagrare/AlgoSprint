import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Search, 
  ChevronLeft, 
  AlertTriangle, 
  Loader2, 
  Hash, 
  Database 
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      setError('System Failure: Unable to sync with central database.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('CRITICAL: Are you sure you want to permanently delete this problem?')) return;
    
    try {
      await axiosClient.delete(`/problem/delete/${id}`);
      setProblems(problems.filter(problem => problem._id !== id));
    } catch (err) {
      setError('Deletion failed: Database rejected the request.');
      console.error(err);
    }
  };

  const filteredProblems = useMemo(() => {
    return problems.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [problems, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center gap-4">
        <Loader2 className="animate-spin text-orange-500" size={40} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Accessing Vault...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 pb-20 selection:bg-red-500/30">
      <div className="max-w-6xl mx-auto px-6 pt-12">
        
        {/* Navigation & Stats Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <button 
              onClick={() => window.history.back()}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-all mb-6"
            >
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Admin Portal
            </button>
            <h1 className="text-5xl font-black text-white tracking-tighter">
              Danger <span className="text-red-500">Zone.</span>
            </h1>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative">
              <input 
                type="text"
                placeholder="Find problem to purge..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-72 bg-[#111] border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-xs focus:ring-1 focus:ring-red-500 outline-none transition-all placeholder:text-gray-600"
              />
              <Search className="absolute left-4 top-3.5 text-gray-600" size={16} />
            </div>
            
            <div className="hidden lg:flex items-center gap-3 bg-red-500/5 border border-red-500/10 px-4 py-2 rounded-2xl">
              <Database size={14} className="text-red-500" />
              <span className="text-[10px] font-bold text-red-500 uppercase">Records: {problems.length}</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl flex items-center gap-4 text-red-500 text-sm font-bold mb-10"
          >
            <AlertTriangle size={20} />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Data Grid Container */}
        <div className="bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="table w-full border-collapse">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.01]">
                  <th className="py-7 px-10 font-black">Entry</th>
                  <th className="py-7 text-center font-black">Difficulty</th>
                  <th className="py-7 text-center font-black">Category</th>
                  <th className="py-7 text-right px-10 font-black">Authorization</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.04]">
                <AnimatePresence mode='popLayout'>
                  {filteredProblems.map((problem, index) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      key={problem._id} 
                      className="group hover:bg-red-500/[0.02] transition-colors"
                    >
                      {/* Title & ID */}
                      <td className="py-7 px-10">
                        <div className="flex items-center gap-5">
                          <span className="text-[10px] font-mono text-gray-700 font-bold">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <div className="text-sm font-bold text-gray-200 group-hover:text-red-500 transition-colors">
                              {problem.title}
                            </div>
                            <div className="text-[9px] font-mono text-gray-600 mt-1 uppercase tracking-tighter">
                              UUID: {problem._id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Difficulty Chip */}
                      <td className="py-7 text-center">
                        <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter border ${getDiffStyles(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      </td>

                      {/* Tags */}
                      <td className="py-7 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-gray-500">
                          <Hash size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {Array.isArray(problem.tags) ? problem.tags[0] : (problem.tags || 'General')}
                          </span>
                        </div>
                      </td>

                      {/* Delete Action */}
                      <td className="py-7 px-10 text-right">
                        <button 
                          onClick={() => handleDelete(problem._id)}
                          className="p-3 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-500 rounded-xl transition-all border border-white/5"
                          title="Purge Record"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredProblems.length === 0 && !loading && (
            <div className="p-24 text-center">
              <Database className="mx-auto text-gray-800 mb-4" size={48} />
              <p className="text-gray-600 text-sm font-medium">No records found matching your query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getDiffStyles = (diff) => {
  const d = diff?.toLowerCase();
  if (d === 'easy') return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  if (d === 'medium') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
  if (d === 'hard') return 'text-red-500 bg-red-500/10 border-red-500/20';
  return 'text-gray-400 bg-white/5 border-white/10';
};

export default AdminDelete;