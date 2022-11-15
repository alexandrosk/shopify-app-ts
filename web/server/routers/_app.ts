import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { prisma } from "../prisma.js";

export const t = initTRPC.create();

export const appRouter = t.router({
    getUser: t.procedure.query(() => 'hello tRPC v10!'),
    getShop: t.procedure.query((ctx) => {
        return prisma.shop.count();
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;