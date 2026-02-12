
import { useState, useEffect } from 'react';
import { User, Company, Project, Ticket, Comment, HistoryEntry, OperationalInfo, OrganizationInfo, UserStatus, UserRole, ProjectStatus, CompanyStatus, TicketStatus, AppState } from '../types';
import * as storage from '../lib/storage';
import { addDays } from 'date-fns';
import { addBusinessDays } from '../utils';

export const initialCompanies: Company[] = [
    { id: 'c1', name: '누테크놀로지', representative: '누대표', industry: 'IT 서비스', address: '서울시 강남구', remarks: '본사', status: CompanyStatus.ACTIVE },
    { id: 'c2', name: '(주)미래제조', representative: '김미래', industry: '제조업', address: '경기도 판교', remarks: '핵심 고객사', status: CompanyStatus.ACTIVE },
    { id: 'c3', name: '글로벌유통', representative: '이유통', industry: '유통업', address: '부산시 해운대구', remarks: '전략적 파트너', status: CompanyStatus.ACTIVE },
    { id: 'c4', name: '한국금융솔루션', representative: '박금융', industry: '금융업', address: '서울시 여의도', status: CompanyStatus.ACTIVE },
    { id: 'c5', name: '공공데이터센터', representative: '최공공', industry: '공공기관', address: '세종특별자치시', status: CompanyStatus.ACTIVE },
];

export const initialUsers: User[] = [
    { id: 'u1', loginId: 'admin', password: '0000', name: '시스템 관리자', role: UserRole.ADMIN, status: UserStatus.ACTIVE, mobile: '010-1111-2222', email: 'admin@nu.com' },
    { id: 'u2', loginId: 'support1', password: 'password123', name: '이지원 지원팀장', role: UserRole.SUPPORT_LEAD, status: UserStatus.ACTIVE, department: '기술지원1팀', mobile: '010-3333-4444', email: 'support1@nu.com' },
    { id: 'u3', loginId: 'support2', password: 'password123', name: '박기술 엔지니어', role: UserRole.SUPPORT_STAFF, status: UserStatus.ACTIVE, department: '기술지원1팀', mobile: '010-7777-8888', email: 'support2@nu.com' },
    { id: 'u4', loginId: 'customer1', password: 'password123', name: '김고객 과장', role: UserRole.CUSTOMER, status: UserStatus.ACTIVE, companyId: 'c2', phone: '02-123-4567', mobile: '010-5555-6666', email: 'customer1@mirai.com' },
    { id: 'u5', loginId: 'customer2', password: 'password123', name: '최협력 대리', role: UserRole.CUSTOMER, status: UserStatus.ACTIVE, companyId: 'c3', phone: '051-987-6543', mobile: '010-9999-0000', email: 'customer2@global.com' },
];

export const initialProjects: Project[] = [
    { id: 'p1', name: 'ERP 시스템 고도화', clientId: 'c2', customerContactIds: ['u4'], supportStaffIds: ['u2', 'u3'], description: '기존 ERP 성능 향상 및 모바일 대응', startDate: '2024-01-01', endDate: '2024-12-31', status: ProjectStatus.ACTIVE },
    { id: 'p2', name: '클라우드 마이그레이션', clientId: 'c3', customerContactIds: ['u5'], supportStaffIds: ['u3'], description: '온프레미스 서버의 AWS 전환', startDate: '2024-03-01', endDate: '2024-09-30', status: ProjectStatus.ACTIVE },
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
];

import { useToast } from '../contexts/ToastContext';

import { isConfigured } from '../supabaseClient';

