
import React, { useState } from 'react';
import { User, UserRole, Company, Project, Ticket, UserStatus, OrganizationInfo } from '../types';
import {
  Plus, Edit2, Trash2, X, Search, Shield, User as UserIcon,
  Mail, Phone, Smartphone, Lock, Eye, EyeOff, Building, MessageSquare,
  Power
} from 'lucide-react';
import { formatPhoneNumber, isValidEmail } from '../lib/formatters';
import DeleteConfirmModal from './common/DeleteConfirmModal';

interface Props {
  users: User[];
  companies: Company[];
  projects: Project[];
  tickets: Ticket[];
  currentUser: User;
  orgInfo?: OrganizationInfo;
  onAdd: (userData: Omit<User, 'id'>) => void;
  onUpdate: (id: string, userData: Partial<User>) => void;
  onDelete: (id: string) => void;
}

const UserManagement: React.FC<Props> = ({ users, companies, projects, tickets, currentUser, orgInfo, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Omit<User, 'id'>>({
    loginId: '',
    password: '',
    name: '',
    phone: '',
    mobile: '',
    email: '',
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
    companyId: '',
    remarks: ''
  });

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.loginId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      loginId: '',
      password: '',
      name: '',
      phone: '',
      mobile: '',
      email: '',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      companyId: '',
      remarks: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      loginId: user.loginId,
      password: user.password || '',
      name: user.name,
      phone: user.phone || '',
      mobile: user.mobile || '',
      email: user.email || '',
      role: user.role,
      status: user.status || UserStatus.ACTIVE,
      department: user.department || '',
      companyId: user.companyId || '',
      remarks: user.remarks || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (user: User) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingUser) {
      onDelete(deletingUser.id);
      setIsDeleteModalOpen(false);
      setDeletingUser(null);
    }
  };

  const getRelatedData = (user: User) => {
    return [
      { label: '참여 프로젝트', count: projects.filter(p => p.supportStaffIds.includes(user.id) || p.customerContactIds.includes(user.id)).length },
      { label: '관련 티켓 (요청/지원)', count: tickets.filter(t => t.customerId === user.id || t.supportId === user.id).length }
    ];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.loginId || !formData.password || !formData.name) {
      alert('ID, 비밀번호, 성명은 필수 항목입니다.');
      return;
    }
    if (formData.role === UserRole.CUSTOMER && !formData.companyId) {
      alert('고객담당인 경우 고객사 선택은 필수입니다.');
      return;
    }

    if (formData.email && !isValidEmail(formData.email)) {
      alert('유효하지 않은 이메일 형식입니다.');
      return;
    }

    const submissionData = { ...formData };
    if (formData.role !== UserRole.CUSTOMER) {
      submissionData.companyId = undefined;
    }

    if (editingUser) {
      onUpdate(editingUser.id, submissionData);
    } else {
      onAdd(submissionData);
    }
    setIsModalOpen(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-purple-100 text-purple-700 border-purple-200';
      case UserRole.SUPPORT_LEAD: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case UserRole.SUPPORT_STAFF: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case UserRole.CUSTOMER: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="성명, ID, 역할 검색..."
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md"
        >
          <Plus size={18} /> 회원 추가
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <th className="px-6 py-4 font-semibold">성명</th>
              <th className="px-6 py-4 font-semibold">ID</th>
              <th className="px-6 py-4 font-semibold">종류</th>
              <th className="px-6 py-4 font-semibold">상태</th>
              <th className="px-6 py-4 font-semibold">휴대폰</th>
              <th className="px-6 py-4 font-semibold">소속</th>
              <th className="px-6 py-4 font-semibold text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map(user => {
              const isActive = user.status === UserStatus.ACTIVE;
              return (
                <tr key={user.id} className={`hover:bg-slate-50 transition-colors group text-sm ${!isActive ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isActive ? 'bg-slate-100 text-slate-500' : 'bg-slate-200 text-slate-400'}`}>
                        {user.name.charAt(0)}
                      </div>
                      <span className={`font-bold ${isActive ? 'text-slate-700' : 'text-slate-400'}`}>{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">{user.loginId}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit ${getRoleBadge(user.role)}`}>
                      {user.role === UserRole.ADMIN && <Shield size={10} />}
                      {user.role === UserRole.ADMIN ? '관리자' :
                        user.role === UserRole.SUPPORT_LEAD ? '지원팀장' :
                          user.role === UserRole.SUPPORT_STAFF ? '지원담당' : '고객담당'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.mobile || '-'}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {user.role === UserRole.CUSTOMER
                      ? companies.find(c => c.id === user.companyId)?.name || 'N/A'
                      : user.department || <span className="text-slate-300 italic">본사 (nu)</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEditModal(user)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="수정">
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (user.loginId === 'admin1') {
                            alert('시스템 관리자 계정(admin1)은 삭제할 수 없습니다.');
                            return;
                          }
                          handleOpenDeleteModal(user);
                        }}
                        className={`p-1.5 rounded-md transition-colors ${user.loginId === 'admin1' ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                        title={user.loginId === 'admin1' ? "삭제 불가" : "삭제"}
                        disabled={user.loginId === 'admin1'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-lg font-bold text-slate-800">{editingUser ? '회원 정보 수정' : '신규 회원 등록'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} className="text-slate-400" /></button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar">
              <div className="p-6 space-y-6">
                {/* Status Selection */}
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Power size={18} className={formData.status === UserStatus.ACTIVE ? 'text-green-500' : 'text-slate-400'} />
                    <span className="text-sm font-bold text-slate-700">회원 상태 설정</span>
                  </div>
                  <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: UserStatus.ACTIVE })}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${formData.status === UserStatus.ACTIVE ? 'bg-green-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      활성
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: UserStatus.INACTIVE })}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${formData.status === UserStatus.INACTIVE ? 'bg-slate-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      비활성
                    </button>
                  </div>
                </div>

                {/* ID & Password Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">ID * (영문숫자 조합)</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        required
                        pattern="[a-zA-Z0-9]+"
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="영문, 숫자만 입력"
                        value={formData.loginId}
                        onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">비밀번호 *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="비밀번호"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">성명 *</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="성명"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">이메일</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="email"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="example@nu.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">전화번호</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="tel"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="02-XXX-XXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">휴대폰</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="tel"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="010-XXXX-XXXX"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: formatPhoneNumber(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                {/* Role & Company */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">종류 (역할)</label>
                    <div className="relative">
                      <select
                        disabled={formData.role === UserRole.ADMIN && currentUser.loginId !== 'admin1'}
                        className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400`}
                        value={formData.role}
                        onChange={(e) => {
                          const newRole = e.target.value as UserRole;
                          let newDept = formData.department;

                          // 지원팀이 1개만 설정되어 있을 경우 자동 선택
                          if (newRole === UserRole.SUPPORT_LEAD || newRole === UserRole.SUPPORT_STAFF) {
                            const teams = [orgInfo?.supportTeam1, orgInfo?.supportTeam2, orgInfo?.supportTeam3].filter(Boolean);
                            if (teams.length === 1) {
                              newDept = teams[0] as string;
                            }
                          }

                          setFormData({
                            ...formData,
                            role: newRole,
                            department: (newRole === UserRole.SUPPORT_LEAD || newRole === UserRole.SUPPORT_STAFF) ? newDept : '',
                            companyId: newRole === UserRole.CUSTOMER ? formData.companyId : ''
                          });
                        }}
                      >
                        <option value={UserRole.CUSTOMER}>고객담당</option>
                        <option value={UserRole.SUPPORT_LEAD}>지원팀장</option>
                        <option value={UserRole.SUPPORT_STAFF}>지원담당</option>
                        {/* 관리자 권한은 admin1 계정만 부여 가능 */}
                        {(currentUser.loginId === 'admin1' || formData.role === UserRole.ADMIN) && (
                          <option value={UserRole.ADMIN}>관리자</option>
                        )}
                      </select>
                      {formData.role === UserRole.ADMIN && currentUser.loginId !== 'admin1' && (
                        <p className="mt-1 text-[10px] text-amber-600 font-bold">* 관리자 역할 수정은 admin1 계정만 가능합니다.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    {formData.role === UserRole.CUSTOMER ? (
                      <>
                        <label className="block text-xs font-bold text-blue-600 mb-1 uppercase tracking-wider">소속 고객사 *</label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
                          <select
                            required
                            className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                            value={formData.companyId}
                            onChange={(e) => setFormData({ ...formData, companyId: e.target.value, department: '' })}
                          >
                            <option value="">고객사 선택</option>
                            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                      </>
                    ) : (formData.role === UserRole.SUPPORT_LEAD || formData.role === UserRole.SUPPORT_STAFF) ? (
                      <>
                        <label className="block text-xs font-bold text-indigo-600 mb-1 uppercase tracking-wider">소속 지원팀 *</label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" size={16} />
                          <select
                            required
                            className="w-full pl-10 pr-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value, companyId: '' })}
                          >
                            <option value="">지원팀 선택</option>
                            {orgInfo?.supportTeam1 && <option value={orgInfo.supportTeam1}>{orgInfo.supportTeam1}</option>}
                            {orgInfo?.supportTeam2 && <option value={orgInfo.supportTeam2}>{orgInfo.supportTeam2}</option>}
                            {orgInfo?.supportTeam3 && <option value={orgInfo.supportTeam3}>{orgInfo.supportTeam3}</option>}
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">소속 관리본부</label>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <div className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">본사 (nu)</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">비고</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 text-slate-400" size={16} />
                    <textarea
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                      rows={3}
                      placeholder="회원 관련 특이사항 기록"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    />
                  </div>
                </div>
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
                  {editingUser ? '수정 완료' : '회원 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isDeleteModalOpen && deletingUser && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="사용자 삭제 확인"
          targetName={deletingUser.name}
          relatedData={getRelatedData(deletingUser)}
          description="사용자 삭제 시 해당 사용자가 작성한 내역의 실명이 대체되거나 이력이 상실될 수 있습니다."
        />
      )}
    </div>
  );
};

export default UserManagement;
