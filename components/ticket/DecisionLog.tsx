import React from 'react';
import { HistoryEntry } from '../../types';
import { format } from 'date-fns';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

interface DecisionLogProps {
    history: HistoryEntry[];
}

const DECISION_ACTIONS = [
    '연기 요청', '연기 승인', '연기 거절',
    '완료 보고', '최종 승인', '보완 요청'
];

const getActionIcon = (action: string) => {
    if (action.includes('승인') || action.includes('완료')) return <CheckCircle2 size={16} className="text-emerald-500" />;
    if (action.includes('거절') || action.includes('보완')) return <XCircle size={16} className="text-rose-500" />;
    if (action.includes('요청')) return <AlertTriangle size={16} className="text-orange-500" />;
    return <ArrowRight size={16} className="text-slate-400" />;
};

const getActionColor = (action: string) => {
    if (action.includes('승인') || action.includes('완료')) return 'bg-emerald-50 border-emerald-100 text-emerald-900';
    if (action.includes('거절') || action.includes('보완')) return 'bg-rose-50 border-rose-100 text-rose-900';
    if (action.includes('요청')) return 'bg-orange-50 border-orange-100 text-orange-900';
    return 'bg-slate-50 border-slate-100 text-slate-700';
};

const DecisionLog: React.FC<DecisionLogProps> = ({ history }) => {
    const decisions = history.filter(h => h.action && DECISION_ACTIONS.some(a => h.action?.includes(a)));

    if (decisions.length === 0) return null;

    return (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Decision History
            </h3>
            <div className="space-y-3">
                {decisions.map((h) => (
                    <div key={h.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row gap-3 sm:items-center ${getActionColor(h.action!)}`}>
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                {getActionIcon(h.action!)}
                            </div>
                            <div>
                                <span className="block text-[10px] font-black uppercase opacity-60 tracking-wider text-slate-500">
                                    {format(new Date(h.timestamp), 'yyyy-MM-dd HH:mm')} · {h.changedBy}
                                </span>
                                <span className="text-sm font-black">
                                    {h.action}
                                </span>
                            </div>
                        </div>
                        {h.note && (
                            <div className="flex-1 text-sm font-medium border-t sm:border-t-0 sm:border-l border-black/5 pt-3 sm:pt-0 sm:pl-3 opacity-90 whitespace-pre-wrap">
                                {h.note}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DecisionLog;
