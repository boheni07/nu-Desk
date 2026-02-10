
import React, { useCallback } from 'react';
import { Ticket, TicketStatus, User, HistoryEntry, Comment, UserRole } from '../types';
import * as storage from '../lib/storage';

interface HandlersProps {
    currentUser: User;
    users: User[];
    projects: any[];
    tickets: Ticket[];
    setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
    setHistory: React.Dispatch<React.SetStateAction<HistoryEntry[]>>;
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
    changeView: (view: any) => void;
}

import { useToast } from '../contexts/ToastContext';

export const useTicketHandlers = ({
    currentUser,
    users,
    projects,
    tickets,
    setTickets,
    setHistory,
    setComments,
    changeView
}: HandlersProps) => {
    const { showToast } = useToast();

    const handleCreateTicket = useCallback(async (newTicket: Omit<Ticket, 'id' | 'createdAt' | 'status'>) => {
        try {
            const project = projects.find(p => p.id === newTicket.projectId);
            const pmId = project?.supportStaffIds[0];
            const pmUser = users.find(u => u.id === pmId);

            const ticket: Ticket = {
                ...newTicket,
                id: `T-${Math.floor(Math.random() * 9000) + 1000}`,
                createdAt: new Date().toISOString(),
                status: currentUser.role === UserRole.CUSTOMER ? TicketStatus.WAITING : (newTicket.plan ? TicketStatus.IN_PROGRESS : TicketStatus.RECEIVED),
                supportId: pmId,
                supportName: pmUser?.name,
            };

            const historyEntry: HistoryEntry = {
                id: `h-${Date.now()}`,
                ticketId: ticket.id,
                status: ticket.status,
                changedBy: currentUser.name,
                timestamp: new Date().toISOString(),
                note: '티켓이 신규 등록되었습니다.'
            };

            // DB 저장 우선
            await storage.saveTicket(ticket);
            await storage.saveHistoryEntry(historyEntry);

            // 성공 시 UI 업데이트
            setTickets(prev => [ticket, ...prev]);
            setHistory(prev => [historyEntry, ...prev]);
            showToast('티켓이 성공적으로 등록되었습니다.', 'success');
            changeView('list');
        } catch (err) {
            console.error('Ticket creation error:', err);
            showToast('티켓 등록 중 오류가 발생했습니다. DB 연결을 확인해주세요.', 'error');
        }
    }, [projects, users, currentUser, setTickets, setHistory, changeView, showToast]);

    const handleUpdateTicket = useCallback(async (id: string, updatedData: Partial<Ticket>) => {
        try {
            const ticket = tickets.find(t => t.id === id);
            if (!ticket) return;
            const updatedTicket = { ...ticket, ...updatedData };

            const historyEntry: HistoryEntry = {
                id: `h-${Date.now()}`,
                ticketId: id,
                status: updatedTicket.status,
                changedBy: currentUser.name,
                timestamp: new Date().toISOString(),
                note: '티켓 정보가 수정되었습니다.'
            };

            // DB 저장 우선
            await storage.saveTicket(updatedTicket);
            await storage.saveHistoryEntry(historyEntry);

            // 성공 시 UI 업데이트
            setTickets(prev => prev.map(t => t.id === id ? updatedTicket : t));
            setHistory(prev => [historyEntry, ...prev]);
            showToast('티켓 정보가 성공적으로 수정되었습니다.', 'success');
            changeView('list');
        } catch (err) {
            console.error('Ticket update error:', err);
            showToast('티켓 수정 중 오류가 발생했습니다.', 'error');
        }
    }, [tickets, currentUser, setTickets, setHistory, changeView, showToast]);

    const handleDeleteTicket = useCallback(async (id: string) => {
        if (window.confirm('정말 이 티켓을 삭제하시겠습니까?')) {
            try {
                // DB 삭제 우선
                await storage.deleteTicket(id);

                // 성공 시 UI 업데이트
                setTickets(prev => prev.filter(t => t.id !== id));
                setHistory(prev => prev.filter(h => h.ticketId !== id));
                if (setComments) setComments(prev => prev.filter(c => c.ticketId !== id));
                showToast('티켓이 삭제되었습니다.', 'success');
            } catch (err) {
                console.error('Ticket delete error:', err);
                showToast('티켓 삭제 중 오류가 발생했습니다.', 'error');
            }
        }
    }, [setTickets, setHistory, setComments, showToast]);

    const updateTicketStatus = useCallback(async (ticketId: string, newStatus: TicketStatus, updates: Partial<Ticket> = {}, note?: string, action?: string) => {
        try {
            const ticket = tickets.find(t => t.id === ticketId);
            if (!ticket) return;

            const updatedTicket = { ...ticket, ...updates, status: newStatus };
            const historyEntry: HistoryEntry = {
                id: `h-${Date.now()}`,
                ticketId,
                status: newStatus,
                changedBy: currentUser.name,
                timestamp: new Date().toISOString(),
                note: note || `상태가 ${newStatus}(으)로 변경되었습니다.`,
                action
            };

            // DB 저장 우선
            await storage.saveTicket(updatedTicket);
            await storage.saveHistoryEntry(historyEntry);

            // 성공 시 UI 업데이트
            setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
            setHistory(prev => [historyEntry, ...prev]);
            showToast(`티켓 상태가 ${newStatus}(으)로 변경되었습니다.`, 'success');
        } catch (err) {
            console.error('Status update error:', err);
            showToast('상태 변경 적용 중 오류가 발생했습니다.', 'error');
        }
    }, [tickets, currentUser, setTickets, setHistory, showToast]);

    const addComment = useCallback(async (commentData: Omit<Comment, 'id' | 'timestamp'>) => {
        try {
            const comment: Comment = { ...commentData, id: `c-${Date.now()}`, timestamp: new Date().toISOString() };

            // DB 저장 우선
            await storage.saveComment(comment);

            // 성공 시 UI 업데이트
            setComments(prev => [comment, ...prev]);
            showToast('댓글이 등록되었습니다.', 'success');
        } catch (err) {
            console.error('Comment error:', err);
            showToast('댓글 등록 중 오류가 발생했습니다.', 'error');
        }
    }, [setComments, showToast]);

    return {
        handleCreateTicket,
        handleUpdateTicket,
        handleDeleteTicket,
        updateTicketStatus,
        addComment
    };
};
