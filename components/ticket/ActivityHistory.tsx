
import React from 'react';
import { History, Info, Clock, PlayCircle, RotateCcw, CalendarDays, CheckCircle2, CheckCircle, AlertTriangle } from 'lucide-react';
import { TicketStatus, HistoryEntry } from '../../types';
import { formatDate } from '../../utils';

interface ActivityHistoryProps {
    history: HistoryEntry[];
}

const getHistoryIcon = (status: TicketStatus) => {
    switch (status) {
        case TicketStatus.WAITING: return <Clock size={12} />;
        case TicketStatus.RECEIVED: return <PlayCircle size={12} />;
        case TicketStatus.IN_PROGRESS: return <RotateCcw size={12} />;
        case TicketStatus.POSTPONE_REQUESTED: return <CalendarDays size={12} />;
        case TicketStatus.COMPLETION_REQUESTED: return <CheckCircle2 size={12} />;
        case TicketStatus.COMPLETED: return <CheckCircle size={12} />;
        case TicketStatus.DELAYED: return <AlertTriangle size={12} />;
        default: return <Info size={12} />;
    }
};

const ActivityHistory: React.FC<ActivityHistoryProps> = ({ history }) => {
    return (
        <div className="bg-slate-900 rounded-[2rem] shadow-2xl p-8 text-slate-100 overflow-hidden relative border border-slate-800">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3 relative z-10">
                <History size={16} className="text-blue-400" /> Activity History
            </h3>
            <div className="relative space-y-6 before:absolute before:inset-0 before:left-[11px] before:w-[2px] before:bg-slate-800 z-10">
                {history.map((h, i) => (
                    <div key={h.id} className="relative pl-10 group cursor-default">
                        <div className={`absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full border-4 border-slate-900 z-10 flex items-center justify-center transition-all duration-300 ${i === 0 ? 'bg-blue-600 scale-110 shadow-lg' : 'bg-slate-700'}`}>
                            <div className="text-white transform scale-[0.8]">{getHistoryIcon(h.status)}</div>
                        </div>

                        {/* Tooltip on hover */}
                        <div className="absolute left-full ml-6 top-0 z-[100] w-72 p-5 bg-black border border-slate-700 text-slate-100 text-xs rounded-[1.5rem] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 -translate-x-4 group-hover:translate-x-0 pointer-events-none">
                            <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
                                <span className="font-black text-blue-400 text-[10px] uppercase">{h.status}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{formatDate(h.timestamp)}</span>
                            </div>
                            <p className="leading-relaxed font-bold text-slate-100 whitespace-pre-wrap">{h.note || '별도의 처리 내역이 없습니다.'}</p>
                        </div>

                        <div className="flex flex-col gap-1 transition-all">
                            <div className="flex justify-between items-start">
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                                    {h.status}
                                </span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-tight">{h.changedBy}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityHistory;
