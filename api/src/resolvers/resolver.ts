import { prisma } from "../datasources/prisma.js";

const toISO = (d) => (d instanceof Date ? d.toISOString() : d ?? null);

export const resolvers = {
    Query: {
        health: () => "OK",
        async tickets(_, args) {
            try {
                const { limit, team_id, user_id, status } = args ?? {};
                const rows = await prisma.ticket.findMany({
                    where: {
                        ...(team_id != null ? { team_id } : {}),
                        ...(user_id != null ? { user_id } : {}),
                        ...(status  != null ? { status  } : {}),
                    },
                    orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
                    take: limit ?? 1050,
                });
                return rows ?? [];
            } catch (err) {
                console.error('tickets resolver failed:', err);
                return [];
            }
        },

        async ticket(_, { id }) {
            return prisma.ticket.findUnique({ where: { id: Number(id) } });
        },

        teams: async () => {
            const rows = await prisma.team.findMany({ orderBy: { id: 'asc' } });
            return rows ?? [];
        },
    },

    Ticket: {
        user: (p, _args, ctx) =>
            ctx?.loaders?.userById
                ? ctx.loaders.userById.load(p.user_id)
                : prisma.user.findUnique({ where: { id: p.user_id } }),

        team: (p, _args, ctx) =>
            ctx?.loaders?.teamById
                ? ctx.loaders.teamById.load(p.team_id)
                : prisma.team.findUnique({ where: { id: p.team_id } }),

        tasks: (p, _args, ctx) =>
            ctx?.loaders?.tasksByTicketId
                ? ctx.loaders.tasksByTicketId.load(p.id)
                : prisma.task.findMany({
                    where: { ticket_id: p.id },
                    orderBy: [{ created_at: 'asc' }, { id: 'asc' }],
                }),

        comments: (p, _args, ctx) =>
            ctx?.loaders?.commentsByTicketId
                ? ctx.loaders.commentsByTicketId.load(p.id)
                : prisma.comment.findMany({
                    where: { ticket_id: p.id },
                    orderBy: [{ created_at: 'asc' }, { id: 'asc' }],
                }),

        created_at: (p) => toISO(p.created_at),
        updated_at: (p) => toISO(p.updated_at),
    },

    Task: {
        created_at: (p) => toISO(p.created_at),
        updated_at: (p) => toISO(p.updated_at),
    },

    Comment: {
        user: (p, _args, ctx) =>
            ctx?.loaders?.userById
                ? ctx.loaders.userById.load(p.user_id)
                : prisma.user.findUnique({ where: { id: p.user_id } }),

        created_at: (p) => toISO(p.created_at),
        updated_at: (p) => toISO(p.updated_at),
    },

    User: {
        team: (p, _args, ctx) =>
            ctx?.loaders?.teamById
                ? ctx.loaders.teamById.load(p.team_id)
                : prisma.team.findUnique({ where: { id: p.team_id } }),

        created_at: (p) => toISO(p.created_at),
        updated_at: (p) => toISO(p.updated_at),
    },

    Team: {
        created_at: (p) => toISO(p.created_at),
        updated_at: (p) => toISO(p.updated_at),
    },

    Mutation: {
        async createTicket(_, { data }) {
            const { team_id, user_id, title, description, status, priority } = data;
            return prisma.ticket.create({
                data: {
                    team_id: Number(team_id),
                    user_id: Number(user_id),
                    title,
                    description,
                    status: Number(status),
                    priority: Number(priority),
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            });
        },

        async updateTask(_, { data }) {
            const { id, ...rest } = data;
            return prisma.task.update({
                where: { id: Number(id) },
                data: { ...rest, updated_at: new Date() },
            });
        },

        async updateTicket(_, { data }) {
            const { id, ...rest } = data;
            return prisma.ticket.update({
                where: { id: Number(id) },
                data: { ...rest, updated_at: new Date() },
            });
        },

        async deleteTicket(_, { id }) {
            const { count } = await prisma.ticket.deleteMany({ where: { id: Number(id) } });
            return count > 0 ? { id: Number(id) } : null;
        },
    },
};