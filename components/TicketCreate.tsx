
import React, { useState, useMemo } from 'react';
import { Project, User, Ticket, UserRole, IntakeMethod } from '../types';
import { addBusinessDays } from '../utils';
import { Paperclip, Calendar, X, Check, Phone, HelpCircle, FileText, Loader2, PlusCircle } from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';
import { useToast } from '../contexts/ToastContext';

interface Props {
  projects: Project[];
  currentUser: User;
  initialData?: Ticket;
  onSubmit: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'status'>) => void;
  onCancel: () => void;
}

const ALLOWED_EXTENSIONS = ".pdf,.doc,.docx,.xlsx,.xls,.pptx,.ppt,.png,.jpg,.jpeg,.gif,.webp,.hwp,.txt";

const TicketCreate: React.FC<Props> = ({ projects, currentUser, initialData, onSubmit, onCancel }) => {
  const { showToast } = useToast();
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isSupport = currentUser.role === UserRole.SUPPORT_LEAD || currentUser.role === UserRole.SUPPORT_STAFF;

  const filteredProjects = useMemo(() => {
    if (isAdmin) return projects;
    if (isSupport) {
      return projects.filter(p => p.supportStaffIds.includes(currentUser.id));
    }
    return projects.filter(p => p.customerContactIds.includes(currentUser.id));
  }, [projects, currentUser, isAdmin, isSupport]);

  const defaultDueDate = useMemo(() => addBusinessDays(new Date(), 5), []);
  const normalizedDefault = startOfDay(defaultDueDate);

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [projectId, setProjectId] = useState(initialData?.projectId || filteredProjects[0]?.id || '');
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate ? format(new Date(initialData.dueDate), 'yyyy-MM-dd') : format(defaultDueDate, 'yyyy-MM-dd')
  );
  const [dueReason, setDueReason] = useState(initialData?.shortenedDueReason || '');
  const [files, setFiles] = useState<File[]>([]);

  // 지원팀 전용 추가 필드
  const [plan, setPlan] = useState(initialData?.plan || '');
  const [planFiles, setPlanFiles] = useState<File[]>([]);
  const [intakeMethod, setIntakeMethod] = useState<IntakeMethod>(initialData?.intakeMethod || IntakeMethod.PHONE);
  const [requestDate, setRequestDate] = useState(
    initialData?.requestDate ? format(new Date(initialData.requestDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );

  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isShortened = useMemo(() => {
    if (!dueDate) return false;
    try {
      const selected = startOfDay(new Date(dueDate));
      return isBefore(selected, normalizedDefault);
    } catch {
      return false;
    }
  }, [dueDate, normalizedDefault]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isPlan: boolean = false) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (isPlan) {
        setPlanFiles(prev => [...prev, ...newFiles]);
      } else {
        setFiles(prev => [...prev, ...newFiles]);
      }
    }
  };

  const removeFile = (index: number, isPlan: boolean = false) => {
    if (isPlan) {
      setPlanFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !projectId || (isShortened && !dueReason)) {
      showToast('모든 필수 항목을 입력해주세요.', 'warning');
      return;
    }
    setShowConfirm(true);
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload: Omit<Ticket, 'id' | 'createdAt' | 'status'> = {
        title,
        description,
        projectId,
        customerId: initialData?.customerId || currentUser.id,
        customerName: initialData?.customerName || currentUser.name,
        dueDate: new Date(dueDate).toISOString(),
        initialDueDate: new Date(dueDate).toISOString(),
        shortenedDueReason: isShortened ? dueReason : undefined,
        attachments: files.length > 0 ? files.map(f => f.name) : initialData?.attachments,
        plan: (isSupport || isAdmin) && plan ? plan : initialData?.plan,
        planAttachments: planFiles.length > 0 ? planFiles.map(f => f.name) : initialData?.planAttachments,
      };

      if (isSupport || isAdmin) {
        payload.intakeMethod = intakeMethod;
        payload.requestDate = new Date(requestDate).toISOString();
      }

      await onSubmit(payload);
      setShowConfirm(false);
    } catch (err: any) {
      console.error('Ticket registration error:', err);
      const errorMessage = err?.message || '알 수 없는 오류가 발생했습니다.';
      showToast(`티켓 등록 중 오류가 발생했습니다: ${errorMessage}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-5 sm:p-8 lg:p-10 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 sm:gap-8">
          {/* Top Row: Project and Title */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">프로젝트 선택 *</label>
              <select
                className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-slate-50 transition-all text-sm font-medium"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
              >
                <option value="">프로젝트를 선택하세요</option>
                {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">제목 *</label>
              <input
                type="text"
                placeholder="요청 제목을 입력하세요"
                className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-slate-50 transition-all text-sm font-medium"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Support Fields Row */}
          {(isSupport || isAdmin) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">요청 방법 *</label>
                <div className="flex gap-2">
                  {[
                    { val: IntakeMethod.EMAIL, label: '메일' },
                    { val: IntakeMethod.PHONE, label: '전화' },
                    { val: IntakeMethod.OTHER, label: '기타' }
                  ].map(({ val, label }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setIntakeMethod(val)}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${intakeMethod === val
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">요청일 *</label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none bg-white text-sm font-medium focus:border-blue-500 transition-all"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 lg:col-span-1 md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">처리기한 *</label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none bg-white text-sm font-medium focus:border-blue-500 transition-all"
                  value={dueDate}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Main 2-Column Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Request Content */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                요청내용 & 파일첨부 *
              </label>
              <div className="relative border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all bg-slate-50">
                <textarea
                  rows={12}
                  placeholder="요청 내용을 상세히 기재해주세요."
                  className="w-full px-5 py-4 bg-transparent outline-none resize-none text-sm leading-relaxed"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                <div className="p-4 bg-white/50 border-t border-slate-200/50">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Paperclip size={14} /> 첨부된 파일
                    </p>
                    <label className="px-4 py-2 bg-white hover:bg-slate-50 rounded-xl cursor-pointer transition-colors border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-600">
                      <PlusCircle size={14} />
                      <span>파일 추가</span>
                      <input type="file" multiple accept={ALLOWED_EXTENSIONS} className="hidden" onChange={(e) => handleFileChange(e, false)} />
                    </label>
                  </div>
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 animate-in fade-in duration-300">
                      {files.map((f, i) => (
                        <span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-xl border border-blue-100 shadow-sm">
                          <span className="max-w-[150px] truncate">{f.name}</span>
                          <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => removeFile(i, false)} />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Action Plan (Only for Support/Admin) */}
            <div className="space-y-2">
              {(isSupport || isAdmin) ? (
                <>
                  <label className="block text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                    처리계획 & 파일첨부 (선택사항)
                  </label>
                  <div className="relative border border-indigo-100 rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all bg-indigo-50/30">
                    <textarea
                      rows={12}
                      placeholder="처리 계획을 입력하면 즉시 '처리중' 상태가 됩니다. 미입력 시 '접수' 상태가 됩니다."
                      className="w-full px-5 py-4 bg-transparent outline-none resize-none text-sm leading-relaxed"
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                    />
                    <div className="p-4 bg-white/50 border-t border-indigo-100/50">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Paperclip size={14} /> 처리계획 첨부
                        </p>
                        <label className="px-4 py-2 bg-white hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors border border-indigo-100 shadow-sm flex items-center gap-2 text-xs font-bold text-indigo-600">
                          <PlusCircle size={14} />
                          <span>파일 추가</span>
                          <input type="file" multiple accept={ALLOWED_EXTENSIONS} className="hidden" onChange={(e) => handleFileChange(e, true)} />
                        </label>
                      </div>
                      {planFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 animate-in fade-in duration-300">
                          {planFiles.map((f, i) => (
                            <span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-xl border border-indigo-100 shadow-sm">
                              <span className="max-w-[150px] truncate">{f.name}</span>
                              <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => removeFile(i, true)} />
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col">
                  {!isSupport && !isAdmin && (
                    <>
                      <label className="block text-sm font-bold text-slate-700 ml-1">희망 처리 기한 *</label>
                      <div className="mt-2 space-y-4">
                        <input type="date" className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl outline-none bg-slate-50 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" value={dueDate} min={format(new Date(), 'yyyy-MM-dd')} onChange={(e) => setDueDate(e.target.value)} required />
                        {isShortened && (
                          <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                            <label className="block text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">기한 단축 사유 *</label>
                            <textarea rows={3} placeholder="표준 기한(5일)보다 짧게 설정하신 사유를 입력해주세요." className="w-full px-4 py-3 border border-rose-200 rounded-xl text-xs bg-rose-50/30 resize-none outline-none focus:border-rose-400 transition-all font-medium" value={dueReason} onChange={(e) => setDueReason(e.target.value)} required />
                          </div>
                        )}
                      </div>
                      <div className="mt-auto pt-6">
                        <div className="p-6 rounded-3xl bg-blue-600 text-white text-[11px] flex gap-4 shadow-lg shadow-blue-200">
                          <HelpCircle className="shrink-0 opacity-80" size={24} />
                          <div className="font-medium">
                            <p className="font-black mb-1.5 uppercase tracking-wider opacity-90 text-[12px]">안내사항</p>
                            <p className="opacity-90 leading-relaxed text-sm">등록된 티켓은 지원팀 검토 후 '접수' 상태로 전환됩니다. 모든 대화 이력과 파일은 안전하게 보존됩니다.</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Area for Support Info in non-2-column mode or extra notes */}
          {isSupport && isShortened && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
              <label className="block text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1.5">기한 단축 정보</label>
              <textarea rows={2} placeholder="기한 단축 사유 (필요 시)" className="w-full px-4 py-2 bg-white border border-rose-200 rounded-xl text-xs outline-none" value={dueReason} onChange={(e) => setDueReason(e.target.value)} />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-8 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="px-8 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all text-sm">취소</button>
          <button type="submit" className="px-12 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl transition-all flex items-center gap-2 text-sm uppercase tracking-widest leading-none">
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
            티켓 등록 완료
          </button>
        </div>
      </form >

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden transition-all transform scale-100">
            <div className="p-8 sm:p-10">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <HelpCircle size={32} />
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">티켓을 등록할까요?</h3>
              <p className="text-slate-500 font-medium mb-8">입력하신 내용을 마지막으로 확인해주세요.</p>

              <div className="space-y-4 mb-10">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">제목</p>
                  <p className="text-sm font-bold text-slate-700 truncate">{title || '-'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">프로젝트</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{projects.find(p => p.id === projectId)?.name || '-'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">희망 기한</p>
                    <p className="text-sm font-bold text-slate-700">{dueDate || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => !isSubmitting && setShowConfirm(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:bg-blue-400"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>처리 중...</span>
                    </>
                  ) : (
                    '최종 등록'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketCreate;
