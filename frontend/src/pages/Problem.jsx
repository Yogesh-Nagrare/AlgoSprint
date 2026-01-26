import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming react-router-dom v6
import { motion } from 'framer-motion';
import axiosClient from '../utils/axiosClient'; // Adjust path as needed
import Loading from '../components/Loading'; // Your loading component
import { 
    Filter, 
    CheckCircle2, 
    ChevronLeft, 
    ChevronRight, 
    Code2, 
    Database, 
    Network, 
    Cpu 
} from 'lucide-react';

const Problems = () => {
    const navigate = useNavigate();
    
    // --- State Management ---
    const [problems, setProblems] = useState([]);
    const [solvedProblems, setSolvedProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    
    // Filtering & Sorting State
    const [sortBy, setSortBy] = useState('default');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const problemsPerPage = 10;

    // --- Fetch Data ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all problems
                const problemsRes = await axiosClient.get('/problem/getAllProblem');
                setProblems(problemsRes.data);

                // Fetch user's solved problems
                try {
                    const solvedRes = await axiosClient.get('/problem/solvedProblembyUser');
                    setSolvedProblems(solvedRes.data || []);
                } catch (err) {
                    console.log("User not logged in or no solved problems");
                }
            } catch (error) {
                console.error("Error fetching problems:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- Helpers ---
    const getDifficultyStyles = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20';
            case 'medium': return 'text-amber-400 bg-amber-400/10 border border-amber-400/20';
            case 'hard': return 'text-rose-500 bg-rose-500/10 border border-rose-500/20';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    const getCategoryIcon = (tag) => {
        switch (tag?.toLowerCase()) {
            case 'dp': return <Cpu size={14} />;
            case 'graph': return <Network size={14} />;
            case 'linkedlist': return <Database size={14} />;
            default: return <Code2 size={14} />;
        }
    };

    // --- Filtering Logic ---
    const filteredProblems = problems.filter(prob => {
        const diffMatch = selectedDifficulty === 'all' || prob.difficulty?.toLowerCase() === selectedDifficulty;
        const catMatch = selectedCategory === 'all' || prob.tags?.includes(selectedCategory);
        return diffMatch && catMatch;
    }).sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'difficulty') {
            const levels = { easy: 1, medium: 2, hard: 3 };
            return levels[a.difficulty] - levels[b.difficulty];
        }
        return 0;
    });

    // --- Pagination Logic ---
    const indexOfLastProblem = currentPage * problemsPerPage;
    const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
    const currentDisplayedProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);
    const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Problem Set</h1>
                    <p className="text-gray-500 text-sm">Level up your coding skills with our curated challenges.</p>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* LEFT COLUMN: Problems List (Your Snippet) */}
                    <div className="lg:col-span-3">
                        <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <Filter size={16} /><span className="text-xs font-bold">Filters</span>
                                </button>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 outline-none cursor-pointer hover:bg-white/10 transition-colors">
                                    <option value="default" className="bg-[#1a1a1a]">Default Order</option>
                                    <option value="title" className="bg-[#1a1a1a]">Sort by Title</option>
                                    <option value="difficulty" className="bg-[#1a1a1a]">Sort by Difficulty</option>
                                </select>
                            </div>
                            <div className="text-xs text-gray-500 font-bold">
                                Showing {indexOfFirstProblem + 1}-{Math.min(indexOfLastProblem, filteredProblems.length)} of {filteredProblems.length}
                            </div>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0f0f0f] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
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
                                                        {isSolved ? <CheckCircle2 size={18} className="text-emerald-500 mx-auto" /> : <div className="w-4 h-4 rounded-full border border-white/20 mx-auto group-hover:border-white/40"></div>}
                                                    </td>
                                                    <td className="p-6">
                                                        <span className="text-sm font-bold group-hover:text-orange-500 transition-colors">{problem.title}</span>
                                                    </td>
                                                    <td className="p-6 text-center hidden md:table-cell">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getDifficultyStyles(problem.difficulty)}`}>{problem.difficulty}</span>
                                                    </td>
                                                    <td className="p-6 text-center hidden lg:table-cell">
                                                        <div className="flex items-center justify-center gap-2 text-gray-400">{getCategoryIcon(problem.tags?.[0])} <span className="text-[10px] font-bold uppercase">{problem.tags?.[0] || 'Logic'}</span></div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {currentDisplayedProblems.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="p-10 text-center text-gray-500 text-sm">No problems found matching your filters.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination */}
                            <div className="p-6 border-t border-white/10 flex items-center justify-between bg-white/[0.01]">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-30 text-gray-400 hover:text-white transition-colors"><ChevronLeft size={20}/></button>
                                <div className="text-xs font-bold text-gray-400">Page {currentPage} of {totalPages || 1}</div>
                                <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-30 text-gray-400 hover:text-white transition-colors"><ChevronRight size={20}/></button>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: Sidebar Filters (To fill the 4th column) */}
                    <div className={`lg:col-span-1 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        {/* Difficulty Card */}
                        <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Difficulty</h3>
                            <div className="space-y-2">
                                {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
                                    <button
                                        key={diff}
                                        onClick={() => setSelectedDifficulty(diff.toLowerCase())}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                                            selectedDifficulty === diff.toLowerCase() 
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Card */}
                        <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {['All', 'Array', 'String', 'DP', 'Graph', 'Tree'].map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setSelectedCategory(tag.toLowerCase())}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                                            selectedCategory === tag.toLowerCase()
                                            ? 'bg-white text-black border-white'
                                            : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30 hover:text-gray-300'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Problems;