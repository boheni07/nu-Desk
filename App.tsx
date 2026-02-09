
import React, { useState, useEffect, useMemo } from 'react';
import { isAfter } from 'date-fns';
import { UserRole, Ticket, TicketStatus, User, Project, Company, Comment, HistoryEntry, ProjectStatus, UserStatus, CompanyStatus, IntakeMethod, OperationalInfo, AppState, OrganizationInfo } from './types';
import { addBusinessDays, isOverdue, addBusinessHours } from './utils';
import {
  PlusCircle,
  Building2,
  Users as UsersIcon,
  Briefcase,
  Ticket as TicketIcon,
  Settings,
  Menu,
  X,
  ChevronLeft,
  Database,
  Activity,
  LogOut,
  Archive,
} from 'lucide-react';
import NavItem from './components/layout/NavItem';
import LoadingOverlay from './components/common/LoadingOverlay';
import { addDays } from 'date-fns';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import TicketCreate from './components/TicketCreate';
import CompanyManagement from './components/CompanyManagement';
import UserManagement from './components/UserManagement';
import ProjectManagement from './components/ProjectManagement';
import ProfileEdit from './components/ProfileEdit';
import DataManagement from './components/DataManagement';
import OperationalManagement from './components/OperationalManagement';
import OrganizationSettings from './components/OrganizationSettings';
import Login from './components/auth/Login';
import * as storage from './lib/storage';

// 1. Initial Sample Companies
export const initialCompanies: Company[] = [
  { id: 'c1', name: '누테크놀로지', representative: '누대표', industry: 'IT 서비스', address: '서울시 강남구', remarks: '본사', status: CompanyStatus.ACTIVE },
  { id: 'c2', name: '(주)미래제조', representative: '김미래', industry: '제조업', address: '경기도 판교', remarks: '핵심 고객사', status: CompanyStatus.ACTIVE },
  { id: 'c3', name: '글로벌유통', representative: '이유통', industry: '유통업', address: '부산시 해운대구', remarks: '전략적 파트너', status: CompanyStatus.ACTIVE },
  { id: 'c4', name: '한국금융솔루션', representative: '박금융', industry: '금융업', address: '서울시 여의도', status: CompanyStatus.ACTIVE },
  { id: 'c5', name: '공공데이터센터', representative: '최공공', industry: '공공기관', address: '세종특별자치시', status: CompanyStatus.ACTIVE },
];

// 2. Initial Sample Users
export const initialUsers: User[] = [
  { id: 'u1', loginId: 'admin1', password: 'password123', name: '홍길동 관리자', role: UserRole.ADMIN, status: UserStatus.ACTIVE, mobile: '010-1111-2222', email: 'admin@nu.com' },
  { id: 'u2', loginId: 'support1', password: 'password123', name: '이지원 지원팀장', role: UserRole.SUPPORT_LEAD, status: UserStatus.ACTIVE, department: '기술지원1팀', mobile: '010-3333-4444', email: 'support1@nu.com' },
  { id: 'u3', loginId: 'support2', password: 'password123', name: '박기술 엔지니어', role: UserRole.SUPPORT_STAFF, status: UserStatus.ACTIVE, department: '기술지원1팀', mobile: '010-7777-8888', email: 'support2@nu.com' },
  { id: 'u4', loginId: 'customer1', password: 'password123', name: '김고객 과장', role: UserRole.CUSTOMER, status: UserStatus.ACTIVE, companyId: 'c2', phone: '02-123-4567', mobile: '010-5555-6666', email: 'customer1@mirai.com' },
  { id: 'u5', loginId: 'customer2', password: 'password123', name: '최협력 대리', role: UserRole.CUSTOMER, status: UserStatus.ACTIVE, companyId: 'c3', phone: '051-987-6543', mobile: '010-9999-0000', email: 'customer2@global.com' },
];

