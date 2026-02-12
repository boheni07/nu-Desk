
import React, { useState } from 'react';
import { Ticket, TicketStatus, User, UserRole } from '../types';
import { formatDate } from '../utils';
import { Clock, MessageSquare, Paperclip, ChevronRight, User as UserIcon, Calendar, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import Modal from './common/Modal';

interface Props {
  tickets: Ticket[];
  currentUser: User;
  onSelect: (id: string) => void;
  onEdit: (ticket: Ticket) => void;
  onDelete: (id: string) => void;
}

const getStatusColor = (status: TicketStatus) => {
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

const TicketList: React.FC<Props> = ({ tickets, currentUser, onSelect, onEdit, onDelete }) => {
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);

  const handleDeleteClick = (ticket: Ticket) => {
    setTicketToDelete(ticket);
  };

  const confirmDelete = () => {
    if (ticketToDelete) {
      onDelete(ticketToDelete.id);
      setTicketToDelete(null);
    }
  };
  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-20 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
          <TicketIcon size={40} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No tickets found</h3>
        <p className="text-slate-500 max-w-xs">검색 결과가 없거나 등록된 티켓이 없습니다. 새로운 티켓을 등록해 보세요!</p>
      </div>
    );
  }

  // Permission Logic: Admin can do anything, others only initial state of own tickets
  const canModify = (ticket: Ticket) => {
    if (currentUser.role === UserRole.ADMIN) return true;

    const isCreator = ticket.customerId === currentUser.id;
    const isInitialState = currentUser.role === UserRole.CUSTOMER
      ? ticket.status === TicketStatus.WAITING
      : ticket.status === TicketStatus.RECEIVED;

    return isCreator && isInitialState;
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table Header */}
      <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
        <div className="col-span-1">ID</div>
        <div className="col-span-4">Subject</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Due Date</div>
        <div className="col-span-2">Requester</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      {/* Ticket Rows / Cards */}
      <div className="grid grid-cols-1 gap-3">
        {tickets.filter(t => t && t.id).map(ticket => {
          const safeTitle = ticket.title || '(제목 없음)';
          const safeCustomerName = ticket.customerName || '알 수 없음';
          const formattedDueDate = formatDate(ticket.dueDate).split(' ')[0];

          return (
            <div
              key={ticket.id}
              className="group bg-white border border-slate-200 lg:border-slate-100 rounded-2xl lg:rounded-3xl p-5 sm:p-6 lg:p-0 transition-all hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 cursor-pointer"
            >
              {/* Mobile/Tablet Card Layout */}
              <div className="lg:hidden" onClick={() => onSelect(ticket.id)}>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{ticket.id}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    {canModify(ticket) && (
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onEdit(ticket)}
                          className="p-1.5 bg-slate-50 text-slate-500 rounded-lg hover:text-blue-600"
                        >
                          <Pencil size={14} />
                        </button>
                        {currentUser.role === UserRole.ADMIN && (
                          <button
                            onClick={() => handleDeleteClick(ticket)}
                            className="p-1.5 bg-slate-50 text-slate-500 rounded-lg hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors leading-snug">
                  {safeTitle}
                </h4>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">마감기한</span>
                    <div className="flex items-center gap-1.5 text-sm text-slate-700 font-medium">
                      <Calendar size={14} className="text-slate-400" />
                      {formattedDueDate}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">요청자</span>
                    <div className="flex items-center gap-1.5 text-sm text-slate-700 font-medium">
                      <UserIcon size={14} className="text-slate-400" />
                      {safeCustomerName}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Row Layout */}
              <div className="hidden lg:grid grid-cols-12 gap-4 items-center px-8 py-5" onClick={() => onSelect(ticket.id)}>
                <div className="col-span-1">
                  <span className="font-mono text-xs text-blue-600 font-bold opacity-70 group-hover:opacity-100 transition-opacity">{ticket.id}</span>
                </div>
                <div className="col-span-4 pr-4">
                  <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors block truncate">
                    {safeTitle}
                  </span>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium"><Clock size={12} /> {formatDate(ticket.createdAt)}</span>
                    {ticket.attachments && ticket.attachments.length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold"><Paperclip size={12} /> {ticket.attachments.length}</span>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(ticket.status)} transition-all group-hover:shadow-sm`}>
                    {ticket.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className={`text-sm font-medium ${ticket.status === TicketStatus.DELAYED ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                    {formattedDueDate}
                  </span>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-500 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {safeCustomerName.charAt(0)}
                    </div>
                    <span className="text-sm text-slate-700 font-medium">{safeCustomerName}</span>
                  </div>
                </div>
                <div className="col-span-1 flex items-center justify-end gap-1">
                  {canModify(ticket) && (
                    <div className="flex items-center gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onEdit(ticket)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="수정"
                      >
                        <Pencil size={16} />
                      </button>
                      {currentUser.role === UserRole.ADMIN && (
                        <button
                          onClick={() => handleDeleteClick(ticket)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                  <ChevronRight className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {ticketToDelete && (
        <Modal
          title="티켓 삭제"
          onClose={() => setTicketToDelete(null)}
          onConfirm={confirmDelete}
          confirmText="삭제하기"
          confirmColor="bg-rose-600"
        >
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">삭제 대상 티켓</p>
              <h4 className="text-lg font-black text-slate-900 mb-1">{ticketToDelete.title}</h4>
              <p className="text-xs font-mono font-bold text-blue-600">{ticketToDelete.id}</p>
            </div>
            <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 flex gap-4 items-start">
              <AlertTriangle className="text-rose-500 shrink-0" size={24} />
              <div>
                <p className="text-sm font-black text-rose-800 uppercase tracking-widest mb-1">주의 사항</p>
                <p className="text-xs text-rose-600 font-medium leading-relaxed">
                  이 티켓을 정말 삭제하시겠습니까? <br />
                  삭제 시 모든 히스토리와 댓글이 함께 영구 삭제되며 복구할 수 없습니다.
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 font-medium text-center">정말로 삭제하시려면 아래 '삭제하기' 버튼을 눌러주세요.</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Internal icon helper to avoid export conflicts
const TicketIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
  </svg>
);

export default TicketList;
