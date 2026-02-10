import React from 'react';
import { AlertTriangle, Trash2, X, Info } from 'lucide-react';

interface RelatedData {
    label: string;
    count: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    targetName: string;
    relatedData: RelatedData[];
    description?: string;
}

const DeleteConfirmModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    targetName,
    relatedData,
    description
}) => {
    if (!isOpen) return null;

    const totalRelated = relatedData.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 sm:p-10">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                            <AlertTriangle size={32} />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">{title}</h3>
                    <p className="text-slate-500 font-medium mb-8">
                        <span className="text-rose-600 font-bold">"{targetName}"</span> 정보를 삭제하시겠습니까?
                        {description && <><br />{description}</>}
                    </p>

                    {/* Related Data Info */}
                    {totalRelated > 0 ? (
                        <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 mb-8 space-y-4">
                            <div className="flex items-center gap-2 text-rose-600 mb-2">
                                <Info size={16} />
                                <span className="text-xs font-black uppercase tracking-widest">삭제 시 함께 영향받는 정보</span>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {relatedData.map((data, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm">
                                        <span className="text-sm font-bold text-slate-600">{data.label}</span>
                                        <span className="text-sm font-black text-rose-600">{data.count}건</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-4">
                                ※ 위 정보들은 <span className="text-rose-500 font-bold">데이터 무결성</span>을 위해 함께 영향을 받거나 조회가 제한될 수 있습니다. 삭제 전 반드시 확인해 주세요.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4 mb-8 flex items-center gap-3">
                            <div className="p-1.5 bg-white rounded-lg text-emerald-600 shadow-sm">
                                <Info size={14} />
                            </div>
                            <span className="text-xs font-bold text-emerald-700">연관된 데이터가 없어 안전하게 삭제 가능합니다.</span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all"
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="flex-1 py-4 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all active:scale-95 text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <Trash2 size={20} />
                            최종 삭제
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
