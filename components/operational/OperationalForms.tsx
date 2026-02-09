
import React, { useState } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';
import { HardwareInfo, SoftwareInfo, AccessInfo } from '../../types';

export const HardwareForm = ({ initialData, onSave }: any) => {
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
            <button onClick={() => onSave(data)} className="w-full py-4 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 mt-4 font-black shadow-lg shadow-blue-100 text-sm">
                <Save size={16} /> 저장하기
            </button>
        </div>
    );
};

export const SoftwareForm = ({ initialData, onSave }: any) => {
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
            <button onClick={() => onSave(data)} className="w-full py-4 bg-emerald-600 text-white rounded-xl flex items-center justify-center gap-2 mt-4 font-black shadow-lg shadow-emerald-100 text-sm">
                <Save size={16} /> 저장하기
            </button>
        </div>
    );
};

export const AccessForm = ({ initialData, onSave }: any) => {
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
            <button onClick={() => onSave(data)} className="w-full py-4 bg-amber-600 text-white rounded-xl flex items-center justify-center gap-2 mt-4 font-black shadow-lg shadow-amber-100 text-sm">
                <Save size={16} /> 저장하기
            </button>
        </div>
    );
};
