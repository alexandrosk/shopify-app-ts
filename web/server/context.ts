import {Shopify} from "@shopify/shopify-api";
import isSessionActive from "../helpers/is-session-active.js";
import * as trpc from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { prisma } from "./prisma.js";

export const createContext = async (
    opts?: trpcExpress.CreateExpressContextOptions,
) => {
    const req = opts?.req;
    const res = opts?.res;

    // @ts-ignore
    const session = await Shopify.Utils.loadCurrentSession(req, res, true);

        if (res && isSessionActive(session)) {
        res.setHeader(
            'Content-Security-Policy',
            `frame-ancestors https://${session?.shop} https://admin.shopify.com;`
        );
    }

    return {
        req,
        res,
        session,
        prisma,
    };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>();
