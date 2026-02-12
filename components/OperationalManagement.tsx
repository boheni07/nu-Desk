
import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Server,
  Package,
  FileText,
  Layers,
  ShieldCheck,
  X,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { Project, OperationalInfo, AccessInfo } from '../types';
import { HardwareForm, SoftwareForm, AccessForm } from './operational/OperationalForms';
import Modal from './common/Modal';

interface Props {
  projects: Project[];
  opsInfo: OperationalInfo[];
  onUpdate: (info: OperationalInfo) => void;
}

const OperationalManagement: React.FC<Props> = ({ projects, opsInfo, onUpdate }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: 'hardware' | 'software' | 'access', data: any } | null>(null);
  const [deleteInfo, setDeleteInfo] = useState<{ type: 'hardware' | 'software' | 'access', data: any } | null>(null);

  // 프로젝트 데이터가 로드되거나 변경될 때 selectedProjectId 동기화
  React.useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const currentOpsInfo = useMemo(() => {
    const found = opsInfo.find(o => o.projectId === selectedProjectId);
    if (found) return found;

    return {
      projectId: selectedProjectId,
      hardware: [],
      software: [],
      access: [],
      otherNotes: ''
    };
  }, [opsInfo, selectedProjectId]);

  const handleSave = (updatedData: any) => {
    const newOpsInfo = { ...currentOpsInfo };
    if (editingItem) {
      const type = editingItem.type;
      const list = [...(newOpsInfo[type] as any[])];
      const index = list.findIndex(item => item.id === updatedData.id);

      if (index > -1) {
        list[index] = updatedData;
      } else {
        list.push({ ...updatedData, id: `item-${Date.now()}` });
      }

      onUpdate({
        ...newOpsInfo,
        [type]: list
      });
      setIsModalOpen(false);
      setEditingItem(null);
    }
  };

  const handleDelete = (type: 'hardware' | 'software' | 'access', data: any) => {
    setDeleteInfo({ type, data });
  };

  const confirmDelete = () => {
    if (deleteInfo) {
      const { type, data } = deleteInfo;
      const newOpsInfo = { ...currentOpsInfo };
      const updatedList = (newOpsInfo[type] as any[]).filter(item => item.id !== data.id);
      onUpdate({
        ...newOpsInfo,
        [type]: updatedList
      });
      setDeleteInfo(null);
    }
  };

  const handleUpdateOtherNotes = (notes: string) => {
    onUpdate({ ...currentOpsInfo, otherNotes: notes });
  };

  const SectionHeader = ({ title, icon: Icon, type, colorClass }: any) => (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon size={18} />
        </div>
        <h4 className="text-lg font-black text-slate-900">{title}</h4>
      </div>
      {type !== 'other' && (
        <button
          onClick={() => {
            setEditingItem({ type, data: {} });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-black hover:bg-blue-600 transition-all shadow-sm active:scale-95"
        >
          <Plus size={14} /> 추가하기
        </button>
      )}
    </div>
  );

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-white rounded-3xl border border-slate-200">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
          <Layers size={32} />
        </div>
        <h3 className="text-lg font-black text-slate-900">접근 가능한 프로젝트가 없습니다</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="sticky top-[88px] z-20 bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
            <Layers size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">운영정보 관리</h3>
            <p className="text-[11px] text-slate-500 font-bold">모든 정보를 리스트 형식으로 한눈에 파악하세요.</p>
          </div>
        </div>

        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="min-w-[250px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm"
        >
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 overflow-hidden">
          <SectionHeader title="하드웨어 (Hardware)" icon={Server} type="hardware" colorClass="bg-blue-100 text-blue-600" />
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-slate-100 uppercase text-[10px] font-black text-slate-400 tracking-wider">
                  <th className="px-4 py-3 w-[15%]">용도</th>
                  <th className="px-4 py-3 w-[25%]">제조사/모델</th>
                  <th className="px-4 py-3 w-[12%]">CPU</th>
                  <th className="px-4 py-3 w-[10%]">MEM</th>
                  <th className="px-4 py-3 w-[10%]">HDD</th>
                  <th className="px-4 py-3 w-[20%]">비고</th>
                  <th className="px-4 py-3 w-[8%] text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {currentOpsInfo.hardware.length === 0 ? (
                  <tr><td colSpan={7} className="py-10 text-center text-slate-400 font-bold">데이터가 없습니다.</td></tr>
                ) : (
                  currentOpsInfo.hardware.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-blue-600">{item.usage || '-'}</td>
                      <td className="px-4 py-3 font-black text-slate-800">{item.manufacturer} {item.model}</td>
                      <td className="px-4 py-3 font-bold text-slate-600">{item.cpu || '-'}</td>
                      <td className="px-4 py-3 font-bold text-slate-600">{item.memory || '-'}</td>
                      <td className="px-4 py-3 font-bold text-slate-600">{item.hdd || '-'}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{item.remarks || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => { setEditingItem({ type: 'hardware', data: item }); setIsModalOpen(true); }} className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-400 hover:text-blue-600 transition-all"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete('hardware', item)} className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-400 hover:text-rose-600 transition-all"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 overflow-hidden">
          <SectionHeader title="소프트웨어 (Software)" icon={Package} type="software" colorClass="bg-emerald-100 text-emerald-600" />
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-slate-100 uppercase text-[10px] font-black text-slate-400 tracking-wider">
                  <th className="px-4 py-3 w-[15%]">용도</th>
                  <th className="px-4 py-3 w-[25%]">제품 및 버전</th>
                  <th className="px-4 py-3 w-[15%]">설치경로</th>
                  <th className="px-4 py-3 w-[15%] text-center">기술지원</th>
                  <th className="px-4 py-3 w-[20%]">비고</th>
                  <th className="px-4 py-3 w-[10%] text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {currentOpsInfo.software.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-slate-400 font-bold">데이터가 없습니다.</td></tr>
                ) : (
                  currentOpsInfo.software.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-emerald-600">{item.usage || '-'}</td>
                      <td className="px-4 py-3 font-black text-slate-800">{item.productVersion}</td>
                      <td className="px-4 py-3 font-medium text-slate-500 max-w-[150px] truncate">{item.installPath || '-'}</td>
                      <td className="px-4 py-3 font-bold text-slate-600">{item.techSupport || '-'}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{item.remarks || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => { setEditingItem({ type: 'software', data: item }); setIsModalOpen(true); }} className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-400 hover:text-blue-600 transition-all"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete('software', item)} className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-400 hover:text-rose-600 transition-all"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 overflow-hidden">
          <SectionHeader title="접속정보 (Access Info)" icon={ShieldCheck} type="access" colorClass="bg-amber-100 text-amber-600" />
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-slate-100 uppercase text-[10px] font-black text-slate-400 tracking-wider">
                  <th className="px-4 py-3 w-[12%]">용도</th>
                  <th className="px-4 py-3 w-[18%]">접속대상</th>
                  <th className="px-4 py-3 w-[12%]">아이디</th>
                  <th className="px-4 py-3 w-[12%]">비밀번호</th>
                  <th className="px-4 py-3 w-[18%]">접속경로</th>
                  <th className="px-4 py-3 w-[20%]">비고</th>
                  <th className="px-4 py-3 w-[8%] text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {currentOpsInfo.access.length === 0 ? (
                  <tr><td colSpan={7} className="py-10 text-center text-slate-400 font-bold">데이터가 없습니다.</td></tr>
                ) : (
                  currentOpsInfo.access.map(item => (
                    <AccessRow key={item.id} item={item} onEdit={() => { setEditingItem({ type: 'access', data: item }); setIsModalOpen(true); }} onDelete={() => handleDelete('access', item)} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <SectionHeader title="기타 참고사항 (Other Notes)" icon={FileText} type="other" colorClass="bg-rose-100 text-rose-600" />
          <textarea
            value={currentOpsInfo.otherNotes}
            onChange={(e) => handleUpdateOtherNotes(e.target.value)}
            placeholder="프로젝트 운영과 관련된 기타 모든 참고사항을 기재하세요..."
            className="w-full min-h-[200px] p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner leading-relaxed"
          />
        </section>
      </div>

      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-800">
                {editingItem.data.id ? '정보 수정' : '새 정보 추가'}
              </h3>
              <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="p-2 hover:bg-white rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {editingItem.type === 'hardware' && <HardwareForm initialData={editingItem.data} onSave={handleSave} />}
              {editingItem.type === 'software' && <SoftwareForm initialData={editingItem.data} onSave={handleSave} />}
              {editingItem.type === 'access' && <AccessForm initialData={editingItem.data} onSave={handleSave} />}
            </div>
          </div>
        </div>
      )}

      {deleteInfo && (
        <Modal
          title="정보 삭제"
          onClose={() => setDeleteInfo(null)}
          onConfirm={confirmDelete}
          confirmText="삭제하기"
          confirmColor="bg-rose-600"
        >
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">삭제 대상 {deleteInfo.type === 'hardware' ? '하드웨어' : deleteInfo.type === 'software' ? '소프트웨어' : '접속'} 정보</p>
              <h4 className="text-lg font-black text-slate-900 mb-1">
                {deleteInfo.type === 'hardware' && `${deleteInfo.data.manufacturer} ${deleteInfo.data.model}`}
                {deleteInfo.type === 'software' && deleteInfo.data.productVersion}
                {deleteInfo.type === 'access' && deleteInfo.data.targetName}
              </h4>
              <p className="text-xs font-bold text-slate-500">
                용도: {deleteInfo.data.usage || '-'}
              </p>
            </div>
            <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 flex gap-4 items-start">
              <AlertTriangle className="text-rose-500 shrink-0" size={24} />
              <div>
                <p className="text-sm font-black text-rose-800 uppercase tracking-widest mb-1">주의 사항</p>
                <p className="text-xs text-rose-600 font-medium leading-relaxed">
                  선택한 정보를 정말 삭제하시겠습니까? <br />
                  삭제 시 데이터가 영구적으로 제거되며 복구할 수 없습니다.
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 font-medium text-center">정말로 삭제하시려면 아래 '삭제하기' 버튼을 눌러주세요.</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

const AccessRow: React.FC<{ item: AccessInfo, onEdit: () => void, onDelete: () => void }> = ({ item, onEdit, onDelete }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-4 py-3 font-bold text-amber-600 truncate">{item.usage || '-'}</td>
      <td className="px-4 py-3 font-black text-slate-800 truncate">{item.targetName}</td>
      <td className="px-4 py-3 font-bold text-slate-600 truncate">{item.loginId || '-'}</td>
      <td className="px-4 py-3 font-bold text-slate-600">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="truncate">{showPassword ? item.password : '••••••••'}</span>
          <button onClick={() => setShowPassword(!showPassword)} className="shrink-0 p-1 hover:bg-white rounded transition-colors text-slate-400">
            {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-500 truncate">{item.accessUrl || '-'}</td>
      <td className="px-4 py-3 text-slate-500 truncate">{item.remarks || '-'}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-1">
          <button onClick={onEdit} className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-400 hover:text-blue-600 transition-all"><Edit2 size={14} /></button>
          <button onClick={onDelete} className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-400 hover:text-rose-600 transition-all"><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  );
};

export default OperationalManagement;
