import React, { useState } from 'react';
import { User, UserStatus } from '../../types';
import { LogIn, ShieldCheck, AlertCircle, Eye, EyeOff, Database } from 'lucide-react';

interface LoginProps {
    users: User[];
    onLogin: (user: User) => void;
    dataSource?: 'supabase' | 'mock';
    isConfigured?: boolean;
    dbError?: string | null;
}

const Login: React.FC<LoginProps> = ({ users, onLogin, dataSource, isConfigured, dbError }) => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        // Simulate a brief delay for realism
        setTimeout(() => {
            const user = users.find(u => u.loginId === loginId && u.password === password);

            if (!user) {
                setError('아이디 또는 비밀번호가 일치하지 않습니다.');
                setIsSubmitting(false);
                return;
            }

            if (user.status === UserStatus.INACTIVE) {
                setError('비활성화된 계정입니다. 관리자에게 문의하세요.');
                setIsSubmitting(false);
                return;
            }

            onLogin(user);
            setIsSubmitting(false);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[100px] animate-pulse delay-700"></div>

            <div className="w-full max-w-[450px] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-white p-8 sm:p-12">

                    <div className="text-center mb-10">
                        <div className="inline-flex p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 mb-6">
                            <ShieldCheck size={32} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">nu-Desk</h1>
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Service Desk System</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Login ID</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                placeholder="아이디를 입력하세요"
                                value={loginId}
                                onChange={(e) => setLoginId(e.target.value.trim())}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="비밀번호를 입력하세요"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-4 rounded-xl animate-in shake duration-300">
                                <AlertCircle size={16} />
                                <span className="text-[11px] font-black">{error}</span>
                            </div>
                        )}

                        {dbError && (
                            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl space-y-2">
                                <div className="flex items-center gap-2 text-rose-700">
                                    <AlertCircle size={16} />
                                    <span className="text-[11px] font-black uppercase tracking-tight">Database Error</span>
                                </div>
                                <p className="text-[10px] text-rose-600 font-bold leading-normal">
                                    데이터베이스 조회 중 오류가 발생했습니다:<br />
                                    <span className="font-mono text-[9px] break-all">{dbError}</span>
                                </p>
                            </div>
                        )}

                        {users.length === 0 && !isSubmitting && !dbError && (
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl space-y-2">
                                <div className="flex items-center gap-2 text-amber-700">
                                    <AlertCircle size={16} />
                                    <span className="text-[11px] font-black uppercase tracking-tight">System Notice</span>
                                </div>
                                <p className="text-[10px] text-amber-600 font-bold leading-normal">
                                    현재 데이터베이스에 등록된 사용자가 없습니다.<br />
                                    초기 계정 생성이 필요합니다.
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting || (users.length === 0 && isConfigured)}
                            className={`w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all active:scale-95 group relative overflow-hidden ${isSubmitting || (users.length === 0 && isConfigured) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                        >
                            <div className="flex items-center justify-center gap-3">
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <LogIn size={18} />
                                        <span>Login</span>
                                    </>
                                )}
                            </div>
                        </button>

                        <div className="pt-4 flex items-center justify-center gap-4 border-t border-slate-100">
                            <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${isConfigured ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                <span className={`text-[9px] font-black uppercase ${isConfigured ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {isConfigured ? 'Live DB' : 'Disconnected'}
                                </span>
                            </div>
                            <div className="w-px h-2 bg-slate-200" />
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Users: {users.length}
                                </span>
                            </div>
                        </div>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            &copy; 2026 nu-technology. all rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
