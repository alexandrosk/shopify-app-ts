import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { prisma } from "../prisma.js";
import superjson from 'superjson';
import { Context } from '../context';
export const t = initTRPC.context<Context>().create({transformer: superjson});
export const publicProcedure = t.procedure;
export const middleware = t.middleware;


export const appRouter = t.router({
    getUser: publicProcedure.query(() => 'hello tRPC v10!'),
    getShop: publicProcedure.query(({ctx}) => {
        console.log(ctx.session);
        return ctx.prisma.shop.count();
    }),
    getSession: publicProcedure.query((ctx) => {
        console.log(ctx);
    }),
    appContext: publicProcedure.query((ctx) => {
        return {
            user: ctx
        };
    })
});

// export type definition of API
export type AppRouter = typeof appRouter;