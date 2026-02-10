
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
import { useAppState } from './hooks/useAppState';
import { useTicketHandlers } from './hooks/useTicketHandlers';
import { useBackgroundTasks } from './hooks/useBackgroundTasks';


const App: React.FC = () => {
  const {
    currentUser, setCurrentUser,
    companies,
    users,
    projects,
    tickets, setTickets,
    comments, setComments,
    history, setHistory,
    opsInfo,
    orgInfo,
    isLoading,
    isLoggedIn, setIsLoggedIn,
    handleUpdateUser,
    handleDeleteUser,
    handleCreateUser,
    handleCreateCompany,
    handleUpdateCompany,
    handleDeleteCompany,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    handleUpdateOpsInfo,
    handleUpdateOrgInfo,
    handleApplyState
  } = useAppState();

  const [view, setView] = useState<'list' | 'completed_list' | 'create' | 'edit' | 'detail' | 'companies' | 'users' | 'projects' | 'profile' | 'dataManagement' | 'opsManagement' | 'orgSettings'>('list');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const changeView = React.useCallback((newView: typeof view) => {
    setView(newView);
    setIsSidebarOpen(false);
  }, []);

  const {
    handleCreateTicket,
    handleUpdateTicket,
    handleDeleteTicket,
    updateTicketStatus,
    addComment
  } = useTicketHandlers({
    currentUser: currentUser!,
    users,
    projects,
    tickets,
    setTickets,
    setHistory,
    setComments,
    changeView
  });

  // Since useTicketHandlers still needs setX until further refactor, let's keep them but use the hook properly
  // Actually, let's just use the returned handlers from useAppState in the hook call
  // For now, to keep it simple and correct:
  // We need to pass the real setX to the hook for it to work.
  // The useAppState should probably return handlers that the hook uses.
  // BUT the easiest fix is ensuring App.tsx uses the handlers.

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

  // PERMISSION FILTERING
  const filteredProjects = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.ADMIN) return projects;

    if (currentUser.role === UserRole.SUPPORT_LEAD) {
      const teamUserIds = users
        .filter(u =>
          u.id === currentUser.id ||
          (currentUser.department && u.department === currentUser.department)
        )
        .map(u => u.id);
      return projects.filter(p => p.supportStaffIds.some(id => teamUserIds.includes(id)));
    }

    if (currentUser.role === UserRole.SUPPORT_STAFF) {
      return projects.filter(p => p.supportStaffIds.includes(currentUser.id));
    }

    return projects.filter(p => p.customerContactIds.includes(currentUser.id));
  }, [projects, users, currentUser]);

  const filteredTickets = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.ADMIN) return tickets;
    const accessibleProjectIds = filteredProjects.map(p => p.id);
    return tickets.filter(t => accessibleProjectIds.includes(t.projectId));
  }, [tickets, filteredProjects, currentUser]);

  const selectedTicket = useMemo(() =>
    tickets.find(t => t.id === selectedTicketId), [tickets, selectedTicketId]
  );

  if (!currentUser && isLoggedIn) return <LoadingOverlay />;

  const appUI = currentUser && (
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
              {view === 'companies' && (
                <CompanyManagement
                  companies={companies}
                  users={users}
                  projects={projects}
                  tickets={tickets}
                  onAdd={handleCreateCompany}
                  onUpdate={handleUpdateCompany}
                  onDelete={handleDeleteCompany}
                />
              )}
              {view === 'users' && (
                <UserManagement
                  users={users}
                  companies={companies}
                  projects={projects}
                  tickets={tickets}
                  currentUser={currentUser}
                  orgInfo={orgInfo}
                  onAdd={handleCreateUser}
                  onUpdate={handleUpdateUser}
                  onDelete={handleDeleteUser}
                />
              )}
              {view === 'projects' && (
                <ProjectManagement
                  projects={filteredProjects}
                  companies={companies}
                  users={users}
                  tickets={tickets}
                  currentUser={currentUser}
                  onAdd={handleCreateProject}
                  onUpdate={handleUpdateProject}
                  onDelete={handleDeleteProject}
                />
              )}
              {view === 'opsManagement' && (
                <OperationalManagement
                  projects={filteredProjects}
                  opsInfo={opsInfo}
                  onUpdate={handleUpdateOpsInfo}
                />
              )}
              {view === 'profile' && <ProfileEdit user={currentUser} companyName={currentUser.companyId ? companies.find(c => c.id === currentUser.companyId)?.name : '본사 (nu)'} onUpdate={(data) => handleUpdateUser(currentUser.id, data)} onCancel={() => changeView('list')} />}
              {view === 'orgSettings' && (
                <OrganizationSettings
                  initialData={orgInfo}
                  onUpdate={handleUpdateOrgInfo}
                />
              )}
              {view === 'dataManagement' && (
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
