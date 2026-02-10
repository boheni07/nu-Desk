
import React, { useEffect } from 'react';
import { isAfter } from 'date-fns';
import { Ticket, TicketStatus, HistoryEntry } from '../types';
import { isOverdue, addBusinessHours } from '../utils';
import * as storage from '../lib/storage';

export const useBackgroundTasks = (
    tickets: Ticket[],
    setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>,
    setHistory: React.Dispatch<React.SetStateAction<HistoryEntry[]>>
) => {
    useEffect(() => {
        const timer = setInterval(async () => {
            const overdueTickets = tickets.filter(t =>
                t.status !== TicketStatus.COMPLETED &&
                t.status !== TicketStatus.DELAYED &&
                isOverdue(t.dueDate)
            );

            const autoReceiveTickets = tickets.filter(t =>
                t.status === TicketStatus.WAITING &&
                isAfter(new Date(), addBusinessHours(new Date(t.createdAt), 4))
            );

            if (overdueTickets.length > 0 || autoReceiveTickets.length > 0) {
                setTickets(prev => prev.map(t => {
                    if (t.status !== TicketStatus.COMPLETED && t.status !== TicketStatus.DELAYED && isOverdue(t.dueDate)) {
                        return { ...t, status: TicketStatus.DELAYED };
                    }
                    if (t.status === TicketStatus.WAITING && isAfter(new Date(), addBusinessHours(new Date(t.createdAt), 4))) {
                        return { ...t, status: TicketStatus.RECEIVED_AUTO };
                    }
                    return t;
                }));

                for (const t of overdueTickets) {
                    const entry: HistoryEntry = {
                        id: `h-${Date.now()}-${t.id}`,
                        ticketId: t.id,
                        status: TicketStatus.DELAYED,
                        changedBy: 'System',
                        timestamp: new Date().toISOString(),
                        note: '기한 도과로 인해 상태가 지연(DELAYED)으로 자동 변경되었습니다.'
                    };
                    setHistory(prev => [entry, ...prev]);
                    await storage.saveHistoryEntry(entry);
                }
                for (const t of autoReceiveTickets) {
                    const entry: HistoryEntry = {
                        id: `h-${Date.now()}-${t.id}`,
                        ticketId: t.id,
                        status: TicketStatus.RECEIVED_AUTO,
                        changedBy: 'System',
                        timestamp: new Date().toISOString(),
                        note: '접수 대기 4근무시간 경과로 인해 상태가 접수(자동)으로 변경되었습니다.'
                    };
                    setHistory(prev => [entry, ...prev]);
                    await storage.saveHistoryEntry(entry);
                }
            }
        }, 60000);
        return () => clearInterval(timer);
    }, [tickets, setTickets, setHistory]);
};
