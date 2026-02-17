import React from 'react';
import { 
    X, CheckCircle2, XCircle, Timer, Cpu, 
    ChevronRight, Trophy, Share2, MessageSquare 
} from 'lucide-react';

const SubmissionResultOverlay = ({ result, onClose, isVisible }) => {
    if (!result) return null;

    const isAccepted = result.accepted;

    return (
        <div className={`absolute inset-0 z-50 bg-[#1e1e1e] transition-transform duration-500 ease-in-out transform ${isVisible ? 'translate-x-0' : '-translate-x-full'}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#252525]">
                <div className="flex items-center gap-2">
                    {isAccepted ? (
                        <CheckCircle2 className="text-emerald-500" size={20} />
                    ) : (
                        <XCircle className="text-rose-500" size={20} />
                    )}
                    <span className={`text-lg font-bold ${isAccepted ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isAccepted ? 'Accepted' : 'Wrong Answer || Runtime Error || Time Limit Exceeded'}
                    </span>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto h-[calc(100%-64px)] custom-scrollbar">
                <div className="max-w-md mx-auto space-y-8">
                    {/* Status Card */}
                    <div className={`p-6 rounded-2xl border ${isAccepted ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isAccepted ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                                {isAccepted ? <Trophy className="text-emerald-500" size={24} /> : <XCircle className="text-rose-500" size={24} />}
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Language</p>
                                <p className="text-white font-bold">{result.language || 'JavaScript'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-gray-400 text-xs">
                                    <Timer size={14} /> Runtime
                                </div>
                                <p className="text-xl font-mono font-bold text-white">{result.runtime} ms</p>
                                {isAccepted && <p className="text-[10px] text-emerald-400/70">Beats 84.2% of users</p>}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-gray-400 text-xs">
                                    <Cpu size={14} /> Memory
                                </div>
                                <p className="text-xl font-mono font-bold text-white">{result.memory} KB</p>
                                {isAccepted && <p className="text-[10px] text-emerald-400/70">Beats 91.5% of users</p>}
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400 font-medium">Testcases Passed</span>
                            <span className="text-white font-bold">{result.passedTestCases} / {result.totalTestCases}</span>
                        </div>
                        <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden p-0.5 border border-white/5">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${isAccepted ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-rose-500'}`}
                                style={{ width: `${(result.passedTestCases / result.totalTestCases) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-4">
                        <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10">
                            <Share2 size={16} /> Share Result
                        </button>
                        <button className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
                            Next Question <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Discussion Link */}
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-sm py-4 border-t border-white/5">
                        <MessageSquare size={14} />
                        <span>Discuss your solution with others</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmissionResultOverlay;