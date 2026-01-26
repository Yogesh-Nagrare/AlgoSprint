import React from 'react';
import { Code2 } from 'lucide-react';

const Loading = () => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a] text-gray-300">
            <div className="relative flex items-center justify-center mb-6">
                {/* Outer Glowing Ring */}
                <div className="absolute w-24 h-24 rounded-full bg-orange-500/20 blur-xl animate-pulse"></div>
                
                {/* Spinning Border */}
                <div className="w-16 h-16 border-4 border-white/5 border-t-orange-500 rounded-full animate-spin"></div>
                
                {/* Inner Icon */}
                <div className="absolute text-orange-500 animate-pulse duration-1000">
                    <Code2 size={28} />
                </div>
            </div>
            
            {/* Loading Text */}
            <div className="flex flex-col items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em] font-mono">
                    LeetCode Clone
                </h3>
                <div className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></span>
                </div>
            </div>
        </div>
    );
};

export default Loading;