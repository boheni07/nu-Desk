import React, { useMemo } from 'react';
import {
    Ticket as TicketIcon,
    CheckCircle2,
    Clock,
    AlertCircle,
    Briefcase,
    Users,
    Activity,
    ChevronRight,
    TrendingUp
} from 'lucide-react';
import { Ticket, Project, User, TicketStatus, ProjectStatus, UserRole, Comment, HistoryEntry } from '../types';

interface DashboardProps {
    tickets: Ticket[];
    projects: Project[];
    users: User[];
    currentUser: User;
    history: HistoryEntry[];
    comments: Comment[];
    onViewTickets: (status?: TicketStatus) => void;
    onViewProjects: () => void;
    onSelectTicket: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    tickets,
    projects,
    users,
    currentUser,
    history,
    comments,
    onViewTickets,
    onViewProjects,
    onSelectTicket
}) => {
    const stats = useMemo(() => {
        const activeTickets = tickets.filter(t => t.status !== TicketStatus.COMPLETED);
        const completedTickets = tickets.filter(t => t.status === TicketStatus.COMPLETED);
        const urgentTickets = activeTickets.filter(t => {
            const dueDate = new Date(t.dueDate);
            const now = new Date();
            const diff = dueDate.getTime() - now.getTime();
            return diff < 1000 * 60 * 60 * 24; // 24시간 이내
        });

        return {
            total: tickets.length,
            active: activeTickets.length,
            completed: completedTickets.length,
            urgent: urgentTickets.length,
            projects: projects.filter(p => p.status === ProjectStatus.ACTIVE).length,
            users: users.length
        };
    }, [tickets, projects, users]);

    const recentTickets = useMemo(() => {
        return [...tickets]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
    }, [tickets]);

    const notifications = useMemo(() => {
        const accessibleTicketIds = new Set(tickets.map(t => t.id));

        const historyItems = (history || [])
            .filter(h => {
                if (!accessibleTicketIds.has(h.ticketId)) return false;
                const ticket = tickets.find(t => t.id === h.ticketId);
                // Related if: User is the actor OR assigned to the ticket OR is a customer for this ticket
                return (
                    h.changedBy === currentUser.name ||
                    (ticket && ticket.supportStaffId === currentUser.id) ||
                    currentUser.role === UserRole.CUSTOMER
                );
            })
            .map(h => ({
                id: h.id,
                ticketId: h.ticketId,
                type: 'history' as const,
                user: h.changedBy,
                content: h.note || h.action || `${h.status} 상태로 변경됨`,
                timestamp: h.timestamp,
                status: h.status
            }));

        const commentItems = (comments || [])
            .filter(c => {
                if (!accessibleTicketIds.has(c.ticketId)) return false;
                const ticket = tickets.find(t => t.id === c.ticketId);
                // Related if: User is the author OR assigned to the ticket OR is a customer for this ticket
                return (
                    c.authorName === currentUser.name ||
                    (ticket && ticket.supportStaffId === currentUser.id) ||
                    currentUser.role === UserRole.CUSTOMER
                );
            })
            .map(c => ({
                id: c.id,
                ticketId: c.ticketId,
                type: 'comment' as const,
                user: c.authorName,
                content: c.content,
                timestamp: c.timestamp
            }));

        return [...historyItems, ...commentItems]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);
    }, [history, comments, tickets, currentUser]);


    return (
        <div className="space-y-6 pb-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 lg:grid-cols-4 gap-1.5 sm:gap-4">
                <StatCard
                    title="활성"
                    value={stats.active}
                    icon={TicketIcon}
                    color="blue"
                    onClick={() => onViewTickets()}
                />
                <StatCard
                    title="긴급"
                    value={stats.urgent}
                    icon={AlertCircle}
                    color="rose"
                    onClick={() => onViewTickets()}
                />
                <StatCard
                    title="완료"
                    value={stats.completed}
                    icon={CheckCircle2}
                    color="emerald"
                    onClick={() => onViewTickets(TicketStatus.COMPLETED)}
                />
                <StatCard
                    title="프로젝트"
                    value={stats.projects}
                    icon={Briefcase}
                    color="amber"
                    onClick={onViewProjects}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Tickets */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Activity size={18} className="text-blue-500" />
                            최근 티켓 내역
                        </h3>
                        <button
                            onClick={() => onViewTickets()}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            전체보기 <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {recentTickets.map(ticket => (
                            <div
                                key={ticket.id}
                                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                                onClick={() => onSelectTicket(ticket.id)}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ticket.status === TicketStatus.COMPLETED ? 'bg-emerald-100 text-emerald-600' :
                                                ticket.status === TicketStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-600' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                {ticket.status}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium">#{ticket.id}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                                            {ticket.title}
                                        </h4>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-bold text-slate-600">{ticket.customerName}</p>
                                        <p className="text-[10px] text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions / System Info */}
                <div className="space-y-6">
                    {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPPORT_LEAD) && (
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 text-white shadow-lg shadow-blue-200">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp size={16} className="text-blue-200" />
                                <h3 className="font-bold text-sm">시스템 요약</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border-r border-white/10 pr-2">
                                    <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider mb-0.5">사용자</p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xl font-black">{stats.users}</p>
                                        <Users size={16} className="text-white/30" />
                                    </div>
                                </div>
                                <div className="pl-2">
                                    <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider mb-0.5">프로젝트</p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xl font-black">{stats.projects}</p>
                                        <Briefcase size={16} className="text-white/30" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-3 text-sm">내비게이션</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <QuickLink
                                label="신규 티켓"
                                icon={TicketIcon}
                                onClick={() => onViewTickets()}
                                color="blue"
                            />
                            <QuickLink
                                label="프로젝트"
                                icon={Briefcase}
                                onClick={onViewProjects}
                                color="amber"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Clock size={18} className="text-blue-500" />
                        나의 업무 소식 & 알림
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100 italic">
                        최근 10건
                    </span>
                </div>

                {notifications.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {notifications.map(notif => (
                            <div
                                key={notif.id}
                                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group flex flex-col gap-3"
                                onClick={() => onSelectTicket(notif.ticketId)}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl shrink-0 transition-transform group-hover:scale-110 ${notif.type === 'comment' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                            {notif.type === 'comment' ? <Activity size={18} /> : <TrendingUp size={18} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-base font-bold text-slate-900 leading-tight">{notif.user}</span>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${notif.type === 'comment' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                                                    }`}>
                                                    {notif.type === 'comment' ? 'Comment' : notif.status}
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">#{notif.ticketId}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                        <span className="text-[11px] font-bold text-slate-500">
                                            {new Date(notif.timestamp).toLocaleDateString()}
                                        </span>
                                        <span className="text-[11px] font-medium text-slate-400">
                                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <p className="text-[14px] text-slate-700 line-clamp-2 leading-relaxed font-medium bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                                        {notif.content}
                                    </p>
                                    <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight size={16} className="text-slate-300" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-16 border border-slate-200 shadow-sm text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Activity size={24} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold text-sm">관련된 최근 알림이 없습니다.</p>
                    </div>
                )}
            </div>


        </div>
    );
};


const StatCard: React.FC<{
    title: string;
    value: number;
    icon: any;
    color: 'blue' | 'rose' | 'emerald' | 'amber';
    onClick: () => void;
}> = ({ title, value, icon: Icon, color, onClick }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-200',
        rose: 'bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-200',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-200',
        amber: 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-200'
    };

    return (
        <div
            onClick={onClick}
            className={`p-2.5 sm:p-6 rounded-xl sm:rounded-2xl border transition-all cursor-pointer group hover:shadow-md ${colors[color]} flex flex-col sm:flex-col items-center sm:items-start gap-1 sm:gap-0`}
        >
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start w-full gap-1 sm:mb-4">
                <div className={`p-1 sm:p-2 rounded-lg sm:rounded-xl bg-white shadow-sm group-hover:scale-110 transition-transform shrink-0`}>
                    <Icon size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div className="text-xl sm:text-3xl font-black leading-none">{value}</div>
            </div>
            <div className="text-[10px] sm:text-sm font-bold opacity-70 uppercase tracking-tight truncate w-full text-center sm:text-left">{title}</div>
        </div>
    );
};


const QuickLink: React.FC<{
    label: string;
    icon: any;
    onClick: () => void;
    color: string;
}> = ({ label, icon: Icon, onClick, color }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
    >
        <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-white transition-colors">
            <Icon size={18} className="text-slate-500 group-hover:text-blue-600" />
        </div>
        <span className="text-xs font-bold text-slate-600 group-hover:text-blue-700">{label}</span>
    </button>
);

export default Dashboard;
