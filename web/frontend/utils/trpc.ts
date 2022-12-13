import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../server/routers/_app.js";

export const trpc = createTRPCReact<AppRouter>();
