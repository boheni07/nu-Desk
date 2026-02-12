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

const getActionIcon = (action?: string | null) => {
    if (!action) return <ArrowRight size={14} className="text-slate-400" />;
    if (action.includes('승인') || action.includes('완료')) return <CheckCircle2 size={14} className="text-emerald-500" />;
    if (action.includes('거절') || action.includes('보완')) return <XCircle size={14} className="text-rose-500" />;
    if (action.includes('요청')) return <AlertTriangle size={14} className="text-orange-500" />;
    return <ArrowRight size={14} className="text-slate-400" />;
};

const getActionColor = (action?: string | null) => {
    if (!action) return 'bg-slate-50 border-slate-100 text-slate-700';
    if (action.includes('승인') || action.includes('완료')) return 'bg-emerald-50 border-emerald-100 text-emerald-900';
    if (action.includes('거절') || action.includes('보완')) return 'bg-rose-50 border-rose-100 text-rose-900';
    if (action.includes('요청')) return 'bg-orange-50 border-orange-100 text-orange-900';
    return 'bg-slate-50 border-slate-100 text-slate-700';
};


const DecisionLog: React.FC<DecisionLogProps> = ({ history }) => {
    // Robust filtering: check both action and status
    const decisions = history.filter(h => {
        const actionText = h.action?.trim() || '';
        const statusText = h.status?.trim() || '';
        const combined = (actionText + statusText).replace(/\s/g, ''); // Remove spaces for easier matching

        return DECISION_ACTIONS.some(a => combined.includes(a.replace(/\s/g, '')));
    });

    if (decisions.length === 0) return null;

    // Sort chronologically (oldest first) for pairing
    const sortedDecisions = [...decisions].sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeA - timeB;
    });

    // Grouping logic
    const groups: { request?: HistoryEntry; decision?: HistoryEntry }[] = [];
    const usedIds = new Set<string>();

    const isRequest = (h: HistoryEntry) => {
        const text = ((h.action || '') + (h.status || '')).replace(/\s/g, '');
        return text.includes('연기요청') || text.includes('완료보고') || text.includes('완료요청');
    };

    const isResult = (h: HistoryEntry) => {
        const text = ((h.action || '') + (h.status || '')).replace(/\s/g, '');
        return text.includes('승인') || text.includes('거절') || text.includes('보완');
    };

    sortedDecisions.forEach((h, index) => {
        if (usedIds.has(h.id)) return;

        if (isRequest(h)) {
            const group: { request?: HistoryEntry; decision?: HistoryEntry } = { request: h };
            usedIds.add(h.id);

            const matchingDecision = sortedDecisions.slice(index + 1).find((d) => {
                if (usedIds.has(d.id)) return false;
                if (!isResult(d)) return false;

                const reqText = ((h.action || '') + (h.status || '')).replace(/\s/g, '');
                const resText = ((d.action || '') + (d.status || '')).replace(/\s/g, '');

                if (reqText.includes('연기') && resText.includes('연기')) return true;
                if (reqText.includes('완료') && (resText.includes('승인') || resText.includes('보완'))) return true;

                return false;
            });

            if (matchingDecision) {
                group.decision = matchingDecision;
                usedIds.add(matchingDecision.id);
            }
            groups.push(group);
        } else if (isResult(h)) {
            groups.push({ decision: h });
            usedIds.add(h.id);
        }
    });

    groups.reverse();

    const safeFormatDate = (dateStr: string) => {
        try {
            if (!dateStr) return '날짜 없음';
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '유효하지 않은 날짜';
            return format(date, 'MM-dd HH:mm');
        } catch (e) {
            return '날짜 오류';
        }
    };

    const renderEntry = (h: HistoryEntry, isDecision: boolean = false) => {
        const displayAction = h.action || h.status || '알 수 없음';
        return (
            <div className={`p-2 rounded-xl border flex flex-col gap-1.5 h-full ${getActionColor(displayAction)}`}>
                <div className="flex items-center gap-2 shrink-0 w-full overflow-hidden">
                    <div className="p-1 bg-white rounded-lg shadow-sm shrink-0">
                        {getActionIcon(displayAction)}
                    </div>
                    <div className="flex-1 flex items-baseline justify-between min-w-0 gap-2">
                        <span className="text-xs font-black leading-tight truncate">
                            {displayAction}
                        </span>

                        <span className="text-[9px] font-black uppercase opacity-50 tracking-wider text-slate-500 whitespace-nowrap">
                            {safeFormatDate(h.timestamp)} · {h.changedBy}
                        </span>
                    </div>
                </div>
                {h.note && (
                    <div className="text-[12px] font-medium border-t border-black/5 pt-1.5 opacity-90 whitespace-pre-wrap leading-snug">
                        {h.note}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mt-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-slate-400" />
                Decision History
            </h3>
            <div className="space-y-2">
                {groups.map((group, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 ml-1">요청 내용</span>
                            {group.request ? renderEntry(group.request) : (
                                <div className="p-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center h-full">
                                    <span className="text-[10px] text-slate-400 font-bold italic">요청 기록 없음</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 ml-1">승인/거절 내용</span>
                            {group.decision ? renderEntry(group.decision, true) : (
                                <div className="p-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center h-full">
                                    <span className="text-[10px] text-slate-400 font-bold italic">처리 대기 중</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default DecisionLog;
