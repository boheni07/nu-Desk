
import React, { useState } from 'react';
import { Company, CompanyStatus, User, Project, Ticket, UserRole, ProjectStatus } from '../types';
import { Building2, Plus, Edit2, Trash2, X, Search, MapPin, Briefcase, UserCircle, Power, Check } from 'lucide-react';
import DeleteConfirmModal from './common/DeleteConfirmModal';
import { useToast } from '../contexts/ToastContext';

interface Props {
  companies: Company[];
  users: User[];
  projects: Project[];
  tickets: Ticket[];
  currentUser: User;
  onAdd: (companyData: Omit<Company, 'id'>) => void;
  onUpdate: (id: string, companyData: Partial<Company>) => boolean;
  onDelete: (id: string) => void;
}

const CompanyManagement: React.FC<Props> = ({ companies, users, projects, tickets, currentUser, onAdd, onUpdate, onDelete }) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Company, 'id'>>({
    name: '',
    representative: '',
    industry: '',
    address: '',
    remarks: '',
    status: CompanyStatus.ACTIVE
  });

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.representative?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      representative: '',
      industry: '',
      address: '',
      remarks: '',
      status: CompanyStatus.ACTIVE
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      representative: company.representative || '',
      industry: company.industry || '',
      address: company.address || '',
      remarks: company.remarks || '',
      status: company.status || CompanyStatus.ACTIVE
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('기관명은 필수 입력 사항입니다.', 'warning');
      return;
    }

    if (editingCompany) {
      const success = onUpdate(editingCompany.id, formData);
      if (success) {
        setIsModalOpen(false);
      }
      // If success is false, user cancelled the confirm dialog, so we keep modal open
    } else {
      onAdd(formData);
      setIsModalOpen(false);
    }
  };

  const toggleStatus = (newStatus: CompanyStatus) => {
    if (editingCompany && newStatus === CompanyStatus.INACTIVE) {
      const activeProjects = projects.filter(p => p.clientId === editingCompany.id && p.status === ProjectStatus.ACTIVE);
      if (activeProjects.length > 0) {
        showToast(`활성 상태인 프로젝트가 ${activeProjects.length}개 있습니다. 프로젝트를 먼저 비활성화해주세요.`, 'warning');
        return;
      }
    }
    setFormData(prev => ({ ...prev, status: newStatus }));
  };

  const handleOpenDeleteModal = (company: Company) => {
    const activeProjects = projects.filter(p => p.clientId === company.id && p.status === ProjectStatus.ACTIVE);
    if (activeProjects.length > 0) {
      showToast('활성 상태의 프로젝트가 있는 고객사는 삭제할 수 없습니다.', 'error');
      return;
    }
    setDeletingCompany(company);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingCompany) {
      onDelete(deletingCompany.id);
      setIsDeleteModalOpen(false);
      setDeletingCompany(null);
    }
  };

  const getRelatedData = (company: Company) => {
    return [
      { label: '소속 사용자', count: users.filter(u => u.companyId === company.id).length },
      { label: '배정된 프로젝트', count: projects.filter(p => p.clientId === company.id).length },
      {
        label: '관련 티켓', count: tickets.filter(t => {
          const project = projects.find(p => p.id === t.projectId);
          return project?.clientId === company.id;
        }).length
      }
    ];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="text-blue-600" size={24} />
            고객사 관리
            <span className="text-sm font-normal text-slate-500 ml-2 bg-slate-100 px-2 py-0.5 rounded-full">
              Total {companies.length}
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">프로젝트를 의뢰하는 고객사 정보를 관리합니다.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="기관명, 대표자, 업종 검색..."
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 whitespace-nowrap"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">고객사 추가</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left table-fixed">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider">
              <th className="px-5 py-4 font-bold w-[40%] text-indigo-600">기관명*</th>
              <th className="px-5 py-4 font-bold w-[20%]">대표자</th>
              <th className="px-5 py-4 font-bold w-[20%]">업종</th>
              <th className="px-5 py-4 font-bold w-[10%] text-center">상태</th>
              <th className="px-5 py-4 font-bold w-[10%] text-right pr-6">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCompanies.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <Building2 size={40} className="text-slate-200" />
                    <p>등록된 고객사가 없거나 검색 결과가 없습니다.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCompanies.map(company => {
                const isActive = company.status === CompanyStatus.ACTIVE;
                return (
                  <tr key={company.id} className={`hover:bg-slate-50 transition-colors group text-sm ${!isActive ? 'bg-slate-50/50 opacity-60' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-blue-50 text-blue-500' : 'bg-slate-200 text-slate-400'}`}>
                          <Building2 size={16} />
                        </div>
                        <span className={`font-bold truncate ${isActive ? 'text-slate-700' : 'text-slate-400'}`}>{company.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 truncate">{company.representative || '-'}</td>
                    <td className="px-5 py-4 text-slate-600 truncate">{company.industry || '-'}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {isActive ? <Power size={10} className="text-green-600" /> : <Power size={10} className="text-slate-400" />}
                        {company.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right pr-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditModal(company)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Edit2 size={16} />
                        </button>
                        {currentUser.role === UserRole.ADMIN && (
                          <button
                            onClick={() => handleOpenDeleteModal(company)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="삭제"
                          >
                            <Trash2 size={16} />
                          </button>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-lg font-bold text-slate-800">{editingCompany ? '고객사 정보 수정' : '신규 고객사 등록'}</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Status Toggle UI */}
                {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPPORT_LEAD || currentUser.role === UserRole.SUPPORT_STAFF) && (
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${formData.status === CompanyStatus.ACTIVE ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                        <Power size={20} />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-slate-800">고객사 상태</span>
                        <span className="text-[11px] text-slate-500">비활성화 시 소속 사용자도 비활성화됩니다.</span>
                      </div>
                    </div>
                    <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-inner">
                      <button
                        type="button"
                        onClick={() => toggleStatus(CompanyStatus.ACTIVE)}
                        className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${formData.status === CompanyStatus.ACTIVE
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-600'
                          }`}
                      >
                        {formData.status === CompanyStatus.ACTIVE && <Check size={12} />}
                        활성
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStatus(CompanyStatus.INACTIVE)}
                        className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${formData.status === CompanyStatus.INACTIVE
                          ? 'bg-slate-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-600'
                          }`}
                      >
                        {formData.status === CompanyStatus.INACTIVE && <Check size={12} />}
                        비활성
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">기관명 *</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        required
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-shadow"
                        placeholder="기관명을 입력하세요"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">대표자</label>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          placeholder="대표자명"
                          value={formData.representative}
                          onChange={(e) => setFormData(prev => ({ ...prev, representative: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">업종</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          placeholder="업종명"
                          value={formData.industry}
                          onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">주소</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="기관 주소"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">비고</label>
                    <textarea
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none transition-shadow"
                      rows={3}
                      placeholder="기타 참고 사항"
                      value={formData.remarks}
                      onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isDeleteModalOpen && deletingCompany && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="고객사 삭제 확인"
          targetName={deletingCompany.name}
          relatedData={getRelatedData(deletingCompany)}
          description="고객사 삭제 시 해당 고객사에 연결된 기본 정보가 유실될 수 있습니다."
        />
      )}
    </div>
  );
};

export default CompanyManagement;
