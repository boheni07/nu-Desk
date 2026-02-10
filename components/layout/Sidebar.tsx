
import React from 'react';
import {
    PlusCircle,
    Ticket as TicketIcon,
    Archive,
    Briefcase,
    Activity,
    Building2,
    Users as UsersIcon,
    Database,
    LogOut,
    Settings,
    X
} from 'lucide-react';
import { User, UserRole } from '../../types';
import NavItem from './NavItem';

interface SidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    currentUser: User;
    users: User[];
    setCurrentUser: (user: User) => void;
    view: string;
    changeView: (view: any) => void;
    handleLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    isSidebarOpen,
    setIsSidebarOpen,
    currentUser,
    users,
    setCurrentUser,
    view,
    changeView,
    handleLogout
}) => {
    return (
        <>
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-900 text-white flex flex-col z-50 transition-transform duration-300 transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                    <h1 className="text-2xl font-bold flex items-center gap-2 cursor-pointer" onClick={() => changeView('list')}>
                        <span className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">nu</span>
                        ServiceDesk
                    </h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg">
                        <X size={20} />
                    </button>
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
                        <select
                            className="bg-slate-800 text-xs rounded-lg p-2.5 w-full border-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-300"
                            value={currentUser.id}
                            onChange={(e) => {
                                const user = users.find(u => u.id === e.target.value);
                                if (user) setCurrentUser(user);
                            }}
                        >
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.name} ({u.role})
                                </option>
                            ))}
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

                <div
                    onClick={() => changeView('profile')}
                    className={`p-4 bg-slate-800/50 mx-6 mb-2 rounded-2xl cursor-pointer hover:bg-slate-800 transition-all border border-slate-700/30 group ${view === 'profile' ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-bold shrink-0 shadow-lg group-hover:scale-105 transition-transform text-lg">
                            {currentUser.name[0]}
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-bold truncate text-slate-100">{currentUser.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{currentUser.role}</p>
                        </div>
                        <Settings size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                </div>

                <div className="px-6 mb-6">
                    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-800/50">
                        <div className="flex items-center gap-2">
                            <Database size={12} className={import.meta.env.VITE_SUPABASE_URL ? 'text-emerald-400' : 'text-rose-400'} />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">DB Status</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${import.meta.env.VITE_SUPABASE_URL ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            <span className={`text-[9px] font-black uppercase ${import.meta.env.VITE_SUPABASE_URL ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {import.meta.env.VITE_SUPABASE_URL ? 'Connected' : 'Config Required'}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
