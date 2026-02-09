
import React from 'react';

const LoadingOverlay: React.FC = () => (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-x-0 -bottom-10 text-center">
                <p className="text-sm font-black text-slate-800 animate-pulse tracking-widest uppercase">Loading</p>
            </div>
        </div>
    </div>
);

export default LoadingOverlay;
