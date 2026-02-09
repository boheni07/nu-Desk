
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Ticket, TicketStatus, User, Project, HistoryEntry, Comment, UserRole } from '../types';
import { formatDate, addBusinessDays } from '../utils';
import { format, isAfter, startOfDay } from 'date-fns';
import {
  FileText,
  Paperclip,
  Info,
  Star,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Shield,
  CalendarDays,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import Modal from './common/Modal';
import StatusBadge from './common/StatusBadge';
import ActivityHistory from './ticket/ActivityHistory';
import CommentSection from './ticket/CommentSection';

interface Props {
  ticket: Ticket;
  project: Project;
  users: User[];
  history: HistoryEntry[];
  comments: Comment[];
  currentUser: User;
  onStatusUpdate: (ticketId: string, status: TicketStatus, updates?: Partial<Ticket>, note?: string) => void;
  onAddComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  onBack: () => void;
}

const ALLOWED_EXTENSIONS = ".pdf,.doc,.docx,.xlsx,.xls,.pptx,.ppt,.png,.jpg,.jpeg,.gif,.webp,.hwp,.txt";

const TicketDetail: React.FC<Props> = ({
  ticket,
  project,
  users,
  history,
  comments,
  currentUser,
  onStatusUpdate,
  onAddComment,
  onBack
}) => {
  const [planText, setPlanText] = useState('');
  const [expectedCompletionDate, setExpectedCompletionDate] = useState(format(new Date(ticket.dueDate), 'yyyy-MM-dd'));
  const [delayReason, setDelayReason] = useState('');
  const [planFiles, setPlanFiles] = useState<File[]>([]);

  const planFileInputRef = useRef<HTMLInputElement>(null);

  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [showRejectCompleteModal, setShowRejectCompleteModal] = useState(false);

  const [postponeDate, setPostponeDate] = useState('');
  const [postponeReason, setPostponeReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [satisfaction, setSatisfaction] = useState(5);
  const [completionFeedback, setCompletionFeedback] = useState('');

  useEffect(() => {
    if (showPostponeModal && ticket.dueDate) {
      const nextBizDay = addBusinessDays(new Date(ticket.dueDate), 1);
      setPostponeDate(format(nextBizDay, 'yyyy-MM-dd'));
    }
  }, [showPostponeModal, ticket.dueDate]);

  useEffect(() => {
    const isSupportUser = currentUser.role === UserRole.SUPPORT || currentUser.role === UserRole.ADMIN;
    const isPartOfProjectTeam = project.supportStaffIds.includes(currentUser.id) || currentUser.role === UserRole.ADMIN;

    if (isSupportUser && isPartOfProjectTeam && ticket.status === TicketStatus.WAITING) {
      onStatusUpdate(
        ticket.id,
        TicketStatus.RECEIVED,
        {},
        `지원팀 티켓 접수 및 검토 시작`
      );
    }
  }, [ticket.id, ticket.status, currentUser.id, project.supportStaffIds, onStatusUpdate]);

  const isDelayed = ticket.status === TicketStatus.DELAYED;

  const isCompletionDelayed = useMemo(() => {
    const expected = startOfDay(new Date(expectedCompletionDate));
    const originalDue = startOfDay(new Date(ticket.dueDate));
    return isAfter(expected, originalDue);
  }, [expectedCompletionDate, ticket.dueDate]);

  const supportStaff = useMemo(() => {
    return project.supportStaffIds.map(id => users.find(u => u.id === id)).filter(Boolean) as User[];
  }, [project.supportStaffIds, users]);

  const handleRegisterPlan = () => {
    if (!planText) { alert('처리 계획을 입력해주세요.'); return; }
    const fileListStr = planFiles.length > 0 ? ` (첨부파일: ${planFiles.map(f => f.name).join(', ')})` : '';
    const note = `처리 계획 등록: ${planText} (완료 예정: ${format(new Date(expectedCompletionDate), 'yyyy-MM-dd')})${fileListStr}`;
    onStatusUpdate(ticket.id, TicketStatus.IN_PROGRESS, {
      plan: planText,
      expectedCompletionDate: new Date(expectedCompletionDate).toISOString(),
      expectedCompletionDelayReason: isCompletionDelayed ? delayReason : undefined,
      planAttachments: planFiles.map(f => f.name)
    }, note);
    setPlanFiles([]);
  };

  const handlePostponeRequest = () => {
    if (!postponeDate || !postponeReason) { alert('연기 희망일과 사유를 모두 입력해주세요.'); return; }
    const originalDateStr = format(new Date(ticket.dueDate), 'yyyy-MM-dd');
    const note = `[기한 연기 요청]\n당초 기한: ${originalDateStr}\n요청 기한: ${postponeDate}\n요청 사유: ${postponeReason}`;
    onStatusUpdate(ticket.id, TicketStatus.POSTPONE_REQUESTED, {
      postponeDate: new Date(postponeDate).toISOString(),
      postponeReason
    }, note);
    setShowPostponeModal(false);
  };

  const handleApprovePostpone = () => {
    const newDateStr = ticket.postponeDate ? format(new Date(ticket.postponeDate), 'yyyy-MM-dd') : '알 수 없음';
    const note = `[연기 승인] 마감 기한이 ${newDateStr}(으)로 연장되었습니다.`;
    onStatusUpdate(ticket.id, TicketStatus.IN_PROGRESS, {
      dueDate: ticket.postponeDate,
      postponeDate: undefined,
      postponeReason: undefined
    }, note);
  };

  const handleRejectPostpone = () => {
    if (!rejectReason) return;
    const note = `[연기 거절] 사유: ${rejectReason}`;
    onStatusUpdate(ticket.id, TicketStatus.IN_PROGRESS, {
      postponeDate: undefined,
      postponeReason: undefined
    }, note);
    setShowRejectModal(false);
  };

  const handleCompleteRequest = () => {
    const note = `[완료 보고] 모든 지원 작업이 완료되어 고객 검토를 요청했습니다.`;
    onStatusUpdate(ticket.id, TicketStatus.COMPLETION_REQUESTED, {}, note);
    setShowCompleteModal(false);
  };

  const handleFinalizeTicket = () => {
    const note = `[최종 승인] 서비스 만족도: ${satisfaction}점\n피드백: ${completionFeedback || '없음'}`;
    onStatusUpdate(ticket.id, TicketStatus.COMPLETED, { satisfaction, completionFeedback }, note);
    setShowFinalizeModal(false);
  };

  const handleRejectCompletion = () => {
    if (!rejectReason) return;
    const note = `[완료 거절/재작업 요청] 사유: ${rejectReason}`;
    onStatusUpdate(ticket.id, TicketStatus.IN_PROGRESS, {}, note);
    setShowRejectCompleteModal(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Main Column */}
      <div className="lg:col-span-8 space-y-6 sm:space-y-8">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <div className="p-6 sm:p-10 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-xs font-mono font-black text-blue-600 bg-blue-100/50 px-2.5 py-1 rounded-lg shrink-0">{ticket.id}</span>
                <StatusBadge status={ticket.status} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 break-words leading-tight">{ticket.title}</h1>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center sm:items-end shrink-0 w-full sm:w-auto">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Due Date</p>
              <p className={`text-xl font-black ${isDelayed ? 'text-rose-600' : 'text-slate-700'}`}>
                {formatDate(ticket.dueDate).split(' ')[0]}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="p-6 sm:p-10 space-y-8">
              <section>
                <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2.5 uppercase tracking-wider">
                  <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600"><FileText size={16} /></div> 요청 내용
                </h3>
                <div className="text-sm sm:text-base text-slate-600 whitespace-pre-wrap leading-relaxed break-words font-medium">
                  {ticket.description}
                </div>
                {ticket.attachments && ticket.attachments.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">요청 첨부파일</p>
                    <div className="flex flex-wrap gap-2">
                      {ticket.attachments.map((f, i) => (
                        <span key={i} className="px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2 border border-slate-200/50 max-w-full">
                          <Paperclip size={14} className="shrink-0 text-slate-400" /> <span className="truncate">{f}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>

            <div className="p-6 sm:p-10 bg-slate-50/30">
              <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2.5 uppercase tracking-wider">
                <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600"><CheckCircle2 size={16} /></div> 처리 계획
              </h3>
              {ticket.plan ? (
                <div className="space-y-6">
                  <div className="text-sm sm:text-base text-slate-600 whitespace-pre-wrap leading-relaxed break-words font-medium italic p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    "{ticket.plan}"
                  </div>
                  {ticket.planAttachments && ticket.planAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {ticket.planAttachments.map((f, i) => (
                        <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion ETA</span>
                      <span className="text-sm font-black text-blue-600">{format(new Date(ticket.expectedCompletionDate!), 'yyyy-MM-dd')}</span>
                    </div>
                  </div>
                </div>
              ) : currentUser.role === UserRole.SUPPORT ? (
                <div className="space-y-6">
                  <textarea className="w-full px-5 py-4 border border-slate-200 rounded-2xl outline-none text-sm resize-none bg-white focus:ring-4 focus:ring-blue-500/10" placeholder="처리 방법과 일정을 등록하세요." rows={5} value={planText} onChange={(e) => setPlanText(e.target.value)} />
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">완료 예정일</label>
                      <input type="date" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-sm font-bold bg-slate-50" value={expectedCompletionDate} onChange={(e) => setExpectedCompletionDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">계획 첨부파일 (선택)</label>
                      <button onClick={() => planFileInputRef.current?.click()} className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                        <span className="flex items-center gap-2"><Paperclip size={14} /> {planFiles.length > 0 ? `${planFiles.length}개 파일 선택됨` : '문서, 엑셀, 이미지 등'}</span>
                        <input type="file" multiple accept={ALLOWED_EXTENSIONS} className="hidden" ref={planFileInputRef} onChange={(e) => e.target.files && setPlanFiles(Array.from(e.target.files))} />
                      </button>
                    </div>
                  </div>
                  <button onClick={handleRegisterPlan} className="w-full py-4 bg-blue-600 text-white text-sm font-black rounded-2xl hover:bg-blue-700 shadow-xl transition-all">계획 등록</button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-slate-300"><Info size={40} /><p className="mt-3 text-xs font-bold italic">담당자의 계획 등록을 기다리는 중입니다.</p></div>
              )}
            </div>
          </div>

          <div className="p-6 bg-slate-900 border-t border-slate-800">
            {currentUser.role === UserRole.CUSTOMER && ticket.status === TicketStatus.POSTPONE_REQUESTED && (
              <div className="mb-6 animate-in slide-in-from-top-4 duration-500">
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-[2rem] p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-orange-500 rounded-xl text-white"><CalendarDays size={20} /></div><h4 className="text-lg font-black text-orange-400">마감 기한 연기 요청 상세</h4></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"><div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-center"><p className="text-[10px] text-slate-500 font-black uppercase mb-1">당초 기한</p><p className="text-sm font-bold text-slate-300 line-through">{formatDate(ticket.dueDate).split(' ')[0]}</p></div><div className="bg-orange-500/20 p-4 rounded-2xl border border-orange-500/30 text-center"><p className="text-[10px] text-orange-400 font-black uppercase mb-1">연기 요청일</p><p className="text-lg font-black text-white">{ticket.postponeDate ? formatDate(ticket.postponeDate).split(' ')[0] : '미지정'}</p></div></div>
                  <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 italic text-sm text-slate-300">"{ticket.postponeReason}"</div>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {currentUser.role === UserRole.SUPPORT && ticket.status === TicketStatus.IN_PROGRESS && (
                <><button disabled={isDelayed} onClick={() => setShowPostponeModal(true)} className={`px-8 py-3.5 rounded-2xl font-black text-sm border ${isDelayed ? 'bg-slate-800 text-slate-600' : 'bg-slate-800 text-orange-400 hover:bg-slate-700'}`}>연기 요청</button><button onClick={() => setShowCompleteModal(true)} className="px-10 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 shadow-xl shadow-emerald-900/40">완료 보고</button></>
              )}
              {currentUser.role === UserRole.CUSTOMER && ticket.status === TicketStatus.POSTPONE_REQUESTED && (
                <><button onClick={() => setShowRejectModal(true)} className="px-8 py-3.5 bg-slate-800 text-rose-400 rounded-2xl font-black text-sm hover:bg-slate-700">연기 거절</button><button onClick={handleApprovePostpone} className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-900/40">연기 승인</button></>
              )}
              {currentUser.role === UserRole.CUSTOMER && ticket.status === TicketStatus.COMPLETION_REQUESTED && (
                <><button onClick={() => setShowRejectCompleteModal(true)} className="px-8 py-3.5 bg-slate-800 text-rose-400 rounded-2xl font-black text-sm hover:bg-slate-700">보완 요청</button><button onClick={() => setShowFinalizeModal(true)} className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-900/40">최종 승인</button></>
              )}
            </div>
          </div>
        </div>

        {/* Chat/Comment Section */}
        <CommentSection
          comments={comments}
          currentUser={currentUser}
          onAddComment={onAddComment}
          ticketId={ticket.id}
        />
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8 space-y-8">
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2.5"><Briefcase size={14} className="text-blue-500" /> Project Detail</h3>
            <div className="space-y-4">
              <div><p className="text-[10px] text-slate-400 font-black uppercase mb-1">Name</p><p className="text-lg font-black text-slate-900 leading-tight">{project.name}</p></div>
            </div>
          </section>
          <div className="h-px bg-slate-100" />
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2.5"><Shield size={14} className="text-indigo-500" /> Support Team</h3>
            <div className="space-y-3">
              {supportStaff.map((u, idx) => (
                <div key={u.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">{u.name[0]}</div>
                  <div className="min-w-0 flex-1"><p className="text-sm font-black text-slate-800 truncate">{u.name}</p></div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <ActivityHistory history={history} />
      </div>

      {showPostponeModal && (
        <Modal title="기한 연기 요청" onClose={() => setShowPostponeModal(false)} onConfirm={handlePostponeRequest} confirmText="연기 요청 전송">
          <div className="space-y-6">
            <div className="p-5 bg-orange-50 rounded-2xl border border-orange-100 flex gap-4 items-start"><AlertTriangle className="text-orange-500 shrink-0" size={24} /><div><p className="text-xs font-black text-orange-800 uppercase tracking-widest mb-1">주의 사항</p><p className="text-[11px] text-orange-600 font-medium leading-relaxed">마감 기한 연기는 고객의 승인이 필요합니다. 상세 사유를 기재해 주세요.</p></div></div>
            <div className="space-y-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">연기 희망일</label><input type="date" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold shadow-sm" value={postponeDate} onChange={(e) => setPostponeDate(e.target.value)} /></div>
            <div className="space-y-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">구체적 연기 사유</label><textarea className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm resize-none shadow-sm" rows={5} placeholder="지연 원인과 향후 일정을 상세히 입력하세요." value={postponeReason} onChange={(e) => setPostponeReason(e.target.value)} /></div>
          </div>
        </Modal>
      )}

      {showFinalizeModal && (
        <Modal title="최종 완료 승인" onClose={() => setShowFinalizeModal(false)} onConfirm={handleFinalizeTicket} confirmText="승인 및 티켓 종료">
          <div className="space-y-10 py-4 text-center">
            <div className="space-y-6"><div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-100"><CheckCircle size={40} /></div><div><h4 className="text-xl font-black text-slate-900 mb-2">지원이 만족스러우셨나요?</h4><p className="text-sm font-medium text-slate-500">고객님의 승인으로 본 티켓이 공식 종료됩니다.</p></div>
              <div className="flex justify-center gap-3">{[1, 2, 3, 4, 5].map(star => (<button key={star} onClick={() => setSatisfaction(star)} className="transition-all active:scale-90 hover:scale-110"><Star size={48} fill={star <= satisfaction ? '#eab308' : 'none'} className={star <= satisfaction ? 'text-yellow-500' : 'text-slate-200'} strokeWidth={1.5} /></button>))}</div>
            </div>
            <textarea className="w-full px-6 py-5 border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 outline-none text-sm bg-slate-50 resize-none font-medium shadow-inner" rows={3} placeholder="지원팀에게 전달할 메시지 (선택)" value={completionFeedback} onChange={(e) => setCompletionFeedback(e.target.value)} />
          </div>
        </Modal>
      )}

      {showRejectModal && (
        <Modal title="연기 요청 거절" onClose={() => setShowRejectModal(false)} onConfirm={handleRejectPostpone} confirmText="거절 처리" confirmColor="bg-rose-600">
          <div className="space-y-4"><p className="text-sm font-bold text-slate-600 text-center mb-4">지원팀의 연기 요청을 거절하는 이유를 입력해 주세요.</p><textarea required className="w-full px-5 py-4 border border-slate-200 rounded-2xl outline-none text-sm font-medium resize-none shadow-sm" rows={4} placeholder="거절 사유..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} /></div>
        </Modal>
      )}

      {showRejectCompleteModal && (
        <Modal title="보완 요청" onClose={() => setShowRejectCompleteModal(false)} onConfirm={handleRejectCompletion} confirmText="보완 요청 전송" confirmColor="bg-rose-600">
          <div className="space-y-4"><p className="text-sm font-bold text-slate-600 text-center mb-4">보완이 필요한 사항이나 재작업이 필요한 이유를 입력해 주세요.</p><textarea required className="w-full px-5 py-4 border border-slate-200 rounded-2xl outline-none text-sm font-medium resize-none shadow-sm" rows={5} placeholder="미흡 사항 기록..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} /></div>
        </Modal>
      )}

      {showCompleteModal && (
        <Modal title="완료 보고 요청" onClose={() => setShowCompleteModal(false)} onConfirm={handleCompleteRequest} confirmText="완료 보고 전송" confirmColor="bg-emerald-600">
          <div className="text-center space-y-6 py-4"><div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 size={44} /></div><p className="text-sm font-bold text-slate-600 leading-relaxed max-w-xs mx-auto">요청하신 모든 지원 작업이 완료되었음을 고객에게 보고하고 최종 승인을 요청합니다.</p></div>
        </Modal>
      )}
    </div>
  );
};

export default TicketDetail;
