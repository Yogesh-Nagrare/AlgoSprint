import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Upload, 
  Trash2, 
  ChevronLeft, 
  AlertCircle, 
  Hash, 
  Loader2, 
  MonitorPlay 
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (err) {
      setError('System failure: Unable to fetch repository.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video problem?')) return;
    
    try {
      await axiosClient.delete(`/video/delete/${id}`);
      setProblems(problems.filter(problem => problem._id !== id));
    } catch (err) {
      // Maintaining your original error catching logic
      setError(err);
      console.log(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center gap-4">
        <Loader2 className="animate-spin text-orange-500" size={40} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Syncing Media...</span>
      </div>
    );
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
              Admin Center
            </button>
            <h1 className="text-5xl font-black text-white tracking-tighter">
              Video <span className="text-orange-500">Assets.</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2 rounded-2xl">
            <MonitorPlay size={18} className="text-orange-500" />
            <span className="text-xs font-bold text-gray-400">Total Entries: {problems.length}</span>
          </div>
        </div>

        {/* Error Handling UI */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 p-5 rounded-[2rem] flex items-center gap-4 text-red-500 text-sm font-bold mb-10"
          >
            <AlertCircle size={20} />
            <span>{error?.response?.data?.error || "An unexpected error occurred."}</span>
          </motion.div>
        )}

        {/* Data Grid Container */}
        <div className="bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="table w-full border-collapse">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.01]">
                  <th className="py-7 px-10 font-black">Media Detail</th>
                  <th className="py-7 text-center font-black">Difficulty</th>
                  <th className="py-7 text-center font-black">Category</th>
                  <th className="py-7 text-right px-10 font-black">Asset Control</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.04]">
                <AnimatePresence mode='popLayout'>
                  {problems.map((problem, index) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={problem._id} 
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Title Column */}
                      <td className="py-7 px-10">
                        <div className="flex items-center gap-5">
                          <span className="text-[10px] font-mono text-gray-700 font-bold">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <div className="text-sm font-bold text-gray-200 group-hover:text-orange-400 transition-colors">
                              {problem.title}
                            </div>
                            <div className="text-[9px] font-mono text-gray-600 mt-1 uppercase">
                              REF_ID: {problem._id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Difficulty Column */}
                      <td className="py-7 text-center">
                        <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${getDiffStyles(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      </td>

                      {/* Tags Column */}
                      <td className="py-7 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-gray-500">
                          <Hash size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {problem.tags || 'General'}
                          </span>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="py-7 px-10 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <NavLink 
                            to={`/admin/upload/${problem._id}`}
                            className="flex items-center gap-2 bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                          >
                            <Upload size={14} />
                            Upload
                          </NavLink>
                          <button 
                            onClick={() => handleDelete(problem._id)}
                            className="p-2.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl transition-all border border-white/5"
                            title="Delete Media"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {problems.length === 0 && (
            <div className="p-24 text-center">
              <Video className="mx-auto text-gray-800 mb-4" size={48} />
              <p className="text-gray-600 text-sm font-medium">No video problems found in database.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getDiffStyles = (diff) => {
  const d = diff?.toLowerCase();
  if (d === 'easy') return 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20';
  if (d === 'medium') return 'text-yellow-500 bg-yellow-500/10 border border-yellow-500/20';
  if (d === 'hard') return 'text-red-500 bg-red-500/10 border border-red-500/20';
  return 'text-gray-400 bg-white/5';
};

export default AdminDelete;