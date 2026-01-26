import { useState, useEffect, useMemo } from 'react';
import axiosClient from '../utils/axiosClient';
import { 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    Clock, 
    Cpu, 
    Database, 
    Calendar, 
    Code2, 
    Copy, 
    Check, 
    Filter,
    Terminal
} from 'lucide-react';

const SubmissionHistory = ({ problemId }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'accepted', 'wrong'
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
                // Sort by date descending (newest first)
                const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setSubmissions(sorted);
                setError(null);
            } catch (err) {
                setError('Failed to fetch submission history');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, [problemId]);

    // --- COMPUTED STATS ---
    const stats = useMemo(() => {
        const total = submissions.length;
        const accepted = submissions.filter(s => s.status === 'accepted').length;
        const rate = total === 0 ? 0 : Math.round((accepted / total) * 100);
        return { total, accepted, rate };
    }, [submissions]);

    const filteredSubmissions = useMemo(() => {
        if (filterStatus === 'all') return submissions;
        if (filterStatus === 'accepted') return submissions.filter(s => s.status === 'accepted');
        return submissions.filter(s => s.status !== 'accepted');
    }, [submissions, filterStatus]);

    // --- UTILS ---
    const formatMemory = (memory) => {
        if (!memory) return 'N/A';
        if (memory < 1024) return `${memory} KB`;
        return `${(memory / 1024).toFixed(1)} MB`;
    };

    const formatTimeRelative = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case 'accepted': 
                return { icon: <CheckCircle2 size={16} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Accepted' };
            case 'wrong': 
                return { icon: <XCircle size={16} />, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Wrong Answer' };
            case 'time_limit_exceeded':
                return { icon: <Clock size={16} />, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'TLE' };
            default: 
                return { icon: <AlertCircle size={16} />, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Error' };
        }
    };

    const handleCopyCode = () => {
        if (!selectedSubmission) return;
        navigator.clipboard.writeText(selectedSubmission.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-white/5"></div>
                <div className="h-4 w-32 bg-white/5 rounded"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                <XCircle size={20} />
                <span>{error}</span>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto space-y-6 text-gray-300 font-sans">
            
            {/* 1. Header & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1e1e1e] p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Submissions</span>
                    <span className="text-3xl font-mono text-white mt-1">{stats.total}</span>
                </div>
                <div className="bg-[#1e1e1e] p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Accepted</span>
                    <span className="text-3xl font-mono text-emerald-400 mt-1">{stats.accepted}</span>
                </div>
                <div className="bg-[#1e1e1e] p-4 rounded-xl border border-white/5 flex flex-col justify-between relative overflow-hidden">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Acceptance Rate</span>
                    <span className="text-3xl font-mono text-orange-400 mt-1">{stats.rate}%</span>
                    {/* Background Chart Effect */}
                    <div className="absolute right-0 bottom-0 opacity-10">
                        <svg width="100" height="40" viewBox="0 0 100 40">
                            <path d="M0 40 L20 20 L40 30 L60 10 L80 25 L100 5 V40 Z" fill="currentColor" className="text-orange-500"/>
                        </svg>
                    </div>
                </div>
            </div>

            {/* 2. Filters */}
            <div className="flex items-center gap-2 border-b border-white/5 pb-1">
                {['all', 'accepted', 'error'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilterStatus(f)}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-all ${
                            filterStatus === f 
                                ? 'text-white border-b-2 border-orange-500 bg-white/5' 
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                        }`}
                    >
                        {f === 'error' ? 'Wrong / Error' : f}
                    </button>
                ))}
            </div>

            {/* 3. Submissions List */}
            {filteredSubmissions.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center opacity-50">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Terminal size={24} className="text-gray-500"/>
                    </div>
                    <h3 className="text-lg font-medium text-gray-300">No submissions found</h3>
                    <p className="text-sm text-gray-500">Try solving the problem!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredSubmissions.map((sub) => {
                        const statusConfig = getStatusConfig(sub.status);
                        return (
                            <div 
                                key={sub._id}
                                onClick={() => setSelectedSubmission(sub)}
                                className="group bg-[#1e1e1e] hover:bg-[#262626] border border-white/5 hover:border-white/10 rounded-xl p-4 cursor-pointer transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Status Icon */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${statusConfig.bg} ${statusConfig.color}`}>
                                        {statusConfig.icon}
                                    </div>
                                    
                                    <div>
                                        <div className={`text-sm font-bold ${statusConfig.color} flex items-center gap-2`}>
                                            {statusConfig.label}
                                            {/* Language Badge */}
                                            <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded border border-white/5 uppercase tracking-wider font-mono">
                                                {sub.language}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                            <Calendar size={12}/>
                                            {formatTimeRelative(sub.createdAt)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 text-sm font-mono text-gray-400">
                                    <div className="flex items-center gap-2" title="Runtime">
                                        <Clock size={14} className="text-gray-600"/>
                                        <span className={sub.runtime ? 'text-gray-300' : 'text-gray-600'}>
                                            {sub.runtime ? `${sub.runtime}s` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2" title="Memory">
                                        <Database size={14} className="text-gray-600"/>
                                        <span className={sub.memory ? 'text-gray-300' : 'text-gray-600'}>
                                            {formatMemory(sub.memory)}
                                        </span>
                                    </div>
                                    <div className="hidden md:flex flex-col items-end gap-1 w-24">
                                        <div className="text-[10px] text-gray-500">Test Cases</div>
                                        <div className="flex items-center gap-1 w-full">
                                            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${sub.status === 'accepted' ? 'bg-emerald-500' : 'bg-orange-500'}`} 
                                                    style={{ width: `${(sub.testCasesPassed / sub.testCasesTotal) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 4. Code Detail Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-4xl bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#202020]">
                            <div className="flex items-center gap-3">
                                {getStatusConfig(selectedSubmission.status).icon}
                                <div>
                                    <h3 className={`text-sm font-bold uppercase tracking-wider ${getStatusConfig(selectedSubmission.status).color}`}>
                                        {getStatusConfig(selectedSubmission.status).label}
                                    </h3>
                                    <div className="text-xs text-gray-500 mt-0.5 flex gap-2">
                                        <span>{selectedSubmission.language}</span>
                                        <span>•</span>
                                        <span>{new Date(selectedSubmission.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleCopyCode}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold uppercase tracking-wider ${
                                        copied 
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                            : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                                <button 
                                    onClick={() => setSelectedSubmission(null)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                >
                                    <XCircle size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Error Message Panel (if applicable) */}
                        {selectedSubmission.status !== 'accepted' && selectedSubmission.errorMessage && (
                            <div className="px-6 py-4 bg-rose-500/5 border-b border-rose-500/10">
                                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <AlertCircle size={14}/> Error Message
                                </h4>
                                <pre className="font-mono text-xs text-rose-300/80 whitespace-pre-wrap break-words">
                                    {selectedSubmission.errorMessage}
                                </pre>
                            </div>
                        )}

                        {/* Code Viewer */}
                        <div className="flex-1 overflow-auto bg-[#141414] relative p-6">
                            <div className="relative font-mono text-sm leading-6">
                                {/* Visual Gutter */}
                                <div className="absolute left-0 top-0 bottom-0 w-8 text-right pr-3 text-gray-700 select-none">
                                    {selectedSubmission.code.split('\n').map((_, i) => (
                                        <div key={i}>{i + 1}</div>
                                    ))}
                                </div>
                                <pre className="pl-10 text-gray-300">
                                    <code>{selectedSubmission.code}</code>
                                </pre>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-3 bg-[#1e1e1e] border-t border-white/5 flex justify-between items-center text-xs text-gray-500 font-mono">
                            <div className="flex gap-4">
                                <span>Time: {selectedSubmission.runtime || 'N/A'}s</span>
                                <span>Mem: {formatMemory(selectedSubmission.memory)}</span>
                            </div>
                            <div>
                                Length: {selectedSubmission.code.length} chars
                            </div>
                        </div>

                    </div>
                    {/* Backdrop click to close */}
                    <div className="absolute inset-0 -z-10" onClick={() => setSelectedSubmission(null)}></div>
                </div>
            )}
        </div>
    );
};

export default SubmissionHistory;