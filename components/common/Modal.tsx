
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    title: string;
    onClose: () => void;
    onConfirm: () => void;
    confirmText: string;
    confirmColor?: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
    title,
    onClose,
    onConfirm,
    confirmText,
    confirmColor = 'bg-blue-600',
    children
}) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-slate-100">
            <div className="px-10 pt-10 pb-6 flex justify-between items-center shrink-0">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-600 rounded-full" /> {title}
                </h3>
                <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full text-slate-400">
                    <X size={24} />
                </button>
            </div>
            <div className="px-10 py-6 overflow-y-auto custom-scrollbar flex-1">{children}</div>
            <div className="px-10 pb-12 pt-6 flex flex-col sm:flex-row gap-4 shrink-0">
                <button
                    onClick={onClose}
                    className="flex-1 px-8 py-4.5 text-slate-500 font-black hover:bg-slate-50 rounded-2xl transition-all uppercase text-xs"
                >
                    취소
                </button>
                <button
                    onClick={onConfirm}
                    className={`flex-1 px-8 py-4.5 ${confirmColor} text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase text-xs tracking-widest`}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
);

export default Modal;