// 3. Initial Sample Projects
export const initialProjects: Project[] = [
  { id: 'p1', name: 'ERP 시스템 고도화', clientId: 'c2', customerContactIds: ['u4'], supportStaffIds: ['u2', 'u3'], description: '기존 ERP 성능 향상 및 모바일 대응', startDate: '2024-01-01', endDate: '2024-12-31', status: ProjectStatus.ACTIVE },
  { id: 'p2', name: '클라우드 마이그레이션', clientId: 'c3', customerContactIds: ['u5'], supportStaffIds: ['u3'], description: '온프레미스 서버의 AWS 전환', startDate: '2024-03-01', endDate: '2024-09-30', status: ProjectStatus.ACTIVE },
  { id: 'p3', name: '차세대 뱅킹 보안 강화', clientId: 'c4', customerContactIds: [], supportStaffIds: ['u2'], description: '금융권 보안 가이드라인 준수 작업', startDate: '2024-05-15', endDate: '2025-05-14', status: ProjectStatus.ACTIVE },
  { id: 'p4', name: '대시보드 모바일화', clientId: 'c5', customerContactIds: [], supportStaffIds: ['u2'], description: '공공 데이터 시각화 앱 개발', startDate: '2024-02-01', endDate: '2024-06-30', status: ProjectStatus.ACTIVE },
  { id: 'p5', name: 'AI 기반 수요예측 시스템', clientId: 'c2', customerContactIds: ['u4'], supportStaffIds: ['u3'], description: '제조 공정 최적화를 위한 AI 도입', startDate: '2024-06-01', endDate: '2024-11-30', status: ProjectStatus.ACTIVE },
];

export const defaultOrgInfo: OrganizationInfo = {
  nameKo: '누테크놀로지',
  nameEn: 'NU Technology',
  representative: '홍길동',
  bizNumber: '000-00-00000',
  bizType: '서비스',
  bizCategory: '소프트웨어 개발',
  zipCode: '00000',
  address: '서울시 강남구',
  phone: '02-000-0000',
  email: 'info@nu.com',
  supportTeam1: '기술지원1팀',
  supportTeam2: '기술지원2팀',
  supportTeam3: '고객지원팀',
  remarks: ''
};

