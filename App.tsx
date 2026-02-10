
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
import Sidebar from './components/layout/Sidebar';
import AppHeader from './components/layout/AppHeader';

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
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        currentUser={currentUser}
        users={users}
        setCurrentUser={setCurrentUser}
        view={view}
        changeView={changeView}
        handleLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col lg:ml-72 min-w-0">
        <AppHeader
          currentUser={currentUser}
          setIsSidebarOpen={setIsSidebarOpen}
          changeView={changeView}
        />

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
