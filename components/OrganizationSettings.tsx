
import React, { useState, useEffect } from 'react';
import { OrganizationInfo } from '../types';
import { Building2, Save, Users, Phone, Mail, MapPin, FileText, Briefcase, Globe } from 'lucide-react';

interface Props {
    initialData?: OrganizationInfo;
    onUpdate: (data: OrganizationInfo) => Promise<void>;
}

const OrganizationSettings: React.FC<Props> = ({ initialData, onUpdate }) => {
    const [formData, setFormData] = useState<OrganizationInfo>({
        nameKo: '',
        nameEn: '',
        representative: '',
        bizNumber: '',
        bizType: '',
        bizCategory: '',
        zipCode: '',
        address: '',
        phone: '',
        email: '',
        supportTeam1: '기술지원1팀',
        supportTeam2: '기술지원2팀',
        supportTeam3: '고객지원팀',
        remarks: ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);
        try {
            await onUpdate(formData);
            setMessage({ type: 'success', text: '기관 정보가 성공적으로 저장되었습니다.' });
        } catch (error) {
            setMessage({ type: 'error', text: '저장 중 오류가 발생했습니다.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Header Section */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-200">
                            <Building2 size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">기관정보 설정</h3>
                            <p className="text-slate-500 text-sm font-medium">서비스 데스크를 운영하는 본사의 기본 정보를 관리합니다.</p>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className={`flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 transition-all active:scale-95 ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                    >
                        {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                        저장하기
                    </button>
                </div>

                {message && (
                    <div className={`p-4 rounded-2xl text-sm font-bold animate-in zoom-in-95 duration-200 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                        {message.text}
                    </div>
                )}

                {/* Form Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 기본 정보 */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-8 space-y-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <FileText className="text-blue-600" size={18} />
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">기본 및 사업자 정보</h4>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">기관명 (한글) *</label>
                                <input required type="text" name="nameKo" value={formData.nameKo} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">기관명 (영문)</label>
                                <input type="text" name="nameEn" value={formData.nameEn} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">대표자</label>
                                    <input type="text" name="representative" value={formData.representative} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">사업자등록번호</label>
                                    <input type="text" name="bizNumber" value={formData.bizNumber} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="000-00-00000" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">업태</label>
                                    <input type="text" name="bizType" value={formData.bizType} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">종목</label>
                                    <input type="text" name="bizCategory" value={formData.bizCategory} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 연락처 및 위치 정보 */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-8 space-y-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <MapPin className="text-blue-600" size={18} />
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">연락처 및 위치 정보</h4>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">전화번호</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">이메일</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">우편번호</label>
                                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all w-32" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">주소</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">비고 (홈페이지 등)</label>
                                <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none" />
                            </div>
                        </div>
                    </div>

                    {/* 운영 관리 설정 */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-8 space-y-6 shadow-sm md:col-span-2">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="text-blue-600" size={18} />
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">운영 관리 설정</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">지원 1팀명</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input type="text" name="supportTeam1" value={formData.supportTeam1} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">지원 2팀명</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input type="text" name="supportTeam2" value={formData.supportTeam2} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">지원 3팀명</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input type="text" name="supportTeam3" value={formData.supportTeam3} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default OrganizationSettings;
