
import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Server,
  Package,
  FileText,
  ChevronDown,
  Monitor,
  Layers,
  ShieldCheck,
  Save,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { Project, OperationalInfo, HardwareInfo, SoftwareInfo, AccessInfo } from '../types';

interface Props {
  projects: Project[]; // 사용자가 권한을 가진 프로젝트 목록
  opsInfo: OperationalInfo[]; // 전체 운영 정보 데이터
  onUpdate: (info: OperationalInfo) => void; // 데이터 업데이트 콜백
}

/**
 * 운영정보 관리 컴포넌트
 * 하드웨어, 소프트웨어, 접속정보, 기타 참고사항을 프로젝트별로 리스트 형식으로 관리합니다.
 */
const OperationalManagement: React.FC<Props> = ({ projects, opsInfo, onUpdate }) => {
  // 현재 선택된 프로젝트 ID
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');

  // 모달 및 편집 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: 'hardware' | 'software' | 'access', data: any } | null>(null);

  // 현재 선택된 프로젝트의 운영 정보
  const currentOpsInfo = useMemo(() => {
    return opsInfo.find(o => o.projectId === selectedProjectId) || {
      projectId: selectedProjectId,
      hardware: [],
      software: [],
      access: [],
      otherNotes: ''
    };
  }, [opsInfo, selectedProjectId]);

  // 저장 처리
  const handleSave = (updatedData: any) => {
    const newOpsInfo = { ...currentOpsInfo };
    if (editingItem) {
      const type = editingItem.type;
      const list = newOpsInfo[type] as any[];
      const index = list.findIndex(item => item.id === updatedData.id);

      if (index > -1) {
        list[index] = updatedData;
      } else {
        list.push({ ...updatedData, id: `item-${Date.now()}` });
      }
      onUpdate(newOpsInfo);
      setIsModalOpen(false);
      setEditingItem(null);
    }
  };

  // 삭제 처리
  const handleDelete = (type: 'hardware' | 'software' | 'access', id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const newOpsInfo = { ...currentOpsInfo };
      (newOpsInfo[type] as any[]) = (newOpsInfo[type] as any[]).filter(item => item.id !== id);
      onUpdate(newOpsInfo);
    }
  };

  // 비고 업데이트
  const handleUpdateOtherNotes = (notes: string) => {
    onUpdate({ ...currentOpsInfo, otherNotes: notes });
  };

  // 섹션 헤더
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
      {/* 상단 프로젝트 선택 */}
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
        {/* 하드웨어 리스트 */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 overflow-hidden">
          <SectionHeader title="하드웨어 (Hardware)" icon={Server} type="hardware" colorClass="bg-blue-100 text-blue-600" />
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 uppercase text-[10px] font-black text-slate-400 tracking-wider">
                  <th className="px-4 py-3">용도</th>
                  <th className="px-4 py-3">제조사/모델</th>
                  <th className="px-4 py-3">CPU</th>
                  <th className="px-4 py-3">MEM</th>
                  <th className="px-4 py-3">HDD</th>
                  <th className="px-4 py-3">비고</th>
                  <th className="px-4 py-3 text-right">관리</th>
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
                          <button onClick={() => handleDelete('hardware', item.id)} className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-400 hover:text-rose-600 transition-all"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 소프트웨어 리스트 */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 overflow-hidden">
          <SectionHeader title="소프트웨어 (Software)" icon={Package} type="software" colorClass="bg-emerald-100 text-emerald-600" />
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 uppercase text-[10px] font-black text-slate-400 tracking-wider">
                  <th className="px-4 py-3">용도</th>
                  <th className="px-4 py-3">제품 및 버전</th>
                  <th className="px-4 py-3">설치경로</th>
                  <th className="px-4 py-3">기술지원</th>
                  <th className="px-4 py-3">비고</th>
                  <th className="px-4 py-3 text-right">관리</th>
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
                          <button onClick={() => handleDelete('software', item.id)} className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-400 hover:text-rose-600 transition-all"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 접속정보 리스트 */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 overflow-hidden">
          <SectionHeader title="접속정보 (Access Info)" icon={ShieldCheck} type="access" colorClass="bg-amber-100 text-amber-600" />
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 uppercase text-[10px] font-black text-slate-400 tracking-wider">
                  <th className="px-4 py-3">용도</th>
                  <th className="px-4 py-3">접속대상</th>
                  <th className="px-4 py-3">아이디</th>
                  <th className="px-4 py-3">비밀번호</th>
                  <th className="px-4 py-3">비고</th>
                  <th className="px-4 py-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {currentOpsInfo.access.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-slate-400 font-bold">데이터가 없습니다.</td></tr>
                ) : (
                  currentOpsInfo.access.map(item => (
                    <AccessRow key={item.id} item={item} onEdit={() => { setEditingItem({ type: 'access', data: item }); setIsModalOpen(true); }} onDelete={() => handleDelete('access', item.id)} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 기타 참고사항 */}
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

      {/* 모달 */}
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
    </div>
  );
};

