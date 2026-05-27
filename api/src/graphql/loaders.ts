import DataLoader from 'dataloader';
import { prisma } from '../datasources/prisma.js';

function toMap<T extends { id: number }>(rows: T[]) {
    return new Map(rows.map(r => [r.id, r]));
}

export function createLoaders() {
    return {
        userById: new DataLoader<number, any>(async (ids) => {
            const rows = await prisma.user.findMany({
                where: { id: { in: ids as number[] } },
            });
            const map = toMap(rows);
            return ids.map(id => map.get(id) ?? null);
        }),

        teamById: new DataLoader<number, any>(async (ids) => {
            const rows = await prisma.team.findMany({
                where: { id: { in: ids as number[] } },
            });
            const map = toMap(rows);
            return ids.map(id => map.get(id) ?? null);
        }),

        tasksByTicketId: new DataLoader<number, any[]>(async (ticketIds) => {
            const rows = await prisma.task.findMany({
                where: { ticket_id: { in: ticketIds as number[] } },
                orderBy: [{ created_at: 'asc' }, { id: 'asc' }],
            });
            const grouped = new Map<number, any[]>();
            for (const r of rows) {
                const arr = grouped.get(r.ticket_id) ?? [];
                arr.push(r);
                grouped.set(r.ticket_id, arr);
            }
            return ticketIds.map(id => grouped.get(id) ?? []);
        }),

        commentsByTicketId: new DataLoader(async (ticketIds) => {
            const rows = await prisma.comment.findMany({
                where: { ticket_id: { in: ticketIds as number[] } },
                orderBy: [{ created_at: 'asc' }, { id: 'asc' }],
            });
            const grouped = new Map();
            for (const r of rows) {
                const arr = grouped.get(r.ticket_id) ?? [];
                arr.push(r);
                grouped.set(r.ticket_id, arr);
            }
            return ticketIds.map(id => grouped.get(id) ?? []);
        }),
    };
}