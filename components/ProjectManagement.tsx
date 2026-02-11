
import React, { useState } from 'react';
import { Project, Company, User, UserRole, ProjectStatus, Ticket, TicketStatus } from '../types';
import {
  Plus, Edit2, Trash2, X, Search, Briefcase, Calendar,
  User as UserIcon, Building, MessageSquare, ShieldCheck,
  Check, MoreHorizontal, LayoutGrid, List as ListIcon,
  Clock
} from 'lucide-react';
import DeleteConfirmModal from './common/DeleteConfirmModal';
import { useToast } from '../contexts/ToastContext';

interface Props {
  projects: Project[];
  companies: Company[];
  users: User[];
  tickets: Ticket[];
  currentUser: User;
  onAdd: (projectData: Omit<Project, 'id'>) => void;
  onUpdate: (id: string, projectData: Partial<Project>) => boolean;
  onDelete: (id: string) => void;
}

const ProjectManagement: React.FC<Props> = ({ projects, companies, users, tickets, currentUser, onAdd, onUpdate, onDelete }) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const isAdmin = currentUser.role === UserRole.ADMIN;

  // Form State
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    name: '',
    clientId: '',
    customerContactIds: [],
    supportStaffIds: [],
    startDate: '',
    endDate: '',
    description: '',
    remarks: '',
    status: ProjectStatus.ACTIVE
  });

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Explicitly exclude ADMIN role from being selectable as Support Staff
  const supportUsers = users.filter(u => u.role !== UserRole.ADMIN && (u.role === UserRole.SUPPORT_LEAD || u.role === UserRole.SUPPORT_STAFF));
  const customerUsersOfSelectedClient = users.filter(u => u.role === UserRole.CUSTOMER && u.companyId === formData.clientId);

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      clientId: '',
      customerContactIds: [],
      supportStaffIds: isAdmin ? [] : [currentUser.id], // Auto-assign creator ONLY if support
      startDate: '',
      endDate: '',
      description: '',
      remarks: '',
      status: ProjectStatus.ACTIVE
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      clientId: project.clientId,
      customerContactIds: project.customerContactIds,
      supportStaffIds: project.supportStaffIds,
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      description: project.description,
      remarks: project.remarks || '',
      status: project.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.clientId) {
      showToast('프로젝트명과 고객사는 필수 항목입니다.', 'warning');
      return;
    }
    if (formData.supportStaffIds.length === 0) {
      showToast('최소 1명의 지원담당자가 필요합니다. (첫 번째 선택자가 PM) ', 'warning');
      return;
    }

    // Verify no Admin users are in the support list (Server-side validation equivalent)
    const hasAdminInSupport = formData.supportStaffIds.some(id => {
      const u = users.find(user => user.id === id);
      return u && u.role === UserRole.ADMIN;
    });

    if (hasAdminInSupport) {
      showToast('관리자(ADMIN) 권한을 가진 사용자는 지원 인력으로 지정할 수 없습니다.', 'error');
      return;
    }

    if (editingProject) {
      const success = onUpdate(editingProject.id, formData);
      if (success) {
        setIsModalOpen(false);
      }
    } else {
      onAdd(formData);
      setIsModalOpen(false);
    }
  };

  const handleOpenDeleteModal = (project: Project) => {
    setDeletingProject(project);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingProject) {
      onDelete(deletingProject.id);
      setIsDeleteModalOpen(false);
      setDeletingProject(null);
    }
  };

  const getRelatedData = (project: Project) => {
    return [
      { label: '연결된 티켓', count: tickets.filter(t => t.projectId === project.id).length }
    ];
  };

  const toggleSelection = (id: string, field: 'customerContactIds' | 'supportStaffIds') => {
    setFormData(prev => {
      const current = prev[field];
      const next = current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id];
      return { ...prev, [field]: next };
    });
  };

  const getProjectProgress = (projectId: string) => {
    const projectTickets = tickets.filter(t => t.projectId === projectId);
    const total = projectTickets.length;
    if (total === 0) return 0;
    const completed = projectTickets.filter(t => t.status === TicketStatus.COMPLETED).length;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="text-blue-600" size={24} />
            프로젝트 관리
            <span className="text-sm font-normal text-slate-500 ml-2 bg-slate-100 px-2 py-0.5 rounded-full">
              Total {projects.length}
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">등록된 프로젝트 현황을 조회하고 관리합니다.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="프로젝트 검색..."
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <ListIcon size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>

          {currentUser.role !== UserRole.CUSTOMER && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 whitespace-nowrap"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">신규 등록</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="px-4 py-4 font-semibold w-[25%]">프로젝트명</th>
                <th className="px-4 py-4 font-semibold w-[15%]">고객사</th>
                <th className="px-4 py-4 font-semibold w-[20%]">기간</th>
                <th className="px-4 py-4 font-semibold w-[20%]">팀 구성 (PM)</th>
                <th className="px-4 py-4 font-semibold w-[10%]">상태</th>
                <th className="px-4 py-4 font-semibold w-[10%] text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <Briefcase size={40} className="text-slate-200" />
                      <p>등록된 프로젝트가 없거나 검색 결과가 없습니다.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map(project => {
                  const client = companies.find(c => c.id === project.clientId);
                  const pm = users.find(u => u.id === project.supportStaffIds[0]);
                  const isActive = project.status === ProjectStatus.ACTIVE;

                  return (
                    <tr key={project.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm shrink-0 ${isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {project.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-base ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>{project.name}</span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-1 max-w-md">{project.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-slate-700">
                          {client?.name || 'Unknown Client'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <Calendar size={14} className="text-slate-400" />
                          {project.startDate ? project.startDate.replace(/-/g, '.') : '-'} ~ {project.endDate ? project.endDate.replace(/-/g, '.') : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center -space-x-2">
                          {project.supportStaffIds.slice(0, 4).map((staffId, index) => {
                            const staff = users.find(u => u.id === staffId);
                            if (!staff) return null;
                            const isPM = index === 0;
                            return (
                              <div
                                key={staffId}
                                className={`relative w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm hover:z-10 hover:scale-110 transition-transform cursor-help
                                    ${isPM ? 'bg-indigo-500 z-10' : 'bg-slate-400'}
                                  `}
                                title={`${staff.name} ${isPM ? '(PM)' : ''}`}
                              >
                                {staff.name.charAt(0)}
                                {isPM && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div></div>}
                              </div>
                            );
                          })}
                          {project.supportStaffIds.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                              +{project.supportStaffIds.length - 4}
                            </div>
                          )}
                        </div>
                        {pm && <div className="text-xs text-slate-500 mt-1 ml-1">PM: {pm.name}</div>}
                      </td>
                      <td className="px-4 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${isActive
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                          {project.status}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          {currentUser.role !== UserRole.CUSTOMER && (
                            <>
                              <button onClick={() => handleOpenEditModal(project)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="수정">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleOpenDeleteModal(project)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="삭제">
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => {
            const client = companies.find(c => c.id === project.clientId);
            const pm = users.find(u => u.id === project.supportStaffIds[0]);
            const isActive = project.status === ProjectStatus.ACTIVE;

            return (
              <div key={project.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow group relative overflow-hidden">
                {/* Status Badge */}
                <div className={`absolute top-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-slate-400'}`} />
                  {project.status}
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {project.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 pr-16">
                    <h3 className={`font-bold text-lg truncate ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>{project.name}</h3>
                    <p className="text-xs text-slate-500 truncate">{client?.name}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 line-clamp-3 h-14 mb-4">{project.description || '설명 없음'}</p>

                <div className="space-y-3 mb-5">
                  {/* Dates */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                    <Clock size={14} className="text-slate-400" />
                    {project.startDate ? project.startDate.replace(/-/g, '.') : '-'} ~ {project.endDate ? project.endDate.replace(/-/g, '.') : '-'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center -space-x-2">
                    {project.supportStaffIds.slice(0, 3).map((staffId, index) => {
                      const staff = users.find(u => u.id === staffId);
                      if (!staff) return null;
                      return (
                        <div key={staffId} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600" title={staff.name}>
                          {staff.name.charAt(0)}
                        </div>
                      )
                    })}
                    {project.supportStaffIds.length > 3 && (
                      <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-400">
                        +{project.supportStaffIds.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {currentUser.role !== UserRole.CUSTOMER && (
                      <>
                        <button onClick={() => handleOpenEditModal(project)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleOpenDeleteModal(project)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {
        isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <h3 className="text-lg font-bold text-slate-800">{editingProject ? '프로젝트 정보 수정' : '신규 프로젝트 등록'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
              </div>

              <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar">
                <div className="p-6 space-y-8">
                  {/* Basic Info */}
                  <section className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="text-sm font-bold text-blue-600 flex items-center gap-2">
                        <Briefcase size={16} /> 기본 정보
                      </h4>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">프로젝트 상태:</span>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, status: ProjectStatus.ACTIVE })}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${formData.status === ProjectStatus.ACTIVE ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            활성
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, status: ProjectStatus.INACTIVE })}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${formData.status === ProjectStatus.INACTIVE ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            비활성
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">프로젝트명 *</label>
                        <input
                          required
                          type="text"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          placeholder="프로젝트 이름을 입력하세요"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">시작일</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            type="date"
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">종료일</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            type="date"
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Clients & Contacts */}
                  <section className="space-y-4">
                    <h4 className="text-sm font-bold text-blue-600 border-b pb-2 flex items-center gap-2">
                      <Building size={16} /> 고객사 및 연락처
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">고객사 선택 *</label>
                        <select
                          required
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                          value={formData.clientId}
                          onChange={(e) => setFormData({ ...formData, clientId: e.target.value, customerContactIds: [] })}
                        >
                          <option value="">고객사 선택</option>
                          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">고객담당 (복수 선택)</label>
                        <div className={`p-2 border border-slate-200 rounded-lg max-h-32 overflow-y-auto space-y-1 bg-white ${!formData.clientId ? 'opacity-50' : ''}`}>
                          {customerUsersOfSelectedClient.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic text-center py-2">고객사를 먼저 선택하세요</p>
                          ) : (
                            customerUsersOfSelectedClient.map(user => (
                              <label key={user.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer transition-colors">
                                <input
                                  type="checkbox"
                                  checked={formData.customerContactIds.includes(user.id)}
                                  onChange={() => toggleSelection(user.id, 'customerContactIds')}
                                  className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-xs text-slate-700">{user.name}</span>
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Support Team */}
                  <section className="space-y-4">
                    <h4 className="text-sm font-bold text-blue-600 border-b pb-2 flex items-center gap-2">
                      <ShieldCheck size={16} /> 지원 인력 구성
                    </h4>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">지원담당 선택 (복수 선택, 첫 번째 선택자가 PM)</label>
                      <div className="grid grid-cols-3 gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
                        {supportUsers.map(user => (
                          <div
                            key={user.id}
                            onClick={() => toggleSelection(user.id, 'supportStaffIds')}
                            className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${formData.supportStaffIds.includes(user.id)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                              }`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${formData.supportStaffIds.includes(user.id) ? 'bg-blue-500' : 'bg-slate-100 text-slate-500'}`}>
                              {user.name.charAt(0)}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-xs font-bold truncate">{user.name}</p>
                              {formData.supportStaffIds[0] === user.id && (
                                <p className="text-[9px] uppercase font-bold text-white/80">Project Manager</p>
                              )}
                            </div>
                            {formData.supportStaffIds.includes(user.id) && (
                              <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                <Check className="text-blue-600" size={10} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Description & Remarks */}
                  <section className="space-y-4">
                    <h4 className="text-sm font-bold text-blue-600 border-b pb-2 flex items-center gap-2">
                      <MessageSquare size={16} /> 프로젝트 설명 및 비고
                    </h4>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">상세 설명</label>
                      <textarea
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                        rows={3}
                        placeholder="프로젝트의 주요 목표와 업무 범위를 입력하세요"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">비고</label>
                      <textarea
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                        rows={2}
                        placeholder="기타 특이사항"
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      />
                    </div>
                  </section>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                  >
                    {editingProject ? '수정 완료' : '프로젝트 등록'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      {isDeleteModalOpen && deletingProject && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="프로젝트 삭제 확인"
          targetName={deletingProject.name}
          relatedData={getRelatedData(deletingProject)}
          description="프로젝트 삭제 시 해당 프로젝트와 연결된 티켓 이력이 상실될 수 있습니다."
        />
      )}
    </div>
  )
}
export default ProjectManagement;