export const useAppState = () => {
    const { showToast } = useToast();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [opsInfo, setOpsInfo] = useState<OperationalInfo[]>([]);
    const [orgInfo, setOrgInfo] = useState<OrganizationInfo>(defaultOrgInfo);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [dataSource, setDataSource] = useState<'supabase' | 'mock'>(isConfigured ? 'supabase' : 'mock');
    const [dbError, setDbError] = useState<string | null>(null);
    const [userCount, setUserCount] = useState<number | null>(null);

    useEffect(() => {
        const initApp = async () => {
            setIsLoading(true);
            try {
                if (!isConfigured) {
                    console.info('Supabase not configured, using mock data.');
                    setDataSource('mock');
                    setIsLoading(false);
                    return;
                }

                const response = await storage.fetchUsersRaw().catch(err => {
                    console.error('Fetch users error:', err);
                    setDbError(err.message || '데이터베이스 연결 오류');
                    return { data: [], count: 0 };
                });

                const rawUsers = response.data || [];
                setUserCount(response.count);

                // DB의 snake_case 데이터를 앱의 camelCase User 객체로 매핑
                const mappedUsers: User[] = rawUsers.map(u => ({
                    ...u,
                    loginId: u.login_id,
                    companyId: u.company_id,
                    department: u.department
                }));

                if (mappedUsers.length > 0) {
                    setDataSource('supabase');
                    setDbError(null);
                    const [
                        savedCompanies,
                        savedProjects,
                        savedTickets,
                        savedComments,
                        savedHistory,
                        savedOpsInfo,
                        savedOrgInfo
                    ] = await Promise.all([
                        storage.fetchCompanies().catch(err => { console.error('Fetch companies error:', err); return []; }),
                        storage.fetchProjects().catch(err => { console.error('Fetch projects error:', err); return []; }),
                        storage.fetchTickets().catch(err => { console.error('Fetch tickets error:', err); return []; }),
                        storage.fetchComments().catch(err => { console.error('Fetch comments error:', err); return []; }),
                        storage.fetchHistory().catch(err => { console.error('Fetch history error:', err); return []; }),
                        storage.fetchAllOpsInfo().catch(err => {
                            console.error('Fetch ops info error:', err);
                            return [];
                        }),
                        storage.fetchOrganizationInfo().catch(err => { console.error('Fetch org info error:', err); return undefined; })
                    ]);

                    console.log(`[App Init] Data Loaded - Companies: ${savedCompanies.length}, Projects: ${savedProjects.length}, Tickets: ${savedTickets.length}`);

                    setCompanies(savedCompanies);
                    setUsers(mappedUsers);
                    setProjects(savedProjects);
                    setTickets(savedTickets);
                    setComments(savedComments);
                    setHistory(savedHistory);
                    setOpsInfo(savedOpsInfo);
                    setOrgInfo(savedOrgInfo || defaultOrgInfo);

                    console.log(`[App Init] Supabase Data Loaded. Users: ${mappedUsers.length}, Projects: ${savedProjects.length}`);

                    const savedSession = localStorage.getItem('nu_session');
                    if (savedSession) {
                        const session = JSON.parse(savedSession);
                        const user = mappedUsers.find(u => u.id === session.userId);
                        if (user) {
                            setCurrentUser(user);
                            setIsLoggedIn(true);
                        }
                    }
                } else if (!dbError) {
                    // 데이터가 없는 경우 수동으로 등록해야 함 (자동 샘플 생성 중단)
                    console.info('No data found in Supabase. App initialized with empty state.');
                    setUsers([]);
                }
            } catch (err) {
                console.error('App initialization error:', err);
                showToast('초기 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        initApp();
    }, [showToast]);

    // --- Handlers with DB-First Consistency ---
    const handleUpdateUser = async (id: string, userData: Partial<User>) => {
        try {
            const currentList = [...users];
            const targetIndex = currentList.findIndex(u => u.id === id);
            if (targetIndex === -1) return;
            const updatedUser = { ...currentList[targetIndex], ...userData };
            await storage.saveUser(updatedUser);
            setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
            if (currentUser && id === currentUser.id) setCurrentUser(updatedUser);
            showToast('사용자 정보가 성공적으로 업데이트되었습니다.', 'success');
        } catch (err) {
            console.error('User update error:', err);
            showToast('사용자 정보 저장 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleCreateUser = async (data: Omit<User, 'id'>) => {
        try {
            const user = { ...data, id: `u${Date.now()}` } as User;
            await storage.saveUser(user);
            setUsers(prev => [...prev, user]);
            showToast('새 사용자가 등록되었습니다.', 'success');
        } catch (err) {
            console.error('User creation error:', err);
            showToast('사용자 등록 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (currentUser?.role !== UserRole.ADMIN) {
            showToast('회원 삭제 권한이 없습니다.', 'error');
            return;
        }
        try {
            await storage.deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
            showToast('사용자가 삭제되었습니다.', 'success');
        } catch (err) {
            console.error('User delete error:', err);
            showToast('사용자 삭제 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleCreateTicket = async (data: Omit<Ticket, 'id'>) => {
        try {
            // ID format: T-YYYYMMDD-SERIAL
            const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const countForToday = tickets.filter(t => t.id.startsWith(`T-${today}`)).length + 1;
            const id = `T-${today}-${String(countForToday).padStart(3, '0')}`;

            const ticket = {
                ...data,
                id,
                createdAt: new Date().toISOString(),
                status: data.status || TicketStatus.RECEIVED
            } as Ticket;

            console.log('[useAppState] Creating Ticket:', ticket);
            await storage.saveTicket(ticket);
            setTickets(prev => [...prev, ticket]);
            showToast('티켓이 생성되었습니다.', 'success');
            return true;
        } catch (err: any) {
            console.error('Ticket creation error:', err);
            const msg = err.message || '알 수 없는 오류';
            showToast(`티켓 생성 실패: ${msg}`, 'error');
            return false;
        }
    };

    const handleCreateCompany = async (data: Omit<Company, 'id'>) => {
        try {
            const company = { ...data, id: `c${Date.now()}` } as Company;
            await storage.saveCompany(company);
            setCompanies(prev => [...prev, company]);
            showToast('새 고객사가 등록되었습니다.', 'success');
        } catch (err) {
            console.error('Company creation error:', err);
            showToast('고객사 등록 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleUpdateCompany = async (id: string, data: Partial<Company>) => {
        try {
            const company = companies.find(c => c.id === id);
            if (!company) return;

            if (data.status === CompanyStatus.INACTIVE) {
                const activeProjects = projects.filter(p => p.clientId === id && p.status === ProjectStatus.ACTIVE);
                if (activeProjects.length > 0) {
                    showToast(`활성 상태인 프로젝트가 ${activeProjects.length}개 있습니다. 먼저 프로젝트를 비활성화해주세요.`, 'error');
                    return;
                }
            }

            const updated = { ...company, ...data };
            await storage.saveCompany(updated);
            setCompanies(prev => prev.map(c => c.id === id ? updated : c));
            showToast('고객사 정보가 업데이트되었습니다.', 'success');
        } catch (err) {
            console.error('Company update error:', err);
            showToast('고객사 정보 수정 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleDeleteCompany = async (id: string) => {
        if (currentUser?.role !== UserRole.ADMIN) {
            showToast('고객사 삭제 권한이 없습니다.', 'error');
            return;
        }

        const activeProjects = projects.filter(p => p.clientId === id && p.status === ProjectStatus.ACTIVE);
        if (activeProjects.length > 0) {
            showToast(`활성 상태인 프로젝트가 ${activeProjects.length}개 있습니다. 먼저 프로젝트를 비활성화해주세요.`, 'error');
            return;
        }

        try {
            await storage.deleteCompany(id);
            setCompanies(prev => prev.filter(c => c.id !== id));
            showToast('고객사가 삭제되었습니다.', 'success');
        } catch (err) {
            console.error('Company delete error:', err);
            showToast('고객사 삭제 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleCreateProject = async (data: Omit<Project, 'id'>) => {
        try {
            // 가시성 필터링 이슈 방지: 지원 인력이 비어있고 생성자가 지원 역할인 경우 자동 추가
            const initialSupportStaff = [...data.supportStaffIds];
            if (initialSupportStaff.length === 0 && currentUser &&
                (currentUser.role === UserRole.SUPPORT_LEAD || currentUser.role === UserRole.SUPPORT_STAFF)) {
                initialSupportStaff.push(currentUser.id);
            }

            const project = {
                ...data,
                id: `p${Date.now()}`,
                supportStaffIds: initialSupportStaff
            } as Project;

            console.log('[useAppState] Creating Project:', project);
            await storage.saveProject(project);
            setProjects(prev => [...prev, project]);
            showToast('새 프로젝트가 등록되었습니다.', 'success');
            return true;
        } catch (err: any) {
            console.error('Project creation error:', err);
            const msg = err.message || '알 수 없는 오류';
            showToast(`프로젝트 등록 실패: ${msg}`, 'error');
            return false;
        }
    };

    const handleUpdateProject = async (id: string, data: Partial<Project>) => {
        try {
            const project = projects.find(p => p.id === id);
            if (!project) return false;

            if (data.status === ProjectStatus.INACTIVE) {
                const incompleteTickets = tickets.filter(t => t.projectId === id && t.status !== TicketStatus.COMPLETED);
                if (incompleteTickets.length > 0) {
                    showToast(`완료되지 않은 티켓이 ${incompleteTickets.length}개 있습니다. 모든 티켓을 완료 처리한 후 비활성화해주세요.`, 'error');
                    return false;
                }
            }

            const updated = { ...project, ...data };
            await storage.saveProject(updated);
            setProjects(prev => prev.map(p => p.id === id ? updated : p));
            showToast('프로젝트 정보가 업데이트되었습니다.', 'success');
            return true;
        } catch (err: any) {
            console.error('Project update error:', err);
            const msg = err.message || '알 수 없는 오류';
            showToast(`프로젝트 정보 수정 실패: ${msg}`, 'error');
            return false;
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (currentUser?.role !== UserRole.ADMIN) {
            showToast('프로젝트 삭제 권한이 없습니다.', 'error');
            return;
        }

        const incompleteTickets = tickets.filter(t => t.projectId === id && t.status !== TicketStatus.COMPLETED);
        if (incompleteTickets.length > 0) {
            showToast(`완료되지 않은 티켓이 ${incompleteTickets.length}개 있습니다. 모든 티켓을 완료 처리한 후 삭제해주세요.`, 'error');
            return;
        }

        try {
            await storage.deleteProject(id);
            setProjects(prev => prev.filter(p => p.id !== id));
            showToast('프로젝트가 삭제되었습니다.', 'success');
        } catch (err) {
            console.error('Project delete error:', err);
            showToast('프로젝트 삭제 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleUpdateOpsInfo = async (newOpsInfo: OperationalInfo) => {
        try {
            await storage.saveOpsInfo(newOpsInfo);
            setOpsInfo(prev => {
                const exists = prev.find(o => o.projectId === newOpsInfo.projectId);
                if (exists) return prev.map(o => o.projectId === newOpsInfo.projectId ? newOpsInfo : o);
                return [...prev, newOpsInfo];
            });
            showToast('운영 정보가 저장되었습니다.', 'success');
        } catch (err) {
            console.error('Ops info update error:', err);
            showToast('운영 정보 저장 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleUpdateOrgInfo = async (data: OrganizationInfo) => {
        try {
            await storage.saveOrganizationInfo(data);
            setOrgInfo(data);
            showToast('기관 정보가 저장되었습니다.', 'success');
        } catch (err) {
            console.error('Org info update error:', err);
            showToast('기관 정보 저장 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleApplyState = async (newState: AppState) => {
        setIsLoading(true);
        try {
            // 1. DB 모든 데이터 초기화
            await storage.clearAllData();

            // 2. 외래 키 제약 조건을 고려하여 순차적 저장
            await storage.saveCompanies(newState.companies);
            await storage.saveUsers(newState.users);
            await storage.saveProjects(newState.projects);
            await storage.saveTickets(newState.tickets);

            // 3. 종속 데이터 저장
            await Promise.all([
                storage.saveComments(newState.comments),
                storage.saveHistoryEntries(newState.history),
                newState.opsInfo ? storage.saveOpsInfos(newState.opsInfo) : Promise.resolve(),
                newState.orgInfo ? storage.saveOrganizationInfo(newState.orgInfo) : Promise.resolve(),
            ]);

            // DB 성공 시에만 로컬 UI 상태 업데이트
            setCompanies(newState.companies);
            setUsers(newState.users);
            setProjects(newState.projects);
            setTickets(newState.tickets);
            setComments(newState.comments);
            setHistory(newState.history);
            if (newState.opsInfo) setOpsInfo(newState.opsInfo);
            if (newState.orgInfo) setOrgInfo(newState.orgInfo);

            const foundUser = newState.users.find(u => (currentUser && u.id === currentUser.id)) || newState.users[0];
            if (foundUser) setCurrentUser(foundUser);

            showToast('데이터가 성공적으로 동기화되었습니다.', 'success');
        } catch (err) {
            console.error('State sync error:', err);
            showToast('데이터 동기화 중 오류가 발생했습니다. DB 연결을 확인해주세요.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        currentUser, setCurrentUser,
        companies, setCompanies,
        users, setUsers,
        projects, setProjects,
        tickets, setTickets,
        comments, setComments,
        history, setHistory,
        opsInfo, setOpsInfo,
        orgInfo, setOrgInfo,
        isLoading, setIsLoading,
        isLoggedIn, setIsLoggedIn,
        handleCreateUser,
        handleUpdateUser,
        handleDeleteUser,
        handleCreateCompany,
        handleUpdateCompany,
        handleDeleteCompany,
        handleCreateProject,
        handleUpdateProject,
        handleDeleteProject,
        handleUpdateOpsInfo,
        handleUpdateOrgInfo,
        handleApplyState,
        dataSource,
        dbError,
        userCount
    };
};
