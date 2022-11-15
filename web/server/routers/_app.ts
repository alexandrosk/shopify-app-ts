import { initTRPC } from '@trpc/server';
import { z } from 'zod';

export const t = initTRPC.create();

export const appRouter = t.router({
    getUser: t.procedure.query(() => 'hello tRPC v10!'),
});

// export type definition of API
export type AppRouter = typeof appRouter;