export const getInitialTickets = (now: Date): Ticket[] => [
  { id: 'T-1001', title: '로그인 페이지 간헐적 튕김 현상', description: '특정 모바일 브라우저에서 로그인 시도 시 세션이 유지되지 않고 메인으로 돌아갑니다.', status: TicketStatus.WAITING, customerId: 'u4', customerName: '김고객 과장', projectId: 'p1', createdAt: addDays(now, -1).toISOString(), dueDate: addBusinessDays(now, 4).toISOString(), initialDueDate: addBusinessDays(now, 4).toISOString() },
  { id: 'T-1002', title: '신규 사용자 권한 일괄 등록 요청', description: '인사 이동으로 인한 50명의 사용자 권한을 엑셀 기반으로 등록 요청합니다.', status: TicketStatus.RECEIVED, customerId: 'u5', customerName: '최협력 대리', supportId: 'u3', supportName: '박기술 엔지니어', projectId: 'p2', createdAt: addDays(now, -2).toISOString(), dueDate: addBusinessDays(now, 3).toISOString(), initialDueDate: addBusinessDays(now, 3).toISOString() },
  { id: 'T-1003', title: '실시간 데이터 동기화 지연 문의', description: '어제 오후 3시부터 금융 데이터 동기화 주기가 10분 이상 지연되고 있습니다.', status: TicketStatus.IN_PROGRESS, customerId: 'u4', customerName: '김고객 과장', supportId: 'u2', supportName: '이지원 지원팀장', projectId: 'p3', plan: '서버 로그 분석 후 DB 인덱스 재구성 예정', expectedCompletionDate: addDays(now, 1).toISOString(), createdAt: addDays(now, -1).toISOString(), dueDate: addBusinessDays(now, 2).toISOString(), initialDueDate: addBusinessDays(now, 2).toISOString() },
  { id: 'T-1004', title: '공공 API 인터페이스 사양 변경 대응', description: '정부 API 버전 업그레이드에 따른 연동 모듈 수정이 필요합니다.', status: TicketStatus.DELAYED, customerId: 'u4', customerName: '김고객 과장', supportId: 'u3', supportName: '박기술 엔지니어', projectId: 'p4', createdAt: addDays(now, -7).toISOString(), dueDate: addDays(now, -1).toISOString(), initialDueDate: addDays(now, -1).toISOString() },
  { id: 'T-1005', title: '수요예측 대시보드 UI 레이아웃 개선', description: '사용자 피드백을 반영하여 메인 차트 크기를 키우고 필터를 상단으로 이동했습니다.', status: TicketStatus.COMPLETED, customerId: 'u5', customerName: '최협력 대리', supportId: 'u2', supportName: '이지원 지원팀장', projectId: 'p5', satisfaction: 5, completionFeedback: '요청한 대로 깔끔하게 반영되었습니다. 감사합니다!', createdAt: addDays(now, -10).toISOString(), dueDate: addDays(now, -5).toISOString(), initialDueDate: addDays(now, -5).toISOString() }
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[1]);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [opsInfo, setOpsInfo] = useState<OperationalInfo[]>([]);
  const [orgInfo, setOrgInfo] = useState<OrganizationInfo | undefined>(undefined);
  const [view, setView] = useState<'list' | 'completed_list' | 'create' | 'edit' | 'detail' | 'companies' | 'users' | 'projects' | 'profile' | 'dataManagement' | 'opsManagement' | 'orgSettings'>('list');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 1. 초기 데이터 로드 (Supabase 관계형)
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      try {
        // 개별 테이블 로드 (하나라도 실패하면 로그 남김)
        const savedUsers = await storage.fetchUsers().catch(e => { console.error('Users load failed:', e); return []; });

        if (savedUsers.length > 0) {
          // 사용자가 있으면 다른 데이터도 로드
          const [
            savedCompanies,
            savedProjects,
            savedTickets,
            savedComments,
            savedHistory,
            savedOpsInfo,
            savedOrgInfo
          ] = await Promise.all([
            storage.fetchCompanies().catch(() => []),
            storage.fetchProjects().catch(() => []),
            storage.fetchTickets().catch(() => []),
            storage.fetchComments().catch(() => []),
            storage.fetchHistory().catch(() => []),
            storage.fetchAllOpsInfo().catch(() => []),
            storage.fetchOrganizationInfo().catch(() => undefined)
          ]);

          setCompanies(savedCompanies);
          setUsers(savedUsers);
          setProjects(savedProjects);
          setTickets(savedTickets);
          setComments(savedComments);
          setHistory(savedHistory);
          setOpsInfo(savedOpsInfo);
          setOrgInfo(savedOrgInfo || defaultOrgInfo);

          // 세션 체크 (localStorage)
          const savedSession = localStorage.getItem('nu_session');
          if (savedSession) {
            const session = JSON.parse(savedSession);
            const user = savedUsers.find(u => u.id === session.userId);
            if (user) {
              setCurrentUser(user);
              setIsLoggedIn(true);
            }
          } else {
            // 기본값 설정 (로그인이 안 된 상태면 setCurrentUser는 dummy 나 초기 로드용으로만)
            const admin = savedUsers.find(u => u.role === UserRole.ADMIN) || savedUsers[0];
            setCurrentUser(admin);
          }
        } else {
          // 데이터가 없으면 샘플 데이터 시딩
          console.log('초기 데이터가 없어 시딩을 시작합니다...');
          const now = new Date();
          const sampleTickets = getInitialTickets(now);
          const sampleHistory: HistoryEntry[] = [];
          sampleTickets.forEach(t => {
            sampleHistory.push({ id: `h-${t.id}-init`, ticketId: t.id, status: TicketStatus.WAITING, changedBy: t.customerName, timestamp: t.createdAt, note: '티켓이 신규 등록되었습니다.' });
          });

          setTickets(sampleTickets);
          setHistory(sampleHistory);

          // Supabase 시딩
          try {
            await storage.saveCompanies(initialCompanies);
            await storage.saveUsers(initialUsers);
            await storage.saveProjects(initialProjects);
            await storage.saveTickets(sampleTickets);
            await storage.saveHistoryEntries(sampleHistory);
            console.log('시딩 완료');
          } catch (seedErr) {
            console.error('시딩 중 오류 발생 (테이블이 없거나 권한 문제):', seedErr);
          }
        }
      } catch (err) {
        console.error('초기 로딩 중 알 수 없는 오류 발생:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  useEffect(() => {
    const timer = setInterval(async () => {
      const overdueTickets = tickets.filter(t =>
        t.status !== TicketStatus.COMPLETED &&
        t.status !== TicketStatus.DELAYED &&
        isOverdue(t.dueDate)
      );

      const autoReceiveTickets = tickets.filter(t =>
        t.status === TicketStatus.WAITING &&
        isAfter(new Date(), addBusinessHours(new Date(t.createdAt), 4))
      );

      if (overdueTickets.length > 0 || autoReceiveTickets.length > 0) {
        setTickets(prev => prev.map(t => {
          // 1. Overdue Check
          if (t.status !== TicketStatus.COMPLETED && t.status !== TicketStatus.DELAYED && isOverdue(t.dueDate)) {
            return { ...t, status: TicketStatus.DELAYED };
          }
          // 2. Auto Receive Check (4 Business Hours)
          if (t.status === TicketStatus.WAITING && isAfter(new Date(), addBusinessHours(new Date(t.createdAt), 4))) {
            return { ...t, status: TicketStatus.RECEIVED_AUTO };
          }
          return t;
        }));

        // Add history entries
        for (const t of overdueTickets) {
          const historyEntry: HistoryEntry = { id: `h-${Date.now()}-${t.id}`, ticketId: t.id, status: TicketStatus.DELAYED, changedBy: 'System', timestamp: new Date().toISOString(), note: '기한 도과로 인해 상태가 지연(DELAYED)으로 자동 변경되었습니다.' };
          await storage.saveHistoryEntry(historyEntry);
        }
        for (const t of autoReceiveTickets) {
          const historyEntry: HistoryEntry = { id: `h-${Date.now()}-${t.id}`, ticketId: t.id, status: TicketStatus.RECEIVED_AUTO, changedBy: 'System', timestamp: new Date().toISOString(), note: '접수 대기 4근무시간 경과로 인해 상태가 접수(자동)으로 변경되었습니다.' };
          await storage.saveHistoryEntry(historyEntry);
        }
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [tickets]);

  // PERMISSION FILTERING
  const filteredProjects = useMemo(() => {
    if (currentUser.role === UserRole.ADMIN) return projects;

    if (currentUser.role === UserRole.SUPPORT_LEAD) {
      // 본인 및 부서원의 ID 리스트 확보
      const teamUserIds = users
        .filter(u =>
          u.id === currentUser.id ||
          (currentUser.department && u.department === currentUser.department)
        )
        .map(u => u.id);

      // 본인이 배정되었거나 부서원이 배정된 프로젝트 필터링
      return projects.filter(p => p.supportStaffIds.some(id => teamUserIds.includes(id)));
    }

    if (currentUser.role === UserRole.SUPPORT_STAFF) {
      return projects.filter(p => p.supportStaffIds.includes(currentUser.id));
    }

    // 고객사는 본인이 담당자로 등록된 프로젝트만 조회
    return projects.filter(p => p.customerContactIds.includes(currentUser.id));
  }, [projects, users, currentUser]);

  const filteredTickets = useMemo(() => {
    if (currentUser.role === UserRole.ADMIN) return tickets;
    const accessibleProjectIds = filteredProjects.map(p => p.id);
    return tickets.filter(t => accessibleProjectIds.includes(t.projectId));
  }, [tickets, filteredProjects, currentUser]);

  const selectedTicket = useMemo(() =>
    tickets.find(t => t.id === selectedTicketId), [tickets, selectedTicketId]
  );

  const changeView = React.useCallback((newView: typeof view) => {
    setView(newView);
    setIsSidebarOpen(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('nu_session', JSON.stringify({ userId: user.id, timestamp: new Date().toISOString() }));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('nu_session');
    setView('list');
    setIsSidebarOpen(false);
  };

  // HANDLERS
  const handleCreateTicket = React.useCallback(async (newTicket: Omit<Ticket, 'id' | 'createdAt' | 'status'>) => {
    const project = projects.find(p => p.id === newTicket.projectId);
    const pmId = project?.supportStaffIds[0];
    const pmUser = users.find(u => u.id === pmId);
    const ticket: Ticket = {
      ...newTicket,
      id: `T-${Math.floor(Math.random() * 9000) + 1000}`,
      createdAt: new Date().toISOString(),
      status: currentUser.role === UserRole.CUSTOMER ? TicketStatus.WAITING : (newTicket.plan ? TicketStatus.IN_PROGRESS : TicketStatus.RECEIVED),
      supportId: pmId,
      supportName: pmUser?.name,
    };

    setTickets(prev => [ticket, ...prev]);
    const historyEntry: HistoryEntry = { id: `h-${Date.now()}`, ticketId: ticket.id, status: ticket.status, changedBy: currentUser.name, timestamp: new Date().toISOString(), note: '티켓이 신규 등록되었습니다.' };
    setHistory(prev => [historyEntry, ...prev]);

    await storage.saveTicket(ticket);
    await storage.saveHistoryEntry(historyEntry);

    changeView('list');
  }, [projects, users, currentUser, changeView]);

  const handleUpdateTicket = React.useCallback(async (id: string, updatedData: Partial<Ticket>) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;
    const updatedTicket = { ...ticket, ...updatedData };

    setTickets(prev => prev.map(t => t.id === id ? updatedTicket : t));
    const historyEntry: HistoryEntry = { id: `h-${Date.now()}`, ticketId: id, status: updatedTicket.status, changedBy: currentUser.name, timestamp: new Date().toISOString(), note: '티켓 정보가 수정되었습니다.' };
    setHistory(prev => [historyEntry, ...prev]);

    await storage.saveTicket(updatedTicket);
    await storage.saveHistoryEntry(historyEntry);

    changeView('list');
    setEditingTicket(null);
  }, [tickets, currentUser, changeView]);

  const handleDeleteTicket = React.useCallback(async (id: string) => {
    if (window.confirm('정말 이 티켓을 삭제하시겠습니까?')) {
      setTickets(prev => prev.filter(t => t.id !== id));
      setHistory(prev => prev.filter(h => h.ticketId !== id));
      setComments(prev => prev.filter(c => c.ticketId !== id));
      if (selectedTicketId === id) setSelectedTicketId(null);

      await storage.deleteTicket(id);
    }
  }, [selectedTicketId]);

  const updateTicketStatus = React.useCallback(async (ticketId: string, newStatus: TicketStatus, updates: Partial<Ticket> = {}, note?: string, action?: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    // Guard Clauses: Prevent reverting to WAITING or RECEIVED
    if (newStatus === TicketStatus.WAITING && ticket.status !== TicketStatus.WAITING) {
      console.warn('Cannot revert to WAITING status');
      return;
    }
    if ((newStatus === TicketStatus.RECEIVED || newStatus === TicketStatus.RECEIVED_AUTO) &&
      (ticket.status !== TicketStatus.WAITING && ticket.status !== TicketStatus.RECEIVED && ticket.status !== TicketStatus.RECEIVED_AUTO)) {
      console.warn('Cannot revert to RECEIVED status from advanced states');
      return;
    }
    // Prevent re-completing if already completed (unless reverting from completed, which is handled by specific logic elsewhere e.g. rejection)
    if (newStatus === TicketStatus.COMPLETED && ticket.status === TicketStatus.COMPLETED) {
      return;
    }

    const updatedTicket = { ...ticket, ...updates, status: newStatus };

    setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
    const historyEntry: HistoryEntry = { id: `h-${Date.now()}`, ticketId, status: newStatus, changedBy: currentUser.name, timestamp: new Date().toISOString(), note: note || `상태가 ${newStatus}(으)로 변경되었습니다.`, action };
    setHistory(prev => [historyEntry, ...prev]);

    await storage.saveTicket(updatedTicket);
    await storage.saveHistoryEntry(historyEntry);
  }, [tickets, currentUser]);

  const addComment = React.useCallback(async (commentData: Omit<Comment, 'id' | 'timestamp'>) => {
    const comment: Comment = { ...commentData, id: `c-${Date.now()}`, timestamp: new Date().toISOString() };
    setComments(prev => [comment, ...prev]);
    await storage.saveComment(comment);
  }, []);

  const handleUpdateUser = React.useCallback(async (id: string, userData: Partial<User>) => {
    setUsers(prev => {
      const updated = prev.map(u => u.id === id ? { ...u, ...userData } : u);
      const updatedUser = updated.find(u => u.id === id);
      if (id === currentUser.id && updatedUser) {
        setCurrentUser(updatedUser);
      }
      if (updatedUser) storage.saveUser(updatedUser);
      return updated;
    });
  }, [currentUser.id]);

  const handleUpdateOrgInfo = async (data: OrganizationInfo) => {
    setOrgInfo(data);
    await storage.saveOrganizationInfo(data);
  };

  const handleApplyState = async (newState: AppState) => {
    setIsLoading(true);
    try {
      // 로컬 상태 업데이트
      setCompanies(newState.companies);
      setUsers(newState.users);
      setProjects(newState.projects);
      setTickets(newState.tickets);
      setComments(newState.comments);
      setHistory(newState.history);
      if (newState.opsInfo) setOpsInfo(newState.opsInfo);
      if (newState.orgInfo) setOrgInfo(newState.orgInfo);

      const foundUser = newState.users.find(u => u.id === currentUser.id) || newState.users[0];
      setCurrentUser(foundUser);

      // Supabase 동기화 (기존 데이터 전체 삭제는 위험하므로 업데이트/삽입 위주로 처리)
      // 실제 운영 환경에서는 TRUNCATE 후 시딩하거나 정교한 DIFF 알고리즘이 필요하지만,
      // 여기서는 새로운 상태의 모든 객체를 upsert 합니다.
      await storage.saveCompanies(newState.companies);
      await storage.saveUsers(newState.users);
      await storage.saveProjects(newState.projects);
      await storage.saveTickets(newState.tickets);
      await storage.saveComments(newState.comments);
      await storage.saveHistoryEntries(newState.history);
      if (newState.opsInfo) {
        await storage.saveOpsInfos(newState.opsInfo);
      }
      if (newState.orgInfo) {
        await storage.saveOrganizationInfo(newState.orgInfo);
      }

      console.log('Supabase 동기화 완료');
    } catch (err) {
      console.error('상태 적용 중 오류 발생:', err);
    } finally {
      setIsLoading(false);
    }
  };


  const appUI = (
    <div className="flex min-h-screen bg-slate-50">
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-900 text-white flex flex-col z-50 transition-transform duration-300 transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-slate-800 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2 cursor-pointer" onClick={() => changeView('list')}>
            <span className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">nu</span>
            ServiceDesk
          </h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg"><X size={20} /></button>
        </div>
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar flex flex-col">
          <NavItem icon={PlusCircle} label="New Ticket" targetView="create" currentView={view} currentUserRole={currentUser.role} onClick={changeView} />
          <NavItem icon={TicketIcon} label="티켓 관리(진행중)" targetView="list" currentView={view} currentUserRole={currentUser.role} onClick={changeView} />
          <NavItem icon={Archive} label="티켓 기록(완료)" targetView="completed_list" currentView={view} currentUserRole={currentUser.role} onClick={changeView} />
          <div className="pt-8 pb-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Management</div>
          <NavItem icon={Briefcase} label="프로젝트 관리" targetView="projects" currentView={view} currentUserRole={currentUser.role} onClick={changeView} supportOrAdmin />
          <NavItem icon={Activity} label="운영정보 관리" targetView="opsManagement" currentView={view} currentUserRole={currentUser.role} onClick={changeView} supportOrAdmin />
          <NavItem icon={Building2} label="고객사 관리" targetView="companies" currentView={view} currentUserRole={currentUser.role} onClick={changeView} adminOnly />
          <NavItem icon={UsersIcon} label="회원 관리" targetView="users" currentView={view} currentUserRole={currentUser.role} onClick={changeView} adminOnly />
          <div className="pt-8 pb-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">System</div>
          <NavItem icon={Building2} label="기관정보 설정" targetView="orgSettings" currentView={view} currentUserRole={currentUser.role} onClick={changeView} adminOnly />
          <NavItem icon={Database} label="데이터 관리" targetView="dataManagement" currentView={view} currentUserRole={currentUser.role} onClick={changeView} adminOnly />

          <div className="px-4 pt-4 mb-4">
            <label className="block text-[10px] text-slate-500 mb-2 uppercase font-bold">Role Simulator (Dev)</label>
            <select className="bg-slate-800 text-xs rounded-lg p-2.5 w-full border-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-300" value={currentUser.id} onChange={(e) => setCurrentUser(users.find(u => u.id === e.target.value)!)}>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>

          <div className="px-4 py-6 border-t border-slate-800 mt-auto">
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-slate-700/50 hover:border-rose-900/50"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </nav>
        <div onClick={() => changeView('profile')} className={`p-4 bg-slate-800/50 m-6 rounded-2xl cursor-pointer hover:bg-slate-800 transition-all border border-slate-700/30 group ${view === 'profile' ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-bold shrink-0 shadow-lg group-hover:scale-105 transition-transform text-lg">{currentUser.name[0]}</div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold truncate text-slate-100">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{currentUser.role}</p>
            </div>
            <Settings size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col lg:ml-72 min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 lg:hidden flex justify-between items-center">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><Menu size={24} /></button>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><span className="bg-blue-600 p-1.5 rounded-lg text-white text-xs">nu</span>ServiceDesk</h2>
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold" onClick={() => changeView('profile')}>{currentUser.name[0]}</div>
        </header>

        {isLoading ? <LoadingOverlay /> : (
          <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1440px] w-full mx-auto">
            <div className="mb-6 lg:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {view === 'list' && 'Active Tickets'}
                  {view === 'completed_list' && 'Completed Tickets'}
                  {view === 'create' && 'Create New Ticket'}
                  {view === 'edit' && 'Edit Ticket'}
                  {view === 'detail' && `Ticket ${selectedTicketId}`}
                  {view === 'companies' && 'Company Management'}
                  {view === 'users' && 'User Management'}
                  {view === 'projects' && 'Project Management'}
                  {view === 'opsManagement' && 'Operational Management'}
                  {view === 'profile' && 'My Account Settings'}
                  {view === 'orgSettings' && 'Organization Settings'}
                  {view === 'dataManagement' && 'Data Management'}
                </h2>
                <p className="text-slate-500 text-sm sm:text-base mt-1">안녕하세요, {currentUser.name}님! {view === 'list' && '현재 활성화된 티켓 리스트입니다.'}</p>
              </div>
              {(view === 'detail' || view === 'edit' || view === 'dataManagement' || view === 'orgSettings') && <button onClick={() => changeView('list')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm transition-all self-start"><ChevronLeft size={20} /> Back to List</button>}
            </div>

            <div className="relative">
              {view === 'list' && <TicketList tickets={filteredTickets.filter(t => t.status !== TicketStatus.COMPLETED)} currentUser={currentUser} onSelect={(id) => { setSelectedTicketId(id); setView('detail'); }} onEdit={(ticket) => { setEditingTicket(ticket); setView('edit'); }} onDelete={handleDeleteTicket} />}
              {view === 'completed_list' && <TicketList tickets={filteredTickets.filter(t => t.status === TicketStatus.COMPLETED)} currentUser={currentUser} onSelect={(id) => { setSelectedTicketId(id); setView('detail'); }} onEdit={(ticket) => { setEditingTicket(ticket); setView('edit'); }} onDelete={handleDeleteTicket} />}
              {view === 'create' && <TicketCreate projects={filteredProjects.filter(p => p.status === ProjectStatus.ACTIVE)} currentUser={currentUser} onSubmit={handleCreateTicket} onCancel={() => changeView('list')} />}
              {view === 'edit' && editingTicket && <TicketCreate projects={filteredProjects.filter(p => p.status === ProjectStatus.ACTIVE)} currentUser={currentUser} initialData={editingTicket} onSubmit={(data) => handleUpdateTicket(editingTicket.id, data)} onCancel={() => { setEditingTicket(null); changeView('list'); }} />}
              {view === 'detail' && selectedTicket && <TicketDetail ticket={selectedTicket} project={projects.find(p => p.id === selectedTicket.projectId)!} users={users} history={history.filter(h => h.ticketId === selectedTicket.id)} comments={comments.filter(c => c.ticketId === selectedTicket.id)} currentUser={currentUser} onStatusUpdate={updateTicketStatus} onAddComment={addComment} onBack={() => changeView(selectedTicket.status === TicketStatus.COMPLETED ? 'completed_list' : 'list')} />}
              {view === 'companies' && currentUser.role === UserRole.ADMIN && (
                <CompanyManagement
                  companies={companies}
                  onAdd={async (data) => {
                    const company = { ...data, id: `c${Date.now()}` };
                    setCompanies([...companies, company]);
                    await storage.saveCompany(company);
                  }}
                  onUpdate={async (id, data) => {
                    const company = companies.find(c => c.id === id);
                    if (company) {
                      const updated = { ...company, ...data };
                      setCompanies(companies.map(c => c.id === id ? updated : c));
                      await storage.saveCompany(updated);
                    }
                    return true;
                  }}
                  onDelete={async (id) => {
                    setCompanies(companies.filter(c => c.id !== id));
                    await storage.deleteCompany(id);
                  }}
                />
              )}
              {view === 'users' && currentUser.role === UserRole.ADMIN && (
                <UserManagement
                  users={users}
                  companies={companies}
                  currentUser={currentUser}
                  orgInfo={orgInfo}
                  onAdd={async (data) => {
                    const user = { ...data, id: `u${Date.now()}` };
                    setUsers([...users, user]);
                    await storage.saveUser(user);
                  }}
                  onUpdate={handleUpdateUser}
                  onDelete={async (id) => {
                    setUsers(users.filter(u => u.id !== id));
                    await storage.deleteUser(id);
                  }}
                />
              )}
              {view === 'projects' && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPPORT_LEAD || currentUser.role === UserRole.SUPPORT_STAFF || currentUser.role === UserRole.CUSTOMER) && (
                <ProjectManagement
                  projects={filteredProjects}
                  companies={companies}
                  users={users}
                  currentUser={currentUser}
                  onAdd={async (data) => {
                    const project = { ...data, id: `p${Date.now()}` };
                    setProjects([...projects, project]);
                    await storage.saveProject(project);
                  }}
                  onUpdate={async (id, data) => {
                    const project = projects.find(p => p.id === id);
                    if (project) {
                      const updated = { ...project, ...data };
                      setProjects(projects.map(p => p.id === id ? updated : p));
                      await storage.saveProject(updated);
                    }
                    return true;
                  }}
                  onDelete={async (id) => {
                    setProjects(projects.filter(p => p.id !== id));
                    await storage.deleteProject(id);
                  }}
                />
              )}
              {/* 운영정보 관리: 권한이 있는 프로젝트의 정보만 표시 */}
              {view === 'opsManagement' && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPPORT_LEAD || currentUser.role === UserRole.SUPPORT_STAFF) && (
                <OperationalManagement
                  projects={filteredProjects}
                  opsInfo={opsInfo}
                  onUpdate={async (newOpsInfo) => {
                    const exists = opsInfo.find(o => o.projectId === newOpsInfo.projectId);
                    if (exists) {
                      setOpsInfo(opsInfo.map(o => o.projectId === newOpsInfo.projectId ? newOpsInfo : o));
                    } else {
                      setOpsInfo([...opsInfo, newOpsInfo]);
                    }
                    await storage.saveOpsInfo(newOpsInfo);
                  }}
                />
              )}
              {view === 'profile' && <ProfileEdit user={currentUser} companyName={currentUser.companyId ? companies.find(c => c.id === currentUser.companyId)?.name : '본사 (nu)'} onUpdate={(data) => handleUpdateUser(currentUser.id, data)} onCancel={() => changeView('list')} />}
              {view === 'orgSettings' && currentUser.role === UserRole.ADMIN && (
                <OrganizationSettings
                  initialData={orgInfo}
                  onUpdate={handleUpdateOrgInfo}
                />
              )}
              {view === 'dataManagement' && currentUser.role === UserRole.ADMIN && (
                <DataManagement
                  currentState={{ companies, users, projects, tickets, comments, history, opsInfo, orgInfo }}
                  onApplyState={handleApplyState}
                />
              )}
            </div>
          </main>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isLoading ? <LoadingOverlay /> : (
        !isLoggedIn ? <Login users={users} onLogin={handleLogin} /> : appUI
      )}
    </>
  );
};

export default App;