/** 접속정보 테이블 행 (비밀번호 보이기 포함) */
const AccessRow: React.FC<{ item: AccessInfo, onEdit: () => void, onDelete: () => void }> = ({ item, onEdit, onDelete }) => {
  const [showPass, setShowPass] = useState(false);
  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-4 py-3 font-bold text-amber-600">{item.usage || '-'}</td>
      <td className="px-4 py-3 font-black text-slate-800">{item.target}</td>
      <td className="px-4 py-3 font-bold text-slate-700">{item.loginId || '-'}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-600 font-bold">{showPass ? (item.password1 || '-') : '••••••••'}</span>
          <button onClick={() => setShowPass(!showPass)} className="text-slate-400 hover:text-blue-600 transition-colors">
            {showPass ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{item.remarks || '-'}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-1">
          <button onClick={onEdit} className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-400 hover:text-blue-600 transition-all"><Edit2 size={14} /></button>
          <button onClick={onDelete} className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-400 hover:text-rose-600 transition-all"><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  );
};

// --- 입력 폼 (모달용) ---

const HardwareForm = ({ initialData, onSave }: any) => {
  const [data, setData] = useState<HardwareInfo>({ id: '', usage: '', cpu: '', memory: '', hdd: '', notes: '', manufacturer: '', model: '', remarks: '', ...initialData });
  return (
    <div className="space-y-4 font-bold">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-[10px] text-slate-400 ml-1 uppercase">용도</label>
          <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" value={data.usage} onChange={e => setData({ ...data, usage: e.target.value })} /></div>
        <div><label className="text-[10px] text-slate-400 ml-1 uppercase">제조사</label>
          <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" value={data.manufacturer} onChange={e => setData({ ...data, manufacturer: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-[10px] text-slate-400 ml-1 uppercase">모델명</label>
          <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" value={data.model} onChange={e => setData({ ...data, model: e.target.value })} /></div>
        <div><label className="text-[10px] text-slate-400 ml-1 uppercase">CPU</label>
          <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" value={data.cpu} onChange={e => setData({ ...data, cpu: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-[10px] text-slate-400 ml-1 uppercase">Memory</label>
          <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" value={data.memory} onChange={e => setData({ ...data, memory: e.target.value })} /></div>
        <div><label className="text-[10px] text-slate-400 ml-1 uppercase">HDD</label>
          <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" value={data.hdd} onChange={e => setData({ ...data, hdd: e.target.value })} /></div>
      </div>
      <div><label className="text-[10px] text-slate-400 ml-1 uppercase">비고</label>
        <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]" value={data.remarks} onChange={e => setData({ ...data, remarks: e.target.value })} /></div>
      <button onClick={() => onSave(data)} className="w-full py-3.5 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 mt-2 font-black shadow-lg shadow-blue-100"><Save size={16} /> 저장하기</button>
    </div>
  );
};

const SoftwareForm = ({ initialData, onSave }: any) => {
  const [data, setData] = useState<SoftwareInfo>({ id: '', usage: '', productVersion: '', installPath: '', notes: '', manufacturer: '', techSupport: '', remarks: '', ...initialData });
  return (
    <div className="space-y-4 font-bold">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-[10px] text-slate-400 ml-1 uppercase">용도</label>
          <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" value={data.usage} onChange={e => setData({ ...data, usage: e.target.value })} /></div>
        <div><label className="text-[10px] text-slate-400 ml-1 uppercase">개발사</label>
          <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" value={data.manufacturer} onChange={e => setData({ ...data, manufacturer: e.target.value })} /></div>
      </div>
      <div><label className="text-[10px] text-slate-400 ml-1 uppercase">제품 및 버전</label>
        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" value={data.productVersion} onChange={e => setData({ ...data, productVersion: e.target.value })} /></div>
      <div><label className="text-[10px] text-slate-400 ml-1 uppercase">설치경로</label>
        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" value={data.installPath} onChange={e => setData({ ...data, installPath: e.target.value })} /></div>
      <div><label className="text-[10px] text-slate-400 ml-1 uppercase">기술지원</label>
        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" value={data.techSupport} onChange={e => setData({ ...data, techSupport: e.target.value })} /></div>
      <button onClick={() => onSave(data)} className="w-full py-3.5 bg-emerald-600 text-white rounded-xl flex items-center justify-center gap-2 mt-2 font-black shadow-lg shadow-emerald-100"><Save size={16} /> 저장하기</button>
    </div>
  );
};

const AccessForm = ({ initialData, onSave }: any) => {
  const [data, setData] = useState<AccessInfo>({ id: '', target: '', loginId: '', password1: '', password2: '', usage: '', notes: '', remarks: '', ...initialData });
  const [showPass1, setShowPass1] = useState(false);
  return (
    <div className="space-y-4 font-bold">
      <div><label className="text-[10px] text-slate-400 ml-1 uppercase">접속 대상</label>
        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" value={data.target} onChange={e => setData({ ...data, target: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-[10px] text-slate-400 ml-1 uppercase">ID</label>
          <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" value={data.loginId} onChange={e => setData({ ...data, loginId: e.target.value })} /></div>
        <div><label className="text-[10px] text-slate-400 ml-1 uppercase">용도</label>
          <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" value={data.usage} onChange={e => setData({ ...data, usage: e.target.value })} /></div>
      </div>
      <div>
        <label className="text-[10px] text-slate-400 ml-1 uppercase">비밀번호</label>
        <div className="relative">
          <input type={showPass1 ? "text" : "password"} placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none" value={data.password1} onChange={e => setData({ ...data, password1: e.target.value })} />
          <button onClick={() => setShowPass1(!showPass1)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
            {showPass1 ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <div><label className="text-[10px] text-slate-400 ml-1 uppercase">비고</label>
        <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]" value={data.remarks} onChange={e => setData({ ...data, remarks: e.target.value })} /></div>
      <button onClick={() => onSave(data)} className="w-full py-3.5 bg-amber-600 text-white rounded-xl flex items-center justify-center gap-2 mt-2 font-black shadow-lg shadow-amber-100"><Save size={16} /> 저장하기</button>
    </div>
  );
};

export default OperationalManagement;
