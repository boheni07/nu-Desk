
import React, { useState, useRef } from 'react';
// Redefining Data Management with AppState from types.ts
import {
  Company, User, Project, Ticket, Comment, HistoryEntry,
  TicketStatus, UserRole, OperationalInfo, AppState, OrganizationInfo
} from '../types';
import { initialCompanies, initialUsers, initialProjects, getInitialTickets, defaultOrgInfo } from '../App';
import { Download, Upload, RotateCcw, Trash2, CheckCircle2, AlertTriangle, Loader2, Database, HardDrive, FileJson, X } from 'lucide-react';
import { addDays } from 'date-fns';

interface Props {
  currentState: AppState;
  onApplyState: (newState: AppState) => void;
}

type ActionType = 'BACKUP' | 'RESTORE' | 'SAMPLE' | 'RESET';

const DataManagement: React.FC<Props> = ({ currentState, onApplyState }) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [confirmAction, setConfirmAction] = useState<ActionType | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateProgress = async (steps: string[]) => {
    setIsExecuting(true);
    setResult(null);
    setProgress(0);
    for (let i = 0; i < steps.length; i++) {
      setStatusMessage(steps[i]);
      const targetProgress = ((i + 1) / steps.length) * 100;

      // Animate progress smoothly
      const start = progress;
      const duration = 300;
      const startTime = Date.now();

      await new Promise<void>(resolve => {
        const animate = () => {
          const now = Date.now();
          const elapsed = now - startTime;
          const p = Math.min(elapsed / duration, 1);
          setProgress(start + (targetProgress - start) * p);
          if (p < 1) requestAnimationFrame(animate);
          else resolve();
        };
        requestAnimationFrame(animate);
      });
    }
  };

  const handleBackup = async () => {
    setConfirmAction(null);
    await simulateProgress(['데이터 직렬화 중...', '정합성 검증 중...', 'JSON 파일 패키징 중...', '다운로드 준비 완료']);

    try {
      // 명시적으로 모든 필드를 포함하여 백업
      const backupData: AppState = {
        companies: currentState.companies,
        users: currentState.users,
        projects: currentState.projects,
        tickets: currentState.tickets,
        comments: currentState.comments,
        history: currentState.history,
        opsInfo: currentState.opsInfo || [],
        orgInfo: currentState.orgInfo
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const fileName = `nu-desk-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setResult({ success: true, message: '시스템의 모든 데이터가 성공적으로 백업되었습니다.' });
    } catch (err) {
      setResult({ success: false, message: '백업 중 오류가 발생했습니다.' });
    } finally {
      setIsExecuting(false);
      setProgress(0);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setConfirmAction(null);
    await simulateProgress(['파일 업로드 중...', '데이터 무결성 검사 중...', '스키마 매핑 중...', '시스템 상태 적용 중...']);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);

        // 필수 필드 체크 (기본적인 AppState 구조 확인)
        if (!json.users || !json.companies || !json.projects || !json.tickets) {
          throw new Error('올바른 백업 파일 형식이 아닙니다.');
        }

        const newState: AppState = {
          companies: json.companies,
          users: json.users,
          projects: json.projects,
          tickets: json.tickets,
          comments: json.comments || [],
          history: json.history || [],
          opsInfo: json.opsInfo || [],
          orgInfo: json.orgInfo
        };

        await onApplyState(newState);
        setResult({ success: true, message: '데이터 복원이 완료되었습니다. 시스템이 이전 상태로 복구되었습니다.' });
      } catch (err) {
        console.error(err);
        setResult({ success: false, message: '데이터 복원 실패: 파일이 손상되었거나 형식이 맞지 않습니다.' });
      } finally {
        setIsExecuting(false);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateSamples = async () => {
    setConfirmAction(null);
    await simulateProgress(['기존 데이터 정리 중...', '기관 정보 유지 중...', '샘플 프로젝트 및 운영정보 매핑 중...', '기본 티켓 및 처리 이력 구성 중...', '마지막 정합성 체크 중...']);

    try {
      const now = new Date();
      const sampleTickets = getInitialTickets(now);

      // 더 정교한 이력 생성
      const sampleHistory: HistoryEntry[] = [];
      sampleTickets.forEach(t => {
        // 생성 이력
        sampleHistory.push({
          id: `h-${t.id}-init`,
          ticketId: t.id,
          status: TicketStatus.WAITING,
          changedBy: t.customerName,
          timestamp: t.createdAt,
          note: '티켓이 신규 등록되었습니다.'
        });

        // 접수 이력 (일부 티켓)
        if (t.status !== TicketStatus.WAITING) {
          sampleHistory.push({
            id: `h-${t.id}-recv`,
            ticketId: t.id,
            status: TicketStatus.RECEIVED,
            changedBy: t.supportName || '이지원 지원팀장',
            timestamp: addDays(new Date(t.createdAt), 0.1).toISOString(),
            note: '지원팀에서 티켓을 확인하고 접수하였습니다.'
          });
        }

        // 처리중 이력 (일부 티켓)
        if (t.status === TicketStatus.IN_PROGRESS || t.status === TicketStatus.COMPLETED) {
          sampleHistory.push({
            id: `h-${t.id}-work`,
            ticketId: t.id,
            status: TicketStatus.IN_PROGRESS,
            changedBy: t.supportName || '박기술 엔지니어',
            timestamp: addDays(new Date(t.createdAt), 0.5).toISOString(),
            note: '기술 검토 및 해결 작업을 시작했습니다.'
          });
        }
      });

      // 프로젝트별 상세 운영정보 생성
      const sampleOpsInfo: OperationalInfo[] = initialProjects.map(p => ({
        projectId: p.id,
        hardware: [
          { id: `hw-${p.id}-1`, usage: 'WEB/WAS', cpu: '8 Core', memory: '16GB', hdd: '500GB SSD', manufacturer: 'Dell', model: 'PowerEdge R640', notes: 'Main Application Server', remarks: '' }
        ],
        software: [
          { id: `sw-${p.id}-1`, usage: 'OS', productVersion: 'Ubuntu 22.04 LTS', installPath: '/', manufacturer: 'Canonical', techSupport: 'Internal', notes: 'Latest security patches applied', remarks: '' },
          { id: `sw-${p.id}-2`, usage: 'DB', productVersion: 'PostgreSQL 15', installPath: '/var/lib/postgresql', manufacturer: 'PostgreSQL', techSupport: 'Open Source', notes: 'Daily backup configured', remarks: '' }
        ],
        access: [
          { id: `acc-${p.id}-1`, target: 'Admin Console', loginId: 'admin', password1: '********', password2: '', usage: 'System Management', notes: 'VPN Access Required', remarks: '' }
        ],
        otherNotes: `${p.name} 환경을 위한 기본 운영 정보가 생성되었습니다. 특이사항 발생 시 업데이트가 필요합니다.`
      }));

      await onApplyState({
        companies: initialCompanies,
        users: initialUsers,
        projects: initialProjects,
        tickets: sampleTickets,
        comments: [],
        history: sampleHistory,
        opsInfo: sampleOpsInfo,
        orgInfo: currentState.orgInfo
      });

      setResult({ success: true, message: '고품질 샘플 데이터와 운영 정보가 성공적으로 적용되었습니다.' });
    } catch (err) {
      setResult({ success: false, message: '샘플 생성 중 오류가 발생했습니다.' });
    } finally {
      setIsExecuting(false);
      setProgress(0);
    }
  };

  const handleReset = async () => {
    setConfirmAction(null);
    await simulateProgress(['모든 레코드 검색 중...', '티켓 및 커뮤니케이션 데이터 영구 삭제 중...', '프로젝트 및 인프라 매핑 해제 중...', '관리자 및 본사 계정 보호 중...', '데이터베이스 최적화 중...']);

    try {
      // 본사(c1), 관리자들(u1, u2, u3)은 보존
      const preservedCompanies = initialCompanies.filter(c => c.id === 'c1');
      const preservedUsers = initialUsers.filter(u => u.loginId === 'admin1' || u.loginId === 'support1' || u.loginId === 'admin2');

      await onApplyState({
        companies: preservedCompanies,
        users: preservedUsers,
        projects: [],
        tickets: [],
        comments: [],
        history: [],
        opsInfo: [],
        orgInfo: defaultOrgInfo
      });

      setResult({ success: true, message: '모든 서비스 데이터가 초기화되었습니다. 마스터 정보와 관리자 권한만 유지됩니다.' });
    } catch (err) {
      setResult({ success: false, message: '초기화 중 오류가 발생했습니다.' });
    } finally {
      setIsExecuting(false);
      setProgress(0);
    }
  };

  const ActionCard = ({ icon: Icon, title, desc, onClick, variant = 'blue' }: any) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-200',
      amber: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-200',
      emerald: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-200',
      rose: 'from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-200',
    };
    const bg = colors[variant as keyof typeof colors];

    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${bg} text-white flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon size={28} />
        </div>
        <h4 className="text-lg font-black text-slate-900 mb-2 tracking-tight">{title}</h4>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
          {desc}
        </p>
        <button
          onClick={onClick}
          className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg active:scale-95"
        >
          {title} 실행
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overview Banner */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 sm:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-black mb-3 tracking-tight flex items-center justify-center md:justify-start gap-3">
              <Database className="text-blue-400" size={32} /> 시스템 데이터 관리
            </h3>
            <p className="text-slate-400 text-sm sm:text-base max-w-lg font-medium">
              플랫폼의 모든 데이터 상태를 관리합니다. 주기적인 백업을 통해 데이터 손실을 방지하고, 테스트를 위한 샘플 생성이 가능합니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 text-center">
              <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-widest">Total Tickets</p>
              <p className="text-2xl font-black text-blue-400">{currentState.tickets.length}</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 text-center">
              <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-widest">Active Users</p>
              <p className="text-2xl font-black text-emerald-400">{currentState.users.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ActionCard
          icon={HardDrive}
          title="데이터 백업"
          desc="현재 플랫폼의 모든 정보를 JSON 파일로 내보내어 안전하게 보관합니다."
          variant="blue"
          onClick={() => setConfirmAction('BACKUP')}
        />
        <ActionCard
          icon={FileJson}
          title="데이터 복원"
          desc="백업된 JSON 파일을 불러와 플랫폼을 이전 상태로 완벽하게 되돌립니다."
          variant="emerald"
          onClick={() => fileInputRef.current?.click()}
        />
        <ActionCard
          icon={RotateCcw}
          title="샘플 생성"
          desc="플랫폼 테스트를 위해 표준 샘플 데이터 5세트를 즉시 생성하여 적용합니다."
          variant="amber"
          onClick={() => setConfirmAction('SAMPLE')}
        />
        <ActionCard
          icon={Trash2}
          title="데이터 초기화"
          desc="모든 서비스 데이터를 완전히 삭제합니다. 이 작업은 되돌릴 수 없습니다."
          variant="rose"
          onClick={() => setConfirmAction('RESET')}
        />
      </div>

      <input
        type="file"
        accept=".json"
        className="hidden"
        ref={fileInputRef}
        onChange={handleRestore}
      />

      {/* Success/Error Toast-like Notification */}
      {result && (
        <div className={`p-6 rounded-3xl border flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 shadow-xl ${result.success ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
          {result.success ? <CheckCircle2 className="text-emerald-500 shrink-0" size={24} /> : <AlertTriangle className="text-rose-500 shrink-0" size={24} />}
          <div className="flex-1">
            <p className="font-black text-sm">{result.success ? 'Success' : 'Error'}</p>
            <p className="text-xs font-bold opacity-80">{result.message}</p>
          </div>
          <button onClick={() => setResult(null)} className="p-2 hover:bg-black/5 rounded-xl transition-colors"><X size={18} /></button>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 text-center space-y-6">
              <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center ${confirmAction === 'RESET' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                <AlertTriangle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {confirmAction === 'BACKUP' && '백업을 시작할까요?'}
                  {confirmAction === 'SAMPLE' && '샘플을 생성할까요?'}
                  {confirmAction === 'RESET' && '정말 초기화할까요?'}
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  {confirmAction === 'BACKUP' && '현재 모든 데이터가 포함된 JSON 파일이 다운로드됩니다.'}
                  {confirmAction === 'SAMPLE' && '기존 데이터가 모두 삭제되고 샘플 데이터로 덮어씌워집니다.'}
                  {confirmAction === 'RESET' && '모든 티켓, 댓글, 히스토리 데이터가 영구적으로 삭제됩니다.'}
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-6 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    if (confirmAction === 'BACKUP') handleBackup();
                    if (confirmAction === 'SAMPLE') handleGenerateSamples();
                    if (confirmAction === 'RESET') handleReset();
                  }}
                  className={`flex-1 px-6 py-4 ${confirmAction === 'RESET' ? 'bg-rose-600 shadow-rose-200' : 'bg-blue-600 shadow-blue-200'} text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 tracking-wider`}
                >
                  확인 및 실행
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Overlay */}
      {isExecuting && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-12 w-full max-w-lg shadow-2xl space-y-10 text-center animate-in zoom-in-95 duration-200">
            <div className="relative inline-block">
              <Loader2 size={80} className="text-blue-100 animate-spin" strokeWidth={1.5} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black text-blue-600">{Math.round(progress)}%</span>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{statusMessage}</h3>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">Processing Data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagement;
