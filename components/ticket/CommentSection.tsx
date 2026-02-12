
import React, { useRef, useState } from 'react';
import { MessageSquare, Paperclip, X, Send } from 'lucide-react';
import { Comment, User } from '../../types';
import { formatDate } from '../../utils';

interface CommentSectionProps {
    comments: Comment[];
    currentUser: User;
    onAddComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
    ticketId: string;
    readOnly?: boolean;
}

const ALLOWED_EXTENSIONS = ".pdf,.doc,.docx,.xlsx,.xls,.pptx,.ppt,.png,.jpg,.jpeg,.gif,.webp,.hwp,.txt";

const CommentSection: React.FC<CommentSectionProps> = ({ comments, currentUser, onAddComment, ticketId, readOnly }) => {
    const [commentText, setCommentText] = useState('');
    const [commentFiles, setCommentFiles] = useState<File[]>([]);
    const commentFileInputRef = useRef<HTMLInputElement>(null);

    const handleAddComment = () => {
        if (!commentText.trim() && commentFiles.length === 0) return;
        onAddComment({
            ticketId,
            authorId: currentUser.id,
            authorName: currentUser.name,
            content: commentText,
            attachments: commentFiles.map(f => f.name)
        });
        setCommentText('');
        setCommentFiles([]);
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-4 overflow-hidden">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-3">
                <div className="p-1.5 bg-blue-600 rounded-lg text-white shadow-lg"><MessageSquare size={16} /></div>
                의견 나누기
            </h3>

            {!readOnly ? (
                <div className="mb-4">
                    <div className="relative border border-slate-200 rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all bg-slate-50 shadow-inner">
                        <textarea
                            className="w-full px-4 py-3 outline-none text-sm resize-none min-h-[80px] bg-transparent leading-relaxed"
                            placeholder="추가 의견이나 자료를 공유하세요..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        {commentFiles.length > 0 && (
                            <div className="px-5 py-2 flex flex-wrap gap-2">
                                {commentFiles.map((f, i) => (
                                    <span key={i} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 text-[10px] font-bold text-slate-600 rounded-lg">
                                        <span className="truncate max-w-[100px]">{f.name}</span>
                                        <X size={12} className="cursor-pointer text-slate-400 hover:text-red-500" onClick={() => setCommentFiles(prev => prev.filter((_, idx) => idx !== i))} />
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="p-3 bg-white border-t border-slate-100 flex justify-between items-center">
                            <button
                                onClick={() => commentFileInputRef.current?.click()}
                                className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors flex items-center gap-2"
                            >
                                <Paperclip size={20} />
                                <span className="text-[10px] font-black uppercase text-slate-400 hidden sm:inline">Attach</span>
                                <input
                                    type="file"
                                    multiple
                                    accept={ALLOWED_EXTENSIONS}
                                    className="hidden"
                                    ref={commentFileInputRef}
                                    onChange={(e) => e.target.files && setCommentFiles(prev => [...prev, ...Array.from(e.target.files!)])}
                                />
                            </button>
                            <button
                                onClick={handleAddComment}
                                className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-blue-700 shadow-lg active:scale-95 transition-all"
                            >
                                <Send size={16} /> 전송
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <p className="text-sm font-bold text-slate-400">티켓이 완료되어 더 이상 의견을 나눌 수 없습니다.</p>
                </div>
            )}

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {comments.map((c) => {
                    const isMine = c.authorId === currentUser.id;
                    return (
                        <div key={c.id} className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-top-4`}>
                            <div className={`flex items-end gap-3 max-w-[90%] sm:max-w-[80%] ${isMine ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                                <div className="shrink-0 flex flex-col gap-0.5 pb-1">
                                    <span className="text-[10px] font-black text-slate-900">{c.authorName}</span>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase">{formatDate(c.timestamp)}</span>
                                </div>
                                <div className={`px-4 py-2.5 rounded-xl text-sm font-medium leading-relaxed border shadow-sm break-words ${isMine ? 'bg-blue-600 border-blue-500 text-white rounded-br-none' : 'bg-white border-slate-200 text-slate-700 rounded-tl-none'}`}>
                                    {c.content}
                                    {c.attachments && c.attachments.length > 0 && (
                                        <div className={`mt-3 pt-3 border-t ${isMine ? 'border-white/20' : 'border-slate-100'} flex flex-wrap gap-2`}>
                                            {c.attachments.map((f, i) => (
                                                <span key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold ${isMine ? 'bg-white/10 text-white border border-white/20' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                                                    <Paperclip size={10} /> {f}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CommentSection;
