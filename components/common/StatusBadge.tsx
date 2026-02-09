
import React from 'react';
import { TicketStatus } from '../../types';

interface StatusBadgeProps {
    status: TicketStatus;
    className?: string;
}

export const getStatusBadgeStyles = (status: TicketStatus) => {
    switch (status) {
        case TicketStatus.WAITING: return 'bg-amber-50 text-amber-700 border-amber-200';
        case TicketStatus.RECEIVED: return 'bg-blue-50 text-blue-700 border-blue-200';
        case TicketStatus.IN_PROGRESS: return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        case TicketStatus.DELAYED: return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
        case TicketStatus.POSTPONE_REQUESTED: return 'bg-orange-50 text-orange-700 border-orange-200';
        case TicketStatus.COMPLETION_REQUESTED: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case TicketStatus.COMPLETED: return 'bg-slate-50 text-slate-500 border-slate-200';
        default: return 'bg-slate-50 text-slate-600';
    }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
    return (
        <span className={`px-3 py-1 rounded-full text-[11px] font-black border uppercase tracking-wider ${getStatusBadgeStyles(status)} ${className}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
