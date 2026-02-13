import React, { useMemo, useState } from 'react';
import {
    BarChart3,
    PieChart,
    Users,
    Ticket as TicketIcon,
    AlertCircle,
    CheckCircle2,
    TrendingUp,
    Briefcase,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Clock,
    UserCheck,
    Layout
} from 'lucide-react';
import { Ticket, Project, User, TicketStatus, UserRole } from '../types';
import { startOfWeek, startOfMonth, startOfYear, isAfter, subDays, format, eachDayOfInterval, isSameDay } from 'date-fns';

interface OperationalReportProps {
    tickets: Ticket[];
    projects: Project[];
    users: User[];
    currentUser: User;
}

type ReportPeriod = 'weekly' | 'monthly' | 'yearly';

const OperationalReport: React.FC<OperationalReportProps> = ({
    tickets,
    projects,
    users,
    currentUser
}) => {
    const [period, setPeriod] = useState<ReportPeriod>('weekly');

    const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPPORT_LEAD;

    // 1. 기간 필터링 로직
    const filteredByPeriod = useMemo(() => {
        const now = new Date();
        let startDate: Date;

        if (period === 'weekly') startDate = startOfWeek(now, { weekStartsOn: 1 });
        else if (period === 'monthly') startDate = startOfMonth(now);
        else startDate = startOfYear(now);

        return tickets.filter(t => isAfter(new Date(t.createdAt), startDate));
    }, [tickets, period]);

    // 2. 권한별 데이터 필터링 (회원인 경우 본인 업무 중심)
    const reportTickets = useMemo(() => {
        if (isAdmin) return filteredByPeriod;

        // 회원은 본인이 생성했거나, 본인이 담당인(드문 경우지만), 혹은 본인이 참여 중인 프로젝트의 티켓
        return filteredByPeriod.filter(t =>
            t.customerName === currentUser.name ||
            t.supportStaffId === currentUser.id
        );
    }, [filteredByPeriod, isAdmin, currentUser]);

    // 3. 핵심 지표 계산
    const stats = useMemo(() => {
        const total = reportTickets.length;
        const completed = reportTickets.filter(t => t.status === TicketStatus.COMPLETED).length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const urgent = reportTickets.filter(t => {
            const dueDate = new Date(t.dueDate);
            const now = new Date();
            const diff = dueDate.getTime() - now.getTime();
            return t.status !== TicketStatus.COMPLETED && diff < 1000 * 60 * 60 * 24;
        }).length;

        return { total, completed, completionRate, urgent };
    }, [reportTickets]);

    // 4. 프로젝트별 통계 (권한 있는 프로젝트만)
    const projectStats = useMemo(() => {
        const relevantProjects = isAdmin ? projects : projects.filter(p =>
            (p.customerContactIds || []).includes(currentUser.id) ||
            (p.supportStaffIds || []).includes(currentUser.id)
        );

        return relevantProjects.map(project => {
            const projectTickets = reportTickets.filter(t => t.projectId === project.id);
            const completed = projectTickets.filter(t => t.status === TicketStatus.COMPLETED).length;
            const active = projectTickets.length - completed;
            return {
                id: project.id,
                name: project.name,
                total: projectTickets.length,
                completed,
                active,
                rate: projectTickets.length > 0 ? Math.round((completed / projectTickets.length) * 100) : 0
            };
        }).filter(ps => ps.total > 0).sort((a, b) => b.total - a.total).slice(0, 5);
    }, [reportTickets, projects, isAdmin, currentUser]);

    // 5. 차트 데이터 생성 (최근 7일 트렌드)
    const chartData = useMemo(() => {
        const last7Days = eachDayOfInterval({
            start: subDays(new Date(), 6),
            end: new Date()
        });

        return last7Days.map(day => {
            const dayTickets = reportTickets.filter(t => isSameDay(new Date(t.createdAt), day));
            return {
                label: format(day, 'EEE'),
                fullDate: format(day, 'MM/dd'),
                v: dayTickets.length
            };
        });
    }, [reportTickets]);

    // 6. 리소스 부하 (Admin 전용) / 내 활동 요약 (Staff 전용)
    const secondaryList = useMemo(() => {
        if (isAdmin) {
            const supportStaff = users.filter(u => u.role === UserRole.SUPPORT_STAFF || u.role === UserRole.SUPPORT_LEAD);
            return supportStaff.map(staff => {
                const pending = tickets.filter(t => t.supportStaffId === staff.id && t.status !== TicketStatus.COMPLETED).length;
                return { id: staff.id, title: staff.name, sub: staff.role, val: pending, unit: 'Pending' };
            }).sort((a, b) => b.val - a.val).slice(0, 5);
        } else {
            // 회원인 경우 본인 티켓 상태별 요약
            const statusCounts = Object.values(TicketStatus).map(status => {
                const count = reportTickets.filter(t => t.status === status).length;
                return { id: status, title: status, sub: 'Ticket Status', val: count, unit: 'Tickets' };
            }).filter(s => s.val > 0);
            return statusCounts;
        }
    }, [tickets, reportTickets, users, isAdmin]);

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 상단 컨트롤 바 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                        <Filter size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">{isAdmin ? '운영 통합 리포트' : '나의 업무 리포트'}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{isAdmin ? 'Global Performance View' : 'Personal Activity View'}</p>
                    </div>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                    {(['weekly', 'monthly', 'yearly'] as ReportPeriod[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all ${period === p
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {p === 'weekly' ? '주간' : p === 'monthly' ? '월간' : '년간'}
                        </button>
                    ))}
                </div>
            </div>

            {/* 핵심 지표 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ReportCard
                    title={isAdmin ? "전체 요청" : "나의 요청"}
                    value={stats.total.toString()}
                    sub={period === 'weekly' ? '이번 주 발생' : period === 'monthly' ? '이번 달 발생' : '올해 발생'}
                    icon={TicketIcon}
                    color="blue"
                />
                <ReportCard
                    title="해결 완료"
                    value={stats.completed.toString()}
                    sub={`완료율 ${stats.completionRate}%`}
                    icon={CheckCircle2}
                    color="emerald"
                />
                <ReportCard
                    title="긴급 대응"
                    value={stats.urgent.toString()}
                    sub="24시간 내 마감"
                    icon={AlertCircle}
                    color="rose"
                />
                <ReportCard
                    title={isAdmin ? "활성 인력" : "참여 프로젝트"}
                    value={isAdmin ? users.filter(u => u.role !== UserRole.CUSTOMER).length.toString() : projects.filter(p => (p.customerContactIds || []).includes(currentUser.id)).length.toString()}
                    sub={isAdmin ? "지원 인력 현황" : "소속 프로젝트 수"}
                    icon={isAdmin ? UserCheck : Briefcase}
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 왼쪽: 프로젝트 통계 */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Layout size={18} className="text-blue-500" />
                            {isAdmin ? '프로젝트별 운영 현황' : '소속 프로젝트별 현황'}
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Top 5</span>
                    </div>
                    <div className="p-8 flex-1 space-y-8">
                        {projectStats.length > 0 ? projectStats.map(ps => (
                            <div key={ps.id} className="group cursor-default">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{ps.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{ps.active}건 진행 중</p>
                                    </div>
                                    <span className="text-xl font-black text-slate-900">{ps.rate}<span className="text-xs font-bold text-slate-400 ml-0.5">%</span></span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out shadow-lg"
                                        style={{ width: `${Math.max(ps.rate, 2)}%` }}
                                    />
                                </div>
                            </div>
                        )) : (
                            <NoData message="표시할 프로젝트 데이터가 없습니다." />
                        )}
                    </div>
                </div>

                {/* 오른쪽: 리소스 부하(Admin) or 업무 상태(Staff) */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            {isAdmin ? <Users size={18} className="text-emerald-500" /> : <Clock size={18} className="text-rose-500" />}
                            {isAdmin ? '담당자별 업무 부하' : '업무 처리 상태 요약'}
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{isAdmin ? 'Workload' : 'Status'}</span>
                    </div>
                    <div className="p-6 flex-1 space-y-4">
                        {secondaryList.length > 0 ? secondaryList.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 hover:bg-white hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center font-bold text-blue-600 border border-slate-100 group-hover:scale-110 transition-transform">
                                        {item.title[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.sub}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-slate-900 leading-none">{item.val}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">{item.unit}</p>
                                </div>
                            </div>
                        )) : (
                            <NoData message="활동 데이터가 없습니다." />
                        )}
                    </div>
                </div>
            </div>

            {/* 하단 트렌드 차트 */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                            <TrendingUp size={28} className="text-blue-500" />
                            업무 발생 및 처리 추이
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 font-medium">최근 7일간의 일별 활성 데이터를 분석합니다.</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold border border-slate-200">
                            <TrendingUp size={14} className="text-blue-500" /> 신규 발생
                        </span>
                    </div>
                </div>

                <div className="h-72 flex items-end justify-between gap-2 sm:gap-6 px-4 relative">
                    {chartData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                            <div className="absolute -top-10 bg-slate-900 text-white text-[11px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-xl z-10 whitespace-nowrap">
                                {d.v}건 발생
                            </div>
                            <div
                                className={`w-full max-w-[50px] bg-gradient-to-t ${isAdmin ? 'from-blue-600 to-blue-400' : 'from-indigo-600 to-indigo-400'} rounded-t-2xl transition-all duration-1000 ease-out hover:brightness-110 cursor-pointer shadow-lg group-hover:shadow-blue-200`}
                                style={{ height: `${Math.max((d.v / Math.max(...chartData.map(x => x.v), 1)) * 90, 5)}%` }}
                            />
                            <div className="mt-4 flex flex-col items-center">
                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">{d.label}</span>
                                <span className="text-[9px] font-bold text-slate-400 mt-0.5">{d.fullDate}</span>
                            </div>
                        </div>
                    ))}
                    {/* Grid Lines */}
                    <div className="absolute inset-x-0 top-0 bottom-12 flex flex-col justify-between pointer-events-none opacity-[0.03]">
                        {[1, 2, 3, 4, 5].map(line => <div key={line} className="w-full border-t border-slate-900" />)}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 서브 컴포넌트 ---

const ReportCard: React.FC<{
    title: string;
    value: string;
    sub: string;
    icon: any;
    color: 'blue' | 'emerald' | 'rose' | 'amber';
}> = ({ title, value, sub, icon: Icon, color }) => {
    const configs = {
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        rose: 'text-rose-600 bg-rose-50 border-rose-100',
        amber: 'text-amber-600 bg-amber-50 border-amber-100',
    };

    return (
        <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div className={`p-4 rounded-2xl ${configs[color]} group-hover:scale-110 transition-transform duration-500`}>
                    <Icon size={28} />
                </div>
                <div className="flex flex-col items-end">
                    <h4 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{value}</h4>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{sub}</span>
                </div>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest relative z-10">{title}</p>
            {/* Decoration */}
            <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none ${configs[color].split(' ')[1]}`} />
        </div>
    );
};

const NoData = ({ message }: { message: string }) => (
    <div className="h-full flex flex-col items-center justify-center py-10 opacity-40">
        <BarChart3 size={40} className="mb-4 text-slate-300" />
        <p className="text-sm font-bold text-slate-400">{message}</p>
    </div>
);

export default OperationalReport;
