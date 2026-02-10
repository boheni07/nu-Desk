import React from 'react';
import { format } from 'date-fns';
import { History, Info, Clock, PlayCircle, RotateCcw, CalendarDays, CheckCircle2, CheckCircle, AlertTriangle } from 'lucide-react';
import { TicketStatus, HistoryEntry } from '../../types';

interface ActivityHistoryProps {
    history: HistoryEntry[];
}

const getHistoryIcon = (status: TicketStatus) => {
    switch (status) {
        case TicketStatus.WAITING: return <Clock size={14} />;
        case TicketStatus.RECEIVED: return <PlayCircle size={14} />;
        case TicketStatus.IN_PROGRESS: return <RotateCcw size={14} />;
        case TicketStatus.POSTPONE_REQUESTED: return <CalendarDays size={14} />;
        case TicketStatus.COMPLETION_REQUESTED: return <CheckCircle2 size={14} />;
        case TicketStatus.COMPLETED: return <CheckCircle size={14} />;
        case TicketStatus.DELAYED: return <AlertTriangle size={14} />;
        default: return <Info size={14} />;
    }
};

const ActivityHistory: React.FC<ActivityHistoryProps> = ({ history }) => {
    if (!history || history.length === 0) return null;

    return (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6 sm:p-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                    <History size={18} />
                </div>
                Activity History
            </h3>

            <div className="relative space-y-8 before:absolute before:inset-0 before:left-[17px] before:w-[2px] before:bg-slate-100">
                {history.map((h, i) => (
                    <div key={h.id} className="relative pl-12 group">
                        {/* Timeline Marker */}
                        <div className={`absolute left-0 top-0 w-9 h-9 rounded-2xl border-4 border-white z-10 flex items-center justify-center transition-all duration-300 ${i === 0 ? 'bg-blue-600 shadow-lg shadow-blue-200 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {getHistoryIcon(h.status)}
                        </div>

                        <div className="space-y-2">
                            {/* Header Info */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200/50'
                                    }`}>
                                    {h.action || h.status}
                                </span>
                                <span className="text-sm font-bold text-slate-800">{h.changedBy}</span>
                                <span className="text-[11px] font-bold text-slate-400 font-mono italic">
                                    {format(new Date(h.timestamp), 'yyyy-MM-dd HH:mm')}
                                </span>
                            </div>

                            {/* Note Detail (Inline) */}
                            <div className={`text-xs leading-relaxed font-medium p-4 rounded-2xl border transition-colors ${i === 0
                                    ? 'bg-blue-50/30 border-blue-100 text-slate-700 shadow-sm'
                                    : 'bg-slate-50 border-slate-100 text-slate-500'
                                }`}>
                                {h.note || '별도의 처리 내역이 없습니다.'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityHistory;
