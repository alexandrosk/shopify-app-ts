import { initTRPC } from '@trpc/server';
import { z } from 'zod';

export const t = initTRPC.create();

export const appRouter = t.router({
    getUser: t.procedure.input(z.string()).query((req) => {
        req.input; // string
        return { id: 'a', name: 'Bilbo' };
    })
});

// export type definition of API
export type AppRouter = typeof appRouter;