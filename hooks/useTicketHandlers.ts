
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

    const handleCreateTicket = useCallback(async (newTicket: Omit<Ticket, 'id' | 'createdAt' | 'status'>) => {
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

        setTickets(prev => [ticket, ...prev]);
        const historyEntry: HistoryEntry = {
            id: `h-${Date.now()}`,
            ticketId: ticket.id,
            status: ticket.status,
            changedBy: currentUser.name,
            timestamp: new Date().toISOString(),
            note: '티켓이 신규 등록되었습니다.'
        };
        setHistory(prev => [historyEntry, ...prev]);

        await storage.saveTicket(ticket);
        await storage.saveHistoryEntry(historyEntry);

        changeView('list');
    }, [projects, users, currentUser, setTickets, setHistory, changeView]);

    const handleUpdateTicket = useCallback(async (id: string, updatedData: Partial<Ticket>) => {
        const ticket = tickets.find(t => t.id === id);
        if (!ticket) return;
        const updatedTicket = { ...ticket, ...updatedData };

        setTickets(prev => prev.map(t => t.id === id ? updatedTicket : t));
        const historyEntry: HistoryEntry = {
            id: `h-${Date.now()}`,
            ticketId: id,
            status: updatedTicket.status,
            changedBy: currentUser.name,
            timestamp: new Date().toISOString(),
            note: '티켓 정보가 수정되었습니다.'
        };
        setHistory(prev => [historyEntry, ...prev]);

        await storage.saveTicket(updatedTicket);
        await storage.saveHistoryEntry(historyEntry);

        changeView('list');
    }, [tickets, currentUser, setTickets, setHistory, changeView]);

    const handleDeleteTicket = useCallback(async (id: string) => {
        if (window.confirm('정말 이 티켓을 삭제하시겠습니까?')) {
            setTickets(prev => prev.filter(t => t.id !== id));
            setHistory(prev => prev.filter(h => h.ticketId !== id));
            setComments(prev => prev.filter(c => c.ticketId !== id));

            await storage.deleteTicket(id);
        }
    }, [setTickets, setHistory, setComments]);

    const updateTicketStatus = useCallback(async (ticketId: string, newStatus: TicketStatus, updates: Partial<Ticket> = {}, note?: string, action?: string) => {
        const ticket = tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        const updatedTicket = { ...ticket, ...updates, status: newStatus };

        setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
        const historyEntry: HistoryEntry = {
            id: `h-${Date.now()}`,
            ticketId,
            status: newStatus,
            changedBy: currentUser.name,
            timestamp: new Date().toISOString(),
            note: note || `상태가 ${newStatus}(으)로 변경되었습니다.`,
            action
        };
        setHistory(prev => [historyEntry, ...prev]);

        await storage.saveTicket(updatedTicket);
        await storage.saveHistoryEntry(historyEntry);
    }, [tickets, currentUser, setTickets, setHistory]);

    const addComment = useCallback(async (commentData: Omit<Comment, 'id' | 'timestamp'>) => {
        const comment: Comment = { ...commentData, id: `c-${Date.now()}`, timestamp: new Date().toISOString() };
        setComments(prev => [comment, ...prev]);
        await storage.saveComment(comment);
    }, [setComments]);

    return {
        handleCreateTicket,
        handleUpdateTicket,
        handleDeleteTicket,
        updateTicketStatus,
        addComment
    };
};
