import React from 'react';
import { Code2 } from 'lucide-react';

const Loading = () => {
    return (
        // Changed fixed inset-0 to h-[100dvh] for better mobile viewport handling
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a] text-gray-300 p-4">
            
            <div className="relative flex items-center justify-center mb-6">
                {/* Outer Glowing Ring - Scaled for mobile */}
                <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-orange-500/20 blur-xl animate-pulse"></div>
                
                {/* Spinning Border - Scaled for mobile */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-white/5 border-t-orange-500 rounded-full animate-spin"></div>
                
                {/* Inner Icon - Responsive size */}
                <div className="absolute text-orange-500 animate-pulse duration-1000">
                    <Code2 className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
            </div>
            
            {/* Loading Text */}
            <div className="flex flex-col items-center gap-3">
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-[0.3em] font-mono text-center">
                    LeetCode Clone
                </h3>
                
                {/* Bouncing Dots */}
                <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-orange-500/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-orange-500/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-orange-500/60 rounded-full animate-bounce"></span>
                </div>
            </div>

            {/* Optional: Subtle background text or versioning for mobile polish */}
            <div className="absolute bottom-8 text-[10px] text-gray-600 uppercase tracking-widest font-mono">
                Initializing Environment
            </div>
        </div>
    );
};

export default Loading;